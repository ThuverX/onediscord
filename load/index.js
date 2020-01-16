const { EventEmitter } = require('events')

const { readdirSync, existsSync } = require('fs')
const { join } = require('path')

const { LocalStorage } = require('node-localstorage')

const localStorage = new LocalStorage(__dirname + '/settings')

const { getHooklist } = require('./util.js')

module.exports = class ModuleHandler extends EventEmitter{
    constructor(){
        super()

        this._modules = []

        this.BASE_PATH = __dirname
        this.MODULE_PATH = join(this.BASE_PATH,'modules')
        
        this.on('preload',() => {
            for(let module of this._modules)
                module._preload()
        })

        this.on('load',() => {
            for(let module of this._modules)
                module._load()
        })

        this.on('load_webpack',(pack) => {
            this.webpack = pack
        })

        window.exposed = {
            MODULE_HANDLER:this,
            MODULES:this._modules,
            ACTIVE_HOOKS:getHooklist
        }

        this.load()
    }

    load(){
        const folders = readdirSync(this.MODULE_PATH)

        for(let folder of folders) {
            if(existsSync(join(this.MODULE_PATH,folder,'meta.json'))){
                let meta = require(join(this.MODULE_PATH,folder,'meta.json'))

                if(!meta.disabled) {
                    let mod = require(join(this.MODULE_PATH,folder,meta.main))

                    console.log('LOADING:',meta.name,'by',meta.author)
                    this._modules.push(new mod(this,meta,localStorage))
                }
            }
        }
    }
}