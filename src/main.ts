import { app, BrowserWindow, WebContentsView, ipcMain, globalShortcut } from 'electron';
import path from 'path';
import type { Coords, Tab, UpdateTabPayload, UpdateTabLoadingPayload } from './types'
import { ElectronEvents, ElectronEmittingKeys } from './types';
import { urlTransformer } from './urlHelpers';
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  const defaultCoords: Coords = { x: 0, y: 150, width: 100, height: 100 };
  let activeTabCoords: Coords = defaultCoords;
  const tabs: Tab[] = [];
  let activeTab: WebContentsView;
  let activeTabId: number;
  
  

  const createTab = (id: number) => {
    const tab = new WebContentsView();
    mainWindow.contentView.addChildView(tab);
    tab.setBounds(activeTabCoords);
    tabs.push({id, tab});
    setActiveTab(id);
    initPreventOpenNewWindow(tab);
    addListeners({id, tab})
  }
  const setUrlToActiveTab = (url: string) => {
    activeTab.webContents.loadURL(urlTransformer(url));
  }
  const setActiveTab = (id: number) => {
    if (activeTab && (activeTabId !== id)) {
      activeTab.setVisible(false);
    }
    activeTab = tabs.find((tab) => tab.id === id).tab
    activeTab.setVisible(true);
    activeTab.setBounds(activeTabCoords)
    activeTabId = id

  }

  const closeTab = (id: number) => {
    const closedTabIndex = tabs.findIndex((tab) => tab.id === id);
    const closedTab = tabs[closedTabIndex].tab;
    mainWindow.contentView.removeChildView(closedTab);
    tabs.splice(closedTabIndex, 1);
    if (!tabs.length) app.quit();
  }

  function initPreventOpenNewWindow (tab: WebContentsView) {
    tab.webContents.setWindowOpenHandler((windowEvent) => {
      mainWindow.webContents.send(ElectronEmittingKeys.openNewTab, windowEvent.url);
      return { action: "deny" };
    })
  }

  ipcMain.handle(ElectronEvents.createTab, (event, id: number) => {
    createTab(id)
  });
  ipcMain.handle(ElectronEvents.setUrlToActiveTab, (event, url: string) => {
    setUrlToActiveTab(url);
  });
  ipcMain.handle(ElectronEvents.setActiveTab, (event, id: number) => {
    setActiveTab(id);
  });
  ipcMain.handle(ElectronEvents.closeTab, (event, id: number) => {
    closeTab(id);
  });
  ipcMain.handle(ElectronEvents.resizeRenderedTab, (event, coords: Coords) => {
    activeTabCoords = coords
    activeTab?.setBounds(activeTabCoords)
  });

  // navigation
  ipcMain.handle(ElectronEvents.navigateBack, () => {
    activeTab.webContents.goBack()
  });
  ipcMain.handle(ElectronEvents.navigateForward, () => {
    activeTab.webContents.goForward()
  });
  ipcMain.handle(ElectronEvents.navigateReload, () => {
    activeTab.webContents.reload()
  });

  function addListeners ({tab, id}: Tab) {
    tab.webContents.on('did-start-loading', () => {
      const data: UpdateTabLoadingPayload = { isLoading: true, id }
      mainWindow.webContents.send(ElectronEmittingKeys.updateTabLoading, data);
    })
    tab.webContents.on('did-stop-loading', () => {
      const data: UpdateTabLoadingPayload = { isLoading: false, id }
      mainWindow.webContents.send(ElectronEmittingKeys.updateTabLoading, data);
    })
    tab.webContents.on('did-navigate', () => {
      const data: UpdateTabPayload = {
        canBack: tab.webContents.canGoBack(),
        canForward: tab.webContents.canGoForward(),
        url: tab.webContents.getURL(), 
        title: tab.webContents.getTitle(),
        id,
      }
      mainWindow.webContents.send(ElectronEmittingKeys.updateTab, data);
    })
    tab.webContents.on('did-navigate-in-page', () => {
      const data: UpdateTabPayload = {
        canBack: tab.webContents.canGoBack(),
        canForward: tab.webContents.canGoForward(),
        url: tab.webContents.getURL(), 
        title: tab.webContents.getTitle(),
        id,
      }
      mainWindow.webContents.send(ElectronEmittingKeys.updateTab, data);
    })
  }
};

app.on('browser-window-focus', function () {
  globalShortcut.register("CommandOrControl+W", () => {
    mainWindow.webContents.send(ElectronEmittingKeys.closeActiveTab)
  });
  globalShortcut.register("F5", () => {
    mainWindow.webContents.reload()
  });
  globalShortcut.register("CommandOrControl+T", () => {
    mainWindow.webContents.send(ElectronEmittingKeys.openNewTab, '');
  });
  globalShortcut.register("CommandOrControl+shift+T", () => {
    mainWindow.webContents.send(ElectronEmittingKeys.recoverLastTab)
  });
});
app.on('browser-window-blur', function () {
  globalShortcut.unregister('CommandOrControl+W');
  globalShortcut.unregister('F5');
  globalShortcut.unregister('CommandOrControl+T');
  globalShortcut.unregister('CommandOrControl+shift+T');
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  app.quit();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
