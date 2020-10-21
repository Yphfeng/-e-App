/**
 * 扫描连接类
 */

var 	readServiceUUID = [];
var 	readCharacteristicUUID = [];
var 	writeWithResponseServiceUUID = [];
var  	writeWithResponseCharacteristicUUID = [];
var     writeWithoutResponseServiceUUID = [];
var     writeWithoutResponseCharacteristicUUID = [];
var     nofityServiceUUID = [];
var     nofityCharacteristicUUID = [];
import {
	Platform,
} from 'react-native';
import BleManager from 'react-native-ble-manager';

export default class BleConnection
{
	static getInstance()
	{
		if (!BleConnection.instance)
		{
			BleConnection.instance = new BleConnection();
		}
		return BleConnection.instance;
	}
	constructor()
	{
		this.isConnecting = false; //蓝牙是否连接
		this.initUUID();
		this.peripheralId = null;
	}
	/**
	 * 扫描可用设备，5秒后结束
	 * Scan for availables peripherals.
	 * */
	scan(s=5)
	{
		return new Promise((resolve, reject) =>
		{

			console.log('asas扫描')
			BleManager.scan([], s, true)
				.then(() =>
				{
					console.log('Scan started');
					resolve()
				}).catch((err) =>
				{
					console.log('Scan started fail');
					reject(err)
				});
		})
	}

	scanResult()
	{
		return new Promise((resolve, reject) => {
			BleManager.getDiscoveredPeripherals()
				.then(res => {
					resolve(res);
				})
				.catch(err => {
					reject(err)
				})
		})
	}

	/**
	 * 停止扫描
	 * Stop the scanning.
	 * */
	stopScan() {
		return new Promise((resolve,reject) => {
			BleManager.stopScan()
				.then(() => {
					console.log('Scan stopped');
					resolve()
				}).catch((err) => {
					reject(err)
					// console.log('Scan stopped fail',err);
				});
			})
	}
		/**
	 * 打开蓝牙(Android only)
	 * Create the request to the user to activate the bluetooth
	 * */
	enableBluetooth() {
		return new Promise((resolve, reject) => {
		BleManager.enableBluetooth()
			.then(() => {
				resolve()
				// console.log('The bluetooh is already enabled or the user confirm');
			})
			.catch((error) => {
				reject(error)
				// console.log('The user refuse to enable bluetooth');
			});
		})
	}
		/**
	 * Converts UUID to full 128bit.
	 *
	 * @param {UUID} uuid 16bit, 32bit or 128bit UUID.
	 * @returns {UUID} 128bit UUID.
	 */
	fullUUID(uuid) {
		if (uuid.length === 4) {
			return '0000' + uuid.toUpperCase() + '-0000-1000-8000-00805F9B34FB'
		}
		if (uuid.length === 8) {
			return uuid.toUpperCase() + '-0000-1000-8000-00805F9B34FB'
		}
		return uuid.toUpperCase()
	}
	initUUID() {
		this.readServiceUUID = [];
		this.readCharacteristicUUID = [];
		this.writeWithResponseServiceUUID = [];
		this.writeWithResponseCharacteristicUUID = [];
		this.writeWithoutResponseServiceUUID = [];
		this.writeWithoutResponseCharacteristicUUID = [];
		this.nofityServiceUUID = [];
		this.nofityCharacteristicUUID = [];
	}

	//获取Notify、Read、Write、WriteWithoutResponse的serviceUUID和characteristicUUID
	getUUID(peripheralInfo) {
		this.readServiceUUID = [];
		this.readCharacteristicUUID = [];
		this.writeWithResponseServiceUUID = [];
		this.writeWithResponseCharacteristicUUID = [];
		this.writeWithoutResponseServiceUUID = [];
		this.writeWithoutResponseCharacteristicUUID = [];
		this.nofityServiceUUID = [];
		this.nofityCharacteristicUUID = [];
		for (let item of peripheralInfo.characteristics) {
			item.service = this.fullUUID(item.service);
			item.characteristic = this.fullUUID(item.characteristic);
			if (Platform.OS == 'android') {
				if (item.properties.Notify == 'Notify') {
					this.nofityServiceUUID.push(item.service);
					this.nofityCharacteristicUUID.push(item.characteristic);
				}
				if (item.properties.Read == 'Read') {
					this.readServiceUUID.push(item.service);
					this.readCharacteristicUUID.push(item.characteristic);
				}
				if (item.properties.Write == 'Write') {
					this.writeWithResponseServiceUUID.push(item.service);
					this.writeWithResponseCharacteristicUUID.push(item.characteristic);
				}
				if (item.properties.WriteWithoutResponse == 'WriteWithoutResponse') {
					this.writeWithoutResponseServiceUUID.push(item.service);
					this.writeWithoutResponseCharacteristicUUID.push(item.characteristic);
				}
			} else { //ios
				for (let property of item.properties) {
					if (property == 'Notify') {
						this.nofityServiceUUID.push(item.service);
						this.nofityCharacteristicUUID.push(item.characteristic);
					}
					if (property == 'Read') {
						this.readServiceUUID.push(item.service);
						this.readCharacteristicUUID.push(item.characteristic);
					}
					if (property == 'Write') {
						this.writeWithResponseServiceUUID.push(item.service);
						this.writeWithResponseCharacteristicUUID.push(item.characteristic);
					}
					if (property == 'WriteWithoutResponse') {
						this.writeWithoutResponseServiceUUID.push(item.service);
						this.writeWithoutResponseCharacteristicUUID.push(item.characteristic);
					}
				}
			}
		}
		console.log('readServiceUUID',this.readServiceUUID);
		console.log('readCharacteristicUUID',this.readCharacteristicUUID);
		console.log('writeWithResponseServiceUUID',this.writeWithResponseServiceUUID);
		console.log('writeWithResponseCharacteristicUUID',this.writeWithResponseCharacteristicUUID);
		console.log('writeWithoutResponseServiceUUID',this.writeWithoutResponseServiceUUID);
		console.log('writeWithoutResponseCharacteristicUUID',this.writeWithoutResponseCharacteristicUUID);
		console.log('nofityServiceUUID',this.nofityServiceUUID);
		console.log('nofityCharacteristicUUID',this.nofityCharacteristicUUID);
	}

