/**
 * 运行环境的配置内容
 */

module.exports = {
    env: 'product', //环境名称
    port: 4009,         //服务端口号
    mongodb_url: 'mongodb://127.0.0.1:',    //数据库地址
    mongodb_port: '27017',   //数据库端口号
    mongodb_name: '/blog', //数据库名称
    mongodb_user: '', //数据库帐号
    mongodb_pwd: '', //数据库密码
    redis_url: '',       //redis地址
    redis_port: ''      //redis端口号
};