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
	DeviceEventEmitter,
	TouchableOpacity,
	Image,
	Alert,
	ActivityIndicator,
} from 'react-native'
import NavBar from '../../../common/NavBar'
import * as javaBase from '../../../utils/network/javaService';
import QBStorage from '../../../utils/storage/storage';
import Toast, { DURATION } from 'react-native-easy-toast';
import PullList from '../../../common/pullPush/PullList';

import {width, height, statusBarHeight, bottomToolsBarHeight, } from '../../../utils/uiHeader';
const contentHeight = height - NavBar.topbarHeight - statusBarHeight - bottomToolsBarHeight;
//FontAwesome
export default class CommentList extends Component {
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			tabStatus: 1,
			list1: [],
			list2: [],
			list3: [],
			user: {},
			refreshing: false,
			isFooting: false,
			isRefreshing: false,
			pageNum1: 1,
			pageNum2: 1,
			pageNum3: 1,
		};
		this.topIndicatorRender = this.topIndicatorRender.bind(this);
		this.onPullRelease=this.onPullRelease.bind(this);
	}
	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{
		QBStorage.get("user")
			.then(res =>
			{
				if (res.token)
				{
					this.article1(res.token);
					this.article2(res.token);
					this.article3(res.token);
				}
				else
				{
					this.article1("");
					this.article2("");
					this.article3("");
				}
			})
			.catch(err => {

			})

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

	async onPullRelease()
	{
		this.setState({isRefreshing: true, });
		var tabStatus = this.state.tabStatus;
		if (tabStatus == 1)
		{
			this.refreshList1()
		}
		else if (tabStatus == 2)
		{
			this.refreshList2()
		}
		else
		{
			this.refreshList3()
		}
	}

	article1(token)
	{
		var that = this;
		javaBase.request({
			path: "/weixin/circle/commentList",
			body: {pageNum: 1, pageSize: 15, status: 2, isMine: 1, token: token,},
		})
			.then((res) => {
				console.log(res, '直至栀子花资质')
				if (res.code==1)
				{
					var dataList = res.data.list;
					if (dataList.length > 0)
					{
						var list1 = [];
						var temp
						for (var i = 0; i < dataList.length; i++)
						{
							temp = {};
							temp["id"] = dataList[i].id;
							temp["content"] = dataList[i].content;
							temp["time"] = this.formatTime(dataList[i].createTime);
							temp["statusCode"]=dataList[i].statusCode;
							//根据帖子不同状态 放入对应的list 中
							list1.push(temp);

						}
						that.setState({
							dataSource1: list1,
						})
					}
				}
			})
			.catch(err => {
				//console.warn(err, 'errerr');
			})
	}

	article2(token)
	{
		var that = this;
		javaBase.request({
			path: "/weixin/circle/commentList",
			body: {pageNum: 1, pageSize: 15, status: 1, isMine: 1, token: token, },
		})
			.then((res) => {
				console.log(res, '直至栀子花资质')
				if(res.code==1)
				{
					var dataList = res.data.list;
					if (dataList.length > 0) {
						var list3 = that.state.list3;
						var temp
						for (var i = 0; i < dataList.length; i++) {
							temp = {};
							temp["id"] = dataList[i].id;
							temp["content"] = dataList[i].content;
							temp["time"] = this.formatTime(dataList[i].createTime);
							temp["statusCode"]=dataList[i].statusCode;
							//根据帖子不同状态 放入对应的list 中
							list3.push(temp);

						}
						that.setState({
							dataSource2: list3,
						})
					}
				}
			})
			.catch(err => {
				//console.warn(err, 'errerr');
			})
	}

	article3(token)
	{
		var that = this;
		javaBase.request({
			path: "/weixin/circle/commentList",
			body: {pageNum: 1, pageSize: 15, status: 3, isMine: 1, token: token, },
		})
			.then((res) => {
				console.log(res, '直至栀子花资质')
				if(res.code==1)
				{
					var dataList = res.data.list;
					if (dataList.length > 0) {
						var list2 = that.state.list2;
						var temp
						for (var i = 0; i < dataList.length; i++) {
							temp = {};
							temp["id"] = dataList[i].id;
							temp["content"] = dataList[i].content;
							temp["time"] = this.formatTime(dataList[i].createTime);
							temp["statusCode"]=dataList[i].statusCode;
							//根据帖子不同状态 放入对应的list 中
							list2.push(temp);

						}
						that.setState({
							dataSource3: list2,

						})
					}
				}
			})
			.catch(err => {
				//console.warn(err, 'errerr');
			})
	}

	format(shijianchuo) {
		//shijianchuo是整数，否则要parseInt转换
		var thisTime = shijianchuo.replace(/-/g, '/');
		return thisTime;
	}
	formatTime(shijianchuo)
	{
		//shijianchuo是整数，否则要parseInt转换
		var time = new Date(parseInt(shijianchuo)* 1000);
		var y = time.getFullYear();
		var m = time.getMonth() + 1;
		var d = time.getDate();
		var h = time.getHours();
		var mm = time.getMinutes();
		return y + '/' + this.add0(m) + '/' + this.add0(d) + ' ' + this.add0(h) + ':' + this.add0(mm);
	}
	add0(m) { return m < 10 ? '0' + m : m }

	componentWillUnmount()
	{
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	back() {
		console.log('123123');
		this.props.navigation.goBack();

	}
	selectBtn(type){
		this.setState({
			tabStatus: type
		})
	}
	detail(item){
		this.props.navigation.push("DynamicDetail",{item: item})
	};
	alert(title, id, callbck){
		Alert.alert(
			'提示',
			title,
			[
				{text: '确定', onPress: ()=> callbck()},
				{text: '取消', onPress: ()=> console.log('点击取消')}
			]
		);
	}
	refreshList1 = async ()=>
	{
		this.setState({
			pageNum1: 1,
		})
		this.isGet = false;
		var arr = [], obj = new Object(), list2 = [];
		obj.pageSize = 15
		obj.pageNum = 1
		obj.status = 2,
		obj.isMine = 1;
		javaBase.request({
			path: 'weixin/circle/commentList',
			body: obj,
		})
			.then((responseData)=>
			{
				this.setState({
					isRefreshing: false,
				})
				console.log(responseData, '数据111111222333');
				//根据接口返回结果得到数据数组
				if (responseData.code == 1)
				{
					var dataList = responseData.data.list;
					if (dataList.length > 0)
					{
						var temp
						for (var i = 0; i < dataList.length; i++)
						{
							temp = {};
							temp["id"] = dataList[i].id;
							temp["content"] = dataList[i].content;
							temp["time"] =this.formatTime(dataList[i].createTime);
							temp["statusCode"]=dataList[i].statusCode;
							//根据帖子不同状态 放入对应的list 中
							list2.push(temp);

						}
					}
					else
					{
						list2 = []
					}
					console.log(list2, '获取额数据')
					this.isGet = false;
					this.setState({
						dataSource1: list2,
						isFooting: false,
					})
				}
			})
			.catch(err =>
			{
				console.log(err)
				callBack([]);
			})
	}
	refreshList2 = async ()=>
	{
		this.setState({
			pageNum: 1,
		})
		if (this.isGet)
		{
			return;
		}
		this.isGet = true;
		var arr = [], obj = new Object(), list2 = [];
		obj.pageSize = 15
		obj.pageNum = 1
		obj.status = 1,
		obj.isMine = 1;
		javaBase.request({
			path: 'weixin/circle/commentList',
			body: obj,
		})
			.then((responseData)=>
			{
				this.setState({
					isRefreshing: false,
				})
				console.log(responseData, '详情的list2');
				//根据接口返回结果得到数据数组
				if (responseData.code == 1)
				{
					var dataList = responseData.data.list;
					if (dataList.length > 0)
					{
						var temp
						for (var i = 0; i < dataList.length; i++) {
							temp = {};
							temp["id"] = dataList[i].id;
							temp["content"] = dataList[i].content;
							temp["time"] = this.formatTime(dataList[i].createTime);
							temp["statusCode"]=dataList[i].statusCode;
							//根据帖子不同状态 放入对应的list 中
							list2.push(temp);

						}
					}
					else
					{
						list2 = []
					}
					console.log(list2, '获取额数据')
					this.isGet = false;
					this.setState({
						dataSource2: list2,
						isFooting: false,
					})
				}
				this.setState({
					isRefreshing: false,
				})
			})
			.catch(err =>
			{
				console.log(err)
			})
	}
	refreshList3 = async ()=>
	{
		this.setState({
			pageNum: 1,
		})
		this.isGet = false;
		var arr = [], obj = new Object(), list2 = [];
		obj.pageSize = 15
		obj.pageNum = 1
		obj.status = 3,
		obj.isMine = 1;
		javaBase.request({
			path: 'weixin/circle/commentList',
			body: obj,
		})
			.then((responseData)=>
			{
				this.setState({
					isRefreshing: false,
				})
				console.log(responseData, '数据111111222333');
				//根据接口返回结果得到数据数组
				if (responseData.code == 1)
				{
					var dataList = responseData.data.list;
					if (dataList.length > 0)
					{
						var temp
						for (var i = 0; i < dataList.length; i++) {
							temp = {};
							temp["id"] = dataList[i].id;
							temp["content"] = dataList[i].content;
							temp["time"] = this.formatTime(dataList[i].createTime);
							temp["statusCode"]=dataList[i].statusCode;
							//根据帖子不同状态 放入对应的list 中
							list2.push(temp);

						}
					}
					else
					{
						list2 = []
					}
					console.log(list2, '获取额数据')
					this.isGet = false;
					this.setState({
						dataSource3: list2,
						isFooting: false,
					})
				}
			})
			.catch(err =>
			{
				console.log(err)
			})
	}
	loadList1More= async (page)=>
	{
		if (this.state.isFooting)
		{
        	return;
		}

		if (this.isGet)
		{
			return;
		}
		console.log("加载更多1111111111")
		var arr = [], obj = new Object(), list2 = this.state.dataSource1;
		this.isGet = true;
		obj.pageSize = 15
		obj.pageNum = page
		obj.status = 2,
		obj.isMine = 1;
		javaBase.request({
			path: 'weixin/circle/commentList',
			body: obj,
		})
			.then((responseData)=>
			{
				this.isGet = false;
				console.log(responseData, '加载更多');
				var dataList = responseData.data.list;
				//根据接口返回结果得到数据数组
				if (dataList.length > 0)
				{
					var temp
					for (var i = 0; i < dataList.length; i++)
					{
						temp = {};
						temp["id"] = dataList[i].id;
						temp["content"] = dataList[i].content;
						temp["time"] = this.formatTime(dataList[i].createTime);
						temp["statusCode"]=dataList[i].statusCode;
						//根据帖子不同状态 放入对应的list 中
						list2.push(temp);
					}
					this.setState({
						pageNum2: page,
					})
				}
				else
				{
					this.setState({
						isFooting: true,
					})
				}
				this.setState({
					dataSource1: list2,
				})
			})
			.catch(err =>
			{
				console.log(err);
			})
	};
	loadList2More= async (page)=>
	{
		if (this.state.isFooting)
		{
        	return;
		}

		if (this.isGet)
		{
			return;
		}

		console.log("加载更多1111111111")
		var arr = [], obj = new Object(), list2 = this.state.dataSource2;
		this.isGet = true;
		obj.pageSize = 15
		obj.pageNum = page
		obj.status = 1,
		obj.isMine = 1;
		var user = await QBStorage.get("user");
		javaBase.request({
			path: 'weixin/circle/commentList',
			body: obj,
		})
			.then((responseData)=>
			{
				this.isGet = false;
				console.log(responseData, '加载更多');
				var dataList = responseData.data.list;
				//根据接口返回结果得到数据数组
				if (dataList.length > 0)
				{
					var temp
					for (var i = 0; i < dataList.length; i++)
					{
						temp = {};
						temp["id"] = dataList[i].id;
						temp["content"] = dataList[i].content;
						temp["time"] = this.formatTime(dataList[i].createTime);
						temp["statusCode"]=dataList[i].statusCode;
						//根据帖子不同状态 放入对应的list 中
						list2.push(temp);

					}
				}
				else
				{
					this.setState({
						isFooting: true,
					})
				}
				this.setState({
					dataSource2: list2,
				})
			})
			.catch(err =>
			{
				console.log(err);

			})
	};

	loadList3More= async (page)=>
	{
		if (this.state.isFooting)
		{
        	return;
		}

		if (this.isGet)
		{
			return;
		}

		console.log("加载更多1111111111")
		var arr = [], obj = new Object(), list2 = this.state.dataSource3;
		this.isGet = true;
		obj.pageSize = 15
		obj.pageNum = page
		obj.status = 3,
		obj.isMine = 1;
		var user = await QBStorage.get("user");
		javaBase.request({
			path: 'weixin/circle/commentList',
			body: obj,
		})
			.then((responseData)=>
			{
				this.isGet = false;
				console.log(responseData, '加载更多');
				var dataList = responseData.data.list;
				//根据接口返回结果得到数据数组
				if (dataList.length > 0)
				{
					var temp
					for (var i = 0; i < dataList.length; i++)
					{
						temp = {};
						temp = {};
						temp["id"] = dataList[i].id;
						temp["content"] = dataList[i].content;
						temp["time"] = this.formatTime(dataList[i].createTime);
						temp["statusCode"]=dataList[i].statusCode;
						//根据帖子不同状态 放入对应的list 中
						list2.push(temp);

					}
				}
				else
				{
					this.setState({
						isFooting: true,
					})
				}
				this.setState({
					dataSource3: list2,
				})
			})
			.catch(err =>
			{
				console.log(err);

			})
	};

	renderList2Row = (item, index) =>
	{
		return (<View key={index}>
			<View style={styles.listChild}>
				<Text style={styles.titleChild}>{item.content}</Text>
				<View style={styles.timeStatus}>
					<View>
						<Text>{item.time}</Text>
					</View>
					<TouchableOpacity onPress={this.delete.bind(this, item.id)}>
						<Text>删除</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>)
	}

	renderList3Row = (item, index) => {

		return (<View style={styles.listChild} key={index}>
			<Text style={styles.titleChild}>{item.content}</Text>
			<View style={styles.timeStatus}>
				<View>
					<Text>{item.time}</Text>
				</View>
				<TouchableOpacity onPress={this.delete.bind(this, item.id)}>
					<Text>删除</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.violation}>
				<Text style={{fontSize: 13,}}>此条评论涉嫌违禁，已被平台删除！如有疑问，请联系客服人员。</Text>
			</View>
		</View>)
	}

	renderEmpty=()=>
	{
		return (<View style={{width: width, height: contentHeight, justifyContent: 'center', alignItems: 'center', paddingTop: 10, }}>
			<Text>暂无数据</Text>
		</View>);
	}

	renderNoMore=()=>
	{
		if (!this.state.isFooting)
		{
			return null
		}
		return (
			<View style={{justifyContent: 'center', alignItems: 'center', paddingTop: 10, }}><Text>暂无更多</Text></View>
		);
	};

	delete(id)
	{

		var tabStatus = this.state.tabStatus;
		console.log(tabStatus)
		this.alert('删除', id, ()=>
		{
			if (tabStatus == 1)
			{
				javaBase.request({
					path: 'Weixin/Circle/commentDelete',
					body: {id: id, },
				})
					.then((res)=>
					{
						if (res.code == 1)
						{
							var dataSource1 = this.state.dataSource1;

							var index = dataSource1.findIndex(item => {
								return item.id == id;
							})
							dataSource1.splice(index, 1);
							console.log(dataSource1, '删除后的数据')
							this.setState({
								dataSource1: dataSource1,
							})

						} else {
							this.refs.toast.show("删除失败");
						}
					})
					.catch((err)=>{

					})
			}
			else if (tabStatus == 2)
			{
				javaBase.request({
					path: 'Weixin/Circle/commentDelete',
					body: {id: id, },
				})
					.then((res)=>
					{
						console.log(res, '返回的参数', this.PL2)
						if (res.code == 1)
						{
							var dataSource2 = this.state.dataSource2;

							var index = dataSource2.findIndex(item => {
								return item.id == id;
							})
							if (index > -1)
							{
								dataSource2.splice(index, 1);
							}
							this.setState({
								dataSource2: dataSource2,
							})

						}
						else
						{
							this.refs.toast.show("删除失败");
						}
					})
					.catch((err)=>{
						console.log(err)
					})
			}
			else
			{
				javaBase.request({
					path: 'Weixin/Circle/commentDelete',
					body: {id: id, },
				})
					.then((res)=>
					{
						if (res.code == 1)
						{
							var dataSource3 = this.state.dataSource3;

							var index = dataSource3.findIndex(item => {
								return item.id == id;
							})
							dataSource3.splice(index, 1);
							this.setState({
								dataSource3: dataSource3,
							})

						}
						else
						{
							this.refs.toast.show("删除失败");
						}
					})
					.catch((err)=>{

					})
			}
		})
	}

	_keyExtractor = (item, index) => item.id;

	_onEnd1Reached = () =>
	{
		var page = this.state.pageNum1;

		this.loadList1More(page + 1)
	}
	_onEnd2Reached = () =>
	{
		var page = this.state.pageNum2;

		this.loadList2More(page + 1)
	}
	_onEnd3Reached = () =>
	{
		var page = this.state.pageNum3;

		this.loadList3More(page + 1)
	}

	render()
	{
		let tabStatus = this.state.tabStatus;
		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="我的评论"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<View style={styles.content}>
					<TouchableOpacity onPress={this.selectBtn.bind(this,1)} style={styles.tabChild}>
						<Text>已发布</Text>
						{tabStatus==1?<View style={styles.select}></View>:
							<View style={styles.notSelect}></View>}
					</TouchableOpacity>
					<TouchableOpacity onPress={this.selectBtn.bind(this,2)} style={styles.tabChild}>
						<Text>审核中</Text>
						{tabStatus==2?<View style={styles.select}></View>:
							<View style={styles.notSelect}></View>}
					</TouchableOpacity>
					<TouchableOpacity onPress={this.selectBtn.bind(this,3)} style={styles.tabChild}>
						<Text>未通过</Text>
						{tabStatus==3?<View style={styles.select}></View>:
							<View style={styles.notSelect}></View>}
					</TouchableOpacity>
				</View>
				{tabStatus==2?
					<PullList
						//FlatList基本属性
						data={this.state.dataSource2}
						renderItem={({item, index, })=>this.renderList2Row(item, index)}
						keyExtractor={(item) => item.id}
						//PullList下拉刷新
						onPullRelease={this.onPullRelease}
						topIndicatorRender={this.topIndicatorRender}
						topIndicatorHeight={60}
						//控制下拉刷新状态的属性，为true时显示头部刷新组件，为false则隐藏
						isRefreshing={this.state.isRefreshing}
						onEndReached={ this._onEnd2Reached }
						onEndReachedThreshold={0.05}
						ListFooterComponent={this.state.isFooting ? this.renderNoMore : null}
						ListEmptyComponent={this.renderEmpty}
					>
					</PullList>
					: null}
				{tabStatus==1?
					<PullList
						//FlatList基本属性
						data={this.state.dataSource1}
						renderItem={({item, index, })=>this.renderList2Row(item, index)}
						keyExtractor={(item) => item.id}
						//PullList下拉刷新
						onPullRelease={this.onPullRelease}
						topIndicatorRender={this.topIndicatorRender}
						topIndicatorHeight={60}
						//控制下拉刷新状态的属性，为true时显示头部刷新组件，为false则隐藏
						isRefreshing={this.state.isRefreshing}
						onEndReached={ this._onEnd1Reached }
						onEndReachedThreshold={0.05}
						ListFooterComponent={this.state.isFooting ? this.renderNoMore : null}
						ListEmptyComponent={this.renderEmpty}
					>
					</PullList>
					: null}
				{tabStatus==3?
					<PullList
						//FlatList基本属性
						data={this.state.dataSource3}
						renderItem={({item, index, })=>this.renderList3Row(item, index)}
						keyExtractor={(item) => item.id}
						//PullList下拉刷新
						onPullRelease={this.onPullRelease}
						topIndicatorRender={this.topIndicatorRender}
						topIndicatorHeight={60}
						//控制下拉刷新状态的属性，为true时显示头部刷新组件，为false则隐藏
						isRefreshing={this.state.isRefreshing}
						onEndReached={ this._onEnd3Reached }
						onEndReachedThreshold={0.05}
						ListFooterComponent={this.state.isFooting ? this.renderNoMore : null}
						ListEmptyComponent={this.renderEmpty}
					>
					</PullList>
					: null}
				<Toast ref="toast" />
			</View>
		)
	}
}
const cols = 3;
const boxW = (width - 60)/3;
const vMargin = (width - cols * boxW) / (cols + 1);
const hMargin = 15;
const styles = StyleSheet.create({
	title: {
		paddingHorizontal: 15,
		paddingVertical: 8,
		color: "#666"
	},
	sBar: {
		height: statusBarHeight,
		width: width,
	},
	content: {
		flexDirection: 'row',
		justifyContent: 'center',
		backgroundColor: '#fff'
	},
	tabChild: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 10,
		paddingBottom: 5
	},
	select: {
		marginTop: 5,
		backgroundColor: '#24a090',
		height: 5,
		width: width/6
	},
	notSelect: {
		marginTop: 5,
		backgroundColor: '#FFF',
		height: 5,
		width: width/6
	},
	imgContent: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		marginBottom: 10,
	},
	imgChild: {
		width: boxW,
		height: boxW,
		marginLeft: vMargin,
		marginTop: hMargin,
	},
	imgContentChild: {
		flex: 1,
	},
	titleChild: {
		paddingHorizontal: 15,
		paddingTop: 15,
	},
	listChild: {
		backgroundColor: '#fff',
		marginTop: 5,
	},
	timeStatus: {
		flexDirection: 'row',
		paddingBottom: 10,
		paddingTop: 10,
		justifyContent: 'space-between',
		paddingHorizontal: 15,
	},
	notMore: {
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
	},
	violation: {
		marginHorizontal: 15,
		paddingVertical: 15,
		borderTopColor: '#EAEAEA',
		borderTopWidth: 1
	}
});
