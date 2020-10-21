import React, {Component, } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
    StyleSheet,
} from 'react-native'
import PropTypes from 'prop-types';
import {width, height, statusBarHeight} from '../utils/uiHeader';
import NavBar from './NavBar';
import {connect} from 'react-redux'
import QBStorage from '../utils/storage/storage';
import * as webSocketActions from '../actions/webSocketActions';
class CustomTabComponent extends Component
{

    constructor(props)
    {
        super(props)
        this.state = {
            guardian: this.props.guardian,
        }
    }
	goToPage = async i =>
	{
        console.log(i, 'assaaaaa')
        var guardian = this.state.guardian;
        console.log(guardian, '是否时监护人操作');
        if (i === 0)
        {
            this.props.navigation.navigate("MyCourse")
            if(guardian)
            {
                //发送指令健康管理
                this.props.sendMessage(4, guardian.underGuardian, guardian.guardian, "切换tab");
            }
        }
        else
        {

            this.props.navigation.navigate("IsBuyCourse")
            if (guardian)
            {
                //发送指令健康服务
                this.props.serviceMessage(5, guardian.underGuardian, guardian.guardian, "健康服务", "健康服务", 0);
            }
        }

    }

    back = () =>
    {
        this.props.navigation.pop();
    }

    componentWillReceiveProps(newProps)
    {
        this.setState({
            guardian: newProps.guardian,
        })
    }

    renderItem = (tab, i) => {
        console.log(this.props, 'asas')
        const { navigation, jumpTo, } = this.props;
        const focused = (i === navigation.state.index);

        const color = focused ? "#202020" : "#979797"; // 判断i是否是当前选中的tab，设置不同的颜色
        if (i === 0)
        {
            return (
                <View key={i} style={styles.tab}>
                <TouchableOpacity onPress={() => this.goToPage(i)} style={styles.tab} key={i}>
                    <View style={styles.tabItem}>
                        <Text style={{color: color}}>
                                我的疗程
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={[styles.dot, {backgroundColor: focused ? '#5bb9ab' : '#f9f9f9', }]}><Text></Text></View>
              </View>
               );
        }
        else
        {
            return (
                <View key={i} style={styles.tab}>
                  <TouchableOpacity onPress={() => this.goToPage(i)} style={styles.tab} key={i}>
                      <View style={styles.tabItem}>
                          <Text style={{color: color}}>
                                已购疗程
                          </Text>
                      </View>
                  </TouchableOpacity>
                      <View style={[styles.dot, {backgroundColor: focused ? '#5bb9ab' : '#f9f9f9', }]}><Text></Text></View>
              </View>
               );
        }

      }


	// 渲染
	render()
	{
        console.log(this.props, 'asds')
        const routes = this.props.navigation.state.routes;
		return (
            <View>
                <View style={styles.sBar}></View>
                <NavBar
                title="健康管理"
                leftIcon="ios-arrow-back"
                leftPress={this.back.bind(this)}
                />
                <View style={styles.tabs} >
                    {routes.map(this.renderItem)}
                </View>
            </View>

        );
	}
}
const styles = StyleSheet.create({
    sBar: {
        height: statusBarHeight,
        backgroundColor: '#24a090',
    },
    tabs: {
        flexDirection: 'row',
        height: 44,
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
	tab: {
        height: 44,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabItem: {

    },
    dot: {
		justifyContent: 'center',
		alignItems: 'center',
		width: 30,
		height: 2,
	},
})

function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {
		user: state.loginIn.user ? state.loginIn.user : null,
        socketMsg: state.webSocketReducer.socketMsg,
        guardian: state.webSocketReducer.guardian,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		sendMessage: (a, b, c, d, e, f, g) => dispatch(webSocketActions.sendMessage(a, b, c, d, e, f, g)),
		serviceMessage: (a, b, c, d, e, f, g) => dispatch(webSocketActions.serviceSend(a, b, c, d, e, f, g)),
		deviceSend: (a, b, c, d, e, f, g, h) => dispatch(webSocketActions.deviceSend(a, b, c, d, e, f, g, h)),
		bletoolSend: (a, b, c, d, e, f, g, h) => dispatch(webSocketActions.bletoolSend(a, b, c, d, e, f, g, h)),
		remoteLoading: (status, text) => dispatch(webSocketActions.remoteLoading(status, text)),
		multipleSend: (a, b, c, d, e, f, g) => dispatch(webSocketActions.multipleSend(a, b, c, d, e, f, g)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomTabComponent)
