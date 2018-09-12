let cheerio = require("cheerio");
let request = require("request");
let url = require("url");
let fs = require("fs");
let md5 = require("md5");
let { promisify } = require("util")

module.exports = {
    /** @param {string} relativeUrl*/
    resolveUrl(relativeUrl) {
        let index = "http://ued.iwanshang.cn/";
        return url.resolve(index, relativeUrl);
    },
    async download(fileUrl, fileFullName) {

        let fileExits = await promisify(fs.exists)(fileFullName);
        let md5Etag;
        let lastModify;
        if (fileExits) {
            md5Etag = md5(await promisify(fs.readFile)(fileFullName));
            lastModify = fs.statSync(fileFullName).mtime.toUTCString();
        }

        return new Promise((resolve, reject) => {
            request({
                url: fileUrl,
                jar: this.cookieJar,
                proxy: "http://127.0.0.1:8888",
                headers: {
                    referer: this.resolveUrl("/"),
                    ...(
                        fileExits
                            ? {
                                "If-None-Match": md5Etag,
                                "If-Modified-Since": lastModify,
                            }
                            : {}
                    )
                },
            })
                .on("error", () => reject())
                // 如果返回304就不再保存
                .pipe(fs.createWriteStream(fileFullName, {autoClose: true}))
                .on("close", () => resolve())
        });
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
                proxy: "http://127.0.0.1:8888"
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
    },
    getRedirectUrl(urlStr) {
        return new Promise((resolve, reject) => {
            let redirectedUrl = request(encodeURI(urlStr), {
                followRedirect: false,
                jar: this.cookieJar,
                proxy: "http://127.0.0.1:8888",
                headers: {
                    referer: this.resolveUrl("/"),
                }
            }, (err, res, body) => {
                if (err) return reject(err);
                return resolve(res.headers.location);
            });
        })
    }
}