// import db from '@/datastore'
import fs from 'fs'

const table = 'file'

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

// 菜单类型枚举：系统菜单、用户菜单
const menuTypeEnum = {
  SYSTEM: 'system',
  USER: 'user'
}

// 文件类型枚举
const fileTypeEnum = {
  DIR: 'directory',
  NORMAL: 'normal',
  IMG: 'image',
  UNKNOWN: 'unknown'
}

// 系统搜索结果菜单
const sysSearchResMenu = {_id: '搜索结果', title: '搜索结果', type: menuTypeEnum.SYSTEM, isFolder: false, isActive: false}

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

  menuTypeEnum: menuTypeEnum,
  fileTypeEnum: fileTypeEnum,

  sysSearchResMenu: sysSearchResMenu,
  // sysSourceMenu: sysSourceMenu,

  table: table,
  sortMode: sortMode,

  findFiles: (path) => {
    return new Promise((resolve, reject) => {
      if (!path) reject(new Error('参数错误'))
      console.log('查看', path, '目录')
      let t1 = new Date().getTime()
      fs.readdir(path, function (err, files) {
        let t2 = new Date().getTime()
        if (err) {
          console.error('err', err)
          reject(err)
        }
        let ret = []
        files.forEach(file => {
          if (file.charAt(0) === '.') {
            return
          }
          console.log(file)
          let wteeFile = {
            title: file,
            path: path + '/' + file,
            type: menuTypeEnum.USER
          }
          let stats = fs.statSync(wteeFile.path)
          wteeFile.fileType = stats.isDirectory() ? fileTypeEnum.DIR : fileTypeEnum.NORMAL
          wteeFile.createTime = stats.birthtimeMs // 创建时间
          wteeFile.updateTime = stats.mtimeMs // 上次修改此文件的时间
          wteeFile.latestAccessedTime = stats.atimeMs // 上次访问此文件的时间戳
          wteeFile.size = stats.size // 文件大小
          wteeFile.blksize = stats.blksize // 用于 I/O 操作的文件系统块的大小。
          if (wteeFile.fileType === fileTypeEnum.DIR) wteeFile.hasChild = hasChild(wteeFile)
          ret.push(wteeFile)
        })
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
        let t3 = new Date().getTime()
        console.log('异步readdir耗时：', (t2 - t1))
        console.log('同步遍历耗时：', (t3 - t2))
        resolve(ret)
      })
    })
  },

  // openFile: (path) => {
  //   return new Promise((resolve, reject) => {
  //     if (!path) reject(new Error('参数错误'))
  //     console.log('准备打开已存在的文件！')
  //     fs.open(path, 'r+', function (err, fd) {
  //       if (err) {
  //         console.error('err', err)
  //         reject(err)
  //       }
  //       console.log('文件打开成功！')
  //       console.log('准备读取文件：')
  //       resolve(fd)
  //     })
  //   })
  // },

  readFile: (path) => {
    return new Promise((resolve, reject) => {
      if (!path) reject(new Error('参数错误'))
      fs.readFile(path, function (err, data) {
        if (err) {
          console.error('err', err)
          reject(err)
        }
        // console.log('异步读取: ' + data.toString())
        resolve(data.toString())
      })
    })
  },

  saveFile: (weeFile, content) => {
    return new Promise((resolve, reject) => {
      if (!weeFile) reject(new Error('参数错误'))
      console.log('准备写入文件')
      fs.writeFile(weeFile.path, content, function (err) {
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

  renameFile: (weeFile) => {
    return new Promise((resolve, reject) => {
      if (!weeFile) reject(new Error('参数错误'))
      let oldPath = weeFile.path
      let newPath = oldPath.substring(0, oldPath.lastIndexOf('/') + 1) + weeFile.title
      weeFile.path = newPath
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
  }

  // closeFile: (fd) => {
  //   return new Promise((resolve, reject) => {
  //     if (!fd) reject(new Error('参数错误'))
  //     fs.close(fd, function (err) {
  //       if (err) {
  //         console.error('err', err)
  //         reject(err)
  //       }
  //       console.log('文件关闭成功')
  //     })
  //   })
  // }

  // 初始化默认目录
  // initDefault: (bookId) => {
  //   return new Promise((resolve, reject) => {
  //     if (!bookId) reject(new Error('参数错误'))
  //     let model = defaultBookDirectory
  //     model['bookId'] = bookId
  //     model['parent'] = '-'
  //     model['table'] = table
  //     let now = new Date()
  //     model['createTime'] = now
  //     model['updateTime'] = now
  //     db.insert(
  //       model,
  //       (err, ret) => {
  //         if (err) {
  //           console.error('err', err)
  //           reject(err)
  //         }
  //         resolve(ret)
  //       })
  //   })
  // },

  // 查找目录
  // findDirectoryList: (bookId, parent) => {
  //   return new Promise((resolve, reject) => {
  //     if (!bookId) reject(new Error('参数错误'))
  //     db.find({
  //       table: table,
  //       bookId: bookId,
  //       type: menuTypeEnum.USER,
  //       parent: parent || '-',
  //       isFolder: true
  //     }).sort({
  //       // _id: -1
  //       createTime: -1 // 按插入时间倒序
  //     }).exec((err, ret) => {
  //       if (err) {
  //         console.error('err', err)
  //         reject(err)
  //       }
  //       resolve(ret)
  //     })
  //   })
  // },

  // 查找目录和文件
  // findList: (bookId, parent) => {
  //   return new Promise((resolve, reject) => {
  //     if (!bookId) reject(new Error('参数错误'))
  //     db.find({
  //       table: table,
  //       bookId: bookId,
  //       type: menuTypeEnum.USER,
  //       parent: parent || '-'
  //     }).sort({
  //       // _id: -1
  //       createTime: -1 // 按插入时间倒序
  //     }).exec((err, ret) => {
  //       if (err) {
  //         console.error('err', err)
  //         reject(err)
  //       }
  //       resolve(ret)
  //     })
  //   })
  // },

  // createDirectory: (bookId, parent, title) => {
  //   return new Promise((resolve, reject) => {
  //     if (!bookId) reject(new Error('参数错误'))
  //     let now = new Date()
  //     let model = {
  //       table: table,
  //       bookId: bookId,
  //       type: menuTypeEnum.USER,
  //       parent: parent || '-',
  //       title: title,
  //       isFolder: true,
  //       isOpen: false,
  //       isActive: false,
  //       createTime: now,
  //       updateTime: now
  //     }
  //     db.insert(
  //       model,
  //       (err, ret) => {
  //         if (err) {
  //           console.error('err', err)
  //           reject(err)
  //         }
  //         resolve(ret)
  //       })
  //   })
  // },

  // updateDirectory: (model) => {
  //   return new Promise((resolve, reject) => {
  //     if (!model._id) reject(new Error('参数错误'))
  //     let condition = {
  //       _id: model._id
  //     }
  //     // delete model.children
  //     // model['updateTime'] = new Date()
  //     db.update(
  //       condition,
  //       {
  //         $set: {
  //           updateTime: new Date(),
  //           title: model.title,
  //           hasChild: model.hasChild
  //         }
  //       },
  //       (err, ret) => {
  //         if (err) {
  //           console.error('err', err)
  //           reject(err)
  //         }
  //         resolve(ret)
  //       })
  //   })
  // },

  // createFile: (bookId, parent, title, content) => {
  //   return new Promise((resolve, reject) => {
  //     if (!bookId) reject(new Error('参数错误'))
  //
  //     console.log('createFile.bookId:', bookId)
  //     console.log('createFile.parent:', parent)
  //     console.log('createFile.title:', title)
  //     console.log('createFile.content:', content)
  //
  //     let now = new Date()
  //     let model = {
  //       table: table,
  //       bookId: bookId,
  //       type: menuTypeEnum.USER,
  //       parent: parent || '-',
  //       title: title,
  //       content: content || '',
  //       // isFolder: true,
  //       // isOpen: false,
  //       // isActive: false,
  //       createTime: now,
  //       updateTime: now
  //     }
  //     db.insert(
  //       model,
  //       (err, ret) => {
  //         if (err) {
  //           console.error('err', err)
  //           reject(err)
  //         }
  //         resolve(ret)
  //       })
  //   })
  // },

  // updateFile: (model) => {
  //   return new Promise((resolve, reject) => {
  //     if (!model._id) reject(new Error('参数错误'))
  //     let condition = {
  //       _id: model._id
  //     }
  //     model['updateTime'] = new Date()
  //     db.update(
  //       condition,
  //       model,
  //       (err, ret) => {
  //         if (err) {
  //           console.error('err', err)
  //           reject(err)
  //         }
  //         resolve(ret)
  //       })
  //   })
  // }
}

function hasChild (file) {
  let li = fs.readdirSync(file.path)
  if (li && li.length > 0) {
    return true
  }
  return false
}
