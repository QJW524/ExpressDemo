const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const fileController = require('../controller/fileController')
const expressJoi = require("@escook/express-joi")
const multer = require("multer")
const { userCheck } = require('../utils/check')

// 注册
router.post("/register", expressJoi(userCheck),userController.registerController)

// 登录
router.post('/login', expressJoi(userCheck),userController.loginController)

/**
 * @api {post} /userInfo 获取用户信息
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam
 *
 * @apiSuccess {String} name 用户名.
 * @apiSuccess {String} email 用户邮箱.
 */
router.post('/userInfo', userController.userInfoController)

// 使用multer处理文件上传
const upload = multer({ dest: 'uploads/' })

const upload1 = multer({ dest: 'temp/' })
// 更新用户头像
router.post(
  "/changeAvatar",
  upload.single("file"),
  userController.changeUserAvatarController
)
// 調用ai會話
router.post('/ai',userController.aiController)
// 大文件上传
router.post(
  '/generateLanguage',
  upload1.single('chunk'),
  fileController.generateLanguageController
)
// 查询当前文件是否上传
router.get('/checkFile', fileController.checkFileController)
// 合并文件
router.post('/mergeFile', fileController.mergeFileController)
// 获取文件列表
router.post('/getWaterFall', userController.waterFallController)


module.exports = router