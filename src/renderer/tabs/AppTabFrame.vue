<script setup lang="ts">
import { onMounted, ref } from 'vue';
import useTabStore from './tabsStore'


const { updateFrameCoords } = useTabStore()
const tabRenderElement = ref<HTMLElement>();
const updateCoords = () => {
    const coords = tabRenderElement.value.getBoundingClientRect();
    updateFrameCoords(coords)
}

onMounted(() => {
    updateCoords()
    window.addEventListener("resize", updateCoords);
})

</script>

<template>
    <div ref="tabRenderElement" class="w-full h-full bg-gray-300"></div>
</template>

