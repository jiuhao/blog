/**
 * Created by liu on 16/10/5.
 */

/**
 * 时间戳转格式
 * @param date 时间戳
 * @return {string}
 */
exports.getTime = function (date) {
    var date = new Date(date);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() < 10 ? '0' + date.getDate() + ' ' : date.getDate() + ' ';
    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var s = date.getSeconds();
    return Y + M + D + h + m;
};

/**
 * 时间戳转格式
 * @param date 时间戳
 * @return {string}
 */
exports.getYearMonthDay = function (date) {
    var date = new Date(date);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() + 1 < 10 ? '0' + date.getDate() : date.getDate();
    return Y + M + D;
};

/**
 * 得到一个月前日期的时间戳
 * @param date 当前时间戳
 * @return {string}
 */
exports.getPreMonth = function (date) {
    date = new Date(date);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate();
    date = Y + M + D;
    var arr = date.split('-');
    var year = arr[0]; //获取当前日期的年份
    var month = arr[1]; //获取当前日期的月份
    var day = arr[2]; //获取当前日期的日
    var days = new Date(year, month, 0);
    days = days.getDate(); //获取当前日期中月的天数
    var year2 = year;
    var month2 = parseInt(month) - 1;
    if (month2 == 0) {
        year2 = parseInt(year2) - 1;
        month2 = 12;
    }
    var day2 = day;
    var days2 = new Date(year2, month2, 0);
    days2 = days2.getDate();
    if (day2 > days2) {
        day2 = days2;
    }
    if (month2 < 10) {
        month2 = '0' + month2;
    }
    var t2 = year2 + '-' + month2 + '-' + day2 + ' 00:00:00';
    return new Date(t2).getTime();
};
//根据年龄获得出生年
exports.getYearByAge = function (age) {
    var date = new Date();
    var year = date.getFullYear();
    return year - age;
};
//根据星座获得月日
exports.getYearMonthDayForGroup = function (date) {
    var date = new Date(date);
    var Y = date.getFullYear() + '年';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '月';
    var D = date.getDate() + 1 < 10 ? '0' + date.getDate() : date.getDate() + '日';
    return Y + M + D;
};
