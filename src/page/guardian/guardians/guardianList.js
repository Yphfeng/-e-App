
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
import { connect, } from 'react-redux'
import * as communityActions from '../../../actions/communityActions';
import {statusBarHeight, height, width, } from '../../../utils/uiHeader';
import * as GuardianService from '../../../utils/network/guardianService';
import Modals from 'react-native-modal';
import * as guardianActions from '../../../actions/device/guardianActions';
import * as webSocketActions from '../../../actions/webSocketActions';
const contentHeight = height - NavBar.topbarHeight - statusBarHeight
const currentHeight = statusBarHeight;
const topbarHeight = NavBar.topbarHeight;
class GuardianList extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			listData: [],
			isEdit: false,
			isSuccess: false,
			isIndex: 0,
			isModalEdit: false,
			inputValue: '',
			pageY: 0,
		};
	}
	componentWillMount()
	{

		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{
		this.addListener = this.props.navigation.addListener('didFocus', (payLoad) =>
		{
			this.props.remoteLoading(false);
			GuardianService.list()
				.then(res => {
					console.log(res, '当前用户的被监护人列表')
					if (res.code == 200)
					{
						this.setState({
							listData: res.list,
						})
					}
					else
					{
						this.setState({
							listData: [],
						})
					}
				})
				.catch(err => {
					console.log(err, '当前用户的被监护人列表错误')

				})
		})
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		this.addListener && this.addListener.remove();
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	back() {
		this.props.navigation.pop();
	}

	watchData = () =>
	{
		this.setState({
			isEdit: false,
		})
		//查看历史数据
		var list = this.state.listData;
		var data = this.state.listData[this.state.isIndex];
		var index = this.state.isIndex;
		// this.props.navigation.navigate('', {dataGuardian: data, })
		this.props.navigation.navigate("DataObserve", {sn: data.deviceSn, token: data.userToken, })
	}


	cancel = () =>
	{
		console.log("解除监护关系");
		var list = this.state.listData;
		var data = this.state.listData[this.state.isIndex];
		var index = this.state.isIndex;

		this.alert("解除监护关系", '是否确认解除监护关系', () => {
			this.setState({
				isEdit: false,
			})

		}, () => {
			this.setState({
				isEdit: false,
			})
			GuardianService.sever({
				id: data.id,
			})
				.then(res => {
					console.log(res, '解除成功')
					if (res.code == 200)
					{
						list.splice(index, 1);
						this.setState({
							isSuccess: true,
							isEdit: false,
							listData: list,
						})

					}
					else
					{
						this.refs.toast.show(res.msg);
						this.setState({
							isEdit: false,
						})
					}
				})
				.catch(err => {

				})

		})
	}

	//弹出提示
	alert(title, text, callback,cancel)
	{
		Alert.alert(title, text, [
			{ text: "取消", onPress:()=>{ callback() } },
			{ text: "确定", onPress:()=>{ cancel() } },
		]);
	}

	onChangeText = (value) => {
		console.log(value, '11')
		this.setState({
			inputValue: value,
		})
	}

	btnSend = () =>
	{
		var index = this.state.operateIndex;
		var listData = this.state.listData;
		var inputValue = this.state.inputValue
		console.log(this.state.operateItem, '监护人信洗', this.state.inputValue)
		GuardianService.edit({
			type: 2,
			id: listData[index].id,
			alias: inputValue,
		})
			.then(res => {
				console.log(res, '监护人信息状态变更')
				if (res.code == 200)
				{
					this.refs.toast.show(res.msg);
					listData[index].userName = inputValue;
					this.setState({
						listData: listData,
						isModalEdit: false,
					})
				}
			})
			.catch(err => {

			})
	}

	goOperate = (item) =>
	{
		console.log(item, '监护人信息23123')
		this.props.addGuardian(item);
		this.props.beGuardian(item);
		this.props.navigation.navigate("RemoteOperation", {item: item, refreshData: () => {
			this.clearGuardian()
		} })
	}

	clearGuardian = () =>
	{
		//退出监护人模式
		this.props.wsmsgres(null);
	}

	renderList = () =>
	{
		var list = this.state.listData;
		if (!list || list.length < 1)
		{
			return <View style={styles.noData}>
				<Image source={require('../../../img/noData.png')} resizeMode="cover" style={styles.noImg} />
				<Text style={{color: '#ccc', paddingTop: 20, }}>暂无被监护人数据,请添加后查看</Text>
			</View>
		}
		else
		{
			return list.map((item, index) => {
				if (!item.underName)
				{
					if (!item.userName)
					{
						if (!item.wxNickname)
						{
							var name = '匿名用户'
						}
						else
						{
							name = item.wxNickname
						}
					}
					else
					{
						name = item.userName;
					}
				}
				else
				{
					name = item.underName;
				}
				if (!item.avatar)
				{
					if (!item.wxAvatar)
					{
						var avatar = ''
					}
					else
					{
						avatar = item.wxAvatar
					}
				}
				else
				{
					avatar = item.avatar;
				}
				return (<View style={styles.listItem} key={index}>
					<View style={styles.itemContent}>
						<View style={{width: 100,justifyContent: 'center', alignItems: 'center', }}>
							{avatar ? <Image source={{uri: avatar, }} resizeMode="cover" style={styles.avtar} /> : <Image source={require("../../../img/logo.png")} resizeMode="cover" style={styles.avtar} />}
						</View>
						<View style={{flex: 1, }}>
							<View>
								<View style={[styles.row, styles.subName, ]}>
									<Text>{name}</Text>
									<TouchableOpacity
										ref="explainIcon"
										style={{width: 40, height: 20, justifyContent: 'center', alignItems: 'center' }}
										onPress={() => this.setState({isEdit: true, isIndex: index, })}
									>
										<Image source={require("../../../img/more.png")} resizeMode="cover" style={styles.more} />
									</TouchableOpacity>
								</View>
								<View style={styles.row}><Text>手机号:</Text><Text>{item.userMobile}</Text></View>
								<View style={styles.row}><Text>目前绑定设备:</Text><Text>{item.deviceSn}</Text></View>
							</View>
						</View>
					</View>
					<View style={styles.listOperate}>
						<TouchableOpacity
							style={[styles.operateItem, {borderRightColor: '#ccc', borderRightWidth: 1, }]}
							onPress={() => this.setState({isModalEdit: true, inputValue: name, defaultValue: name, operateIndex: index, })}
						>
							<Image source={require("../../../img/editTo.png")} resizeMode="cover" style={styles.edit} />
							<Text>编辑</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.operateItem}
							onPress={() => this.goOperate(item)}
						>
							<Image source={require("../../../img/icon_1.png")} resizeMode="cover" style={styles.edit} />
							<Text>远程操控</Text>
						</TouchableOpacity>
					</View>

				</View>)
			})
		}
	}

	scroll = event =>
	{
		console.log(event.nativeEvent.contentOffset.y);//垂直滚动距离
		this.setState({
			pageY: event.nativeEvent.contentOffset.y,
		})
	}

	render()
	{

		let NavBarContent = null;
		let statusBar = null;

		NavBarContent = (<NavBar
			title="被监护人"
			leftIcon="ios-arrow-back"
			leftPress={this.back.bind(this)}
		/>)
		statusBar = (<StatusBar
			backgroundColor={"#24A090"}
			barStyle={this.props.barStyle || 'light-content'}
			translucent={true}
			style={styles.statusBarHeight}
		/>)

		return (
			<View style={{flex: 1,backgroundColor: "#FFF"}}>
				{statusBar}
				<View style={styles.statusBarHeight} backgroundColor={'#24A090'}/>
				{NavBarContent}
				<ScrollView
					style={styles.content}
					onScroll = {event => this.scroll(event)}
					scrollEventThrottle = {200}
				>
					<View style={{paddingHorizontal: 15}}>{this.renderList()}</View>
				</ScrollView>
				<View style={styles.addBottom}>
					<TouchableOpacity style={styles.addBtn} onPress={() => this.props.navigation.navigate("AddGuardians")}>
						<Text style={{color: '#fff', }}>添加被监护人</Text>
					</TouchableOpacity>
				</View>
				<Modals
					isVisible={this.state.isModalEdit}
					onBackdropPress={() => this.setState({ isModalEdit: false, })}
					animationType={"fade"}

				>
					<View style={styles.modalWhole}>
						<ScrollView style={styles.editModalInner}>
							<View style={{height: 50, justifyContent: 'center', alignItems: 'center', }}><Text>编辑</Text></View>
							<View style={styles.editInner}>
								<TextInput
									defaultValue={this.state.defaultValue}
									onChangeText={this.onChangeText}
									style={{flex: 1, textAlign: "center", }}
									underlineColorAndroid={'transparent'}
									ref={input => this.input = input}
								/>
								<TouchableOpacity
									style={styles.editBtn}
									onPress={() => this.input.focus()}
								>
									<Image source={require("../../../img/editInner.png")} resizeMode="cover" style={styles.edit_img} />
								</TouchableOpacity>
							</View>
							<View style={styles.editSend}>
								<TouchableOpacity
									style={[styles.btnSend, {borderRightColor: '#ccc', borderRightWidth: 1, }]}
									onPress={() => this.setState({isModalEdit: false, })}
								><Text>取消</Text></TouchableOpacity>
								<TouchableOpacity
									style={styles.btnSend}
									onPress={this.btnSend}
								><Text>确定</Text></TouchableOpacity>
							</View>

						</ScrollView>
					</View>
				</Modals>
				<Modals
					isVisible={this.state.isSuccess}
					onBackdropPress={() => this.setState({ isSuccess: false, })}
					animationType={"fade"}

				>
					<View style={styles.modalWhole}>
						<View style={styles.modalInner}>
							<Image source={require("../../../img/success.png")} resizeMode="cover" style={styles.success} />
							<Text>解除成功</Text>
							<Text style={{fontSize: 12, color: '#ccc', paddingTop: 10, }}>任意点击退出</Text>

						</View>
					</View>
				</Modals>
				{ this.state.isEdit && <TouchableOpacity style={styles.topIndex} onPress={() => this.setState({isEdit: false, })}></TouchableOpacity>}
				{ this.state.isEdit  ?  <View style={[styles.editContent, {top: 180*this.state.isIndex + statusBarHeight+ topbarHeight + 50 - this.state.pageY, }]}>
					<TouchableOpacity
						style={[styles.editItem, {borderBottomColor: '#ccc', borderBottomWidth: 1,  },]}
						onPress={this.cancel}
					>
						<Text>解除</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.editItem}
						onPress={this.watchData}
					><Text>查看历史数据</Text></TouchableOpacity>
				</View> : null}
			</View>
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
		pbTitle: (title) => dispatch(communityActions.pbTitle(title)),
		addGuardian: user => dispatch(guardianActions.addGuardian(user)),
		wsmsgres: s => dispatch(webSocketActions.wsmsgres(s)),
		remoteLoading: s => dispatch(webSocketActions.remoteLoading(s)),
		beGuardian: guardian => dispatch(webSocketActions.bleGuardian(guardian)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(GuardianList)


const styles = StyleSheet.create({
	statusBarHeight: {
		height: statusBarHeight,
		width: width,
	},
	noImg: {
		width: 60,
		height: 60,
	},
	row: {
		flexDirection: 'row',
		marginVertical: 3,
	},
	content: {
		height: contentHeight - 120,
		width: width,
		paddingTop: 15,
	},
	subName: {
		flexDirection: 'row',
		justifyContent: "space-between",
		alignItems: 'center',
		paddingRight: 15,
		height: 20,
	},
	noData: {
		justifyContent: 'center',
		alignItems: 'center',
		height: contentHeight - 120,
	},
	avtar: {
		width: 50,
		height: 50,
	},
	listItem: {
		width: width - 30,
		marginBottom: 15,
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: "#ddd",
	},
	itemContent: {
		flexDirection: 'row',
		paddingVertical: 15,
	},
	listOperate: {
		flexDirection: 'row',
		borderTopWidth: 1,
		borderTopColor: "#ddd",
	},
	operateItem: {
		flex: 1,
		justifyContent: 'center',
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
	},
	topIndex: {
		position: "absolute",
		left: 0,
		top: 0,
		width: width,
		height: height,
		zIndex: 1,
	},
	editContent: {
		backgroundColor: '#fff',
		position: 'absolute',
		zIndex: 99,
		right: 10,
		width: 100,
		height: 60,
		borderColor: '#ccc',
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	editItem: {
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1,
		width: 100,
	},
	edit: {
		marginRight: 10,
	},
	modalWhole: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalInner: {
		width: 200,
		height: 150,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 10,
	},
	editModalInner: {
		width: width - 40,
		height: 200,
		backgroundColor: '#fff',
		borderRadius: 10,
	},
	editInner: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		height: 105,
	},
	editSend: {
		height: 45,
		flexDirection: 'row',
		borderTopColor: '#ccc',
		borderTopWidth: 1,
	},
	btnSend: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	editBtn: {
		position: 'absolute',
		right: 40,
	},
	addBottom: {
		height: 120,
		justifyContent: 'center',
		alignItems: 'center',
	},
	addBtn: {
		width: width - 40,
		height: 40,
		backgroundColor: '#24A090',
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	}
});
