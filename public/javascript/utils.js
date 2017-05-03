//获取浏览器数据
console.log(localStorage.ggblogSession);
let session =  localStorage.ggblogSession ? JSON.parse(localStorage.ggblogSession) : null;
let user = session ? session.user : null;

//获取组装好的session
function getSession() {
    let result = {};
    result.id = session.id;
    let time = new Date().getTime();
    result.timestamp = time;
    let text = session.id + user.id + user.token + time;
    result.sign = hex_md5(text);
    return result;
}