// import db from '@/datastore'
import fs from 'fs'
import _path from 'path'

// 排序类型枚举
const sortModeEnum = {
  TITLE: 'title', // 名称
  FILE_TYPE: 'fileType', // 类型
  CREATE_TIME: 'createTime', // 创建时间
  UPDATE_TIME: 'updateTime', // 更新时间
  LATEST_ACCESSED_TIME: 'latestAccessedTime', // 上次访问时间
  SIZE: 'size' // 大小
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

export default {

  fileTypeEnum: fileTypeEnum,

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
            path: _path.join(path, fileName)
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

  /**
   * 创建路径文件夹
   * @param path
   * @returns {*|void}
   */
  mkdirSync: (path) => {
    return fs.mkdirSync(path, {
      recursive: true
    })
  },

  /**
   * 创建工作空间
   * @param path
   */
  createWorkspace: (path) => {
    fs.mkdirSync(path, {recursive: true})
    fs.mkdirSync(_path.join(path, '正文'), {recursive: true})
    fs.mkdirSync(_path.join(path, '大纲'), {recursive: true})
    fs.mkdirSync(_path.join(path, '人物'), {recursive: true})
    fs.mkdirSync(_path.join(path, '门派'), {recursive: true})
    fs.mkdirSync(_path.join(path, '技能'), {recursive: true})
    fs.mkdirSync(_path.join(path, '地点'), {recursive: true})
    fs.mkdirSync(_path.join(path, '道具'), {recursive: true})
    fs.mkdirSync(_path.join(path, '妖怪'), {recursive: true})
    fs.mkdirSync(_path.join(path, '引用'), {recursive: true})
  },

  /**
   * 初始化工作空间
   * @param path
   */
  initWorkspace: (path) => {
    let wteePath = _path.join(path, '.wtee')
    fs.mkdirSync(wteePath, {recursive: true})
  }
}

/**
 * 通过后缀获取文件类型
 * @param suffix
 * @returns {string}
 */
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
