let request = require("request");
let fs = require("fs");


request("http://web1809030904581.gz01.bdysite.com/bos/geturl.php?key=web1536225862/%E8%AF%84%E8%AE%BA.jpg", {
    jar: true,
    proxy: "http://127.0.0.1:8888",
    headers: {
        referer: "http://ued.iwanshang.cn/"
    }
})
    .on("error", (e) => console.error(e))
    .pipe(fs.createWriteStream('F:\\personal\\ued-helper\\评论.jpg', { autoClose: true }))
    .on("close", () => { console.log("下载完成")})