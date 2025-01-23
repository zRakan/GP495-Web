import { Chat } from "../models/Chats.model.js";

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

import { z } from "zod";
const bodyValidation = z.object({
    id: z.string().uuid(),
    title: z.string().nonempty()
});

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);

        const body = await readValidatedBody(event, bodyValidation.safeParse);
        if(!body.success) return badInputs(event);

        const { id, title } = body.data;

        const chat = await Chat.updateOne({ id, author: secure.authorId }, { title });
        
        return { status: true }
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false };
    }
});