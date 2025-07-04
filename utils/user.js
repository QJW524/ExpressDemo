const jwt = require("jsonwebtoken")
const { jwtSecretKey } = require("../config/jwtSecretKey")

const getUserId = (req) => {
  // 获取token
  const token = req.headers.authorization
  // 解析token获取用户数据
  const userInfo = jwt.verify(token.split("Bearer ")[1], jwtSecretKey)
  return userInfo.user_id
}

module.exports = {
  getUserId
}
