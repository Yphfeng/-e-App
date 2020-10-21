/**
 * @author lam
 */
'use strict';

import React, {Component} from 'react'
import {
	Text,
	View,
	ScrollView,
	StyleSheet,
	StatusBar,
	Dimensions, BackHandler,
	TouchableOpacity,
	Image,
	Platform,
	Alert,
	PermissionsAndroid,
	DeviceEventEmitter,
} from 'react-native'
import NavBar from '../../common/NavBar'
import Item from '../../common/Item'
import Toast, { DURATION, } from 'react-native-easy-toast'

import { connect, } from 'react-redux'
import * as bleActions from '../../actions/device/bleActions';
import Icon from 'react-native-vector-icons/Ionicons';

import * as PermissionsManager from '../../permissionsManager';

import {statusBarHeight, height, width, } from '../../utils/uiHeader';

//FontAwesome
class BleAddMethodsPage extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			bleStatus: this.props.bleStatus,
		};
		console.log("手机版本号", Platform)
	}
	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);

	}
	componentDidMount()
	{
		this.setState({
			androidVersion: this.props.androidVersion,
		})
		var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;
		this.setState({
			guardian: guardian,
		})

	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);

	}
	componentWillReceiveProps(newProps)
	{
		this.setState({
			bleStatus: newProps.bleStatus,
		})
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	back() {
		this.props.navigation.pop();
	}

	async requestCameraPermission()
	{

		const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
		console.log(granted, PermissionsAndroid.RESULTS.GRANTED, '获取的权限')
		if (granted === PermissionsAndroid.RESULTS.GRANTED)
		{
			this.props.navigation.navigate("ScanResultPage");
		}
		else
		{
			console.log("Camera permission denied")
		}
	}


	events(res)
	{
		var type = res.type;
		var guardian = this.state.guardian;
		if (!guardian && !this.state.bleStatus)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>请打开蓝牙</Text>
			</View>)
			return;
		}
		switch (type)
		{
		case 'search':
			this.props.getConnectORsearch(0);
			this.props.navigation.navigate("BleSearchResultPage", {guardian: guardian, })

			// statements_1
			break;
		case 'scan':
			if (Platform.OS === "ios")
			{
				console.log("扫码推送")
				PermissionsManager.cameraPermission().then(data=>{
					console.log(data, '获取的权限')
					if (data)
					{
						this.props.navigation.navigate("ScanResultPage");
					}
				}).catch(err=>{
					console.log(err,'获取的权限error')
					this.refs.toast.show("没有访问相机权限，请前往 ‘设置’-‘隐私’-‘相机’ 开启权限",2000);
				});

			}
			else
			{
				if (this.state.androidVersion < 23)
				{
					this.props.navigation.navigate("ScanResultPage",{guardian: guardian, });
					return;
				}
				this.requestCameraPermission();
			}
		}
	}
	render()
	{
		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="选择添加方式"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<View style={{backgroundColor: '#F4F4F4'}}>
					<TouchableOpacity style={[styles.list,{borderBottomColor: '#f4f4f4', borderBottomWidth: 1, }]} onPress={this.events.bind(this,{type: 'search'})}>

						<View style={styles.listWhole}>
							<Image source={require('../../img/addSelect@2x_03.png')} style={styles.imgStyle} />
							<View style={styles.listContent}>
								<View style={{flexDirection: 'row',justifyContent: 'center',alignItems: 'center',flex: 1,paddingBottom: 10}}>
									<Text style={{ color: '#000',fontSize: 14,fontWeight: 'bold'}}>蓝牙搜索</Text>
									<Text style={{marginLeft: 5,fontSize: 13,paddingHorizontal:5,paddingVertical: 2,fontWeight: 'bold',color: '#d0021b',borderRadius: 12,borderWidth: 1,borderColor: '#d0021b'}}>推荐</Text>
								</View>
								<Text style={{ color: '#7f8389',fontSize: 12}}>打开手机蓝牙,激活设备</Text>
							</View>
						</View>
						<View><Icon name="ios-arrow-forward" size={24} color="#B1B1B1"></Icon></View>

					</TouchableOpacity>
					<TouchableOpacity style={styles.list} onPress={this.events.bind(this,{type: 'scan'})}>
						<View style={styles.listWhole}>
							<Image source={require('../../img/addSelect@2x_06.png')} style={styles.imgStyle} />
							<View style={styles.listContent}>
								<View style={{flexDirection: 'row',justifyContent: 'center',alignItems: 'center',flex: 1,paddingBottom: 10}}>
									<Text style={{ color: '#000',fontSize: 14,fontWeight: 'bold'}}>扫码绑定</Text>
								</View>

								<Text style={{ color: '#7f8389',fontSize: 12}}>扫描贴在手表上的二维码</Text>
							</View>
						</View>
						<View><Icon name="ios-arrow-forward" size={24} color="#B1B1B1"></Icon></View>

					</TouchableOpacity>
				</View>
				<Toast
					ref="toast"
					position="center"
					defaultCloseDelay={2000}
				/>
			</View>
		)
	}
}

function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {
		androidVersion: state.ble.androidVersion,
		bleStatus: state.ble.bleStatus,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		getConnectORsearch: (s) => dispatch(bleActions.getConnectORsearch(s))

	}
}

export default connect(mapStateToProps,mapDispatchToProps)(BleAddMethodsPage)


const styles = StyleSheet.create({
	title: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		color: "#666",
	},
	sBar: {
		height: statusBarHeight,
		width: width,
	},
	list: {
		flexDirection: 'row',
		justifyContent: "space-between",
		alignItems: 'center',
		paddingLeft: 15,
		paddingTop: 20,
		paddingRight: 15,
		paddingBottom: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#F4F4F4',
		backgroundColor: '#fff',
		height: 84,
	},
	hr:{
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center'
	},
	imgStyle: {
		width: 27,
		height: 27,
		marginRight: 10
	},
	listWhole: {
		flexDirection: 'row',
		justifyContent: "flex-start",
		alignItems: 'center',
	},
	listContent: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	camera: {
		flex: 1
	},
	rectangleContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
	},
	rectangle: {
		height: 250,
		width: 250,
		borderWidth: 2,
		borderColor: '#00FF00',
		backgroundColor: 'transparent',
	}
});
