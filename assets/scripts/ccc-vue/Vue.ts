/*
 * @Author: kunsi 
 * @Date: 2019-04-20 13:21:51 
 * @Last Modified by: kunsi
 * @Last Modified time: 2019-04-20 13:23:53
 */

import {observe} from './VueObserver';
export default class Vue {
    constructor(data) {
        observe(data);
        return data;
    }

    /**
     * 订阅观察，当观察的值发生变化时触发 watcher的回调函数
     *
     * @param   {Watcher}  watcher  
     * @param   {any}      value    要观察的值
     *
     * @return  {[type]}            Watcher
     */
    static bind(watcher: Watcher, value: any) {
        watcher.init(value);
        return watcher;
    }
}