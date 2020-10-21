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
    DeviceEventEmitter,
    TouchableOpacity
} from 'react-native'
import NavBar from '../../common/NavBar'

import {width, statusBarHeight} from '../../utils/uiHeader';
//FontAwesome
export default class dynamicStatement extends Component {
    static navigationOptions = {
        header: null
    }
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
    componentDidMount() {

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
    agree(){
    	this.props.navigation.push("AddText")
    	// this.props.navigation.push("DynamicEdit");

    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
                <View style={styles.sBar} backgroundColor={'#24a090'}/>
                <NavBar
                    title="发布声明"
                    leftIcon="ios-arrow-back"
                    leftPress={this.back.bind(this)}
                />
                <ScrollView>
                    <View style={styles.content}>
                        <Text style={styles.font}>
                        感谢您浏览和使用分享E疗（以下简称"本软件"）。在您使用本软件各项服务之前，请仔细阅读本《免责声明》。
本软件圈子频道旨在为激光治疗仪产品用户和潜在用户提供真实的健康体验分享交流平台。凡以任何方式浏览和使用本软件内容或直接、间接使用本软件内容者，在点击下方同意按钮后，即默认为已经仔细阅读并同意本《免责声明》。
                        </Text>
                        <Text style={styles.font}>
                        1. 本软件为用户提供个人使用激光治疗仪的案例分享上传渠道、旨在帮助更多有需要的人，介绍使用心得和体会，分享使用方法和经验，内容均由用户在遵守《分享E疗发布声明》的前提下自愿上传，并无偿允许本平台对该内容进行编辑、修改和发布使用。内容上传用户应按照国家相关法律法规的规定，上传正规、健康、有益的内容素材，平台对上传内容拥有审核发布权，用户所上传内容须保证其原创性和真实性，对于由此引发的任何法律纠纷，本平台不承担任何责任，由内容上传人自行承担相关责任。
                        </Text>
                        <Text style={styles.font}>
                        2. 用户上传作品不得侵犯他人的知识产权以及其他合法权利（包括但不限于著作权、商标权、肖像权等）。若用户未经著作权人同意擅自对其作品进行全部或部分复制、修改、改编、翻译、汇编等，有可能侵害到他人的著作权时，用户不得擅自把相关内容上传发布到本频道。一旦由于用户上传的作品发生权利纠纷或侵犯了任何第三方的合法权利，对此造成的所有责任由用户承担，因此给本软件或任何第三方造成损失的，用户应负责全额赔偿。本平台有权不事先通知用户即撤消或删除上传内容，并无需向用户承担任何责任。
                        </Text>
                        <Text style={styles.font}>
                        3. 本软件作品受到著作权法、商标法、专利法、信息网络传播权保护条例等相关法律法规的保护和约束，在本软件内所发布的内容作品版权将归属作者和本平台所共有。除非获得权利人的授权，其他用户不得转载、修改、传播、制作衍生作品或者商业使用。用户或其他媒体、企业、网站、其他组织或个人如需使用本频道作品，必须先与作者、相关权利人或本频道联系。
                        </Text>
                        <Text style={styles.font}>
                        4. 本软件有权为宣传本软件之目的使用用户上传的内容，且无需向用户支付任何费用或承担任何责任。本软件在宣传推广用户上传的作品时（包括但不限于在广告、推荐位、本站合作推广专区中推广）时，有权同时标注本软件的标识（包括但不限于相关的文字表述、本频道的名称、LOGO等）。
                        </Text>
                        <Text style={styles.font}>
                        5. 本软件合法转载的其他媒体作品或内容是为传播更多的科技养生知识以展示与交流之用，提供用户试看。请勿擅自保存、转载发布或用于商业用途，否则可能侵犯他人合法权利。
                        </Text>
                        <Text style={styles.font}>
                        6. 本软件中以链接形式推荐其他网站内容的，由于本软件并不控制该链接网站和资源，因此，本软件不保证该链接获取的任何内容、产品、服务或其他材料的真实性、完整性、安全性和合法性。用户应谨慎判断并自担风险，对于任何因使用或信赖从该链接网站或资源上获取的内容、产品、服务或其他材料而造成（或声称造成）的任何直接或间接损失，本软件均不承担任何责任。
                        </Text>
                        <Text style={styles.font}>
                        7. 本软件所刊载信息的作品内容及稿件仅代表作者本人的观点，不代表本软件观点，对于任何因本软件内容所引起的纠纷、损失等，本软件均不承担侵权行为的连带责任。
                        </Text>
                        <Text style={styles.font}>
                        8. 本软件所荐内容仅供用户参考，不做为用户任何行为依据的指导和建议。因此而引发任何争议和纠纷的，与本软件无任何关联。
                        </Text>
                        <Text style={styles.font}>
                        9. 本软件不保证上传作品的安全性，请上传用户自行留存原稿，对因任何原因导致用户上传的内容灭失情况的，本软件均不承担责任。
                        </Text>
                        <Text style={styles.font}>
                        10. 本软件可能因黑客攻击、计算机病毒侵入或发作、政府管制而造成的暂时性关闭，或因前述原因以及与本软件链接的其它网站原因导致个人资料泄露、丢失、被盗用或被篡改等，本软件不承担任何责任。
                        </Text>
                        <Text style={styles.font}>
                        11. 本软件可能因其他合作方或相关电信部门的互联网软硬件设备故障或失灵、或人为操作疏忽而全部或部分中断、延迟、遗漏、误导或造成资料传输或储存上的错误、或遭第三人侵入系统篡改或伪造变造资料等，本软件不承担任何责任。
                        </Text>
                        <Text style={styles.font}>
                        12. 用户应妥善保管软件账户及密码信息，如用户将密码告知他人或与他人共享同一ID，从而导致任何资料泄露等损失，由用户自行承担。
                        </Text>
                        <Text style={styles.font}>
                        若您的合法权益受到侵害，请及时告之本软件并提供相应的证据，本软件将尽一切努力，最大范围内保护您的合法利益。
                        </Text>
                    </View>
                </ScrollView>
                <TouchableOpacity style={styles.btn} onPress={this.agree.bind(this)}>
                    <Text style={styles.btnFont}>同意</Text>
                </TouchableOpacity>
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
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 100,
    },
    font: {
        color: '#666',
        fontSize: 18,
    },
    btn: {
        position: 'absolute',
        bottom: 15,
        right: 50,
        left: 50,
        height: 40,
        backgroundColor: '#24a090',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnFont: {
        color: '#FFF',
        fontSize: 18,
    }
});
