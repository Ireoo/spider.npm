const utf8 = str=> {
    let insertStr = (soure, start, newStr) => {
        return soure.slice(0, start) + newStr + soure.slice(start)
    };
    let bufferArray = str.replace(/\\/g, '\\0').split('\\');
    console.log(bufferArray)
    let arr = [];
    for(let i = 0; i < bufferArray.length; i++) {
        let b = bufferArray[i];
        if(/^0x[a-z0-9]{2}/.test(b)) {
            if (b.length > 4) {
                bufferArray[i] = b.substring(0, 4);
                let h = b.substring(4);
                // if(h.length < 2) h = `0${h}`;
                // bufferArray.splice(i+w, 0, `0x${h}`);
                // w++
                arr.push({
                    index: i,
                    code: h
                });
            }
        } else {
             // else if (b.length < 4) {
                bufferArray.splice(i, 1);
                arr.push({
                    index: i,
                    code: b
                });
            // }
        }
    }
    console.log(bufferArray)
    let txt = new Buffer(bufferArray).toString();
    // arr.sort((a, b) => a.index < b.index).forEach(v => {
    //     // console.log(v)
    //     txt = insertStr(txt, v.index / 2, v.code);
    // });
    // console.log(bufferArray, txt)
    return txt;
};

const decode = obj => {
    // if(obj.length > 0) {
        for (let k in obj) {
            switch (typeof obj[k]) {
                case "object":
                    obj[k] = decode(obj[k]);
                    break;

                    case "string":
                        obj[k] = /^https?:\/\//.test(obj[k]) ? obj[k] : utf8(obj[k]);
                        break;

                default:
                    // obj[k] = obj[k];
                    break;
            }
        }
        return obj;
    // } else {
    //     return
    // }
};

exports = module.exports = decode;