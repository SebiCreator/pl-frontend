class Logger {
    static globalEnabled = true
    constructor(config) {
        this.context = config.context
        this.enabled = config.enabled 
        this.instance = config.instance
    }
    log(message, detail=null) {
        if (this.enabled && Logger.globalEnabled) {
            console.log({ context: this.context, message, detail, instance: this.instance });
        }
    }
    error(message, detail=null) {
        if (this.enabled && Logger.globalEnabled) {
            console.error({ context: this.context, message, detail });
        }
    }
    enable() {
        this.enabled = true
    }
    disable() { this.enabled = false }
}
export {
    Logger
}