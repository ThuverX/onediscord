const Mod = require('../../module.js')

const { modifyFunctionArguments, modifyFunctionReturn, hookFunction } = require('../../util.js')

module.exports = class AppToWindow extends Mod {
    load(){
        let React = this._moduleManager.require.React

        modifyFunctionReturn(React,'createElement',(e) => {
            if(e.props.className && e.props.className.startsWith('app-')){
                //e.props.children = []
            }

            return e
        })
    }
}