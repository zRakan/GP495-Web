import { User } from "../models/User.model"; 

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

import { z } from "zod";
const bodyValidation = z.object({
    username: z.string().nonempty(),
    password: z.string().min(8)
});

export default defineEventHandler(async function(event) {
    const body = await readValidatedBody(event, bodyValidation.safeParse);
    if(!body.success) return badInputs(event);

    const { username, password } = body.data;

    try {
        const user = await User.findOne({ username });
        if(!user) return { status: false, message: "Invalid Username/Password" }

        const isPasswordMatch = await user.passwordMatch(password);
        if(!isPasswordMatch) return { status: false, message: "Invalid Username/Password" }

        // Valid Username & Password
        await setUserSession(event, {
            user: {
                name: username
            },

            secure: {
                authorId: user.id,
                role: user.role
            }
        });

        return { status: true }
    } catch(err) {
        return badInputs(event);
    }
});