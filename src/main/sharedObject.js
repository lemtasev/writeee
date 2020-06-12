import path from 'path'
import {app} from 'electron'

global.sharedObject = {
  dataBasePath: path.join(app.getPath('userData'), '/data.db'),
  workspace: ''
}
