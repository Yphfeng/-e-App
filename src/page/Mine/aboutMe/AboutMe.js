/**
 * @author lam
 */
'use strict';

import React, {Component} from 'react'
import {
    Text,
    View,
    StyleSheet,
    StatusBar,
    BackHandler,
    TouchableOpacity,
    Image,
    Linking,
} from 'react-native'
import NavBar from '../../../common/NavBar'
import Toast, { DURATION } from 'react-native-easy-toast';
import * as userService from '../../../utils/network/userService';

import {statusBarHeight, height, width, bottomToolsBarHeight, } from '../../../utils/uiHeader';

const contentHeight = height - NavBar.topbarHeight - statusBarHeight - 80 - bottomToolsBarHeight
//FontAwesome
export default class AboutMePage extends Component {
    static navigationOptions = {
        header: null
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

    UNSAFE_componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }
    componentDidMount() {
        this.getUserInfo();
    }
    getUserInfo = () => {
        userService.getCompanyProfile()
            .then(res => {
                console.log(res,'获取的公司信息')
                if(res.status == 1) {
                    this.setState({
                        content_url: res.data.content_url,
                        mobile: res.data.moblie,
                        address: res.data.address,
                        name: res.data.name,
                        aboutImg: {uri: res.data.content_url}
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


    back() {
        this.props.navigation.pop();
    }
    _call() {
        var tel = this.state.mobile;
        if(!tel) {
            return;
        }
        return Linking.openURL('tel:' + tel);
    }
    render() {
        let content = null;
        if(this.state.content_url) {

            content = (<Image source={this.state.aboutImg} style={{width:width , height:contentHeight}} resizeMode={"cover"} />)
        }

        return (
            <View style={{flex: 1, backgroundColor: "#fff"}}>
                <StatusBar
                       backgroundColor={"#24A090"}
                       barStyle={this.props.barStyle || 'light-content'}
                       translucent={true}/>
                <View style={styles.sBar} backgroundColor={'#24a090'}/>
                <NavBar
                    title="关于我们"
                    leftIcon="ios-arrow-back"
                    leftPress={this.back.bind(this)}
                />
                <View style={{height: contentHeight}}>
                    {content}
                </View>
                <View style={styles.save}>
                    <TouchableOpacity style={styles.btn} onPress={this._call.bind(this)}>
                    <Text style={{fontSize: 14}}>客服热线</Text>
                    </TouchableOpacity>
                    {false&&<TouchableOpacity style={styles.btn} oPress={this._map}>
                    <Text style={{fontSize: 14}}>地图导航</Text>
                    </TouchableOpacity>}
                </View>
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
        width: width
    },
    save: {
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 80,
    },
    btn: {
        backgroundColor: '#fff',
        width: 120,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#979797'
    },
    text: {
        fontSize: 12
    }
})
