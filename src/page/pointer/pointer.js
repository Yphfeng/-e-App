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
	TouchableOpacity,
	Image,
	Alert,
	Platform,
} from 'react-native'
import NavBar from '../../common/NavBar'
import Toast, { DURATION } from 'react-native-easy-toast'

import { AnalogClock } from '../../common/AnalogClock/index';
import Picker from 'react-native-wheel-picker'
import { connect } from 'react-redux'
import { setPointer } from '../../actions/device/bleActions';

import {statusBarHeight, height, width, } from '../../utils/uiHeader';

const contentHeight = height - NavBar.topbarHeight - statusBarHeight
var PickerItem = Picker.Item;
var hour = [],min = [];
for(var i =1; i<13; i++) {
	if(i<10) {
		i = "0" + i
	}
	hour.push(i.toString())
}
for(var j = 1; j< 61; j++){
	if(j < 10) {
		j = '0' + j
	}
	min.push(j.toString())
}
class TimeCalibrationPage extends Component {
	static navigationOptions = {
		header: null
	}
	constructor(props) {
		super(props);
		this.state = {
			hourList: hour,
			minList: min,
			selectedHourItem: '01',
			selectedMinItem: '01',
			time: 0, //时间选择器的显示隐藏,
			btnStatus: 0, //确定取消按钮的状态,
		}
	}
	componentWillMount() {
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount() {
		var myDate = new Date();
		var hour = myDate.getHours();
		var minute = myDate.getMinutes();
		var second = myDate.getSeconds();
		this.time = setInterval(() => {
			second++;
			if(second > 60) {
				second = 0;
				minute = minute + 1;
			}
			if(minute > 59) {
				minute = 0;
				hour = hour + 1
			}
			if(minute.length< 2) {
				minute = "0" + minute
			}
			if(hour > 23) {
				hour  = 0
			}
			if(hour.length < 2) {
				hour = '0' + hour
			}
			this.setState({
				nowTime: hour + "时" + minute+ "分",
				h: hour,
				m: minute
			})
		},1000)

		console.log(hour,'收到的数据状态',min);


	}
	componentWillReceiveProps(nextProps) {
		console.log(nextProps,'收到的新属性')
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		this.time && clearInterval(this.time);
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	back() {
		this.props.navigation.pop();
	}
		//弹出提示
	alert(text,callback){
		Alert.alert('提示',text,[{ text:'确定',onPress:()=>{ callback()} }]);
	}
	show = () => {
		this.setState({
			time: 1
		})
	}
	hide = () => {
		this.setState({
			time: 0
		})
	}
	cancel = () => {
		this.setState({
			time: 0,
			btnStatus: 0,
		})
	}
	determine = () => {
		this.setState({
			time: 0,
			btnStatus: 1,
		})
	}

	render() {

		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="指针调整"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<View style={{height: contentHeight,backgroundColor: '#fff'}}>
					<View style={{height: contentHeight/3, backgroundColor: 'red'}}></View>
					<View style={styles.tipText}>
						<Text style={{color:"#f79304",fontSize: 15,marginBottom: 10}}>温馨提示</Text>
						<Text style={{fontSize: 15,color: '#666'}}>请选择您当前设备上的指针指向的错误时间,点击确认调整,指针将调回正确位置;点击指针微调按钮,秒针一次移动五秒</Text>
					</View>

					<View style={styles.child}>
						<View style={styles.childTitle}>
							<View style={styles.dot}></View>
							<Text style={{fontSize: 15}}>时间调整</Text>
						</View>
						<View style={styles.childTitle}>
							<View style={styles.placeholder}></View>
							<TouchableOpacity style={styles.select} onPress={()=>{this.show()}}>
								<Text style={{fontSize: 15}}>{this.state.btnStatus==1?(this.state.selectedHourItem+':' +(this.state.selectedMinItem>=10?this.state.selectedMinItem:('0'+this.state.selectedMinItem))):'请输入表盘指针时间'}</Text>
							</TouchableOpacity>
							<View style={styles.btn}>
								<TouchableOpacity style={styles.btnTitle} onPress={this.confirmSet.bind(this)}>
									<Text style={{color: '#fff'}}>调整</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>

					<View style={styles.child}>
						<View style={styles.childTitle}>
							<View style={styles.dot1}></View>
							<Text style={{fontSize: 15}}>秒钟微调</Text>
						</View>
						<View style={styles.childTitle}>
							<View style={styles.placeholder}></View>
							<View style={styles.select1}>
								<Text style={{fontSize: 15}}>每次点击，手表秒针加五秒</Text>
							</View>
							<View style={styles.btn}>
								<TouchableOpacity style={styles.btnTitle} onPress={this.confirmTidySet.bind(this)}>
									<Text style={{color: '#fff'}}>+5秒</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>

					{this.state.time==1&&<View style={{height: contentHeight/3.5, width: width, position: 'absolute', bottom: 0, backgroundColor: '#fff'}}>
						<View style={styles.staus}>
							<TouchableOpacity style={styles.stausCancel} onPress={()=> {this.cancel()}}>
								<Text style={{color: '#579FE8'}}>取消</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.stausCancel1} onPress={()=>{this.determine()}}>
								<Text style={{color: '#579FE8'}}>确定</Text>
							</TouchableOpacity>
						</View>
						<View style={{flexDirection: 'row',height: contentHeight/3, width: width, position: 'absolute'}}>
							<Picker style={{width: 150, flex:1}}
								selectedValue={this.state.selectedHourItem}
								itemStyle={{color:"#000", fontSize:12}}
								curtainColor="#000"
								onValueChange={(index) => this.onPickerHourSelect(index)}>
									{this.state.hourList.map((value, i) => (
										<PickerItem label={value} value={Number(value)} key={"money"+value}/>
									))}
							</Picker>
							<Picker style={{width: 150, flex: 1}}
								selectedValue={this.state.selectedMinItem}
								itemStyle={{color:"#000", fontSize:12}}
								onValueChange={(index) => this.onPickerMinSelect(index)}>
									{this.state.minList.map((value, i) => (
										<PickerItem label={value} value={Number(value)} key={"money"+value}/>
									))}
							</Picker>
						</View>
					</View>}
				</View>
				<Toast ref="toast" />
			</View>
		)
	}
	onPickerHourSelect (index) {
		this.setState({
			selectedHourItem: index < 10 ? Number('0' + index) : index,
		})
	}
	onPickerMinSelect (index) {
		this.setState({
			selectedMinItem: index < 10 ? Number('0' + index) : index,
		})
	}
	confirmSet(){
		if(!this.props.bleStatus) {
			this.refs.toast.show("请打开蓝牙")
			return;
		}
		if(this.props.connectStatus !== 4)
		{
			this.refs.toast.show("请连接设备")
			return
		}
		if(this.state.btnStatus==0){
			this.refs.toast.show("请输入表盘上的错误时间")
			return
		}
		var Hour = this.state.selectedHourItem.toString();
		var Minute = this.state.selectedMinItem.toString();
		if(Hour == this.state.h && Minute == this.state.m ){
			this.refs.toast.show("时间没有偏差，无法调整");
			return;
		}
		console.log(Hour,Minute,'shijain11111111');
		this.props.setPointer({hour: Hour,minute: Minute,type: 1},this.props.deviceId)
	}
	confirmTidySet(){
		if(!this.props.bleStatus) {
			this.refs.toast.show("请打开蓝牙")
			return;
		}
		if(this.props.connectStatus !== 1) {
			this.refs.toast.show("请连接设备")
			return
		}
		this.props.setPointer({value: 5, type: 0},this.props.deviceId)
	}
}

