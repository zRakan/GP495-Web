import { z } from "zod";
const queryValidation = z.object({
    id: z.string().uuid()
});

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

export default defineEventHandler(async function(event) {
    try {
        const { secure } = await requireUserSession(event);
        if(secure.role != 'admin') return badInputs(event);

        const query = await getValidatedQuery(event, queryValidation.safeParse);
        if(!query.success) return badInputs(event);

        const { id } = query.data;

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
