//
// var aa = function (fn) {
//     console.log('fn:', fn);
//     //给db赋值...怎么获取fn的所有参数?
//     console.log('arguments:', arguments);
//     ...
//     return ...
// };
// aa(function (db, aa, bb) {
//
// });
// var aa = ''.split('/data');
// console.log('&*&*:', aa);
var s = '<h1 style="text-align: center; ">请输入内容</h1><p><br></p>';
s.match(/<h1 (.*)>(.*)<\/h1>/);
console.log(RegExp.$2);