const electron = { app, session, BrowserWindow } = require('electron')
const { join,dirname } = require('path')
const { _load } = require('module')

class WindowPatch extends BrowserWindow {
    constructor(opts) {
		if (!opts.webPreferences || !opts.webPreferences.preload) return new BrowserWindow(opts)
		
        global._discord_preload = opts.webPreferences.preload

        opts.webPreferences.nodeIntegration = true
        opts.webPreferences.preload = join(__dirname, 'preload.js')

        return new BrowserWindow(opts)
    }
}

Object.assign(WindowPatch, BrowserWindow)

module.exports = new class DiscordEssentialsPatcher {
    constructor(){
        this.electron_path = require.resolve('electron')
        this.discord_path = join(dirname(require.main.filename), '..', 'app.asar')
        this.discord_pack = require(join(this.discord_path, 'package.json'))
        this.failed_exports = []

        this.setRequireCache()

        app.once('ready',() => this.appReady.call(this))

        app.setAppPath(this.discord_path)
        app.setName(this.discord_pack.name)
        this.done()
    }


    setRequireCache(){
        require.cache[this.electron_path].exports = {}
        for (const prop in electron) {
            try {
                require.cache[this.electron_path].exports[prop] = electron[prop]
            } catch (wedontcare) {
                this.failed_exports.push(prop)
            }
        }
        require.cache[this.electron_path].exports.BrowserWindow = WindowPatch
    }

    appReady(){
        session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, res) => {
            
            Object.keys(responseHeaders)
                .filter(h => (/^content-security-policy/i).test(h))
                .map(h => (delete responseHeaders[h]))
        
            res({ responseHeaders })
        })
    
        for (const prop of this.failed_exports) {
            require.cache[this.electron_path].exports[prop] = electron[prop]
        }       
    }
    
    done(){
        _load(join(this.discord_path, this.discord_pack.main),null,true)
    }
}()