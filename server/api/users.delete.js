import { User } from "../models/User.model.js";
import { z } from "zod";

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

const bodyValidation = z.object({
    id: z.string().uuid()
});

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);
        if(secure.role != 'admin') return badInputs(event);

        const body = await readValidatedBody(event, bodyValidation.safeParse);
        if(!body.success) return badInputs(event);

        const { id } = body.data;

        // Check if username is already used
        const deletedUser = await User.deleteOne({ id });
        if(deletedUser.deletedCount == 0) return { status: false }

        return { status: true };
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false }
    }
});
