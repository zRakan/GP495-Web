import { z } from "zod";
const bodyValidation = z.object({
    id: z.string().uuid(),
    query: z.string().nonempty(),
    answer: z.string().nonempty()
});

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);
        if(secure.role != 'admin') return badInputs(event);

        const body = await readValidatedBody(event, bodyValidation.safeParse);
        if(!body.success) return badInputs(event);

        const { id, query, answer } = body.data;

        const resp = await $fetch('http://localhost:8000/editData', {
            method: "POST",

            body: { id, query, answer }
        });

        return { status: resp.status == "completed" };
    } catch(err) {
        if(err.message == 'Unauthorized') {
            setResponseStatus(event, 401);
        }

        return { status: false }
    }
});
