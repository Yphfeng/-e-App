
/**
 * @author lam
 */
'use strict';

import React, {Component,} from 'react'
import {
	Text,
	View,
	ScrollView,
	StyleSheet,
	StatusBar,
	Dimensions, BackHandler,
	TouchableOpacity,
	Button,
	Image,
	Slider,
	Platform,
	TextInput,
	DeviceEventEmitter,
	KeyboardAvoidingView,
	Keyboard,
	Alert,
} from 'react-native'
import NavBar from '../../common/NavBar'
import Toast, { DURATION } from 'react-native-easy-toast'
import { connect, } from 'react-redux'
import * as communityActions from '../../actions/communityActions';
import {statusBarHeight, height, width, } from '../../utils/uiHeader';
import Sound from 'react-native-sound';
import * as javaBase from '../../utils/network/javaService';
import * as userService from '../../utils/network/userService';

import QBStorage from '../../utils/storage/storage';
const contentHeight = height - NavBar.topbarHeight - statusBarHeight
const currentHeight = statusBarHeight;

class FeatureList extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {

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

	render() {

		let NavBarContent = null;
		let statusBar = null;

		NavBarContent = (<NavBar
			title="功能操作"
			leftIcon="ios-arrow-back"
			leftPress={this.back.bind(this)}
		/>)
		statusBar = (<StatusBar
			backgroundColor={"#24A090"}
			barStyle={this.props.barStyle || 'light-content'}
			translucent={true}
			style={styles.statusBarHeight}
		/>)

		return (
			<ScrollView style={{flex: 1,backgroundColor: "#FFF"}}>
				{statusBar}
				<View style={styles.statusBarHeight} backgroundColor={this.state.isFullScreen ? "#000" : '#24A090'}/>
				{NavBarContent}
				<View>
					<View><Text>连接蓝牙可用功能</Text></View>
				</View>

				<Toast ref="toast" />
			</ScrollView>
		)
	}
}

function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {

	}
}

function mapDispatchToProps(dispatch)
{
	return {
		pbTitle: (title) => dispatch(communityActions.pbTitle(title)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(FeatureList)


const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		backgroundColor: 'black',
		marginHorizontal: 10,
	},
	statusBarHeight: {
		height: statusBarHeight,
		width: width,
	},
	title: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		color: "#666"
	},
	subTitle: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingLeft: 10,
		paddingRight: 10,
		paddingBottom: 10,
		paddingTop: 20,
	},
	textStyle: {
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
		width: 60,
	},
	btn: {
		height: 20,
		width: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	inputText: {
		marginHorizontal: 20,
		fontSize: 16,
		marginBottom: 10,
		height: 50,
	},
	tips: {
		width: width - 30,
		marginLeft: 15,
	},
	hotTip: {
		width: 160,
		height: 39,
		borderRadius: 20,
		flexDirection: 'row',
		backgroundColor: '#ddd',
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 15,
		marginTop: 100,
	}
});
