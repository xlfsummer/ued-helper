let Duplex = require("stream").Duplex;

module.exports = class ArrayToItemDuplex extends Duplex{
    constructor(){
        super({
            read(){
                let data = this.currentDataArray.pop();
                if(data == null){
                    // console.log("read done")
                    this.push(null);
                    return;
                }
                // console.log(`-> ${data.toString()}`)
                this.push(data.toString() + "\n")
                if(this.currentDataArray.length == 0){
                    // console.log("write done")
                    this.onWriteDone();
                }
            },
            write(data, enc, done){
                this.currentDataArray = this.currentDataArray.concat(data)
                this.onWriteDone = done;
            },
            readableObjectMode: true,
            writableObjectMode: true,
            highWaterMark: 16,
        });

        this.currentDataArray = []
        this.onWriteDone = _ => _;
    }
}
