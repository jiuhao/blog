/**
 * 时间戳转格式
 * @param date 时间戳
 * @return {string}
 */
exports.getTime = function (date) {
    date = new Date(date);
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = date.getDate() < 10 ? '0' + date.getDate() + ' ' : date.getDate() + ' ';
    let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    let s = date.getSeconds();
    return Y + M + D + h + m;
};

/**
 * 时间戳转格式
 * @param date 时间戳
 * @return {string}
 */
exports.getYearMonthDay = function (date) {
    date = new Date(date);
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = date.getDate() + 1 < 10 ? '0' + date.getDate() : date.getDate();
    return Y + M + D;
};