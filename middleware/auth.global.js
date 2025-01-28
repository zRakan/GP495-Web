export default defineNuxtRouteMiddleware(async function(to) {
    if(!to.name) return navigateTo('/');

    const { loggedIn, fetch } = useUserSession();
    await fetch();

    const isLogged = loggedIn.value;
    
    if(!isLogged && to.path != '/login') return navigateTo('/login');
    else if(isLogged && to.path == '/login') return navigateTo('/');
});