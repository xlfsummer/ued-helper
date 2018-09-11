let util = require("./util.js");
let url = require("url");

module.exports = {
    async buildFileTree(projectUrl) {
        let allDirLinks = this.listAllDir(projectUrl);
        let
    },

    async getDirsContent(allDirLinks) {

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

        links;
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
            let url = $(element).parents("tr").find("a").attr("href");

            if(text != "") links.push({ name: text, url: url });
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