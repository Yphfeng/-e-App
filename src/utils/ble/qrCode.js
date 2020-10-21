/**
 * 设备唯一编码解码规则
 */

export default class QRCode 
{
	constructor() 
	{
		this.ASCIIDic = {
			38: "&", 48: "0", 49: "1", 50: "2",
			51: "3", 52: "4", 53: "5", 54: "6",
			55: "7", 56: "8", 57: "9", 65: "A",
			66: "B", 67: "C", 68: "D", 69: "E",
			70: "F", 71: "G", 72: "H", 73: "I",
			74: "J", 75: "K", 76: "L", 77: "M",
			78: "N", 79: "O", 80: "P", 81: "Q",
			82: "R", 83: "S", 84: "T", 85: "U",
			86: "V", 87: "W", 88: "X", 89: "Y",
			90: "Z", 97: "a", 98: "b", 99: "c",
			100: "d", 101: "e", 102: "f", 103: "g",
			104: "h", 105: "i", 106: "j", 107: "k",
			108: "l", 109: "m", 110: "n", 111: "o",
			112: "p", 113: "q", 114: "r", 115: "s",
			116: "t", 117: "u", 118: "v", 119: "w",
			120: "x", 121: "y", 122: "z"
		}
		this.uint8HexStingDic = {
			0: "0", 1: "1", 2: "2",
			3: "3", 4: "4", 5: "5",
			6: "6", 7: "7", 8: "8",
			9: "9", 10: "A", 11: "B",
			12: "C", 13: "D", 14: "E",
			15: "F",
		}
	}
	
	/**
	 * 
	 * @param {搜索到的设备信息中的bytes} data 
	 */
	resolvingBroadcastInformation(data) 
	{
		var index = 0;
		if (data.length == 9) 
		{
			index = 0;
		} 
		else if (data.length == 11) 
		{
			index = 2;
		} 
		else if (data.length == 62 )
		{ // android
			index = 7
		} 
		else 
		{
			return false;
		}
		//过滤不是以A开头的型号
		// if (data[index] != 65 && data[index] != 66) 
		// { // 65 == 'A' 66 == 'B'
		// 	return false;
		// }
		var item1String = this.ASCIIDic[data[index]];
		console.log(item1String, '第一位')
		var item2String = this.ASCIIDic[data[index + 1]];
		var item3 = parseInt(data[index + 2] / 16);
		var item4 = parseInt(data[index + 2] % 16);
		var item3String = this.uint8HexStingDic[item3];
		var item4String = this.uint8HexStingDic[item4];
		
		var dateString = parseInt(data[index + 3]) +
			parseInt(data[index + 4]) * 256 +
			parseInt(data[index + 5]) * 256 * 256 +
			parseInt(data[index + 6]) * 256 * 256 * 256 + '';
		
		var unt16Num = parseInt(data[index + 7]) + parseInt(data[index + 8]) * 256; //31744
		var item5 = parseInt(((unt16Num) & 0xF000) >> 12);  //7
		var item6 = parseInt(((unt16Num) & 0x0F00) >> 8);  //12
		var item7 = parseInt(((unt16Num) & 0x00F0) >> 4);  //0
		var item8 = parseInt((unt16Num) & 0x000F);  //0
		var serialString = this.uint8HexStingDic[item5] + this.uint8HexStingDic[item6] + this.uint8HexStingDic[item7] + this.uint8HexStingDic[item8];  //7c00
		console.log(item1String, item2String, item3, item4, item3String, item4String, dateString, item5, item6, item7, item8, '设备编码1231231')
		return item1String + item2String + item3String + item4String + dateString + serialString
	}
}
