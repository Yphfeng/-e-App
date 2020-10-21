import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    RefreshControl,
    StatusBar,
    PixelRatio,
    TouchableOpacity,
    ScrollView,
    Platform
} from 'react-native';
import px2dp from "../../../utils/px2dp";
import Item from "../../../common/Item";
import NavBar from "../../../common/NavBar";

import Icon from 'react-native-vector-icons/Ionicons'

import {statusBarHeight, height, width, } from '../../../utils/uiHeader';

//屏幕的宽度
var cols = 4;
var boxW = 80;
var vMargin = (width - cols*boxW)/(cols+1);
var hMargin = 15;
const currentHeight = Platform.OS === "ios" ? 20 : StatusBar.currentHeight;
const contentHeight = height - NavBar.topbarHeight;
export default class IntegralRulePage extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            avatarSource: null,
            score: 0,
			scoreList: [],
			detailList: [
				{text: "每日连接设备获取2积分", },
				{text: "完善用户积分可获得100积分", },
				{text: "商城每消费100元，赠送100积分", },
				{text: "商城每消费一笔，赠送50积分", },
			],
			outList: [
				{text: "获得的积分可在积分商城中使用，每10积分抵扣1元", },
				{text: "抵扣金额上限详见各商品详情", },
			]
        };
    }

    back() {
        this.props.navigation.pop();
    }
    componentDidMount() {
        this._onRefresh()
    }

    _onRefresh() {
        this.setState({isRefreshing: true});
        setTimeout(() => {
            this.setState({isRefreshing: false});
        }, 1500)
    }

    _renderListItem() {
        return this.config.map((item, i) => {
            if (i % 3 === 0) {
                item.first = true
            }
            return (<Item key={i} {...item}/>)
        })
    }
    render() {
		let detailList = null,outList = null;
		detailList = this.state.detailList.map((item, i) => {
			return (<View style={styles.item} key={i}><Text>{i+1}、{item.text}</Text></View>)
		})
		outList = this.state.outList.map((item, i) => {
			return (<View style={styles.item} key={i}><Text>{i+1}、{item.text}</Text></View>)
		})
        return (
            <View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
                <StatusBar
                    translucent={true}
                    animated={true}
                />
                <View style={styles.sBar} backgroundColor={'#24a090'}/>
                <NavBar
                    title="积分规则"
                    leftIcon="ios-arrow-back"
                    leftPress={this.back.bind(this)}
                />
                <View
                    style={styles.scrollView}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this._onRefresh.bind(this)}
                            tintColor="#fff"
                            colors={['#ddd', '#0398ff']}
                            progressBackgroundColor="#ffffff"
                        />
                    }>

                    <View style={{
                        height: height,
                        backgroundColor: "#fff",
                    }}>
                        <ScrollView style={{height: contentHeight - 350,paddingHorizontal: 15}}>
                            <View style={styles.content}>
                                <View style={styles.title}>
                                    <Image source={require("../../../img/ruleLeft.png")} resizeMode="contain" style={styles.imgTitle}/>
                                    <Text style={{paddingHorizontal: 10}}>获取积分</Text>
                                    <Image source={require("../../../img/ruleRight.png")} resizeMode="contain" style={styles.imgTitle}/>
								</View>
								<View>{detailList}</View>
								<View style={styles.title}>
                                    <Image source={require("../../../img/ruleLeft.png")} resizeMode="contain" style={styles.imgTitle}/>
                                    <Text style={{paddingHorizontal: 10}}>消费积分</Text>
                                    <Image source={require("../../../img/ruleRight.png")} resizeMode="contain" style={styles.imgTitle}/>
								</View>
								<View>{outList}</View>
                            </View>
                        </ScrollView>
                       {/*
                        <View style={{justifyContent: 'center',alignItems: 'center',height: 80}}>
                                                   <View style={styles.useScore}><Text style={[styles.text,{color: '#fff'}]}>在线咨询</Text></View>
                                               </View>
                                           */}
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    subTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        paddingBottom: 10

    },
    scrollView: {
        backgroundColor: "#1E82D2"
    },
    sBar: {
        height: statusBarHeight,
        width: width,
    },
    userHead: {
        flexDirection: "column",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#24a090",
        height: 100,

    },
    tabBarIcon: {
        width: 19,
        height: 19
    },
    quitContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    avatarContainer: {
        flexDirection:'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: px2dp(10)
    },
    avatar: {
        borderRadius: 75,
        width: 60,
        height: 60
    },
    imageStyle: {
        width: width,
        height: 40
    },
    icon: {
        width: 30,
        height: 30,
        marginBottom: 10,
    },
    tabBarIcon: {
        width: 19,
        height: 19,
    },
    text: {
        fontSize: 14,
    },
    useScore: {
        marginLeft: 20,
        marginRight: 20,
        height: 35,
        width: width - 50,
        backgroundColor: '#24a090',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
	},
	title: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		height: 60,

	},
	imgTitle: {
		width: 20,
		height: 20,
	},
	item: {
		flexDirection: 'row',
		paddingBottom: 5,
		justifyContent: "flex-start",
		alignItems: "flex-start",
		flexWrap: "wrap",
	}
});
