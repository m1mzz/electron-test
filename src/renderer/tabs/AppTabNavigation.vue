<script setup lang="ts">
import {  computed, onMounted, ref, watch } from 'vue';
import useTabStore from './tabsStore';


const navigateBack = () => {
    window.electronAPI.navigateBack()
}
const navigateForward = () => {
    window.electronAPI.navigateForward()
}
const navigateReload = () => {
    window.electronAPI.navigateReload()
}

const url = ref<string>('');
const urlInput = ref<HTMLElement>();

const tabStore = useTabStore()

const enterUrl = () => {
    urlInput.value.blur()
    tabStore.setUrl(url.value)
}

const activeTab = computed(() => tabStore.activeTab)

watch(() => activeTab.value, (newVal) => {
    url.value = newVal.url
})
watch(() => tabStore.tabs.length, () => {    
    urlInput.value.focus()
})

onMounted(() => {
    urlInput.value.focus()
})

</script>

<template>
    <div class="flex gap-2">
        <button
            class="text-nowrap rounded border px-2 hover:bg-slate-100"
            :class="{'bg-gray-400 pointer-events-none': !activeTab.canBack}"
            :disabled="!activeTab.canBack" 
            @click="navigateBack"
        >
            <
        </button>
        <button
            class="text-nowrap rounded border px-2 hover:bg-slate-100"
            :class="{'bg-gray-400 pointer-events-none': !activeTab.canForward}"
            :disabled="!activeTab.canForward" 
            @click="navigateForward"
        >
            >
        </button>
        <button
            class="text-nowrap rounded border px-1 hover:bg-slate-100"
            :class="{'bg-gray-200': activeTab.isLoading}"
            @click="navigateReload"
        >
            {{ activeTab.isLoading ? 'loading...' : 'reload' }}
        </button>
        <input
            ref="urlInput"
            class="border rounded w-full px-2"
            type="text"
            v-model="url"
            placeholder="Search Google or type a URL"
            @keydown.enter="enterUrl"
        >
        
        <button @click="enterUrl">enter</button>

    </div>
</template>