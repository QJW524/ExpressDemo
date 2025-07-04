const { exec, db } = require('../db/mysql')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const jwt = require("jsonwebtoken")
const { ossClient } = require("../db/oss")
const { OSS_CONF } = require('../config/ossKey')
const { jwtSecretKey } = require('../config/jwtSecretKey')
const openAiClient = require('../db/deepseek')
const { PassThrough } = require("stream")
const { Readable } = require("stream")


// 注册接口（修正后）
/**
 * @api {post} /user/register 用户注册
 * @apiGroup User
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} userName 用户名
 * @apiParam {String} password 密码
 * 
 * @apiSuccess {Number} code 状态码
 * @apiSuccess {String} data 注册结果
 */
exports.registerController = (req, res) => {
  let { userName, password } = req.body;
  if (!userName || !password) {
    return res.send({ code: 400, message: '不能为空' })
  }
  // 用户名查重逻辑
  const userSelectSql = `select * from user where name='${userName}'`;
  exec(userSelectSql)
    .then((data) => {
      // 判断用户是否存在
      if (data.length > 0) {
        return res.send({ code: 400, message: "该用户名已经存在" })
      }
     
      // 用户密码加密
      const bcrypt = require("bcryptjs")
      const bcryptPassword = bcrypt.hashSync(password, 10)
      // 用户ID生成
      const userId = uuidv4();
      //随机生成用户的头像
      const imgList = [
        "https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/10.jpeg",
        "https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/11.jpeg",
        "https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/12.jpeg",
        "https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/13.jpeg",
        "https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/14.jpeg",
        "https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/15.jpeg",
        "https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/16.jpeg",
        "https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/17.jpeg",
        "https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/18.jpeg",
        "https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/19.jpeg"
      ]
      const num = Math.floor(Math.random() * 10 + 1)
      const sql = `insert into user (name,pwd,head_img,user_id,role_id) value ('${userName}','${bcryptPassword}','${imgList[num]}','${userId}',1)`
      exec(sql)
        .then((data1) => {
          res.send({
            code: 200,
            data: "注册成功"
          })
        })
        .catch((err) => {
          res.status(500).send({ code: 500, message: err.message })
        })
    })
    .catch((err) => {
      res.status(500).send({ code: 500, message: err.message })
    })
}

// 登录接口（新增注释）
/**
 * @api {post} /user/login 用户登录
 * @apiGroup User
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} userName 用户名
 * @apiParam {String} password 密码
 * 
 * @apiSuccess {Number} code 状态码
 * @apiSuccess {String} message 消息
 * @apiSuccess {String} token 认证令牌
 */
exports.loginController = (req, res) => {
  let { userName, password } = req.body;
  // 查询是否存在用户的sql语句
  const userSelectSql = 'select * from user where name=?' 
  db.query(userSelectSql, userName,(err,results) => {
    // 错误日志返回
    if (err) {
      return res.status(500).send({ code: 500, message: err.message })
    }
    // 账号存在与否判断
    if (results.length === 0) {
      return res.send({ code: 400, message: "账号不存在，请先注册！" })
    }
    // 判断密码是否正确
    const compareState = bcrypt.compareSync(password, results[0].pwd)
    // 密码匹配不对
    if (!compareState) {
      return res.send({ code: 400, message: "密码错误！" })
    }
    // 声明需要拼接token的用户信息 使用对象扩展运算符（...）
    // 将 results[0] 中的用户信息复制到新的 user 对象中，并将 pwd 属性设置为空字符串。
    // 这样做的目的是在生成 JWT 时，不包含用户的密码信息，以提高安全性.
    const user = { ...results[0], pwd: "" }
    // 生成token jwtSecretKey用于对 JWT 进行签名的密钥，必须与验证 JWT 时使用的密钥相同.
    const token = jwt.sign(user, jwtSecretKey, { expiresIn: "604800s" })
    // 响应数据
    res.send({ code: 200, message: "登录成功", token: "Bearer " + token })
  })
}

// 获取用户信息接口
exports.userInfoController = (req, res) => {
  // 获取token
  const token = req.headers.authorization;
  // 解析token获取用户数据
  const userInfo = jwt.verify(token.split('Bearer ')[1], jwtSecretKey);
  const getUserInfoSql = `select * from user where user_id='${userInfo.user_id}'`
  db.query(getUserInfoSql,(err,results) => {
    if (err) {
      res.status(500).send({ code: 500, message: err.message })
      return
    }
    if (results.length === 1) {
       res.send({
         code: 200,
         data: {
           name: results[0].name,
           headImg: results[0].head_img
         }
       })
    }
  })
}

