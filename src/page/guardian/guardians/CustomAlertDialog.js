import React, {Component, } from 'react';
import {
	Dimensions,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ScrollView,
	Image,
} from 'react-native';
import Modals from "react-native-modal";
const {width, height, } = Dimensions.get('window');
export default class CustomAlertDialog extends Component
{

	constructor(props)
	{
		super(props);
		this.state = {
			isVisible: this.props.show,
			title: this.props.title,
		};
		this.entityList = this.props.entityList;
	}

	componentWillReceiveProps(nextProps)
	{
		console.log(nextProps, '新的坦克')
		this.setState({isVisible: nextProps.show, });
		this.entityList = nextProps.entityList;
	}

	closeModal()
	{
		this.setState({
			isVisible: false,
		});
		this.props.closeModal(false);
	}

	renderItem(item, i)
	{
		var signal = null;
		if (item.livel == 1)
		{
			signal = <Image style={styles.icon} source={require("../../../img/blueToolth_strong.png")} />
		}
		else if (item.livel == 2)
		{
			signal = <Image style={styles.icon} source={require("../../../img/blueToolth_middle.png")} />
		}
		else
		{
			signal = <Image style={styles.icon} source={require("../../../img/blueToolth_small.png")} />
		}
		return (
			<View style={styles.item} key={i}>
				<View style={[styles.itemC, {width: 80, }, ]}>
					<Image style={styles.avtar} source={require("../../../img/logo.png")} />
				</View>
				<View style={styles.content}>
					<View style={styles.contentText}>
						<Text style={{fontSize: 16, color: '#000',paddingRight: 5, }}>{item.device_name}</Text>
						{signal}
					</View>
					<Text style={{fontSize: 12, }}>{item.device_sn}</Text>
				</View>
				<View style={[styles.itemC, {width: 120, }, ]}>
					<TouchableOpacity key={i} onPress={this.choose.bind(this, item, this.entityList)} style={styles.btn}>
						<Text style={[styles.itemText, {color: '#fff'}, ]}>连接</Text>
					</TouchableOpacity>
				</View>

			</View>

		);
	}

	choose(i, s)
	{
		if (this.state.isVisible)
		{
			this.props.callback(i, s);
			this.closeModal();
		}
	}



	renderDialog()
	{
		console.log(this.entityList, '弹框')

		return (
			<ScrollView style={styles.modalStyle}>
				<View style={styles.modalTitle}><Text style={{fontSize: 16, }}>{this.state.title}</Text></View>
				<View style={styles.optArea}>
					{
						this.entityList ? this.entityList.map((item, i) => this.renderItem(item, i)) : null
					}
				</View>
			</ScrollView>
		)
	}

	render()
	{
		return (
			<View style={{flex: 1, }}>
				<View style={styles.container} >
				</View>
				<Modals
					style={{margin: 0, }}
					transparent={true}
					isVisible={this.state.isVisible}
					animationType={'fade'}
					onBackdropPress={() => this.closeModal()}
					onRequestClose={() => this.closeModal()}>

					{this.renderDialog()}

				</Modals>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	modalStyle: {
		position: "absolute",
		left: 0,
		bottom: 0,
		width: width,
		maxHeight: height - 300,
		flex: 1,
		flexDirection: "column",
		backgroundColor: '#ffffff',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	modalTitle: {
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		flex: 1,
		justifyContent: 'space-around',
		alignItems: 'flex-start',
	},
	contentText: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	optArea: {
		flex: 1,
		flexDirection: 'column',
		marginTop: 12,
		marginBottom: 12,
	},
	item: {
		width: width,
		height: 80,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	itemC: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	itemText: {
		fontSize: 14,

	},
	cancel: {
		width: width,
		height: 30,
		marginTop: 12,
		alignItems: 'center',
		backgroundColor: '#ffffff',
	},
	avtar: {
		width: 50,
		height: 50,
	},
	icon: {
		width: 16,
		height: 16,
	},
	btn: {
		width: 80,
		height: 30,
		backgroundColor: "#24a090",
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
