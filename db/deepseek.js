const { DEEP_SEEK_CONF } = require("../config/deepSeekKey")
const OpenAI = require("openai")

const openAiClient = new OpenAI(DEEP_SEEK_CONF)

// async function main() {
//   try {
//     const completion = await openAiClient.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content:
//             "你是一个助手，所有回答请用 Markdown 格式，包含标题、列表和代码块。"
//         },
//         {
//           role: "user",
//           content: "解释 JavaScript 中的闭包概念"
//         }
//       ],
//       model: "deepseek-chat",
//     //   response_format: { type: "json_object" } // 关键：强制返回 JSON
//     })

//     console.log(completion.choices[0].message.content,'deepSeek')
//   } catch (error) {
//     console.log(error, "deepSeekError")
//   }
// }

// main()
// async function main() {
//   // 创建一个流式请求
//   const response = await openAiClient.chat.completions.create({
//     messages: [{ role: "system", content: "You are a helpful assistant." }],
//     model: "deepseek-chat",
//     stream: true // 启用流式响应
//   })

//   // 检查响应是否为流
//   if (response.status === 200 && response.body) {
//     const reader = response.body.getReader()
//     const stream = new ReadableStream({
//       start(controller) {
//         function push() {
//           reader
//             .read()
//             .then(({ done, value }) => {
//               if (done) {
//                 controller.close()
//                 return
//               }
//               // 将接收到的数据追加到流中
//               controller.enqueue(value)
//               push()
//             })
//             .catch((err) => {
//               console.error("Stream error:", err)
//               controller.error(err)
//             })
//         }
//         push()
//       }
//     })

//     // 将流转换为可读的文本流
//     const textStream = new Response(stream).text()

//     // 监听流中的数据
//     textStream
//       .then((text) => {
//         console.log(text) // 打印最终的完整文本
//       })
//       .catch((err) => {
//         console.error("Error processing stream:", err)
//       })
//   } else {
//     console.error("Failed to get a stream response:", response.status)
//   }
// }

// async function fetchStream() {
//   const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer sk-5eb43082ee7743e0aebbf46019e471eb`
//     },
//     body: JSON.stringify({
//       model: "deepseek-chat",
//       messages: [{ role: "system", content: "You are a helpful assistant." }],
//       stream: true
//     })
//   })

//   if (response.ok) {
//     const reader = response.body.getReader()
//     const decoder = new TextDecoder("utf-8")
//     let buffer = ""

//     const processStream = async ({ done, value }) => {
//       if (done) {
//         console.log("Stream complete:", buffer)
//         return
//       }

//       // 解码并追加到缓冲区
//       buffer += decoder.decode(value, { stream: true })

//       // 处理完整的行
//       const lines = buffer.split("\n")
//       for (let i = 0; i < lines.length - 1; i++) {
//         const line = lines[i].trim()
//         if (line.startsWith("data:")) {
//           const str = line.substring(5).trim() // 去掉 "data:" 前缀
//           if (str !== "[DONE]") {
//             try {
//               const parsedData = JSON.parse(str)
//               console.log(parsedData.choices[0].delta.content) // 打印流式返回的内容
//             } catch (error) {
//               console.error("Error parsing JSON:", error)
//             }
//           }
//         }
//       }

//       // 保留最后一行（可能不完整）
//       buffer = lines[lines.length - 1]

//       // 递归读取下一部分数据
//       reader.read().then(processStream)
//     }

//     reader.read().then(processStream)
//   } else {
//     console.error("Failed to get a stream response:", response.status)
//   }
// }

// fetchStream()

// main()
module.exports = openAiClient