const Mod = require('../../module.js')
const { EventEmitter } = require('events')

const { readFileSync } = require('fs')
const { join } = require('path')

const { hookFunction, modifyFunctionReturn, elements : {ContextMenu}, forceUpdate } = require('../../util.js')
const { getModule, getModuleByDisplayName, getReact } = require('../../webpack.js')

class NotifHandler extends EventEmitter{
    constructor(localStorage){
        super()

        this.localStorage = localStorage

        this.subscribedGuilds = JSON.parse(this.localStorage.getItem('subscribed-guild') || '[]')

        this.setupNotificationHandler()
    }

    spawnNotif(data,channel = "normal"){
        console.log(data.content,channel)
    }

    async setupNotificationHandler(){
        let msgModule = (await getModule('receiveMessage')).default
        let getMutedChannels = (await getModule('getMutedChannels')).default.getMutedChannels

        let getCurrentUser = (await getModule('getCurrentUser')).default.getCurrentUser
        let getCurrentChannelId = (await getModule('getChannelId')).default.getChannelId

        this.getUserAvatar = (await getModule('getUserAvatarURL')).default.getUserAvatarURL
        this.getGuild = (await getModule('getGuild')).default.getGuild
        this.getGuildIconURL = (await getModule('getGuildIconURL')).default.getGuildIconURL

        hookFunction('receiveMessageNotifs',msgModule,'receiveMessage',(_,data) => {
            if(!data.state) {
                let dm = data.channel_id && !data.guild_id
                let subs = this.getSubscribedGuilds()

                if(!dm && subs.includes(data.guild_id)) {
                    let muted = Array.from(getMutedChannels(data.guild_id))

                    if(!muted.includes(data.channel_id)) {
                        //if(data.author.id != getCurrentUser().id) {
                            if(!data.member || !data.member.mute) {
                                //if(getCurrentChannelId() != data.channel_id) {
                                    this.spawnNotif(data)
                                //}
                            }
                        //}
                    }
                } else if (dm) {
                    if(data.author.id != getCurrentUser().id) {
                        if(getCurrentChannelId() != data.channel_id) {
                            this.spawnNotif(data,'dm')
                        }
                    }
                }
            }
        })
    }

    getSubscribedGuilds(){
        return this.subscribedGuilds
    }

    subscribeToGuild(guild){
        this.subscribedGuilds.push(guild)

        this.localStorage.setItem('subscribed-guild',JSON.stringify(this.subscribedGuilds))
    }

    unsubscribeFromGuild(guild){
        this.subscribedGuilds.splice(this.subscribedGuilds.indexOf(guild),1)

        this.localStorage.setItem('subscribed-guild',JSON.stringify(this.subscribedGuilds))
    }
}

module.exports = class Notifs extends Mod {

    async start(){
        this.handler = new NotifHandler(this.localStorage) 
        
        this.React = await getReact()

        this.prepareStyle()
        //this.prepareNotifWrapper()
        this.prepareContextMenu()
    }

    prepareStyle(){
        let style = readFileSync(join(__dirname,'style.css'))

        let styleElement = document.createElement('style')
            styleElement.className = "dcstyle_notif-style"
            styleElement.innerHTML = style

        document.head.appendChild(styleElement)
    }

    async prepareNotifWrapper(){
        let self = this
        const mainShakeable = await getModuleByDisplayName('Shakeable')

        modifyFunctionReturn('mainNotifShakeable',mainShakeable.default.prototype,'render',function(e) {
            e.props.children.push(self.React.createElement(self.notificationOverlay(self.React)))
        
            return e
        })
    }

    async prepareContextMenu(){
        let self = this
        let contextMenuRaw = await getModuleByDisplayName('GuildContextMenu')

        modifyFunctionReturn('contextmenuNotifButton',contextMenuRaw.default.prototype,'render',function(e) {
            let data = e.props.children[2] && e.props.children[2].props.children && e.props.children[2].props.children[0] && e.props.children[2].props.children[0].props.guild

            if(data) {

                let state = self.handler.getSubscribedGuilds().includes(data.id)
                e.props.children.push(
                    ContextMenu.itemGroupItem(self.React,{
                        text:(state?'Unsubscribe from':'Subscribe to') + " Notifications",
                        onClick:(e) => {

                    if(!state) self.handler.subscribeToGuild(data.id)
                    else self.handler.unsubscribeFromGuild(data.id)

                    document.body.click()
                }}))
            }

            return e
        })
    }
}