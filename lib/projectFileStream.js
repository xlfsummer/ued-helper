let Stream = require("stream");
let URL = require("url");
let util = require("./util.js");
let path = require("path");

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
        let urlGen = ProjectFs.projectIndexedPageUrl(projectUrl);
        return new Stream.Readable({
            async read() {
                let {value: pageUrl} = urlGen.next();
                let $ = await util.getDocument(pageUrl);
                console.log("get page:" + pageUrl)
                let pageEmpty = /^\s*$/.test($(".container table").text());

                if (!pageEmpty) {
                    let links = await ProjectFs.getDirInfoInDocument($);
                    // console.log(" -> " + JSON.stringify(links))
                    return this.push(links);
                } else {
                    // console.log(" -> null")
                    this.push(null);
                }
            },
            objectMode: true,
        });
    }

    /**
     *  通过项目中目录信息获取该目录的文件信息列表
     */
    static createDirInfo2DFileInfosTransform(){
        return new Stream.Transform({
            /**
             * @param {dirInfo} dirInfo 
             */
            async transform(dirInfo, enc, done){

                if(dirInfo == null){
                    console.log("you should not be here !!!!");
                    this.push(null)
                }

                console.log(`get dirInfo: ${dirInfo.url}`)
                let $ = await util.getDocument(dirInfo.url);
                /** @type {string[]} */
                let breadcrumb = $(".breadcrumb li").map((_, e) => $(e).text()).get();
                let [home, moduleName, subModuleName, projectName, ...filePath] = breadcrumb;
                let dirFilePath = filePath.filter(p => p).join("/"); //可能多出一个空路径

                let dirFiles = $(".dalist").map((_, e) => {
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

                let fileInfoList = dirFiles.map(fileInfo => {
                    fileInfo.filename = path.resolve(process.cwd(), dirFilePath, fileInfo.filename);
                    return fileInfo;
                }).filter(fileInfo => {
                    return fileInfo.mimeType != "psd"
                })

                // console.log(" -> " + JSON.stringify(fileInfoList))
                this.push(fileInfoList);
                done();
            },
            objectMode: true
        });
    }

    static createFileRedirectUrlTransform(){
        return new Stream.Transform({
            /**
             * @param {object} fileInfo 
             * @param {string} fileInfo.filename
             * @param {string} fileInfo.mimeType
             * @param {string} fileInfo.size
             * @param {string} fileInfo.url
             */
            async transform(fileInfo, enc, done){
                console.log(`get redirect: ${fileInfo.url}`)
                let realUrl = await util.getRedirectUrl(fileInfo.url);
                fileInfo.realUrl = realUrl;
                this.push(fileInfo);
                done();
            },
            objectMode: true
        });
    }

    static createDownloadFileWriteStream(){
        return new Stream.Writable({
            /**
             * @param {object} fileInfo 
             * @param {string} fileInfo.filename
             * @param {string} fileInfo.mimeType
             * @param {string} fileInfo.size
             * @param {string} fileInfo.url
             * @param {string} fileInfo.realUrl
             */
            async write(fileInfo, enc, done){
                console.log("start download: " + fileInfo.realUrl)
                await util.download(fileInfo.realUrl, fileInfo.filename);
                console.log("end download: " + fileInfo.realUrl)
                done();
            },
            objectMode: true,
        })
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
        let page = 0;
        while (++page) {
            yield URL.resolve(projectUrl, `./index_${page}.html`);
        }
    }
}
