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
} from 'react-native'
import NavBar from '../../common/NavBar'
import Item from '../../common/Item'
import QBStorage from '../../utils/storage/storage';
import * as qbDate from '../../utils/qbDate';

import * as HomeService from '../../utils/network/homeService'

import {statusBarHeight, height, width, } from '../../utils/uiHeader';

//FontAwesome
export default class NewsList extends Component {
	static navigationOptions = {
		header: null
	}
	constructor(props) {
		super(props);
		this.state = {
            dataItems: []
		};
	}
	componentWillMount() {
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount() {
		this.viewDidAppear = this.props.navigation.addListener('didFocus', (obj)=>{
			QBStorage.get('user')
				.then((user) =>
				{
					this.getRollMessageListData(user.user_id)
				})
				.catch(error =>
				{

				})
		})
	}

	//跑马灯列表
	getRollMessageListData(userId){
		var timeStamp = new Date(new Date().setHours(0, 0, 0, 0)) / 1000;
		var SevenDayAgo = timeStamp - 86400
		HomeService.getRollMessageListData({user_id: userId})
			.then((res)=>{
				console.log(res, '新的属性')
				if(res.status == 1)
				{
					var items = []
					for(var i=0; i<res.data.length; i++){
						var item = res.data[i];
						if(Number(item.create_time) > Number(timeStamp)){
							item.time = qbDate.DateFormat(item.create_time, 1)
						} else if(Number(SevenDayAgo)<Number(item.create_time)&&Number(item.create_time)<Number(timeStamp)){
							item.time = '昨天'
						} else{
							item.time = qbDate.DateFormat(item.create_time, 0)
						}
						items.push(item)
					}
					this.setState({
						dataItems: items
					})
				}else{
					this.setState({
						dataItems: []
					})
					this.refs.toast.show(res.msg)
				}
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
    NotificationDetail(id){
		this.props.navigation.push("NewsDetail",{id: id, type: 'roll'})
	}
	render() {
		let list = null;
		console.log(this.state.config,'列表啊啊实打实的')
		if (!this.state.dataItems)
		{
			list =  <Text>暂无数据！</Text>
		}
		else
		{
			list = this.state.dataItems.map((item, i) => {
				return (<TouchableOpacity key={i} style={styles.child} onPress={this.NotificationDetail.bind(this, item.id)}>
                    {!item.user_id&&<View style={{position: 'absolute', top: 0, right: 0}}>
                        <Image style={{width: 20, height: 20}} source={require("../../img/haveRead.png")}/>
                    </View>}
                    <View style={styles.imgBox}>
                        <Image source={require("../../img/novice.png")} style={styles.img} />
                    </View>
                    <View style={styles.content}>
                        <View style={styles.contentHead}>
                            <View style={styles.contentTitle}>
                                <Text style={styles.titleFont}>{item.title}</Text>
                            </View>
                            <View style={styles.time}>
                                <Text>{item.time}</Text>
                            </View>
                        </View>
                        <Text numberOfLines={1} style={styles.contentBody}>{item.description}</Text>
                    </View>
				</TouchableOpacity>)
			})
		}
		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24A090'}/>
				<NavBar
					title="通知"
                    leftIcon="ios-arrow-back"
                    leftPress={this.back.bind(this)}
				/>
				<ScrollView>
					<View style={styles.listIntent}>{list}</View>

				</ScrollView>
			</View>
		)
	}
}
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
	listIntent: {
		marginBottom: 15,
		width: width,
		flexDirection: "column",
    },
    child: {
        marginHorizontal: 15,
        marginTop: 15,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center'
    },
    imgBox: {
        marginHorizontal: 10,
        marginVertical: 10,
        flex: 1
    },
    img: {
        width: 70,
        height: 70,
    },
    content: {
        flex: 4,
    },
    contentHead: {
        flexDirection: 'row'
    },
    contentTitle: {
        flex: 3,
        justifyContent: 'center',
    },
    titleFont: {
        fontSize: 18,
        color: '#000'
    },
    time: {
        flex: 1.5,
        alignItems: 'flex-end',
        paddingRight: 10,
    },
    contentBody: {
        fontSize: 15,
        paddingTop: 7,
    }
});
