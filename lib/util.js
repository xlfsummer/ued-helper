let cheerio = require("cheerio");
let request = require("request");
let url = require("url");

module.exports = {
    /** @param {string} relativeUrl*/
    resolveUrl: function (relativeUrl) {
        let index = "http://ued.iwanshang.cn/";
        return url.resolve(index, relativeUrl);
    },
    cookieJar: request.jar(),
    /**
     * @param {string} docUrl
     * @returns {Promise<CheerioStatic>}
     */
    getDocument(docUrl) {
        return new Promise((resolve, reject) => {
            request({
                url: this.toAbsUrl(docUrl),
                jar: this.cookieJar,
            }, (err, res, body) => {
                if (err) reject(err);
                let $ = cheerio.load(body);
                return resolve($);
            });
        });
    },
    /**
     * @param {CheerioStatic} $
     * @param {string} baseUrl
     * @param {Cheerio} cheerioResult
     * @returns {{name: string, url: string}[]}
     */
    retriveLinks($, baseUrl, cheerioResult) {
        let links = [];
        cheerioResult.find("a").each((_, element) => {
            let link = {
                url: url.resolve(baseUrl, $(element).attr("href")),
                name: $(element).text()
            }
            links.push(link);
        })
        return links;
    },
    /** 转为绝对路径 */
    toAbsUrl(urlStr) {
        if (!url.parse(urlStr).host)
            urlStr = this.resolveUrl(urlStr);
        return urlStr;
    }
}