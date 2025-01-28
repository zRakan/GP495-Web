import { User } from "../models/User.model"; 
import { z } from "zod";

function badInputs(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

function rateLimit(event) {
    setResponseStatus(event, 429);
    return { status: false, message: "Too Many Requests" }
}

const bodyValidation = z.object({
    username: z.string().nonempty(),
    password: z.string().min(8)
});

export default defineEventHandler(async function(event) {
    // Rate limiting (5 times)
    const IP = getRequestIP(event, { xForwardedFor: true });
    const redis = useRedis();
    
    const IP_KEY = `Mostaelim:ratelimit:${IP}`;
    const times = await redis.get(IP_KEY);
    if(times) {
        if(times == 0) return rateLimit(event);

        await redis.decr(IP_KEY);
    } else await redis.set(IP_KEY, 4, { EX: 300 });

    const body = await readValidatedBody(event, bodyValidation.safeParse);
    if(!body.success) return badInputs(event);

    const { username, password } = body.data;

    try {
        const user = await User.findUser({ username });
        if(user === false) return { status: false, message: "Invalid Username/Password" }

        const isPasswordMatch = await verifyPassword(user.password, password);
        if(!isPasswordMatch) return { status: false, message: "Invalid Username/Password" }

        // Valid Username & Password
        await setUserSession(event, {
            user: {
                name: username,
                role: user.role
            },

            secure: {
                authorId: user.id,
                role: user.role
            }
        });

        return { status: true }
    } catch {
        return badInputs(event);
    }
});