'use strict'

// import { app, BrowserWindow, Menu, Tray, clipboard, nativeImage, Menu, MenuItem, ipcMain } from 'electron'
import { app, BrowserWindow } from 'electron'
import path from 'path'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    transparent: true, // 透明
    titleBarStyle: 'hiddenInset', // 无工具栏，但是有红绿灯，hidden边距小，hiddenInset边距大
    // frame: false, // 无边框、工具栏
    // backgroundColor: '#000',
    // alwaysOnTop: true, // 永远置顶，没看到效果？
    // webPreferences: {experimentalFeatures: true}, // 开启chrome试验功能
    useContentSize: true,
    height: 768,
    width: 1366
  })
  mainWindow.loadURL(winURL)
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // let child = new BrowserWindow({
  //   // modal: true,
  //   show: false,
  //   parent: mainWindow
  // })
  // child.loadURL('https://github.com')
  // child.once('ready-to-show', () => {
  //   child.show()
  // })
}

// let tray
// function createTrayMenu () {
//   // todo 有问题，不加载图片
//   console.log('createTrayMenu')
//   // tray = new Tray('/Users/yangqi/Pictures/cbotmazjsv.jpg')
//   let p = path.join(__dirname, '/static')
//   p = path.join(p, 'icon.jpg')
//   let icon = nativeImage.createFromPath(p)
//   console.log('p:', p)
//   console.log('icon:', icon)
//   tray = new Tray(icon)
//   const contextMenu = Menu.buildFromTemplate([
//     { label: 'Item1', type: 'radio' },
//     { label: 'Item2', type: 'radio' },
//     { label: 'Item3', type: 'radio', checked: true },
//     { label: 'Item4', type: 'radio' }
//   ])
//   tray.setToolTip('This is my application.')
//   tray.setContextMenu(contextMenu)
// }

// function test () {
//   const text = clipboard.readText()
//   if (text) {
//     console.log('clipboard:', text)
//   } else {
//     clipboard.writeText('write by electron')
//     console.log('已写入剪切板！')
//   }
// }

// 查看app相关路径
console.log('appData:', app.getPath('appData'))
// 设置Dock小红点
// app.setBadgeCount(app.getBadgeCount() + 9)

app.on('ready', () => {
  createWindow()
  // createTrayMenu()
  // test()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
  // if (tray === null) {
  //   // createTrayMenu()
  // }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ==========构建菜单==========
// const menu = new Menu()
// menu.append(new MenuItem({
//   label: 'aaa',
//   type: 'checkbox',
//   checked: true,
//   click: () => {
//     console.log('aaa is clicked')
//   }
// }))
// menu.append(new MenuItem({ type: 'separator' }))
// menu.append(new MenuItem({ label: 'selectall', role: 'selectall' }))
// menu.append(new MenuItem({ label: 'copy', role: 'copy' }))
// ipcMain.on('show-context-menu', (event) => {
//   const win = BrowserWindow.fromWebContents(event.sender)
//   menu.popup(win)
// })
// ==========构建菜单==========
// ==========构建菜单：调用方式==========
// 渲染进程
// ipcRenderer.send('show-context-menu')
// ==========构建菜单：调用方式==========

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
