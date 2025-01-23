import { User } from "../models/User.model.js";

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);
        if(secure.role != 'admin') return badInputs(event);

        const body = await readBody(event);
        if(body.password.length < 8) return badInputs(event);

        // Check if username is already used
        const userFound = await User.findOne({ username: body.username });
        if(userFound) return { status: false, message: 'Username already is used' }

        const newUser = new User({
            username: body.username,
            password: body.password,

            role: body.role
        });

        await newUser.save();
        
        return { id: newUser.id };
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false }
    }
});
