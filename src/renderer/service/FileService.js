import db from '@/datastore'

const table = 'file'

// 菜单类型枚举：系统菜单、用户菜单
const menuTypeEnum = {
  SYSTEM: 'system',
  USER: 'user'
}

// 系统搜索结果菜单
const sysSearchResMenu = {_id: '搜索结果', title: '搜索结果', type: menuTypeEnum.SYSTEM, isFolder: false, isActive: false}

// 系统素材菜单
const sysSourceMenu = [
  {_id: '大纲', title: '大纲', type: menuTypeEnum.SYSTEM, parent: '-', isFolder: true, isOpen: false, isActive: false},
  {
    _id: '资料',
    title: '资料',
    type: menuTypeEnum.SYSTEM,
    parent: '-',
    isFolder: true,
    isOpen: false,
    isActive: false,
    hasChild: true,
    children: [
      {_id: '地点', title: '地点', type: menuTypeEnum.SYSTEM, parent: '资料', isFolder: true, isOpen: false, isActive: false},
      {_id: '人物', title: '人物', type: menuTypeEnum.SYSTEM, parent: '资料', isFolder: true, isOpen: false, isActive: false},
      {_id: '门派', title: '门派', type: menuTypeEnum.SYSTEM, parent: '资料', isFolder: true, isOpen: false, isActive: false},
      {_id: '道具', title: '道具', type: menuTypeEnum.SYSTEM, parent: '资料', isFolder: true, isOpen: false, isActive: false},
      {_id: '妖怪', title: '妖怪', type: menuTypeEnum.SYSTEM, parent: '资料', isFolder: true, isOpen: false, isActive: false},
      {_id: '招式心法', title: '招式心法', type: menuTypeEnum.SYSTEM, parent: '资料', isFolder: true, isOpen: false, isActive: false},
      {_id: '引用', title: '引用', type: menuTypeEnum.SYSTEM, parent: '资料', isFolder: true, isOpen: false, isActive: false}
    ]
  }
]

// 用户编辑默认菜单
const defaultBookDirectory = {table: table, bookId: null, title: '第一卷', type: menuTypeEnum.USER, parent: '-', isFolder: true, isOpen: false, isActive: false}

export default {

  menuTypeEnum: menuTypeEnum,

  sysSearchResMenu: sysSearchResMenu,
  sysSourceMenu: sysSourceMenu,

  table: table,

  // 初始化默认目录
  initDefault: (bookId) => {
    return new Promise((resolve, reject) => {
      if (!bookId) reject(new Error('参数错误'))
      let model = defaultBookDirectory
      model['bookId'] = bookId
      model['parent'] = '-'
      model['table'] = table
      let now = new Date()
      model['createTime'] = now
      model['updateTime'] = now
      db.insert(
        model,
        (err, ret) => {
          if (err) {
            console.log('err', err)
            reject(err)
          }
          resolve(ret)
        })
    })
  },

  // 查找目录
  findDirectoryList: (bookId, parent) => {
    return new Promise((resolve, reject) => {
      if (!bookId) reject(new Error('参数错误'))
      db.find({
        table: table,
        bookId: bookId,
        type: menuTypeEnum.USER,
        parent: parent || '-',
        isFolder: true
      }).sort({
        // _id: -1
        createTime: -1 // 按插入时间倒序
      }).exec((err, ret) => {
        if (err) {
          console.log('err', err)
          reject(err)
        }
        resolve(ret)
      })
    })
  },

  // 查找目录和文件
  findList: (bookId, parent) => {
    return new Promise((resolve, reject) => {
      if (!bookId) reject(new Error('参数错误'))
      db.find({
        table: table,
        bookId: bookId,
        type: menuTypeEnum.USER,
        parent: parent || '-'
      }).sort({
        // _id: -1
        createTime: -1 // 按插入时间倒序
      }).exec((err, ret) => {
        if (err) {
          console.log('err', err)
          reject(err)
        }
        resolve(ret)
      })
    })
  },

  createDirectory: (bookId, parent, title) => {
    return new Promise((resolve, reject) => {
      if (!bookId) reject(new Error('参数错误'))
      let now = new Date()
      let model = {
        table: table,
        bookId: bookId,
        type: menuTypeEnum.USER,
        parent: parent || '-',
        title: title,
        isFolder: true,
        isOpen: false,
        isActive: false,
        createTime: now,
        updateTime: now
      }
      db.insert(
        model,
        (err, ret) => {
          if (err) {
            console.log('err', err)
            reject(err)
          }
          resolve(ret)
        })
    })
  },

  updateDirectory: (model) => {
    return new Promise((resolve, reject) => {
      if (!model._id) reject(new Error('参数错误'))
      let condition = {
        _id: model._id
      }
      // delete model.children
      // model['updateTime'] = new Date()
      db.update(
        condition,
        {
          $set: {
            updateTime: new Date(),
            title: model.title,
            hasChild: model.hasChild
          }
        },
        (err, ret) => {
          if (err) {
            console.log('err', err)
            reject(err)
          }
          resolve(ret)
        })
    })
  },

  createFile: (bookId, parent, title, content) => {
    return new Promise((resolve, reject) => {
      if (!bookId) reject(new Error('参数错误'))

      console.log('createFile.bookId:', bookId)
      console.log('createFile.parent:', parent)
      console.log('createFile.title:', title)
      console.log('createFile.content:', content)

      let now = new Date()
      let model = {
        table: table,
        bookId: bookId,
        type: menuTypeEnum.USER,
        parent: parent || '-',
        title: title,
        content: content || '',
        // isFolder: true,
        // isOpen: false,
        // isActive: false,
        createTime: now,
        updateTime: now
      }
      db.insert(
        model,
        (err, ret) => {
          if (err) {
            console.log('err', err)
            reject(err)
          }
          resolve(ret)
        })
    })
  },

  updateFile: (model) => {
    return new Promise((resolve, reject) => {
      if (!model._id) reject(new Error('参数错误'))
      let condition = {
        _id: model._id
      }
      model['updateTime'] = new Date()
      db.update(
        condition,
        model,
        (err, ret) => {
          if (err) {
            console.log('err', err)
            reject(err)
          }
          resolve(ret)
        })
    })
  }
}
