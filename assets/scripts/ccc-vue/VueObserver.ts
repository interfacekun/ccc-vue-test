import Dep from './Dep';
import * as _u from './VueUtils';
import {
    arrayMethods
} from './array';
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

function protoAugment(target, src: Object) {
    /* eslint-disable no-proto */
    target.__proto__ = src
    /* eslint-enable no-proto */
}

function copyAugment(target: Object, src: Object, keys: Array < string > ) {
    for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i]
        _u.def(target, key, src[key])
    }
}

export default class Observer {
    value: any = null;
    dep: Dep = null;
    constructor(value: any) {
        this.value = value
        this.dep = new Dep()
        _u.def(value, '__ob__', this)
        if (Array.isArray(value)) {
            if (_u.hasProto) {
                protoAugment(value, arrayMethods)
            } else {
                copyAugment(value, arrayMethods, arrayKeys)
            }
            // 性能问题，不walk数组;
            this.observeArray(value);
        } else {
            this.walk(value)
        }
    }

    observeArray(items: Array < any > ) {
        for (let i = 0, l = items.length; i < l; i++) {
            observe(items[i])
        }
    }

    walk(obj: Object) {
        const keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i])
        }
    }

}

// 我添加的这个，有性能问题欢迎探讨 add by sikun；
function walkArray(items: Array < any >, Dep) {
    for (let i = 0, l = items.length; i < l; i++) {
        let obj = items[i];
        Object.defineProperty(items, i, {
            enumerable: true,
            configurable: true,
            get: function reactiveGetter() {
                if (Dep.target) {
                    Dep.target.express.push(i);
                }

                // console.warn("dddddddddd11", i);
                return obj;
            },
            set: function reactiveSetter(value) {
                obj = value;
                observe(obj);
            }
        })
    }
}

function dependArray(value: Array < any > ) {
    for (let e, i = 0, l = value.length; i < l; i++) {
        e = value[i]
        e && e.__ob__ && e.__ob__.dep.depend()
        if (Array.isArray(e)) {
            dependArray(e)
        }
    }
}

/**
 * Define a reactive property on an Object.
 */
export function defineReactive(
    obj: Object,
    key: string,
    val ? : any,
    customSetter ? : Function,
    shallow ? : boolean
) {
    const dep = new Dep()

    const property = Object.getOwnPropertyDescriptor(obj, key)
    if (property && property.configurable === false) {
        return
    }

    // cater for pre-defined getter/setters
    const getter = property && property.get
    const setter = property && property.set
    if ((!getter || setter) && arguments.length === 2) {
        val = obj[key]
    }

    let childOb = !shallow && observe(val)
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter() {
            const value = getter ? getter.call(obj) : val
            if (Dep.target) {
                dep.depend()
                
                if (childOb) {
                    childOb.dep.depend()
                    if (Array.isArray(value)) {
                        dependArray(value)
                    }
                }
                // 捕获数组索引 add by sikun
                if (Array.isArray(value)) {
                    walkArray(value, Dep);
                }
                Dep.target.express.push(key);
            }
            return value
        },
        set: function reactiveSetter(newVal) {
            const value = getter ? getter.call(obj) : val
            /* eslint-disable no-self-compare */
            if (newVal === value || (newVal !== newVal && value !== value)) {
                return
            }
            // /* eslint-enable no-self-compare */
            // if (process.env.NODE_ENV !== 'production' && customSetter) {
            //     customSetter()
            // }
            // #7981: for accessor properties without setter
            if (getter && !setter) return
            if (setter) {
                setter.call(obj, newVal)
            } else {
                val = newVal
            }
            childOb = !shallow && observe(newVal)
            dep.notify()
        }
    })
}

export function observe(value: any, asRootData ? : boolean): Observer | void {
    if (!_u.isObject(value)) {
        return
    }
    let ob: Observer | void
    if (_u.hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__
    } else if (
        (Array.isArray(value) || _u.isPlainObject(value)) &&
        Object.isExtensible(value) &&
        !value._isVue
    ) {
        ob = new Observer(value)
    }
    return ob
}