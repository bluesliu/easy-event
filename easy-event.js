let $listenerMap = Symbol('listenerMap');
let $addEventListener = Symbol('addEventListener');

/**
 * EventDispatcher 是事件派发器类，负责进行事件的发送和侦听。
 * 通常，用户定义的类能够调度事件的最简单方法是扩展 EventDispatcher。
 * 如果无法扩展（即，如果该类已经扩展了另一个类），则可以实现 EventDispatcher 接口，
 * 创建 EventDispatcher 成员，并编写一些简单的映射，将调用连接到聚合的 EventDispatcher 中。
 */
class EventDispatcher {

    /**
     * 创建一个 EventDispatcher 类的实例。
     *
     * @param target 此 EventDispatcher 所抛出事件对象的 target 指向。
     * 此参数主要用于一个实现了 IEventDispatcher 接口的自定义类，
     * 以便抛出的事件对象的 target 属性可以指向自定义类自身。
     * 请勿在直接继承 EventDispatcher 的情况下使用此参数。
     */
    constructor(target = null) {
        /**
         * @type {Map<string|Symbol, Array.<Listener>>}
         */
        this[$listenerMap] = new Map();
        this[$target] = target;
    }

    /**
     * 派发事件
     * @param {Event} event 调度到事件流中的 Event 对象。
     */
    dispatchEvent(event) {
        if (!this.hasEventListener(event.type)) {
            return;
        }

        //设置target
        if (event[$target] === null) {
            if (this[$target] !== null) {
                event[$target] = this[$target];
            } else {
                event[$target] = this;
            }
        }

        const listenerList = this[$listenerMap].get(event.type).concat();
        listenerList.forEach((listener) => {
            const {fn, thisObj} = listener;

            if (listener.once) {
                this.removeEventListener(event.type, fn);
            }

            if (thisObj) {
                fn.call(thisObj, event);
            } else {
                fn.call(this, event);
            }
        });
    }

    /**
     * 使用 EventDispatcher 对象注册事件侦听器对象，以使侦听器能够接收事件通知。
     * @param {string|Symbol} type 事件的类型。
     * @param {function} listener 处理事件的侦听器函数。此函数必须接受 Event 对象作为其唯一的参数，并且不能返回任何结果，如下面的示例所示： function(evt:Event):void 函数可以有任何名称。
     * @param {{}} thisObj 侦听函数绑定的this对象
     * @param {number} priority 事件侦听器的优先级。优先级由一个带符号整数指定。数字越大，优先级越高。优先级为 n 的所有侦听器会在优先级为 n -1 的侦听器之前得到处理。如果两个或更多个侦听器共享相同的优先级，则按照它们的添加顺序进行处理。默认优先级为 0。
     */
    addEventListener(type, listener, thisObj = null, priority = 0) {
        this[$addEventListener](type, listener, thisObj, priority);
    }

    /**
     * 添加仅回调一次的事件侦听器，此方法与addEventListener()方法不同，addEventListener()方法会持续产生回调，而此方法在第一次回调时就会自动移除监听。
     * @param {string|Symbol} type 事件的类型。
     * @param {function} listener 处理事件的侦听器函数。此函数必须接受 Event 对象作为其唯一的参数，并且不能返回任何结果，如下面的示例所示： function(evt:Event):void 函数可以有任何名称。
     * @param {{}} thisObj 侦听函数绑定的this对象
     * @param {number} priority 事件侦听器的优先级。优先级由一个带符号整数指定。数字越大，优先级越高。优先级为 n 的所有侦听器会在优先级为 n -1 的侦听器之前得到处理。如果两个或更多个侦听器共享相同的优先级，则按照它们的添加顺序进行处理。默认优先级为 0。
     */
    once(type, listener, thisObj = null, priority = 0) {
        this[$addEventListener](type, listener, thisObj, priority, true);
    }

    [$addEventListener](type, listener, thisObj = null, priority = 0, once = false) {
        if (typeof listener !== 'function') {
            throw(new Error("指定的 listener 不是一个函数。"));
        }

        if (!this.hasEventListener(type)) {
            this[$listenerMap].set(type, []);
        }

        const listeners = this[$listenerMap].get(type);

        for (let i = 0; i < listeners.length; i++) {
            if (listeners[i].fn === listener) {
                //已经注册过了
                //判断是否修改了优先级
                if (listeners[i].priority !== priority) {
                    listeners[i].priority = priority;
                    listeners.sort((a, b) => {
                        return b.priority - a.priority;
                    });
                }
                return;
            }
        }

        listeners.push(new Listener(listener, thisObj, priority, once));
        listeners.sort((a, b) => {
            return b.priority - a.priority;
        });
    }

