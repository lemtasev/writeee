// import db from '@/datastore'
import fs from 'fs'

// 排序类型枚举
const sortModeEnum = {
  TITLE: 'title',
  FILE_TYPE: 'fileType',
  CREATE_TIME: 'createTime',
  UPDATE_TIME: 'updateTime',
  LATEST_ACCESSED_TIME: 'latestAccessedTime',
  SIZE: 'size'
}
let sortMode = sortModeEnum.TITLE

// 文件类型枚举
const fileTypeEnum = {
  DIR: 'directory', // 目录
  CHAPTER: 'chapter', // 章节
  IMG: 'image', // 图片
  CHARACTER: 'character', // 人物
  SECT: 'sect', // 门派
  SKILL: 'skill', // 技能
  PLACE: 'place', // 地点
  PROP: 'prop', // 道具
  MONSTER: 'monster', // 妖怪
  OUTLINE: 'outline', // 大纲
  REFERENCE: 'reference', // 引用
  UNKNOWN: 'unknown' // 未知
}

// 系统搜索结果菜单
// const sysSearchResMenu = {_id: '搜索结果', title: '搜索结果', type: menuTypeEnum.SYSTEM, isFolder: false, isActive: false}

// 系统素材菜单
// const sysSourceMenu = [
//   {_id: '大纲', title: '大纲', type: menuTypeEnum.SYSTEM, parent: '-', isFolder: true, isOpen: false, isActive: false},
//   {
//     _id: '资料',
//     title: '资料',
//     type: menuTypeEnum.SYSTEM,
//     parent: '-',
//     isFolder: true,
//     isOpen: false,
//     isActive: false,
//     hasChild: true,
//     children: [
//       {_id: '地点', title: '地点', type: menuTypeEnum.SYSTEM, parent: '资料', isFolder: true, isOpen: false, isActive: false},
//       {_id: '人物', title: '人物', type: menuTypeEnum.SYSTEM, parent: '资料', isFolder: true, isOpen: false, isActive: false},
//       {_id: '门派', title: '门派', type: menuTypeEnum.SYSTEM, parent: '资料', isFolder: true, isOpen: false, isActive: false},
//       {_id: '道具', title: '道具', type: menuTypeEnum.SYSTEM, parent: '资料', isFolder: true, isOpen: false, isActive: false},
//       {_id: '妖怪', title: '妖怪', type: menuTypeEnum.SYSTEM, parent: '资料', isFolder: true, isOpen: false, isActive: false},
//       {_id: '招式心法', title: '招式心法', type: menuTypeEnum.SYSTEM, parent: '资料', isFolder: true, isOpen: false, isActive: false},
//       {_id: '引用', title: '引用', type: menuTypeEnum.SYSTEM, parent: '资料', isFolder: true, isOpen: false, isActive: false}
//     ]
//   }
// ]

// 用户编辑默认菜单
// const defaultBookDirectory = {table: table, bookId: null, title: '第一卷', type: menuTypeEnum.USER, parent: '-', isFolder: true, isOpen: false, isActive: false}

