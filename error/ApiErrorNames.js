/**
 * API错误名称
 */
const ApiErrorNames = {};

ApiErrorNames.UNKNOW_ERROR = 'unknowError';
ApiErrorNames.USER_NOT_EXIST = 'userNotExist';
ApiErrorNames.NOT_LOGIN = 'notLogin';
ApiErrorNames.DB_EXCEPTION = 'dbException';
ApiErrorNames.SIGN_ERROR = 'signError';
ApiErrorNames.SESSION_EXPIRE = 'sessionExpire';
ApiErrorNames.LOGIN_ERROR = 'loginError';
ApiErrorNames.PARAM_ERROR = 'paramError';
ApiErrorNames.ALREADY_REGISTER = 'alreadyRegister';
ApiErrorNames.NOT_REGISTER = 'notRegister';
ApiErrorNames.INFO_ERROR = 'infoError';
ApiErrorNames.FILE_EMPTY = 'fileEmpty';
ApiErrorNames.WRITE_FILE_ERROR = 'writeFileError';
ApiErrorNames.READ_FILE_ERROR = 'readFileError';
ApiErrorNames.UPLOAD_FAILED = 'uploadFailed';
ApiErrorNames.CONTENT_NOT_EXIST = 'contentNotExist';
/**
 * API错误名称对应的错误信息
 */
const error_map = new Map();

error_map.set(ApiErrorNames.UNKNOW_ERROR, {code: -1, message: '未知错误'});
error_map.set(ApiErrorNames.USER_NOT_EXIST, {code: 101, message: '用户不存在'});
error_map.set(ApiErrorNames.NOT_LOGIN, {code: 102, message: '未登录'});
error_map.set(ApiErrorNames.SIGN_ERROR, {code: 103, message: '签名错误'});
error_map.set(ApiErrorNames.SESSION_EXPIRE, {code: 104, message: '会话过期'});
error_map.set(ApiErrorNames.LOGIN_ERROR, {code: 105, message: '账户名或密码错误'});
error_map.set(ApiErrorNames.PARAM_ERROR, {code: 106, message: '参数错误'});
error_map.set(ApiErrorNames.ALREADY_REGISTER, {code: 107, message: '该账号已注册'});
error_map.set(ApiErrorNames.NOT_REGISTER, {code: 108, message: '该账号未注册'});
error_map.set(ApiErrorNames.INFO_ERROR, {code: 109, message: '信息错误'});
error_map.set(ApiErrorNames.FILE_EMPTY, {code: 110, message: '文件为空'});
error_map.set(ApiErrorNames.WRITE_FILE_ERROR, {code: 111, message: '写文件错误'});
error_map.set(ApiErrorNames.READ_FILE_ERROR, {code: 112, message: '读文件错误'});
error_map.set(ApiErrorNames.UPLOAD_FAILED, {code: 113, message: '文件上传失败'});
error_map.set(ApiErrorNames.CONTENT_NOT_EXIST, {code: 114, message: '访问的内容已不复存在'});
//根据错误名称获取错误信息
ApiErrorNames.getErrorInfo = (errorName) => {
    let error_info;

    if (errorName) {
        error_info = error_map.get(errorName);
    }
    //如果没有对应的错误信息，默认'未知错误'
    if (!error_info) {
        errorName = 'unknowError';
        error_info = error_map.get(errorName);
    }
    return error_info;
};

module.exports = ApiErrorNames;