import { User } from "../models/User.model.js";

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);
        if(secure.role != 'admin') return badInputs(event);
        
        let users = await User.find({ id: { $ne: secure.authorId } });
        users = users.map((user) => { return { id: user.id, username: user.username }});

        return { users }
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false }
    }
});
