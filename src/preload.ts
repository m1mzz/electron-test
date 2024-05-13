// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import {contextBridge, ipcRenderer} from 'electron';
import type { Coords } from './types';
import {  ElectronEmittingKeys, ElectronEvents } from './types';

type Keys = keyof typeof ElectronEmittingKeys
type Handler = (data?: unknown) => void

const eventEmitter = () => {
    const listeners: Record<Keys, Handler[]> = {
        openNewTab: [],
        updateTab: [],
        updateTabLoading: [],
        closeActiveTab: [],
        recoverLastTab: [],
    }

    return {
        on(key: Keys, fn: Handler) {
            listeners[key] = (listeners[key] || []).concat(fn);
        },
        off(key: Keys, fn: Handler) {
            listeners[key] = (listeners[key] || []).filter(f => f !== fn);
        },
        emit(key: Keys, data?: unknown) {
            (listeners[key] || []).forEach(function(fn) {
                fn(data);
            });
        },
    }
}
const emitter = eventEmitter()


ipcRenderer.on(ElectronEmittingKeys.openNewTab, function (event, url) {
    emitter.emit(ElectronEmittingKeys.openNewTab, url)
})
ipcRenderer.on(ElectronEmittingKeys.updateTab, function (event, data) {
    emitter.emit(ElectronEmittingKeys.updateTab, data)
})
ipcRenderer.on(ElectronEmittingKeys.updateTabLoading, function (event, data) {
    emitter.emit(ElectronEmittingKeys.updateTabLoading, data)
})
ipcRenderer.on(ElectronEmittingKeys.closeActiveTab, function () {
    emitter.emit(ElectronEmittingKeys.closeActiveTab)
})
ipcRenderer.on(ElectronEmittingKeys.recoverLastTab, function () {
    emitter.emit(ElectronEmittingKeys.recoverLastTab)
})


  
const API = {
    emitter,
    [ElectronEvents.createTab] (id: number) {
        ipcRenderer.invoke(ElectronEvents.createTab, id);  
    },
    [ElectronEvents.setUrlToActiveTab] (url: string) {
        ipcRenderer.invoke(ElectronEvents.setUrlToActiveTab, url);
    },
    [ElectronEvents.setActiveTab] (id: number) {
        ipcRenderer.invoke(ElectronEvents.setActiveTab, id);
    },
    [ElectronEvents.closeTab] (id: number) {
        ipcRenderer.invoke(ElectronEvents.closeTab, id);
    },
    [ElectronEvents.resizeRenderedTab] (coords: Coords)  {
        ipcRenderer.invoke(ElectronEvents.resizeRenderedTab, coords);
    },
    [ElectronEvents.navigateBack] ()  {
        ipcRenderer.invoke(ElectronEvents.navigateBack);
    },
    [ElectronEvents.navigateForward] ()  {
        ipcRenderer.invoke(ElectronEvents.navigateForward);
    },
    [ElectronEvents.navigateReload] ()  {
        ipcRenderer.invoke(ElectronEvents.navigateReload);
    },
}

type ElectronApi = typeof API;
declare global {
    interface Window {
        electronAPI: ElectronApi,
    }
}

contextBridge.exposeInMainWorld('electronAPI', API)