import {EventDispatcher,Event,EventCenter} from '../src'

class Main {
    constructor() {

        let loader = new Loader();

        loader.once(Event.OPEN, (event) => {
            console.log("------- open -------");
            console.log("loader has Event.OPEN：" + loader.hasEventListener(Event.OPEN));
        }, this);

        loader.addEventListener(Event.COMPLETE, this.onComplete1, this);
        loader.addEventListener(Event.COMPLETE, this.onComplete2, this, 100);

        // 用 EventCenter 可以全局监听
        EventCenter.register(Event.CHANGE, this.onChange, this);

        loader.open();
        loader.load("a.jpg");
        loader.change();
    }

    onComplete1(event) {
        console.log("------- onComplete1 -------");

        let loader = event.target;

        console.log("event.target：" + loader.toString());
        console.log("event.type：" + event.type.toString());
        console.log("event.data：" + `size:${event.data.size} path:${event.data.path}`);

        console.log("loader has Event.COMPLETE：" + loader.hasEventListener(Event.COMPLETE));
        //移除监听器
        loader.removeEventListener(Event.COMPLETE, this.onComplete1);
        console.log("loader has Event.COMPLETE：" + loader.hasEventListener(Event.COMPLETE));
    }

    onComplete2(event) {
        console.log("------- onComplete2 --------");
        console.log("优先级被提高");
        //移除监听器
        event.target.removeEventListener(Event.COMPLETE, this.onComplete2);
    }

    onChange(event) {
        console.log("------- onChange -------");
        console.log("这是来自 EventCenter 派发的事件")
    }
}

/**
 * 创建一个EventDispatcher的子类，模拟加载器。
 * 当加调用load()方法时，延迟一段时间会派发Event.COMPLETE事件
 */
class Loader extends EventDispatcher {

    open() {
        this.dispatchEvent(new Event(Event.OPEN));
    }

    // 模拟异步加载
    load(path) {

        let self = this;

        setTimeout(() => {
            //加载完成，将加载数据封装为Event对象，派发出去。
            let evt = new Event(Event.COMPLETE, {path: path, size: '10KB'});
            self.dispatchEvent(evt);

        }, 2000);
    }

    change() {
        EventCenter.send(new Event(Event.CHANGE), this);
    }

    toString() {
        return "My name is Loader ~~";
    }
}

new Main();