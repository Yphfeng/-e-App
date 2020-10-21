import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    ImageBackground,
    Text,
    StatusBar,
    TextInput,
    Dimensions,
    Keyboard,
    Image
} from 'react-native';
import Toast, { DURATION } from 'react-native-easy-toast'
import i18n from '../../utils/i18n';
import * as LoginService from '../../utils/network/loginService';
import NavBar from '../../common/NavBar'
let _window = Dimensions.get('window');
let _screen = Dimensions.get("screen");
import {statusBarHeight, height, width, } from '../../utils/uiHeader';

export default class ForgetPage extends Component {
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props)
        this.state = {
            codeTitle: i18n.t('register.sendText')
        }
    }
    back() {
        this.props.navigation.pop();
    }
    render() {
        return (
                <View style={styles.container}>
                    <StatusBar
                        translucent={true}
                        animated={true}
                    />
                    <View style={styles.sBar} backgroundColor={'#24a090'}/>
                    <NavBar
                        title="忘记密码"
                        leftIcon="ios-arrow-back"
                        leftPress={this.back.bind(this)}
                        titleStyle={{paddingLeft: 20}}
                    />
                    <View style={styles.topView}>
                        <View style={styles.itemContainer}>
                            <View style={styles.textLabel}>
                                <Image source={require("../../img/icon/reg-phone-ic.png")} style={styles.phone}  />
                                <Text>手机号</Text>
                            </View>
                            <TextInput style={styles.inputText} keyboardType="numeric" maxLength={11} underlineColorAndroid="transparent" placeholder="请输入您的手机号码" onChangeText={this.onChangeEmailText.bind(this)} />
                        </View>
                        <View style={styles.itemContainer}>
                            <View style={styles.textLabel}>
                                <Image source={require("../../img/icon/reg-verification-code-ic.png")} style={styles.phone}  />
                                <Text>验证码</Text>
                            </View>
                            <View style={styles.checkCode}>
                                <TextInput style={[styles.inputText,{width: width - 150}]} underlineColorAndroid="transparent" placeholder={i18n.t('register.tapCodeText')} onChangeText={this.onChangeCodeText.bind(this)} />
                                <TouchableOpacity style={styles.checkBTN} onPress={this.sendCodeEvent.bind(this)}>
                                    <Text style={{ color: 'white' }}>{this.state.codeTitle}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={styles.bottomView}>
                        <TouchableOpacity onPress={this.nextEvent.bind(this, { 'type': 'confirm' })}>
                            <View style={styles.cofirmView}>
                                <Text style={{ color: 'white', fontSize: 15 }}>下一步</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Toast ref="toast"/>
                </View>

        )
    }

    sendCodeEvent() {
        console.log('11111')
        Keyboard.dismiss();
        if (this.codeNum > 0) { return; }
        if (this.myInterval) {
            clearInterval(this.myInterval);
            this.myInterval;
        }

        if (this.email) {
            if(!(/^1[3|4|5|6|7|8|9][0-9]{9}$/.test(this.email))){
                this.refs.toast.show("手机号码格式错误")
                return;
            }
            LoginService.detection({mobile: this.email})
            .then((res)=> {
                console.log(res)
                if(res.status == 1){
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
                    return LoginService.sendResetPasswordCode({ mobile: this.email })
                } else {
                    this.refs.toast.show('该账号未被注册');
                    return new Promise(()=>{console.log('终止后面的.then()')})
                }
            })
            .then((_responseJSON) => {
                console.log("请求成功", _responseJSON);
                if (_responseJSON.status == 1) {
                    this.refs.toast.show(i18n.t('success'));

                    this.uid = _responseJSON.uid;
                } else {
                    this.setState({
                        codeTitle: i18n.t('register.resendText')
                    })
                    this.codeNum = 0;
                    clearInterval(this.myInterval);
                    this.myInterval;
                    this.refs.toast.show(i18n.t('failed'));
                }
            })
            .catch((err) => {
                this.setState({
                    codeTitle: i18n.t('register.resendText')
                })
                clearInterval(this.myInterval);
                this.myInterval;
                this.codeNum = 0;
                this.refs.toast.show(i18n.t('networkError'));
                console.log('请求失败', err);
            });
        } else {
            //this.refs.toast.show(i18n.t('login.accountOrPasswordWrongText'));
            this.refs.toast.show('请输入手机号');
        }
    }
    nextEvent() {

        Keyboard.dismiss();
        console.log(this.uid, this.code, this.email)
        if(!this.email){
            this.refs.toast.show('请输入账号');
            return;
        } else if(!this.code) {
            this.refs.toast.show('请输入验证码');
            return;
        }
        if (this.uid && this.code && this.email) {

            const _uid = this.uid;
            const _code = this.code;
            const _email = this.email;
            LoginService.resetCheckCode({ code: _code, uid: _uid })
                .then((_responseJSON) => {
                    console.log(_responseJSON,'校验密码')
                    if (_responseJSON.status == 1) {
                        this.props.navigation.navigate("SavePasswordPage",{email: _email,uid:_uid,code: _code})
                        return;
                    }
                    this.refs.toast.show(i18n.t('failed'));
                })
                .catch(err => {
                    this.refs.toast.show(i18n.t('failed'));
                })

        } else {
            this.refs.toast.show(i18n.t('login.accountOrPasswordWrongText'));
        }
    }

    onChangeEmailText(text) {
        this.email = text;
    }
    onChangeCodeText(text) {
        this.code = text;
    }
}

const styles = StyleSheet.create({
    sBar: {
        height: statusBarHeight,
    },
    container: {
        backgroundColor: '#fff',
        height: height
    },
    contains: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    topView: {
        height: height - 165,
        flexDirection: 'column',
        paddingTop: 50,
    },
    itemContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 20,
    },
    textLabel: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    inputText: {
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
        paddingLeft: 10,
        paddingRight: 10,
        minWidth: 100,
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
        alignItems: 'center'
    },
    cofirmView: {
        height: 44,
        width: width - 100,
        borderRadius: 22,
        backgroundColor: '#24A090',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
})
