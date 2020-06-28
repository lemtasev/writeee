import {ipcRenderer} from 'electron'
import systemService from '@/service/SystemService'

/**
 * 查询历史记录
 * @returns {*}
 */
export function getOpenHistory () {
  return new Promise((resolve, reject) => {
    systemService.findOpenHistory().then(ret => {
      resolve(ret[0].value)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 删除历史记录
 * @param path
 */
export function deleteOpenHistory (path) {
  systemService.findOpenHistory().then(ret => {
    let li = []
    if (ret && ret.length > 0) {
      li = ret[0].value
    }
    if (li.includes(path)) {
      li.splice(li.indexOf(path), 1)
    }
    return systemService.saveOpenHistory(li)
  }).then(ret => {
    console.log('==========saveUserSetting==========', ret)
  })
}

/**
 * 保存历史记录
 * @param path
 * @returns {Promise<void>}
 */
export async function saveOpenHistory (path) {
  let ret = await systemService.findOpenHistory()
  let li = []
  if (ret && ret.length > 0) {
    li = ret[0].value
  }
  if (li.includes(path)) {
    li.splice(li.indexOf(path), 1)
  }
  if (li.length >= 20) {
    li.splice(0, 1)
  }
  li.push(path)
  updateOpenHistoryMenu(li)
  systemService.saveOpenHistory(li)
}

/**
 * 获取最近一条记录
 * @returns {Promise<string>}
 */
export async function getLatestOpenHistory () {
  let workspace = ''
  let ret = await systemService.findOpenHistory()
  let li = []
  if (ret && ret.length > 0) {
    li = ret[0].value
  }
  if (li && li.length > 0) {
    workspace = li[li.length - 1]
  }
  return workspace
}

function updateOpenHistoryMenu (li) {
  ipcRenderer.send('refresh-app-menu', {openRecentSubmenuLi: li})
}
