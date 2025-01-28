import { User } from "../models/User.model"; 
import { z } from "zod";

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

const bodyValidation = z.object({
    username: z.string().nonempty(),
    password: z.string().min(8)
});

export default defineEventHandler(async function(event) {
    const body = await readValidatedBody(event, bodyValidation.safeParse);
    if(!body.success) return badInputs(event);

    const { username, password } = body.data;

    try {
        const user = await User.findUser({ username });
        if(user === false) return { status: false, message: "Invalid Username/Password" }

        const isPasswordMatch = await verifyPassword(user.password, password);
        if(!isPasswordMatch) return { status: false, message: "Invalid Username/Password" }

        // Valid Username & Password
        await setUserSession(event, {
            user: {
                name: username,
                role: user.role
            },

            secure: {
                authorId: user.id,
                role: user.role
            }
        });

        return { status: true }
    } catch {
        return badInputs(event);
    }
});