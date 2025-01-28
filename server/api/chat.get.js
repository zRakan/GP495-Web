import { Chat } from "../models/Chats.model.js"; 
import { z } from "zod";

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

const queryValidation = z.object({
    id: z.string().uuid()
})

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);

        const query = await getValidatedQuery(event, queryValidation.safeParse);
        if(!query.success) return badInputs(event);

        const { id } = query.data;

        const chat = await Chat.findOne({ author: secure.authorId, id }, '-_id -title -id -__v -author');
        if(!chat) return badInputs(event);

        chat.history = chat.history.slice(1); // Hide system prompt
        return chat;
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false }
    }
});
