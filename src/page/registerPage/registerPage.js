import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    ImageBackground,
    Text,
    Image,
    ScrollView,
    TextInput,
    Dimensions,
    Keyboard
} from 'react-native';
import Toast, { DURATION } from 'react-native-easy-toast'
import i18n from '../../utils/i18n';
import * as LoginService from '../../utils/network/loginService';

import {statusBarHeight, height, width, } from '../../utils/uiHeader';
let _screen = Dimensions.get("screen");

export default class RegisterPage extends Component {
    static navigationOptions = {
        tabBarLabel: '注册'

    };

    constructor(props) {
        super(props)
        this.state = {
            codeTitle: i18n.t('register.sendText')
        }
        this.onBlur.bind(this)
    }

    back() {
        this.props.navigation.pop();
    }
    onBlur = ()=> {
        Keyboard.dismiss();
    }
    render() {
        return (
                <TouchableOpacity style={styles.contains} onPress={this.onBlur} activeOpacity={1}>
                    <View style={styles.topView}>
                        <View style={[styles.itemContainer,  { marginBottom: 10 }]}>
                            <View style={styles.textLabel}>
                                <Image source={require("../../img/icon/reg-phone-ic.png")} style={styles.phone}  />
                                <Text>手机号</Text>
                            </View>
                            <TextInput underlineColorAndroid='transparent' onBlur={this.onBlur} style={styles.inputText} placeholder="请输入您的手机号码" onChangeText={this.onChangeEmailText.bind(this)} />
                        </View>
                        <View style={[styles.itemContainer, { marginTop: 10, marginBottom: 10 }]}>
                            <View style={styles.textLabel}>
                                <Image source={require("../../img/icon/reg-verification-code-ic.png")} style={styles.phone}  />
                                <Text>验证码</Text>
                            </View>
                            <View style={styles.checkCode}>
                                <TextInput underlineColorAndroid='transparent' onBlur={this.onBlur} style={styles.inputText} placeholder="请输入收到的验证码" onChangeText={this.onChangeCodeText.bind(this)} />
                                <TouchableOpacity style={styles.checkBTN} onPress={this.sendCodeEvent.bind(this)}>
                                    <Text style={{ color: 'white' }}>{this.state.codeTitle}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={[styles.itemContainer, { marginTop: 5 }]}>
                            <View style={styles.textLabel}>
                                <Image source={require("../../img/icon/reg-phone-ic.png")} style={styles.phone}  />
                                <Text>密码</Text>
                            </View>
                            <TextInput underlineColorAndroid='transparent' onBlur={this.onBlur}  style={styles.inputText} placeholder="请设置您的密码" onChangeText={this.firstPasswordOnChange.bind(this)}/>
                        </View>
                        <View style={[styles.itemContainer, { marginTop: 10 }]}>
                            <View style={styles.textLabel}>
                                <Image source={require("../../img/icon/reg-phone-ic.png")} style={styles.phone}  />
                                <Text>验证密码</Text>
                            </View>
                            <TextInput underlineColorAndroid='transparent' onBlur={this.onBlur}  style={styles.inputText} placeholder="请再次输入您的密码" onChangeText={this.secondPasswordOnChange.bind(this)}/>
                        </View>
                    </View>
                    <View style={styles.bottomView}>
                        <TouchableOpacity onPress={this.nextEvent.bind(this, { 'type': 'confirm' })} style={styles.cofirmView}>
                                <Text style={{ color: 'white', fontSize: 15 }}>{i18n.t('confirm')}</Text>
                        </TouchableOpacity>
                    </View>
                    <Toast ref="toast"/>
                </TouchableOpacity>
        )
    }

