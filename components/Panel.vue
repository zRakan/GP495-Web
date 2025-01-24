<script setup>
    const { user, clear } = useUserSession();
    const notification = useToast();

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
        if(chatList.value.length == 0) {
            notification.add({ title: 'Chat list is empty' });

            if(close) close();

            return;
        }

        if(id) {
            const data = await $fetch('/api/chat', {
                method: "DELETE",

                query: { id }, // All chats

                ignoreResponseError: true
            });

            if(data.status) {
                chatList.value = id == -1 ? [] : chatList.value.filter(el => el.id != id);
                selectedChat.value = null;
                history.value = [];

                notification.add({ title: id == -1 ? 'All chats have been deleted' : 'Chat has been deleted' });
            } else {
                notification.add({ title: 'Something went wrong' })
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
            if(currentTitle.value != title) { // Changed
                const data = await $fetch('/api/chat', {
                    method: "PATCH",

                    body: {
                        id,
                        title: currentTitle.value
                    },

                    ignoreResponseError: true
                });

                if(data.status == false) {
                    notification.add({ title: 'Something went wrong' });
                } else {
                    for(let chat of chatList.value) {
                        if(chat.id == id) {
                            chat.title = currentTitle.value;
                            break;
                        }
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

    // Settings modal
    const settings = ref(false);

    // Account settings
    const accountSettings = ref(false);
    const users = ref(null);
    const roles = ['user', 'admin'];


    const usernameInput = ref("");
    const passwordInput = ref("");
    const selectedRole = ref(roles[0]);

    async function addUser() {
        if(usernameInput.value == "" || passwordInput.value == "" || !roles.includes(selectedRole.value)) return notification.add({ title: 'Invalid user data' });
        if(passwordInput.value.length < 8) return notification.add({ title: 'Password must be 8 length or more' });

        const resp = await $fetch('/api/users', {
            method: "PUT",

            body: {
                username: usernameInput.value,
                password: passwordInput.value,
                role: selectedRole.value
            },

            ignoreResponseError: true
        });

        if(resp.id) { // User has been added
            users.value.push({
                id: resp.id,
                username: usernameInput.value
            });

            notification.add({ title: 'User has been added successfully' });
        } else {
            notification.add({ title: resp.message ? resp.message : 'Something went wrong' });
        }

        // Reset inputs
        usernameInput.value = "";
        passwordInput.value = "";
    }

    async function deleteUser(id, ref) {
        const resp = await $fetch('/api/users', {
            method: "DELETE",

            body: { id },

            ignoreResponseError: true
        });

        if(resp.status) {
            users.value = users.value.filter(el => el !== ref);
            notification.add({ title: 'User has been deleted successfully' });
        } else {
            notification.add({ title: 'Something went wrong' });
        }
    }

    async function openAccountSettings() {
        if(accountSettings.value) return;

        // Close popper
        settings.value = false;

        accountSettings.value = true;

        // Fetch users
        const data = await $fetch('/api/users', { ignoreResponseError: true });
        
        if(data.status == false) { // Unauthorized
            accountSettings.value = false;
            notification.add({ title: 'Something went wrong' });

            return;
        }

        users.value = data.users;
    }

    // Training settings
    const trainingSettings = ref(false);
    const trainingData = ref(null);

    async function openTrainingSettings() {
        if(trainingSettings.value) {
            return;
        }

        
        // Close popper
        settings.value = false;

        trainingSettings.value = true;

        // Fetch data
        const resp = await $fetch('/api/data', { ignoreResponseError: true });
        if(resp.status == false) {
            notification.add({ title: 'Something went wrong' });
            return;
        }

        trainingData.value = resp;
    }

    // Add data
    const trainingPending = ref(false);
    const Question = ref("");
    const Answer = ref("");

    async function addQdrant() {
        if(trainingPending.value) return notification.add({ title: 'Please wait for previous operation '});

        if(Question.value.length == 0 || Answer.value.length == 0) return notification.add({ title: 'Invalid training data' });

        trainingPending.value = true;
        const resp = await $fetch('/api/data', {
            method: "PUT",

            body: {
                question: Question.value,
                answer: Answer.value
            },

            ignoreResponseError: true
        });
        trainingPending.value = false;

        if(resp.id) { // Has been added
            trainingData.value.push({
                id: resp.id,
                query: Question.value,
                answer: Answer.value
            });

            // Reset data
            Question.value = "";
            Answer.value = "";

            notification.add({ title: 'Training data has been added successfully' });
        } else {
            notification.add({ title: 'Something went wrong' });
        }
    }

    // Editing data
    const selectedData = ref(null);
    const editedData = ref({
        query: "",
        answer: "",
    });
    const isChanged = computed(() => {
        const selected = selectedData.value;
        const edited = editedData.value;

        return selected && (selected.query != edited.query || selected.answer != edited.answer);
    });

    async function editingQdrant(data) {
        if(selectedData.value == data) { // Disable editing
            selectedData.value = null;
            editedData.value = {
                query: "",
                answer: "",
            }
            
            return;
        }

        selectedData.value = data;

        const edit = editedData.value;

        edit.query = data.query;
        edit.answer = data.answer;
    }

    async function editedQdrant() {
        const selected = selectedData.value;
        const edited = editedData.value;


        const resp = await $fetch('/api/data', {
            method: "PATCH",

            body: {
                id: selected.id,
                query: edited.query,
                answer: edited.answer
            },

            ignoreResponseError: true
        });

        if(resp.status) {
            // Update reference
            selected.query = edited.query;
            selected.answer = edited.answer;

            // Reset values
            selectedData.value = null;
            editedData.value = {
                query: "",
                answer: "",
            }

            notification.add({ title: 'Training data has been edited successfully' });
        } else {
            notification.add({ title: 'Something went wrong' });
        }
    }

    // Deleta data
    async function deleteQdrant(data) {
        const resp = await $fetch('/api/data', {
            method: "DELETE",

            query: { id: data.id }
        });

        // Delete reference from training array
        if(resp.status) {
            trainingData.value = trainingData.value.filter(el => el !== data);
            notification.add({ title: 'Training data has been deleted successfully' });
        } else {
            notification.add({ title: 'Something went wrong' });
        }
    }

    // When settings modal close
    watch(trainingSettings, function(value) {
        if(!value) {
            trainingSettings.value = false;
            trainingData.value = null;

            // Reset inputs
            Question.value = "";
            Answer.value = "";

            selectedData.value = null;
            editedData.value = {
                query: "",
                answer: "",
            }
        }
    });
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
            <UDivider size="2xs" class="pb-3" :ui="{ strategy: 'override', border: { base: 'flex border-gray-500' } }" />

            <UPopover v-if="user.role == 'admin'" v-model:open="settings" :popper="{ placement: 'top-end' }" :ui="{ strategy: 'override', trigger: 'w-full rounded-2xl' }">
                <div class="flex items-center hover:bg-primary-100 hover:dark:bg-gray-800 transition-colors rounded-xl p-2 mb-2 cursor-pointer">
                    <div class="rounded-2xl w-[24px] h-[24px] flex justify-center items-center mr-4 bg-primary-500">
                        <UIcon name="solar-settings-outline" />
                    </div>

                    <p>Settings</p>
                </div>

                <template #panel>
                    <div class="p-2">
                        <div class="flex gap-5 items-center justify-center">
                            <UIcon name="material-symbols:folder-managed-outline-sharp" class="cursor-pointer hover:bg-yellow-500 transition-colors" @click="openTrainingSettings()" />
                            <UIcon name="material-symbols:manage-accounts-outline" class="cursor-pointer hover:bg-emerald-500 transition-colors" @click="openAccountSettings()" />
                        </div>
                    </div>
                </template>
            </UPopover>
            
            <UPopover :popper="{ placement: 'top-end' }" :ui="{ strategy: 'override', trigger: 'w-full rounded-2xl' }">
                <div class="flex items-center hover:bg-primary-100 hover:dark:bg-gray-800 transition-colors rounded-xl p-2">
                    <div class="rounded-2xl w-[24px] h-[24px] flex justify-center items-center mr-4 bg-primary-500">
                        <UIcon name="material-symbols:account-circle" />
                    </div>

                    <p>{{ user.name }}</p>
                </div>

                <template #panel>
                    <div class="p-2">
                        <div class="flex flex-row items-center justify-center">
                            <UButton @click="logout()" variant="link" color="red" label="Logout" />
                        </div>
                    </div>
                </template>
            </UPopover>

            <!-- Account Settings Modal -->
            <UModal :ui="{ strategy: 'override', width: 'w-[40%]' }" v-model="accountSettings">
                <div class="p-4">
                    <div class="relative h-auto">
                        <p class="text-[32px] text-center pb-5">Manage Accounts</p>

                        <div class="flex items-center justify-center gap-5 pb-5">
                            <UInput placeholder="Username" v-model="usernameInput" />
                            <UInput placeholder="Password" v-model="passwordInput" />
                            <USelect v-model="selectedRole" :options="roles" />

                            <UIcon @click="addUser()" class="cursor-pointer hover:bg-green-500 w-5 h-5" name="ri-add-circle-line" />
                        </div>

                        <div class="h-80 overflow-auto">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Operation</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <!-- Skeleton -->
                                    <tr v-if="!users">
                                        <td><USkeleton class="w-full h-8 m-2" /></td>
                                        <td><USkeleton class="w-full h-8 m-2" /></td>
                                    </tr>

                                    <template v-for="user in users">
                                        <tr>
                                            <td class="!text-center">{{ user.username }}</td>

                                            <td class="!text-center">
                                                <UIcon @click="deleteUser(user.id, user)" class="cursor-pointer hover:bg-red-500 w-5 h-5" name="solar-trash-bin-trash-outline" />
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </UModal>

            <!-- Training Settings modal -->
            <UModal :ui="{ strategy: 'override', width: 'w-[80%]' }" v-model="trainingSettings">
                <div class="p-4">
                    <div class="relative h-auto">
                        <p class="text-[32px] text-center pb-5">Manage Training Data {{ trainingData && `(${trainingData.length})` }}</p>

                        <div class="h-80 overflow-auto">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Query</th>
                                        <th>Answer</th>
                                        <th>Operation</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <!-- Skeleton -->
                                    <tr v-if="!trainingData">
                                        <td><USkeleton class="w-full h-28 m-2" /></td>
                                    </tr>

                                    <tr v-else>
                                        <td><input class="w-full" placeholder="Question" v-model="Question"></td>
                                        <td><input class="w-full" placeholder="SQL Answer" v-model="Answer"></td>
                                        <td class="!text-center">
                                            <UIcon @click="addQdrant()" class="cursor-pointer hover:bg-green-500 w-5 h-5" name="ri-add-circle-line" />
                                        </td>
                                    </tr>

                                    <template v-for="data in trainingData">
                                        <tr class="text-sm">
                                            <template v-if="data == selectedData">
                                                <td><input class="w-full" v-model="editedData.query" /></td>
                                                <td><input class="w-full" v-model="editedData.answer" /></td>
                                            </template>

                                            <template v-else>
                                                <td>{{ data.query }}</td>
                                                <td>{{ data.answer }}</td>
                                            </template>

                                            <td class="!text-center">
                                                <UIcon @click="deleteQdrant(data)" class="cursor-pointer hover:bg-red-500 w-5 h-5" name="solar-trash-bin-trash-outline" />
                                                <UIcon @click="isChanged ? editedQdrant() : editingQdrant(data)" class="cursor-pointer w-5 h-5" :class="isChanged ? 'hover:bg-green-600' : 'hover:bg-yellow-500'" :name="isChanged ? 'material-symbols:check-box-outline' : 'material-symbols:edit-square-outline'" />
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </UModal>
        </div>
    </div>
</template>

<style scoped>
    #chat-list {
        -webkit-mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
        mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
    }
</style>