var CryptoJS =  require('./Crypto').Crypto;
var CryptoMath = require('./CryptoMath');
var BlockModes = require('./BlockModes');
var AES = require('./AES');

function aesClass() {
// // GiXM*7^RQM
    // this.key = CryptoJS.util.base64ToBytes("TF@uIA9j#C@lXeGc");
    // this.iv = CryptoJS.util.base64ToBytes("1vQlK1GiXM*7^RQM");
    this.key = [84, 70, 64, 117, 73, 65, 57, 106, 35, 67, 64, 108, 88, 101, 71, 99];
    this.iv = [49, 118, 81, 108, 75, 49, 71, 105, 88, 77, 42, 55, 94, 82, 81, 77];
    this.mode = new CryptoJS.mode.CBC(CryptoJS.pad.pkcs7);

    this.encoding = function encoding(dv) {

        var array = new Array();
        for (var i = 0; i < dv.byteLength; i++) {
            array.push(dv.getUint8(i));
        }
        var ciphertext = CryptoJS.AES.encrypt(array, this.key, {
            asBpytes: true,
            iv: this.iv,
            mode: this.mode
        });
        // 转ArrayBuffer
        // console.log(ciphertext);
        // return ciphertext;
        return CryptoJS.util.base64ToBytes(ciphertext);
    }

    /**
    * 参数：Arrybuffer
    * return Array
    */
    this.decoding = function decoding(array) {

        var bytes = CryptoJS.AES.decrypt(array, this.key, {
            asBpytes: true,
            iv: this.iv,
            mode: this.mode
        });
        if (typeof bytes != 'object') {
            console.debug('解码得到的不是object类型的数据')
            return
        }
        return bytes;
    }
}

export const AESClass = aesClass;
