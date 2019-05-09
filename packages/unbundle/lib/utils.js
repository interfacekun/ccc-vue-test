var fpath = require("path");
var ffs = require("fire-fs");
var process = require('child_process');
var workDir = require('./walk-dir')
var xxtea = require("xxtea-node")
var zlib = require("zlib")


var utils = {};

utils.runExec = (cmdStr, cmdPath, cb) => {
    // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
    let workerProcess = process.exec(cmdStr, {
        cwd: cmdPath
    })
    // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})

    // 打印正常的后台可执行程序输出
    workerProcess.stdout.on('data', function (data) {
        Editor.log(`[info ${moment().format('h:mm:ss.S')}] ` + data);
    });

    // 打印错误的后台可执行程序输出
    workerProcess.stderr.on('data', function (data) {
        Editor.log(`[error ${moment().format('h:mm:ss.S')}] ` + data);
    });

    // 退出之后的输出
    workerProcess.on('close', function (code) {
        Editor.log(`[exit ${moment().format('h:mm:ss.S')}]` + code);
        cb(code);
    })
}

utils.copyFile = (src, dist) => {
    ffs.createReadStream(src).pipe(ffs.createWriteStream(dist));
}


/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 * @param filters {String} 过滤的文件后缀名
 */
var totalFiles = 0;
var nowFiles = 0;
utils.copyDir = (src, dist, filters, callback) => {
    if (!totalFiles || totalFiles === 0) {
        nowFiles = 0;
        totalFiles = workDir.getTotalFiles(src);
        Editor.warn(`cp ${src} to ${dist}`);
        Editor.warn(`total files ${totalFiles}`);
    }

    function _copy(err, src, dist) {
        if (err) {
            nowFiles = 0;
            totalFiles = 0;
            callback(err);
        } else {
            ffs.readdir(src, function (err, paths) {
                if (err) {
                    nowFiles = 0;
                    totalFiles = 0;
                    callback(err)
                } else {
                    paths.forEach(function (path) {
                        var _src = fpath.join(src, path);
                        var _dist =  fpath.join(dist, path);
                        ffs.stat(_src, function (err, stat) {
                            if (err) {
                                nowFiles = 0;
                                totalFiles = 0;
                                callback(err);
                            } else {
                                // 判断是文件还是目录
                                if (stat.isFile()) {
                                    let extname = fpath.extname(_src);
                                    
                                    if (filters.indexOf(extname) == -1) {
                                        utils.copyFile(_src, _dist);
                                        if (ffs.existsSync(`${_dist}c`)) ffs.unlinkSync(`${_dist}c`);
                                    } else {
                                        Editor.log("filter", _src, extname);
                                    }

                                    // ffs.writeFileSync(_dist, ffs.readFileSync(_src));
                                    nowFiles += 1;
                                    if (nowFiles === totalFiles) {
                                        Editor.log(`${nowFiles}/${totalFiles}`);
                                        nowFiles = 0;
                                        totalFiles = 0;
                                        callback(null, nowFiles, totalFiles);
                                    }
                                } else if (stat.isDirectory()) {
                                    // 当是目录是，递归复制
                                    utils.copyDir(_src, _dist, filters, callback)
                                }
                            }
                        })
                    })
                }
            })
        }
    }

    ffs.access(dist, function (err) {
        if (err) {
            // 目录不存在时创建目录
            ffs.mkdirSync(dist);
        }
        _copy(null, src, dist);
    });
}

utils.runExecSync = (cmdStr, cmdPath) => {
    return process.execSync(cmdStr, {
        cwd: cmdPath
    })
}

utils.copyDirPromise = (src, dist, filters) => {

    return new Promise((resolve) => {
        if (!ffs.existsSync(src)) {
            resolve({error: null});
            return;
        };
        utils.copyDir(src, dist, filters, (error, nowFiles, totalFiles) => {
            if (error) {
                resolve({error})
            } else {
                resolve({error, nowFiles, totalFiles});
            }
        });
    })
}

utils.encryptJsFilesPromise = (dir, xxetaKey, zipCompressJs) => {
    return new Promise((resolve) => {
        if (!ffs.existsSync(dir)) {
            resolve({error: null});
            return;
        };
        Editor.log(`encryptJs strart!`);
        utils.encryptJsFiles(dir, xxetaKey, zipCompressJs, (error, nowFiles, totalFiles) => {
           if (error) {
                Editor.log(`encryptJs error!`, error);
                resolve({error})
            } else {
                Editor.log(`encryptJs done!`);
                resolve({error, nowFiles, totalFiles});
            }
        });
    })
}

utils.encryptJsFiles = (dir, xxetaKey, zipCompressJs, callback) => {

    if (!totalFiles || totalFiles === 0) {
        nowFiles = 0;
        totalFiles = workDir.getTotalFiles(dir);
        Editor.warn(`encryptJsFiles ${dir}`);
        Editor.warn(`total files ${totalFiles}`);
    }

    function _encryptJsDir(dir) {
        ffs.readdir(dir, function (err, paths) {
            if (err) {
                nowFiles = 0;
                totalFiles = 0;
                callback(err)
            } else {
                paths.forEach(function (path) {
                    var _src = fpath.join(dir, path);
                    var _dist =  fpath.join(dir, path.replace(".js", ".jsc"));
                    ffs.stat(_src, function (err, stat) {
                        if (err) {
                            nowFiles = 0;
                            totalFiles = 0;
                            callback(err);
                        } else {
                            // 判断是文件还是目录
                            if (stat.isFile()) {
                                let extname = fpath.extname(_src);
                                
                                if (extname === ".js" && path.indexOf("modular") == -1) {
                                    utils.encryptJsFile(_src, _dist, xxetaKey, zipCompressJs);
                                } else {
                                    Editor.log("filter", _src, extname);
                                }

                                nowFiles += 1;
                                if (nowFiles === totalFiles) {
                                    Editor.log(`${nowFiles}/${totalFiles}`);
                                    nowFiles = 0;
                                    totalFiles = 0;
                                    callback(null, nowFiles, totalFiles);
                                }
                            } else if (stat.isDirectory()) {
                                // 当是目录是，递归复制
                                utils.encryptJsFiles(_src, xxetaKey, zipCompressJs, callback)
                            }
                        }
                    })
                })
            }
        })
    }

    _encryptJsDir(dir);
}

utils.encryptJsFile = (src, dist, xxetaKey, zipCompressJs) => {
    let content = ffs.readFileSync(src);
    if (zipCompressJs) {
        content = zlib.gzipSync(content);
    }

    content = xxtea.encrypt(content, xxtea.toBytes(xxetaKey));
    ffs.writeFileSync(dist, content);
    ffs.unlinkSync(src);
}

utils.decryptJsFile = (src, dist, xxetaKey, zipCompressJs) => {
    let content = ffs.readFileSync(src);

    content = xxtea.decrypt(content, xxtea.toBytes(xxetaKey));
    content = new Buffer(content);
    if (zipCompressJs) {
        content = zlib.gunzipSync(content);
    }
    ffs.writeFileSync(dist, content);
}

module.exports = utils

