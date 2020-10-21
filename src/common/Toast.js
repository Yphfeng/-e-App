/**
 * Created by lam on 2018/7/5.
 */

import React, {Component} from 'react';
import {
	StyleSheet,
	View,
	Text,
} from 'react-native';

import Toast, { DURATION, } from 'react-native-easy-toast'


export default class WeiyunToast extends Component
{
	render()
	{
		return (
			<Toast
				ref="toast"
				position={this.props.position}

			/>
		);
	}

	show = () => {

	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: 20
	},
	lineStyle: {
		width: ScreenWidth / 4,
		height: 2,
		backgroundColor: '#1E82D2',
	},
	textStyle: {
		flex: 1,
		fontSize: 20,
		marginTop: 20,
		textAlign: 'center',
	},
	underline: {
		height: 3,
		backgroundColor: '#1E82D2',
		alignItems: 'center',
	},
	border: {
		borderBottomWidth: 1,
		borderBottomColor: '#fcfcfc',
		backgroundColor: 'white',
		marginBottom: -0.5,
	},

});
