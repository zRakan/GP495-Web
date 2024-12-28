import { model, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const schema = new Schema({
    id: {
        type: String,
        default: () => uuidv4(),
        index: true
    },

    author: {
        type: String,
        required: true,
        index: true
    },

    title: {
        type: String,
        default: 'New chat'
    },

    history: {
        type: Array,
        default: []
    }
});

export const Chat = model('Chats', schema);