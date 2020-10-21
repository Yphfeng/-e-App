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
	DeviceEventEmitter,
} from 'react-native'
import NavBar from '../../../common/NavBar'
import Item from '../../../common/Item'
import Toast, { DURATION, } from 'react-native-easy-toast'
import * as qbDate from '../../../utils/qbDate';
import * as userService from '../../../utils/network/userService';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect, } from 'react-redux'
import {fetchUserCourseList, } from '../../../actions/user/userActions';
import { fetchStopCourse, beginCourse, switchCourse, } from '../../../actions/page/MyCourse/MyCourseList';

import {statusBarHeight, height, width, } from '../../../utils/uiHeader';

const contentHeight = height - NavBar.topbarHeight - statusBarHeight

//FontAwesome
class CourseSuccessPage extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			userCourseList: [],
			display: false,
		}
	}
	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{
		this.setState({
			text: this.props.navigation.state.params.type == "writeSuccess" ? "写入成功" : "赠送成功",
			isText: this.props.navigation.state.params.type == "writeSuccess" ? true : false,
		})
	}
	componentWillReceiveProps(nextProps) {
		console.log(nextProps, '收到的新属性')

	}


	componentWillUnmount()
	{
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
	}

	onBackAndroid = () => {

		if (this.props.navigation.state.params.refreshData)
		{
			var refreshData = this.props.navigation.state.params.refreshData;
			refreshData();
		}
		this.props.navigation.navigate("IsBuyCourse");
		return true;
	};

	back()
	{
		if (this.props.navigation.state.params.refreshData)
		{
			var refreshData = this.props.navigation.state.params.refreshData;
			refreshData();
		}
		this.props.navigation.navigate("IsBuyCourse");
	}

	go()
	{
		DeviceEventEmitter.emit('CourseData', true)
		this.props.navigation.navigate("MyCourse");
	}

	render()
	{
		let content = null;
		if (this.state.isText)
		{
			content = (<TouchableOpacity style={styles.go} onPress={this.go.bind(this)}>
				<Text style={{color: '#fff'}}>去查看</Text>
			</TouchableOpacity>)
		}
		else
		{
			content = null;
		}

		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="已购疗程"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<ScrollView style={{height: contentHeight,backgroundColor: '#F5F5F5', }}>
					<View style={styles.content}>
						<Image source={require("../../../img/course_img.png")} style={styles.img} />
						<View style={{paddingVertical: 15, }}><Text style={{fontSize: 16, color: '#90ACB2', }}>{this.state.text}</Text></View>
						{content}
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
		userCourseList: state.user.userCourseList,
		device_sn: state.ble.device_sn,
		course_id: state.user.courseId,
		user_course_id: state.user.user_course_id,
		allStatus: state.user.allStatus,
		deviceId: state.ble.deviceId,
		stopStatus: state.courseList.status,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		fetchUserCourseList: (dic) => dispatch(fetchUserCourseList(dic)),
		fetchStopCourse: (id,dic) => dispatch(fetchStopCourse(id,dic)),
		beginCourse: (dic,id,params) => dispatch(beginCourse(dic,id,params)),
		switchCourse: (dic,id,params) => dispatch(switchCourse(dic,id,params)),
		activeCourse: (dic) => dispatch(activeCourse(dic))
	}
}

export default connect(mapStateToProps,mapDispatchToProps)(CourseSuccessPage)


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
	content: {
		height: contentHeight,
		flexDirection: 'column',
		backgroundColor: '#F5F5F5',
		justifyContent: 'center',
		alignItems: 'center',
	},

	imgStyle: {
		width: 65,
		height: 65,
		marginRight: 10,
		borderRadius: 50,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',

	},
	img: {
		width: 65,
		height: 65,
	},
	go: {
		width: 120,
		height: 40,
		backgroundColor: '#24A090',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 6,
	},
});
