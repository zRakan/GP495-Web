import { Chat } from "../models/Chats.model.js"; 

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: "Failed" }
}

function validJSON(data) {
    try {
        JSON.parse(data);
        return true;
    } catch(err) {
        return false;
    }
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

        // Get new response & validate it
        const messagesIndex = (resp.conversation.findLastIndex((message) => message.role == 'user'));
        const messages = resp.conversation.slice(messagesIndex);
        
        // Validate plotly json
        for(let message = messagesIndex; message < resp.conversation.length; message++) {
            if(resp.conversation[message].type == "Plotly" && !validJSON(resp.conversation[message].content)) {
                
                // fallback JSON
                resp.conversation[message].content = JSON.stringify({
                    data: {},
                    layout: {}
                });
            }
        }
        
        chat.history = resp.conversation;


        // Save chat state
        await chat.save();
        
        const returnedData = { messages }
        if(!body.id) returnedData.chat = { id: chat.id, title: chat.title };

        return { ...returnedData };
    } catch(err) {
        return {}
    }
});