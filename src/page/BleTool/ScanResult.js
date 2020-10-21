/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Alert,
    StatusBar,
    Dimensions,
    DeviceEventEmitter
} from 'react-native';
// import Barcode from 'react-native-smart-barcode'
import NavBar from '../../common/NavBar'

import {statusBarHeight, height, width, } from '../../utils/uiHeader';

export default class ScanResultPage extends Component {
    static navigationOptions = {
        header: null
    }
    //构造方法
    constructor(props) {
        super(props);
        this.state = {
            viewAppear: false,
        };
    }

    componentDidMount() {
        console.log(this.props,'收到的路由')

        this.timeAt = setTimeout(() => {
                    console.log('12')
                    this._startScan()
        },500)
        this.setState({viewAppear: true})

        //启动定时器
    }
    //组件销毁生命周期
    componentWillUnmount() {
    }

    backCallback() {

    }

    back() {
        this.props.navigation.pop();
    }
    componentWillReceiveProps(newProps) {
        console.log(this.props,newProps,'新的属性')
        this.timeAt = setTimeout(() => {
                    this._startScan()
        },500)
        this.setState({viewAppear: true})
    }

    _onBarCodeRead = (e) => {
        // console.log(`e.nativeEvent.data.type = ${e.nativeEvent.data.type}, e.nativeEvent.data.code = ${e.nativeEvent.data.code}`)
        this._stopScan();
        var code = e.nativeEvent.data.code;

        var codeArray = "AEBFGCHDIZ";
        var snArray = "AB";
        console.log(codeArray.indexOf(code.substring(1, 2)), snArray.indexOf(code.substring(0, 1)),"扫码111")
        if (codeArray.indexOf(code.substring(1, 2)) > -1 && snArray.indexOf(code.substring(0, 1)) > -1 && code.length == 16 )
        {
            this.props.navigation.navigate("BleScanResultPage", {code: e.nativeEvent.data.code,name: '激光治疗手环',key: this.props.navigation.state.key, });
        }
        else
        {
            Alert.alert("非本设备二维码，请重新扫描", e.nativeEvent.data.code, [
                        {text: '确认', onPress: () =>{this._startScan(); }, },
                    ])

        }

    };

    _startScan = (e) => {
		console.log('开始扫码')
		this._barCode.startScan()
	};

	_stopScan = (e) => {
		console.log('停止扫码')
		this._barCode.stopScan()
	}
	render() {
		return (
			<View style={{flex: 1}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="扫码中"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
			</View>
		)
    }
}

const styles = StyleSheet.create({
	sBar: {
		height: statusBarHeight,
		width: width,
	},
});
