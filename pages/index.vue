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
        { type: 'you', message: 'How many patients?' },
        { type: 'you', message: 'How many patients?' },
        { type: 'ai', message: 'SELECT COUNT(*) FROM PATIENTS;' },
        { type: 'ai', message: 'SELECT COUNT(*) FROM PATIENTSX;' },
        { type: 'you', message: 'With their names, please' },
        { type: 'ai', message: 'SELECT first, last FROM PATIENTS;' }

    ]);
</script>

<template>
    <div class="h-screen flex bg-slate-800 pr-2 pt-3 pb-10">
        
        <div id="left-panel" class="flex flex-col bg-slate-800" :class="{ open: isOpen }">
            <BootstrapIcon @click="isOpen=!isOpen" id="iconHover" class="pl-2 text-[32px]" :class="isOpen && 'translate-x-[160px]'" :name="isOpen ? 'box-arrow-in-left' : 'arrow-right-square'" />
            
            <BootstrapIcon v-if="!isOpen" id="iconHover" class="pl-2 text-[32px]" name="chat-dots-fill" />
            <div v-else class="flex flex-col px-2 gap-4">
                <div class="flex flex-row justify-between p-2 rounded-lg bg-gray-500 bg-opacity-50 hover:bg-opacity-75 cursor-pointer" v-for="chat in chatList">
                    <p>{{ chat }}</p>

                    <UPopover overlay>
                        <UTooltip text="Delete chat">
                            <BootstrapIcon class='transition-colors cursor-pointer hover:text-[red]' name="trash" />
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
            <BootstrapIcon v-if="!isOpen" id="iconHover" class="mt-auto pl-2 text-[32px]" name="person-circle" />
            <div v-else class="mt-auto px-2">
                <UDivider :ui="{ border: { base: 'dark:border-gray-200' } }" label="Account" />
                
                <div class="flex justify-between">
                    <p>{{ user.name }}</p>

                    <UTooltip text="Logout">
                        <BootstrapIcon @click="logout" id="iconHover" name="box-arrow-right" />
                    </UTooltip>
                </div>
            </div>            
        </div>

        <div id="container" class="w-full rounded-lg h-full flex gap-2 bg-slate-950 p-2">
            <!-- Chat container -->
            <div id="chat-container" class="w-full flex flex-col gap-2">

                <div id="chat-header" class="h-[50px] flex px-2 justify-between items-center bg-slate-900 rounded-md">
                    <h2>AI Chatbot</h2>
                    <UInput icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search..." :autocomplete="false" />
                </div>

                <div id="chat-content" class="overflow-y-auto h-full p-2 bg-slate-900 rounded-md flex flex-col px-5">
                    <template v-for="(message, index) in history">                    
                        <div class="message" :id="message.type" :class="(index > 0 && history[index-1].type == message.type) ? 'mb-5' : 'mb-1'">
                            <div id="message-header" class="flex gap-2 mb-2 items-center" v-if="index == 0 || history[index-1].type != message.type">
                                <BootstrapIcon class="text-[28px]" :name="message.type == 'you' ? 'person-circle' : 'robot'" />
                                <p class="text-[18px]">{{ message.type == 'you' ? "You" : "AI" }}</p>
                            </div>
                            
                            <p class="w-fit p-4 rounded-2xl bg-primary-700" :class="message.type == 'ai' && 'bg-primary-950'">{{ message.message }}</p>
                        </div>
                    </template>
                </div>

            </div>

            <!-- Diagrams container -->
            <div id="diagrams-container" class="rounded-md w-[250px] bg-slate-900 pt-3">
                <div class="bg-slate-500 w-[150px] p-2 mx-auto rounded-2xl bg-opacity-50 hover:bg-opacity-75 transition-transform hover:-translate-y-0.5">
                    <h2 class="text-center">Diagrams</h2>
                </div>
            </div>
        </div>

        <p class="absolute bottom-2 mx-auto">Hello World</p>
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