import { Chat } from "../models/Chats.model.js"; 
import { z } from 'zod';

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

const queryValidation = z.object({
    id: z.union([z.string().uuid(), z.literal("-1")])
})

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);
        
        const query = await getValidatedQuery(event, queryValidation.safeParse);
        if(!query.success) return badInputs(event);

        const { id } = query.data;

        const filter = { author: secure.authorId }
        if(id != -1) // Delete specific chat
            filter.id = id;

        let chat;
        if(id == -1) { // All chats
            chat = await Chat.deleteMany(filter);
        } else {
            chat = await Chat.deleteOne(filter);
        }
        
        if(!chat || chat.deletedCount == 0) return badInputs(event);

        return { status: true };
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false };
    }
});