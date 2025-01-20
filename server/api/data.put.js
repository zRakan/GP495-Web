export default defineEventHandler(async function(event) {
    try {
        await requireUserSession(event);

        const body = await readBody(event);

        const resp = await $fetch('http://localhost:8000/addData', {
            method: "POST",

            body: {
                question: body.question,
                answer: body.answer
            }
        });

        return { id: resp.id[0] };
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false }
    }
});
