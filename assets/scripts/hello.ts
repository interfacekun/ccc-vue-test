// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
import Watcher from './ccc-vue/Watcher';
import Vue from './ccc-vue/Vue';

@ccclass
export default class Hello extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;
    _vm: Vue | any = null;
    _watcher: Watcher | any;


    start () {
        // 观察
        this._vm = new Vue({label: "Hello world!"});
        // 订阅
        this._watcher = Vue.bind(new Watcher(this._vm, this.setLabelString, this), this._vm.label);

        // 取消订阅
        // watcher.teardown();
    }

    setLabelString(vaule: string, oldValue: string) {
        if (!vaule) vaule = "Hello world!";
        this.label.string = vaule;
    }

    textChange(value, target) {
        // 值变化自动触发 setLabelString
        this._vm.label = value;
    }

    onDisable() {
        if (this._watcher) {
            this._watcher.teardown();
        }
        
    }
}
