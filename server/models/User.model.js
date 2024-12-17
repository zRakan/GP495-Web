import { model, Schema } from 'mongoose';

const schema = new Schema({
    username: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },

    role: {
        type: String,
        default: "user" // ['user', 'admin']
    }
});


/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
schema.methods.passwordMatch = async function(password) {
    const user = this;

    return await verifyPassword(user.password, password);
};

schema.methods.isAdmin = function() {
    const user = this;
    return user.role == 'admin';
}

schema.pre('save', async function() {
    const user = this;

    if(user.isModified('password'))
        user.password = await hashPassword(user.password);
});

export const User = model('User', schema);