<script setup>
    const notification = useToast();
    async function logout() {
        const resp = await $fetch('/api/logout', { method: "POST" });

        if(!resp.status) return notification.add({ title: "There's an issue" });

        console.log("Test");
        await navigateTo('/login');
    }

    // Toggle menu
    const isOpen = ref(false);

    const chatList = ref([ // Dummy
        "Patient Records",
        "Hospital employee",
        "Medical treatment",
        "Light show"
    ]);


    async function sleep(id, popperClose) {
        await new Promise(r => setTimeout(r, 1000));

        console.log("Solved");
        popperClose();
    }

    const { user } = useUserSession();

    const history = ref([
        { sender: 'you', type: 'text', message: 'How many patients?' },
        { sender: 'ai', type: 'text', message: 'SELECT COUNT(*) FROM PATIENTSX;' },
        { sender: 'ai', type: 'diagram', message: 'WOOW' },
        { sender: 'you', type: 'text', message: 'With their names, please' },
        { sender: 'ai', type: 'text', message: 'SELECT first, last FROM PATIENTS;' }, 
        { sender: 'ai', type: 'diagram', message: 'WOOW' },
    ]);
</script>

<template>
    <div class="h-screen flex bg-slate-800 pr-2 pt-2">
        
        <div id="left-panel" class="flex flex-col bg-slate-800" :class="{ open: isOpen }">
            <UIcon @click="isOpen=!isOpen" id="iconHover" class="mx-auto w-[36px] h-[36px]" :class="isOpen && '!w-[28px] !h-[28px] translate-x-[80px] mb-5'" :name="isOpen ? 'i-ri-layout-column-fill' : 'i-ri-layout-right-fill'" />
            
            <UIcon v-if="!isOpen" id="iconHover" class="mx-auto w-[36px] h-[36px]" name="i-ri-message-3-fill" />
            <div v-else class="flex flex-col px-2 gap-4">
                <div class="flex flex-row justify-between p-2 rounded-lg bg-gray-500 bg-opacity-50 hover:bg-opacity-75 cursor-pointer" v-for="chat in chatList">
                    <p>{{ chat }}</p>

                    <UPopover overlay>
                        <UTooltip text="Delete chat">
                            <UIcon class='transition-colors cursor-pointer hover:text-[red]' name="i-bi-trash" />
                        </UTooltip>

                        <template #panel="{ close }">
                            <div class="p-3">
                                <p class="text-sm pb-2">Are you sure?</p>

                                <div class="flex flex-row gap-2">
                                    <UButton size="2xs" label="Yes" @click="deleteChat(id, close)" />
                                    <UButton size="2xs" label="No" @click="close" />
                                </div>
                            </div>
                        </template>
                    </UPopover>
                </div>
            </div>

            <!-- Profile -->
            <UIcon v-if="!isOpen" id="iconHover" class="mt-auto mb-1 mx-auto w-[36px] h-[36px]" name="i-ri-account-circle-fill" />
            <div v-else class="mt-auto px-2">
                <UDivider :ui="{ border: { base: 'dark:border-gray-200' } }" label="Account" />
                
                <div class="flex justify-between">
                    <p>{{ user.name }}</p>

                    <UTooltip text="Logout">
                        <UIcon @click="logout" id="iconHover" name="i-ri-logout-box-line" />
                    </UTooltip>
                </div>
            </div>            
        </div>

        <div id="container" class="w-full rounded-t-lg h-full flex gap-2 bg-slate-950 p-2">
            <!-- Chat container -->
            <div id="chat-container" class="w-full flex flex-col gap-2">

                <div id="chat-header" class="h-[50px] flex flex-shrink-0 px-2 justify-between items-center bg-slate-900 rounded-md">
                    <h2>AI Chatbot</h2>
                    <UInput icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search..." :autocomplete="false" />
                </div>

                <div id="chat-content" class="overflow-y-auto h-full p-2 bg-slate-900 rounded-md flex flex-col px-5">
                    <template v-for="(message, index) in history">                    
                        <div class="message" :id="message.sender" :class="(index > 0 && history[index-1].sender == message.sender) ? 'mb-5' : 'mb-1'">
                            <div id="message-header" class="flex gap-2 mb-2 items-center" v-if="index == 0 || history[index-1].sender != message.sender">
                                <UIcon class="text-[28px]" :name="message.sender == 'you' ? 'i-ri-user-3-fill' : 'i-ri-robot-2-fill'" />
                                <p class="text-[18px]">{{ message.sender == 'you' ? "You" : "AI" }}</p>
                            </div>
                            
                            <p v-if="message.type == 'text'" class="w-fit p-4 rounded-2xl bg-primary-700" :class="message.sender == 'ai' && 'bg-primary-950'">{{ message.message }}</p>
                            <p :ref="'diagram-' + index" v-else-if="message.type =='diagram'" class="w-fit p-4 rounded-2xl bg-primary-400">Assume this is a diagram</p>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Diagrams container -->
            <div id="diagrams-container" class="rounded-md w-[250px] bg-slate-900 pt-3 overflow-y-auto">
                <div class="bg-slate-500 w-[150px] p-2 mx-auto rounded-2xl bg-opacity-50 hover:bg-opacity-75 transition-transform hover:-translate-y-0.5">
                    <h2 class="text-center">Diagrams</h2>
                </div>

                <div class="flex flex-col gap-2 p-4">
                    <template v-for="(diagram, ind) in $refs">
                        <UButton @click="diagram[0].scrollIntoView({ behavior: 'smooth' })">{{ ind }}</UButton>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    #left-panel {
        width: 50px;

        height: 100%;
        transition: width 0.2s ease-in;
    }

    #left-panel.open {
        width: 250px;
    }

    #left-panel i {
        width: fit-content;
    }

    #iconHover {
        cursor: pointer;
        transition: all 0.2s ease-in;
    }

    #iconHover:hover {
        color: gray;
    }

    .message#ai {
        align-self: end;
    }

    .message#conversation {
        background-color: red;
        width: 300px; 
    }
</style>