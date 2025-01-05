import { Chat } from "../models/Chats.model.js"; 

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: "Failed" }
}

export default defineEventHandler(async function(event) {
    const { secure } = await requireUserSession(event);
    
    try {
        const body = await readBody(event);
        if(!body.message) return badInputs(event);

        // Check/Create a chat
        let chat;
        if(!body.id) {
            chat = new Chat({ author: secure.authorId })
        } else {
            chat = await Chat.findOne({ id: body.id });
            if(!chat) { // Invalid chat
                chat = new Chat({ author: secure.authorId })
            }
        }

        // Send a chat to Model API
        const resp = await $fetch('http://localhost:8000/sendMessage', {
            method: "POST",

            body: {
                history: chat.history,
                message: body.message
            }
        });

        /*
            {
                'sql': sqlQuery,
                'markdown': sqlMarkdown,
                'plotly': sqlPlotly
            }
        */

        chat.history = resp.conversation;

        // Save chat state
        await chat.save();
        
        // Get new resposnes
        let messages = (resp.conversation.findLastIndex((message) => message.role == 'user'));
            messages = resp.conversation.slice(messages);

        const returnedData = { messages }
        if(!body.id) returnedData.chat = chat

        return { returnedData };
    } catch(err) {
        return {}
    }
});