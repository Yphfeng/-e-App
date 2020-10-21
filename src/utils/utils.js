/**
 * 
 * 手机校验
 */
export function checkPhone(value) {
	if(!(/^1(3|4|5|6|7|8)\d{9}$/.test(value))){ 
        return false; 
    }
    return true
}

/**
 * 时间戳转日期
 * 
 */
export function getDate(date){ 
	console.log(date,'日期')
    if(!date) {
        return null
    }
    var t = new Date(parseInt(date)*1000);
    console.log(t)
    var y = t.getFullYear();
    var M = t.getMonth() < 9 ? '0' + t.getMonth() : t.getMonth();
    var D = t.getDate() < 10 ? '0' + t.getDate() : t.getDate();
    var H = t.getHours() < 10 ? '0' + t.getHours() : t.getHours();
    var m = t.getMinutes() < 10 ? '0' + t.getMinutes() : t.getMinutes();
    var s = t.getSeconds() < 10 ? '0' + t.getSeconds() : t.getSeconds();
    var total = y + '-' + M + '-' + D + ' ' + H + ':' + m + ':' + s 
    console.log(total,'日期')
    return total; 
}

//判断两个对象是否相等
export function compareObject (obj1, obj2) {
	// 递归终止条件，当 obj1 或 obj2 不是对象时，此时就可以进行判断了
	if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
		if (obj1 === obj2) {
			return true
		} else if (obj1 !== obj2) {
			return false
		}
	}
	// 获取对象的自由属性组成的数组
	const obj1PropsArr = Object.getOwnPropertyNames(obj1)
	const obj2PropsArr = Object.getOwnPropertyNames(obj2) 
	// 如果数组的长度不相等，那么说明对象属性的个数都不同，返回 false
	if (obj1PropsArr.length !== obj2PropsArr.length) {
		return false
	}
	// 记录当前 compareObject 的返回值，默认是 true
	let status = true
	for (key of obj1PropsArr) {
		status = compareObject(obj1[key], obj2[key])
		// 关键代码，当 status 为 false 时下面就不用再进行判断了，说明两个对象的内容并不相同
		// 如果没有下面这条语句，那么只要对象底层的内容是相同的那么就返回 true
		if (!status) {
			break
		}
	}
	// 每次 compareObject 执行的返回结果
	return status
}


//防止快速点击的工具类

export const NoDoublePress = {
    lastPressTime: 1,
    onPress(callback){
        let curTime = new Date().getTime();
        if (curTime - this.lastPressTime > 1000) {
            this.lastPressTime = curTime;
            callback();
        }
    },
};

//拼接设备名称为激光治疗手表或手环
export function  stitchingName(name) {
	var len = name.length;
	if (len > 2) {
		return name;
	} 
	return '激光治疗' + name
}