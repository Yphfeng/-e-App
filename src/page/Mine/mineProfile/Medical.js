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
    BackHandler,
    TouchableOpacity
} from 'react-native'
import NavBar from '../../../common/NavBar'
import Toast, { DURATION } from 'react-native-easy-toast';
import * as userService from '../../../utils/network/userService';

import {statusBarHeight, width, } from '../../../utils/uiHeader';

//FontAwesome
export default class MedicalPage extends Component {
    static navigationOptions = {
        header: null
    };
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        this.getUserInfo();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }
    componentDidMount() {
        this.setState({
            disease: this.props.navigation.state.params.diease
        })

    }
    getUserInfo() {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var dic = new Object();
        var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;
        if (guardian)
        {
            dic.armariumScienceSession = guardian.userToken;
        }
        userService.getMedicalList(dic)
            .then(res => {
                console.log(res,'获取的病史信息')
                if(res.status == 1) {
                    this.setState({
                        medicalInfo: res.disease_list
                    })
                }
            })
            .catch(err => {

            })
    }
    onBackAndroid = () => {
        this.props.navigation.goBack();
        return true;
    };

    constructor(props) {
        super(props)
        this.state = {
            medicalInfo: [],
            isTips: true
        }
    }

    back() {
        this.props.navigation.pop();
        if(this.props.navigation.state.params.callback) {
            this.props.navigation.state.params.callback()
        }
    }
    changeNameInput() {

    }
    changeHeightInput() {

    }
    changeWeightInput() {

    }

    /**
     * [select 选择病例]
     * @Author   袁进
     * @DateTime 2019-01-15T17:19:17+0800
     * @param    {[type]}                 res [description]
     * @return   {[type]}                     [description]
     */
    select(res){
        const _this = this;
        let diease = this.state.disease;
        console.log(this.state.medicalInfo,'12332123')
        var medicalInfo = this.state.medicalInfo;
        for(var i = 0; i<medicalInfo.length; i++) {
            var list = medicalInfo[i].list;
            for(var j= 0;j<list.length; j++) {
                if(list[j].disease_name == res.name){
                    var index = diease.findIndex((value,index,arr) => {
                        return value.disease_name == list[j].disease_name
                    })
                    if(index > -1){
                        diease.splice(index,1);
                        list[j].selected = !res.selected;
                    }else{
                        if(diease.length > 2) {
                            _this.refs.toast.show("最多选择3个标签")
                            return;
                        }
                        list[j].selected = !res.selected;
                        diease.push({disease_name:list[j].disease_name,disease_id: list[j].id})
                    }
                }
            }
        }
        this.setState({
            medicalInfo: medicalInfo,
            diease: diease
        })
    }
    close(){
        this.setState({
            isTips: false
        })
    }
    /**
     * [upDevice 提交选择]
     * @Author   袁进
     * @DateTime 2019-01-15T19:44:55+0800
     * @return   {[type]}                 [description]
     */
    upDevice(){
        console.log(this.state.diease);
        userService.updateUserInfo({disease: JSON.stringify(this.state.diease)})
            .then(res => {
                console.log(res)
                if(res.status == 1) {
                    this.refs.toast.show(res.msg)
                }else{
                    this.refs.toast.show(res.msg)
                }

            })
            .catch(err => {
                this.refs.toast.show('修改失败')

            })
    }
    render() {
        let list = null;
        let itemList = null;
        let tips = null;
        let diease = this.state.disease;
        if(!this.state.isTips){
            tips = null
        }else{
            tips = (<View style={styles.tips}>
                    <Text style={styles.text}>最多选择3个标签</Text>
                    <TouchableOpacity onPress={this.close.bind(this)}><Text>x</Text></TouchableOpacity>
                </View>)
        }
        if(!diease) {

        }
        if(this.state.medicalInfo.length < 1) {
            list = null
        }else {
            console.log(this.state.medicalInfo,'获取的病史信息111111111',this.state.diease)
            list = this.state.medicalInfo.map((item,index) => {
                if(item.list.length < 1) {
                    itemList = null
                }else {
                    itemList = item.list.map((atem,i) => {
                        if(!diease) {
                            atem.selected = false
                        }else{
                            var index = diease.findIndex((value,index,arr) => {
                                return value.disease_name == atem.disease_name
                            })
                            if(index > -1){
                                atem.selected = true
                            }else{
                                atem.selected = false
                            }

                        }
                        console.log(atem,'123123')
                        return (<TouchableOpacity key={atem.id} style={[styles.atem,{backgroundColor: atem.selected ? '#24a090' : '#fff',borderColor: atem.selected ? '#24a090' : '#7f8389'}]} onPress={this.select.bind(this,{selected: atem.selected,name: atem.disease_name})}>
                                    <Text style={[styles.text,{color: atem.selected ? '#fff' : '#7f8389'}]}>{atem.disease_name}</Text>
                                </TouchableOpacity>)
                    })
                }
                return (<View key={item.id} style={styles.item}>
                            <View style={styles.itemTitle}><Text style={{color: '#000'}}>{item.type_name}</Text></View>
                            <View style={styles.atemWhole}>{itemList}</View>
                        </View>)

            })
        }

        return (
            <View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
                <View style={styles.sBar} backgroundColor={'#24a090'}/>
                <NavBar
                    title="完善资料"
                    leftIcon="ios-arrow-back"
                    leftPress={this.back.bind(this)}
                />
                {tips}
                <ScrollView>
                    {list}
                </ScrollView>
                <TouchableOpacity style={styles.save} onPress={this.upDevice.bind(this)}>
                    <Text style={{fontSize: 14,color: '#fff'}}>提交选择</Text>
                </TouchableOpacity>
                <Toast ref="toast" />
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
    },
    item: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        marginBottom: 5,
        paddingVertical: 15
    },
    save: {
        marginLeft: 20,
        marginRight: 20,
        height: 35,
        backgroundColor: '#24a090',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    tips: {
        backgroundColor: '#f4e1c2',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5
    },
    text: {
        fontSize: 12
    },
    itemTitle: {
        paddingBottom: 10
    },
    atemWhole: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    atem: {
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 8,
        paddingVertical:3,
        marginRight: 10,
        marginBottom: 8,
    }
});
