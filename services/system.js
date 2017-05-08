'use strict';
//系统功能
const formidable = require('formidable');
const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const uuid = require('uuid');
const ApiError = require('../error/ApiError');
const ApiErrorNames = require('../error/ApiErrorNames');

// 文件将要上传到哪个文件夹下面
const uploadFolderName = '../public/data/images';
const uploadFolderPath = path.join(__dirname, uploadFolderName);
const returnFolderName = 'data/images';
/**
 * 文件上传
 * **/
exports.upload = function *(ctx) {
    try {
        if (ctx.req.url === '/api/upload' && ctx.req.method.toLowerCase() === 'post') {
            // 使用第三方的 formidable 插件初始化一个 form 对象
            let form = new formidable.IncomingForm();
            // 处理 request
            try {
                return yield new Promise(function (res, rej) {
                    form.parse(ctx.req, function (err, fields, files) {

                        if (err) {
                            console.log('formidable, form.parse err');
                            rej(err);
                        }
                        console.log('formidable, form.parse ok');

                        // 显示参数，例如 token
                        console.log('显示上传时的参数 begin');
                        console.log(fields);
                        console.log('显示上传时的参数 end');

                        let item;

                        // 计算 files 长度
                        let length = 0;
                        for (item in files) {
                            length++;
                        }
                        if (length === 0) {
                            console.log('files no data');
                            return;
                        }

                        for (item in files) {
                            let file = files[item];
                            // formidable 会将上传的文件存储为一个临时文件，现在获取这个文件的目录
                            let tempFilePath = file.path;
                            // 获取文件类型
                            let type = file.type;
                            // 获取文件名，并根据文件名获取扩展名
                            let fileName = file.name;
                            let extName = fileName.lastIndexOf('.') >= 0
                                ? fileName.slice(fileName.lastIndexOf('.') - fileName.length)
                                : '';
                            // 文件名没有扩展名时候，则从文件类型中取扩展名
                            if (extName === '' && type.indexOf('/') >= 0) {
                                extName = '.' + type.split('/')[1];
                            }
                            // 将文件名重新赋值为一个随机数（避免文件重名）
                            fileName = uuid.v1() + extName;

                            // 构建将要存储的文件的路径
                            let fileNewPath = path.join(uploadFolderPath, fileName);

                            // 将临时文件保存为正式的文件
                            fs.rename(tempFilePath, fileNewPath, function (err) {
                                // 存储结果
                                if (err) {
                                    // 发生错误
                                    console.log('fs.rename err');
                                    rej(err);
                                } else {
                                    // 保存成功
                                    console.log('fs.rename done');
                                    // 拼接图片url地址
                                    res('http://localhost:4009/' + returnFolderName + '/' + fileName);
                                }

                            }); // fs.rename
                        } // for in
                    });
                });
            } catch (e) {
                new ApiError(ApiErrorNames.UPLOAD_FAILED);
            }
        }
    } catch (e) {
        console.log(e);
    }
};