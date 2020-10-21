
/**
 * @author lam
 */
'use strict';

import React, {Component,} from 'react'
import {
	Text,
	View,
	ScrollView,
	StyleSheet,
	StatusBar,
	Dimensions, BackHandler,
	TouchableOpacity,
	Button,
	Image,
	Slider,
	Platform,
	TextInput,
	DeviceEventEmitter,
	KeyboardAvoidingView,
	Keyboard,
	Alert,
} from 'react-native'
import NavBar from '../../../common/NavBar'
import Toast, { DURATION } from 'react-native-easy-toast'
import { connect, } from 'react-redux'
import {statusBarHeight, height, width, } from '../../../utils/uiHeader';
import * as javaBase from '../../../utils/network/javaService';
import * as userService from '../../../utils/network/userService';
import Icon from 'react-native-vector-icons/Ionicons'

import QBStorage from '../../../utils/storage/storage';
const contentHeight = height - NavBar.topbarHeight - statusBarHeight
const currentHeight = statusBarHeight;
function formatTime(second)
{
	let h = 0, i = 0, s = parseInt(second);
	if (s > 60)
	{
		i = parseInt(s / 60);
		s = parseInt(s % 60);
	}
	// 补零
	let zero = function (v) {
		return (v >> 0) < 10 ? "0" + v : v;
	};
	console.log([zero(h), zero(i), zero(s)].join(":"));
	return [zero(h), zero(i), zero(s)].join(":");
	// return zero(s);
}

var whoosh;

