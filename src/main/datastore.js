import Datastore from 'nedb'

let dataBasePath = global.sharedObject.dataBasePath

export default new Datastore({
  autoload: true,
  filename: dataBasePath
})
