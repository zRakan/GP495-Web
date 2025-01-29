import { z } from "zod";
const bodyValidation = z.object({
    question: z.string().nonempty(),
    answer: z.string().nonempty()
});

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

function stringToUUID(str) {
    return 'xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function(c, p) {
        return str[p % str.length];
    });
}

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);
        if(secure.role != 'admin') return badInputs(event);

        const body = await readValidatedBody(event, bodyValidation.safeParse);
        if(!body.success) return badInputs(event);

        const { question, answer } = body.data;

        const resp = await $fetch('http://localhost:8000/addData', {
            method: "POST",

            body: { question, answer }
        });

        return { id: stringToUUID(resp.id[0]) };
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false }
    }
});
