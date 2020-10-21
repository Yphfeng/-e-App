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
import Toast, { DURATION } from 'react-native-easy-toast';
import Modal from "react-native-modal";
import i18n from '../../utils/i18n';
import * as LoginService from '../../utils/network/loginService';
import NavBar from '../../common/NavBar'
let _window = Dimensions.get('window');
let _screen = Dimensions.get("screen");
import {statusBarHeight, height, width, } from '../../utils/uiHeader';
export default class SaveUpdataPasswordPage extends Component {
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props)
        this.state = {
            codeTitle: i18n.t('register.sendText'),
            isModalVisible: false,
        }
    }
    back() {
        this.props.navigation.pop();
    }
    /**
     * [goLogin 去登陆]
     * @Author   袁进
     * @DateTime 2019-02-15T15:42:54+0800
     * @return   {[type]}                 [description]
     */
    goLogin() {
        this.props.navigation.navigate("TabLoginNavPage")
    }

    onBlur = ()=> {
        Keyboard.dismiss();
    }

    render() {
        return (
                <TouchableOpacity style={styles.container} onPress={this.onBlur} activeOpacity={1}>
                    <StatusBar
                        translucent={true}
                        animated={true}
                    />
                    <View style={styles.sBar} backgroundColor={'#24a090'}/>
                    <NavBar
                        title="忘记密码"
                        leftIcon="ios-arrow-back"
                        leftPress={this.back.bind(this)}
                    />
                    <View style={styles.topView}>
                        <View style={styles.itemContainer}>
                            <View style={styles.textLabel}>
                                <Image source={require("../../img/icon/reg-phone-ic.png")} style={styles.phone}  />
                                <Text>新密码</Text>
                            </View>
                            <TextInput underlineColorAndroid='transparent'  style={styles.inputText} placeholder="请设置您的密码" onChangeText={this.firstPasswordOnChange.bind(this)}/>
                        </View>
                        <View style={styles.itemContainer}>
                            <View style={styles.textLabel}>
                                <Image source={require("../../img/icon/reg-phone-ic.png")} style={styles.phone}  />
                                <Text>验证密码</Text>
                            </View>
                            <TextInput underlineColorAndroid='transparent'  style={styles.inputText} placeholder="请再次输入您的密码" onChangeText={this.secondPasswordOnChange.bind(this)}/>
                        </View>
                    </View>
                    <TouchableOpacity onPress={this.nextEvent.bind(this, { 'type': 'confirm' })}>
                        <View style={styles.cofirmView}>
                            <Text style={{ color: 'white', fontSize: 15 }}>更改密码</Text>
                        </View>
                    </TouchableOpacity>
                    <Modal isVisible={this.state.isModalVisible}>
                        <View style={{ flex: 1,flexDirection: 'column',justifyContent: 'center',alignItems: 'center' }}>
                            <View style={{width: 270,height: 130,backgroundColor: '#fff', flexDirection: 'column',justifyContent: 'center',alignItems: 'center',borderRadius: 10}}>
                            <Text style={{color: '#000',fontSize: 16}}>设置密码成功!</Text>
                            <TouchableOpacity onPress={this.goLogin.bind(this)} style={styles.goLogin}>
                                <Text style={{color: '#fff'}}>去登陆</Text>
                            </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
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
            LoginService.sendResetPasswordCode({ mobile: this.email })
                .then((_responseJSON) => {
                    console.log("请求成功", _responseJSON);
                    if (_responseJSON.status == 1) {
                        this.refs.toast.show(i18n.t('success'));

                        this.uid = _responseJSON.uid;
                    } else {
                        this.setState({
                            codeTitle: i18n.t('register.resendText')
                        })
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
                    this.refs.toast.show(i18n.t('networkError'));
                    // console.log('请求失败', err);
                });
        } else {
            this.refs.toast.show(i18n.t('login.accountOrPasswordWrongText'));
        }
    }
    nextEvent() {

        Keyboard.dismiss();
        if (this.uid && this.code && this.email && this.firstPassword == this.secondPassword) {

            const _uid = this.uidthis.props.navigation.state.params.uid;
            const _code = this.props.navigation.state.params.code;
            const _email = this.props.navigation.state.params.phone;
            const _password = this.firstPassword;
            LoginService.resetCheckCode({ code: _code, uid: _uid })
                .then((_responseJSON) => {
                    if (_responseJSON.status == 1) {
                        return LoginService.resetPassword({ mobile: _email, password: _password, repassword: _password })
                    }
                })
                .then((_responseRegister) => {
                    console.log(_responseRegister);
                    if (_responseRegister.status == 1) {
                        this.refs.toast.show(i18n.t('success'));
                        setTimeout(() => {
                            this.props.navigation.goBack();
                        }, 1000);

                    } else {
                        this.refs.toast.show(_responseRegister.msg);
                    }
                })
                .catch((err) => {
                    this.refs.toast.show(i18n.t('networkError'));
                    console.log('请求失败', err);
                });
        } else {
            // 提示用户输入
            this.refs.toast.show(i18n.t('login.accountOrPasswordWrongText'));
        }
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
    sBar: {
        height: statusBarHeight,
    },
    container: {
        backgroundColor: '#fff'
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
    cofirmView: {
        marginLeft: 20,
        marginRight: 20,
        marginTop: 50,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#24A090',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
})
