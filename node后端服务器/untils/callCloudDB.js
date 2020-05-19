/**
 * httpAPI操作云数据库 方法封装
 */
const getAccessToken = require('../untils/getAccessToken')
const rp = require('request-promise')


const callCloudDB = async (ctx, fnName, query = {}) => {
    // 触发云函数  通过云函数获取歌单列表  发送的是post请求
    const ACCESS_TOKEN = await getAccessToken()      // 访问接口的令牌
    
    let options = {
        method: "POST",
        url: `https://api.weixin.qq.com/tcb/${fnName}?access_token=${ACCESS_TOKEN}`,
        body: {
            "env": ctx.state.ENV,
            "query": query
        },
        json: true
    }
    return await rp(options).then((res) => {
        return res
    }).catch((err) => {
        // console.log(err);
        return err
    })


}
module.exports = callCloudDB