	//定时器

	timeOut(time) {
		return new Promise(function(resolve){
		  setTimeout(function(){
			resolve();
		  },time)
		});
	}

	async retrieveServices(id)
	{
		var info = null;
		try {
			info = await BleManager.retrieveServices(id);
			if (info)
			{
				console.log(info, '获取的retrieveServicesretrieveServices')
				return info
			}
			else
			{
				this.retrieveServices(id);
			}
		} catch (error) {
			this.retrieveServices(id);
		}
	}


	/**
	 * 连接蓝牙
	 * Attempts to connect to a peripheral.
	 * */
	connect(id)
	{
		this.isConnecting = true;  //当前蓝牙正在连接中
		return new Promise( (resolve, reject) =>{
			BleManager.connect(id)
				.then(() => {
					console.log('Connected success.');
					return this.timeOut(1000);
				})
				.then(async () => {
					return await this.retrieveServices(id);
				})
				.then(async (peripheralInfo)=>
				{
					console.log('连接成功后获取的服务id集合 ', peripheralInfo);
					if (!peripheralInfo.characteristics || peripheralInfo.characteristics.length < 1)
					{
						try
						{
							const peripheralInfo2 = await BleManager.retrieveServices(id);
							console.log('连接成功后获取的服务id集合2 ', peripheralInfo2);
							if (peripheralInfo2.characteristics.length < 1)
							{
								const peripheralInfo3 = await BleManager.retrieveServices(id);
								if (peripheralInfo3.characteristics.length < 1)
								{
									const peripheralInfo4 = await BleManager.retrieveServices(id);

									console.log('连接成功后获取的服务id集合4 ', peripheralInfo4);
									this.peripheralId = peripheralInfo4.id;
									this.getUUID(peripheralInfo4);
									this.isConnecting = false; //当前蓝牙连接结束
									resolve(peripheralInfo4);
									return;
								}
								console.log('连接成功后获取的服务id集合3 ', peripheralInfo3);
								this.peripheralId = peripheralInfo3.id;
								this.getUUID(peripheralInfo3);
								this.isConnecting = false; //当前蓝牙连接结束
								resolve(peripheralInfo3);
								return

							}
							this.peripheralId = peripheralInfo2.id;
							this.getUUID(peripheralInfo2);
							this.isConnecting = false; //当前蓝牙连接结束
							resolve(peripheralInfo2);
						}
						catch (error_1) {
							this.isConnecting = false; //当前蓝牙连接结束
							reject(error_1);
						}
						return;
					}
					this.peripheralId = peripheralInfo.id;
					this.getUUID(peripheralInfo);
					this.isConnecting = false;   //当前蓝牙连接结束
					resolve(peripheralInfo);
				})
				.catch(error=>{
					console.log('Connected error:',error);
					this.isConnecting = false;   //当前蓝牙连接结束
					reject(error);
				});
		});
	}
	/**
	 * 断开蓝牙连接
	 * Disconnect from a peripheral.
	 * */
	disconnect()
	{
		console.log(this.peripheralId, '断开id')
		return new Promise((resolve, reject) =>
		{


			BleManager.disconnect(this.peripheralId)
				.then(() => {
					this.isConnecting = false;
					console.log('Disconnected');
					this.initUUID();  //断开连接后清空UUID
					resolve()
				})
				.catch((error) => {
					console.log('Disconnected error:',error);
					reject(error)
				});
		})
	}
		/**
	 * 打开通知
	 * Start the notification on the specified characteristic.
	 * */
	startNotification(index = 0)
	{
		return new Promise( (resolve, reject) =>{
			console.log("E2:D7:7D:3F:5F:3D","9C2C4841-69C3-4742-9F69-764351FB0783","9C2C485A-69C3-4742-9F69-764351FB0783")
			console.log('通知',this.peripheralId, this.nofityServiceUUID[index], this.nofityCharacteristicUUID[index])
			BleManager.startNotification(this.peripheralId, "9C2C4841-69C3-4742-9F69-764351FB0783", "9C2C485A-69C3-4742-9F69-764351FB0783")
				.then(() => {
					console.log('Notification started');
					resolve();
				})
				.catch((error) => {
					console.log('Notification error:',error);
					reject(error);
				});
		});
	}
		/**
	 * 关闭通知
	 * Stop the notification on the specified characteristic.
	 * */
	stopNotification(index = 0) {
		BleManager.stopNotification(this.peripheralId, this.nofityServiceUUID[index], this.nofityCharacteristicUUID[index])
			.then(() => {
				// console.log('stopNotification success!');
				resolve();
			})
			.catch((error) => {
				// console.log('stopNotification error:',error);
				reject(error);
			});
	}
}
