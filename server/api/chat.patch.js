import { Chat } from "../models/Chats.model.js";

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: "Failed" }
}

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);
        const body = await readBody(event);

        if(!body.id || !body.title) return badInputs(event);

        const chat = await Chat.updateOne({ id: body.id, author: secure.authorId }, { title: body.title });
        console.log(chat)
        
        return true
    } catch(err) {
        return false;
    }
});