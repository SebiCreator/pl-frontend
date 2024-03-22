
interface LoggerConfig {
  context: string
  enabled: boolean
  outputSource?: string
}
class Logger {
  private context: string
  private enabled: boolean
  constructor(config: LoggerConfig) {
    this.context = config.context
    this.enabled = config.enabled
  }
  log(message: string): void {
    if (this.enabled) {
      console.log({ context: this.context, message });
    }
  }
  enable(): void {
    this.enabled = true
  }
  disable(): void { this.enabled = false }
}
export {
  Logger
}