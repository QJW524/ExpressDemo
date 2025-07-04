const express = require('express')
const router = express.Router()
const expressJoi = require("@escook/express-joi")
const {
  findCourseCheck,
  addCourseCheck,
  updateCourseRule,
  deleteCourseRule
} = require("../utils/check")
const courseController = require('../controller/courseController')

router.get("/getCourseList", expressJoi(findCourseCheck), courseController.CourseInfo)

router.post('/addCourse', expressJoi(addCourseCheck), courseController.addCourseInfo)

router.post(
  "/updateCourse",
  expressJoi(updateCourseRule),
  courseController.updateCourseInfo
)

router.post(
  "/deleteCourse",
  expressJoi(deleteCourseRule),
  courseController.deleteCourseInfo
)

module.exports = router