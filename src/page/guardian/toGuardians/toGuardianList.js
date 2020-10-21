
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
	Linking,
} from 'react-native'
import NavBar from '../../../common/NavBar'
import Toast, { DURATION } from 'react-native-easy-toast'
import { connect, } from 'react-redux'
import * as communityActions from '../../../actions/communityActions';
import {statusBarHeight, height, width, } from '../../../utils/uiHeader';
import * as GuardianService from '../../../utils/network/guardianService';
import Modals from 'react-native-modal';

const contentHeight = height - NavBar.topbarHeight - statusBarHeight
const currentHeight = statusBarHeight;
const topbarHeight = NavBar.topbarHeight;
class ToGuardianList extends Component
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
		GuardianService.getGuardianList()
			.then(res => {
				console.log(res, '当前用户的监护人列表')
				if (res.code == 200)
				{
					this.setState({
						listData: res.info,
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

			})

	}

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


	cancel = () =>
	{
		console.log("解除监护关系");
		var list = this.state.listData;
		var data = this.state.listData[this.state.isIndex];
		var index = this.state.isIndex;

		this.alert("解除监护关系", '是否确认解除监护关系', '取消', '确定', () => {
			this.setState({
				isEdit: false,
			})

		}, () => {
			this.setState({
				isEdit: false,
			})
			GuardianService.editInfo({
				type: 3,
				guardian_id: data.guardian,
				status: 2,
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
	alert(title, text, cancalText, confirmText, callback, cancel)
	{
		Alert.alert(title, text, [
			{ text: cancalText, onPress:()=>{ callback() } },
			{ text: confirmText, onPress:()=>{ cancel() } },
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
		GuardianService.editInfo({
			type: 2,
			guardian_id: listData[index].guardian,
			guardian_name: inputValue,
		})
			.then(res => {
				console.log(res, '监护人信息状态变更')
				if (res.code == 200)
				{
					this.refs.toast.show(res.msg);
					listData[index].guardian_name = inputValue;
					this.setState({
						listData: listData,
						isModalEdit: false,
					})
				}
			})
			.catch(err => {

			})
	}

	call = index => {
		var item = this.state.listData[index];
		var mobile = item.mobile;
		var content = '呼叫电话' + mobile;
		var tel = 'tel:' + mobile;
		this.alert('紧急呼救', content, '取消', '马上呼救', () => {

		}, () => {
			Linking.canOpenURL(tel).then((supported) => {
				if (!supported) {
					console.log('Can not handle tel:' + tel)
				} else {
					return Linking.openURL(tel)
				}
				}).catch(error => console.log('tel error', error))
		})
	}

	renderList = () =>
	{
		var list = this.state.listData;
		if (list.length < 1)
		{
			return <View style={styles.noData}>
				<Image source={require('../../../img/noData.png')} resizeMode="cover" style={styles.noImg} />
				<Text style={{color: '#ccc', paddingTop: 20, }}>暂无监护人数据,请添加后查看</Text>
			</View>
		}
		else
		{
			return list.map((item, index) => {
				if (!item.guardian_name)
				{
					if (!item.name)
					{
						var name = '匿名用户'
					}
					else
					{
						name = item.name
					}
				}
				else
				{
					name = item.guardian_name;
				}

				if (!item.avatar_url)
				{
					var avatar = ''

				}
				else
				{
					avatar = item.avatar_url;
				}
				return (<View style={styles.listItem} key={index}>
					<View style={styles.itemContent}>
						<View style={{width: 100,justifyContent: 'center', alignItems: 'center', }}>
							{avatar ? <Image source={{uri: avatar, }} resizeMode="cover" style={styles.avtar} />  : <Image source={require("../../../img/logo.png")} resizeMode="cover" style={styles.avtar} />}
						</View>
						<View style={{flex: 1, }}>
							<View>
								<View style={[styles.row, styles.subName, ]}>
									 <Text>{name}</Text>

									<TouchableOpacity
										style={{width: 40, height: 20, justifyContent: 'center', alignItems: 'center' }}
										onPress={() => this.setState({isEdit: true, isIndex: index, })}
									>
										<Image source={require("../../../img/more.png")} resizeMode="cover" style={styles.more} />
									</TouchableOpacity>
								</View>
								<View style={styles.row}><Text>手机号:</Text><Text>{item.mobile}</Text></View>
								<View style={styles.row}><Text>目前绑定设备:</Text><Text>{item.device_chang}</Text></View>
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
							onPress={() => this.call(index)}
						>
							<Image source={require("../../../img/icon_1.png")} resizeMode="cover" style={styles.edit} />
							<Text>紧急呼救</Text>
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
			title="监护人"
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
						style={styles.editItem}
						onPress={this.cancel}
					>
						<Text>解除</Text>
					</TouchableOpacity>
				</View> : null}
				<Toast ref="toast" />
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
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ToGuardianList)


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
		height: contentHeight - 80,
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
		height: contentHeight - 80,
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
		height: 30,
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
});
