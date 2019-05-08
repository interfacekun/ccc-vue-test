/*
 * @Author: ainterface 
 * @Date: 2018-11-21 11:58:02 
 * @Last Modified by: kunsi
 * @Last Modified time: 2019-05-08 17:46:17
 */

const _ = require('lodash')
const fs = require("fs");
const path = require("path");

var walk = (d, cb) => {
    const tree = {}

    // 获得当前文件夹下的所有的文件夹和文件
    const [dirs, files] = _(fs.readdirSync(d)).partition(p => fs.statSync(path.join(d, p)).isDirectory())

    // 映射文件夹
    dirs.forEach(dir => {
        tree[dir] = walk(path.join(d, dir), cb)
    })
    files.forEach(file => {
        cb(d, file)
    })
}

var getTotalFiles = (d) => {
    var count = 0;
    const [dirs, files] = _(fs.readdirSync(d)).partition(p => fs.statSync(path.join(d, p)).isDirectory());
    count += files.length;
    // 映射文件夹
    dirs.forEach(dir => {
        count += getTotalFiles(path.join(d, dir))
    })
    return count;
}


module.exports={walk, getTotalFiles}