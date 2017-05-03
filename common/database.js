const conf = require("../config/mongo");
const pool = require("../config/mongo_pool");
pool.configure(conf);

// exports.use = async(call) => {
//     let db = await pool.open();
//     try {
//         let auth = conf.auth;
//         if (auth) {
//             await db.authenticate(auth.user, auth.pwd);
//         }
//         return await call(db);
//     } finally {
//         await pool.close(db);
//     }
// };
//方法入参封装db
// exports.warp = (fn, self) => {
//     console.log('fn', fn);
//     console.log('self', self);
//     if (!self) {
//         self = {};
//     }
//     return async(fn) => {
//         console.log('arguments*******:',arguments);
//         let args = arguments;
//         console.log('^*^*&^*&^*^^**^&*:', args);
//         console.log('arguments', arguments);
//         return await exports.use(async(db) => {
//             console.log('db:', db);
//             let arr = [db];
//             for (let i in args) {
//                 arr.push(args[i]);
//             }
//             console.log('fn&*&*&*&*:', fn);
//             console.log('arr:', arr);
//             return await fn.apply(self, arr);
//         });
//     };
// };
//
// exports.getDB = async()=>{
//     let db = await pool.open();
//     try {
//         let auth = conf.auth;
//         if (auth) {
//             await db.authenticate(auth.user, auth.pwd);
//         }
//         return await db;
//     } finally {
//         await pool.close(db);
//     }
// };
exports.use = function*(call) {
    var db = yield pool.open();
    try {
        var auth = conf.auth;
        if (auth) {
            yield db.authenticate(auth.user, auth.pwd);
        }
        return yield call(db);
    } finally {
        pool.close(db);
    }
};

exports.warp = function (fn, self) {
    if (!self) {
        self = {};
    }
    return function*() {
        var args = arguments;
        return yield exports.use(function*(db) {
            var arr = [db];
            for (var i in args) {
                arr.push(args[i]);
            }
            return yield fn.apply(self, arr);
        });
    };
};