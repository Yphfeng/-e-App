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
export default class Share extends Component
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
		var imgComponent = null;
		console.log(item, '心在思想啊213123')
		var url = item.imgUrl;

		switch (item.name)
		{
		case "微信好友":
			imgComponent = 	(<Image style={styles.avtar} source={require("../img/logo.png")} />)
			break;
		case "微信朋友圈":
			imgComponent = (<Image style={styles.avtar} source={require("../img/wx_row.jpg")} />)
			break;
		}

		return (
			<TouchableOpacity style={styles.item} key={i} onPress={this.choose.bind(this, item, this.entityList)}>
				<View style={[styles.itemC, {width: 80, }, ]}>
					{imgComponent}
					<Text style={{fontSize: 12, paddingTop: 10, }}>{item.name}</Text>
				</View>
			</TouchableOpacity>

		);
	}

	choose(i, s)
	{
		if (this.state.isVisible)
		{
			this.closeModal();
			setTimeout(() =>
			{
				this.props.callback(i, s);
			}, 500)

		}
	}



	renderDialog()
	{
		return (
			<ScrollView style={styles.modalStyle}>
				<View style={styles.modalTitle}><Text style={{fontSize: 16, }}>{this.state.title}</Text></View>
				<View style={styles.optArea}>
					{
						this.entityList ? this.entityList.map((item, i) => this.renderItem(item, i)) : null
					}
				</View>
				<TouchableOpacity onPress={() => this.closeModal()} style={styles.cancel}><Text>取消</Text></TouchableOpacity>
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
		borderBottomColor: "#ccc",
		borderBottomWidth: 1,
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
		flexDirection: 'row',
		marginTop: 15,
		marginBottom: 15,
	},
	item: {
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
		height: 60,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#ffffff',
		borderTopColor: "#ccc",
		borderTopWidth: 1,
	},
	avtar: {
		width: 35,
		height: 35,
		borderRadius: 35,
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
