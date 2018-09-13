// let request = require("request");
let fs = require("fs");
let http = require("http");


// request("http://web1809030904581.gz01.bdysite.com/bos/geturl.php?key=web1536225862/%E8%AF%84%E8%AE%BA.jpg", {
//     jar: true,
//     proxy: "http://127.0.0.1:8888",
//     headers: {
//         referer: "http://ued.iwanshang.cn/"
//     }
// })
//     .on("error", (e) => console.error(e))
//     .pipe(fs.createWriteStream('F:\\personal\\ued-helper\\评论.jpg', { autoClose: true }))
//     .on("close", () => { console.log("下载完成")})


let req = http.request({
    host: "127.0.0.1",
    port: 8888,
    path: "http://sjzz.gz.bcebos.com//web1536225862/%E8%AF%84%E8%AE%BA.jpg?authorization=bce-auth-v1%2Fe10d0cf009934c4abe29be5e04f48329%2F2018-09-13T03%3A25%3A33Z%2F3600%2F%2F9aa4ecc07e2c14e221473bd3d200d80cf72d4b110b022fb088bbd1ec8d9a095c",
    headers: {
        referer: "http://ued.iwanshang.cn/"
    },

    // host: "sjzz.gz.bcebos.com",
    // path: "/",
    // search: "?authorization=bce-auth-v1%2Fe10d0cf009934c4abe29be5e04f48329%2F2018-09-13T02%3A53%3A41Z%2F3600%2F%2F024e6ff68851fc3aa779cea00b131f87b7d6d0b020844e4ad399dbc331ed9e68"
}, res => {
    console.log(res.statusCode + " " + res.statusMessage)
    console.log(res.headers.location);
    console.log("-----------------------");

    let ws = fs.createWriteStream("a.png");


    res.pipe(ws)

    // res.on("data", data => {
    //     console.log("[data chunk] " + /** @type {Buffer} */(data).slice(0,10).toString() + "...");
    //     ws.write(data)
    //     console.log("-----------------------");
    // });

    // res.on("end", _ => {
    //     ws.end();
    //     console.log("response end");
    // });
});

req.end()