function mapStateToProps(state) {
	console.log(state,'子组件的属性')
	return {
		deviceId: state.ble.deviceId,
		connectStatus: state.ble.connectStatus,
		bleStatus: state.ble.bleStatus
	}
}

function mapDispatchToProps(dispatch) {
	return {
		setPointer: (dic,ble,deviceId) => dispatch(setPointer(dic,ble,deviceId))
	}
}

export default connect(mapStateToProps,mapDispatchToProps)(TimeCalibrationPage)


const styles = StyleSheet.create({
	title: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		color: "#666"
	},
	sBar: {
		height: statusBarHeight,
		width: width,
	},
	tipText: {
		marginLeft: 15,
		marginRight: 15,
		marginTop: 15,
		backgroundColor: '#F6FBFA',
		borderRadius: 5,
		paddingVertical:10,
		paddingHorizontal: 10,
		height: 100,
	},
	child: {
		marginLeft: 15,
		marginRight: 15,
		marginTop: 15,
	},
	childTitle: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	dot: {
		width: 13,
		height: 13,
		borderRadius: 6.5,
		backgroundColor: '#F09896',
		marginRight: 8,
	},
	dot1: {
		width: 13,
		height: 13,
		borderRadius: 6.5,
		backgroundColor: '#FAE09D',
		marginRight: 8,
	},
	placeholder: {
		flex: 1
	},
	select: {
		flex: 11,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderColor: '#666'
	},
	select1: {
		flex: 11,
		paddingVertical: 10,
	},
	btn: {
		flex: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	btnTitle: {
		backgroundColor: '#24a090',
		width: 70,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 5,
		borderRadius: 20
	},
	staus: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: '#ECECEC',
		paddingHorizontal: 20,
		paddingVertical: 10,
		zIndex: 100,
	},
	stausCancel: {
		flex: 1,
	},
	stausCancel1: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'flex-end'
	}
});
