/**
 * @author lam
 * @date 2018/7/25 11:29
 */

import React, {Component} from 'react';
import {
    ScrollView,
    View,
    StatusBar,
    Dimensions,
    StyleSheet, BackHandler,
    DeviceEventEmitter
} from 'react-native';
import NavBar from "../../common/NavBar";
import Item from "../../common/Item";
import { fetchLoginOut,getImplement } from '../../actions/loginActions';
import { syncDisconnect } from '../../actions/device/bleActions';
import Toast, { DURATION } from 'react-native-easy-toast';
import { connect } from 'react-redux'
const {width} = Dimensions.get('window');

class SettingScreen extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props)
    }

    componentWillMount() {
        //BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }

    componentWillUnmount() {
        //BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }

    componentWillReceiveProps(newProps) {
        console.log(newProps.msg,this.props.msg,newProps)

    }

    back() {
        this.props.navigation.goBack();
    };



    render() {
        return (
            <View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
                <View style={styles.sBar} backgroundColor={'#1E82D2'}/>
                <NavBar
                    title="设置"
                    leftIcon="ios-arrow-back"
                    leftPress={this.back.bind(this)}
                />
                <View>
                    <Item name="更改密码" onPress={this.goProfile.bind(this)}/>
                    <Item.Button name="退出登录" first={true} onPress={this.logout.bind(this)}/>
                </View>
                <Toast ref="toast" />
            </View>
        );
    }

    goProfile() {
        this.props.navigation.navigate("UpdataPassword");
    }

    back() {
        this.props.navigation.goBack();
    }

    logout() {
        this.props.fetchLoginOut()
    }
}
function mapStateToProps(state) {
    console.log(state,'子组件的属性')
    return {
        msg: state.loginIn.msg,
        connectStatus: state.ble.connectStatus
    }
}

function mapDispatchToProps(dispatch) {
  return {
   fetchLoginOut: () => dispatch(fetchLoginOut()),
   getImplement: (s) => dispatch(getImplement(s)),
   syncDisconnect: () => dispatch(syncDisconnect())
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(SettingScreen)



const styles = StyleSheet.create({
    sBar: {
        height: StatusBar.currentHeight,
        width: width
    }
});
