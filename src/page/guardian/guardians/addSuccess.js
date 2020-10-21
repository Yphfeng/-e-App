
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
import NavBar from '../../../common/NavBar'
import Toast, { DURATION } from 'react-native-easy-toast'
import { connect, } from 'react-redux'
import * as communityActions from '../../../actions/communityActions';
import {statusBarHeight, height, width, } from '../../../utils/uiHeader';

const contentHeight = height - NavBar.topbarHeight - statusBarHeight
const currentHeight = statusBarHeight;

class AddSuccess extends Component
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

	onChangeName = (value) => {
		this.setState({
			name: value,
		})
	}

	onChangePhone = (value) => {
		console.log(value, "!2323")

		this.setState({
			mobile: value,
		})
	}

	send = () => {
		this.props.navigation.navigate("GuardianList");
	}

	render() {

		let NavBarContent = null;
		let statusBar = null;

		NavBarContent = (<NavBar
			title="监护人申请"
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
			<ScrollView style={{flex: 1,backgroundColor: "#fff"}}>
				{statusBar}
				<View style={styles.statusBarHeight} backgroundColor={'#24A090'}/>
				{NavBarContent}
				<View style={styles.content}>
					<View
						style={styles.item}
					>
                    	<Image source={require("../../../img/success.png")} resizeMode="cover" style={styles.img} />
						<Text style={{paddingVertical: 20, }}>提交成功</Text>
						<Text style={{fontSize: 12, color: '#ccc'}}>等待被监护人接受申请</Text>
					</View>
					<TouchableOpacity style={styles.send} onPress={this.send}>
						<Text style={styles.fontWhite}>完成</Text>
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

export default connect(mapStateToProps, mapDispatchToProps)(AddSuccess)


const styles = StyleSheet.create({
	content: {
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: "flex-start",
		marginHorizontal: 20,
	},
	statusBarHeight: {
		height: statusBarHeight,
		width: width,
	},
	title: {
		paddingVertical: 20,
	},
	item: {
		height: contentHeight - 100,
		width: width - 40,
		marginBottom: 20,
		borderRadius: 10,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	subContent: {
		paddingLeft: 20,
	},
	fontWhite: {
		color: '#fff',
	},
	img: {
		width: 80,
		height: 80,
	},
	send: {
		width: width - 100,
		marginLeft: 30,
		backgroundColor: '#24A090',
		height: 35,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 20,
	},

});
