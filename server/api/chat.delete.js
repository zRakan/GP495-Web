import { Chat } from "../models/Chats.model.js"; 

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: "Failed" }
}

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);
        const { id } = getQuery(event);

        const filter = { author: secure.authorId }
        if(id != -1) // Delete specific chat
            filter.id = id;

        let chat;
        if(id == -1) { // All chats
            chat = await Chat.deleteMany(filter);
        } else {
            chat = await Chat.deleteOne(filter);
        }
        
        if(!chat || chat.deletedCount == 0) badInputs(event);

        return true;
    } catch(err) {
        console.log(err);
        return false;
    }
});