import type { WebContentsView } from 'electron';

export type Coords = { x: number, y: number, width: number, height: number };
export type Tab = {
  id: number,
  tab: WebContentsView,
}

export enum ElectronEmittingKeys {
  openNewTab = 'openNewTab',
  updateTab = 'updateTab',
  updateTabLoading = 'updateTabLoading',
  closeActiveTab = 'closeActiveTab',
  recoverLastTab = 'recoverLastTab',
}
export enum ElectronEvents {
  createTab = 'createTab',
  setUrlToActiveTab = 'setUrlToActiveTab',
  setActiveTab = 'setActiveTab',
  closeTab = 'closeTab',
  resizeRenderedTab = 'resizeRenderedTab',
  navigateBack = 'navigateBack',
  navigateForward = 'navigateForward',
  navigateReload = 'navigateReload',
}

export type UpdateTabPayload = {
  canBack: boolean,
  canForward: boolean,
  url: string, 
  title: string,
  id: number,
}
export type UpdateTabLoadingPayload = {
  id: number,
  isLoading: boolean,
}