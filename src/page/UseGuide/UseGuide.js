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
    Dimensions, BackHandler
} from 'react-native'
import NavBar from '../../common/NavBar'
import Item from '../../common/Item'

import * as HomeService from '../../utils/network/homeService'


import {statusBarHeight, height, width, } from '../../utils/uiHeader';
//FontAwesome
export default class UseGuide extends Component {
    static navigationOptions = {
        header: null
    }
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            avatarSource: null,
            config: []
        };
    }
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
    componentDidMount() {
        HomeService.getAboutList()
        .then((res) => {
            console.log(res)
            if(res.status == 1) {
                var list = res.list.push({title: '新手引导', id: 666})
                this.setState({
                    config: res.list
                })
            }else{
            }
        })
        .catch(err => {
            console.log(err);
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
    events(res) {
        console.log(res);
        var id = res.id;
        if(id == 666){
            this.props.navigation.push("Novice");
            return
        }
        this.props.navigation.push("UseGuideDetail",{id: id})
    }
	render()
	{
		let list = null;
		console.log(this.state.config,'列表啊啊实打实的')
		if(!this.state.config) {
			list =  <Text>暂无数据！</Text>
		}else{
			list = this.state.config.map((item, i) => {
				return <Item key={item.id} name={item.title} onPress={this.events.bind(this,{id: item.id})} />
			})
		}
		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24A090'}/>
				<NavBar
					title="使用指南"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<ScrollView>
					{list}
				</ScrollView>
			</View>
		)
    }
}
const styles = StyleSheet.create({
	title: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		color: "#666"
	},
	sBar: {
		height: statusBarHeight,
		width: width,
	}
});
