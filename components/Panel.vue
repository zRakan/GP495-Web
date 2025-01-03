<script setup>
    const { user } = useUserSession()

    // Get chats
    const chatList = ref(null);
    const { data: chats } = await useFetch('/api/chats');
    chatList.value = [...chats.value];

    // Create chat
    async function createChat() {
        const data = await $fetch('/api/chat', {
            method: "PUT"
        });

        if(data) {
            chatList.value.push({ id: data.id, title: data.title });
        }
    }

    // Select chat
    const selectedChat = useState('chat:selected', () => { return null });
    const history = useState('chat:history', () => { return [] }); // Chat history
    async function selectChat(id) {
        const data = await $fetch('/api/chat', {
            query: { id }
        });

        if(data) {
            selectedChat.value = id;
            history.value = data.history;

            // Reset editing mode
            editing.value = false;
        }
    }

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

            if(data)
                chatList.value = id == -1 ? [] : chatList.value.filter(el => el.id != id);
        }

        if(close)
            close();
    }

    // Edit chat title
    const editing = ref(false);
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
</script>

<template>
    <div class="w-[250px] rounded-2xl flex flex-col gap-4 mx-5 m-2 pt-3 px-4 bg-[#ffffff] dark:bg-[#1e1e1e] shadow-2xl dark:shadow-none">
        <div class="flex items-center">
            <p class="text-[28px] pb-2">Mostaelim</p>

            <ClientOnly>
                <UButton class="ml-auto" :color="isDark ? 'gray' : 'white'" @click="isDark = !isDark" variant="ghost" :icon="isDark ? 'material-symbols:light-mode' : 'material-symbols:dark-mode'" />
            </ClientOnly>
        </div>
        <UButton @click="createChat()" size="xl" :ui="{ rounded: 'rounded-full' }" icon="ri-add-line" label="New Chat" block />

        <PanelSection>
            <p class="text-[12px]">Your conversations</p>

            <PanelConfirm @clicked="deleteChat">
                <p class="text-[14px] text-primary-500">Clear All</p>
            </PanelConfirm>
        </PanelSection>

        <div class="overflow-y-auto">
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
            
            <div class="flex items-center border-gray-500 border-[1px] rounded-2xl p-2">
                <div class="rounded-2xl w-[24px] h-[24px] flex justify-center items-center mr-4 bg-primary-500">
                    <UIcon name="material-symbols:account-circle" />
                </div>

                <p>{{ user.name}}</p>
            </div>
        </div>
    </div>
</template>