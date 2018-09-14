process.stdin.pipe(
    new (require("stream").Transform)({
        transform(data) {
            data.toString().split("").forEach(c => {
                this.push("0x" + /** @type {string} */(c).charCodeAt(0).toString(16).pad + " ")
            });
        }
    })
).pipe(process.stdout)