const { db } = require("../db/mysql")
const { getUserId } = require('../utils/user')
const { v4: uuidv4 } = require("uuid")

// 添加课程
exports.addCourseInfo = (req,res) => {
  let { title, courseImg, price, point, category } = req.body
  // 课程ID生成
  const courseId = uuidv4()
  let userId = getUserId(req)
  const addSql = `insert into course_list (title,courseImg,price,point,category,user_id,course_id) value ('${title}','${courseImg}','${price}','${point}','${category}','${userId}','${courseId}')`
  db.query(addSql, (err, addRes) => {
    if (err) {
      return res.status(500).send({ code: 500, message: err.message })
    }
    res.send({
      code: 200,
      data: {
        message: "课程添加成功"
      }
    })
  })
}
// 删除课程
exports.deleteCourseInfo = (req, res) => {
    let { courseId } = req.body
    let deleteSql = `update course_list set del = 1 where course_id = '${courseId}'`
    db.query(deleteSql,(err, results) => {
        if (err) {
            return res.status(500).send({ code: 500, message: err.message })
        }
        res.send({
          code: 200,
          data: {
            message: "删除成功"
          }
        })
    })
}
// 更新课程
exports.updateCourseInfo = (req, res) => {
  let { courseId, title, price } = req.body
  let sql = "update course_list set "
  let arr = []
  //同时修改标题和价格
  if (title && price) {
    sql = sql + "title=?,price=? where course_id=?"
    arr = [title, Number(price), courseId]
  } else if (title) {
    //单独修改标题
    sql = sql + "title=? where course_id=?"
    arr = [title,courseId]
  } else if (price) {
    //单独修改标题
    sql = sql + "price=? where course_id=?"
    arr = [price, courseId]
  }
  db.query(sql, arr, (err, results) => {
    if (err) {
      return res.status(500).send({ code: 500, message: err.message })
    }
    res.send({
      code: 200,
      data: {
        message: "修改成功"
      }
    })
  })
}
// 课程查询接口
exports.CourseInfo = (req, res) => {
  // 分页查询参数
  let { category, page, size } = req.query
  // 数据库索引的位置
  page = (page - 1) * size
  let userId = getUserId(req)
  userId = userId.toString()
  // 查询课程列表sql
  let pageSql = `select * from course_list where del=0 and category=? and user_id='${userId}' order by id limit ?,?`

  // 查询课程总数sql
  let totalSql =
    `select count(*) as total from course_list where del=0 and category=? and user_id='${userId}'`
  db.query(
    pageSql,
    [category, Number(page), Number(size)],
    (err, resPage) => {
      if (err) {
        return res.status(500).send({ code: 500, message: err.message })
      }
      db.query(totalSql, category, (err, resTotal) => {
        if (err) {
          return res.status(500).send({ code: 500, message: err.message })
        }
        res.send({
          code: 200,
          data: {
            list: resPage,
            total: resTotal[0].total
          }
        })
      })
    }
  )  
}