class HotList extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			isRefreshing: false,
			resizeMode: 'contain',
			visible: true,
			imgIndex: 0,
			user: {},
			title: '',
			spinner: false,
			keyposition: 0,
			keyboardHeight: 0,
			typeList: [],
			listContent: [],
			isIndex: 0,
		};
		this.AccessKeyId = ""
		this.AccessKeySecret = ""
		this.SecurityToken = ""
		this.FileProfix = ""
		this.openid = ""
		this.access_token = ""
		this.unionid = ""
		this.aliyunUrl = "https://bjy-dev.oss-cn-shenzhen.aliyuncs.com/"
		this.img = [];
		this.allData= [];
	}
	componentWillMount() {

		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount() {
		console.log(this.props.navigation, 'luyou11111')
		// this.detail(47);
		this.getUploadVoucher();
		this.getTypeList();
		QBStorage.get('user')
            .then((user) =>
            {
                this.setState({
					user: user
				})
            })
            .catch(err => {

            })

		Keyboard.addListener('keyboardDidShow', (event) => {
			   this.setState({
				 keyposition: event.duration,
			   })
			})
			Keyboard.addListener('keyboardDidHide', (event) => {
				this.setState({
					keyposition: 0
				})
			})
	}

	getTypeList()
	{
		javaBase.request({
			path: 'weixin/circle/labeltypeList',
		})
			.then(res =>
			{
				console.log(res, '分类列表')
				if (res.code == 1)
				{
					var data = res.data;
					var typeList = data.labelType;
					typeList.unshift({typeName: '最近使用', label: data.recentlyUsed, })
					console.log(typeList, 'asdqwqwdqw')
					this.setState({
						typeList: typeList,
					})
				}
			})
			.catch(err =>
			{

			})
	}

	getUploadVoucher()
	{
		userService.getUploadVoucher()
			.then(res => {
				console.log(res,'获取阿里云oos')
				if(res.StatusCode == 200) {
					this.AccessKeyId = res.AccessKeyId,
					this.AccessKeySecret = res.AccessKeySecret
					this.SecurityToken = res.SecurityToken
					this.FileProfix = res.FileProfix
				}
			})
			.catch(err => {
				console.log(err,'获取阿里云oos')
			})
    }

	format(shijianchuo) {
		//shijianchuo是整数，否则要parseInt转换
		var time = new Date(shijianchuo);
		var y = time.getFullYear();
		var m = time.getMonth() + 1;
		var d = time.getDate();
		var h = time.getHours();
		var mm = time.getMinutes();
		return y + '/' + this.add0(m) + '/' + this.add0(d) + ' ' + this.add0(h) + ':' + this.add0(mm);
	}
	add0(m) { return m < 10 ? '0' + m : m }

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	back() {
		this.props.navigation.pop();
	}

	onChangeTitle(text) {
		this.setState({
			title: text
		})
	}
	onFocus(){
		this.setState({
			keyboardHeight: 1,
		})
	}
	onBlur(){
		this.setState({
			keyboardHeight: 0,
		})
	}

	switch = (index) => {
		console.log(index,'1231231')
		this.setState({
			isIndex: index,
		})
	}

	renderClassName = () =>
	{
		var list = this.state.typeList;
		if (list.length < 1)
		{
			return <View></View>
		}
		return list.map((item, index) => {
			return <TouchableOpacity
				key={index}
				style={[styles.classItem, {backgroundColor: this.state.isIndex === index ? '#fff' : '#ddd'}]}
				onPress={() => this.switch(index)}
			><Text>{item.typeName}</Text></TouchableOpacity>
		})
	}

	renderContent = () =>
	{
		var isIndex = this.state.isIndex;
		var content = this.state.typeList.length > 0 ? this.state.typeList[isIndex].label : [];
		if (content.length < 1)
		{

			return <View style={styles.noData}><Text>暂无更多</Text></View>
		}
		return content.map((item, index) =>
		{
			return <TouchableOpacity
				key={index}
				style={styles.listItem}
				onPress={() => this.goSearchResult(item.labelName)}
			>
				{item.imgUrl ?
					<Image source={{uri: item.imgUrl, }} resizeMode="cover" style={styles.img} />
					: <Image source={require("../../../img/logo.png")} resizeMode="cover" style={styles.img} /> }
				<View>
					<Text>#{item.labelName}#</Text>
					<Text style={{color: '#ddd', }}>案例{item.caseCount}</Text>
				</View>
			</TouchableOpacity>
		})
	}

	goSearchResult = (value) => {
		this.props.navigation.navigate("HotResult", {searchValue: value, });
	}

	_onSubmitEditing = () =>
	{
		this._textInput.blur();
		this.props.navigation.navigate("HotResult", {searchValue: this.state.searchValue, });
	}

	onChangeText = (value) =>
	{
		console.log(value, '1234')
		this.setState({
			searchValue: value,
		})
	}
	render()
	{

		let statusBar = null;

		statusBar = (<StatusBar
			backgroundColor={"#24A090"}
			barStyle={this.props.barStyle || 'light-content'}
			translucent={true}
			style={styles.statusBarHeight}
		/>)

		return (
			<TouchableOpacity
				style={{flex: 1,backgroundColor: "#FFF"}}
				onPress={() => {Keyboard.dismiss()}}
				activeOpacity={1}
			>
				{statusBar}
				<View style={styles.statusBarHeight} backgroundColor={this.state.isFullScreen ? "#000" : '#24A090'}/>
				<View style={styles.header}>
					<View style={styles.headerContent}>
						<View style={styles.searchIcon}>
							<Icon name="ios-search-outline" size={18}></Icon>
						</View>
						<TextInput
							placeholder="高血压，高血脂，糖尿病..."
							style={{flex: 1, padding: 0, }}
							returnKeyType="search"
							underlineColorAndroid={"transparent"}
							onSubmitEditing={this._onSubmitEditing}
							ref={component => this._textInput = component}
							onChangeText={this.onChangeText}
						/>
					</View>
					<TouchableOpacity
						style={styles.headerCancel}
						onPress={() => {this.props.navigation.goBack()}}
					><Text style={{color:'#fff', }}>取消</Text></TouchableOpacity>
				</View>
				<View style={styles.content}>
					<View style={styles.className}>
						{this.renderClassName()}
					</View>
					<View style={{flex: 1,}}>
						{this.renderContent()}
					</View>
				</View>


				<Toast ref="toast" />
			</TouchableOpacity>
		)
	}
}

function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {

	}
}

function mapDispatchToProps(dispatch)
{
	return {

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(HotList)


const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		backgroundColor: 'black',
		marginHorizontal: 10,
	},
	statusBarHeight: {
		height: statusBarHeight,
		width: width,
	},
	title: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		color: "#666"
	},
	header: {
		flexDirection: 'row',
		paddingHorizontal: 10,
		backgroundColor: '#24A090',
		height: 50,
		paddingVertical: 8,
	},
	headerContent: {
		flexDirection: 'row',
		flex: 1,
		backgroundColor: '#fff',
		borderRadius: 5,
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	searchIcon: {
		paddingHorizontal: 10,
	},
	headerCancel: {
		width: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		flexDirection: 'row',
	},
	className: {
		width: 100,
		backgroundColor: '#ddd',
		height: height,
	},
	classItem: {
		height: 50,
		width: 100,
		justifyContent: 'center',
		alignItems: 'center',
	},
	img: {
		width: 60,
		height: 60,
		marginRight: 10,
	},
	listItem: {
		borderBottomColor: '#ddd',
		borderBottomWidth: 1,
		paddingHorizontal: 20,
		paddingVertical: 10,
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	noData: {
		flex: 1,
		height: 100,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
