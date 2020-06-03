'use strict'

// import { app, BrowserWindow, Menu, Tray, clipboard, nativeImage, MenuItem, ipcMain } from 'electron'
import { app, BrowserWindow, Menu, dialog } from 'electron'
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

let settingWin
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

  settingWin = new BrowserWindow({
    // modal: true,
    alwaysOnTop: true,
    show: false,
    parent: mainWindow
  })
  settingWin.loadURL(winURL + '#Setting')
  settingWin.once('ready-to-show', () => {
    // settingWin.show()
  })
  settingWin.on('closed', () => {
    settingWin = null
  })
  Menu.setApplicationMenu(Menu.buildFromTemplate(systemMenuJson))
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

// ==========构建系统菜单==========
const isMac = process.platform === 'darwin'
let systemMenuJson = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      {
        label: '检查更新……',
        // accelerator: 'CmdOrCtrl+R',
        click: function () {
          dialog.showMessageBox({
            message: '怎么肯能有这种功能?',
            type: 'warning' // "none", "info", "error", "question" 或者 "warning"
          })
        }
      },
      { type: 'separator' },
      {
        label: '偏好设置',
        // accelerator: 'CmdOrCtrl+R',
        click: function () {
          settingWin.show()
        }
      },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: '文件',
    submenu: [
      {
        label: '新建',
        submenu: [
          {
            label: '章'
            // icon: '/'
            // sublabel: 'hahaha'
          },
          {
            label: '卷'
          },
          {
            label: '书'
          },
          { type: 'separator' },
          {
            label: '人物'
          },
          {
            label: '物品'
          }
        ]
      },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: '编辑',
    submenu: [
      {
        label: '撤销',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: '视图',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: '窗口',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: '帮助',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]
// ==========构建系统菜单==========

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
