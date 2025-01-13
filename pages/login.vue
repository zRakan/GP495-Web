<script setup>
    useHead({
        title: "Mostaelim Login"
    });


    const state = ref({
        username: undefined,
        password: undefined
    });

    const notification = useToast();
    async function onLogin(event) {
        const data = event.data;

        if(!data.username) return notification.add({ title: 'Username is required' });
        
        if(!data.password) return notification.add({ title: "Password is required" });
        if(data.password.length < 8) return notification.add({ title: "Password should be 8 and more" });

        const resp = await $fetch('/api/login', {
            method: "POST",

            body: { username: data.username, password: data.password }
        });

        if(!resp.status) return notification.add({ title: resp.message });
        
        await navigateTo('/');
    }
</script>

<template>
    <div class="h-screen flex flex-col gap-5 justify-center items-center">
        <h1 class="text-[32px] text-center">Login</h1>

        <UForm :state="state" @submit.prevent="onLogin">
            <UFormGroup label="Username" name="username">
                <UInput v-model="state.username" />
            </UFormGroup>

            <UFormGroup label="Password" name="password">
                <UInput v-model="state.password" type="password" />
            </UFormGroup>

            <UButton type="submit">Submit</UButton>
        </UForm>
    </div>
</template>