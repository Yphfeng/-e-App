import React, {Component} from 'react';
import {
    Image,
    StyleSheet,
    BackHandler,
    ToastAndroid,
    WebView,
    View,
    ActivityIndicator,
    StatusBar,
    TouchableOpacity,
    Text,
    Dimensions,
    ProgressBarAndroid,
    Platform,
    DeviceEventEmitter,
} from 'react-native';
import NavBar from '../../common/NavBar'
import CookieManager from 'react-native-cookies';
import { connect } from 'react-redux'
import Toast, { DURATION } from 'react-native-easy-toast'
import * as dataService from '../../utils/network/dataService';
import * as deviceService from '../../utils/network/deviceService';
import {startDFU, airUpdating} from '../../actions/device/bleActions';
import {ProgressView} from "@react-native-community/progress-view";
import {statusBarHeight, height, width} from '../../utils/uiHeader';

const contentHeight = height - NavBar.topbarHeight - statusBarHeight

class AirUpdata extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            isStartUpdata: false,
            progressBarValue: 0,
            upDataDetail: '升级说明',
            upDataStatus: 1
        };
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        this.progressSuccess && clearTimeout(this.progressSuccess)
    }

    onBackAndroid = () => {
        this.props.navigation.goBack();
        return true;
    };

    componentDidMount() {
        console.log(this.props,'获取新的数据');
        if(this.props.connectStatus) {
            var version_sn = this.props.firmWare ? this.props.firmWare.firmwareVersion : null;
            var str = version_sn && version_sn.substring(1);
            this.setState({
                productModle:  this.props.firmWare ? this.props.firmWare.productModle : null,
                firmwareVersion: version_sn
            })
            deviceService.checkVersion({
                firmware_code: this.props.firmWare ? this.props.firmWare.productModle : null,
                version_sn: str
            })
            .then((res) => {
                console.log(res,'检查最新版本号')
                if(res.status == 2) {
                    this.setState({
                        upDataDetail: '已升级',
                        upDataStatus: 1,
                        newFirmwareVersion: version_sn
                    })

                }else if(res.status == 1) {
                    this.setState({
                        upDataDetail: '升级说明',
                        upDataStatus: 0,
                        newFirmwareVersion: 'V' + res.data.version_sn,
                        newFirmwareVersionName: res.data.version_sn,
                        newPproductModle: res.data.firmware_code
                    })
                    deviceService.getUploadUrl({
                        firmware_code: res.data.firmware_code,
                        version_sn: res.data.version_sn
                    })
                    .then(res => {
                        console.log(res,'固件下载地址');
                        if(res.status == 1) {
                            DeviceEventEmitter.emit("getUploadUrl",res.data.url)
                        }

                    })
                    .catch(err => {

                    })
                }
            })
            .catch(err => {

            })

        }

    }

    componentWillReceiveProps(newProps) {
        if(newProps.airUpdataStatus == 1 && newProps.airUpdataStatus !== this.props.airUpdataStatus) {
            this.setState({
                isStartUpdata: true
            })
        }
        this.setState({
            progressBarValue: newProps.progressBarValue
        })
        if(newProps.progressBarValue == 1 && newProps.progressBarValue !== this.props.progressBarValue) {
            this.props.airUpdating(0)
            this.progressSuccess = setTimeout(() => {
                this.refs.toast.show("更新固件成功")
                this.setState({
                    isStartUpdata: !this.state.isStartUpdata,
                    upDataDetail: '已升级',
                    upDataStatus: 1
                })
                deviceService.updateComplete({
                    version_sn: this.state.newFirmwareVersionName,
                    armarium_device_chang: this.props.firmWare.factorySerialNumber
                })
                .then(res => {
                    console.log(res,'更新固件成功')
                    if(res.status == 1) {
                        this.setState({
                            productModle: this.state.newPproductModle,
                            firmwareVersion: this.state.newFirmwareVersion
                        })
                    }
                })
                .catch(err => {

                })
            },1000)
        }
        if(newProps.airUpdataStatus == 3 && newProps.airUpdataStatus !== this.props.airUpdataStatus) {
            this.refs.toast.show("更新固件失败，请重试")
            this.setState({
                upDataStatus: 0,
                isStartUpdata: false
            })
        }

    }

    back() {
        this.props.navigation.pop();
    }

    explain() {
        this.props.navigation.navigate("UpDataExplain", {note: this.state.newFirmwareVersion})
    }

    goConnect() {
        this.props.navigation.navigate("Main");
    }

    upData() {
        if(this.props.connectStatus == 1) {
            this.props.startDFU(this.props.deviceId);
        }

    }

    render() {
        console.log(this.state.progressBarValue,'进度调。。。。。。。。')
        let viewContent = null,viewButton = null;

        if(this.props.connectStatus !== 1 && this.props.airUpdataStatus !== 1) {
            viewContent = (<View style={{justifyContent: 'center',alignItems: 'center',height: contentHeight-100,flexDirection: 'column'}}>
                    <Text>请先连接设备再对设备固件进行升级...</Text>
                </View>)
            viewButton = (<TouchableOpacity style={styles.upData} onPress={this.goConnect.bind(this)}><Text style={{color: '#fff'}}>请连接设备</Text></TouchableOpacity>)
        }else {
            viewContent = (<View style={{width: width}}>
                    <View style={[styles.listView,styles.listFirst]}>
                        <View style={styles.icon}>
                            <Image source={require('../../img/course_img.png')} roundAsCircle={true} style={styles.img} />
                        </View>
                        <View>
                            <Text style={styles.titleText}>激光治疗手环</Text>
                            <Text style={styles.titleSubText}>{this.state.productModle}</Text>
                            <Text style={styles.titleSubText}>固件版本号: {this.state.firmwareVersion}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.listView} onPress={this.explain.bind(this)}>
                        <View style={styles.icon}>
                            <Image source={require('../../img/course_img.png')} roundAsCircle={true} style={styles.img} />
                        </View>
                        <View>
                            <Text style={styles.titleText}>新固件版本号</Text>
                            <Text style={styles.titleSubText}>{this.state.newFirmwareVersion}</Text>
                        </View>
                        <View style={styles.extra}><Text style={{color: '#FB2525'}}>{this.state.upDataDetail}></Text></View>
                    </TouchableOpacity>
                </View>)
            if(this.state.upDataStatus == 1){
                viewButton = null;
            }else {
                if(!this.state.isStartUpdata) {
                    viewButton = (<TouchableOpacity style={styles.upData} onPress={this.upData.bind(this)}><Text style={{color: '#fff'}}>马上升级</Text></TouchableOpacity>)
                }else{
                    if(Platform.OS === "ios") {
                        viewButton = (<ProgressView
                                    progressTintColor="#24A090"
                                    progress={this.state.progressBarValue}
                                    style={styles.progressBar}
                                />)
                    }else{
                        viewButton = (<ProgressBarAndroid
                                  styleAttr="Horizontal"
                                  indeterminate={false}
                                  progress={this.state.progressBarValue}
                                  style={styles.progressBar}
                                />)
                    }

                }
            }

        }
        return (
            <View style={{backgroundColor: '#f5f5f5'}}>
                <View style={styles.sBar} backgroundColor={'#1E82D2'}/>
                <NavBar
                    title="空中升级"
                    leftIcon="ios-arrow-back"
                    leftPress={this.back.bind(this)}
                />
                <View style={styles.topView}>
                    {viewContent}
                </View>
                <View style={styles.bottomView}>
                    {viewButton}
                </View>
                <Toast ref="toast" />
            </View>
        );
    }
}
function mapStateToProps(state) {
    console.log(state,'子组件的属性')
    return {
        msg: state.loginIn.msg,
        connectStatus: state.ble.connectStatus,
        airUpdataStatus: state.ble.airUpdataStatus,
        firmWare: state.ble.firmWare,
        deviceId: state.ble.deviceId,
        progressBarValue: state.ble.progressBarValue
    }
}

function mapDispatchToProps(dispatch) {
    return {
        startDFU: (s) => dispatch(startDFU(s)),
        airUpdating: (s) => dispatch(airUpdating(s))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(AirUpdata)


const styles = StyleSheet.create({
    container: {
    },
    sBar: {
        height: statusBarHeight,
        width: width,
    },
    white: {
        color: '#fff',
    },
    flash: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    tabBarIcon: {
        width: 19,
        height: 19,
    },
    topView: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: contentHeight-100,

    },
    bottomView: {
        height:100,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: statusBarHeight

    },
    upData: {
        height: 45,
        width: width - 40,
        backgroundColor: '#24A090',
        borderRadius:30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    img: {
        width: 50,
        height: 50,
    },
    icon: {
        paddingRight: 10
    },
    titleText: {
        fontSize: 16,
        color: '#333',
    },
    titleSubText: {
        fontSize: 12,
        color: '#888',
    },
    listView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: '#fff',
    },
    listFirst: {
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
    extra: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    progressBar: {
        height: 45,
        width: width - 40,
    }
});
