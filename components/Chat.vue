<script setup>
    const message = ref('');
    function send() {        
        // Reset input
        message.value = '';
    }
</script>

<template>
    <div id="chat-container" class="w-full flex flex-col items-center">
        <div id="input-container" class="h-[50px] w-[500px] flex items-center mb-5 mt-auto rounded-3xl bg-white dark:bg-[#1e1e1e] p-1" :class="{ 'shadow-2xl': $colorMode.value == 'light' }">
            <input @keyup.enter="send" v-model="message" placeholder="Enter your message..." class="h-full w-full rounded-3xl p-2 border-none outline-none text-sm dark:bg-[#1e1e1e]" />
            <UIcon @click="send" class="w-6 h-6 cursor-pointer hover:text-primary-500 transition-colors" name="material-symbols:send-outline-rounded" />
        </div>
    </div>
</template>
