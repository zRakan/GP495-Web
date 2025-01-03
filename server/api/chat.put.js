import { Chat } from "../models/Chats.model.js";

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);

        const chat = new Chat({ author: secure.authorId });
        await chat.save();

        return {
            id: chat.id,
            title: chat.title
        }
    } catch(err) {
        return false;
    }
});