// 这里的路由写的是与歌单管理有关的控
const Router = require('koa-router')
const router = new Router()
const callCloudFunction = require("../untils/callCloudFunction.js")    // 封装的触发云函数的方法
const callCloudDB = require("../untils/callCloudDB.js")    // 封装的httpAPI操作云数据库 方法封装
const callCloudStorage = require("../untils/callCloudStorage.js")    // 封装的httpAPI操作云数据库 方法封装

// 获取轮播图列表接口
router.get('/list', async (ctx, next) => {
    // httpAPI 操作数据库 每次最多 可以获取10条
    const query = `db.collection('swiper').get()`;
    const res = await callCloudDB(ctx, 'databasequery', query)
    // 不能直接响应 云存储的地址 ，因为图片在网页段不识别

    // httpAPI 操作云存储 获取 页面可以识别的 地址
    let fileList = []
    const data = res.data
    data.forEach(fileItem => {
        fileList.push({
            fileid: JSON.parse(fileItem).fileid,
            max_age: 7200
        })
    })
    let downloadRes = await callCloudStorage.download(ctx, fileList)
    let resultData = [];
    downloadRes.file_list.forEach((item, index) => {
        resultData.push({
            download_url: item.download_url,
            fileid: item.fileid,
            _id: JSON.parse(data[index])._id
        })
    })
    ctx.body = {
        code: 20000,
        data: resultData
    }
})

// 上传图片
router.post('/upload', async (ctx, next) => {
    // 1 将图片上传到云存储中
    let fileid = await callCloudStorage.upload(ctx);
    console.log(fileid);

    // 2：将云存储中地址存到云数据库中  （官网的写法）
    const query = `
    db.collection('swiper').add({
        data:{
            fileid:'${fileid}'
        }
    })
    `
    const res = await callCloudDB(ctx, 'databaseadd', query);
    console.log(res)
    ctx.body = {
        code: 20000,
        id_list: res.id_list
    }
})

// 删除图片
router.get("/del", async (ctx, next) => {
    const params = ctx.request.query
    
    // 删除云数据中的内容
    const query = `db.collection("swiper").where({_id:'${params._id}'}).remove()`
    let delDBRes = await callCloudDB(ctx, "databasedelete", query)

    // 删掉云存储 参二：类型是一个数组
    let delStorageRes = await callCloudStorage.delete(ctx, [params.fileid]);
    
    ctx.body = {
        code: 20000,
        data: {
            delDBRes,
            delStorageRes
        }
    }

})


module.exports = router