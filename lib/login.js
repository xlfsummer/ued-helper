let util = require("./util.js");
let request = require("request");
let cheerio = require("cheerio");

module.exports = {
    async login(username, password) {
        let $ = await util.getDocument("/login.html");
        let __hash__ = $("[name='__hash__']").val();
        return new Promise((resolve, reject) => {
            request({
                method: "POST",
                url:  util.resolveUrl("/login/"),
                jar: util.cookieJar,
                formData: {
                    username,
                    password,
                    __hash__
                }
            }, function (err, res, body) {
                /**@type {string}*/(body).includes("登录成功")
                    ? resolve()
                    : reject()
            });
        });
    }
};