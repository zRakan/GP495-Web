export default async function(id) {
    const selectedChat = useState('chat:selected', () => { return null });
    const history = useState('chat:history', () => { return [] }); // Chat history
    const editing = useState('chat:editing', () => { return false });    

    if(!id) {
        const chat = await createChat();

        id = chat.id;
    }

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