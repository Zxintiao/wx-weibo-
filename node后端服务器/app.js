const koa = require('koa')
const Router = require('koa-router')
const app = new koa();
const router = new Router()
const cors = require('koa2-cors') // 解决跨域拦截
const ENV = 'zc-weibo-0spfn'        // 云环境的id  
var koaBody = require('koa-body');  // 接受  form-data  图片文件等... formmidabale  

// const playlist = require('./controller/playlist')
// router.use('/playlist', playlist.routes()) // 将playlist路由挂到一级路由上
// const swiper = require('./controller/swiper')
// router.use('/swiper', swiper.routes()) // 将swiper路由挂到一级路由上
const blog = require('./controller/blog')
router.use('/blog', blog.routes()) // 将blog路由挂到一级路由上

// 全局路由
app.use(async (ctx, next) => {
    ctx.state.ENV = ENV
    await next()
})

app.use(cors({
    origin: ['http://localhost:9528'],  // 允许那些地址访问服务
    credentials: true
}))


app.use(koaBody({
    multipart: true
}));
app.use(router.routes());            // 将一级路由华仔到服务上
app.use(router.allowedMethods())    // 允许访问路由
app.listen(3000, () => {
    console.log('node is ok');

})
// MVC
