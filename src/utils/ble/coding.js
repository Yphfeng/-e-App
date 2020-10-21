	/**
	 * 指令编码解码类
	 */

	var AES = require("../library/cryptojs/cryptojs").AESClass;
	import QBStorage from '../storage/storage';
	// import CryptoJS from '../library/cryptojs/cryptojs';

export default class coding
{
	constructor()
	{
		this.aes = new AES();
	}
	setPktCount()
	{
		QBStorage.save('pktCount', 0);
	}
	/**
	 * 编码-头部Head
	 * cmd：命令码，数据长度
	 * return buffer
	 */
	codingHead(cmd, data_size)
	{
		// 读取缓存的pktCount值
		var pktCount = QBStorage.get('pktCount');
		var buffer = new ArrayBuffer(4);
		var dataView = new DataView(buffer);
		dataView.setUint8(0, (pktCount & 0x03F) << 2 | (cmd & 0x0C00) >> 10);
		dataView.setUint8(1, (cmd & 0x03FC) >> 2);
		dataView.setUint8(2, (cmd & 0x003) << 6 | data_size & 0x3F);
		var checksum = dataView.getUint8(0);
		checksum += dataView.getUint8(1);
		checksum += dataView.getUint8(2);
		checksum &= 0xFF;
		checksum = (~checksum + 1);
		dataView.setUint8(3, checksum % 256);
		pktCount = parseInt(pktCount) + 1;
		QBStorage.save('pktCount', pktCount);
		return buffer;
	}
	/**
	 * 编码-整调数据
	 * cmd: 命令码，dataViewParameter：数据DataView类型
	 *  rerurn arrayBuffer
	 */
	encodingData(cmd, dataViewParameter) {
	// 创建
		var buffer = new ArrayBuffer(dataViewParameter.byteLength + 4); // 5
		var dataView = new DataView(buffer);  // 5
		// 头部
		var headBuffer = this.codingHead(cmd, dataViewParameter.byteLength);
		var headDataView = new DataView(headBuffer);
		for (var i = 0; i < headDataView.byteLength; i++) {
			dataView.setUint8(i, headDataView.getUint8(i));
		}
		// 数据
		if (dataViewParameter.byteLength > 0) {
			for (var i = 0; i < dataViewParameter.byteLength; i++) {
				dataView.setUint8(i + 4, dataViewParameter.getUint8(i));
			}
		}

		// // 测试
		console.debug('加密前数据长度', dataView.byteLength);
		for (var i = 0; i < dataView.byteLength; i++) {
			// console.debug(dataView.getUint8(i));
		}
		// AES-128加密
		var encodedBytes = this.aes.encoding(dataView);
		var allBuffer = new ArrayBuffer(encodedBytes.length + 2);
		var allDataView = new DataView(allBuffer);
		allDataView.setUint8(0, 165);
		allDataView.setUint8(1, encodedBytes.length);
		encodedBytes.forEach((v, index) => {
			allDataView.setUint8(index + 2, v);
		});
		console.debug('加密后的数据', encodedBytes)
		for(var i=0; i < allBuffer.byteLength; i++) {
			// console.log(allDataView.getUint8(i));
		}
		return allBuffer;
	}
	/**
	 * 解码
	 */
	decodingData(buffer)
	{
	// 解密
	let bytes = this.aes.decoding(buffer);
	// 解析包头
	var buffer = new ArrayBuffer(1);
	var pkt_head = bytes[0] * 0x1000000 + bytes[1] * 0x10000 + bytes[2] * 0x100 + bytes[3];
	var object = new Object();
	object.cmd = parseInt(pkt_head / 0x100000);
	object.pktCount = (pkt_head & 0x000FC000) >> 14;
	object.dataSize = (pkt_head & 0x00003F00) >> 8;
	object.data = bytes.slice(4, bytes.length);
	return object;
	}
}




