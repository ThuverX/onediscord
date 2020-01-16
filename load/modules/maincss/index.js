const Mod = require('../../module.js')

const { readFileSync } = require('fs')
const { join } = require('path')

const { modifyFunctionReturn, hookFunction } = require('../../util.js')
const { getModuleByDisplayName, getReact, getModule } = require('../../webpack.js')

function binaryToRGB(i){
    return [i >> 16,i >> 8 & 0xFF,i & 0xFF]
}

const weather = require('weather-js')

const ReactAnimatedWeather = require('./customReactWeatherIcon.js')

const TimeAgo = require('javascript-time-ago')
const en = require('javascript-time-ago/locale/en')

TimeAgo.addLocale(en)

const timeAgo = new TimeAgo()

module.exports = class Maincss extends Mod {

    start(){
        this.prevData = {
            temperature:0,
            location:"",
            code:0
        }
        this.location = "Groningen, Netherlands",
        this.degreeType = "c",
        this.twelvehour = true
    }

    renderHomePage(React){
        let e = React.createElement

        function getIconFromCode(code){
            switch(parseInt(code)){
                case 32:
                case 26:
                case 36: return 'CLEAR_DAY';

                case 31: return 'CLEAR_NIGHT';

                case 28:
                case 30:
                case 34: return 'PARTLY_CLOUDY_DAY';

                case 27:
                case 29:
                case 33: return 'PARTLY_CLOUDY_NIGHT';

                case 26:
                case 25:
                case 11: return 'CLOUDY';

                case 6:
                case 10:
                case 8:
                case 9: return 'SLEET';

                case 5:
                case 7:
                case 41:
                case 46:
                case 15:
                case 14:
                case 16:
                case 42:
                case 43:
                case 13: return 'SNOW';

                case 20:
                case 21:
                case 22:
                case 19: return 'FOG';

                default: return 'RAIN';
            }
        }

        let me = this

        function renderInfo(props) {
            function renderWeather(){

                let [temperature,setTemperature] = React.useState(me.prevData.temperature)
                let [location,setLocation] = React.useState(me.prevData.location)
                let [code,setCode] = React.useState(me.prevData.code)
                
                me.setWeatherData = (temp,loc,code) => {
                    setTemperature(temp)
                    setLocation(loc)
                    setCode(code)
                }

                return e('div',{
                    className:"weather"
                },[
                    e(ReactAnimatedWeather(React),{icon:getIconFromCode(code),color:"white",size:220,animate:true}),
                    e('div',{className:"temperature"},temperature),
                    e('div',{className:"location"},location)
                ])
            }

            function renderChangelog(){

                let data = JSON.parse(readFileSync(join(__dirname,'changelog.json')).toString())

                return e('div',{
                    className:"changelog"
                },[
                    e('div',{className:"title"},"Changelog"),
                    e('div',{className:"recents"},
                    data.map(d => e('div',{className:"item"},[
                        e('div',{className:"title"},d.title),
                        e('div',{className:"timestamp"},timeAgo.format(new Date(d.date))),
                        e('div',{className:"background",style:{background:`url(${d.image}) center/cover no-repeat`}})
                    ])))
                ])
            }

            return e('div',{
                className:"info",
                style:props.style
            },[
                e(renderWeather,{
                    code:props.code,
                    temperature:props.temperature,
                    location:props.location
                }),
                e(renderChangelog)
            ])
        }

        return function() {

            function textDisplay(time){
                if(time > 0 && time <= 6)
                    return "Good night, "
                else if(time > 6 && time <= 12)
                    return "Good morning, "
                else if(time > 12 && time <= 18)
                    return "Good afternoon, "
                else if(time > 17 && time <= 24 || time == 0) 
                    return "Good evening, "
                else return "Good day,"
            }

            let text = textDisplay(new Date().getHours()) + me.getCurrentUser().username

            return e('div',{
                className:"dcskin-homepage"
            },[
                e('div',{
                    className:"welcome",
                },text),
                e(renderInfo)
            ])
        }
    }

    async load(){
        window.reloadCSS = this.reloadCSS.bind(this)
        this.reloadCSS()

        let React = await getReact()
        let GuildFolder = await getModuleByDisplayName('GuildFolder')
        
        modifyFunctionReturn('changeColorOfGuildFolderIcons',GuildFolder.default.prototype,'renderFolderIcon',function(e) {
            let lowerData = e
                .props.children
                .props.children[1]
                .props.children
                .props.children
                .props.children
                .props.children
                .props

            let wrapper = e
                .props.children
                .props.children[1]
                .props.children
                .props.children
                .props.children
                .props


            let rgb = binaryToRGB(lowerData.color)
            wrapper.style = {
                background:`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
            }

            return e
        })

        let PrivateChannelsList = await getModuleByDisplayName('FluxContainer(PrivateChannelsList)')

        modifyFunctionReturn('PrivateChannelsListNametoHome',PrivateChannelsList.default.prototype,'render',function(e) {
            e.props.children[0].props.iconName = "Discord"
            e.props.children[0].props.text = "Home"

            return e
        })


        let ActivityScroller = await getModuleByDisplayName("VerticalScroller")

        let me = this

        this.getCurrentUser = (await getModule('getCurrentUser')).default.getCurrentUser
        
        modifyFunctionReturn('ActivityScrollerHomeOnRender',ActivityScroller.default.prototype,'render',function(e) {
            if(this.props.outerClassName == "container-3T1zWi") {

                    weather.find({search: me.location, degreeType: me.degreeType}, function(err, res) {
                        if(err) return console.log(err)
                        if(me.setWeatherData) 
                            me.setWeatherData(
                                res[0].current.temperature,
                                res[0].location.name,
                                res[0].current.skycode)
    
                        me.prevData.temperature = res[0].current.temperature,
                        me.prevData.location = res[0].location.name,
                        me.prevData.code = res[0].current.skycode
                    })

                    e.props.children[0].props.children.unshift(React.createElement(me.renderHomePage(React)))
                }
            return e
        })
    }

    reloadCSS(){
        let old = document.querySelector(".dcstyle_notif-maincss")

        let style = readFileSync(join(__dirname,'style.css'))

        if(!old) {
            let styleElement = document.createElement('style')
                styleElement.className = "dcstyle_notif-maincss"
                styleElement.innerHTML = style

            document.head.appendChild(styleElement)
        }
        else old.innerHTML = style
    }
}