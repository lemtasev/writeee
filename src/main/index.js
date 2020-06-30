'use strict'

import {app, BrowserWindow, Menu, dialog, ipcMain} from 'electron'
import path from 'path'
import './sharedObject'
// import systemService from './SystemService'

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

let initWindow = null
let welcomeWindow = null
let mainWindow = null

/**
 * 初始化窗口
 * @param callback
 */
function openInitWindow () {
  if (initWindow != null) {
    initWindow.show()
    return
  }
  initWindow = new BrowserWindow({
    title: 'Init',
    backgroundColor: '#2e2c29',
    resizable: process.env.NODE_ENV === 'development',
    transparent: true, // 透明
    frame: false, // 无边框、工具栏
    useContentSize: true,
    show: false,
    width: 700,
    height: 200,
    webPreferences: {
      nodeIntegration: true // 在网页中集成Node
    }
  })
  initWindow.loadURL(winURL + '#Init')
  initWindow.once('ready-to-show', () => {
    initWindow.show()
  })
  initWindow.on('show', () => {
    initWindow.webContents.executeJavaScript('this.vueCmp && this.vueCmp.onShow && this.vueCmp.onShow()')
  })
  initWindow.on('closed', () => {
    initWindow = null
  })
}

/**
 * 打开欢迎窗口
 */
function openWelcomeWindow () {
  if (welcomeWindow != null) {
    welcomeWindow.show()
    return
  }
  createWelcomeWindow()
}

/**
 * 创建欢迎窗口
 * @param callback
 */
function createWelcomeWindow () {
  welcomeWindow = new BrowserWindow({
    title: 'Welcome to Writee',
    backgroundColor: '#2e2c29',
    resizable: process.env.NODE_ENV === 'development',
    maximizable: false,
    useContentSize: true,
    show: false,
    width: 777,
    height: 460,
    webPreferences: {
      nodeIntegration: true // 在网页中集成Node
    }
  })
  welcomeWindow.loadURL(winURL + '#Welcome')
  welcomeWindow.once('ready-to-show', () => {
    welcomeWindow.show()
  })
  welcomeWindow.on('show', () => {
    welcomeWindow.webContents.executeJavaScript('this.vueCmp && this.vueCmp.onShow && this.vueCmp.onShow()')
  })
  welcomeWindow.on('close', (event) => {
    // welcomeWindow.hide()
    // event.preventDefault()
  })
  welcomeWindow.on('closed', () => {
    welcomeWindow = null
  })
}

/**
 * 打开主窗口
 */
function openMainWindow () {
  if (mainWindow != null) {
    mainWindow.show()
    return
  }
  createMainWindow()
}

/**
 * 创建主窗口
 * @param callback
 */
function createMainWindow () {
  mainWindow = new BrowserWindow({
    title: 'Writee',
    // transparent: true, // 透明
    titleBarStyle: 'hiddenInset', // 无工具栏，但是有红绿灯，hidden边距小，hiddenInset边距大
    // frame: false, // 无边框、工具栏
    backgroundColor: '#2e2c29',
    // alwaysOnTop: true, // 永远置顶
    useContentSize: true,
    show: false,
    width: 1024,
    height: 768,
    minWidth: 333,
    minHeight: 222,
    webPreferences: {
      // experimentalFeatures: true, // 开启chrome试验功能
      nodeIntegration: true // 在网页中集成Node
    }
  })
  mainWindow.loadURL(winURL)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.on('show', () => {
    mainWindow.webContents.executeJavaScript('this.vueCmp && this.vueCmp.onShow && this.vueCmp.onShow()')
  })
  mainWindow.on('resize', () => {
  })
  mainWindow.on('close', () => {
    openWelcomeWindow()
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function showOpen () {
  let ret = dialog.showOpenDialogSync(mainWindow, {
    defaultPath: '~',
    properties: ['openDirectory']
  })
  if (!ret) return
  global.sharedObject.workspace = ret[0]
  if (mainWindow != null) {
    mainWindow.reload()
  } else {
    openMainWindow()
  }
  if (welcomeWindow != null) {
    welcomeWindow.hide()
  }
}

// ==========构建菜单==========
async function createMenu (opt) {
  const isMac = process.platform === 'darwin'
  const original = opt && opt.original
  let openRecentSubmenu = []
  if (opt && opt.openRecentSubmenuLi) {
    opt.openRecentSubmenuLi.reverse().forEach(it => {
      openRecentSubmenu.push({
        label: it,
        click: function () {
          global.sharedObject.workspace = it
          if (mainWindow != null) {
            mainWindow.reload()
          } else {
            openMainWindow()
          }
          // reloadAllWindows()
        }
      })
    })
  }
  let systemMenuJson = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        {role: 'about'},
        {
          label: '检查更新……',
          // accelerator: 'CmdOrCtrl+R',
          click: function () {
            dialog.showMessageBoxSync({
              message: '怎么可能有这种功能?',
              type: 'warning' // "none", "info", "error", "question", "warning"
            })
          }
        },
        {type: 'separator'},
        {
          label: '偏好设置',
          // accelerator: 'CmdOrCtrl+R',
          click: function () {
            // openSettingWin()
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
    ...(original ? []
      : [
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
                showOpen()
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
                // openSearchWindow()
                mainWindow.webContents.executeJavaScript('this.vueCmp.openSearchPage()')
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
    )
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(systemMenuJson))
}

// ==========构建菜单==========

// ==========app事件监听==========
app.on('ready', () => {
  openInitWindow()
})
app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
  app.quit()
})
app.on('open-file', (e, path) => {
  console.log('app on [open-file]')
  console.log(e)
  console.log(path)
})
app.on('activate', () => {
  if (mainWindow !== null) {
    openMainWindow()
  } else {
    openWelcomeWindow()
  }
})
// ==========app事件监听==========

// ==========ipc事件定义==========
// 刷新系统菜单
ipcMain.on('refresh-app-menu', (event, args) => {
  createMenu(args)
})
// 选择目录，打开工作空间
ipcMain.on('show-open', (event, args) => {
  showOpen()
})
// 打开指定工作空间
ipcMain.on('open-workspace', (event, args) => {
  openMainWindow()
  global.sharedObject.workspace = args
})
// 打开welcome页面
ipcMain.on('open-welcome-window', (event, args) => {
  openWelcomeWindow()
})
// 打开主页面
ipcMain.on('open-main-window', (event, args) => {
  openMainWindow()
})
// ==========ipc事件定义==========

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
