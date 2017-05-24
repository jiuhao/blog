const User = require('../services/user');
const Publish = require('../services/publish');
const System = require('../services/sys');

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
//查看学术
service.getAcademics = Publish.getAcademics;
//文件上传
service.upload = System.upload;
//排行
service.getRanking = Publish.getRanking;
//获取相似推荐
service.getSimilar = System.getSimilar;
//查看个人的数据
service.getPersonalData = Publish.getPersonalData;
//查看推荐好友
service.getFriends = User.getFriends;
module.exports = service;