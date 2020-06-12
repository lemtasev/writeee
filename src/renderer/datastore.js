import Datastore from 'nedb'
import { remote } from 'electron'

let dataBasePath = remote.getGlobal('sharedObject').dataBasePath
console.log('dataBasePath', dataBasePath)

export default new Datastore({
  autoload: true,
  filename: dataBasePath
})
