//  npm i request request-promise --save  发送请求的 工具
const rp = require("request-promise") // 发送请求的

const APPID = 'wx2921ee21e7f2621f'; // 小程序 oppid
const APPSECRET = '9d4f220f3ae169dd68238b9d96c2c913'; // AppSecret(小程序密钥)	
const URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`;

const fs = require('fs')
const path = require('path')
const fileName = path.resolve(__dirname, './access_token.json')

const updateAccessToken = async () => {
    console.log('access_token跟新了');

    // 通过发送请求：调用小程序服务，获取access_token  
    const resStr = await rp(URL);
    const res = JSON.parse(resStr)
    
    // 获取access_token 后，将access_token 进行保，保存到 json文件中
    // -->写文件
    if (res.access_token) {
        // 参一：文件路径  参二：内容，字符串
        fs.writeFileSync(fileName, JSON.stringify({
            access_token: res.access_token,
            createTime: new Date()
        }))
    } else {
        await updateAccessToken()
    }

}

const getAccessToken = async () => {
    // 读文件
    // 参一：文件路径  参二：如果没有值，返回的是buffer存的二进制数据，如果有值，那么返回对应类型utf8
    try {
        const readRes = fs.readFileSync(fileName, 'utf8')
        const readObj = JSON.parse(readRes)
        // 场景：服务宕机：宕机时间超过了access_token的获取时间
        // 解决宕机问题：用获取token时间与当前时间进行比较 是否 大于俩小时
        const createTime = new Date(readObj.createTime).getTime()
        const nowTime = new Date().getTime()
        if (nowTime - createTime >= 7200 * 1000) {
            // 宕机时间太长：access_token 过期了 --> 更新 access_token ---> 在获取token
            // console.log('宕机了...');
            await updateAccessToken()
            await getAccessToken()

        }

        return readObj.access_token
    } catch (err) {
        // 如果读文件失败 那么就进行更新 access_token，然后再次获取
        await updateAccessToken()
        await getAccessToken()
    }


}
// 防止过期
// 做一个触发器：解决宕机问题
setInterval(() => {
    updateAccessToken()
}, (7200 - 300) * 1000); // 提前五分钟


module.exports = getAccessToken

// 获取token 可以遇到的问题
// 1.过期问题
// 2.过期问题---> 定时器
// 3.宕机问题---> 用时间判断
