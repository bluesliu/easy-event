const {Event, EventDispatcher} = require('./easy-event');


class Main {
    constructor(){
        this.loader = new Loader();

        //调用加载方法
        this.loader.load('a.jpg');

        //注册监听器
        this.loader.addEventListener(Event.COMPLETE, this.onComplete, this);

        console.log("loader hasEventListener："+this.loader.hasEventListener(Event.COMPLETE));
    }

    onComplete(event){
        console.log("event.type："+ event.type.toString());
        console.log("event.data："+ JSON.stringify(event.data));

        //移除监听器
        this.loader.removeEventListener(Event.COMPLETE, this.onComplete);

        console.log("loader hasEventListener："+this.loader.hasEventListener(Event.COMPLETE));
    }
}

/**
 * 创建一个EventDispatcher的子类，模拟加载器。
 * 当加调用load()方法时，延迟一段时间会派发Event.COMPLETE事件
 */
class Loader extends EventDispatcher {

    // 模拟异步加载
    load(path){
        let self = this;

        setTimeout(()=>{

            //加载完成，将加载数据封装为Event对象，派发出去。
            let evt = new Event(Event.COMPLETE, {path:path, size:'10KB', data:'data...'});
            self.dispatchEvent(evt);

        }, 2000);
    }
}

new Main();