import db from '@/datastore'

const table = 'book'

export default {

  table: table,

  save: (model) => {
    return new Promise((resolve, reject) => {
      if (!model) reject(new Error('参数错误'))
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

  findOneById: (id) => {
    return new Promise((resolve, reject) => {
      if (!id) reject(new Error('参数错误'))
      db.findOne(
        {
          table: table,
          _id: id
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

  findList: () => {
    return new Promise((resolve, reject) => {
      db.find({
        table: table
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

  deleteById: (id) => {
    return new Promise((resolve, reject) => {
      if (!id) reject(new Error('参数错误'))
      db.remove(
        {
          table: table,
          _id: id
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

  deleteAll: () => {
    return new Promise((resolve, reject) => {
      db.remove(
        {
          table: table
        },
        {
          multi: true
        },
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
