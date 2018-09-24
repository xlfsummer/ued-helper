let Duplex = require("stream").Duplex;

module.exports = class ArrayToItemDuplex extends Duplex{
    constructor(option){
        super({
            async read(){
                let data = this.currentDataArray.pop();
                if(data == null){
                    // console.log("read done")
                    // await delay(100)
                    this.push(null);
                    return;
                }
                // await delay(100);
                // console.log(`-> ${data.toString()}`)
                this.push(data.toString() + "\n")
                if(this.currentDataArray.length == 0){
                    // console.log("write done")
                    this.onWriteDone();
                }
            },
            async write(data, enc, done){
                // console.log(`<- ${data}`)
                // if(this.currentDataArray == null){
                //     this.currentDataArray = []
                // }
                this.currentDataArray = this.currentDataArray.concat(data)
                this.onWriteDone = done;
            },
            readableObjectMode: true,
            writableObjectMode: true,
            highWaterMark: 10,
        });

        this.currentDataArray = []
        this.onWriteDone = _ => _;
    }
}
