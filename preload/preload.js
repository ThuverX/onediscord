const { remote } = require('electron')
const { join } = require('path')
require(remote.getGlobal('_discord_preload'))

const ModuleHandler = require(join(__dirname,'../','load','index.js'))

const moduleHandler = new ModuleHandler()

moduleHandler.emit('preload')

const window = remote.getCurrentWindow()

window.webContents.on('dom-ready',() => moduleHandler.emit('load'))