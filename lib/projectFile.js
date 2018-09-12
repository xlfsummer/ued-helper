let util = require("./util.js");
let url = require("url");

module.exports = {
    async getProjectFileInfo(projectUrl) {
        let allDirLinks = await this.listAllDir(projectUrl);

        let allDirInfo = [];
        for (let dirLink of allDirLinks) {
            let dirInfo = await this.getDirInfo(dirLink);
            dirInfo.filename = dirLink.name;
            allDirInfo.push(dirInfo);
        }

        return allDirInfo;
    },

    /** @param {{name: string, url: string}} dirLink */
    async getDirInfo(dirLink) {
        let $ = await util.getDocument(dirLink.url);
        /** @type {string[]} */
        let breadcrumb = $(".breadcrumb li").map((_, e) => $(e).text()).get();
        let [home, moduleName, subModuleName, projectName, ...path] = breadcrumb;
        path = path.filter(p => p); //可能多出一个空路径
        let dirFilePath = "./" + path.join("/");

        let dirContent = $(".dalist").map((_, e) => {
            $(e).find(".iconfont").remove();
            let $td = $(e).find("td");
            return {
                filename: $td.eq(1).text(),
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
        }

        return links;
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