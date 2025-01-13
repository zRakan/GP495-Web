export default defineEventHandler(async function(event) {
    const { secure } = await requireUserSession(event);
    const { id } = getQuery(event);


    const resp = await $fetch('http://localhost:8000/removeData', {
        method: "POST",

        body: { id }
    });

    return { status: !!resp };
});
