let Stream = require("stream");
let URL = require("url");
let util = require("./util.js");

/**
 * @typedef dirInfo
 * @property {string} name name of dir
 * @property {string} url location of the page of the content of the dir
 */

// project url ==> dir[]
// dir ==> fileInfo[]
// fileInfo ==> file

module.exports = class ProjectFs {

    /**
     * @param {string} projectUrl 
     */
    static createProjectDirInfosStream(projectUrl) {
        return new Stream.Readable({
            async read() {
                let urlGen = ProjectFs.projectIndexedPageUrl(projectUrl);
                let pageUrl = urlGen.next();
                let $ = await util.getDocument(pageUrl);
                let pageEmpty = /^\s*$/.test($(".container table").text());

                if (!pageEmpty) {
                    let links = await ProjectFs.getDirInfoInDocument($);
                    return this.push(links);
                } else {
                    this.push(null);
                }
            },
            objectMode: true,
        });
    }

    /**
     * 
     */
    static transformDirInfo2FilesInfo(){
        return new Stream.Transform({
            /**
             * @param {dirInfo} dirInfo 
             */
            async transform(dirInfo){

            },
            objectMode: true
        });
    }

    

    /**
     * @param {CheerioStatic} $
     * @returns {Promise<dirInfo[]>}
     */
    static async getDirInfoInDocument($) {
        let $headers = $(".container table h3");
        return $headers.map(function (_, element) {
            let text = $(element).text().trim();
            let linkUrl = $(element).parents("tr").find("a").attr("href");
            if (text != "")
                return { name: text, url: util.resolveUrl(linkUrl) };
        }).get();
    }

    /**
     *
     * @param {string} projectUrl
     * @returns {Iterable<string>}
     */
    static *projectIndexedPageUrl(projectUrl) {
        let page = 1;
        while (page++) {
            yield URL.resolve(projectUrl, `./index_${page}.html`);
        }
    }
}
