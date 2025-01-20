import { Chat } from "../models/Chats.model.js";

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);
        const body = await readBody(event);

        if(!body.id || !body.title) return badInputs(event);

        const chat = await Chat.updateOne({ id: body.id, author: secure.authorId }, { title: body.title });
        console.log(chat)
        
        return { status: true }
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false };
    }
});