// 更新用户头像
exports.changeUserAvatarController = async (req, res) => {
  try {
    const { originalname, path } = req.file
    const { url } = req.body
    const prePath = url.split(
      `http://${OSS_CONF.bucket}.${OSS_CONF.region}.aliyuncs.com/`
    )[1]
    // 構造oss存储路径
    const ossPath = `avatars/${Date.now()}-${originalname}`
    // 上传到oss
    await ossClient.put(ossPath, path)
    // 返回成功的url
    const avatarUrl = `http://${OSS_CONF.bucket}.${OSS_CONF.region}.aliyuncs.com/${ossPath}`
    // 刪除旧的路径
    await ossClient.delete(prePath)
    // 获取token
    const token = req.headers.authorization
    // 解析token获取用户数据
    const userInfo = jwt.verify(token.split("Bearer ")[1], jwtSecretKey)
    // 更新头像
    const updateAvatarSql = `update user set head_img='${avatarUrl}' where user_id='${userInfo.user_id}'`
    db.query(updateAvatarSql, (err, results) => {
      //错误日志返回
      if (err) {
        return res.status(500).send({ code: 500, message: err.message })
      }
      res.send({
        code: 200,
        data: {
          message: "头像更新成功"
        }
      })
    })
  } catch (error) {
    res.send({
      code: 500,
      data: {
        message: error.message
      }
    })
  }
}

// deepseek調用
exports.aiController = async (req, res) => {
  let { list } = req.body
  try {
    const response = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            ...list
          ],
          stream: true
        })
      }
    )

    if (response.ok) {
      // 将 Web ReadableStream 转换为 Node.js 的可读流
      const readableStream = Readable.fromWeb(response.body)

      // 设置响应头，允许前端接收流式数据
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      })
      console.log('传输中');
      // 将流式数据传输到前端
      readableStream.pipe(res)
    } else {
      console.error("Failed to get a stream response:", response.status)
      res.status(response.status).send("Failed to get a stream response")
    }
  } catch (error) {
    console.error("Error fetching data:", error)
    res.status(500).send("Error fetching data")
  }
}

// 瀑布流调试数据
exports.waterFallController = (req, res) => {
  let { page, pageSize } = req.body
  let data =  [
    { url: 'https://xiaoqiuqiuqiu.oss-cn-hangzhou.aliyuncs.com/demo/1486dc0c43ba45d5a41528ad09e2f208.jpg', caption: '比亚迪宋prodmi' },
    { url: 'https://xiaoqiuqiuqiu.oss-cn-hangzhou.aliyuncs.com/demo/3465043a486f77eb99c6d28eed290d6b.jpeg', caption: '银河星舰7' },
    { url: 'https://xiaoqiuqiuqiu.oss-cn-hangzhou.aliyuncs.com/demo/3790a8b400bac899820eaffa8015c6db.jpeg', caption: '比亚迪秦' },
    { url: 'https://xiaoqiuqiuqiu.oss-cn-hangzhou.aliyuncs.com/demo/612429349dbebdede530a677415801c3.jpeg', caption: '比亚迪汉' },
    { url: 'https://xiaoqiuqiuqiu.oss-cn-hangzhou.aliyuncs.com/demo/9644e5212107b8b11126c7fbc5bb4d23.jpeg', caption: '比亚迪唐' },
    { url: 'https://xiaoqiuqiuqiu.oss-cn-hangzhou.aliyuncs.com/demo/b4e131d2ab5a76fe30db22fb421ae935.jpeg', caption: '杨幂' },
    { url: 'https://xiaoqiuqiuqiu.oss-cn-hangzhou.aliyuncs.com/demo/bf332362-2994-4588-8f88-246ec4048a91.jpg', caption: '迪丽热巴' },
    { url: 'https://xiaoqiuqiuqiu.oss-cn-hangzhou.aliyuncs.com/demo/boat.jpg', caption: 'boat' },
    { url: 'https://xiaoqiuqiuqiu.oss-cn-hangzhou.aliyuncs.com/demo/ddcdbbe0332eb2acd06d87a1fc344a5b.jpeg', caption: '你好呀' },
    { url: 'https://xiaoqiuqiuqiu.oss-cn-hangzhou.aliyuncs.com/demo/%E6%9D%A8%E5%B9%82.jpg', caption: '让我来告诉你吧' }
  ]
  // 添加随机排序
  data = data.sort(() => Math.random() - 0.5)
  if (page >= 5) {
    data = []
  }
  res.send({
    code: 200,
    data: {
      message: "获取瀑布流数据成功",
      list: data
    }
  })
}

