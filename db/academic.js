"use strict";
/**
 * 学术集合
 * _id 标识
 * title 标题
 * outline 概要
 * content 内容
 * visits 0 访问量
 * comments 0 评论量
 * author{
 *      id: 用户id,
 *      nick: 用户昵称,
 *      headImageUrl: 用户头像
 * }
 * keywords 主题关键字数组
 * posterUrl 有图封面
 * publishTime 发布时间
 * updateTime 更新时间
 * status －1为删除 1为可用
 * **/
const ApiErrorNames = require('../error/ApiErrorNames');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');
/**
 * 创建一片学术文章
 * @param db
 * @param data
 * **/
exports.add = function *(db, data) {
    let now = new Date().getTime();
    let Academic = db.academic;
    let r = yield Academic.insert({
        _id: uuid.v1(),
        title: data.title,
        outline: data.outline,
        content: data.content,
        author: data.author,
        keywords: data.keywords,
        posterUrl: data.posterUrl.split('/data')[1] && 'data' + data.posterUrl.split('/data')[1] || '',
        visits: 0,
        comments: 0,
        publishTime: now,
        updateTime: now,
        status: 1
    });
    if (r.result.n != 1 || r.result.ok != 1) {
        throw new ApiError(ApiErrorNames.DB_EXCEPTION);
    }
};
/**
 * 逻辑删除
 * @param db
 * @param id 文章id
 * @param authorId 作者id
 * **/
exports.delete = function *(db, id, authorId) {
    let Academic = db.academic;
    let r = yield Academic.update({
        _id: id,
        'user.id': authorId
    }, {
        $set: {
            status: -1,
            updateTime: new Date().getTime()
        }
    });
    if (r.result.n != 1 || r.result.ok != 1) {
        throw new ApiError(ApiErrorNames.DB_EXCEPTION);
    }
};

/**
 * 更新内容
 * @param db
 * @param id 文章id
 * @param authorId 作者id
 * @param data
 * **/
exports.update = function *(db, id, authorId, data) {
    let Academic = db.academic;
    let r = yield Academic.update({
        _id: id,
        'user.id': authorId
    }, {
        $set: {
            title: data.title,
            outline: data.outline,
            content: data.content,
            updateTime: new Date().getTime()
        }
    });
    if (r.result.n != 1 || r.result.ok != 1) {
        throw new ApiError(ApiErrorNames.DB_EXCEPTION);
    }
};
/**
 * 更新浏览量
 * @param db
 * @param id 文章id
 * **/
exports.updateVisits = function *(db, id) {
    let Academic = db.academic;
    let r = yield Academic.update({
        _id: id
    }, {
        $inc: {
            visits: 1
        }
    });
    if (r.result.n != 1 || r.result.ok != 1) {
        throw new ApiError(ApiErrorNames.DB_EXCEPTION);
    }
};
/**
 * 更新评论量
 * @param db
 * @param id 文章id
 * **/
exports.updateComments = function *(db, id) {
    let Academic = db.academic;
    let r = yield Academic.update({
        _id: id
    }, {
        $inc: {
            comments: 1
        }
    });
    if (r.result.n != 1 || r.result.ok != 1) {
        throw new ApiError(ApiErrorNames.DB_EXCEPTION);
    }
};
/**
 * 查看学术文章详情
 * @param db
 * @param id 文章id
 * **/
exports.load = function *(db, id) {
    let Academic = db.academic;
    let r = yield Academic.findOne({
        _id: id
    }, {
        _id: true,
        title: true,
        outline: true,
        content: true,
        visits: true,
        comments: true,
        author: true,
        keywords: true,
        publishTime: true
    });
    if (!r) {
        throw new ApiError(ApiErrorNames.CONTENT_NOT_EXIST);
    }
    return r;
};
/**
 * 关键字搜索
 * @param db
 * @param keyword
 * @param currentPage
 * @param size
 * **/
exports.listByKeyword = function *(db, keyword, currentPage, size) {
    let skip = (currentPage - 1) * size;
    let query = {};
    if (keyword) {
        let reg = new RegExp(keyword);
        query.$or = [{
            title: reg
        }, {
            outline: reg
        }];
    }
    let Academic = db.academic;
    let data = yield Academic.find(query, {
        _id: true,
        title: true,
        outline: true,
        content: true,
        visits: true,
        comments: true,
        author: true,
        publishTime: true
    }).toArray().sort({updateTime: -1});
    let count = yield Academic.count(query);
    return {
        count: count,
        data: data
    };
};
/**
 * 数量统计
 * **/
exports.count = function *(db) {
    let Academic = db.academic;
    return yield Academic.count();
};
/**
 * 8个推荐
 * **/
exports.recommendArticle = function *(db) {
    let Academic = db.academic;
    return yield Academic.find({
        posterUrl: {$ne: ''}
    }, {
        _id: true,
        title: true,
        outline: true,
        content: true,
        posterUrl: true,
        visits: true,
        comments: true,
        author: true,
        publishTime: true
    }).sort({updateTime: -1}).limit(8).toArray();
};
/**
 * 获取学术资讯
 * **/
exports.getAcademics = function *(db, currentPage, size) {
    let skip = (currentPage - 1) * size;
    let Academic = db.academic;
    return yield Academic.find({
        posterUrl: {$ne: ''}
    }, {
        _id: true,
        title: true,
        outline: true,
        content: true,
        posterUrl: true,
        visits: true,
        comments: true,
        author: true,
        publishTime: true
    }).skip(skip).sort({updateTime: -1}).limit(size).toArray();
};
/**
 * 获取排行
 * **/
exports.getRanking = function *(db, currentPage, size) {
    let skip = (currentPage - 1) * size;
    let Academic = db.academic;
    return yield Academic.find({}, {
        _id: true,
        title: true,
        outline: true,
        content: true,
        posterUrl: true,
        visits: true,
        comments: true,
        author: true,
        publishTime: true
    }).skip(skip).sort({visits: -1, publishTime: -1}).limit(size).toArray();
};
/**
 * 获取所有的博客
 * **/
exports.listAll = function *(db, id) {
    let Academic = db.academic;
    return yield Academic.find({
        _id: {$ne: id},
        keywords: {$exists: true}
    }, {
        _id: true,
        title: true,
        outline: true,
        posterUrl: true,
        author: true,
        keywords: true,
        publishTime: true
    }).toArray();
};
exports.getPersonalData = function *(db, userId, currentPage, size) {
    let skip = (currentPage - 1) * size;
    let Academic = db.academic;
    return yield Academic.find({
        'author.id': userId,
        status: 1
    }, {
        _id: true,
        title: true,
        outline: true,
        content: true,
        posterUrl: true,
        visits: true,
        comments: true,
        author: true,
        publishTime: true
    }).skip(skip).sort({visits: -1, publishTime: -1}).limit(size).toArray();
};