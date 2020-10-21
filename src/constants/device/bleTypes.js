export const GET_DEVICE_TYPE_SUCCESS = 'GET_DEVICE_TYPE_SUCCESS';//获取设备类型成功
export const GET_DEVICE_TYPE_FAIL = "GET_DEVICE_TYPE_FAIL";//获取设备类型失败

export const GET_BLE_STATUS = 'GET_BLE_STATUS';//蓝牙状态
export const GET_CONNECT_STATUS = 'GET_CONNECT_STATUS';//连接状态

export const IMPLEMENTION_SUCCESS = "IMPLEMENTION_SUCCESS";//接口成功

export const SEARCHING = 'SEARCHING';//搜索中
export const ERROR_SEARCHING = 'ERROR_SEARCHING';//搜索出错

export const START_BINDING_DEVICE = 'START_BINDING_DEVICE';//开始绑定设备
export const BINDING = 'BINDING';//绑定中
export const DEVICE_BINDING_SUCCESS = 'DEVICE_BINDING_SUCCESS';//设备绑定成功
export const DEVICE_BINDING_ERROR = 'DEVICE_BINDING_ERROR';//设备绑定失败

export const FIRST_CONNECT_STATUS = 'FIRST_CONNECT_STATUS';//设备是否第一次连接

export const CONNECT_SUCCESS = "CONNECT_SUCCESS";//连接成功
export const CONNECT_ERROR = "CONNECT_ERROR";//连接失败

export const SYNC_TIME_SUCCESS = "SYNC_TIME_SUCCESS";//同步时间成功
export const SYNC_TIME_FAIL = "SYNC_TIME_FAIL";//同步时间失败

export const LASERMANUALLY_PAY_PARAMETERS = "LASERMANUALLY_PAY_PARAMETERS" ;//手动激光付费参数
export const LASER_MANUALLY_PARAMETERS = "LASER_MANUALLY_PARAMETERS";//手动激光参数 

export const MANUALLY_LASER_STATE = 'MANUALLY_LASER_STATE';//手动激光状态
export const MANUALLY_HR_STATE = 'MANUALLY_HR_STATE';//手动心率状态
export const AUTO_HR_STATE = "AUTO_HR_STATE";//自动心率状态

export const LOADING_STATUS = "LOADING_STATUS";//连接loading状态

export const UNBIND_DEVICE_SUCCESS = "UNBIND_DEVICE_SUCCESS";//解绑设备成功
export const UNBIND_DEVICE_FAIL = "UNBIND_DEVICE_FAIL";//解绑设备失败

export const DISCONNECT_DEVICE = "DISCONNECT_DEVICE";//断开设备

export const SET_USER_COURSE = "SET_USER_COURSE";//设置用户疗程

export const IS_MANUALLY_LASER_STATE = "IS_MANUALLY_LASER_STATE";//开关手动激光
export const IS_MANUALLY_HR_STATE = "IS_MANUALLY_HR_STATE";//开关手动心率
export const IS_AUTO_HR_STATE = "IS_AUTO_HR_STATE";//开关自动心率
export const IS_REALTIME_HR_STATE = "IS_REALTIME_HR_STATE";//开关实时心率
export const IS_SETPOINTER = "IS_SETPOINTER";//调整指针

export const GET_FIRMWARE_VERSION = "GET_FIRMWARE_VERSION";//获取固件版本信息

export const AIR_UPDATING = "AIR_UPDATING";//空中升级中
export const AIR_UPDATA_SUCCESS = "AIR_UPDATA_SUCCESS";//空中升级成功
export const AIR_UPDATA_ERROR = "AIR_UPDATA_ERROR";//空中升级失败

export const GET_PROGRESSBAR_VALUE = "GET_PROGRESSBAR_VALUE";//获取进度条的值

export const IS_CONNECT_OR_SEARCH = "IS_CONNECT_OR_SEARCH";//判断搜素或连接数据
export const CONNECTION_SUCCEEDED = "CONNECTION_SUCCEEDED";//连接成功状态判断依据
export const DEVICE_INFORMATION = "DEVICE_INFORMATION";//从服务器端获取写入设备的信息
export const UPDATA_ERR = "UPDATA_ERR"; //上传错误信息状态控制
export const SCAN_TIME_OUT = "SCAN_TIME_OUT"; //扫描超时处理
export const INSTRUCTION_TIME_OUT = "INSTRUCTION_TIME_OUT"; //配置超时
export const UNTIED_PROMPT = "UNTIED_PROMPT"; //数据上传过程中接触绑定提示

export const UPDATA_SPORTS = "UPDATA_SPORTS";//上传运动数据
export const UPDATA_HEART = "UPDATA_HEART";//上传心率数据
export const UPDATA_LASER = "UPDATA_LASER";//上传激光数据

export const UPDATA_DEVICE_NAME = "UPDATA_DEVICE_NAME"; //修改设备名称
export const UPGRADE = "UPGRADE"; //热更新App
export const UPGRADE_PROGRESS = "UPGRADE_PROGRESS";//热更新进度
export const UPGRADE_ERROR = "UPGRADE_ERROR";//热升级出错
export const UPGRADEBAND = "UPGRADEBAND"; //App版本更新
export const POINTER_SHOW = "POINTER_SHOW";

export const SEARCHED_DEVICES = "SEARCHED_DEVICES"; //搜索到的多设备
export const DEVICE_ARRAY = "DEVICE_ARRAY";//设备型号数组

export const DATA_PROGRESS = "DATA_PROGRESS";//数据上传进度显示

export const UNBIND_DATA_STATUS = "UNBIND_DATA_STATUS"; //解绑时数据上传
export const BOARDCAST_INFO = "BOARDCAST_INFO";//蓝牙广播信息
export const SET_BOARDCAST_INFO = "SET_BOARDCAST_INFO";//设置蓝牙广播信息

export const GET_TREATMENT_PARAMS = "GET_TREATMENT_PARAMS";//连接时获取设备里面的激光疗程参数
export const GET_TREATMENT_STATUS = "GET_TREATMENT_STATUS";//连接时获取设备中的周期