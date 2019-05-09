var fpath = require("fire-path");
var fs = require("fs");
var utils = require("./lib/utils");
var task = {};

// 你们不会用到
// 编译项目 如果只是改了scripts不用编译，直接拷贝脚本就好, 如果改了资源，需要编译
task.buildProj = (cmd, cmdPath, cb) =>{
    utils.runExec(cmd, cmdPath, cb);
}

// 拷贝脚本
task.cpScripts = (prj) => {
    Editor.log(`unbundle ${prj} start!`);
    let projectPath = Editor.Project.path;
    try {
        // 拷贝node_modules
        return utils.copyDirPromise(
                `${projectPath}/temp/quick-scripts/__node_modules`.replace("/", fpath.sep),
                `${projectPath}/build/${prj}/src/__node_modules`.replace("/", fpath.sep),
                [".map"]
        ).then(({error}) => {
            if (error) {
                Editor.error(`cpScripts error`, error);
                return error;
            }
            // 拷贝项目代码脚本
            return utils.copyDirPromise(
                `${projectPath}/temp/quick-scripts/assets`.replace("/", fpath.sep),
                `${projectPath}/build/${prj}/src/assets`.replace("/", fpath.sep),
                [".map"]);
        }).then(({error}) => {
            if (error) {
                return;
            }
            // 修改脚本
            task.chScripts(prj);
        }).then(() => {
            return task.encryptJs(prj);
        }).then(()=> {
            Editor.log(`unbundle ${prj} done!`);
        }).catch(e => {
            Editor.error(`cpScripts error`, e);
        })
    } catch(e) {
        Editor.error(`cpScripts error`, e);
    }
   
}

// 修改脚本
task.chScripts = (prj) => {
    let projectPath = Editor.Project.path;
    // 有可能已经删过了所以try catch
    try {
        // 去掉原合并的脚本
        let file = `${projectPath}/build/${prj}/src/project.js`.replace("/", fpath.sep);
        if (fs.existsSync(file)) fs.unlinkSync(file);
        file = `${projectPath}/build/${prj}/src/project.jsc`.replace("/", fpath.sep);
        if (fs.existsSync(file)) fs.unlinkSync(file);
        file = `${projectPath}/build/${prj}/main.js`.replace("/", fpath.sep);
        if (fs.existsSync(file)) fs.unlinkSync(file);
        file = `${projectPath}/build/${prj}/src/project.js.map`.replace("/", fpath.sep);
        if (fs.existsSync(file)) fs.unlinkSync(file);

    } catch(e) {
        Editor.error(e);
    }

    try {
        // 拷贝修改过的main.js模版 和cc.require加载脚本modular模块
        utils.copyFile(`${projectPath}/packages/unbundle/res/scripts/main.js`.replace("/", fpath.sep), `${projectPath}/build/${prj}/main.js`.replace("/", fpath.sep));
        utils.copyFile(`${projectPath}/packages/unbundle/res/scripts/src/modular.js`.replace("/", fpath.sep), `${projectPath}/build/${prj}/src/modular.js`.replace("/", fpath.sep));
        

        let config = fs.readFileSync(`${projectPath}/settings/builder.json`.replace("/", fpath.sep));
        config = JSON.parse(config);

        // 把 settins.js 导出成对象
        let settings = "";
        let  settingsFile = `${projectPath}/build/${prj}/src/settings`.replace("/", fpath.sep);
        
        if (config.encryptJs) {
            utils.decryptJsFile(`${settingsFile}.jsc`, `${settingsFile}.js`, config.xxteaKey, config.zipCompressJs);
        }

        settings = fs.readFileSync(`${settingsFile}.js`).toString();
        settings = settings.replace(`window._CCSettings=`, "var _CCSettings=");
        settings = settings.replace(`\}\;`, "}; module.exports = _CCSettings;");
        settings = eval(settings);

        // 获取scripts依赖列表 添加到settings.js中
        settings.scripts = Editor.QuickCompiler.scripts;
        settings = "window._CCSettings=" 
                    + JSON.stringify(settings).replace(/"([A-Za-z_$][0-9A-Za-z_$]*)":/gm, "$1:") 
                    + ";"
        
        fs.writeFileSync(`${settingsFile}.js`, settings);
    } catch (error) {
        Editor.error(error);
    }
}

task.encryptJs = (prj) => {

    let projectPath = Editor.Project.path;
    let config = fs.readFileSync(`${projectPath}/settings/builder.json`.replace("/", fpath.sep));
    config = JSON.parse(config);
    if (config.encryptJs) {
        let dir = `${projectPath}/build/${prj}/src`.replace("/", fpath.sep);
        return utils.encryptJsFilesPromise(dir, config.xxteaKey, config.zipCompressJs)
    }
}

module.exports = task;