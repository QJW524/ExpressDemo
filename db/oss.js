const { OSS_CONF } = require("../config/ossKey")
const OSS = require("ali-oss")

// 初始化OSS
const client = new OSS(OSS_CONF)

// 指定delimiter参数为正斜线（/），将会列举根目录下的Object的版本信息以及文件夹名称。
// async function getRootObjectVersions() {
//   let nextKeyMarker = null;
//   let nextVersionMarker = null;
//   let versionListing = null;
//   do {
//     versionListing = await client.getBucketVersions({
//       keyMarker: nextKeyMarker,
//       versionIdMarker: nextVersionMarker,
//       delimiter: "/"
//     })
//     nextKeyMarker = versionListing.NextKeyMarker;
//     nextVersionMarker = versionListing.NextVersionIdMarker;
//     console.log(versionListing.objects);
//   } while (versionListing.isTruncated);
// }

// getRootObjectVersions();


module.exports = {
  ossClient: client
}