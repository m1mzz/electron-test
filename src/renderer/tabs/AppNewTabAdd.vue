<script setup>
import useTabStore from './tabsStore';

const { addNewTab } = useTabStore()
</script>

<template>
    <div class="text-xl cursor-pointer px-1" @click="addNewTab()">+</div>
</template>

<style>

</style>
