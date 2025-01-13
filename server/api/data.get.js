export default defineEventHandler(async function(event) {
    const { secure } = await requireUserSession(event);

    const resp = await $fetch('http://localhost:8000/dataList');

    const returnedData = [];
    for(let data of resp.data) {
        returnedData.push({
            id: data.id,

            query: data.payload.document,
            answer: data.payload.query
        });
    }

    return returnedData;
});
