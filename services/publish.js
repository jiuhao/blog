"use strict";
const Database = require('../common/database');
const Session = require('../db/session');
const Academic = require('../db/academic');
const ApiError = require('../error/ApiError');
const ApiErrorNames = require('../error/ApiErrorNames');
const Time = require('../utils/time');
const Properties = require('../utils/properties');
/**
 * 发布学术文章
 * @param param
 * **/
exports.publishToAcademic = Database.warp(function *(db, session, param) {
    let title = param.title;
    let outline = param.outline;
    let content = param.content;
    if (!title || !outline || !content) {
        throw new ApiError(ApiErrorNames.PARAM_ERROR);
    }
    let operator = yield Session.check(db, session.id, session.timestamp, session.sign);
    //发布文章
    yield Academic.add(db, {
        title: title,
        outline: outline,
        content: content,
        author: {
            id: operator.id,
            nick: operator.nick,
            headImageUrl: operator.headImageUrl
        }
    });
    return 'success';
});
/**
 * 访问量增加
 * @param id 被访问对象的id
 * @param type 被访问对象的类型'academic'/'topic'/
 * **/
exports.addVisits = Database.warp(function *(db, id, type) {
    if (type == 'academic') {
        yield Academic.updateVisits(db, id);
    }
    return 'success';
});
/**
 * 根据关键词查询
 * @param param{type, keyword, currentPage, size} type 被访问对象的类型'academic'/'topic'/
 * **/
exports.listByKeyword = Database.warp(function *(db, param) {
    let type = param.type;
    let keyword = param.keyword;
    let currentPage = param.currentPage;
    let size = param.size;
    if (!currentPage || isNaN(currentPage) || currentPage <= 0 || !size || isNaN(size) || size <= 0) {
        throw new ApiError(ApiErrorNames.PARAM_ERROR);
    }
    let strategy = {
        'academic': yield Academic.listByKeyword(db, keyword, currentPage, size)
    };
    if (['academic', 'topic'].indexOf(type)) {
        return strategy[type];
    } else {
        return {
            academics: yield Academic.listByKeyword(db, keyword, currentPage, size)
        }
    }
});
/**
 * 获取存在的数据
 * **/
exports.getNum = Database.warp(function *(db) {
    return {
        academic: yield Academic.count(db),
        topic: 0,
        vote: 0,
        activity: 0,
        emotion: 0,
        event: 0,
        help: 0
    }
});
/**
 * 查看文章
 * **/
exports.getArticle = Database.warp(function *(db, session, id) {
    let operator;
    if (session && session.id) {
        operator = yield Session.check(db, session.id, session.timestamp, session.sign);
    }
    let article = yield Academic.load(db, id);
    article.articleId = article._id;
    delete article._id;
    article.publishTime = Time.getTime(article.publishTime);
    return article;
});
/**
 * 查看推荐
 * **/
exports.recommendArticle = Database.warp(function *(db) {
    let r = yield Academic.recommendArticle(db);
    for (let i = 0; i < r.length; i++) {
        r[i].articleId = '' + r[i]._id;
        delete r[i]._id;
        r[i].posterUrl = Properties.baseUrl + r[i].posterUrl || '';
        r[i].publishTime = Time.getTime(r[i].publishTime);
    }
    return r;
});