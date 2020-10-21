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
	Dimensions,
	BackHandler,
	TouchableOpacity,
	Image,
	Alert,
	Platform,
	ImageBackground,
} from 'react-native'
import NavBar from '../../common/NavBar'
import Item from '../../common/Item'
import Toast, { DURATION, } from 'react-native-easy-toast'


import { connect, } from 'react-redux'
import { fetchCourseDetail, } from '../../actions/page/MyCourse/MyCourseDetail';

import {statusBarHeight, height, width, } from '../../utils/uiHeader';

const contentHeight = height - NavBar.topbarHeight - statusBarHeight

//FontAwesome
class MyCourseDetailPage extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			course_data: [],
			course_parameter: [],
			display: false,
		}
	}
	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{
		var dic = {
			user_course_id: this.props.navigation.state.params.id,
			device_sn: this.props.connectedDevice.device_sn,
		}
		console.log(dic, '疗程参数')
		this.props.fetchCourseDetail(dic)
		console.log(this.props, '收到的数据状态');
		this.setState({
			course_data: this.props.course_data,
			course_parameter: this.props.course_parameter,
			display: true,
			course_name: '',
		})
	}
	componentWillReceiveProps(nextProps) {
		console.log(nextProps, '收到的新属性')
		if (nextProps.course_parameter !== this.props.course_parameter)
		{
			this.setState({
				course_parameter: nextProps.course_parameter,
				course_data: nextProps.course_data,
				course_name: nextProps.course_data[0].course_name,
				course_note: nextProps.course_data[0].notes,
				work_days: nextProps.course_data[0].course_cycle_work_days,
				rest_days: nextProps.course_data[0].course_cycle_rest_days,
				course_all: parseInt(nextProps.course_data[0].course_cycle_work_days) + parseInt(nextProps.course_data[0].course_cycle_rest_days),
			})
		}
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	back()
	{
		this.props.navigation.pop();
	}
	detail()
	{

	}
	buy()
	{


	}
	//弹出提示
	alert(text,callback){
		Alert.alert('提示',text,[{ text:'确定',onPress:()=>{ callback()} }]);
	}
	addDevice() {
		this.props.navigation.navigate("BleAddMethodsPage")
	}
	events(res) {
		console.log(this.props,'收到得数据')
		var type = res.type;
		switch (type)
		{
		case 'stop':
			this.props.fetchStopCourse(this.props.course_id, this.props.device_sn)
			break;
		}
	}
	setPay()
	{
		this.alert("待开发...",()=> {

		})
	}


	render()
	{
		var list = null, viewTitle, view;

		var course_parameter = this.state.course_parameter;

		if (course_parameter.length == 0)
		{
			list = null;
		}
		var arr = course_parameter[0];
		if (Array.prototype.isPrototypeOf(arr))
		{
			list = course_parameter.map((item, i) =>
			{
				viewTitle = (<View style={{paddingBottom: 10, }}><Text>阶段{i+1}</Text></View>)
				view = item.map((obj, n) =>
				{
					return (<View style={[styles.item, {paddingBottom: 10, }, ]} key={n}>
						<Text style={{color: '#000', }}>{obj.start_time}</Text>
						<Text style={{color: '#229F90', }}>{obj.start_duration}分钟</Text>
					</View>)
				})
				return (<View key={i}>
					{viewTitle}
					{view}
				</View>)
			})
		}
		else
		{


			list = course_parameter.map((item, y) =>
			{
				return (<View style={[styles.item, {paddingBottom: 10, }, ]} key={y}>
					<Text style={{color: '#000', }}>{item.start_time}</Text>
					<Text style={{color: '#229F90', }}>{item.start_duration}分钟</Text>
				</View>)
			})
		}

		return (
			<View style={{flex: 1, backgroundColor: "#fff"}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="疗程详情"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<ScrollView style={{height: contentHeight - 100}}>
					<View style={styles.title}>
						<ImageBackground style={styles.bg} source={require("../../img/course_detail_bg.png")}>
							<Text style={{fontSize: 23, color: '#fff', paddingTop: 25, paddingLeft: 24, }}>{this.state.course_name}</Text>
							<Text style={{fontSize: 14, color: '#fff', paddingTop: 5, paddingLeft: 24, }}>激光中医养生基础疗程</Text>
						</ImageBackground>
					</View>

					<View style={{flexDirection: 'column',backgroundColor: '#fff'}}>
						<View style={styles.head}>
							<Image source={require('../../img/line_left.png')} style={styles.headImg} />
							<Text style={{fontSize: 18, color: '#000', paddingHorizontal: 20, }}>周期开停</Text>
							<Image source={require('../../img/line_right.png')} style={styles.headImg} />
						</View>
						<View style={styles.notes}>
							<Text style={{fontSize: 14, lineHeight: 20, }}>本疗程为周期性治疗疗程，每次周期共{this.state.course_all}天，激光治疗{this.state.work_days}天，修养吸收{this.state.rest_days}天</Text>
						</View>
						<View style={styles.head}>
							<Image source={require('../../img/line_left.png')} style={styles.headImg} />
							<Text style={{fontSize: 18, color: '#000', paddingHorizontal: 20, }}>周期激光</Text>
							<Image source={require('../../img/line_right.png')} style={styles.headImg} />
						</View>
						<View style={styles.notes}>
							<View style={{width: width - 30 ,flexDirection: 'column',justifyContent: 'space-between',alignItems: 'center'}}>
								<View style={[styles.item,{paddingBottom: 10}]}>
									<Text style={{fontSize: 15, }}>每天开启时间</Text>
									<Text style={{fontSize: 15, }}>开启时长</Text>
								</View>
								{list}
							</View>
						</View>
						<View style={styles.head}>
							<Image source={require('../../img/line_left.png')} style={styles.headImg} />
							<Text style={{fontSize: 18, color: '#000', paddingHorizontal: 20, }}>疗程介绍</Text>
							<Image source={require('../../img/line_right.png')} style={styles.headImg} />
						</View>

						<View style={styles.notes}>
							<Text style={{fontSize: 15, lineHeight: 20, }}>{this.state.course_note}</Text>
						</View>
					</View>
				</ScrollView>
				{/*
					<View style={{height: 100,justifyContent: 'center',alignItems: 'center'}}>
									<TouchableOpacity style={styles.setPay} onPress={this.setPay.bind(this)}>
										<Text style={{color: '#fff'}}>续费购买</Text>
									</TouchableOpacity>
								</View>
							*/}
				<Toast ref="toast" />
			</View>
		)
	}
}

function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {
		course_data: state.courseDetail.course_data,
		course_parameter: state.courseDetail.course_parameter,
		connectedDevice: state.ble.connectedDevice,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		fetchCourseDetail: (courseid) => dispatch(fetchCourseDetail(courseid)),

	}
}

export default connect(mapStateToProps,mapDispatchToProps)(MyCourseDetailPage)


const styles = StyleSheet.create({
	sBar: {
		height: statusBarHeight,
		width: width,
	},
	list: {
		flexDirection: 'column',
		justifyContent: 'space-around',
		alignItems: 'center',
	},
	contentLeft: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		paddingTop: 20,
		paddingBottom: 20,
		paddingHorizontal: 10,
		borderBottomWidth: 1,
		borderColor: '#f4f4f4',

	},
	hr:{
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	head:{
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 20,
	},
	headImg: {
		width: 40,
		height: 14,
	},
	notes:{
		paddingHorizontal: 20,
		justifyContent: 'center',
		alignItems: 'center',
		paddingBottom: 20
	},
	item: {
		width: width - 40,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	setPay: {
		marginLeft: 20,
		marginRight: 20,
		height: 35,
		width: 100,
		backgroundColor: '#24a090',
		borderRadius: 15,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
		marginTop: 20,
	},
	title: {
		width: width,
		height: 160,
		paddingHorizontal: 20,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
	},
	bg: {
		width: width - 40,
		height: 160,
	}
});
