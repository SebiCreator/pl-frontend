class Logger {
    static globalEnabled = true
    constructor(config) {
        this.context = config.context
        this.enabled = config.enabled 
    }
    log(message) {
        if (this.enabled && Logger.globalEnabled) {
            console.log({ context: this.context, message });
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