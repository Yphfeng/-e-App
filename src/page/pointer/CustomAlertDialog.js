import React, {Component} from 'react';
import {Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {statusBarHeight, height, width, } from '../../utils/uiHeader';

export default class CustomAlertDialog extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isVisible: this.props.show,
		};
		this.entityList = this.props.entityList;
	}

	componentWillReceiveProps(nextProps)
	{
		this.setState({isVisible: nextProps.show});
	}

	closeModal()
	{
		this.setState({
			isVisible: false,
		});
		this.props.closeModal(false);
	}

	renderItem(item, i) {
		return (
			<TouchableOpacity key={i} onPress={this.choose.bind(this, i)} style={styles.item}>
				<Text style={styles.itemText}>{item}</Text>
			</TouchableOpacity>
		);
	}

	choose(i) {
		if (this.state.isVisible) {
			this.props.callback(i);
			this.closeModal();
		}
	}

	renderDialog() {
		return (
			<View style={styles.modalStyle}>
				<View style={{justifyContent: 'center', alignItems: 'center', paddingVertical: 5, }}>
					<Text style={{color: '#24a090', fontSize: 16, }}>请选择需要调整的指针</Text>
				</View>
				<View style={styles.optArea}>
					{
						this.entityList.map((item, i) => this.renderItem(item, i))
					}
				</View>
			</View>
		)
	}

	render() {
		return (
			<View style={{flex: 1}}>
				<Modal
					transparent={true}
					visible={this.state.isVisible}
					animationType={'fade'}
					onRequestClose={() => this.closeModal()}>
					<TouchableOpacity style={styles.container} activeOpacity={1}
						onPress={() => this.closeModal()}>
						{this.renderDialog()}
					</TouchableOpacity>
				</Modal>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalStyle: {
		position: "absolute",
		left: 0,
		bottom: 0,
		width: width,
		flex: 1,
		flexDirection: "column",
		backgroundColor: '#ffffff',
	},
	optArea: {
		flex: 1,
		flexDirection: 'column',
		marginTop: 12,
		marginBottom: 12,
	},
	item: {
		width: width,
		height: 40,
		paddingLeft: 20,
		paddingRight: 20,
		alignItems: 'center',
	},
	itemText: {
		fontSize: 16,
	},
	cancel: {
		width: width,
		height: 30,
		marginTop: 12,
		alignItems: 'center',
		backgroundColor: '#ffffff'
	},
});
