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

        // Check if username is already used
        const deletedUser = await User.deleteOne({ id: body.id });
        if(deletedUser.deletedCount == 0) return { status: false }

        return { status: true };
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false }
    }
});
