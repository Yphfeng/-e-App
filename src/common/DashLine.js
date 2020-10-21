//定义虚线
import React, {Component, } from 'react'
import {
	Text,
	View,
	StyleSheet,
	Dimensions,
} from 'react-native';
const screenWidth = 70;

export default class DashLine extends Component{
	render(){
		var len = Math.ceil(screenWidth/8);
		var arr = [];
		for (let i=0; i<len; i++)
		{
			arr.push(i);
		}

		return <View style={styles.dashLine}>
			{
				arr.map((item, index)=> {
					return <View style={styles.dashItem} key={'dash'+index}><Text> </Text></View>
				})
			}
		</View>
	}
}
const styles = StyleSheet.create({
	dashLine: {
		flexDirection: 'column',
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	dashItem: {
		height: 3,
		width: 1,
		marginBottom: 2,
		flex: 1,
		backgroundColor: '#FFD692',
	},
})
