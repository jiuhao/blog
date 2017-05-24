"use strict";
const Database = require('../common/database');
const Session = require('../db/session');
const Academic = require('../db/academic');
const ApiError = require('../error/ApiError');
const ApiErrorNames = require('../error/ApiErrorNames');
const Time = require('../utils/time');
const Properties = require('../utils/properties');
const nodejieba = require('nodejieba');
/**
 * 发布学术文章
 * @param param{html,text,imgs}
 * **/
exports.publishToAcademic = Database.warp(function *(db, session, param) {
    let html = param.html;
    let text = param.text;
    if (!html || !text) {
        throw new ApiError(ApiErrorNames.PARAM_ERROR);
    }
    let operator = yield Session.check(db, session.id, session.timestamp, session.sign);
    let title = '我的标题我做主';
    let strategy = {
        1: param.html.match(/<h1 (.*)>(.*)<\/h1>/),
        2: param.html.match(/<h2 (.*)>(.*)<\/h2>/),
        3: param.html.match(/<h3 (.*)>(.*)<\/h3>/),
        4: param.html.match(/<h4 (.*)>(.*)<\/h4>/),
        5: param.html.match(/<h5 (.*)>(.*)<\/h5>/)
    };
    for (let i = 1; i < 6; i++) {
        strategy[i];
        title = RegExp.$2;
        console.log('title&*&*:', title);
        if (title) {
            break;
        }
    }
    if (!title) {
        title = '我的标题我做主';
    }
    let keywords = [];
    //获取标题摘要
    let tmp = nodejieba.extract(text, 5);
    for (let item of tmp) {
        keywords.push(item.word);
    }
    //发布文章
    yield Academic.add(db, {
        title: title,
        outline: keywords.toString() || '暂无简介',
        content: html,
        posterUrl: param.posterUrl || operator.headImageUrl,
        author: {
            id: operator.id,
            nick: operator.nick,
            headImageUrl: operator.headImageUrl
        },
        keywords: keywords
    });
    return {
        title: title || '未检测到标题',
        outline: keywords.toString() || '暂无简介'
    };
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
    article.publishTime = Time.getYearMonthDay(article.publishTime);
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
//
exports.getAcademics = Database.warp(function *(db, currentPage, size) {
    currentPage = parseInt(currentPage);
    size = parseInt(size);
    try {
        if (!currentPage || isNaN(currentPage) || currentPage <= 0 || !size || isNaN(size) || size <= 0) {
            throw new ApiError(ApiErrorNames.PARAM_ERROR);
        }
        let r = [];
        r = yield Academic.getAcademics(db, currentPage, size);
        for (let i = 0; i < r.length; i++) {
            r[i].articleId = '' + r[i]._id;
            delete r[i]._id;
            r[i].posterUrl = Properties.baseUrl + r[i].posterUrl || '';
            r[i].publishTime = Time.getTime(r[i].publishTime);
        }
        return r;
    } catch (e) {
        console.log(e);
        throw e;
    }
});
/**
 * 获取排行
 * **/
exports.getRanking = Database.warp(function *(db, type, currentPag, size) {
    if (!type) {
        throw new ApiError(ApiErrorNames.PARAM_ERROR);
    }
    currentPag = parseInt(currentPag);
    size = parseInt(size);
    let r = [];
    if ('academic' == type) {
        r = yield Academic.getRanking(db, currentPag, size);
        for (let i = 0; i < r.length; i++) {
            r[i].posterUrl = r[i].posterUrl && Properties.baseUrl + r[i].posterUrl || '';
            r[i].author.headImageUrl = Properties.baseUrl + r[i].author.headImageUrl;
            r[i].publishTime = Time.getTime(r[i].publishTime);
        }
    }
    return r;
});
/**
 * 查看个人数据
 * **/
exports.getPersonalData = Database.warp(function *(db, session, param) {
    let currentPag = parseInt(param.currentPage);
    let size = parseInt(param.size);
    let operator = yield Session.check(db, session.id, session.timestamp, session.sign);
    let r = {};
    if ('academic' == param.type) {
        r.academic = yield Academic.getPersonalData(db, operator.id, currentPag, size);
        for (let i = 0; i < r.academic.length; i++) {
            r.academic[i].posterUrl = r.academic[i].posterUrl && Properties.baseUrl + r.academic[i].posterUrl || '';
            r.academic[i].author.headImageUrl = Properties.baseUrl + r.academic[i].author.headImageUrl;
            // console.log('r.academic[i].publishTime', r.academic[i].publishTime);
            r.academic[i].publishTime = Time.getTime(r.academic[i].publishTime);
            // console.log('r.academic[i].publishTime***', r.academic[i].publishTime);
        }
    }
    // console.log('r:', r);
    return r;
});