export default defineEventHandler(async function(event) {
    try {
        await requireUserSession(event);

        const body = await readBody(event);

        const resp = await $fetch('http://localhost:8000/editData', {
            method: "POST",

            body: {
                id: body.id,
                query: body.query,
                answer: body.answer
            }
        });

        return { status: resp.status == "completed" };
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false }
    }
});
