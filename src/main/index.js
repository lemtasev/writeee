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

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

let wteeWindows = {
  welcomeWindow: null,
  mainWindow: null,
  settingWin: null,
  searchWin: null
}

function createWelcomeWindow () {
  wteeWindows.welcomeWindow = new BrowserWindow({
    title: 'Welcome to Writee',
    resizable: process.env.NODE_ENV === 'development',
    maximizable: false,
    useContentSize: true,
    width: 777,
    height: 460
  })
  wteeWindows.welcomeWindow.loadURL(winURL + '#Welcome')
  wteeWindows.welcomeWindow.on('closed', () => {
    wteeWindows.welcomeWindow = null
  })
}

function createWindow () {
  wteeWindows.mainWindow = new BrowserWindow({
    title: 'Writee',
    // transparent: true, // 透明
    titleBarStyle: 'hiddenInset', // 无工具栏，但是有红绿灯，hidden边距小，hiddenInset边距大
    // frame: false, // 无边框、工具栏
    // backgroundColor: '#000',
    // alwaysOnTop: true, // 永远置顶，没看到效果？
    // webPreferences: {experimentalFeatures: true}, // 开启chrome试验功能
    useContentSize: true,
    width: 1024,
    height: 768
  })
  wteeWindows.mainWindow.loadURL(winURL)
  wteeWindows.mainWindow.on('closed', () => {
    wteeWindows.mainWindow = null
  })
}

function reloadAllWindows () {
  Object.values(wteeWindows).forEach(it => {
    if (it != null) {
      it.reload()
    }
  })
}

function openWorkspace (workspace) {
  if (!workspace) {
    let ret = dialog.showOpenDialog(wteeWindows.mainWindow, {
      defaultPath: '~',
      properties: ['openDirectory']
    })
    if (!ret) return
    workspace = ret[0]
  }
  global.sharedObject.workspace = workspace
  // mainWindow.reload()
  reloadAllWindows()
}

// ==========构建菜单==========
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
        // mainWindow.reload()
        reloadAllWindows()
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
            if (wteeWindows.settingWin != null) {
              wteeWindows.settingWin.show() // 展示并且使窗口获得焦点.
              return
            }
            wteeWindows.settingWin = new BrowserWindow({
              // modal: true,
              alwaysOnTop: true,
              show: false,
              parent: wteeWindows.mainWindow
            })
            wteeWindows.settingWin.loadURL(winURL + '#Setting')
            wteeWindows.settingWin.once('ready-to-show', () => {
              wteeWindows.settingWin.show()
            })
            wteeWindows.settingWin.on('closed', () => {
              wteeWindows.settingWin = null
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
            openWorkspace()
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
            if (wteeWindows.searchWin != null) {
              wteeWindows.searchWin.show() // 展示并且使窗口获得焦点.
              return
            }
            wteeWindows.searchWin = new BrowserWindow({
              title: '搜索',
              frame: false,
              alwaysOnTop: true,
              minimizable: false,
              maximizable: false,
              // show: false,
              parent: wteeWindows.mainWindow,
              height: 800,
              width: 800
            })
            wteeWindows.searchWin.loadURL(winURL + '#Search')
            wteeWindows.searchWin.once('ready-to-show', () => {
              // searchWin.show()
            })
            wteeWindows.searchWin.on('show', (e) => {
            })
            wteeWindows.searchWin.on('blur', (e) => {
              wteeWindows.searchWin.hide()
              // searchWin.close()
            })
            wteeWindows.searchWin.on('close', (e) => {
              // searchWin.hide()
              // e.preventDefault()
            })
            wteeWindows.searchWin.on('closed', () => {
              wteeWindows.searchWin = null
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

// ==========构建菜单==========

// ==========app事件监听==========
app.on('open-file', (e, path) => {
  console.log('open-file')
  console.log(e)
  console.log(path)
})

app.on('ready', () => {
  // createMenu()
  createWelcomeWindow()
  // createWindow()
})

app.on('activate', () => {
  if (wteeWindows.mainWindow === null && wteeWindows.welcomeWindow === null) {
    createWelcomeWindow()
    createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
// ==========app事件监听==========

// ==========ipc事件定义==========
// 刷新系统菜单
ipcMain.on('refresh-app-menu', (event, openRecentSubmenuLi) => {
  createMenu({openRecentSubmenuLi: openRecentSubmenuLi})
})
// 打开工作空间
ipcMain.on('open-workspace', (event, args) => {
  console.log('on open-workspace', args)
  openWorkspace(args)
})
// ==========ipc事件定义==========

// 设置Dock小红点
// app.setBadgeCount(app.getBadgeCount() + 9)

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
