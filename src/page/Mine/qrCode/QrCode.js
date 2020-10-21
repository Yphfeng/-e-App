/**
 * @author lam
 */
'use strict';

import React, {Component} from 'react'
import {
    Text,
    View,
    StyleSheet, BackHandler,
    TouchableOpacity,
    Image,
    Alert,
    Platform
} from 'react-native'
import CameraRoll from "@react-native-community/cameraroll";
import NavBar from '../../../common/NavBar'
import Toast, { DURATION } from 'react-native-easy-toast';
const RNFS = require('react-native-fs'); //文件处理
import * as userService from '../../../utils/network/userService';

import {statusBarHeight, height, width, } from '../../../utils/uiHeader';

const contentHeight = height - NavBar.topbarHeight - statusBarHeight;
console.log(contentHeight,'gaodu')
//FontAwesome
export default class QrCodePage extends Component {
    static navigationOptions = {
        header: null
    };
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        this.getUserInfo();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }
    componentDidMount() {

    }
    getUserInfo() {
        userService.getUserQRCode()
            .then(res => {
                console.log(res,'获取的二维码信息')
                if(res.status == 1) {
                    this.setState({
                        content_url: res.url,
                    })
                }
            })
            .catch(err => {

            })
    }
    onBackAndroid = () => {
        this.props.navigation.goBack();
        return true;
    };

    constructor(props) {
        super(props)
        this.state = {
            content_url: "",
            mobile: "",
            address: "",
            name: ""
        }
    }

    back() {
        this.props.navigation.pop();
    }
    handleLongPress() {
        const _this = this;
        if(Platform.OS == "ios") {
            this.alert("提示","是否下载二维码",()=> {
                var promise = CameraRoll.save(_this.state.content_url)
                promise.then(function(result) {
                    _this.refs.toast.show("已保存到系统相册")
                }).catch(function(error) {
                    _this.refs.toast.show("保存失败")
                })

            },()=> {

            })
            return;
        }

        this.alert("提示","是否下载二维码",() => {
            const storeLocation = `${RNFS.DocumentDirectoryPath}`;
            let pathName = new Date().getTime() + "qrCode.png"
            let downloadDest = `${storeLocation}/${pathName}`;
            let saveImageUrl = this.state.content_url;
            const ret = RNFS.downloadFile({fromUrl:saveImageUrl,toFile:downloadDest});
            ret.promise.then(res => {
                if(res && res.statusCode === 200){
                    var promise = CameraRoll.saveToCameraRoll("file://" + downloadDest);
                    promise.then(function(result) {
                        console.log(result)
                       _this.refs.toast.show("已保存到系统相册")
                    }).catch(function(error) {
                        _this.refs.toast.show("保存失败")
                    })
                }else{
                    _this.refs.toast.show("保存失败")
                }
            })
            .catch(err => {
                _this.refs.toast.show("保存失败")
                console.log(err,'保存出错')
            })
        }, ()=> {

        })

    }
    alert(title,text,success,fail) {
        Alert.alert(
            title,
            text,
            [
                {text: '取消', onPress: ()=> fail()},
                {text: '确定', onPress: ()=> success()}
            ]
        );
    }
    render() {
        let content = null;
        if(this.state.content_url) {
            content = (<TouchableOpacity activeOpacity={1} onLongPress={this.handleLongPress.bind(this)} style={{justifyContent: 'center',alignItems: 'center',width: width, height: contentHeight }}>
                            <Image source={{uri: this.state.content_url}} style={{width:width - 120  , height:300}} resizeMode={"contain"} />
                            <View><Text style={{fontSize: 12,color: '#000'}}>我分享，我快乐(长按保存图片)</Text></View>
                        </TouchableOpacity>)
        }

        return (
            <View style={{backgroundColor: "#fff",height: height+100}}>
                <View style={styles.sBar} backgroundColor={'#24A090'}/>
                <NavBar
                    title="我的二维码"
                    leftIcon="ios-arrow-back"
                    leftPress={this.back.bind(this)}
                />

                    {content}

                <Toast ref="toast" />
            </View>
        )
    }
}


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
    text: {
        fontSize: 12
    }
})
