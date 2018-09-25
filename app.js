let util = require("./lib/util.js");
let url = require("url");
let inquirer = require("inquirer");
let projectFile = require("./lib/projectFile.js");
let projectFileStream = require("./lib/projectFileStream.js");
let ArrayToItemDuplex = require("./lib/arrayToItem.js");
let login = require("./lib/login.js");
let fs = require("fs");
let path = require("path");

let app = module.exports = {
    start(option){
        this.option = option;
        main().catch(e => {
            // debugger
            console.log(e)

            console.log('Press any key to exit');
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.on('data', () => process.exit(1));
        })
    },
    option: {}
}

async function main() {
    //首页
    let indexUrl = util.resolveUrl("/");
    let $ = await util.getDocument(indexUrl);
    let moduleNavLinks = $(".header ul a");

    let projectsPagePath = Array.from(moduleNavLinks).find(a => {
        return a.childNodes.some(child => {
            return child.type == "text" && child.nodeValue.includes("产品管理")
        });
    }).attribs.href;
    let projectsPageAbsPath = url.resolve(indexUrl, projectsPagePath)

    // 产品管理
    $ = await util.getDocument(projectsPageAbsPath)
    let classifyList = $(".classify ul");
    let links = util.retriveLinks($, indexUrl, classifyList);


    let cmdProjectUrl;
    if (app.option.project) {
        cmdProjectUrl = (links.find(link =>
            link.name == app.option.project
        ) || {}).url;
        if (!cmdProjectUrl) {
            console.log(`产品[${app.option.project}]不存在`)
        }
    }


    let answer = await inquirer.prompt([
        ...(cmdProjectUrl
            ? []
            : [{
                type: "list",
                name: "project",
                message: "选择一个产品",
                choices: links.map(links => ({ name: links.name, value: links.url }))
            }]
        ),
        ...(app.option.user
            ? []
            : [{
                type: "input",
                name: "user",
                message: "请输入用户名"
            }]
        ),
        {
            type: "password",
            name: "password",
            message: "请输入密码"
        },
        ...(app.option.ignorePsd != null
            ? []
            : [
                {
                type: "confirm",
                name: "ignorePsd",
                message: "是否忽略 psd 文件",
                default: true
                }
            ]
        ),
    ]);

    let user = app.option.user || answer.user;
    let projectUrl = cmdProjectUrl || answer.project;
    let ignorePsd = app.option.ignorePsd != null ? app.option.ignorePsd : answer.ignorePsd

    let batPath = path.resolve(process.cwd(), "update.bat");
    if (!fs.existsSync(batPath)) {
        fs.writeFileSync(batPath
            ,
            `chcp 65001\r\n` +
            `ued` +
            ` -p ${ links.find(link => link.url == projectUrl).name }` +
            ` -u ${ user }` +
            ` --ignore-psd ${!!ignorePsd}`
            ,
            "utf8"
        );
    }

    /** 登录 */
    await login.login(user, answer.password);

    // 项目
    // let projectFiles = await projectFile.getProjectFileInfo(projectUrl);
    // await projectFile.downloadAll(projectFiles, ignorePsd);

    projectFileStream.createProjectDirInfosStream(projectUrl)
        .pipe(new ArrayToItemDuplex())
        .pipe(projectFileStream.createDirInfo2DFileInfosTransform())
        .pipe(new ArrayToItemDuplex())
        .pipe(projectFileStream.createFileRedirectUrlTransform())
        .pipe(projectFileStream.createDownloadFileWriteStream())
        .on("finish", ()=>{
            debugger
            console.log("拉取完毕, 按任意键退出");
            process.stdin.resume();
            process.stdin.on('data', () => process.exit(0));
        })
        .on("error", (e)=>{
            debugger
        })
        .on("close", (e)=>{
            debugger
        })
}