    /**
     * 从 EventDispatcher 对象中删除侦听器。
     * @param {string|Symbol} type 事件的类型。
     * @param {function} listener 要删除的侦听器对象。
     */
    removeEventListener(type, listener) {
        if (!this.hasEventListener(type)) {
            return;
        }

        const listeners = this[$listenerMap].get(type);
        for (let i = listeners.length - 1; i >= 0; i--) {
            if (listeners[i].fn === listener) {
                listeners.splice(i, 1);
                break;
            }
        }

        if (listeners.length === 0) {
            this[$listenerMap].delete(type);
        }
    }

    /**
     * 从 EventDispatcher 对象中删除全部侦听器。
     */
    removeAll() {
        this[$listenerMap].clear();
    }

    /**
     * 检查 EventDispatcher 对象是否为特定事件类型注册了任何侦听器。
     * @param {string|Symbol} type
     * @returns {Promise<boolean> | boolean}
     */
    hasEventListener(type) {
        return this[$listenerMap].has(type);
    }
}

class Listener {
    constructor(fn, thisObj, priority=0, once=false){
        this.fn = fn;
        this.thisObj = thisObj;
        this.priority = priority;
        this.once = once;
    }
}


const $type = Symbol('type');
const $target = Symbol('target');

class Event {
    /**
     * 创建一个作为参数传递给事件侦听器的 Event 对象。
     * @param {string|Symbol} type 事件的类型。
     * @param {{}} data 与此事件对象关联的可选数据。
     */
    constructor(type, data = null) {
        this[$type] = type;
        this.data = data;
        this[$target] = null;
    }

    /**
     * 事件的类型
     * @returns {string|Symbol}
     */
    get type() {
        return this[$type];
    }

    /**
     * 克隆
     * @returns {Event}
     */
    clone() {
        return new Event(this.type, this.data);
    }

    /**
     *
     * @returns {string}
     */
    toString() {
        return `${this.constructor.name}(type=${this.type.toString()}, data=${this.data})`;
    }

    /**
     * 事件目标
     * @returns {*}
     */
    get target() {
        return this[$target];
    }
}

Event.ADDED = Symbol('ADDED');
Event.CHANGE = Symbol('CHANGE');
Event.CLOSE = Symbol('CLOSE');
Event.CLOSING = Symbol('CLOSING');
Event.CANCEL = Symbol('CANCEL');
Event.CLEAR = Symbol('CLEAR');
Event.COMPLETE = Symbol('COMPLETE');
Event.CONNECT = Symbol('CONNECT');
Event.OPEN = Symbol('OPEN');
Event.SELECT = Symbol('SELECT');
Event.SELECT_ALL = Symbol('SELECT_ALL');


const $getInstance = Symbol('getInstance');
const $instance = Symbol('instance');
const $singleton = Symbol('singleton');

/**
 * 事件中心
 */
class EventCenter extends EventDispatcher {

    /**
     * EventCenter 是单例模式，不要试图实例化。
     * @param {Symbol} symbol
     */
    constructor(symbol) {
        if (symbol !== $singleton) {
            throw(new Error("不能实例化 EventCenter 类，因为 EventCenter 是单例模式，请使它的静态方法。"));
        }
        super();
    }

    /**
     * 获得 EventCenter 的单例
     * @returns {EventCenter}
     */
    static get [$getInstance]() {
        if (EventCenter[$instance] === undefined) {
            EventCenter[$instance] = new EventCenter($singleton);
        }
        return EventCenter[$instance];
    }

    /**
     *
     * @param {string|Symbol} type
     * @param {function} listener
     * @param {{}} thisObj
     * @param {number} priority
     */
    static register(type, listener, thisObj = null, priority = 0) {
        EventCenter[$getInstance].addEventListener(type, listener, thisObj, priority);
    };

    /**
     *
     * @param {string|Symbol} type
     * @param {function} listener
     */
    static unregister(type, listener) {
        EventCenter[$getInstance].removeEventListener(type, listener);
    }

    /**
     *
     * @param {Event} event
     * @param {{}} target
     */
    static send(event, target = null) {

        //设置target
        if (target !== null && target !== undefined) {
            event[$target] = target;
        }

        EventCenter[$getInstance].dispatchEvent(event);
    }
}



module.exports = {Event, EventDispatcher, EventCenter};