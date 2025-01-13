<script setup>
    const { user, clear } = useUserSession();

    // Get chats
    const chatList = useState('chat:list', () => { return null });
    const { data: chats } = await useFetch('/api/chats');
    chatList.value = [...chats.value];

    // Select chat
    const selectedChat = useState('chat:selected', () => { return null });
    const history = useState('chat:history', () => { return [] }); // Chat history

    // Color mode
    const theme = useColorMode();
    const isDark = computed({
        get () {
            return theme.value === 'dark';
        },
        set () {
            theme.preference = theme.value === 'dark' ? 'light' : 'dark';
        }
    });

    // Confirmations
    async function deleteChat(id, close) {
        if(id) {
            const data = await $fetch('/api/chat', {
                method: "DELETE",

                query: { id } // All chats
            });

            if(data) {
                chatList.value = id == -1 ? [] : chatList.value.filter(el => el.id != id);
                selectedChat.value = null;
                history.value = [];
            }
        }

        if(close)
            close();
    }

    // Edit chat title
    const editing = useState('chat:editing', () => { return false });
    const currentTitle = ref(null);
    async function toggleEdit(id, title) {
        if(editing.value) { // Finished edit
            console.log(currentTitle.value);

            if(currentTitle.value != title) { // Changed
                const data = await $fetch('/api/chat', {
                    method: "PATCH",

                    body: {
                        id,
                        title: currentTitle.value
                    }
                });
                
                for(let chat of chatList.value) {
                    if(chat.id == id) {
                        chat.title = currentTitle.value;
                        break;
                    }
                }
            }

            // Reset
            currentTitle.value = null;
        } else {
            currentTitle.value = title;
        }

        editing.value = editing.value == id ? false : id;
    }

    // Logout
    async function logout() {
        await clear();
        await navigateTo('/login');
    }
</script>

<template>
    <div class="w-[250px] flex-shrink-0 rounded-2xl flex flex-col gap-4 mx-5 m-2 pt-3 px-4 bg-[#ffffff] dark:bg-[#1e1e1e] shadow-2xl dark:shadow-none">
        <div class="flex items-center">
            <img @click="selectedChat = null" class="hidden dark:block cursor-pointer" width="150" src="/Logo_dark.png" />
            <img @click="selectedChat = null" class="block dark:hidden cursor-pointer" width="150" src="/Logo.png" />

            <ClientOnly>
                <UButton class="ml-auto" :color="isDark ? 'gray' : 'white'" @click="isDark = !isDark" variant="ghost" :icon="isDark ? 'material-symbols:light-mode' : 'material-symbols:dark-mode'" />
            </ClientOnly>
        </div>
        <UButton @click="selectChat(null)" size="xl" :ui="{ rounded: 'rounded-full' }" icon="ri-add-line" label="New Chat" block />

        <PanelSection>
            <p class="text-[12px]">Your conversations</p>

            <PanelConfirm @clicked="deleteChat">
                <p class="text-[14px] text-primary-500">Clear All</p>
            </PanelConfirm>
        </PanelSection>

        <div id="chat-list" class="overflow-y-auto pb-5">
            <template v-for="chat in chatList">
                <div class="flex items-center relative">
                    <div @click="selectedChat != chat.id && selectChat(chat.id)" class="cursor-pointer px-1 py-2 rounded-md flex w-full gap-1 items-center transition-colors hover:bg-primary-100 dark:hover:bg-primary-400 truncate">
                        <UIcon class="min-w-[16px] min-h-[16px]" name="mdi-chat-processing-outline" />
                        
                        <p v-if="editing != chat.id" class="w-[85%] truncate">{{ chat.title }}</p>
                        <input v-else class="w-[85%]" v-model="currentTitle" />
                    </div>

                    <div class="flex ml-auto bg-primary-500 p-1 rounded-2xl absolute right-1" v-if="chat.id == selectedChat">
                        <UIcon @click="deleteChat(chat.id)" class="cursor-pointer hover:bg-red-500" name="solar-trash-bin-trash-outline" />
                        <UIcon @click="toggleEdit(chat.id, chat.title)" class="cursor-pointer" :class="(editing && currentTitle != chat.title) ? 'hover:bg-green-600' : 'hover:bg-yellow-500'" :name="editing && currentTitle != chat.title ? 'material-symbols:check-box-outline' : 'material-symbols:edit-square-outline'" />
                    </div>
                </div>
            </template>
        </div>

        <div class="mb-3 mt-auto">
            <div class="flex items-center border-gray-500 border-[1px] rounded-2xl p-2 mb-2">
                <div class="rounded-2xl w-[24px] h-[24px] flex justify-center items-center mr-4 bg-primary-500">
                    <UIcon name="solar-settings-outline" />
                </div>

                <p>Settings</p>
            </div>
            
            <UPopover :popper="{ placement: 'top-end' }" :ui="{ strategy: 'override', trigger: 'w-full rounded-2xl' }">
                <div class="flex items-center border-gray-500 border-[1px] rounded-2xl p-2">
                    <div class="rounded-2xl w-[24px] h-[24px] flex justify-center items-center mr-4 bg-primary-500">
                        <UIcon name="material-symbols:account-circle" />
                    </div>

                    <p>{{ user.name }}</p>
                </div>

                <template #panel>
                    <div class="p-2">
                        <div class="flex flex-row items-center justify-center">
                            <p class="text-sm">Logout?</p>
                            <UButton @click="logout()" variant="link" color="red" label="Yes" />
                        </div>
                    </div>
                </template>
            </UPopover>
        </div>
    </div>
</template>

<style scoped>
    #chat-list {
        -webkit-mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
        mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
    }
</style>