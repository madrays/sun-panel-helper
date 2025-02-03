interface LoggerOptions {
  timestamp?: boolean
  level?: string
}

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString()
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = this.getTimestamp()
    const formattedArgs = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ')
    return `[${timestamp}] [${level}] ${message} ${formattedArgs}`.trim()
  }

  info(message: string, ...args: any[]): void {
    console.log(this.formatMessage('INFO', message, ...args))
  }

  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage('WARN', message, ...args))
  }

  error(message: string, ...args: any[]): void {
    console.error(this.formatMessage('ERROR', message, ...args))
    if (args[0] instanceof Error) {
      console.error(this.formatMessage('ERROR', 'Stack trace:', args[0].stack))
    }
  }
}

export const logger = new Logger() 