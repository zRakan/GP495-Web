export default defineEventHandler(async function(event) {
    const { secure } = await requireUserSession(event);

    try {
        const resp = await $fetch('http://localhost:8000/suggestions');
        return resp.questions;
    } catch(err) {
        return [];
    }
});