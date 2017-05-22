const mongo = require('co-mongo');
const config = require('../config');
const co = require('co');

const conf = {};

exports.configure = function (c) {
    conf.url = config.mongodb_url + config.mongodb_port + config.mongodb_name;
    for (let name in c) {
        conf[name] = c[name];
    }
};


let pool = [];

// let connect = async() => {
//     let db = await new Promise(function (res, rej) {
//         co(function *() {
//             try {
//                 let result = yield mongo.connect(conf.url);
//                 res(result)
//             } catch (e) {
//                 rej(e);
//             }
//         });
//     });
//     let cols = conf.collections.slice(0);
//     for (let i in cols) {
//         let name = cols[i];
//         db[name] = await new Promise(function (res, rej) {
//             co(function *() {
//                 try {
//                     let result = yield db.collection(name);
//                     res(result);
//                 } catch (e) {
//                     rej(e);
//                 }
//             });
//         });
//     }
//     console.log('&^&*&^%^&*&^%$:', db);
//     return db;
// };
//
// exports.open = async() => {
//     let db = pool.shift();
//     if (db) {
//         if (pool.length < conf.min) {
//             let x = await connect();
//             pool.push(x);
//         }
//         return db;
//     } else {
//         return await connect();
//     }
// };
//
// exports.close = async(db) => {
//     if (pool.length >= conf.max) {
//         await db.close();
//     } else {
//         pool.push(db);
//     }
// };

function* connect() {
    let db = yield mongo.connect(conf.url);
    let cols = conf.collections.slice(0);
    for (let i in cols) {
        let name = cols[i];
        db[name] = yield db.collection(name);
    }
    return db;
}
exports.open = function*() {
    let db = pool.shift();
    if (db) {
        if (pool.length < conf.min) {
            co(function*() {
                let x = yield connect();
                pool.push(x);
            });
        }
        return db;
    } else {
        return yield connect();
    }
};


exports.close = function (db) {
    co(function*() {
        if (pool.length >= conf.max) {
            yield db.close();
        } else {
            pool.push(db);
        }
    });
};