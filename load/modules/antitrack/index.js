const Mod = require('../../module.js')

const { getModule } = require('../../webpack.js')

module.exports = class AntiTrack extends Mod {
    
    async start(){
        const Analytics = await getModule('AnalyticEventConfigs')
              Analytics.__oldTrack = Analytics.track
              Analytics.track = () => void 0

        const MethodWrapper = await getModule('wrapMethod')
              MethodWrapper.__oldWrapMethod = MethodWrapper.wrapMethod
              MethodWrapper.wrapMethod = () => void 0
        
        const Reporter = await getModule('collectWindowErrors')
              Reporter.__oldReport = Reporter.report
              Reporter.report.uninstall()

        const Sentry = await getModule('_originalConsoleMethods')
              Sentry.__old_breadcrumbEventHandler = Sentry._breadcrumbEventHandler
              Sentry.__oldCaptureBreadcrumb = Sentry.captureBreadcrumb
              Sentry.__old_sendProcessedPayload = Sentry._sendProcessedPayload
              Sentry.__old_send = Sentry._send

        window.__oldConsole = window.console

        Sentry.uninstall()
        Sentry._breadcrumbEventHandler = () => () => void 0
        Sentry.captureBreadcrumb = () => void 0
        Sentry._sendProcessedPayload = () => void 0
        Sentry._send = () => void 0
        Object.assign(window.console, Sentry._originalConsoleMethods)

        // Thanks to Bowser65#0001 and Powercord
        // Based on https://github.com/powercord-org/powercord/blob/v2-dev/src/Powercord/plugins/pc-dnt/index.js#L8-L50
    }
}