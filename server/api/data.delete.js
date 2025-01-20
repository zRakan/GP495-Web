export default defineEventHandler(async function(event) {
    try {
        await requireUserSession(event);

        const { id } = getQuery(event);

        const resp = await $fetch('http://localhost:8000/removeData', {
            method: "POST",

            body: { id }
        });

        return { status: !!resp };
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }
        
        return { status: false }
    }
});
