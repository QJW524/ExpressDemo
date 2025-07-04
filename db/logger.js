const winston = require("winston")

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "error.log",
      level: "error",
      dirname: "logs",
      maxsize: 1024
    }), // 错误日志
    new winston.transports.File({
      filename: "combined.log",
      dirname: "logs",
      maxsize: 1024
    })
  ]
})

module.exports = logger