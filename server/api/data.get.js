function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);
        if(secure.role != 'admin') return badInputs(event);

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
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false }
    }
});
