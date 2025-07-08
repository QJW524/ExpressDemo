require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const userRouter = require('./router/user')
const courseRouter = require('./router/course')
const joi = require('joi')
const logger = require('./db/logger.js')


const app = express()
// 用于解析传入请求中的 JSON 数据
app.use(bodyParser.json())

// 解析 application/x-www-form-urlencoded 格式的数据，即传统的表单提交方式
// 选项 extended: false 指定使用 querystring 库来解析数据，这意味着不能解析复杂的嵌套对象。
// app.use(bodyParser.urlencoded({extended: false}))
// 解决跨域
app.use(cors())

// 请求日志中间件
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`)
  next()
})
// 新增 apidoc 路由挂载（需在普通路由之前）
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', express.static('apidoc'))
}

/**
 * 解析token校验是否正确、哪些接口需要token校验 '/user/register',
 */
const expressJwt = require('express-jwt')
const { jwtSecretKey } = require('./config/jwtSecretKey')
app.use(
  expressJwt({ secret: jwtSecretKey, algorithms: ['HS256'] }).unless({
    path: ['/user/login', '/user/register']
  })
)
// 用户路由模块
app.use('/user', userRouter)
// 课程路由模块
app.use('/course', courseRouter)

// 错误中间件
app.use((err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.ip} - ${
      req.method
    } - ${new Date().toISOString()}`
  )
  //joi表单的用户信息校验失败
  if (err instanceof joi.ValidationError) {
    return res.status(400).send({
      code: 400,
      message: err.message,
      type: '表单验证失败'
    })
  }
  if (err.name === 'UnauthorizedError') {
    return res.status(401).send({
      code: 401,
      message: '身份认证失败',
      type: 'token过期'
    })
  }
  //其他的错误
  res.status(500).send({
    code: 500,
    message: err.message,
    type: '服务器内部报错'
  })
})

app.listen(3000, () => {
  console.log('服务启动')
})
