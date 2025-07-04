const fs = require('fs')
const path = require('path')

// 多语言生成
exports.generateLanguageController = async (req, res) => {
  const { hash, index } = req.body
  console.log(req.body)
  console.log(req.file)
  const chunkDir = path.resolve('temp', hash)

  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir, { recursive: true })
  }

  const filename = path.resolve(chunkDir, index.toString())
  fs.renameSync(req.file.path, filename)
  res.send('Chunk uploaded')
}

// 检查文件是否存在
exports.checkFileController = async (req, res) => {
  const { hash } = req.query
  const chunkDir = path.resolve('temp', hash)
  console.log(chunkDir)
  console.log(!fs.existsSync(chunkDir))
  if (!fs.existsSync(chunkDir)) {
    return res.json({ existedChunks: [] })
  }

  const chunks = fs.readdirSync(chunkDir)
  res.json({
    existedChunks: chunks.map(Number).sort((a, b) => a - b)
  })
}

// 合并文件操作
exports.mergeFileController = async (req, res) => {
  const { filename, hash } = req.body
  const chunkDir = path.resolve('temp', hash)
  const chunks = fs.readdirSync(chunkDir)
  // 按序号排序
  chunks.sort((a, b) => a - b)
  console.log(chunkDir, chunks)
  // 创建写入流
  const filePath = path.resolve('uploads', filename)
  const writeStream = fs.createWriteStream(filePath)

  const mergeChunk = (index) => {
    if (index >= chunks.length) {
      // 删除临时目录
      // fs.rmdirSync(chunkDir, { recursive: true })
      return res.send('Merge complete')
    }

    const chunkPath = path.resolve(chunkDir, chunks[index])
    const readStream = fs.createReadStream(chunkPath)

    readStream.pipe(writeStream, { end: false })

    readStream.on('end', () => {
      fs.unlinkSync(chunkPath)
      mergeChunk(index + 1)
    })
  }
  try {
  mergeChunk(0)  
  } catch (error) {
    console.log(error,'merge');
  }
  
}
