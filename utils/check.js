const joi = require("joi")

//用户注册登录的表单校验规则
const userName = joi
  .string()
  .pattern(/^[\S]{1,10}$/)
  .required()
const password = joi
  .string()
  .pattern(/^[\S]{6,12}$/)
  .required()
exports.userCheck = {
    body: {
        userName,
        password
    }
}

// 课程查询参数的效验规则
const category = joi.string().required()
const page = joi.number().integer().required()
const size = joi.number().integer().required()
exports.findCourseCheck = {
  query: {
    category,
    page,
    size
  }
}

// 添加课程参数的效验规则
const addCourseRule = {
  title: joi.string().required(),
  courseImg: joi.string().required(),
  price: joi.number().integer().required(),
  point: joi.string().required(),
  category: joi.string().required()
}
exports.addCourseCheck = {
  body: {
    title: addCourseRule.title,
    courseImg: addCourseRule.courseImg,
    price: addCourseRule.price,
    point: addCourseRule.point,
    category: addCourseRule.category
  }
}

// 更新课程参数的效验规则
const updateCourseRule = {
  courseId: joi.string().required(),
  title: joi.string().optional(),
  price: joi.number().integer().required(),
}
exports.updateCourseRule = {
  body: {
    courseId: updateCourseRule.courseId,
    title: updateCourseRule.title,
    price: updateCourseRule.price
  }
}

// 删除课程参数的效验规则
const deleteCourseRule = {
  courseId: joi.string().required()
}
exports.deleteCourseRule = {
  body: {
    courseId: deleteCourseRule.courseId
  }
}

