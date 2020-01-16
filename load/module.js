module.exports = class Module {

    constructor(modManager,meta,localStorage){
        this._moduleManager = modManager
        this.meta = meta
        this._localStorage = localStorage

        this.localStorage = {
            setItem: (key,value) => {
                return this._localStorage.setItem((this.meta.name + "_" || "EMPTY_") + key,value)
            },
        
            getItem: (key) => {
                return this._localStorage.getItem((this.meta.name + "_" || "EMPTY_") + key)
            },
        
            removeItem: (key) => {
                return this._localStorage.removeItem((this.meta.name + "_" || "EMPTY_") + key)
            }
        }

        this.start()
    }

    start(){}

    _load(){
        this.load()
    }

    load(){}

    _preload(){
        this.preload()
    }

    preload(){}
}