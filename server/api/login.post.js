import { User } from "../models/User.model"; 

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

export default defineEventHandler(async function(event) {
    const body = await readBody(event);

    if(!body || !body.username || !body.password) return badInputs(event); 

    try {
        const user = await User.findOne({ username: body.username });
        if(!user) return { status: false, message: "Invalid Username/Password" }

        const isPasswordMatch = await user.passwordMatch(body.password);
        if(!isPasswordMatch) return { status: false, message: "Invalid Username/Password" }

        // Valid Username & Password
        await setUserSession(event, {
            user: {
                name: user.username
},

            secure: {
                authorId: user.id
            }
        });

        return { status: true }
    } catch(err) {
        return badInputs(event);
    }
});