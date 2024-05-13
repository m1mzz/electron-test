<script setup lang="ts">
import AppNewTabAdd from './AppNewTabAdd.vue';
import AppTab from './AppTab.vue';
import useTabStore from './tabsStore';

const tabStore = useTabStore()

</script>

<template>
    <div class="tabs flex gap-2 overflow-auto mb-1">
        <AppTab
            v-for="tab in tabStore.tabs" 
            :tab 
            :isActive="tab.id === tabStore.activeTab.id"
        />
        <AppNewTabAdd />
    </div>
</template>

<style>

</style>
