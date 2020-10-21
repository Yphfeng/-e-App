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
    DeviceEventEmitter
} from 'react-native'
import NavBar from '../../common/NavBar'
import Item from '../../common/Item'

import * as HomeService from '../../utils/network/homeService'
import QBStorage from '../../utils/storage/storage';
import * as qbDate from '../../utils/qbDate';
import HTML from 'react-native-render-html';
import {connect} from "react-redux";
import * as notificationActions from '../../actions/notificationActions';

import {statusBarHeight, height, width, } from '../../utils/uiHeader';

//FontAwesome
class NotificationDetail extends Component {
    static navigationOptions = {
        header: null
    }
    constructor(props) {
        super(props);
        this.state = {
            item: {}
        };
    }
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
    componentDidMount() {
        DeviceEventEmitter.emit('bulletBox', 0)
        var item = this.props.navigation.state.params.item;
        console.log('xiangqing1', this.props.navigation.state.params)
        this.setState({
            item: item,
        })
        HomeService.readMessage({id: item.id, })
        .then(res => {
            console.log(res, '读')
            this.props.getUserMsgCount();
        })
        .catch(err => {
            console.log(err, '读错')
        })
    }
    escapeStringHTML(str) {
        str = str.replace(/&lt;/g,'<');
        str = str.replace(/&gt;/g,'>');
        str = str.replace(/&quot;/g, '"')
        return str;
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
        this.props.navigation.push("UseGuideDetail",{id: id})
    }
    render() {
        let item = this.state.item
        return (
            <View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
                <View style={styles.sBar} backgroundColor={'#24a090'}/>
                <NavBar
                    title="详情"
                    leftIcon="ios-arrow-back"
                    leftPress={this.back.bind(this)}
                />
                <ScrollView style={{backgroundColor: '#fff'}}>
                    {item.title&&<View style={styles.content}>
                        <View>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                        </View>
                        <View>
                            <Text style={styles.time}>{qbDate.DateFormat(item.createTime, 0)} {qbDate.DateFormat(item.createTime, 1)}</Text>
                        </View>
                        {item.content&&<HTML html={this.escapeStringHTML(item.content)} imagesMaxWidth={Dimensions.get('window').width} />}
                    </View>}
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
        width: width
    },
    content: {
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 20,
        backgroundColor: '#fff'
    },
    itemTitle: {
        fontSize: 20,
        color: '#000',
    },
    time: {
        fontSize: 15,
        color: '#666',
        paddingTop: 7,
    },
});


function mapDispatchToProps(dispatch)
{
	return {
		getUserMsgCount: () => dispatch(notificationActions.getUserMsgCount()),
	}
}

function mapStateToProps(state)
{
    return {

    }
}
export default connect(mapStateToProps, mapDispatchToProps)(NotificationDetail)