export default {

  // menuTypeEnum: menuTypeEnum,
  fileTypeEnum: fileTypeEnum,

  // sysSearchResMenu: sysSearchResMenu,
  // sysSourceMenu: sysSourceMenu,

  sortMode: sortMode,

  findFiles: (path) => {
    return new Promise((resolve, reject) => {
      if (!path) reject(new Error('参数错误'))
      let t1 = new Date().getTime()
      fs.readdir(path, function (err, files) {
        let t2 = new Date().getTime()
        if (err) {
          console.error('err', err)
          reject(err)
        }
        let ret = []
        files.forEach(fileName => {
          if (fileName.charAt(0) === '.') {
            // 过滤隐藏文件
            return
          }
          let lastIndexOfPoint = fileName.lastIndexOf('.')
          let title = lastIndexOfPoint < 0 ? fileName : fileName.substring(0, lastIndexOfPoint)
          let suffix = lastIndexOfPoint < 0 ? '' : fileName.substring(lastIndexOfPoint + 1)
          let wteeFile = {
            title: title,
            fileName: fileName,
            suffix: suffix,
            path: path + '/' + fileName
          }
          let stats = fs.statSync(wteeFile.path)
          wteeFile.fileType = stats.isDirectory() ? fileTypeEnum.DIR : getFileType(suffix)
          wteeFile.createTime = stats.birthtimeMs // 创建时间
          wteeFile.updateTime = stats.mtimeMs // 上次修改此文件的时间
          wteeFile.latestAccessedTime = stats.atimeMs // 上次访问此文件的时间戳
          wteeFile.size = stats.size // 文件大小
          wteeFile.blksize = stats.blksize // 用于 I/O 操作的文件系统块的大小。
          if (wteeFile.fileType === fileTypeEnum.DIR) wteeFile.hasChild = hasChild(wteeFile)
          ret.push(wteeFile)
        })
        // 排序
        switch (sortMode) {
          case sortModeEnum.TITLE:
            console.log('排序：标题')
            ret.sort((a, b) => {
              return a.title > b.title
            })
            break
          case sortModeEnum.FILE_TYPE:
            console.log('排序：文件类型')
            ret.sort((a, b) => {
              return a.fileType > b.fileType
            })
            break
          case sortModeEnum.CREATE_TIME:
            console.log('排序：创建时间')
            ret.sort((a, b) => {
              return a.createTime > b.createTime
            })
            break
          case sortModeEnum.UPDATE_TIME:
            console.log('排序：更新时间')
            ret.sort((a, b) => {
              return a.updateTime > b.updateTime
            })
            break
          case sortModeEnum.LATEST_ACCESSED_TIME:
            console.log('排序：最新访问时间')
            ret.sort((a, b) => {
              return a.latestAccessedTime > b.latestAccessedTime
            })
            break
          case sortModeEnum.SIZE:
            console.log('排序：大小')
            ret.sort((a, b) => {
              return a.size > b.size
            })
            break
        }
        console.log('异步read【' + path + '】耗时：', (t2 - t1))
        resolve(ret)
      })
    })
  },

  readFile: (path) => {
    return new Promise((resolve, reject) => {
      if (!path) reject(new Error('参数错误'))
      fs.readFile(path, function (err, data) {
        if (err) {
          console.error('err', err)
          reject(err)
        }
        resolve(data.toString())
      })
    })
  },

  readFileSync: (path) => {
    return fs.readFileSync(path).toString()
  },

  saveFile: (wteeFile, content) => {
    return new Promise((resolve, reject) => {
      if (!wteeFile) reject(new Error('参数错误'))
      console.log('准备写入文件')
      fs.writeFile(wteeFile.path, content, function (err) {
        if (err) {
          console.error('err', err)
          reject(err)
        }
        console.log('数据写入成功！')
        console.log('--------我是分割线-------------')
        resolve()
      })
    })
  },

  renameFile: (wteeFile) => {
    return new Promise((resolve, reject) => {
      if (!wteeFile) reject(new Error('参数错误'))
      let oldPath = wteeFile.path
      let newPath = oldPath.substring(0, oldPath.lastIndexOf('/') + 1) + wteeFile.title + (wteeFile.suffix ? '.' + wteeFile.suffix : '')
      wteeFile.path = newPath
      console.log('准备改名')
      console.log(oldPath)
      console.log(newPath)
      fs.rename(oldPath, newPath, function (err) {
        if (err) {
          console.error('err', err)
          reject(err)
        }
        console.log('改名成功！')
        console.log('--------我是分割线-------------')
        resolve()
      })
    })
  },

  /**
   * 检查【路径】是否存在
   * @param path
   * @returns {boolean | *}
   */
  existsPath: (path) => {
    return fs.existsSync(path)
  },

  mkdirSync: (path) => {
    return fs.mkdirSync(path, {
      recursive: true
    })
  }
}

function getFileType (suffix) {
  return suffix === fileTypeEnum.CHAPTER ? fileTypeEnum.CHAPTER
    : suffix === fileTypeEnum.IMG ? fileTypeEnum.IMG
      : suffix === fileTypeEnum.CHARACTER ? fileTypeEnum.CHARACTER
        : suffix === fileTypeEnum.SECT ? fileTypeEnum.SECT
          : suffix === fileTypeEnum.SKILL ? fileTypeEnum.SKILL
            : suffix === fileTypeEnum.PLACE ? fileTypeEnum.PLACE
              : suffix === fileTypeEnum.PROP ? fileTypeEnum.PROP
                : suffix === fileTypeEnum.MONSTER ? fileTypeEnum.MONSTER
                  : suffix === fileTypeEnum.OUTLINE ? fileTypeEnum.OUTLINE
                    : suffix === fileTypeEnum.REFERENCE ? fileTypeEnum.REFERENCE
                      : fileTypeEnum.UNKNOWN
}

function hasChild (file) {
  let li = fs.readdirSync(file.path)
  if (li && li.length > 0) {
    return true
  }
  return false
}
