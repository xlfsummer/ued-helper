let util = require("./util.js");
let url = require("url");
let fs = require("fs");
let process = require("process");
let { promisify } = require("util");
let path = require("path");
let request = require("request");

/**
 * @typedef {object} ProjectFileInfo
 * @property {string} editTime
 * @property {string} filename
 * @property {string} mimeType
 * @property {string} url 绝对路径
 *
 * @example
 * {
 * editTime:"08月27日"
 *   filename:"背景.jpg "
 *   mimeType:"image/jpeg"
 *   size:"12.02 KB"
 *   url:"http://web1809030904581.gz01.bdysite.com/bos/geturl.php?key=web1536221301/背景.jpg"
 * }
 */

 /**
 * @typedef {object} ProjectAllFilesInfo
 * @property {string} filename
 * @property {string[]} filePath
 * @property {ProjectFileInfo[]} content
 */

module.exports = {
    /**
     * 通过项目url获取项目的所有文件信息
     * @param {string} projectUrl
     * @return {Promise<ProjectAllFilesInfo[]>}
     */
    async getProjectFileInfo(projectUrl) {
        console.log("正在拉取目录信息...");
        let allDirLinks = await this.listAllDir(projectUrl);

        let allDirInfo = [];
        for (let dirLink of allDirLinks) {
            console.log(`正在拉取 ${dirLink.name} 内容...`);
            let dirInfo = await this.getDirInfo(dirLink);
            dirInfo.filename = dirLink.name;
            allDirInfo.push(dirInfo);

            // //debug 只获取第一个目录的文件信息
            // break;
        }

        return allDirInfo;
    },

    /**
     * 通过项目中目录信息获取所有目录的文件信息
     * @param {{name: string, url: string}} dirLink
     */
    async getDirInfo(dirLink) {
        let $ = await util.getDocument(dirLink.url);
        /** @type {string[]} */
        let breadcrumb = $(".breadcrumb li").map((_, e) => $(e).text()).get();
        let [home, moduleName, subModuleName, projectName, ...path] = breadcrumb;
        let dirFilePath = path.filter(p => p); //可能多出一个空路径

        let dirContent = $(".dalist").map((_, e) => {
            $(e).find(".iconfont").remove();
            let $td = $(e).find("td");
            return {
                filename: $td.eq(1).text().trim(),
                size: $td.eq(2).text(),
                mimeType: $td.eq(3).text(),
                editTime: $td.eq(4).text(),
                url: $td.eq(5).find("a").attr("href")
            }
        }).get();

        return {
            filePath: dirFilePath,
            content: dirContent
        };
    },

    /**
     * 拉取所有页面上的目录
     * @param {string} projectUrl
     * @returns {Promise<{name: string, url: string}[]>}
     */
    async listAllDir(projectUrl) {
        let page = 1;
        let links = [];

        while (true) {
            let $ = await util.getDocument(url.resolve(projectUrl, `./index_${page}.html`))
            if (page == 1 && !this.checkAuth($)) break;
            if (this.isPageEmpty($)) break;
            links = links.concat(this.getDirLink($))
            page++;

            // //debug 只拉取第一页的项目目录
            // break;
        }

        return links;
    },

    /**
     * 下载所有文件
     * @param {ProjectAllFilesInfo[]} projectAllFilesInfo
     */
    async downloadAll(projectAllFilesInfo) {
        console.log("正在下载文件...");
        let projectRootDirectory = process.cwd();
        for (let { filename, filePath, content } of projectAllFilesInfo) {
            for (let dirName of filePath) {
                let cwd = process.cwd();
                let dirPath = path.resolve(cwd, dirName)
                let isExist = await promisify(fs.exists)(dirPath);
                if (!isExist) await promisify(fs.mkdir)(dirPath);
                process.chdir(dirName)
            }

            let dir = process.cwd();
            for (let fileInfo of content) {
                if (fileInfo.mimeType == 'psd') continue;

                let realUrl = await util.getRedirectUrl(fileInfo.url);
                await util.download(realUrl, path.resolve(dir, fileInfo.filename))

                // //debug 只下载每个目录的第一个文件
                // break;
            }

            process.chdir(projectRootDirectory);

        }
    },

    /**
     * @param {CheerioStatic} $
     */
    isPageEmpty($) {
        return /^\s*$/.test($(".container table").text());
    },

    /**
     * @param {CheerioStatic} $
     */
    getDirLink($) {
        let $headers = $(".container table h3");
        let links = [];
        $headers.each(function (_, element) {
            let text = $(element).text().trim();
            let linkUrl = $(element).parents("tr").find("a").attr("href");
            if(text != "") links.push({ name: text, url: util.resolveUrl(linkUrl) });
        })
        return links;
    },

    /**
     * @param {CheerioStatic} $
     */
    checkAuth($) {
        let noAuth = ($(".message-box").html()||"").includes("登录超时或者没有权限执行此操作！");
        return !noAuth;
    }
};