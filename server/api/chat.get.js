import { Chat } from "../models/Chats.model.js"; 

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);
        const query = getQuery(event);

        const chat = await Chat.findOne({ author: secure.authorId, id: query.id }, '-_id -title -id -__v -author');
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
