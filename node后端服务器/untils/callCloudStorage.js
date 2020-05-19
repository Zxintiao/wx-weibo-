/**
 * httpAPI操作云数据库 方法封装
 */
const getAccessToken = require('../untils/getAccessToken')
const rp = require('request-promise')
const fs = require('fs')
// 访问接口的令牌

const cloudStorage = {
    // 下载图片
    // https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=ACCESS_TOKEN
    async download(ctx, file_list) {
        const ACCESS_TOKEN = await getAccessToken()
        const options = {
            method: "POST",
            url: `https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=${ACCESS_TOKEN}`,
            body: {
                "env": ctx.state.ENV,
                "file_list": file_list
            },
            json: true
        }
        return await rp(options).then((res) => {
            return res
        }).catch((err) => {
            return err
        })

    },

    // 上传图片
    // https://api.weixin.qq.com/tcb/uploadfile?access_token=ACCESS_TOKEN
    async upload(ctx) {
        // 1.获取请求参数
        const ACCESS_TOKEN = await getAccessToken()
        // post 请求 接收非文件
        const file = ctx.request.files.file
        const path = `swiper/${Date.now()}-${Math.random()}-${file.name}`
        const options = {
            method: "POST",
            url: `https://api.weixin.qq.com/tcb/uploadfile?access_token=${ACCESS_TOKEN}`,
            body: {
                "env": ctx.state.ENV,
                path
            },
            json: true
        }
        const info = await rp(options).then((res) => {
            return res
        }).catch((err) => {
            return err
        })
        // 2.上传图片  ---> 按照官方文档说明
        const params = {
            method: "POST",
            headers: {
                "content-type": "multipart/form-data",
            },
            url: info.url,
            formData: {
                key: path,
                Signature: info.authorization,
                "x-cos-security-token": info.token,
                "x-cos-meta-fileid": info.cos_file_id,
                file: fs.createReadStream(file.path) // 编程二进制文件（fs中的createReadStream方法可以让文件读取文件编程二进制）
            },
            json: true
        }
        await rp(params)
        return info.file_id
    },
    
    // 删除云存储内容
    // https://api.weixin.qq.com/tcb/batchdeletefile?access_token=ACCESS_TOKEN
    async delete(ctx, fileid_list) {
        const ACCESS_TOKEN = await getAccessToken()
        const options = {
            method: "POST",
            url: `https://api.weixin.qq.com/tcb/batchdeletefile?access_token=${ACCESS_TOKEN}`,
            body: {
                env: ctx.state.ENV,
                fileid_list
            },
            json: true
        }
        await rp(options).then((res) => {
            // console.log(res);
            return res
        }).catch(err => err)
    }
}

module.exports = cloudStorage