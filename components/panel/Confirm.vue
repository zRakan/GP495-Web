<script setup>
    const emit = defineEmits(['clicked']);
</script>

<template>
    <UPopover>
        <slot></slot>

        <template #panel="{ close }">
            <div class="p-4">
                <p>Are you sure?</p>

                <div class="flex flex-row gap-2">
                    <UButton @click="emit('clicked', true, close)" label="Yes" />
                    <UButton @click="emit('clicked', false, close)" label="No" />
                </div>
            </div>
        </template>
    </UPopover>
</template>