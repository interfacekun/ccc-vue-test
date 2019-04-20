import * as _u from './VueUtils';
import Set from './Set';

import Dep, {
    pushTarget,
    popTarget
} from './dep'

let uid = 0

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
export default class Watcher {
    express;
    vm: Vue;
    id: number;

    deps: Array < Dep > ;
    newDeps: Array < Dep > ;
    depIds: Set;
    newDepIds: Set;
    deep: boolean;
    active: boolean;
    before?:  Function;
    getter: Function;
    target: any;
    expression: string | Function;
    oldArrayLength: number;
    cb: (value: any, oldValue: any) => void;
    value: any;
    /**
     *Creates an instance of Watcher.
     * @param {Vue} vm
     * @param {(value, oldValue) => void} cb 值改变会自动执行该回调函数
     * @param {*} 执行回调函数的target，防止this被吞噬
     * @memberof Watcher
     */
    constructor(
        vm: Vue,
        cb: (value, oldValue) => void,
        target: any,
    ) {
        this.express = [];
        this.vm = vm
        this.target = target;

        this.cb = cb
        this.id = ++uid

        this.deps = []
        this.newDeps = []
        this.depIds = new Set()
        this.newDepIds = new Set()
        this.oldArrayLength = 0;
        
        pushTarget(this)
        this.active = true;
        // this.value = this.get();
    }

    init() {
        this.value = this.get();
        this.cb.call(this.target, this.value);
    }

    /**
     * Evaluate the getter, and re-collect dependencies.
     */
    get() {
        // pushTarget(this)
        popTarget();
        let value
        const vm = this.vm
        try {
            if (!this.value) {
                if (!this.getter) {
                    this.getter = _u.parsePathFromArray(this.express);
                }
                value = this.getter.call(vm, vm);
                if (Array.isArray(value)) {
                    this.oldArrayLength = value.length;
                }
                this.value = value;
            }
        } catch (e) {

        } finally {
            // "touch" every property so they are all tracked as
            // dependencies for deep watching
            if (this.deep) {
                _u.traverse(value)
            }
            this.cleanupDeps()
        }
        
        return value
    }

    set(value) {
        this.value = value;
    }

    popTarget() {
        popTarget();
    }

    /**
     * Add a dependency to this directive.
     */
    addDep(dep: Dep) {
        const id = dep.id
        // console.warn("addDep", dep.id);
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id)
            this.newDeps.push(dep)
            if (!this.depIds.has(id)) {
                dep.addSub(this)
            }
        }
    }

    /**
     * Clean up for dependency collection.
     */
    cleanupDeps() {

        let i = this.deps.length
        while (i--) {
            const dep = this.deps[i]
            if (!this.newDepIds.has(dep.id)) {
                dep.removeSub(this)
            }
        }
        let tmp: any = this.depIds;
        this.depIds = this.newDepIds
        this.newDepIds = tmp
        this.newDepIds.clear()
        tmp = this.deps;
        this.deps = this.newDeps
        this.newDeps = tmp
        this.newDeps.length = 0

    }

    /**
     * Subscriber interface.
     * Will be called when a dependency changes.
     */
    update() {
        this.run()
    }

    /**
     * Scheduler job interface.
     * Will be called by the scheduler.
     */
    run() {
        const oldValue = this.value;
        let arrayUpdate = false;
        const value = this.getter.call(this.vm, this.vm);
        // console.warn("Watcher run", value, oldValue);
        if (Array.isArray(value)) {
            if (value.length !== this.oldArrayLength) {
                arrayUpdate = true;
                this.oldArrayLength = value.length;
            }
        }
        if ((arrayUpdate || value !== oldValue) && this.target) {

            try {
                this.value = value;
                this.cb.call(this.target, value, oldValue);
            } catch (e) {
            }

        }
    }

    /**
     * Evaluate the value of the watcher.
     * This only gets called for lazy watchers.
     */
    // evaluate() {
    //     this.value = this.get()
    //     this.dirty = false
    // }

    /**
     * Depend on all deps collected by this watcher.
     */
    depend() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].depend()
        }
    }

    /**
     * Remove self from all dependencies' subscriber list.
     */
    teardown() {
        if (this.active) {
            // remove self from vm's watcher list
            // this is a somewhat expensive operation so we skip it
            // if the vm is being destroyed.

            let i = this.deps.length
            while (i--) {
                this.deps[i].removeSub(this)
            }
            this.active = false
        }
    }
}