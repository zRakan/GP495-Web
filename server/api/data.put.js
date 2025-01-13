export default defineEventHandler(async function(event) {
    const { secure } = await requireUserSession(event);

    const body = await readBody(event);

    const resp = await $fetch('http://localhost:8000/addData', {
        method: "POST",

        body: {
            question: body.question,
            answer: body.answer
        }
    });

    return { id: resp.id[0] };
});
