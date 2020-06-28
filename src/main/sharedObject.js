import path from 'path'
import {app} from 'electron'

let userHomePath = app.getPath('home')
let defaultWorkspacePath = path.join(userHomePath, process.env.npm_package_name + 'Workspace', 'untitled')

global.sharedObject = {
  version: process.env.npm_package_version,
  userHomePath: userHomePath,
  defaultWorkspacePath: defaultWorkspacePath,
  dataBasePath: path.join(app.getPath('userData'), 'data.db'),
  workspace: ''
}
