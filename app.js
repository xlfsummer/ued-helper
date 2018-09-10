let util = require("./lib/util.js");
let url = require("url");

(async function main() {
    //首页
    let indexUrl = "http://ued.iwanshang.cn/";
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
    util.retriveLinks(classifyList)
    // classifyList
})().catch(e => {
    debugger
})
