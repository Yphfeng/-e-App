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
    TouchableOpacity
} from 'react-native'
import NavBar from '../../common/NavBar'
import Item from '../../common/Item'


import {statusBarHeight, height, width, } from '../../utils/uiHeader';

//FontAwesome
export default class BleSearchPage extends Component {
    static navigationOptions = {
        header: null
    }
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            avatarSource: null,
        };
    }
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
    componentDidMount() {

    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }

    onBackAndroid = () => {
        this.props.navigation.goBack();
        return true;
    };

    back() {
        this.props.navigation.pop();
    }
    events(res) {
        console.log(res);
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
                <View style={styles.sBar} backgroundColor={'#24a090'}/>
                <NavBar
                    title="设备应用"
                    leftIcon="ios-arrow-back"
                    leftPress={this.back.bind(this)}
                />
                <ScrollView>
                    <View style={styles.list}>
                        <Text>激光手动开启</Text>
                        <TouchableOpacity style={styles.operate}>
                            <Text style={{ color: '#fff'}}>开启</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.list}>
                        <Text>单次检查心率</Text>
                        <View style={styles.hr}>
                            <Text style={{paddingRight: 10}}>0次/分钟</Text>
                            <TouchableOpacity style={styles.operate}>
                                <Text style={{ color: '#fff'}}>开启</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.list}>
                        <Text>自动检查心率</Text>
                        <TouchableOpacity style={styles.operate}>
                            <Text style={{ color: '#fff'}}>开启</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
    list: {
        flexDirection: 'row',
        paddingLeft: 10,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    operate: {
        backgroundColor: '#24a090',
        borderRadius: 5,
        paddingLeft:15,
        paddingRight: 15,
        paddingTop: 6,
        paddingBottom: 6
    },
    hr:{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    }
});
