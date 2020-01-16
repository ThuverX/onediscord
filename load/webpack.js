const { wait } = require('./util.js')

function generateWebpackCache(){
    const id = Math.random.toString()
    const webpackInstance = webpackJsonp.push([
        [],
        {
            [id]: (_, e, r) => {
                e.cache = r.c
                e.require = r
            }
        },
        [
            [id]
        ]
    ])
    delete webpackInstance.cache[id]

    return Object.values(webpackInstance.cache)
}

async function getModuleRaw(mod,repeater = 16,wt = 500){
    let c = async (_repeat) => {
        await wait(wt)
        let modul = generateWebpackCache().find(m =>
            (
                m.exports &&
                m.exports[mod]
            ) || (
                m.exports &&
                m.exports.default &&
                m.exports.default[mod]
            )
        )

        if(!modul && _repeat > 0) return await c(_repeat - 1)
        else if(!modul) throw `Unknown Module with property: ${mod}`
        else return modul.exports
    }

    return await c(repeater)
}

async function getModule(mod,repeater = 16,wt = 500){
    let c = async (_repeat) => {
        await wait(wt)
        let modul = generateWebpackCache().find(m =>
            (
                m.exports &&
                m.exports[mod]
            ) || (
                m.exports &&
                m.exports.default &&
                m.exports.default[mod]
            )
        )

        if(!modul && _repeat > 0) return await c(_repeat - 1)
        else if(!modul) throw `Unknown Module with property: ${mod}`
        else return modul.exports
    }

    return await c(repeater)
}

async function getModuleByDisplayName(mod,repeater = 16,wt = 500){
    let c = async (_repeat) => {
        await wait(wt)
        let modul = generateWebpackCache().find(m =>
            (
                m.exports &&
                m.exports.displayName &&
                (
                    m.exports.displayName == mod ||
                    m.exports.displayName.toLowerCase() == mod
                )
            ) || (
                m.exports &&
                m.exports.default && 
                m.exports.default.displayName &&
                (
                    m.exports.default.displayName == mod ||
                    m.exports.default.displayName.toLowerCase() == mod
                )
            )
        )

        if(!modul && _repeat > 0) return await c(_repeat - 1)
        else if(!modul) throw `Unknown Module with displayName: ${mod}`
        else return modul.exports
    }

    return await c(repeater)
}

const getReact = async () => await getModule('createElement')
const getReactDOM = async () => await getModule('createPortal')

module.exports.getReact = getReact
module.exports.getReactDOM = getReactDOM
module.exports.getModule = getModule
module.exports.getModuleRaw = getModuleRaw
module.exports.getModuleByDisplayName = getModuleByDisplayName


window.exposed.WEBPACK = {
    getReact,
    getReactDOM,
    getModule,
    getModuleRaw,
    getModuleByDisplayName,
    cache:generateWebpackCache
}