let Stream = require("stream")

// // process.stdin.pipe(
// //     new (require("stream").Transform)({
// //         transform(data) {
// //             data.toString().split("").forEach(c => {
// //                 this.push("0x" + /** @type {string} */(c).charCodeAt(0).toString(16).padStart(2, "0") + " ")
// //             });
// //         }
// //     })
// // ).pipe(process.stdout)



// new Stream.Transform({
//     transform(data){
//         this.push(this.buffer.unshift)
//     },
//     buffer: [],
//     objectMode: true
// })

let data = [
    null,
    ["1", "2", "3"],
    ["1", "2", "3", "asdas", "sa", "as"],
]

let rs = new Stream.Readable({
    read(){
        while(data.length){
            this.push(data.pop())
        }
    },
    objectMode: true
})


let a2i = require("./lib/arrayToItem.js");

rs
    .pipe(new a2i())
    .pipe(process.stdout);
