const nodeXlsx = require("node-xlsx")
const fs = require("fs")
const OpenAI = require('openai')
const ExcelJS = require('exceljs')

let DEEP_SEEK_CONF = {
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-41471bdcef594237b41a9280dec5ea8c'
}
const openAiClient = new OpenAI(DEEP_SEEK_CONF)


// 读取xlsx
const workbook = nodeXlsx.parse("./translations.xlsx")
// 生成存放json的文件夹
const folderName = "i18n"
if (!fs.existsSync(folderName)) {
  fs.mkdirSync(folderName)
}
let resTitle = {}

workbook[0].data.forEach((item, index) => {
  // 根据列名生成json文件名  
  if (index == 1) {
    item.forEach((item1, index1) => {
      if (index1 != 0) {
        resTitle[item1] = {}
      }
    })
  }
  // 排列excel表格数据
  if (index > 2) {
    let index = 1
    for (let data in resTitle) {
      resTitle[data][item[0]] = item[index]
      index++
    }
  }
})
console.log(resTitle,1)

let content =
  JSON.stringify(resTitle) +
  ',' +
  '这是一份多语言json文档，假如你是一名多语言翻译家，帮我根据en英文文档，输出ru俄语文档,br葡萄牙语,ar阿拉伯语,ja日语文档,kr韩语文档,zh_hant繁中文档,fr法语文档,in印地文档,id印度尼西亚语文档,tr土耳其语文档,de德语文档,it意大利语,ta泰语,it荷兰语文档,es西班牙语。en英文文档也要带上，直接输出json文档，不用说明,注意，文档内的美元单位需翻译为对应语种的货币单位'
console.log(content,2);  

// try {
//   main(content) 
// } catch (error) {
//   console.log(error, 'Error')
// }

// 生成json文件
const generateJson = (list) => {
  for (let name in list) {
    console.log(name)
    fs.writeFileSync(
      `./${folderName}/${name}.json`,
      JSON.stringify(list[name], null, 2),
      'utf-8'
    )
  }
}

async function createUpdatedExcel(obj) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Translations');

  // 设置表头（语言代码）
  const headers = ['Key', ...Object.keys(obj)];
  worksheet.addRow(headers);

  // 获取所有唯一的翻译键
  const translationKeys = Object.keys(obj[Object.keys(obj)[0]]);

  // 逐行添加数据
  translationKeys.forEach(key => {
      const rowData = [key];
      headers.slice(1).forEach(lang => {
      rowData.push(obj[lang][key]);
      });
      worksheet.addRow(rowData);
});

// 设置列宽
worksheet.columns = [
  { header: 'Key', key: 'key', width: 50 },
  ...headers.slice(1).map(lang => ({ header: lang, key: lang, width: 40 }))
];

await workbook.xlsx.writeFile('translations_output.xlsx');
console.log('Excel文件已生成');
}

exports.main = async function main(content) {
  try {
    const completion = await openAiClient.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: content
        }
      ],
      model: 'deepseek-chat'
      //   response_format: { type: "json_object" } // 关键：强制返回 JSON
    })
    console.log(completion.choices[0].message.content, 3)
    // 去掉 Markdown 的包裹符（如果有）
    const jsonString = completion.choices[0].message.content
      .trim()
      .replace(/(^\s*```json|\s*```$)/g, '')
    const obj = JSON.parse(jsonString)
    console.log(jsonString, 4)
    console.log(obj, 5)
    // 生成json文件
    generateJson(obj)
    // 生成excel文件
    createUpdatedExcel(obj)
  } catch (error) {
    console.log(error, 'deepSeekError')
  }
}

