export default defineEventHandler(async function(event) {
    try {
        await requireUserSession(event);

        const resp = await $fetch('http://localhost:8000/suggestions');
        return resp.questions;
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false };
    }
});