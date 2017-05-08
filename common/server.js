const User = require('../services/user');
const Publish = require('../services/publish');
const System = require('../services/system');
//接口api
const service = {};
//用户注册
service.register = User.register;
//用户登录
service.login = User.login;
//用户注销
service.logout = User.logout;
//获取首页数量数据
service.getNum = Publish.getNum;
//获取个人中心数量数据
service.getUserNum = User.getUserNum;
//发表学术文章
service.publishToAcademic = Publish.publishToAcademic;
//查看文章
service.getArticle = Publish.getArticle;
//查看推荐
service.recommendArticle = Publish.recommendArticle;
//文件上传
service.upload = System.upload;
module.exports = service;