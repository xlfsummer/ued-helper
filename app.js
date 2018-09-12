let util = require("./lib/util.js");
let url = require("url");
let inquirer = require("inquirer");
let projectFile = require("./lib/projectFile.js");
let login = require("./lib/login.js");

(async function main() {
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

    let answer = await inquirer.prompt([
        {
            type: "list",
            name: "project",
            message: "select a project to clone",
            choices: links.map(links => ({ name: links.name, value: links.url }))
        }
    ]);

    /** 登录 */
    await login.login(

    );

    // 项目
    let projectUrl = answer.project;
    let projectFiles = await projectFile.getProjectFileInfo(projectUrl);

    projectFile.downloadAll(projectFiles);

    // classifyList
})().catch(e => {
    console.error(e);
})
