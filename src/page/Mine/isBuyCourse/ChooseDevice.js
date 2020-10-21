/**
 * @author lam
 */
'use strict';

import React, {Component, } from 'react'
import {
	Text,
	View,
	ScrollView,
	StyleSheet,
	StatusBar,
	Dimensions, BackHandler,
	TouchableOpacity,
	Image,
	Alert,
	Platform,
} from 'react-native'
import NavBar from '../../../common/NavBar'
import Item from '../../../common/Item'
import Toast, { DURATION, } from 'react-native-easy-toast'
import Icon from 'react-native-vector-icons/Ionicons';
import { connect, } from 'react-redux'
import * as bleActions from "../../../actions/device/bleActions";
import {RadioGroup, RadioButton, } from 'react-native-flexi-radio-button';
import {width, height, statusBarHeight, } from "../../../utils/uiHeader";

const contentHeight = height - NavBar.topbarHeight - statusBarHeight

//FontAwesome
class ChooseDevicePage extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			display: false,
			userDeviceList: this.props.userDeviceList,
			index: 0,
		}
		this.didBlurSubscription = null;
	}
	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{
		this.didBlurSubscription = this.props.navigation.addListener(
			'didFocus',
			payload => {
				console.log('didBlur', payload);
				var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;
				var dic = new Object();
				if (guardian)
				{
					dic.armariumScienceSession = guardian.userToken;
				}
				this.setState({
					display: true,
					index: this.props.navigation.state.params.a,
				})

			}
		);
		console.log(this.props, '收到的数据状态');

	}
	componentWillReceiveProps(nextProps)
	{
		console.log(nextProps, '收到的新属性')
		this.setState({
			userDeviceList: nextProps.userDeviceList,
		})
	}

	componentWillUnmount()
	{
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		this.didBlurSubscription && this.didBlurSubscription.remove();
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	back()
	{
		this.props.navigation.navigate("BindingBuyCourse", {index: this.state.index, type: 'choose', });
	}
	//弹出提示
	alert(text, callback)
	{
		Alert.alert('提示', text, [{ text: "确定", onPress:()=>{ callback()} }]);
	}
	onSelect(index, value)
	{
		console.log(index, value)
		this.setState({
			index: index,
		})
	}

	render()
	{
		let list = null ;
		if (!this.state.display)
		{
			list = null
		}
		else
		{
			if (!this.state.userDeviceList)
			{
				list = null;
			}
			else
			{
				list = this.state.userDeviceList.map((item, index) => {
					return (
						<RadioButton value={item.id} key={item.id}>
							<View style={styles.list}>
								<View style={styles.contentLeft}>
									<Image source={require("../../../img/device_img_03.png")} style={styles.img} />
									<View style={styles.listContent}>
										<Text numberOfLines={1} style={{ color: '#444444', fontSize: 18, fontWeight: 'bold', }}>{item.device_alias? item.device_alias: item.device_name}</Text>
										<Text style={{ color: '#666666', fontSize: 12, paddingTop: 8, }}>编号：{item.device_sn}</Text>
									</View>
								</View>
							</View>
						</RadioButton>

					)
				})
			}
		}

		return (
			<View style={{backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="选择设备"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<ScrollView style={{height: contentHeight,backgroundColor: '#F5F5F5', }}>
					<View style={{flexDirection: 'column', backgroundColor: '#F5F5F5', paddingTop: 15, }}>
						<RadioGroup
							style={{marginLeft: 10, width: width - 20, marginRight: 10, }}
							onSelect = {(index, value) => this.onSelect(index, value)}
							selectedIndex={this.state.index}
						>{list}</RadioGroup>
					</View>
				</ScrollView>
				<Toast ref="toast" />
			</View>
		)
	}
}

function mapStateToProps(state) {
	console.log(state,'子组件的属性')
	return {
		msg: state.courseList.msg,
		connectStatus: state.ble.connectStatus,
		userDeviceList: state.user.userDeviceList,
		deviceId: state.ble.deviceId,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ChooseDevicePage)


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
		justifyContent: 'space-around',
		alignItems: 'center',
		width: width - 40,
		paddingLeft: 10,
		paddingRight: 10,
		backgroundColor: '#fff',
	},
	contentLeft: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		borderRadius: 4,

	},
	img: {
		width: 50,
		height: 50,
	},
	listContent: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',
		flex: 1,
		paddingLeft: 10,
		height: 60,
	},
	buyDate: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	buyText: {
		fontSize: 12,
		paddingTop: 7,
		color: '#666666',

	},
	btnAdd: {
		height: 30,
		width: 100,
		backgroundColor: '#24a090',
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center'
	},
	btnBuy: {
		width: width - 50,
		height: 35,
		backgroundColor: '#24a090',
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	bottomView: {
		height: 80,
		justifyContent: 'center',
		alignItems: 'center',
		width: width,
	},
	total: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	operate: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderBottomWidth: 1,
		borderBottomColor: '#f4f4f4',
	},
	operateItem: {
		paddingVertical: 6,
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	btnText: {
		fontSize: 12,
		color: '#fff'
	}
});
