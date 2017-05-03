const User = require('../services/user');
const Publish = require('../services/publish');
//接口api
const service = {};
//用户注册
service.register = User.register;
//用户登录
service.login = User.login;
//
service.getNum = Publish.getNum;
//发表学术文章
service.publishToAcademic = Publish.publishToAcademic;
module.exports = service;