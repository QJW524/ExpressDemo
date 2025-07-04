const mysql = require('mysql')
const { MYSQL_CONF } = require('../config/db')

const con = mysql.createConnection(MYSQL_CONF)

// 开始连接
con.connect()

// 统计执行 sql的函数
// 执行SQL语句的异步函数
function exec(sql) {
    // 创建Promise实例用于异步处理SQL操作
    const promise = new Promise((resolve, reject) => {
        // 执行SQL查询
        con.query(sql, (err, result) => {
            if (err) {
                // 错误时返回拒绝状态的Promise
                reject(err)
                return
            }
            // 成功时返回解决状态的Promise
            resolve(result)
        })
    })
    // 返回Promise对象给调用者
    return promise
}

module.exports = {
    exec,
    escape: mysql.escape,
    db: con
}