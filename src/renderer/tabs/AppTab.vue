<script setup lang="ts">
import type { PropType } from 'vue';
import type { Tab } from './tabsStore';
import useTabStore from './tabsStore';

const props = defineProps({
    tab: {
        type: Object as PropType<Tab>,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: false,
    }
})

const tabStore = useTabStore()

const tabClickHandler = () => {
    if (props.isActive) return;
    tabStore.setActiveTab(props.tab);
}
</script>

<template>
    <div
        class="relative border cursor-pointer truncate max-w-48 pr-6 pl-1 rounded min-w-20"
        :class="{'bg-slate-300': isActive}"
        @click="tabClickHandler"
    >
        {{ tab.title }}

        <span class="absolute right-0 top-0 px-1 rounded border bg-white hover:bg-slate-100" @click.stop="tabStore.closeTab(tab)">X</span>
    </div>
</template>

<style>

</style>
