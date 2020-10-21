import * as javaBase from './javaService';
    /**
    * 获取圈子列表
    * return Promiss
     */
    export function recommendList(dic) {
        return javaBase.requestToken({
            path: '/xcx/near/recommend/list',
            body: dic
        });
    }
    /**
    * 获取圈子详情
    * return Promiss
     */
    export function detail(dic) {
        return javaBase.requestToken({
            path: '/xcx/near/detail?id=47',
            body: dic
        });
    }

    export function save(dic) {
        return javaBase.requestToken({
            path: '/xcx/user/save',
            body: dic
        });
    }