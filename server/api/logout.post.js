export default defineEventHandler(async function(event) {
    const cleared = await clearUserSession(event);
    
    return { status: cleared }
});