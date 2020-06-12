'use strict'

// import { app, BrowserWindow, Menu, Tray, clipboard, nativeImage, MenuItem, ipcMain } from 'electron'
import {app, BrowserWindow, Menu, dialog, ipcMain} from 'electron'
import path from 'path'
import './sharedObject'
import systemService from './SystemService'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let settingWin
let searchWin

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
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
}

async function createMenu (opt) {
  // ==========构建系统菜单==========
  const isMac = process.platform === 'darwin'
  let openRecentSubmenuLi = []
  if (opt && opt.openRecentSubmenuLi) {
    openRecentSubmenuLi = opt.openRecentSubmenuLi
  } else {
    let ret = await systemService.findOpenHistory()
    if (ret && ret.length > 0) {
      openRecentSubmenuLi = ret[0].value
    }
  }
  let openRecentSubmenu = []
  openRecentSubmenuLi.reverse().forEach(it => {
    openRecentSubmenu.push({
      label: it,
      click: function () {
        global.sharedObject.workspace = it
        mainWindow.reload()
      }
    })
  })
  let systemMenuJson = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        {role: 'about'},
        {
          label: '检查更新……',
          // accelerator: 'CmdOrCtrl+R',
          click: function () {
            dialog.showMessageBox({
              message: '怎么可能有这种功能?',
              type: 'warning' // "none", "info", "error", "question" 或者 "warning"
            })
          }
        },
        {type: 'separator'},
        {
          label: '偏好设置',
          // accelerator: 'CmdOrCtrl+R',
          click: function () {
            if (settingWin != null) {
              settingWin.show() // 展示并且使窗口获得焦点.
              return
            }
            settingWin = new BrowserWindow({
              // modal: true,
              alwaysOnTop: true,
              show: false,
              parent: mainWindow
            })
            settingWin.loadURL(winURL + '#Setting')
            settingWin.once('ready-to-show', () => {
              settingWin.show()
            })
            settingWin.on('closed', () => {
              settingWin = null
            })
          }
        },
        {type: 'separator'},
        {role: 'services'},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    }] : []),
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
            {type: 'separator'},
            {
              label: '人物'
            },
            {
              label: '物品'
            }
          ]
        },
        {
          label: '打开',
          click: function () {
            let ret = dialog.showOpenDialog(mainWindow, {
              defaultPath: '~',
              properties: ['openDirectory']
            })
            if (!ret) return
            global.sharedObject.workspace = ret[0]
            mainWindow.reload()
          }
        },
        {
          label: '最近打开',
          submenu: openRecentSubmenu
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '搜索',
          accelerator: 'Ctrl+Shift+F',
          click: function () {
            if (searchWin != null) {
              searchWin.show() // 展示并且使窗口获得焦点.
              return
            }
            searchWin = new BrowserWindow({
              title: '搜索',
              frame: false,
              alwaysOnTop: true,
              minimizable: false,
              maximizable: false,
              // show: false,
              parent: mainWindow,
              height: 800,
              width: 800
            })
            searchWin.loadURL(winURL + '#Search')
            searchWin.once('ready-to-show', () => {
              // searchWin.show()
            })
            searchWin.on('blur', (e) => {
              searchWin.hide()
            })
            searchWin.on('close', (e) => {
              // searchWin.hide()
              // e.preventDefault()
            })
            searchWin.on('closed', () => {
              searchWin = null
            })
          }
        },
        {type: 'separator'},
        {
          label: '撤销',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        ...(isMac ? [
          {role: 'pasteAndMatchStyle'},
          {role: 'delete'},
          {role: 'selectAll'},
          {type: 'separator'},
          {
            label: 'Speech',
            submenu: [
              {role: 'startspeaking'},
              {role: 'stopspeaking'}
            ]
          }
        ] : [
          {role: 'delete'},
          {type: 'separator'},
          {role: 'selectAll'}
        ])
      ]
    },
    {
      label: '视图',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    {
      label: '窗口',
      submenu: [
        {role: 'minimize'},
        {role: 'zoom'},
        ...(isMac ? [
          {type: 'separator'},
          {role: 'front'},
          {type: 'separator'},
          {role: 'window'}
        ] : [
          {role: 'close'}
        ])
      ]
    },
    {
      role: '帮助',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const {shell} = require('electron')
            await shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }
  ]
  // ==========构建系统菜单==========
  Menu.setApplicationMenu(Menu.buildFromTemplate(systemMenuJson))
}

app.on('ready', () => {
  createMenu()
  createWindow()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ==========ipc事件定义==========
ipcMain.on('refresh-app-menu', (event, openRecentSubmenuLi) => {
  createMenu({openRecentSubmenuLi: openRecentSubmenuLi})
})
// ==========ipc事件定义==========

// 设置Dock小红点
// app.setBadgeCount(app.getBadgeCount() + 9)

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
