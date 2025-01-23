import { Chat } from "../models/Chats.model.js"; 

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

function validJSON(data) {
    try {
        JSON.parse(data);
        return true;
    } catch(err) {
        return false;
    }
}

import { z } from "zod";
const bodyValidation = z.object({
    id: z.string().uuid().nullable(),
    message: z.string().nonempty()
});

export default defineEventHandler(async function(event) {    
    try {
        const { secure } = await requireUserSession(event);

        const body = await readValidatedBody(event, bodyValidation.safeParse);
        if(!body.success) return badInputs(event);

        const { id, message } = body.data;

        // Check/Create a chat
        let chat;
        if(!id) {
            chat = new Chat({ author: secure.authorId })
        } else {
            chat = await Chat.findOne({ id });
            if(!chat) { // Invalid chat
                chat = new Chat({ author: secure.authorId })
            }
        }

        // Send a chat to Model API
        const resp = await $fetch('http://localhost:8000/sendMessage', {
            method: "POST",

            body: {
                history: chat.history,

                message
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
        if(!id) returnedData.chat = { id: chat.id, title: chat.title };

        return { ...returnedData };
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }
        
        return { status: false }
    }
});