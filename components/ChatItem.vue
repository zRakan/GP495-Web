<script setup>
    import { VueShowdown } from 'vue-showdown';

    const notification = useToast();

    const states = ref({
        pending: false
    })

    const messages = useState('chat:history', () => { return [] });
    const selectedChat = useState('chat:selected', () => { return null });
    const chatList = useState('chat:list', () => { return null })
    
    const message = ref('');
    async function send({ channelId, sentMessage, intro = false }) {    
        if(states.value.pending) return notification.add({ title: 'Wait for previous message to be processed' });

        if(sentMessage)
            message.value = sentMessage;

        if(message.value.length == 0) return;
        
        states.value.pending = true;
        const data = await $fetch('/api/send', {
            method: "POST",

            body: { id: channelId || selectedChat.value, message: sentMessage || message.value },

            ignoreResponseError: true
        });

        // Created a new chat
        if(data.chat) {
            chatList.value.push({ id: data.chat.id, title: data.chat.title });
            await selectChat(data.chat.id);
        } else if(data.status == false) {
            notification.add({ title: 'Something went wrong' });
        }

        states.value.pending = false;

        // Reset input
        message.value = '';

        // Append new messages
        if(!channelId && !intro) // Already in chat window
            messages.value.push(...data.messages);
    }

    // Get suggestions
    const { data: suggestions } = await useFetch('/api/suggestions', { server: false });
    async function suggestion(suggest) {        
        const data = await createChat({ display: false });
        if(data) {
            // Send message
            await send({ channelId: data.id, sentMessage: suggest });

            // Display chat in panel
            chatList.value.push({ id: data.id, title: data.title });

            // Select chat
            await selectChat(data.id);
        }
    }
</script>

<template>
    <div v-if="!selectedChat" class="w-[100%] flex flex-col justify-center items-center">
        <p class="text-3xl">Welcome to Mostaelim</p>

        <div id="input-container" class="h-[50px] w-[500px] my-2 flex items-center rounded-3xl bg-white dark:bg-[#1e1e1e] p-1 shadow-2xl dark:shadow-none">
            <input v-model="message" placeholder="Enter your message..." class="h-full w-full rounded-3xl p-2 border-none outline-none text-sm dark:bg-[#1e1e1e]" :disabled="states.pending" @keyup.enter="send({ intro: true })">
            <UIcon class="w-6 h-6 cursor-pointer aria-disabled:cursor-not-allowed hover:text-primary-500 transition-colors" :name="!states.pending ? 'material-symbols:send-outline-rounded' : 'material-symbols:stop-circle'" :aria-disabled="states.pending" @click="send({ intro: true })" />
        </div>

        <div class="grid grid-cols-2 gap-2 w-[470px]">
            <template v-if="suggestions && suggestions.length > 0"> 

                <UButton v-for="(suggest, index) in suggestions" :key="index" block size="xs" :label="suggest" :disabled="states.pending" @click=suggestion(suggest) />
            </template>

            <template v-else-if="!suggestions">
                <USkeleton v-for="(x, index) in 4" :key="index" class="h-[50px] w-full" />
            </template>
        </div>

        <div v-if="states.pending" class="lds-ellipsis">
            <div />
            <div />
            <div />
            <div />
        </div>
    </div>

    <!-- If chat is chosen -->
    <div v-else id="chat-container" class="w-[calc(80%-6rem)] flex flex-col items-center">
        <div id="chat-content" class="w-full h-full py-8 pl-24 overflow-y-auto">
            <ClientOnly>
                <template v-for="(currentMessage, index) in messages" :key="index">
                    <UDivider v-if="currentMessage.role == 'user' && index > 0 && messages[index-1].role == 'assistant'" class="p-5" />
                    
                    <!-- User's message -->
                    <div v-if="currentMessage.role == 'user'" class="flex items-center">
                        <div class="rounded-2xl min-w-[24px] min-h-[24px] flex justify-center items-center mr-2 bg-primary-500">
                            <UIcon name="material-symbols:account-circle" />
                        </div>

                        <p>{{ currentMessage.content }}</p>
                    </div>

                    <!-- AI Resposne -->
                    <div v-if="currentMessage.role == 'assistant'" class="mt-2 ml-[32px] overflow-x-auto" :style="currentMessage.type == 'Markdown' && { 'height': '400px', 'width': '600px', 'scrollbar-width': 'thin' }">
                        <p v-if="index > 0 && messages[index-1].role != currentMessage.role" class="pb-2 text-primary-500">Mostaelim <UIcon name="line-md:search" /></p>

                        <p v-if="!currentMessage.type">{{ currentMessage.content }}</p>

                        <VueShowdown v-else-if="currentMessage.type == 'Markdown'" flavor="original" :markdown="currentMessage.content" :options="{ tables: true, literalMidWordUnderscores: true }" />

                        <nuxt-plotly v-else-if="currentMessage.type == 'Plotly'" style="width: 400px;" :data="JSON.parse(currentMessage.content).data" :layout="JSON.parse(currentMessage.content).layout" :config="{ scrollZoom: true, displayModeBar: false }" />
                    </div>
                </template>
            </ClientOnly>
        </div>

        <div v-if="states.pending" class="lds-ellipsis bottom-10">
            <div />
            <div />
            <div />
            <div />
        </div>

        <div id="input-container" class="h-[50px] w-[500px] flex items-center mb-5 mt-auto rounded-3xl bg-white dark:bg-[#1e1e1e] p-1 shadow-2xl dark:shadow-none">
            <input v-model="message" placeholder="Enter your message..." class="h-full w-full rounded-3xl p-2 border-none outline-none text-sm dark:bg-[#1e1e1e]" @keyup.enter="send">
            <UIcon class="w-6 h-6 cursor-pointer aria-disabled:cursor-not-allowed hover:text-primary-500 transition-colors" :name="!states.pending ? 'material-symbols:send-outline-rounded' : 'material-symbols:stop-circle'" :aria-disabled="states.pending" @click="send" />
        </div>
    </div>
</template>

<style scoped>
    #chat-content {
        -webkit-mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
        mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
    }
</style>