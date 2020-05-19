// 这里的路由写的是与歌单管理有关的控
const Router = require('koa-router')
const router = new Router()
const callCloudFunction = require("../untils/callCloudFunction.js")    // 封装的触发云函数的方法
const callCloudDB = require("../untils/callCloudDB.js")    // 封装的httpAPI操作云数据库 方法封装
const callCloudStorage = require("../untils/callCloudStorage.js")    // 封装的httpAPI操作云数据库 方法封装

// 查询博客
router.get('/list', async (ctx, next) => {
    // get  使用 ctx.request.query
    const params = ctx.request.query
    // query中应使用limit()限制单次拉取的数量，默认10条。
    const query = `
    db.collection('blog').skip(${params.start}).limit(${params.count}).orderBy('createdTime','desc').get()
    `
    const res = await callCloudDB(ctx, 'databasequery', query);
    if (res.data) {
        ctx.body = ({
            code: 20000,
            data: res.data
        })
    } else {
        ctx.body = ({
            err: res.errmas
        })
    }
})
// 查询博客详情
router.get('/detail', async (ctx, next) => {
    // get  使用 ctx.request.query
    const params = ctx.request.query
    const query = `
    db.collection('blog').where({
        _id:"${params._id}"
      }).get()
    `
    const res = await callCloudDB(ctx, 'databasequery', query);
    if (res.data) {
        ctx.body = ({
            code: 20000,
            data: res.data
        })
    } else {
        ctx.body = ({
            err: res.errmas
        })
    }
})
// 下载博客中的图片
router.post('/downImage', async (ctx, next) => {
    // POST  使用 ctx.request.body
    const params = ctx.request.body
    let fileList = []
    params.downImage.forEach(fileItem => {
        fileList.push({
            fileid: fileItem,
            max_age: 7200
        })
    })

    let downloadRes = await callCloudStorage.download(ctx, fileList)

    let resultData = [];
    downloadRes.file_list.forEach((item, index) => {
        resultData.push({
            download_url: item.download_url,
            fileid: item.fileid
        })
    })
    ctx.body = {
        code: 20000,
        data: resultData
    }
})

// 删除博客
router.post('/del', async (ctx, next) => {
    // POST  使用 ctx.request.body
    const params = ctx.request.body
    // 删除blog
    const queryBlog = `db.collection('blog').where({_id:"${params._id}"}).remove()`;
    const delBlogRes = await callCloudDB(ctx, 'databasedelete', queryBlog)

    // 删除blog-comment
    const queryComment = `db.collection('blog-comment').where({blogId:"${params._id}"}).remove()`;
    const delCommentRes = await callCloudDB(ctx, 'databasedelete', queryComment)

    // 删除图片
    const delStorageRes = await callCloudStorage.delete(ctx, params.img)

    ctx.body = ({
        code: 20000,
        data: {
            delBlogRes,
            delCommentRes,
            delStorageRes
        }
    })
})

// // 修改博客
// router.post('/update', async (ctx, next) => {
//     // POST  使用 ctx.request.body
//     const params = ctx.request.body
//     // 删除blog
//     // const queryBlog = `db.collection('blog')
//     // .where({_id:"${params._id}"})
//     // .update({
//     //     data: {
//     //       content:${params.content}
//     //     }
//     //   })`;
//     // const delBlogRes = await callCloudDB(ctx, 'databasedelete', queryBlog)

//     ctx.body = ({
//         code: 20000,
//         data: {
//             delBlogRes,
//             delCommentRes,
//             delStorageRes
//         }
//     })
// })

module.exports = router