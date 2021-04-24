const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: 'info', //단계 별로 보야줌
    format: format.json(),
    transports: [
        new transports.File({ filename: 'combined.log'}),
        new transports.File({ filename: 'error.log', level: 'error'}),
    ],
});

if( process.env.NODE_ENV !== 'production'){
    logger.add(new transports.Console({ format: format.simple()})); //개발용일 떈 콘솔에 표시
}

module.exports = logger;