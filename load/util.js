const hooklist = {}

module.exports.getHooklist = function(){
    return hooklist
}

module.exports.hookFunction = function(hookname = "UNKNOWN",object,name,callback){
    let old = object[name]

    if(!hooklist[hookname])
    hooklist[hookname] = object[name] = function() {
        let ret = old.apply(this,arguments)

        callback.apply(this,arguments)
        return ret
    }
}

function wait(t = 100){
    return new Promise((res) => setTimeout(res,t))
}

module.exports.wait = wait

module.exports.modifyFunctionArguments = function(hookname = "UNKNOWN",object,name,callback){
    let old = object[name]

    if(!hooklist[hookname])
    hooklist[hookname] = object[name] = function() {
        let args = callback.apply(this,arguments)

        return old.apply(this,args)
    }
}

module.exports.modifyFunctionReturn = function(hookname = "UNKNOWN",object,name,callback){
    let old = object[name]

    if(!hooklist[hookname])
    hooklist[hookname] = object[name] = function() {
        let ret = old.apply(this,arguments)

        ret = callback.apply(this,[ret,...arguments])
        return ret
    }
}

const chnc = {
    contextMenu:{
        "itemGroup":"itemGroup-1tL0uz",
        "item":"item-1Yvehc",
        "itemBase":"itemBase-tz5SeC",
        "clickable":"clickable-11uBi-",
        "label":"label-JWQiNe",
        "hint":"hint-22uc-R"
    }
}

module.exports.elements = {
    ContextMenu:{
        itemGroupItem:function(React,props){
            let classes = chnc.contextMenu
            return React.createElement('div',{
                className:classes['itemGroup']
            },React.createElement('div',{
                className:[classes['item'],classes['itemBase'],classes['clickable']].join(' '),
                onClick:props.onClick
            },React.createElement('div',{
                className:classes['label']
            },props.text || ""),React.createElement('div',{
                className:classes['hint']
            },props.hint || "")))
        }
    }
}

// Literally ripped from PowerCord as I couldn't get it to work

function reactInternalInstance(node){
    Object.keys(node).find(key => key.startsWith('__reactInternalInstance'))
}

function reactOwnerInstance(node){
    for (let curr = reactInternalInstance(node); curr; curr = curr.return) {
        const owner = curr.stateNode
        if (owner && !(owner instanceof HTMLElement)) {
            return owner;
        }
    }

    return null;
}

function forceUpdate(query,all = false){
    const elements = all ? document.querySelectorAll(query) : [ document.querySelector(query) ];
    elements.forEach(element => {
        reactOwnerInstance(element).forceUpdate()
    })
}

module.exports.forceUpdate = forceUpdate
module.exports.reactOwnerInstance = reactOwnerInstance
module.exports.reactInternalInstance = reactInternalInstance