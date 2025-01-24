<script setup>
    useHead({
        title: "Mostaelim Login"
    });


    const state = ref({
        username: undefined,
        password: undefined
    });

    const notification = useToast();
    const pending = ref(false);
    async function onLogin(event) {
        const data = event.data;

        if(!data.username) return notification.add({ title: 'Username is required' });
        
        if(!data.password) return notification.add({ title: "Password is required" });
        if(data.password.length < 8) return notification.add({ title: "Password should be 8 and more" });

        pending.value = true;
        const resp = await $fetch('/api/login', {
            method: "POST",

            body: { username: data.username, password: data.password }
        });
        pending.value = false;        

        if(!resp.status) return notification.add({ title: resp.message });
        
        await navigateTo('/');
    }

    const theme = useColorMode();
    const isDark = computed({
        get () {
            return theme.value === 'dark';
        },
        set () {
            theme.preference = theme.value === 'dark' ? 'light' : 'dark';
        }
    });
</script>

<template>
    <div class="h-screen flex justify-center items-center">
        <div class="flex flex-col gap-5 justify-center w-[400px] p-8 rounded-3xl bg-[#ffffff] dark:bg-[#1e1e1e] shadow-2xl dark:shadow-none">
            <ClientOnly>
                <UButton class="ml-auto" :color="isDark ? 'gray' : 'white'" @click="isDark = !isDark" variant="ghost" :icon="isDark ? 'material-symbols:light-mode' : 'material-symbols:dark-mode'" />
            </ClientOnly>

            <img class="self-center hidden dark:block" width="250" src="/Logo_dark.png" />
            <img class="self-center block dark:hidden" width="250" src="/Logo.png" />

            <UForm class="flex flex-col gap-5 mb-5" :state="state" @submit.prevent="onLogin">
                <UFormGroup label="Username" name="username">
                    <UInput v-model="state.username" />
                </UFormGroup>

                <UFormGroup label="Password" name="password">
                    <UInput v-model="state.password" type="password" />
                </UFormGroup>

                <UButton :loading="pending" block type="submit">Login</UButton>
            </UForm>
        </div>
    </div>
</template>