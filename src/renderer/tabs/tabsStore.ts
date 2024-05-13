import { defineStore } from 'pinia';
import type { UpdateTabPayload, UpdateTabLoadingPayload } from '../../types';
import { ElectronEmittingKeys } from '../../types';
import { computed, reactive, ref } from 'vue';

export type Tab = {
    id: number,
    title: string,
    url: string,
    canBack: boolean,
    canForward: boolean,
    isLoading: boolean,
}
export type Tabs = Tab[]

const initTabs = defineStore('tabs', () => {
    const tabs = reactive<Tabs>([]);
    const activeTabId = ref<number>(0);
    const deletedTabs:Tabs = [];

    const setActiveTab = ({id}: Tab) => {
        activeTabId.value = id
        window.electronAPI.setActiveTab(id) 
    }

    let counter = 1
    const getNewTab = (): Tab => ({
        id: counter++,
        title: 'New Tab',
        url: '',
        canBack: false,
        canForward: false,
        isLoading: false,
    })

    const addNewTab = (tab?: Tab) => {
        const newTab = tab || getNewTab()
        tabs.push(newTab)
        window.electronAPI.createTab(newTab.id)

        setActiveTab(newTab)
    }
    addNewTab();

    const activeTab = computed<Tab>(() => tabs.find((currentTab) => currentTab.id === activeTabId.value))

    const updateTab = (tab: Omit<Tab, 'isLoading'>) => {
        const updatedTabIndex = tabs.findIndex((currentTab) => currentTab.id === tab.id);
        tabs[updatedTabIndex] = {...tabs[updatedTabIndex], ...tab};
    }
    const updateTabLoading = (tab: Pick<Tab, 'isLoading' | 'id'>) => {
        const updatedTabIndex = tabs.findIndex((currentTab) => currentTab.id === tab.id);
        tabs[updatedTabIndex] = {...tabs[updatedTabIndex], ...tab};
    }
    const closeTab = ({ id }: Tab) => {
        window.electronAPI.closeTab(id)
        const deletedTabIndex = tabs.findIndex((currentTab) => currentTab.id === id);
        const deletedTab = tabs.splice(deletedTabIndex, 1);
        deletedTabs.push(...deletedTab);
        if (!tabs.length) return
        const newActiveTabIndex = deletedTabIndex === 0 ? 0 : deletedTabIndex - 1;
        setActiveTab(tabs[newActiveTabIndex]);
    }
    const setUrl = (url: string) => {
        const updatedTab = { ...activeTab.value, url }
        updateTab(updatedTab)
        window.electronAPI.setUrlToActiveTab(url)
    }
    const recoverLastTab = () => {
        if (!deletedTabs.length) return
        const recoveredTab = deletedTabs.pop();
        console.log({recoveredTab});
        addNewTab(recoveredTab)
        if (recoveredTab.url) setUrl(recoveredTab.url)
    }

    const updateFrameCoords = (coords: DOMRect) => {
        window.electronAPI.resizeRenderedTab({
            x: Math.floor(coords.x),
            y: Math.floor(coords.y),
            width: Math.floor(coords.width),
            height: Math.floor(coords.height),
        })
    }


    window.electronAPI.emitter.on(ElectronEmittingKeys.openNewTab, (url: string) => {
        addNewTab();
        if (url) setUrl(url);
    })
    window.electronAPI.emitter.on(ElectronEmittingKeys.updateTab, (data: UpdateTabPayload) => {  
        updateTab({
            id: data.id,
            title: data.title,
            url: data.url,
            canBack: data.canBack,
            canForward: data.canForward,
        })
    })
    window.electronAPI.emitter.on(ElectronEmittingKeys.updateTabLoading, (data: UpdateTabLoadingPayload) => {  
        updateTabLoading({
            id: data.id,
            isLoading: data.isLoading,   
        })
    })
    window.electronAPI.emitter.on(ElectronEmittingKeys.closeActiveTab, () => {  
        closeTab(activeTab.value)
    })
    window.electronAPI.emitter.on(ElectronEmittingKeys.recoverLastTab, () => {  
        recoverLastTab()
    })

    return {
        tabs, activeTab,
        setActiveTab, setUrl, addNewTab, closeTab, updateFrameCoords
    }
})

export default initTabs;