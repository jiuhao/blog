//获取浏览器数据
console.log(localStorage.ggblogSession);
let session = localStorage.ggblogSession ? JSON.parse(localStorage.ggblogSession) : null;
let user = session ? session.user : null;

//获取组装好的session
function getSession() {
    let result = {};
    if (!session) {
        return '';
    }
    result.id = session.id;
    let time = new Date().getTime();
    result.timestamp = time;
    console.log('session.id:', session.id);
    console.log('user.id:', user.id);
    console.log('session.token:', session.token);
    let text = session.id + user.id + session.token + time;
    result.sign = hex_md5(text);
    return result;
}
//获取href中的参数
let UrlSearch = function () {
    let name, value;
    let str = window.location.href;//取得整个地址栏
    let num = str.indexOf("?");
    str = str.substr(num + 1); //取得所有参数   stringvar.substr(start [, length ]

    let arr = str.split("&"); //各个参数放到数组里
    for (let i = 0; i < arr.length; i++) {
        num = arr[i].indexOf("=");
        if (num > 0) {
            name = arr[i].substring(0, num);
            value = arr[i].substr(num + 1);
            this[name] = value;
        }
    }
};
//退出登录
function logout() {
    $.ajax({
        type: 'POST',
        url: '/api/logout',
        dataType: 'json',
        data:{
            session: getSession()
        },
        success: function (data) {
            //存储在localStorage里面
            if (data.code != 0) {
                alert(data.message);
                if (data.code == 102 || data.code == 104) {
                    //删除本地缓存
                    localStorage.removeItem('ggblogSession');
                    window.location.href = '/sign';
                }
            } else {
                //删除本地缓存
                localStorage.removeItem('ggblogSession');
            }
        }
    });
}
