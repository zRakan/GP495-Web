import { Chat } from "../models/Chats.model.js.js"; 

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: "Failed" }
}

export default defineEventHandler(async function(event) {
    const { secure } = await requireUserSession(event);
    const query = getQuery(event);

    const chat = await Chat.findOne({ author: secure.authorId, id: query.id }, '-_id -title -id -__v -author');
    if(!chat) badInputs(event);

    chat.history = chat.history.slice(1); // Hide system prompt
    return chat;
});
