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
    Image,
    PanResponder,
    Dimensions, BackHandler,
    TouchableOpacity,
    ScrollView
} from 'react-native'
import NavBar from '../../common/NavBar'
import Swiper from 'react-native-swiper';
import EZSwiper from 'react-native-ezswiper';
import PageScrollView from 'react-native-page-scrollview';
import * as HomeService from '../../utils/network/homeService';
import QBStorage from '../../utils/storage/storage';

import {statusBarHeight, height, width, } from '../../utils/uiHeader';

//FontAwesome
export default class UseGuide extends Component {
    static navigationOptions = {
        header: null
    }
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            index: 1,
        };
    }
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
    componentDidMount() {
        HomeService.getUserGuide()
        .then((res) => {
            if(res.status == 1) {
                this.setState({
                    list: res.lists
                })
            }else{
            }
        })
        .catch(err => {
            console.warn(err);
        })
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        QBStorage.save("guide", '');
    }

    onBackAndroid = () => {
        this.props.navigation.goBack();
        return true;
    };

    back() {
        QBStorage.save("guide", '');
        this.props.navigation.pop();
    }
    currentPageChangeFunc= (idx) =>{
        this.setState({
            index: idx
        })
    }
    //再试一次
    again = () => {
        var items = this.state.list;
        this.setState({
            list: []
        })
        setTimeout(()=>{
            this.setState({
                list: items
            })
        }, 100)
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
                <View style={styles.sBar} backgroundColor={'#24A090'}/>
                <NavBar
                    title="新手引导"
                    leftIcon="ios-arrow-back"
                    leftPress={this.back.bind(this)}
                />
                {this.state.list.length>0&&<PageScrollView
                    style={{width:width,height:height}}
                    HorV="v"
                    ifAutoScroll={false}
                    ifInfinite={false}
                    ifShowPointerView={false}
                    datas={this.state.list}
                    view={(i,data)=>{
                        return(
                            <View>
                                <Image resizeMode={"stretch"} style={styles.img} source={{uri: data.url}}></Image>
                            </View>
                        );
                    }}
                    currentPageChangeFunc={this.currentPageChangeFunc}
                />}
                {(this.state.index+1)<this.state.list.length&&<View style={styles.index}>
                    <Text style={styles.index_title}>{this.state.index+1}/{this.state.list.length}</Text>
                </View>}
                {(this.state.index+1)<this.state.list.length&&<View style={styles.sliding}>
                    <Image style={styles.sliding_img} source={require('../../img/sliding.gif')}></Image>
                </View>}
                {(this.state.index+1)==this.state.list.length&&<View style={styles.btn_view}>
                    <TouchableOpacity style={styles.btn} onPress={()=>{this.again()}}>
                        <Text styl={{color: '#8E8E8E'}}>再看一次</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn1} onPress={()=>{this.back()}}>
                        <Text style={{color: '#fff',}}>结束</Text>
                    </TouchableOpacity>
                </View>}
            </View>
        )
    }
}
const styles = StyleSheet.create({
    sBar: {
        height: statusBarHeight,
        width: width
    },
    all: {
        height:height,
        width:width,
        backgroundColor: 'red'
    },
    img: {
        width: width,
        height: height
    },
    index: {
        position: 'absolute',
        bottom: 50,
        right: 15,
        backgroundColor: '#000',
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        opacity:0.4,
    },
    index_title:{
        color: '#fff'
    },
    sliding: {
        position: 'absolute',
        bottom: 30,
        justifyContent: 'center',
        alignItems: 'center',
        right: 0,
        left: 0,
    },
    sliding_img: {
        width: 20,
        height: 20,
    },
    btn_view: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        left: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    btn: {
        width: width/3,
        height: width/10,
        marginLeft: 30,
        marginRight: 30,
        borderWidth: 1,
        borderColor: '#8E8E8E',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btn1: {
        width: width/3,
        height: width/10,
        marginLeft: 30,
        marginRight: 30,
        borderRadius: 30,
        backgroundColor: '#24a090',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
