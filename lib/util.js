let cheerio = require("cheerio");
let request = require("request");

module.exports = {
    /**
     * @param {string} url
     * @returns {Promise<CheerioStatic>}
     */
    getDocument(url) {
        return new Promise((resolve, reject) => {
            request.get(url, (err, res, body) => {
                if (err) reject(err);
                let $ = cheerio.load(body);
                return resolve($);
            });
        });
    },
    /**
     * @param {Cheerio} cheerioResult
     */
    retriveLinks(cheerioResult) {
        let nodes = Array.from(cheerioResult);
        nodes.reduce(node => {
            if (node.type != "tag") return;
            if (node.name != "a") return;

        }, [])
    }

}