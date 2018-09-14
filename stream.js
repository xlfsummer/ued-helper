let { Writable, Readable, Transform } = require("stream");

// let i = 0;

// let rs = new Readable({
//     async read() {
//         i++;

//         if (i < 10) {
//             await delay(200)
//             this.push([{ "asdf": "sd" }, { a: 123}, {21:324}])
//         } else {
//             this.push(null)
//         }
//     },
//     objectMode: true
// });

// let ts = new Transform({
//     async transform(data, encode, cb) {
//         if (data) {
//             await delay(100)
//             cb(null, JSON.stringify(data))
//         }
//         else {
//             await delay(100)
//             cb(null, null)
//         }
//     },
//     objectMode: true
// })


// let delay = time => new Promise(resolve => setTimeout(resolve, time));


// rs
//     .pipe(ts)
//     .on("end", () => console.log("end"))
//     .pipe(process.stdout)


let toUpper = new Transform({
    transform(data, encode, cb) {
        this.push(data ? data.toString().toUpperCase() : null)
        cb()
    },
    highWaterMark: 1
})

let ws = new Writable({
    write(data, encode, next) {
        console.log(data.toString());
        next();
    }
});

process.stdin.pipe(toUpper).pipe(ws);