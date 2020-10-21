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
	Dimensions,
	BackHandler,
	Image,
	ToastAndroid,
	TouchableOpacity,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	DeviceEventEmitter,
} from 'react-native'
import NavBar from '../../common/NavBar'
import Item from '../../common/Item'
import QBStorage from '../../utils/storage/storage';
import * as qbDate from '../../utils/qbDate';
import PullList from '../../common/pullPush/PullList';
import NotiTabBarIcon from "../../common/badge";

import * as HomeService from '../../utils/network/homeService'
import { connect, } from "react-redux";
import * as notificationActions from '../../actions/notificationActions';
import {statusBarHeight, height, width, bottomToolsBarHeight, } from '../../utils/uiHeader';
const contentHeight = height - NavBar.topbarHeight - statusBarHeight - bottomToolsBarHeight;
//FontAwesome

var msg = 0;
let that;
class NotificationList extends Component
{
	static navigationOptions = {
			tabBarLabel: '消息',
			tabBarIcon: ({focused, }) => {
				if (focused)
				{
					return (
						<View>
							<NotiTabBarIcon isFocus={true} />
						</View>
					);
				}
				return (
					<View>
						<NotiTabBarIcon isFocus={false} />
					</View>
				);

			},
	}


	constructor(props)
	{
		super(props);
		that = this;
		this.state = {
			isRefreshing: false,
			avatarSource: null,
			config: [],
			page: 1,
			pageSize: 10,
			isFooting: false,
			userMsg: this.props.userMsg,
		};
		this.isGet = false;
		this.isLoadingMore = false;
		this.topIndicatorRender = this.topIndicatorRender.bind(this);
		this.onPullRelease=this.onPullRelease.bind(this);
	}
	componentWillMount() {
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{

		this.viewDidAppear = this.props.navigation.addListener('didFocus', (obj)=>{
			this.getMessageListData({page: 1, pageSize: 10, })
			this.props.getUserMsgCount();
		})

	}

	componentWillReceiveProps(newProps)
	{
		this.setState({
			userMsg: newProps.userMsg,
		})
	}

	getMessageListData(dic)
	{
		HomeService.getMessageListData(dic)
			.then((res) => {
				console.log(res, '消息数据')
				this.isGet = true;
				if (res.code == 200)
				{
					this.setState({
						config: res.data,
						isRefreshing: false,
					})
				}
				else
				{
					this.setState({
						config: [],
						isRefreshing: false,
					})
				}
			})
			.catch(err => {
				console.warn(err);
			})
	}

	async onPullRelease()
	{
		this.setState({isRefreshing: true, page: 1, });

		var params = new Object();
		params.pageSize = 10
		params.page = 1
		this.getMessageListData(params);
	}

	//自定义下拉刷新指示器
	topIndicatorRender(pulling, pullok, pullrelease)
	{
		const that = this;
		const hide = {position: 'absolute', left: 10000, };
		const show = {position: 'relative', left: 0, };
		setTimeout(() =>
		{
			if (pulling)
			{
				this.txtPulling && this.txtPulling.setNativeProps({style: show});
				this.txtPullok && this.txtPullok.setNativeProps({style: hide});
				this.txtPullrelease && this.txtPullrelease.setNativeProps({style: hide});
			}
			else if (pullok)
			{
				this.txtPulling && this.txtPulling.setNativeProps({style: hide});
				this.txtPullok && this.txtPullok.setNativeProps({style: show});
				this.txtPullrelease && this.txtPullrelease.setNativeProps({style: hide});
			}
			else if (pullrelease)
			{
				this.txtPulling && this.txtPulling.setNativeProps({style: hide});
				this.txtPullok && this.txtPullok.setNativeProps({style: hide});
				this.txtPullrelease && this.txtPullrelease.setNativeProps({style: show});
			}
		}, 1);
		return (
			<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 60,zIndex:1}}>
				<ActivityIndicator size="small" color="red" />
				<View ref={(c) => this.txtPulling = c}>
					<Text>下拉刷新</Text>
				</View>
				<View ref={(c) => this.txtPullok = c}>
					<Text>释放更新</Text>
				</View>
				<View ref={(c) => this.txtPullrelease = c}>
					<Text>更新中</Text>
				</View>
			</View>
		);
	}


	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		this.viewDidAppear && this.viewDidAppear.remove();
	}

	onBackAndroid = () => {
		if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now())
		{
			//最近2秒内按过back键，可以退出应用。
			BackHandler.exitApp();
			return false;
		}
		this.lastBackPressed = Date.now();
		ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
		// return true;
		return true;
	};
	events(item)
	{
		console.log(item, 'asdsdcsqa')
		this.props.navigation.push("NotificationDetail",{item: item, type: 'message'})
	}

	_onEndReached = () =>
	{
		var page = this.state.page;
		this.setState({
			isFooterLoading: true,
		});
		console.log(page, '23123')
		this.loadMore(page + 1)
	}

	loadMore= async (page)=>
	{
		console.log(this.state.isFooting, '底部没有数据111', this.isLoadingMore)
		if (this.state.isFooting)
		{
        	return;
		}

		if (this.isLoadingMore)
		{
			return;
		}
		this.isLoadingMore = true;

		console.log("加载更多1111111111", page)
		var params = new Object();
		var list = this.state.config;
		params.pageSize = 10
		params.page = page
		HomeService.getMessageListData(params)
			.then((res) => {
				console.log(res, '消息数据')
				if (res.code == 200)
				{
					var responseData = res.data;
					if (responseData.length > 0)
					{
						for (var i = 0; i < responseData.length; i ++)
						{
							list.push(responseData[i]);
						}
						this.setState({
							config: list,
							page: page,
						})
					}
					else
					{
						this.setState({
							isFooting: true,
						})
					}
				}
				this.isLoadingMore = false;
			})
			.catch(err => {
				console.warn(err);
				this.isLoadingMore = false;
			})

	};

	renderNoMore=()=>
	{
		return (
			<View style={{justifyContent: 'center', alignItems: 'center', marginTop: 5, }}><Text>暂无更多消息</Text></View>
		);
	};

	renderEmpty=()=>
	{
		if (!this.isGet)
		{
			return null
		}
		return (<View style={{width: width, height: contentHeight, justifyContent: 'center', alignItems: 'center' }}>
			<Text>暂无数据</Text>
		</View>);
	}

	renderRow = (item, i) =>
	{
		return (<TouchableOpacity key={i} onPress={this.events.bind(this, item)} style={styles.listContent}>
			<View style={{flexDirection: 'row'}}>
				<Text style={styles.newsTitle}>{item.title}</Text>
				<Text style={{flex: 0.5}}>{item.status == 1 ? '已读' : '未读'}</Text>
			</View>
			<View><Text style={styles.newsDate}>{qbDate.DateFormat(item.createTime, 0)} {qbDate.DateFormat(item.createTime, 1)}</Text></View>
			<View style={styles.newsContent}><Text style={styles.newsInner}>{item.content?item.content:'这里是内容...'}</Text></View>
			<View style={styles.dot}><Image source={require("../../img/news-ic.png")} style={styles.dotImg} /><Text>系统消息</Text></View>
		</TouchableOpacity>)
	}
	render()
	{
		const { config,  } = this.state;
		let behavior = Platform.OS == 'ios' ? 'position' : null
		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="消息"
				/>
				<KeyboardAvoidingView style={styles.container}  behavior={behavior}>
					<View style={styles.listIntent}>
						<PullList
							//FlatList基本属性123
							data={config}
							renderItem={({item, index, })=>this.renderRow(item, index)}
							keyExtractor={(item) => item.id}
							//PullList下拉刷新
							onPullRelease={this.onPullRelease}
							topIndicatorRender={this.topIndicatorRender}
							topIndicatorHeight={60}
							//控制下拉刷新状态的属性，为true时显示头部刷新组件，为false则隐藏
							isRefreshing={this.state.isRefreshing}
							onEndReached={ this._onEndReached }
							onEndReachedThreshold={0.05}
							ListFooterComponent={this.state.isFooting ? this.renderNoMore : null}
							ListEmptyComponent={this.renderEmpty}
						>
						</PullList>
					</View>
				</KeyboardAvoidingView>


			</View>
		)
	}
}

function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {
		userMsg: state.user.userMsg,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		getUserMsgCount: () => dispatch(notificationActions.getUserMsgCount()),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationList)



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
	tabBarIcon: {
		width: 19,
		height: 19,
	},
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: width,
	},
	listIntent: {
		marginBottom: 15,
		justifyContent: "center",
		width: width,
		flexDirection: "column",
		flex: 1,
		overflow: 'scroll',
	},
	listContent: {
		width: width - 30,
		backgroundColor: '#fff',
		paddingVertical: 10,
		marginTop: 15,
		marginLeft: 15,
	},
	newsTitle: {
		fontSize: 17,
		color: '#333',
		paddingHorizontal: 10,
		flex: 3,
	},
	newsDate: {
		fontSize: 11,
		color: '#999',
		paddingVertical: 5,
		paddingHorizontal: 10,
	},
	newsContent: {
		paddingHorizontal: 10,
	},
	newsInner: {
		color: '#666',
		fontSize: 14,
	},
	dot: {
		flexDirection: 'row',
		justifyContent: "flex-start",
		alignItems: 'center',
		paddingHorizontal: 8,
		paddingTop: 8,
	},
	dotImg: {
		marginRight: 5,
	},
});
