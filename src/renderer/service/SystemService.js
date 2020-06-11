import db from '@/datastore'

const table = 'system'

const dataTypeEnum = {
  USER_SETTING: 'userSetting'
}

export default {

  table: table,

  findUserSetting: (key) => {
    return new Promise((resolve, reject) => {
      let condition = {
        table: table,
        dataType: dataTypeEnum.USER_SETTING
      }
      if (key) condition.key = key
      db.find(condition).exec((err, ret) => {
        if (err) {
          console.error('err', err)
          reject(err)
        }
        resolve(ret)
      })
    })
  },

  saveUserSetting: (key, value) => {
    return new Promise((resolve, reject) => {
      if (!key) reject(new Error('参数错误'))
      let condition = {
        table: table,
        dataType: dataTypeEnum.USER_SETTING,
        key: key
      }
      db.update(
        condition,
        {
          $set: {
            value: value
          }
        },
        (err, ret) => {
          if (err) {
            console.log('err', err)
            reject(err)
          }
          if (ret === 0) {
            // 如果没有找到，就新增一条
            condition['value'] = value
            db.insert(
              condition,
              (err, ret) => {
                if (err) {
                  console.error('err', err)
                  reject(err)
                }
                resolve(ret)
              })
          } else {
            resolve(ret)
          }
        })
    })
  }

  // save: (model) => {
  //   return new Promise((resolve, reject) => {
  //     if (!model) reject(new Error('参数错误'))
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
  //
  // findOneById: (id) => {
  //   return new Promise((resolve, reject) => {
  //     if (!id) reject(new Error('参数错误'))
  //     db.findOne(
  //       {
  //         table: table,
  //         _id: id
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
  //
  // findList: () => {
  //   return new Promise((resolve, reject) => {
  //     db.find({
  //       table: table
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
  //
  // deleteById: (id) => {
  //   return new Promise((resolve, reject) => {
  //     if (!id) reject(new Error('参数错误'))
  //     db.remove(
  //       {
  //         table: table,
  //         _id: id
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
  //
  // deleteAll: () => {
  //   return new Promise((resolve, reject) => {
  //     db.remove(
  //       {
  //         table: table
  //       },
  //       {
  //         multi: true
  //       },
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
