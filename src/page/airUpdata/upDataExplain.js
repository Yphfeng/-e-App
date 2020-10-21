import React, {Component, } from 'react';
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
	Dimensions,
} from 'react-native';
import NavBar from '../../common/NavBar'
import { connect,  } from 'react-redux'
import * as dataService from '../../utils/network/dataService';

import {statusBarHeight, height, width, } from '../../utils/uiHeader';
const currentHeight = StatusBar.currentHeight;
const contentHeight = height - NavBar.topbarHeight - statusBarHeight

class UpDataExplain extends Component
{
	static navigationOptions =
	{
		header: null,
	};
	constructor(props)
	{
		super(props);
		this.state = {
			explainList: "",
		}
	}

	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}

	componentWillUnmount()
	{
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
	}

	componentDidMount()
	{
		console.log("获取今天数据");
		this.setState({
			explainList: this.props.navigation.state.params.destribtion,
		})

	}

	back()
	{
		this.props.navigation.pop();
	}

	render()
	{
		let viewContent = null, viewList= null;
		viewContent = (<View style={{width: width, }}>
			<View style={[styles.listView, styles.listFirst, ]}>
				<View style={styles.icon}>
					<Image source={require('../../img/course_img.png')} roundAsCircle={true} style={styles.img} />
				</View>
				<View>
					<Text style={styles.titleText}>固件版本号</Text>
					<Text style={styles.titleSubText}>{this.props.navigation.state.params.note}</Text>
				</View>
			</View>
		</View>)
		viewList = (<View style={[styles.listView,styles.listItem]}>
						<View style={styles.textWrap}><Text>{this.state.explainList}</Text></View>
					</View>)

        return (
            <View style={{flex: 1,backgroundColor: '#fff'}}>
                <View style={styles.sBar} backgroundColor={'#24a090'}/>
                <NavBar
                    title="升级说明"
                    leftIcon="ios-arrow-back"
                    leftPress={this.back.bind(this)}
                    titleStyle={{paddingLeft: 20}}
                />
                <View style={styles.topView}>
                    {viewContent}
                </View>
                <View style={styles.content}>
                    {viewList}
                </View>
            </View>
        );
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

    }
}

export default connect(mapStateToProps,mapDispatchToProps)(UpDataExplain)


const styles = StyleSheet.create({
    container: {
        marginTop: currentHeight
    },
    sBar: {
        height: statusBarHeight,
        width: width
    },
    white: {
        color: '#fff'
    },
    flash: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    tabBarIcon: {
        width: 19,
        height: 19,
    },
    topView: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',

    },
    img: {
        width: 50,
        height: 50,
    },
    icon: {
        paddingRight: 10
    },
    titleText: {
        fontSize: 16,
        color: '#333',
    },
    titleSubText: {
        fontSize: 12,
        color: '#888',
    },
    listView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: '#fff',
    },
    listFirst: {
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
    content: {
        paddingTop: 20
    },
    listItem: {
        paddingTop: 0,
        alignItems: 'flex-start',
    },
    textWrap: {
        flex: 1,
        flexWrap:'wrap',
    }
});
