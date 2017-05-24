/**
 * _id: 评论的id
 * userId: 动态id
 * headImageUrl: 头像地址
 * timestamp: 时间戳
 * **/

var mongo = require('co-mongo');
var Url = require('../util/url');
/**
 * 新增未读评论
 * @param: userId 用户id
 * @param: headImageUrl 头像
 * **/
exports.add = function *(db, comment) {
    comment.hUrl = comment.hUrl ? comment.hUrl: Url.defaultHeadImageUrl;
    var Comment = db.noReadComment;
    yield Comment.insert({
        _id: comment._id,
        userId: comment.userId + '',
        headImageUrl: comment.hUrl,
        timestamp: new Date().getTime()
    });
};
/**
 * 查询未送达的消息
 * **/
exports.listNotArrive = function *(db, userId) {
    var Comment = db.noReadComment;
    return yield Comment.find({
        userId: userId
    }, {
        _id: true,
        headImageUrl: true
    }).sort({timestamp: -1}).toArray();
};
/**
 * 更新评论为已送达
 * **/
exports.alreadyArrive = function *(db, idArray) {
    var NoReadComment = db.noReadComment;
    var Comment = db.comment;
    //删除noComment的
    yield NoReadComment.remove({
        _id: {
            $in: idArray
        }
    });
    for (var i = 0, l = idArray.length; i < l; i++) {
        idArray[i] = mongo.ObjectId(idArray[i]);
    }
    //修改comment里面的
    yield Comment.update({
        _id: {
            $in: idArray
        }
    }, {
        $set: {
            flag: 1
        }
    }, {
        multi: true
    });
};