import React, {Component} from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	Dimensions,
	RefreshControl,
	StatusBar,
	BackHandler,
	PixelRatio,
	TouchableOpacity,
	ScrollView,
	Platform,
} from 'react-native';
import px2dp from "../../../utils/px2dp";
import Item from "../../../common/Item";
import NavBar from "../../../common/NavBar";

import Icon from 'react-native-vector-icons/Ionicons'

import * as userService from '../../../utils/network/userService';
import { connect, } from 'react-redux'

import {statusBarHeight, height, width, } from '../../../utils/uiHeader';

//屏幕的宽度
var cols = 4;
var boxW = 80;
var vMargin = (width - cols*boxW)/(cols+1);
var hMargin = 15;

const currentHeight = Platform.OS === "ios" ? 0 : StatusBar.currentHeight;
const contentHeight = height - NavBar.topbarHeight - currentHeight;
class IntegralPage extends Component
{
	static navigationOptions = {
		header: null,
	};

	constructor(props)
	{
		super(props);
		this.state = {
			avatarSource: null,
			score: 0,
			scoreList: [],
		};
	}

	back() {
		this.props.navigation.pop();
	}

	componentDidMount()
	{

		this.getUserPoints();
		this.scoreLogList();

	}

	componentWillReceiveProps(newProps)
	{

	}

	componentWillMount() {
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	getUserPoints()
	{
		userService.getUserPoints()
			.then(res => {
				console.log(res,'获取的用户积分')
				if (res.status == 1)
				{
					this.setState({
						score: res.points,
					})
				}
				else
				{
					this.setState({
						score: 0,
					})
				}
			})
			.catch(err => {
				this.setState({
					score: 0
				})
			})
	}
	scoreLogList() {
		userService.scoreLogList()
			.then(res => {
				console.log(res,'获取的用户历史积分记录')
				if (res.status == 1)
				{
					var score = res.data.data;
					score.sort((x, y) =>
					{
						var dataX = new Date(x.create_time);
						var dataY = new Date(y.create_time);
						return dataY - dataX
					})

					this.setState({
						scoreList: score,
					})
				}
				else
				{
					this.setState({
						scoreList: []
					})
				}
			})
			.catch(err => {
				this.setState({
					scoreList: []
				})
			})
	}
	_rule() {
		this.props.navigation.navigate("IntegralRulePage")
	}

	_renderListItem() {
		return this.config.map((item, i) => {
			if (i % 3 === 0) {
				item.first = true
			}
			return (<Item key={i} {...item}/>)
		})
	}
	render()
	{
		let list = null ;
		let bt = null ;
		if (this.state.scoreList.length < 1)
		{
			list = (<View style={styles.noScore}><Text style={{fontSize: 20,color: '#000'}}>暂无记录</Text></View>)
		}
		else
		{
			list =  this.state.scoreList.map((item,index) => {
				var value = item.score_type;
				switch (value)
				{
				case '1':
					bt = (<Text style={styles.text}>连接设备</Text>);
					break;
				case '2':
					bt = (<Text style={styles.text}>完善信息</Text>);
					break;
				case "66":
					bt = (<Text style={styles.text}>商城消费抵扣</Text>);
					break;
				case '88':
					bt = (<Text style={styles.text}>商城积分消费</Text>);
					break;
				default:
					bt = (<Text style={styles.text}>其他</Text>);
					break;
				}
				return (<View style={styles.itemContent} key={index}>
					<View style={[styles.item,{paddingBottom: 5}]}>
						{bt}
						<Text style={styles.text}>{item.create_time}</Text>
					</View>
					<View style={styles.item}>
						<Text style={styles.text}>{item.balance}</Text>
						<Text style={styles.text}>{item.score}</Text>
					</View>
				</View>)
			})
		}
		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<StatusBar
					translucent={true}
					animated={true}
				/>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="积分管理"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<View style={styles.scrollView}>

					<View style={{
						height: height  ,
						paddingBottom: 60,
						backgroundColor: "#fff"
					}}>
						<View style={styles.userHead}>
							<Text style={{color: "#fff",fontSize: 20,paddingBottom: 15}}>{this.state.score}</Text>
							<Text style={{color: "#fff",fontSize: 13}}>积分余额</Text>
						</View>
						<ScrollView style={{height: contentHeight - 100,paddingHorizontal: 15,backgroundColor: '#fff'}}>
							<View style={styles.title}>
								<Text style={[styles.text,{color: '#000'}]}>积分明细</Text>
								<TouchableOpacity onPress={this._rule.bind(this)}><Text style={styles.text}>积分规则></Text></TouchableOpacity>
							</View>
							<View style={styles.content}>
								{list}
							</View>
						</ScrollView>
						{/*
							<View style={{height: 80,justifyContent: 'center',alignItems: 'center'}}>
													<View style={styles.useScore}><Text style={[styles.text,{color: '#fff'}]}>立即使用积分</Text></View>
												</View>
											*/}
					</View>
				</View>
			</View>
		)
	}
}

function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {
		msg: state.loginIn.msg,
		connectStatus: state.ble.connectStatus,
	}
}

function mapDispatchToProps(dispatch)
{
	return {

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(IntegralPage)


const styles = StyleSheet.create({
	subTitle: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		backgroundColor: '#fff',
		paddingBottom: 10

	},
	scrollView: {
		backgroundColor: "#1E82D2"
	},
	sBar: {
		height: statusBarHeight,
		width: width,
	},
	userHead: {
		flexDirection: "column",
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: "#24a090",
		height: 100,

	},
	tabBarIcon: {
		width: 19,
		height: 19
	},
	quitContainer: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		backgroundColor: '#fff'
	},
	avatarContainer: {
		flexDirection:'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: px2dp(10)
	},
	avatar: {
		borderRadius: 75,
		width: 60,
		height: 60
	},
	imageStyle: {
		width: width,
		height: 40
	},
	content:{
		flexWrap:'wrap',
		flexDirection: 'column'
	},
	itemContent: {
		paddingTop: 10,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#ddd',
		width: width - 30,
	},
	item: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',

	},
	icon: {
		width: 30,
		height: 30,
		marginBottom: 10
	},
	tabBarIcon: {
		width: 19,
		height: 19,
	},
	text: {
		fontSize: 12
	},
	title: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingTop: 10,
		paddingBottom: 10

	},
	noScore: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		height: contentHeight - 130,
	},
	useScore: {
		marginLeft: 20,
		marginRight: 20,
		height: 35,
		width: width - 50,
		backgroundColor: '#24a090',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 20
	}
});
