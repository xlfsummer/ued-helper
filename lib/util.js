let cheerio = require("cheerio");
let request = require("request");
let url = require("url");
let fs = require("fs");
// let md5 = require("md5");
let { promisify } = require("util");
let chalk = require("chalk");
let path = require("path");


let self = module.exports = {
    /** @param {string} relativeUrl*/
    resolveUrl(relativeUrl) {
        let index = "http://ued.iwanshang.cn/";
        return url.resolve(index, relativeUrl);
    },
    async download(fileUrl, fileFullName) {

        let fileExits = await promisify(fs.exists)(fileFullName);
        let lastModify;
        if (fileExits) {
            lastModify = (await promisify(fs.stat)(fileFullName)).mtime.toUTCString();
        }

        return new Promise((resolve, reject) => {
            request({
                url: fileUrl,
                jar: self.cookieJar,
                // proxy: "http://127.0.0.1:8888",
                headers: {
                    referer: self.resolveUrl("/"),
                    ...(
                        fileExits
                            ? {
                                // 这里不发 if-none-match， 服务器没有根据 etag 判断
                                "If-Modified-Since": lastModify,
                            }
                            : {}
                    )
                },
            }).on("response", async res => {
                if (res.statusCode == 304) {
                    console.log(fileFullName + " " + chalk.yellow("304"))
                    return resolve();
                }

                await self.ensureDir(path.dirname(fileFullName));
                let ws = fs.createWriteStream(fileFullName);

                res.pipe(ws);
                res.on("error", e => {
                    console.log(fileFullName + " ", e)
                    reject(e)
                })
                res.on('end', () => {
                    console.log(fileFullName + " " + chalk.green("200"))
                    resolve()
                })
            });
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
                url: self.toAbsUrl(docUrl),
                jar: self.cookieJar,
                // proxy: "http://127.0.0.1:8888"
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
            urlStr = self.resolveUrl(urlStr);
        return urlStr;
    },
    getRedirectUrl(urlStr) {
        return new Promise((resolve, reject) => {
            let redirectedUrl = request(encodeURI(urlStr), {
                followRedirect: false,
                jar: self.cookieJar,
                // proxy: "http://127.0.0.1:8888",
                headers: {
                    referer: self.resolveUrl("/"),
                }
            }, (err, res, body) => {
                if (err) return reject(err);
                return resolve(res.headers.location);
            });
        })
    },

    async ensureDir(dirPath){
        let exists = await promisify(fs.exists)(dirPath);
        if(exists) return;
        
        let parent = path.dirname(dirPath);
        await self.ensureDir(parent);
        await promisify(fs.mkdir)(dirPath);
    }
}
