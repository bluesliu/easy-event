let $listenerMap = Symbol('listenerMap');

class EasyEvent {

    constructor() {
        /**
         *
         * @type {Map<string|Symbol, Array.<Listener>>}
         */
        this[$listenerMap] = new Map();
    }

    /**
     *
     * @param {Event} event
     */
    dispatchEvent(event) {
        if(!this.hasEventListener(event.type)){
            return;
        }
        const listeners = this[$listenerMap].get(event.type);
        listeners.forEach((listener)=>{
            const {fn, thisObj} = listener;
            if(thisObj){
                fn.call(thisObj, event);
            }
            else{
                fn.call(this, event);
            }
        });
    }

    /**
     *
     * @param {string|Symbol} type
     * @param {function} listener
     * @param {{}} thisObj
     * @param {number} priority
     */
    addEventListener(type, listener, thisObj=null, priority=0) {
        if (!this.hasEventListener(type)) {
            this[$listenerMap].set(type, []);
        }

        const listeners = this[$listenerMap].get(type);

        for (let i = 0; i < listeners.length; i++) {
            if(listeners[i].fn === listener){
                //已经注册过了
                //判断是否修改了优先级
                if(listeners[i].priority !== priority){
                    listeners[i].priority = priority;
                    listeners.sort((a,b)=>{
                        return b.priority - a.priority;
                    });
                }
                return;
            }
        }

        listeners.push(new Listener(listener, thisObj, priority));
        listeners.sort((a,b)=>{
            return b.priority - a.priority;
        });
    }

    /**
     *
     * @param {string|Symbol} type
     * @param {function} listener
     */
    removeEventListener(type, listener) {
        if(!this.hasEventListener(type)){
            return;
        }

        const listeners = this[$listenerMap].get(type);
        for (let i = listeners.length-1; i >= 0 ; i--) {
            if(listeners[i].fn === listener){
                listeners.splice(i,1);
                break;
            }
        }

        if(listeners.length === 0){
            this[$listenerMap].delete(type);
        }
    }

    /**
     *
     */
    removeAll() {
        this[$listenerMap].clear();
    }

    /**
     *
     * @param {string|Symbol} type
     * @returns {Promise<boolean> | boolean}
     */
    hasEventListener(type) {
        return this[$listenerMap].has(type);
    }
}

class Listener {
    constructor(fn, thisObj, priority=0){
        this.fn = fn;
        this.thisObj = thisObj;
        this.priority = priority;
    }
}


const $type = Symbol('type');

class Event {
    /**
     *
     * @param {string|Symbol} type
     * @param {{}} data
     */
    constructor(type, data=null){
        this[$type] = type;
        this.data = data;
    }

    get type() {
        return this[$type];
    }

    clone() {
        return new Event(this.type, this.data);
    }

    toString() {
        return `${this.constructor.name}(type=${this.type.toString()}, data=${this.data})`;
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


module.exports = {Event, EventDispatcher: EasyEvent};