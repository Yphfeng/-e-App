
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

import QBStorage from '../../utils/storage/storage';
const contentHeight = height - NavBar.topbarHeight - statusBarHeight
const currentHeight = statusBarHeight;

class GuardianChoose extends Component
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
			title=""
			leftIcon="ios-arrow-back"
			leftPress={this.back.bind(this)}
		/>)

		return (
			<ScrollView style={{flex: 1,backgroundColor: "#fff"}}>
				<View style={styles.statusBarHeight} backgroundColor={'#24A090'}/>
				{NavBarContent}
				<View style={styles.content}>
					<View style={styles.title}>
						<Text style={{fontSize: 20, paddingBottom: 20, }}>选择你的身份</Text>
						<Text style={{color: '#ccc', }}>选择认证身份，方便根据您的身份进行功能的开放</Text>
					</View>
					<TouchableOpacity
						style={[styles.item, {backgroundColor: '#ec8b50', }]}
						onPress={() => this.props.navigation.navigate("GuardianList")}
					>
						<View style={styles.subContent}>
							<Text style={styles.fontWhite}>监护人</Text>
							<Text style={[styles.fontWhite, {paddingTop: 5, }]}>GUARDIAN</Text>
						</View>
						<View style={styles.imgContent}><Image source={require("../../img/guradian.png")} resizeMode="cover" style={styles.img} /></View>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.item, {backgroundColor: '#7098f7', }]}
						onPress={() => this.props.navigation.navigate("ToGuardianList")}
					>
						<View style={styles.subContent}>
							<Text style={styles.fontWhite}>被监护人</Text>
							<Text style={[styles.fontWhite, {paddingTop: 5,  }]}>GUARDIANS</Text>
						</View>
						<View style={styles.imgContent}><Image source={require("../../img/isGuradian.png")} resizeMode="cover" style={styles.img} /></View>
					</TouchableOpacity>



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

export default connect(mapStateToProps, mapDispatchToProps)(GuardianChoose)


const styles = StyleSheet.create({
	content: {
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: "flex-start",
		marginHorizontal: 40,
	},
	statusBarHeight: {
		height: statusBarHeight,
		width: width,
	},
	title: {
		paddingVertical: 20,
	},
	item: {
		height: 100,
		width: width - 80,
		marginBottom: 40,
		borderRadius: 5,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	imgContent: {
		width: 50,
		height: 50,
		backgroundColor: '#fff',
		borderRadius: 100,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 20,
	},
	subContent: {
		paddingLeft: 20,
	},
	img: {
		width: 25,
		height: 25,
	},
	fontWhite: {
		color: '#fff',
	},

});
