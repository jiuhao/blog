const uuid = require('uuid');
const ApiError = require('../error/ApiError');
const ApiErrorNames = require('../error/ApiErrorNames');
/**
 * 文件上传
 * **/
exports.upload = function *(file, suffix) {
    let name = uuid.v4() + '.' + suffix;
    let local = path.join(__dirname, '../public/data/images') + '/' + name;
    if (!file || !file.length) {
        throw new ApiError(ApiErrorNames.FILE_EMPTY);
    }
    //写到本地文件夹
    try {
        fs.writeFileSync(local, file);
    } catch (e) {
        throw new ApiError(ApiErrorNames.WRITE_FILE_ERROR);
    }
    let remote = '/public/data/images' + '/' + name;
    console.log('fileUrl:', remote);
    return remote;
};
/**
 * 文件删除
 * **/
exports.remove = function *(local) {
    local = path.join(__dirname, '..' + local);
    //删除文件
    try {
        fs.unlinkSync(local);
    } catch (e) {
        throw new ApiError(ApiErrorNames.READ_FILE_ERROR);
    }
    return 'success';
};