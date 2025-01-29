import { model, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from "node:crypto";

const schema = new Schema({
    id: {
        type: String,
        default: () => uuidv4(),
        index: true
    },

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

/*
    Static functions
*/

// Find user and cache it
schema.statics.findUser = async function({ username, cache = true }) {
    const redis = useRedis();
    const FIND_USER = `Mostaelim:Users:find:${username}`;

    let user = JSON.parse(await redis.get(FIND_USER));
    if(user == null) {
        user = await User.findOne({ username });

        if(user || cache) // Don't cache until user is found or cache is forced
            await redis.set(FIND_USER, JSON.stringify((user && user.toJSON()) || false), { EX: 300 });

        if(!user) return false;
    }

    return user;
}

// Delete user
schema.statics.deleteUser = async function({ id }) {
    const user = await User.findOneAndDelete({ id });

    // Remove from cache
    if(user) {
        await useRedis().del(`Mostaelim:Users:find:${user.username}`)
    }
    
    return user;
}

schema.pre('save', async function() {
    const user = this;

    if(user.isModified('password'))
        user.password = await hashPassword(user.password);

    // Cache it
    await useRedis().set(`Mostaelim:Users:find:${user.username}`, JSON.stringify(this.toJSON()), { EX: 300 });
});

export const User = model('User', schema);

// Generate an admin account for first initialize
(async() => {
    if(!(await User.findOne({}))) {
        console.log("Initialize user accounts");

        const PASSWORD = crypto.randomBytes(20).toString('hex');
        const adminUser = new User({
            username: 'admin',
            
            password: PASSWORD,

            role: 'admin'
        });

        await adminUser.save();
        
        console.log(`Initialized Admin account:
Username: admin
Password: ${PASSWORD}
* COPY THE CREDENTIALS, IT WILL NOT DISPLAY AGAIN.`)
    }
})();