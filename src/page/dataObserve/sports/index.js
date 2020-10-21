import React, {Component} from 'react';
import {
    Image,
    StyleSheet,
    BackHandler,
    ToastAndroid,
    WebView,
    View,
    ActivityIndicator,
    StatusBar,
    TouchableOpacity,
    Text,
    Dimensions
} from 'react-native';
import NavBar from '../../../common/NavBar'
import CookieManager from 'react-native-cookies';
import {createBottomTabNavigator, createMaterialTopTabNavigator, TabNavigator} from 'react-navigation';

import DayPage from './day';
import MonthPage from './month';
import WeekPage from './week';



const useWebKit = true;
const currentHeight = StatusBar.currentHeight;
const {width} = Dimensions.get('window');


const TabLoginNav = TabNavigator(
    {
        DayPage: {
            screen: DayPage,
        },
        WeekPage: {
            screen: WeekPage
        },
        MonthPage: {
            screen: MonthPage,
        },
    },

    {
        tabBarOptions: {
            //当前选中的tab bar的文本颜色和图标颜色
            activeTintColor: '#fff',
            //当前未选中的tab bar的文本颜色和图标颜色
            inactiveTintColor: '#ccc',
            //是否显示tab bar的图标，默认是false
            showIcon: true,
            //showLabel - 是否显示tab bar的文本，默认是true
            showLabel: true,
            //是否将文本转换为大小，默认是true
            upperCaseLabel: false,
            //material design中的波纹颜色(仅支持Android >= 5.0)
            pressColor: '#788493',
            //按下tab bar时的不透明度(仅支持iOS和Android < 5.0).
            pressOpacity: 0.8,
            //tab bar的样式
            style: {
                backgroundColor: '#24A090',
                paddingBottom: 1,
                borderTopWidth: 0,
                paddingTop: 1,
                borderBottomColor: '#000',
            },
            //tab bar的文本样式
            labelStyle: {
                fontSize: 18,
                margin: 1
            },
            tabStyle: {
                height: 65
            },
            //tab 页指示符的样式 (tab页下面的一条线).
            indicatorStyle: {height: 0},
        },
        //tab bar的位置, 可选值： 'top' or 'bottom'
        tabBarPosition: 'top',
        //是否允许滑动切换tab页
        swipeEnabled: false,
        //是否在切换tab页时使用动画
        animationEnabled: false,
        //是否懒加载
        lazy: true,
        //返回按钮是否会导致tab切换到初始tab页？ 如果是，则设置为initialRoute，否则为none。 缺省为initialRoute。
        backBehavior: 'none',
        initialRouteName: 'DayPage',
    });


export default class SportsPage extends Component {
    static navigationOptions = {
        tabBarLabel: '步行',
        header: null,
        tabBarIcon: ({focused}) => {
            if (focused) {
                return (
                    <Image style={styles.tabBarIcon} source={require('../../../img/buxingSelected.png')}/>
                );
            }
            return (
                <Image style={styles.tabBarIcon} source={require('../../../img/buxing.png')}/>
            );
        },
    };

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }

    back() {
        this.props.navigation.pop();
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <View style={styles.sBar} backgroundColor={'#1E82D2'}/>
                <NavBar
                    title="数据监测1"
                    leftIcon="ios-arrow-back"
                    leftPress={this.back.bind(this)}
                    titleStyle={{paddingLeft: 40}}
                />
                <TabLoginNav />

            </View>
        );
    }


}
const styles = StyleSheet.create({
    container: {
        marginTop: currentHeight
    },
    sBar: {
        height: StatusBar.currentHeight,
        width: width
    },
    flash: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    tabBarIcon: {
        width: 12,
        height: 20,
    }
});
