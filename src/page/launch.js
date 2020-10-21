import React from 'react';
import {StyleSheet, View, ActivityIndicator, } from 'react-native';
import {connect, } from 'react-redux';
import * as loginActions from '../actions/loginActions';

const styles = StyleSheet.create({
	continer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
});

class Launch extends React.Component
{
	state = {}

	componentDidMount()
	{
		this.didFocusSubscription = this.props.navigation.addListener(
			'didFocus',
			payload =>
			{
				this.props.firstLoading(this.onCallback);
			},
		);
	}

	onCallback = res => {
		console.log(res, '返回的数据');
		if (res.status === 1)
		{
			this.props.navigation.navigate('Main')
		} else {
			this.props.navigation.navigate('LoginVXPage')
		}
	}

	componentWillUnmount()
	{
		this.timeout && clearTimeout(this.timeout);
	}
	render()
	{
		return (
			<View style={{flex: 1, justifyContent: 'center', alignItems: 'center',}}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
		)
	}
}

const mapDispatchToProps = dispatch => ({
	firstLoading: callback => dispatch(loginActions.firstLoading(callback)),
});

export default connect(
	null,
	mapDispatchToProps,
)(Launch);
