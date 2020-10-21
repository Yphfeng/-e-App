/**
 * @author lam
 * @data 2018/7/26 14:16
 */

import React, {
	Component,
} from 'react'
import {
	StyleSheet,
	View,
	Animated,
	TouchableOpacity,
	TouchableNativeFeedback,
	Platform,
	Text,
} from 'react-native'
import px2dp from '../utils/px2dp'
import Icon from 'react-native-vector-icons/Ionicons'

const PropTypes = require('prop-types');
export default class NavBar extends Component
{
	static propTypes = {
		title: PropTypes.string,
		leftIcon: PropTypes.string,
		rightIcon: PropTypes.string,
		leftPress: PropTypes.func,
		rightPress: PropTypes.func,
		rightText: PropTypes.string,
		style: PropTypes.object,
	}
	static topbarHeight = (Platform.OS === 'ios' ? 64 : 42)

	renderBtn(pos)
	{
		let render = (obj) => {
			const {name, onPress, iconColor, } = obj;
			if (Platform.OS === 'android') {
				return (
					<TouchableOpacity onPress={onPress} style={styles.btn}>
						<Icon name={name} size={px2dp(26)} color={iconColor}/>
					</TouchableOpacity>
				)
			} else {
				return (
					<TouchableOpacity onPress={onPress} style={styles.btn}>
						<Icon name={name} size={px2dp(26)} color={iconColor}/>
					</TouchableOpacity>
				)
			}
		}
		if (pos == "left") {
			if (this.props.leftIcon)
			{
				return render({
					name: this.props.leftIcon,
					onPress: this.props.leftPress,
					iconColor: this.props.leftIconColor ? this.props.leftIconColor : '#fff',
				})
			} else {
				return (<View style={styles.btn}></View>)
			}
		} else if (pos == "right") {
			if (this.props.rightIcon) {
				return render({
					name: this.props.rightIcon,
					onPress: this.props.rightPress,
				})
			} else {
				return (<View style={styles.btn}><TouchableOpacity style={styles.rightBtn} onPress={this.props.rightPress}><Text style={{color: '#fff', }}>{this.props.rightText}</Text></TouchableOpacity></View>)
			}
		}
	}

	render() {
		return (
			<View style={[styles.topbar, this.props.style,]}>
				{this.renderBtn("left")}
				<Animated.Text numberOfLines={1}
					style={[styles.title, this.props.titleStyle,]}>{this.props.title}</Animated.Text>
				{this.renderBtn("right")}
			</View>

		)
	}
}

const styles = StyleSheet.create({
	topbar: {
		height: NavBar.topbarHeight,
		backgroundColor: "#24a090",
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingTop: (Platform.OS === 'ios') ? 20 : 0,
		paddingHorizontal: 15,
	},
	btn: {
		height: 30,
		width: 60,
		justifyContent: 'center',
		alignItems: "flex-start",
	},
	rightBtn: {
		height: 30,
		width: 60,
		position: 'absolute',
		justifyContent: 'center',
		alignItems: "flex-end",
		right: 10,
		top: 0,
	},
	title: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: px2dp(16),
	}
});
