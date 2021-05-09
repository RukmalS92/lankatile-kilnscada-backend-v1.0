const {createLogger, format, transport, transports, addColors} = require('winston')
const { combine, timestamp, label, printf, prettyPrint } = format 
const chalk = require('chalk')

const errorLogger = createLogger({
    level : 'error',
    format: combine(
        timestamp(),
        prettyPrint()
    ),
    transports: [
        new transports.Console(),
        new transports.File({filename : 'error.log', level : 'error'})
    ]
})

const infoLogger = createLogger({
    level : 'info',
    format: combine(
        timestamp(),
        prettyPrint(),
    ),
    transports: [
        new transports.Console(),
        new transports.File({filename : 'info.log', level : 'info'})
    ]
})


let Logger = {
    error : (err) => {
        try {
            let errString = {
                errorMessage : err.message,
                errorType : err.name
            }
            const errorstring = JSON.stringify(errString)
            errorLogger.error(errorstring)
        } catch (error) {
            console.log(chalk.bgRed('errorType not acceptable format for Logger : error'))
        }   
    },
    info : (inf) => {
        try {
            let infString = {
                infoMessage : inf,
            }
            const infostring = JSON.stringify(infString)
            infoLogger.info(infostring)
        } catch (error) {
            console.log(chalk.bgRed('infoType not acceptable format for Logger : info'))
        }   
    }
}

module.exports = Logger