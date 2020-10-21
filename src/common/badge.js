import React from "react";
import {
	connect,
} from "react-redux";
import {
	Image,
	StyleSheet,
} from "react-native";
var Immutable = require("../utils/seamless-immutable").static;

class NotiTabBarIcon  extends React.Component{
	constructor(props) {
		super(props);
	}

	shouldComponentUpdate(newProps, newState)
	{
		return Immutable(newProps) !== Immutable(this.props)
	}

	render()
	{
		var {userMsg, isFocus, } = this.props
		if (isFocus)
		{
			if (userMsg > 0)
			{
				return <Image source={require('../img/home_tab_news.png')} style={styles.icon} />
			}
			else
			{
				return <Image source={require('../img/home_tab_news_no.png')} style={styles.icon} />
			}
		}
		else
		{
			if (userMsg > 0)
			{
				return <Image source={require('../img/home_tab_news_a.png')} style={styles.icon} />
			}
			else
			{
				return <Image source={require('../img/home_tab_news_a_no.png')} style={styles.icon} />
			}
		}
	}

}

const styles = StyleSheet.create({
	icon: {
		width: 20,
		height: 20,
	},
})

const mapStateToProps = state => ({
	userMsg: state.user.userMsg,
})

export default connect(mapStateToProps)(NotiTabBarIcon);
