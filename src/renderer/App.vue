<script setup lang="ts">
import AppTabList from './tabs/AppTabList.vue';
import AppTabNavigation from './tabs/AppTabNavigation.vue';
import AppTabFrame from './tabs/AppTabFrame.vue';

</script>

<template>
    <div class="grid p-1 ">
        <AppTabList/>
        <AppTabNavigation/>
    </div>

    <AppTabFrame/>
</template>

<style>
HTML,
BODY {
    height: 100%;
}

#app {
    display: grid;
    height: 100%;
    grid-template-rows: auto 1fr;
    /* grid-template-columns: auto 1fr; */
}
</style>
