/**
 * @author lam
 */
'use strict';

import React, {Component} from 'react'
import {
    Text,
    View,
    ScrollView,
    StyleSheet,
    StatusBar,
    Dimensions, BackHandler,
    TouchableOpacity,
    Button,
    Image,
    Slider,
    Platform,
    InteractionManager,
} from 'react-native'
import NavBar from '../../common/NavBar'
import Item from '../../common/Item'
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';
import Toast, { DURATION } from 'react-native-easy-toast'
import Feather from 'react-native-vector-icons/Feather'
import { connect, } from 'react-redux'
import * as HomeService from '../../utils/network/homeService'
import { getDate } from '../../utils/utils';

import {statusBarHeight, height, width} from '../../utils/uiHeader';

const contentHeight = height - NavBar.topbarHeight - statusBarHeight

function formatTime(second) {
    let h = 0, i = 0, s = parseInt(second);
    if (s > 60) {
        i = parseInt(s / 60);
        s = parseInt(s % 60);
    }
    // 补零
    let zero = function (v) {
        return (v >> 0) < 10 ? "0" + v : v;
    };
    console.log([zero(h), zero(i), zero(s)].join(":"));
    return [zero(h), zero(i), zero(s)].join(":");
    // return zero(s);
}

class UseGuideDetail extends Component {
    static navigationOptions = {
        header: null
    }
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            avatarSource: null,
            config: [],
            video_url: '',
            rate: 1,
            volume: 1,
            muted: false,
            resizeMode: 'contain',
            duration: 0.0,
            currentTime: 0.0,
            paused: true,
            isFullScreen: false,
            videoWidth: width,
            videoHeight: width * 9/16,
            visible: true

        };
    }
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
    componentDidMount() {

        InteractionManager.runAfterInteractions(() => {
            HomeService.getAboutContent({id: this.props.navigation.state.params.id})
            .then((res) => {
                console.log(res, '图片信息')
                if(res.status == 1) {
                    this.setState({
                        config: res.data,
                        video_url: res.data.video_url,
                        content_url: res.data.content_url,
                        pubTime: getDate(res.data.update_time),
                        useFul: res.data.useful,
                        useLess: res.data.useless
                    })
                    var  content_url = res.data.content_url;
                    Image.getSize(content_url, (imgWidth, imgHeight) => {

                        var img_height = width * imgHeight/imgWidth;
                        console.log(img_height, '获取的图片的高度', imgWidth, imgHeight, width, height)
                        this.setState({
                            img_height: img_height
                        })

                      }, () => {

                      })
                }
            })
            .catch(err => {
                console.log(err);
            })
        })

    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }

    onBackAndroid = () => {
        this.props.navigation.goBack();
        return true;
    };

    back() {
        this.props.navigation.pop();
    }

    backfullScreen() {
        this.setState({
            isFullScreen: !this.state.isFullScreen,
            videoHeight: width * 9/16,
        })
    }
    onEnd = () => {
        this.video.seek(0)
        this.setState({
            paused: true,
            currentTime: 0,

        })
    };
    onLoad = (data)=> {
        console.log(data,'初始加载......')
        this.setState({
            duration: data.duration
        });
    };
    onAudioBecomingNoisy = () => {
        this.setState({paused: true})
    };

    onAudioFocusChanged = (event: { hasAudioFocus: boolean })=> {
        console.log(event,'qwqweqweqewqweqweqewqew')
        // this.setState({paused: !event.hasAudioFocus})
    };
    onProgress = (data) => {
        this.setState({currentTime: data.currentTime});
    };
      /// 屏幕旋转时宽高会发生变化，可以在onLayout的方法中做处理，比监听屏幕旋转更加及时获取宽高变化
    _onLayout = (event) => {
        //获取根View的宽高
        let {width, height} = event.nativeEvent.layout;
        console.log('通过onLayout得到的宽度：' + width);
        console.log('通过onLayout得到的高度：' + height);

        // 一般设备横屏下都是宽大于高，这里可以用这个来判断横竖屏
        let isLandscape = (height == height - NavBar.topbarHeight - statusBarHeight);
        if (isLandscape){
          this.setState({
            videoWidth: width,
            videoHeight: height - NavBar.topbarHeight - statusBarHeight,
            isFullScreen: true,
          })
        } else {
          this.setState({
            videoWidth: width,
            videoHeight: width * 9/16,
            isFullScreen: false,
          })
        }
    };
    // 点击了工具栏上的全屏按钮
    onControlShrinkPress() {
        if (this.state.isFullScreen) {
            this.setState({
                isFullScreen: !this.state.isFullScreen,
                videoHeight: width * 9/16
            })
        } else {
            this.setState({
                isFullScreen: !this.state.isFullScreen,
                videoHeight: height - NavBar.topbarHeight - statusBarHeight,
            })
        }
    }
    //暂停
    onPaused = () => {
        console.log(this.state.paused,"暂停吗暂停吗暂停吗暂停吗暂停吗暂停吗")
        var paused = this.state.paused;
        if(paused) {
            this.lay = setTimeout(() => {
                this.setState({
                    visible: false
                })
            },1000)
        }
        this.setState({
            paused: !paused
        })

    }

    addon = (res) => {
        var txt = res.type;
        switch(txt){
            case 'del':
                HomeService.submitAboutContentComment({id: this.props.navigation.state.params.id, type: 2, user_id: this.props.user_id, })
                .then(res => {
                    console.log(res,'负评论')
                    if(res.msg == '成功') {
                        var status = parseInt(this.state.useLess) + 1
                        this.setState({
                            useLess: status
                        })
                    }
                    this.refs.toast.show(res.msg)

                })
                .catch(err => {

                })
            break;
            case 'add' :
                HomeService.submitAboutContentComment({id: this.props.navigation.state.params.id, type: 1, user_id: this.props.user_id, })
                .then(res => {
                    console.log(res,'正评论')
                    if(res.msg == '成功') {
                        var status = parseInt(this.state.useFul) + 1
                        this.setState({
                            useFul: status
                        })
                    }
                    this.refs.toast.show(res.msg)
                })
                .catch(err => {

                })
            break;
        }
    }

    slider(value) {
        console.log(value,'12312313131')
        this.setState({
            currentTime: value,
        })
        this.video.seek(value)
    }

    setVisible =()=> {
        this.setState({
            visible: !this.state.visible
        })
    }

    imgLoad = (res) =>
    {
        console.log(res, '图片的信息')
    }

    render() {

        console.log(this.state.video_url,'获取的数据')
        let video_url = this.state.video_url;
        let image_url = this.state.content_url;
        let videoComponent = null;
        let pauseBtn = null;
        let autoTime = null;
        let sliderView  = null;
        let fullBtn = null;
        let comment = null;
        let title = null;
        let imgComponent = null;
        let NavBarContent = null;
        let statusBar = null;
        autoTime = (<View style={styles.volumeControl}>
            <Text style={{color: '#fff',fontSize: 12}}>{formatTime(this.state.duration - this.state.currentTime)}</Text>
        </View>)
        sliderView = (<View style={{flex: 1}}>
            <Slider
            minimumValue={0}
            maximumValue={this.state.duration}
            value={this.state.currentTime}
            onSlidingComplete={this.slider.bind(this)}
            style={{flex: 1}}
            maximumTrackTintColor={"#fff"}

            />
        </View>)

        if(this.state.paused) {
            pauseBtn = (<Feather name="pause" color="#fff" size={24}></Feather>)
        }else{
            pauseBtn = (<Feather name="play" color="#fff" size={24}></Feather>)
        }
        if(!this.state.isFullScreen) {
            title = (<View><View style={{paddingLeft: 10,paddingRight: 10,paddingTop: 10}}><Text>{this.state.config.title}</Text></View>
                    <View style={styles.subTitle}>
                        <Text>{this.state.pubTime}</Text>
                        <View style={{flexDirection: 'row',}}><Text>浏览：</Text><Text>{this.state.config.look}次</Text></View>
                    </View></View>)
            comment = (<View style={styles.commonent}>
                        <TouchableOpacity style={[styles.commonentBtn,{marginRight:40}]} onPress={this.addon.bind(this,{type: 'del'})}>
                            <Image source={require('../../img/down.png')} stye={styles.imageUp}/>
                            <Text style={{color: '#8b8e9c',paddingLeft:10}}>{this.state.useLess}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.commonentBtn} onPress={this.addon.bind(this,{type: 'add'})}>
                            <Image source={require('../../img/up.png')} stye={styles.imageUp}/>
                            <Text style={{color: '#8b8e9c',paddingLeft: 10}}>{this.state.useFul}</Text>
                        </TouchableOpacity>
                    </View>)
            imgComponent = ( <View style={styles.imgContent}>
                        <Image source={{uri: image_url}}
                            resizeMode="cover"
                            style={[styles.imgStyle, {height: this.state.img_height ? this.state.img_height : 300}]}
                            ref="ImageLoad"
                            />
                    </View>)
            NavBarContent = (<NavBar
                title="使用指南"
                leftIcon="ios-arrow-back"
                leftPress={this.back.bind(this)}
            />)
            fullBtn = (<TouchableOpacity onPress={this.onControlShrinkPress.bind(this)} style={{width: 40,justifyContent: 'center',alignItems: 'center'}}>
                        <Feather name="maximize" color="#fff" size={24}></Feather>
                    </TouchableOpacity>)
            statusBar = (<StatusBar
                backgroundColor={"#24A090"}
                barStyle={this.props.barStyle || 'light-content'}
                translucent={true}
                />)
        }
        else
        {
            NavBarContent = !this.state.visible ? <View style={{height: NavBar.topbarHeight,backgroundColor: '#000' }}></View> : (<NavBar
                leftIcon="ios-arrow-back"
                leftPress={this.backfullScreen.bind(this)}
                style={{backgroundColor: '#000'}}
            />);
            fullBtn = (<TouchableOpacity onPress={this.onControlShrinkPress.bind(this)} style={{width: 40,justifyContent: 'center',alignItems: 'center'}}>
                    <Feather name="maximize" color="#fff" size={24}></Feather>
                </TouchableOpacity>)
            statusBar = (<StatusBar
                backgroundColor={"#000"}
                barStyle={this.props.barStyle || 'light-content'}
                translucent={true}
                hidden={this.state.visible ? false : true}
                />)
        }
        if(!video_url) {
            videoComponent = null
        }else{
            videoComponent = (<Video
                                ref={(ref: Video) => {
                                    this.video = ref
                                }}
                                /* For ExoPlayer */
                                source={{uri: video_url}}
                                style={{width: this.state.videoWidth,height: this.state.videoHeight}}
                                rate={this.state.rate}
                                paused={this.state.paused}
                                volume={this.state.volume}
                                muted={this.state.muted}
                                resizeMode={this.state.resizeMode}
                                onLoad={this.onLoad}
                                onProgress={this.onProgress}
                                onEnd={this.onEnd}
                                onAudioBecomingNoisy={this.onAudioBecomingNoisy}
                                onAudioFocusChanged={this.onAudioFocusChanged}
                                repeat={false}

                            />)
        }

        if(!this.state.visible) {
            pauseBtn = null;
            fullBtn = null;
            sliderView = null;autoTime = null;
        }

        return (
            <View style={{flex: 1,backgroundColor: "#f3f3f3"}} onLayout={this._onLayout}>
                 {statusBar}
                <View style={styles.sBar} backgroundColor={this.state.isFullScreen ? "#000" : '#24A090'}/>
                {NavBarContent}
                <ScrollView>
                    {title}
                    <View style={styles.container}>
                        <TouchableOpacity
                            onPress={this.setVisible}
                            style={{width: this.state.videoWidth,height: this.state.videoHeight}}>
                            {videoComponent}
                        </TouchableOpacity>
                        <View style={styles.controls}>
                            <TouchableOpacity style={styles.btn} onPress={this.onPaused.bind(this)}>
                                {pauseBtn}
                            </TouchableOpacity>
                            <View style={styles.textStyle}>
                                {autoTime}
                            </View>
                            {sliderView}
                            {fullBtn}
                        </View>
                    </View>
                   {imgComponent}
                    {comment}
                </ScrollView>
                <Toast ref="toast" />
            </View>
        )
    }
}

function mapStateToProps(state)
{
	console.log(state,'子组件的属性')
	return {
		user_id: state.loginIn.user ? state.loginIn.user.user_id : '',
		token: state.loginIn.user ? state.loginIn.user.token : '',
	}
}

function mapDispatchToProps(dispatch)
{
	return {

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UseGuideDetail)


const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    sBar: {
        height: statusBarHeight,
        width: width
    },
    title: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        color: "#666"
    },
    subTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingTop: 20,
    },
    textStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        width: 60,
    },
    btn: {
        height: 20,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    controls: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom:10,
        left: 0,
        width: '100%',
        paddingLeft: 10,
        paddingRight: 10
    },
    volumeControl: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    commonent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20
    },
    commonentBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        paddingTop: 10,
        paddingLeft: 40,
        paddingRight: 40,
        paddingBottom: 10,
        borderWidth: 1,
        borderColor: '#8b8e9c'
    },
    imageUp: {
        width: 30,
        height: 30,
    },
    imgContent: {
        marginTop: 10
    },
    imgStyle: {
        width: width,
    }
});
