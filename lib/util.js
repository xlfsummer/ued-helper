let cheerio = require("cheerio");
let request = require("request");
let url = require("url");

module.exports = {
    cookieJar: request.jar(),
    /**
     * @param {string} url
     * @returns {Promise<CheerioStatic>}
     */
    getDocument(url) {
        return new Promise((resolve, reject) => {
            request({
                url: url,
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
    /**  */

}