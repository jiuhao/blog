var koa = require('koa');
var staticCache = require('koa-static-cache');
var path = require('path');
var router = require('koa-router')();
var jade = require('jade');
var cache = require('./common/cache');

var app = koa();

//静态资源的支持
app.use(staticCache(path.join(__dirname, 'resource'), {maxAge: 365 * 24 * 60 * 60}));

//添加对渲染的缓存支持
cache = new cache(function (name) {
    return jade.renderFile(__dirname + '/view/' + name + '.jade');
}, 30 * 24 * 60 * 60);

app.use(function*(next) {
    this.render = function (name, data) {
        if (data) {
            this.body = jade.renderFile(__dirname + '/view/' + name + '.jade', data);
        } else {
            this.body = cache.get(name);
        }
    };
    yield next;
});

//界面渲染
router.get('/', function*() {
    this.render('index');
});
//界面渲染
router.get('/index', function*() {
    this.render('index');
});


app.use(router.routes());

app.listen(4009, function () {
    console.log('app start listen ', 4009);
});
