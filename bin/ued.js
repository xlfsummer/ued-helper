#!/usr/bin/env node

let app = require("../app.js");

let program = require("commander");

program
    .version("0.1.0", "-v --version")
    .option("-p, --project <project>", "指定要下载的远程项目名称")
    .option("-u, --user <user>", "指定要登录远程服务器的用户名")
    .option("--no-ignore-psd", "下载时默认排除PSD文件，使用此选项则取消排除PSD")
    .parse(process.argv)

let options = {
    project: program.project,
    user: program.user,
    ignorePsd: program.ignorePsd
};

app.options = options;
app.start();