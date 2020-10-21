import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	Image,
	TouchableOpacity,
	ScrollView,
} from 'react-native';

export default class ShopCenterItem extends React.Component
{

    static defaultProps = {
		shopImage: '',
		shopSale: '',
		shopName: '',
		detailurl: '',
		smid: '',
		price: '',
		popTopShopCenter: null,
		index: 0,
	}


    render()
    {
		var {index} = this.props;
		var imgCom = null;
		if (index == 0)
		{
			imgCom = <Image source={require("../img/shop_1.jpg")} style={styles.imageStyle}/>
		}
		else if (index == 1)
		{
			imgCom = <Image source={require("../img/shop_2.jpg")} style={styles.imageStyle}/>
		}
		else
		{
			imgCom = <Image source={require("../img/shop_3.png")} style={styles.imageStyle}/>
		}
    	return (
			<TouchableOpacity
				onPress={()=>this.clickItem(this.props.detailurl)}
			>
			<View style={styles.itemViewStyle}>
				{imgCom}
				<Text style={styles.shopSaleStyle}>【{this.props.smid}款】{this.props.shopName}</Text>
				<Text style={styles.shopNameStyle}>¥{this.props.price}</Text>
			</View>
		</TouchableOpacity>
		);
    }

	clickItem(detailurl)
	{
		// 判断
		if (this.props.detailurl == null) return;

		// 执行回调函数 再次接受传递的id
		this.props.popTopShopCenter(detailurl);
	}

}

const styles = StyleSheet.create({
	container: {
	   marginTop: 15,
	},
	welcome: {
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
	},

	imageStyle:
	{
		width: 120,
		height: 100,
		borderRadius: 8,
	},

	scrollViewStyle:{
		flexDirection:'row',
		backgroundColor:'white',
		padding:10
	},

	itemViewStyle:{
		margin:8,
		justifyContent: 'center',
		alignItems: 'center',
	},

	shopSaleStyle:{
		// 绝对定位
		padding:2
	},

	shopNameStyle:{
		textAlign:'center',
		marginTop:5,
		color: 'red',
	}
});
