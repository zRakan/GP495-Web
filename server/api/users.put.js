import { User } from "../models/User.model.js";

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

import { z } from "zod";
const bodyValidation = z.object({
    username: z.string().nonempty(),
    password: z.string().min(8),
    role: z.enum(['user', 'admin'])
});

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);
        if(secure.role != 'admin') return badInputs(event);

        const body = await readValidatedBody(event, bodyValidation.safeParse);
        if(!body.success) return badInputs(event);

        const { username, password, role } = body.data;
        
        // Check if username is already used
        const userFound = await User.findOne({ username });
        if(userFound) {
            setResponseStatus(event, 400);
            return { status: false, message: 'Username already is used' }
        }

        const newUser = new User({ username, password, role });

        await newUser.save();
        
        return { id: newUser.id };
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false }
    }
});
