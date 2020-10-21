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
} from 'react-native'
import px2dp from '../utils/px2dp'
import Icon from 'react-native-vector-icons/Feather'

const PropTypes = require('prop-types');
export default class NavBar extends Component
{
	static propTypes = {
		title: PropTypes.string,
		leftIcon: PropTypes.string,
		rightIcon: PropTypes.string,
		leftPress: PropTypes.func,
		rightPress: PropTypes.func,
		style: PropTypes.object,
	}
	static topbarHeight = (Platform.OS === 'ios' ? 64 : 42)

	renderBtn(pos)
	{
		let render = (obj) => {
			const {name, onPress, color, } = obj;
			if (Platform.OS === 'android')
			{
				return (
					<TouchableOpacity onPress={onPress} style={styles.btn}>
						<Icon name={name} size={px2dp(24)} color={color}/>
					</TouchableOpacity>
				)
			}
			else
			{
				return (
					<TouchableOpacity onPress={onPress} style={styles.btn}>
						<Icon name={name} size={px2dp(24)} color={color} />
					</TouchableOpacity>
				)
			}
		}
		if (pos == "left")
		{
			if (this.props.leftIcon)
			{
				return render({
					name: this.props.leftIcon,
					onPress: this.props.leftPress,
					color: this.props.leftColor,
				})
			}
			else
			{
				return (<View style={styles.btn}></View>)
			}
		}
		else if (pos == "right")
		{
			if (this.props.rightIcon)
			{
				return render({
					name: this.props.rightIcon,
					onPress: this.props.rightPress,
					color: this.props.rightColor,
				})
			} else {
				return (<View style={styles.btn}></View>)
			}
		}
	}

	render() {
		return (
			<View style={[styles.topbar, this.props.style]}>
				{this.renderBtn("left")}
				<Animated.Text numberOfLines={1}
					style={[styles.title, this.props.titleStyle]}>{this.props.title}</Animated.Text>
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
	},
	btn: {
		width: 30,
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: px2dp(16),
	}
});
