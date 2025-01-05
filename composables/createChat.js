export default async function({ display = true } = {}) {
    const chatList = useState('chat:list', () => { return null });

    const data = await $fetch('/api/chat', {
        method: "PUT"
    });

    if(data && display) {
        // Display chat in panel
        chatList.value.push({ id: data.id, title: data.title });
    }

    return data;
}