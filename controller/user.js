const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const app = express()
app.use(express.json())

app.post("/login", async (req, res) => {
  const { username, password } = req.body

  connection.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database query error" })
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid username or password" })
      }

      const user = results[0]
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid username or password" })
      }

      // 获取用户角色对应的权限
      connection.query(
        "SELECT p.name AS permission_name FROM role_permissions rp JOIN permissions p ON rp.permission_id = p.id WHERE rp.role_id = ?",
        [user.role_id],
        (err, permissionsResults) => {
          if (err) {
            return res.status(500).json({ message: "Database query error" })
          }

          const permissions = permissionsResults.map(
            (permission) => permission.permission_name
          )
          const token = jwt.sign({ username, permissions }, "your_secret_key", {
            expiresIn: "1h"
          })

          res.json({ message: "Login successful", token })
        }
      )
    }
  )
})

app.listen(3000, () => {
  console.log("Server is running on port 3000")
})
