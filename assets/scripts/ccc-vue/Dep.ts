/* @flow */

import * as _u from './VueUtils';

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
    static target?: Watcher;
    id: number;
    subs: Array < Watcher > ;
    express = [];

    constructor() {
        this.id = uid++
        this.subs = [];
    }

    addSub(sub: Watcher) {
        this.subs.push(sub)
        // console.warn("addSub", JSON.stringify(this.subs));
    }

    removeSub(sub: Watcher) {
        _u.remove(this.subs, sub)
    }

    depend() {
        
        if (Dep.target) {
            // console.warn("dependdependdependdependdepend");
            Dep.target.addDep(this)
        }
    }

    notify() {
        // stabilize the subscriber list first
        // console.warn("notify", JSON.stringify(this.subs));
        const subs = this.subs.slice();

        // console.warn("notify", JSON.stringify(this.subs));

        subs.sort((a, b) => a.id - b.id)
        for (let i = 0, l = subs.length; i < l; i++) {
            subs[i].update()
        }
    }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
const targetStack = []

export function pushTarget(target?: Watcher) {
    // targetStack.push(target)
    Dep.target = target
}

export function popTarget() {
    // targetStack.pop()
    Dep.target = null;
}