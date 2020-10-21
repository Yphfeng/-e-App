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
    Platform
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
            selectedMinItem: '01'
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
    render() {
        let errorTime = null ;
        if(this.state.selectedHourItem == '01' && this.state.selectedMinItem == '01') {
            errorTime = <Text style={{fontSize: 18}}>请选择</Text>
        }else{
            errorTime = <Text  style={{fontSize: 18}}>{this.state.selectedHourItem ? this.state.selectedHourItem : ''}时{this.state.selectedMinItem ? this.state.selectedMinItem : ''}分</Text>
        }

        return (
            <View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
                <View style={styles.sBar} backgroundColor={'#24a090'}/>
                <NavBar
                    title="指针校准"
                    leftIcon="ios-arrow-back"
                    leftPress={this.back.bind(this)}
                />
                <View style={{height: contentHeight,backgroundColor: '#fff'}}>
                    <View style={{flexDirection: 'column',marginVertical: 20,paddingHorizontal: 20,height: 60}}>
                        <View style={{flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center'}}>
                            <Text style={styles.textSize}>北京时间:</Text>
                        </View>
                        <View style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'center',height: 50}}><Text style={{fontSize: 23}}>{this.state.nowTime}</Text></View>
                    </View>

                    <View style={{flexDirection: 'row',justifyContent: "space-between",alignItems: "flex-end",paddingHorizontal: 20,height: 50,marginBottom: 20}}>
                        <Text style={styles.textSize}>选择表盘错误时间:</Text>
                        {errorTime}
                    </View>
                    <View style={styles.tipText}>
                        <Text style={{color:"#f79304",fontSize: 12,marginBottom: 10}}>温馨提示</Text>
                        <Text style={{fontSize: 12,color: '#666'}}>请选择您当前设备上的指针指向的错误时间,点击确认调整,指针将调回正确位置;点击指针微调按钮,秒针一次移动五秒</Text>
                    </View>
                    <View style={styles.itemContent}>
                        <View style={styles.item}>
                            <View style={{alignItems: 'center',justifyContent: 'center',paddingTop: 20}}><Text>选择表上的时针</Text></View>
                            <Picker style={{width: 150, flex:1}}
                                selectedValue={this.state.selectedHourItem}
                                itemStyle={{color:"#000", fontSize:12}}
                                curtainColor="#000"
                                onValueChange={(index) => this.onPickerHourSelect(index)}>
                                    {this.state.hourList.map((value, i) => (
                                        <PickerItem label={value} value={Number(value)} key={"money"+value}/>
                                    ))}
                            </Picker>
                            <View style={{height: 60,width: width/2,justifyContent: 'center',alignItems: 'center'}}>
                                <TouchableOpacity style={styles.confirm} onPress={this.confirmSet.bind(this)}>
                                    <Text style={{color: '#fff'}}>确认调整</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.item}>
                            <View style={{alignItems: 'center',justifyContent: 'center',paddingTop: 20}}><Text>选择表上的分针</Text></View>
                            <Picker style={{width: 150, flex: 1}}
                                selectedValue={this.state.selectedMinItem}
                                itemStyle={{color:"#000", fontSize:12}}
                                onValueChange={(index) => this.onPickerMinSelect(index)}>
                                    {this.state.minList.map((value, i) => (
                                        <PickerItem label={value} value={Number(value)} key={"money"+value}/>
                                    ))}
                            </Picker>
                            <View style={{height: 60,width: width/2,justifyContent: 'center',alignItems: 'center'}}>
                                <TouchableOpacity style={styles.confirm} onPress={this.confirmTidySet.bind(this)}>
                                    <Text style={{color: '#fff'}}>指针微调</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
                <Toast ref="toast" />
            </View>
        )
    }
    onPickerHourSelect (index) {
        this.setState({
            selectedHourItem: index < 10 ? Number('0' + index) : index,
        })
        console.log(this.state.selectedHourItem,index)
    }
    onPickerMinSelect (index) {
        this.setState({
            selectedMinItem: index < 10 ? Number('0' + index) : index,
        })
        console.log(this.state.selectedMinItem,index)
    }
    confirmSet(){
        if(!this.props.bleStatus) {
            this.refs.toast.show("请打开蓝牙")
            return;
        }
        if(this.props.connectStatus !== 1) {
            this.refs.toast.show("请连接设备")
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
    itemContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        height: contentHeight - 300,
        marginBottom: 10
    },
    item: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    confirm: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: 40,
        borderRadius: 3,
        backgroundColor: '#24a090'
    },
    tipText: {
        marginLeft: 15,
        marginRight: 15,
        backgroundColor: 'rgba(222,240,238,0.3)',
        borderRadius: 5,
        paddingVertical:10,
        paddingHorizontal: 10,
        height: 70,
    },
    textSize: {
        fontSize: 16
    }
});
