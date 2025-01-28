<script setup>
    const emit = defineEmits(['clicked']);
</script>

<template>
    <UPopover>
        <slot />

        <template #panel="{ close }">
            <div class="p-4">
                <p>Are you sure?</p>

                <div class="flex flex-row gap-2">
                    <UButton label="Yes" @click="emit('clicked', -1, close)" />
                    <UButton label="No" @click="emit('clicked', false, close)" />
                </div>
            </div>
        </template>
    </UPopover>
</template>