

const getAccessToken = require('../untils/getAccessToken')
const rp = require('request-promise')

/**
 * 触发云函数的方法封装
 * @param {*} ctx    服务的上下文对象
 * @param {*} fnName 云函数名字
 * @param {*} params 云函数需要的请求参数
 */
const callCloudFunction = async (ctx, fnName, params) => {
    // 触发云函数  通过云函数获取歌单列表  发送的是post请求
    const ACCESS_TOKEN = await getAccessToken()      // 访问接口的令牌
    // const ENV = 'zctest-cq8vw'                       // 云环境的id  

    const URL = `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${ACCESS_TOKEN}&env=${ctx.state.ENV}&name=${fnName}`

    const options = {
        url: URL,
        method: "POST",
        body: { // 请求云函数需要的参数
            ...params
        },
        json: true // 配置返回数据为jsoon 数据
    }
    return await rp(options).then((res) => {
        return res
    }).catch((err) => {
        return {
            msg: "触发云函数出错了",
            err
        }
    })

}
module.exports = callCloudFunction