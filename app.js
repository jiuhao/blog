const koa = require('koa');
const staticCache = require('koa-static-cache');
const convert = require('koa-convert');
const path = require('path');
const router = require('koa-router')();
const jade = require('jade');
const server = require('./common/server');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const co = require('co');
const response_formatter = require('./middlewares/response_formatter');
//log工具
const logUtil = require('./utils/log_util');
const app = new koa();
let cache = require('./common/cache');
app.use(convert(cors()));
app.use(bodyParser({enableTypes: ['text', 'json', "form"], jsonLimit: '100mb'}));
//静态资源的支持
app.use(staticCache(path.join(__dirname, 'public'), {maxAge: 365 * 24 * 60 * 60}));

//添加对渲染的缓存支持
cache = new cache(function (name) {
    return jade.renderFile(__dirname + '/view/' + name + '.jade');
}, 30 * 24 * 60 * 60);

app.use(async(ctx, next) => {
    ctx.render = function (name, data) {
        // if (data) {
        //     this.body = jade.renderFile(__dirname + '/view/' + name + '.jade', data);
        // } else {
        //     this.body = cache.get(name);
        // }
        this.body = jade.renderFile(__dirname + '/view/' + name + '.jade', data);
    };
    await next();
});

// logger
app.use(async(ctx, next) => {
    //响应开始时间
    const start = new Date();
    //响应间隔时间
    let ms;
    try {
        //开始进入到下一个中间件
        await next();
        ms = new Date() - start;
        //记录响应日志
        logUtil.logResponse(ctx, ms);

    } catch (error) {

        ms = new Date() - start;
        //记录异常日志
        logUtil.logError(ctx, error, ms);
    }
});

//仅对/api开头的url进行格式化处理
app.use(response_formatter('^/api'));

for (let name in server) {
    let fn = server[name];
    router.post("/api/" + name, async(ctx, next) => {
        ctx.body = await new Promise(function (res, rej) {
            co(function*() {
                try {
                    if (!(ctx.request.body instanceof Array)) {
                        let arr = [];
                        for (let item in ctx.request.body) {
                            arr.push(ctx.request.body[item]);
                        }
                        ctx.request.body = arr;
                    }
                    console.log(name, ctx.request.body);
                    let result = yield fn.apply(fn, ctx.request.body);
                    res(result);
                } catch (e) {
                    rej(e);
                }
            });
        });
    });
}

//页面路由
router.get('/', async(ctx, next) => {
    ctx.render('index');
});
//登录注册
router.get('/sign', async(ctx, next) => {
    ctx.render('sign');
});
router.get('/editor', async(ctx, next) => {
    ctx.render('editor');
});
router.get('/index', async(ctx, next) => {
    ctx.render('index');
});
router.get('/article', async(ctx, next) => {
    ctx.render('article');
});
router.get('/personalCenter', async(ctx, next) => {
    ctx.render('personalCenter');
});
app.use(router.routes());

app.listen(4009, function () {
    console.log('app start listen ', 4009);
});
