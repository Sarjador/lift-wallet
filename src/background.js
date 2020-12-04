'use strict'

import { spawn } from 'child_process'
import path from 'path'
import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { cardanoPath,cardanoNodeOptions, walletServeOptions } from './util-cardano'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

///Cardano Operations
let cnode = null;
let walletApi = null;

ipcMain.on('req:start-cnode', (event, args) => {
  cnode = spawn(path.resolve('.', cardanoPath, 'mac', 'cardano-node'), ['run',...cardanoNodeOptions])
  //walletApi = spawn()
  //cnode = spawn(args, []);
  //export CARDANO_NODE_SOCKET_PATH=/Users/kylejohns/Perdix/perdix-app/cardano/socket && ./cardano-wallet serve --mainnet --node-socket /Users/kylejohns/Perdix/perdix-app/cardano/socket
  cnode.stderr
  event.reply('res:start-cnode', cnode.pid);
  // cnode.stdout.on('data', (data) => {
  //   console.log(data.toString('ascii'));
  //   event.reply('res:start-cnode', data.toString('ascii'));
  // });
  cnode.stdout.on('data', (data) => {
    console.info(`stdout: ${data}`);
  });

  cnode.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
})

ipcMain.on('generate-recovery-phrase', (event, args) => {

})

ipcMain.on('create-wallet', (event, args) => {

})

ipcMain.on('get-wallet', (event, args) => {

})

ipcMain.on('get-address', (event, args) => {

})

ipcMain.on('get-fee', (event, args) => {

})

ipcMain.on('send-transaction', (event, args) => {

})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}


app.on('quit', () => {
  cnode.kill();
})