import {createStackNavigator, } from 'react-navigation-stack';
import {TabNav, TabLoginNav, CourseManager, } from "./RootPage";
import Launch from './page/launch';
import DeviceList from "./page/dataObserve/deviceList";
import UserProfile from "./page/Mine/UserProfile";
import SettingScreen from "./page/Mine/SettingScreen";
import UseGuide from './page/UseGuide/UseGuide';
import UseGuideDetail from './page/UseGuide/UseGuideDetail';
import BleTool from './page/BleTool/BleTool';
import BleAddMethodsPage from './page/BleTool/BleAddMethods';
import UpdataPassword from './page/updataPassword/UpdataPassword';
import SaveUpdataPassword from './page/updataPassword/SaveUpdataPassword';
import BindPhonePage from './page/BindPhone/BindPhone';
import BleSearchPage from './page/BleTool/BleAddMethods';
import BleSearchResultPage from './page/BleTool/BleSearchResult';
import BleScanResultPage from './page/BleTool/BleScanResult';
import DeviceManage from './page/DeviceManage/DeviceManage';
import TimeCalibrationPage from "./page/DeviceManage/TimeCalibration";
// import MyCoursePage from "./page/MyCourse/MyCourseList";
import MyCourseDetailPage from './page/MyCourse/MyCourseDetail';
import IntegralPage from './page/Mine/integral/Integral';
import IntegralRulePage from './page/Mine/integral/IntegralRule';
import MineProfilePage from './page/Mine/mineProfile/MineProfile';
import MedicalPage from './page/Mine/mineProfile/Medical';
import AboutMePage from './page/Mine/aboutMe/AboutMe';
import QrCodePage from './page/Mine/qrCode/QrCode';
// import IsBuyCoursePage from './page/Mine/isBuyCourse/IsBuyCourse';
import BindingBuyCourse from './page/Mine/isBuyCourse/BindingBuyCourse';
import ForgetPage from './page/forgetPassword/forget';
import SavePasswordPage from './page/forgetPassword/savePassword';
import AirUpdata from './page/airUpdata/index';
import UpDataExplain from './page/airUpdata/upDataExplain';
import ScanResultPage from './page/BleTool/ScanResult';
import Youzan from './page/Home/youzan';

//数据相关
import SportsObserve from './page/dataObserve/sports';
import LaserObserve from './page/dataObserve/laser';
import HeartObserve from './page/dataObserve/heart';
import TiwenObserve from './page/dataObserve/tiwen';

//疗程相关
import CourseShop from './page/courseManager/shop';

//登录界面
import LoginVXPage from './page/loginPage/loginVX';
import LoginNewVXPage from './page/loginPage/loginPage';
import CodePage from './page/loginPage/codePage';
import UserAgreement from './page/loginPage/userAgreement';
import BindCode from './page/BindPhone/BindCode';

import CourseSuccessPage from "./page/Mine/isBuyCourse/CourseSuccess";
import DeviceManageDetail from './page/DeviceManage/DeviceManageDetail';
import ChooseDevicePage from "./page/Mine/isBuyCourse/ChooseDevice";
import NotificationDetail from './page/notification/NotificationDetail'
import NewsList from './page/notification/newsList'
import Novice from './page/novice/novice';
import Pointer from './page/pointer/pointer';
import Test from './page/pointer/test';
import LaserMeasurePage from "./page/BleTool/laserMeasure";
import DynamicStatement from "./page/dynamicdFile/dynamicStatement";
import DynamicDetail from "./page/dynamicdFile/dynamicDetail";
import DynamicEdit from "./page/dynamicdFile/dynamicEdit";
import AddAudio from "./page/dynamicdFile/addAudio";
import DynamicMine from "./page/dynamicdFile/dynamicMine";
import UpVideo from "./page/dynamicdFile/upVideo";
import AddText from './page/dynamicdFile/addText';
import AddPicture from './page/dynamicdFile/addPicture';
import AddVideo from './page/dynamicdFile/addVideo';
import AudioTotext from './page/dynamicdFile/audioTotext';
import DynamicPreview from './page/dynamicdFile/preview';
import DynamicSuccess from './page/dynamicdFile/dynamicSuccess';
import CommentSuccess from './page/dynamicdFile/comment/commentSuccess';
import CommentList from './page/dynamicdFile/comment/commentList';
import HotList from './page/dynamicdFile/hotTop/hotList';
import HotResult from './page/dynamicdFile/hotTop/hotResult';
import FeatureList from './page/guardian/featureList';
import RemoteOperation from './page/guardian/guardians/remoteOperation';
import GuardianChoose from './page/guardian/guardianChoose';
import GuardianList from './page/guardian/guardians/guardianList';
import AddGuardians from './page/guardian/guardians/addGuardians';
import AddSuccess from "./page/guardian/guardians/addSuccess";
import ToGuardianList from './page/guardian/toGuardians/toGuardianList';
import AddToGuardians from './page/guardian/toGuardians/addToGuardians';
import AddToSuccess from "./page/guardian/toGuardians/addToSuccess";
import NewsDetail from './page/notification/newsDetail';

