import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    ImageBackground,
    Text,
    TextInput,
    Dimensions,
    Keyboard
} from 'react-native';
import Toast, { DURATION } from 'react-native-easy-toast'
import i18n from '../../utils/i18n';
import LoginService from '../../utils/network/loginService';

let _window = Dimensions.get('window');
let _screen = Dimensions.get("screen");

export default class RegisterPage extends Component {

    constructor(props) {
        super(props)
        this.state = {
            codeTitle: i18n.t('register.sendText')
        }
    }

    onBlur = ()=> {
        Keyboard.dismiss();
    }
    render() {
        return (
            <ImageBackground source={require('../../img/signbg.png')}
                style={[{ width: _window.width, height: _window.height }, styles.bg]}>
                <TouchableOpacity style={styles.container} onPress={this.onBlur} activeOpacity={1}>
                <Text style={{marginTop: 60, fontSize: 22, color: 'rgb(82, 180, 255)', marginLeft: 20, marginRight: 20, textAlign: 'center'}}>{i18n.t('resetPassword.headerTitle')}</Text>
                    <View style={[styles.itemContainer, { marginTop: 20 }]}>
                        <TextInput style={styles.inputText} underlineColorAndroid="transparent" placeholder={i18n.t('register.enterEmailText')} onChangeText={this.onChangeEmailText.bind(this)} />
                    </View>
                    <View style={[styles.itemContainer, { marginTop: 10 }]}>
                        <TextInput style={styles.inputText} underlineColorAndroid="transparent" placeholder={i18n.t('register.tapCodeText')} onChangeText={this.onChangeCodeText.bind(this)} />
                        <TouchableOpacity style={styles.checkBTN} onPress={this.sendCodeEvent.bind(this)}>
                            <Text style={{ color: 'white' }}>{this.state.codeTitle}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.checkNoteText, { marginTop: 5 }]}>
                        <Text numberOfLines={3}>{i18n.t('register.codeTopicText')}</Text>
                    </View>
                    <View style={[styles.itemContainer, { marginTop: 5 }]}>
                        <TextInput style={styles.inputText} underlineColorAndroid="transparent" placeholder={i18n.t('register.newPasswordText')} onChangeText={this.firstPasswordOnChange.bind(this)}/>
                    </View>
                    <View style={[styles.itemContainer, { marginTop: 10 }]}>
                        <TextInput style={styles.inputText} underlineColorAndroid="transparent" placeholder={i18n.t('register.retapPasswordText')} onChangeText={this.secondPasswordOnChange.bind(this)}/>
                    </View>
                    <View style={[styles.passwordNoteText, { marginTop: 5 }]}>
                        <Text>{i18n.t('register.passwordLengthTopicText')}</Text>
                    </View>
                    <TouchableOpacity onPress={this.nextEvent.bind(this, { 'type': 'confirm' })}>
                        <View style={styles.cofirmView}>
                            <Text style={{ color: 'white', fontSize: 15 }}>{i18n.t('confirm')}</Text>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
                <Toast ref="toast"/>
            </ImageBackground>
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
            const _loginService = new LoginService();
            _loginService.sendResetPasswordCode({ email: this.email })
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

            const _uid = this.uid;
            const _code = this.code;
            const _email = this.email;
            const _password = this.firstPassword;
            const _loginService = new LoginService();
            _loginService.resetCheckCode({ code: _code, uid: _uid })
                .then((_responseJSON) => {
                    // console.log(_responseJSON,'1231312323')
                    if (_responseJSON.status == 1) {
                        return _loginService.resetPassword({ email: _email, password: _password })
                    }
                })
                .then((_responseRegister) => {
                    // console.log(_responseRegister);
                    if (_responseRegister.status == 1) {
                        this.refs.toast.show(i18n.t('success'));
                        setTimeout(() => {
                            this.props.navigation.goBack();
                        }, 1000);

                    } else {
                        this.refs.toast.show(i18n.t('failed'));
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
    contains: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        borderStyle: 'solid',
        marginLeft: 20,
        marginRight: 20,
        height: 44,
    },
    inputText: {
        flex: 1,
        paddingVertical: 0
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
        backgroundColor: 'rgb(82, 180, 255)',
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
        backgroundColor: 'rgb(82, 180, 255)',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
})
