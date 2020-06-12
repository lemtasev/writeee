import db from './datastore'

const table = 'system'

const dataTypeEnum = {
  USER_SETTING: 'userSetting', // 用户设置
  OPEN_HISTORY: 'openHistory' // 打开目录历史
}

export default {

  table: table,

  findOpenHistory: () => {
    return new Promise((resolve, reject) => {
      let condition = {
        table: table,
        dataType: dataTypeEnum.OPEN_HISTORY
      }
      db.find(condition).exec((err, ret) => {
        if (err) {
          console.error('err', err)
          reject(err)
        }
        resolve(ret)
      })
    })
  },

  saveOpenHistory: (value) => {
    return new Promise((resolve, reject) => {
      // if (!value) reject(new Error('参数错误'))
      let condition = {
        table: table,
        dataType: dataTypeEnum.OPEN_HISTORY
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
  },

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
}