const creatApp = isLogin =>
{
	return createStackNavigator({
		Launch: {screen: Launch, }, //启动页
		Setting: {screen: SettingScreen, },
		UserProfile: {screen: UserProfile, },
		UseGuide: {screen: UseGuide, },  //使用指南
		UseGuideDetail: {screen: UseGuideDetail, }, //使用指南详情
		BleTool: {screen: BleTool, },   //设备应用
		TimeCalibrationPage: {screen: TimeCalibrationPage, }, //指针校准
		BleAddMethodsPage: {screen: BleAddMethodsPage, }, //选择搜索方式
		BleSearchPage: {screen: BleSearchPage, }, //蓝牙搜索
		BleSearchResultPage: {screen: BleSearchResultPage, }, //蓝牙搜索结果页
		BleScanResultPage: {screen: BleScanResultPage, }, //扫码绑定解结果
		DeviceManage: {screen: DeviceManage, }, //设备管理
		DeviceManageDetail: {screen: DeviceManageDetail, }, //设备列表详情
		// MyCoursePage: {screen: MyCoursePage, }, //我的疗程
		MyCourseDetailPage: {screen: MyCourseDetailPage, }, //疗程详情
		LoginVXPage: {screen: LoginVXPage, }, //登陆，第三方微信登陆
		LoginNewVXPage: {screen: LoginNewVXPage, }, //新版登录
		UserAgreement: {screen: UserAgreement, }, //用户协议
		CodePage: {screen: CodePage, }, //验证码
		BindCode: {screen: BindCode, }, //绑定手机号验证码
		ForgetPage: {screen: ForgetPage, },  //忘记密码第一步
		SavePasswordPage: {screen: SavePasswordPage, }, //忘记密码第二步
		UpdataPassword: {screen: UpdataPassword, }, //更改密码第一步
		SaveUpdataPassword: {screen: SaveUpdataPassword, }, //更改密码第二步
		BindPhonePage: {screen: BindPhonePage, }, //绑定手机
		IntegralPage: {screen: IntegralPage, }, //积分管理
		IntegralRulePage: {screen: IntegralRulePage, }, //积分规则
		MineProfilePage: {screen: MineProfilePage, }, //个人信息
		MedicalPage: {screen: MedicalPage, }, //病史
		AboutMePage: {screen: AboutMePage, }, //关于我们
		QrCodePage: {screen: QrCodePage, }, //我的二维码
		// IsBuyCoursePage: {screen: IsBuyCoursePage},//我的购买疗程
		BindingBuyCourse: {screen: BindingBuyCourse, }, //我的购买疗程绑定
		ChooseDevicePage: {screen: ChooseDevicePage, }, //已购疗程选择设备
		AirUpdata: {screen: AirUpdata, }, //空中升级
		UpDataExplain: {screen: UpDataExplain, }, //升级说明
		ScanResultPage: {screen: ScanResultPage, }, //扫码绑定中
		Youzan: {screen: Youzan, }, //跳转有赞商城
		CourseSuccessPage: {screen: CourseSuccessPage, }, //已购疗程成功操作页面
		SportsObserve: {screen: SportsObserve, }, //运动数据
		HeartObserve: {screen: HeartObserve, },  //心率数据
		LaserObserve: {screen: LaserObserve, }, //激光数据
		DeviceList: {screen: DeviceList, }, //选择设备进入数据
		NotificationDetail: {screen: NotificationDetail, }, //消息详情
		NewsList: {screen: NewsList, }, //滚动通知列表页
		Novice: {screen: Novice, }, //新手引导
		Pointer: {screen: Pointer, }, //表盘指针页面
		Test: {screen: Test, },
		LaserMeasurePage: {screen: LaserMeasurePage, }, //手动激光详情
		DynamicStatement: {screen: DynamicStatement, }, //发布声明
		DynamicDetail: {screen: DynamicDetail, }, //分享详情
		DynamicEdit: {screen: DynamicEdit, }, //圈子发布
		AddAudio: {screen: AddAudio, }, //添加录音
		DynamicMine: {screen: DynamicMine, }, //我的分享
		UpVideo: {screen: UpVideo, }, //视频
		AddText: {screen: AddText, }, //发布文字
		AddPicture: {screen: AddPicture, }, //发布图片
		AddVideo: {screen: AddVideo, }, //添加视频
		AudioTotext: {screen: AudioTotext, }, //语音转文字
		DynamicPreview: {screen: DynamicPreview, }, //发布预览
		DynamicSuccess: {screen: DynamicSuccess, },
		CommentSuccess: {screen: CommentSuccess, }, //评论成功
		CommentList: {screen: CommentList, }, //评论列表
		HotList: {screen: HotList, }, //标签搜索
		HotResult: {screen: HotResult, }, //搜索结果页
		FeatureList: {screen: FeatureList, }, //监护人功能列表
		GuardianChoose: {screen: GuardianChoose, }, //选择身份
		GuardianList: {screen: GuardianList, }, //监护人列表
		AddGuardians: {screen: AddGuardians, }, //增加监护人
		AddSuccess: {screen: AddSuccess, }, //监护人提交申请成功
		ToGuardianList: {screen: ToGuardianList, }, //监护人列表
		AddToGuardians: {screen: AddToGuardians, }, //增加被监护人
		AddToSuccess: {screen: AddToSuccess, }, //被监护人提交申请成功
		RemoteOperation: {screen: RemoteOperation, }, //功能操作
		NewsDetail: {screen: NewsDetail, }, 
		TiwenObserve: {screen: TiwenObserve}, //体温检测
		CourseManager: {
			screen: CourseManager,
			navigationOptions: {
				header: null,
			},
		},
		CourseShop: {screen: CourseShop, }, //疗程购买
		TabLoginNavPage: {
			screen: TabLoginNav,
			navigationOptions: ({navigation, }) => ({
				header: null,
				gesturesEabled: false,
			}),
		}, //登陆注册页
		Main: {
			screen: TabNav,
			navigationOptions: ({navigation, }) => ({
				header: null,
			}),
		},
	},
	{
		initialRouteName: isLogin ? 'Main' : 'LoginNewVXPage',
		headerMode: 'screen',
		navigationOptions: {
			gesturesEnabled: false,
			gestures: null,
			headerStyle: {
				backgroundColor: '#24a090',
			},
			headerTintColor: '#fff',
		},
	});
}

export default creatApp;
