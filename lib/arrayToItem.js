let Duplex = require("stream").Duplex;

module.exports = class ArrayToItemDuplex extends Duplex{
    constructor(){
        super({
            read(){
                if(this.currentDataArray.length == 0){
                    this.dry = true;
                    return false;
                }
                let data = this.currentDataArray.pop();
                let length = this.currentDataArray.length;
                if(data === null){
                    // console.log("read done")
                    // console.log(`-> null`)
                    this.push(null);
                    return;
                }
                // console.log(`-> ${JSON.stringify(data)}`)
                this.push(data)
                if(length == 0){
                    // console.log("write done")
                    this.onWriteDone();
                }
            },
            write(data, enc, done){
                this.currentDataArray = this.currentDataArray.concat(data)
                this.onWriteDone = done;
                if(this.dry){
                    this.dry = false;
                    let data = this.currentDataArray.pop();
                    // console.log(`-> ${JSON.stringify(data)}`)
                    this.push(data)
                }
            },
            readableObjectMode: true,
            writableObjectMode: true,
            highWaterMark: 16,
        });

        this.currentDataArray = [];
        this.onWriteDone = _ => _;
        this.dry = false;
    }
}
