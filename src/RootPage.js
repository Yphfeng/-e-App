import {TabNavigator } from 'react-navigation';
import { createBottomTabNavigator, createMaterialTopTabNavigator } from 'react-navigation-tabs';
import HomePage from './page/Home/Home';
import MinePage from './page/Mine/Mine';
import NotificationListPage from "./page/notification/NotificationList";
import DynamicList from "./page/dynamicdFile/dynamicList"

import LoginPage from './page/loginPage/loginPage';
import RegisterPage from './page/registerPage/registerPage';


import MyCourse from './page/courseManager/first';
import IsBuyCourse from './page/courseManager/second';

import CustomTabComponent from './common/CustomTabComponent';

//底部导航栏
export const TabNav = createBottomTabNavigator(
	{
		Home: {
			screen: HomePage,
			path: 'chat/:user',
		},
		DynamicList: {
			screen: DynamicList,
		},
		NotificationListPage: {
			screen: NotificationListPage,
		},
		Mine: {
			screen: MinePage,
		},
	},

	{
		tabBarOptions: {
			//当前选中的tab bar的文本颜色和图标颜色
			activeTintColor: '#4BC1D2',
			//当前未选中的tab bar的文本颜色和图标颜色
			inactiveTintColor: '#000',
			//是否显示tab bar的图标，默认是false
			showIcon: true,
			//showLabel - 是否显示tab bar的文本，默认是true
			showLabel: true,
			//是否将文本转换为大小，默认是true
			upperCaseLabel: false,
			//material design中的波纹颜色(仅支持Android >= 5.0)
			pressColor: '#788493',
			//按下tab bar时的不透明度(仅支持iOS和Android < 5.0).
			pressOpacity: 0.8,
			//tab bar的样式
			style: {
				backgroundColor: '#fff',
				paddingBottom: 1,
				borderTopWidth: 0.2,
				paddingTop: 1,
				borderTopColor: '#ccc',
			},
			//tab bar的文本样式
			labelStyle: {
				fontSize: 11,
				margin: 1,
			},
			tabStyle: {
				height: 45,
			},
			//tab 页指示符的样式 (tab页下面的一条线).
			indicatorStyle: {height: 0, },
		},

		//tab bar的位置, 可选值： 'top' or 'bottom'
		tabBarPosition: 'bottom',
		//是否允许滑动切换tab页
		swipeEnabled: false,
		//是否在切换tab页时使用动画
		animationEnabled: false,
		//是否懒加载
		lazy: true,
		//返回按钮是否会导致tab切换到初始tab页？ 如果是，则设置为initialRoute，否则为none。 缺省为initialRoute。
		backBehavior: 'none',
		initialRouteName: 'Home',
	});

//登录注册路由
export const TabLoginNav = createMaterialTopTabNavigator(
	{
		Login: {
			screen: LoginPage,
		},
		Register: {
			screen: RegisterPage,
		},
	},

	{
		tabBarOptions: {
			//当前选中的tab bar的文本颜色和图标颜色
			activeTintColor: '#fff',
			//当前未选中的tab bar的文本颜色和图标颜色
			inactiveTintColor: '#ccc',
			//是否显示tab bar的图标，默认是false
			showIcon: false,
			//showLabel - 是否显示tab bar的文本，默认是true
			showLabel: true,
			//是否将文本转换为大小，默认是true
			upperCaseLabel: false,
			//material design中的波纹颜色(仅支持Android >= 5.0)
			pressColor: '#788493',
			//按下tab bar时的不透明度(仅支持iOS和Android < 5.0).
			pressOpacity: 0.8,
			//tab bar的样式
			style: {
				backgroundColor: '#24A090',
				paddingBottom: 0,
				borderTopWidth: 0,
				paddingTop: 20,
				borderBottomColor: '#000',
				height: 75,
				justifyContent: 'center',

			},
			//tab bar的文本样式
			labelStyle: {
				fontSize: 18,
				margin: 1
			},
			tabStyle: {
				height: 75,
				justifyContent: 'center',
			},
			//tab 页指示符的样式 (tab页下面的一条线).
			indicatorStyle: {height: 0},
		},
		//tab bar的位置, 可选值： 'top' or 'bottom'
		tabBarPosition: 'top',
		//是否允许滑动切换tab页
		swipeEnabled: false,
		//是否在切换tab页时使用动画
		animationEnabled: false,
		//是否懒加载
		lazy: true,
		//返回按钮是否会导致tab切换到初始tab页？ 如果是，则设置为initialRoute，否则为none。 缺省为initialRoute。
		backBehavior: 'none',
		initialRouteName: 'Login',
	});

export const CourseManager = createMaterialTopTabNavigator(
	{
		MyCourse: {
			screen: MyCourse,
			navigationOptions: {
				title: '我的疗程',
			},
		},
		IsBuyCourse: {
			screen: IsBuyCourse,
			navigationOptions: {
				title: '已购疗程',
			},
		},
	},

	{
		tabBarOptions: {
			//当前选中的tab bar的文本颜色和图标颜色
			activeTintColor: '#202020',
			//当前未选中的tab bar的文本颜色和图标颜色
			inactiveTintColor: '#979797',
			//是否显示tab bar的图标，默认是false
			showIcon: false,
			//showLabel - 是否显示tab bar的文本，默认是true
			showLabel: true,
			//是否将文本转换为大小，默认是true
			upperCaseLabel: false,
			//material design中的波纹颜色(仅支持Android >= 5.0)
			pressColor: '#788493',
			//按下tab bar时的不透明度(仅支持iOS和Android < 5.0).
			pressOpacity: 1,
			//tab bar的样式
			style: {
				backgroundColor: '#f9f9f9',
				paddingBottom: 0,
				borderTopWidth: 0,
				height: 55,
				justifyContent: 'center',
				borderBottomWidth: 0,

			},
			//tab bar的文本样式
			labelStyle: {
				fontSize: 16,
			},
			tabStyle: {
				height: 55,
				justifyContent: 'center',
			},
			//tab 页指示符的样式 (tab页下面的一条线).
			indicatorStyle: {height: 0},
		},
		//tab bar的位置, 可选值： 'top' or 'bottom'
		tabBarPosition: 'top',
		tabBarComponent: CustomTabComponent,
		//是否允许滑动切换tab页
		swipeEnabled: false,
		//是否在切换tab页时使用动画
		animationEnabled: false,
		//是否懒加载
		lazy: true,
		//返回按钮是否会导致tab切换到初始tab页？ 如果是，则设置为initialRoute，否则为none。 缺省为initialRoute。
		backBehavior: 'none',
		initialRouteName: 'MyCourse',
	});
