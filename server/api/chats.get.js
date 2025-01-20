import { Chat } from "../models/Chats.model.js"; 

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);

        const chats = await Chat.find({ author: secure.authorId }, '-_id -history -__v -author');
        return chats;
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false }
    }
});
