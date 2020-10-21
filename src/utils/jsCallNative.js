import {Platform, NativeModules} from 'react-native';

var HybirdController = NativeModules.HybirdController

/**
 * iosloading状态
 */
export function loading() {
    if (Platform.OS === 'IOS') {
        HybirdController.showLoading()
    }
}

/**
 * 收起键盘
 */
export function dismiss() {
    if (Platform.OS === 'IOS') {
        HybirdController.dismiss()
    }
}