    sendCodeEvent() {

        Keyboard.dismiss();
        if (this.codeNum > 0) { return; }
        if (this.myInterval) {
            clearInterval(this.myInterval);
            this.myInterval;
        }

        if (this.email) {
            this.codeNum = 60;
            this.myInterval = setInterval(() => {
                const codeNum = this.codeNum--;
                if (codeNum == 0) {
                    this.setState({
                        codeTitle: i18n.t('register.resendText')
                    })
                    clearInterval(this.myInterval);
                    this.myInterval;
                } else {
                    this.setState({
                        codeTitle: codeNum
                    })
                }
            }, 1000);
            LoginService.sendPhoneLoginCheckCode({ mobile: this.email })
            // LoginService.getLoginCode({mobile: this.email})
                .then((_responseJSON) => {
                    console.log("验证码注册成功", _responseJSON);
                    if (_responseJSON.status == 1) {

                        this.refs.toast.show(i18n.t('success'));

                        this.uid = _responseJSON.uid;
                    } else {
                        this.setState({
                            codeTitle: i18n.t('register.resendText')
                        })
                        clearInterval(this.myInterval);
                        this.codeNum = 0
                        //this.myInterval;
                        this.refs.toast.show(i18n.t('register.emailUsed'));
                    }
                })
                .catch((err) => {
                    this.setState({
                        codeTitle:  i18n.t('register.resendText')
                    })
                    clearInterval(this.myInterval);
                    this.myInterval;
                    this.codeNum = 0;
                    this.refs.toast.show(i18n.t('networkError'));
                    // console.log('请求失败', err);
                });
        } else {
            this.refs.toast.show(i18n.t('register.inputEmailText'));
        }
    }
    nextEvent() {
        Keyboard.dismiss();
        if(!this.email) {
            this.refs.toast.show("手机号不能为空！")
            return;
        }
        // if (this.uid && this.code && this.email && this.firstPassword == this.secondPassword)

        const _uid = this.uid;
        const _code = this.code;
        const _email = this.email;
        const _password = this.firstPassword;
        LoginService.checkCode({ code: _code, uid: _uid })
            .then((_responseJSON) => {
                console.log(_responseJSON,'确认注册');
                if (_responseJSON.status == 1) {
                    return LoginService.register({mobile: _email, password: _password,repassword: _password })
                }
            })
            .then((_responseRegister)=>{
                console.log(_responseRegister,'确认注册2');
                if (_responseRegister.status == 1) {
                    this.refs.toast.show(i18n.t('success'));
                    setTimeout(() => {
                        this.props.navigation.navigate("Login");
                    }, 1000);

                } else {
                    this.refs.toast.show(_responseRegister.msg);
                }
            })
            .catch((err) => {
                this.refs.toast.show(i18n.t('networkError'));
                console.log('请求失败', err);
            });
    }

    onChangeEmailText(text) {
        this.email = text;
    }
    onChangeCodeText(text) {
        this.code = text;
    }
    firstPasswordOnChange(text) {
        this.firstPassword = text;
    }
    secondPasswordOnChange(text) {
        this.secondPassword = text;
    }
}

const styles = StyleSheet.create({
    contains: {
        backgroundColor: '#fff',
        height: height,
    },
    itemContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginLeft: 20,
        marginRight: 20,
        height: 60,
    },
    textLabel: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    topView: {
        height: height - 175,
        flexDirection: 'column',
        paddingTop: 50,
    },
    inputText: {
        flex: 1,
        flexDirection: 'row',
        borderStyle: 'solid',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        width: width - 40,
        height: 44,
        padding:0,
        paddingLeft: 22,
    },
    checkCode: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    phone: {
        width: 22,
        height: 22,
    },
    checkedView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    checkBTN: {
        width: 100,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#24A090',
        marginLeft: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkNoteText: {
        flexDirection: 'column',
        marginLeft: 20,
        marginRight: 20,
    },
    passwordNoteText: {
        flexDirection: "row",
        marginLeft: 20,
        marginRight: 20,
    },
    bottomView: {
        height: 100,
        width: width,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cofirmView: {
        width: width - 100,
        height: 44,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 22,
        backgroundColor: '#24A090',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

    }
})
