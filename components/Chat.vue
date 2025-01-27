<script setup>
    const notification = useToast();

    import { VueShowdown } from 'vue-showdown';

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
        let data = await createChat({ display: false });
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
            <input @keyup.enter="send({ intro: true })" v-model="message" placeholder="Enter your message..." class="h-full w-full rounded-3xl p-2 border-none outline-none text-sm dark:bg-[#1e1e1e]" :disabled="states.pending" />
            <UIcon @click="send({ intro: true })" class="w-6 h-6 cursor-pointer aria-disabled:cursor-not-allowed hover:text-primary-500 transition-colors" :name="!states.pending ? 'material-symbols:send-outline-rounded' : 'material-symbols:stop-circle'" :aria-disabled="states.pending" />
        </div>

        <div class="grid grid-cols-2 gap-2 w-[470px]">
            <template v-if="suggestions && suggestions.length > 0">
                <UButton block size="xs" v-for="suggest in suggestions" @click=suggestion(suggest) :label="suggest" :disabled="states.pending" />
            </template>

            <template v-else-if="!suggestions">
                <USkeleton class="h-[50px] w-full" v-for="x in 4" />
            </template>
        </div>

        <div v-if="states.pending" class="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>

    <!-- If chat is chosen -->
    <div v-else id="chat-container" class="w-[calc(80%-6rem)] flex flex-col items-center">
        <div id="chat-content" class="w-full h-full py-8 pl-24 overflow-y-auto">
            <ClientOnly>
                <template v-for="(message, index) in messages">
                    <UDivider class="p-5" v-if="message.role == 'user' && index > 0 && messages[index-1].role == 'assistant'" />
                    
                    <!-- User's message -->
                    <div class="flex items-center" v-if="message.role == 'user'">
                        <div class="rounded-2xl min-w-[24px] min-h-[24px] flex justify-center items-center mr-2 bg-primary-500">
                            <UIcon name="material-symbols:account-circle" />
                        </div>

                        <p>{{ message.content }}</p>
                    </div>

                    <!-- AI Resposne -->
                    <div class="pt-2 pl-[32px] overflow-x-auto" v-if="message.role == 'assistant'">
                        <p class="pb-2 text-primary-500" v-if="index > 0 && messages[index-1].role != message.role">Mostaelim <UIcon name="line-md:search" /></p>

                        <p v-if="!message.type">{{ message.content }}</p>

                        <VueShowdown class="w-fit transition-colors" v-else-if="message.type == 'Markdown'" flavor="original" :markdown="message.content" :options="{ tables: true, literalMidWordUnderscores: true }" />

                        <nuxt-plotly v-else-if="message.type == 'Plotly'" style="width: 400px;" :data="JSON.parse(message.content).data" :layout="JSON.parse(message.content).layout" :config="{ scrollZoom: true, displayModeBar: false }" />
                    </div>
                </template>
            </ClientOnly>
        </div>

        <div v-if="states.pending" class="lds-ellipsis bottom-10">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>

        <div id="input-container" class="h-[50px] w-[500px] flex items-center mb-5 mt-auto rounded-3xl bg-white dark:bg-[#1e1e1e] p-1 shadow-2xl dark:shadow-none">
            <input @keyup.enter="send" v-model="message" placeholder="Enter your message..." class="h-full w-full rounded-3xl p-2 border-none outline-none text-sm dark:bg-[#1e1e1e]" />
            <UIcon @click="send" class="w-6 h-6 cursor-pointer aria-disabled:cursor-not-allowed hover:text-primary-500 transition-colors" :name="!states.pending ? 'material-symbols:send-outline-rounded' : 'material-symbols:stop-circle'" :aria-disabled="states.pending" />
        </div>
    </div>
</template>

<style scoped>
    #chat-content {
        -webkit-mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
        mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
    }
</style>