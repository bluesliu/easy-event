# easy-event

`easy-event` 是一个简单易用的事件模块。提供了3个类：`Event`、`EventDispatcher` 和 `EventCenter`。 

`Event` 类作为创建事件实例的基类，当发生事件时，`Event` 对象将作为参数传递给事件侦听器。`Event` 类的属性包含有关事件的基本信息。

`EventDispatcher` 是事件派发器类，负责进行事件的发送和侦听。通常，用户定义的类能够调度事件的最简单方法是扩展 `EventDispatcher`。

`EventCenter` 是一个全局的事件监听器，调用它的静态方法 `EventCenter.register()` 注册事件，然后可以在代码的任何地方调用 `EventCenter.send()` 派发事件。这种方式派发事件非常灵活，但是不便于日后的维护，一般用于监听系统的全局事件。

## Install

```$xslt
npm i easy-event
```

## Demo

```javascript
const {Event, EventDispatcher, EventCenter} = require('./easy-event');


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
```

## Output

```javascript
------- open -------
loader has Event.OPEN：false
------- onChange -------
这是来自 EventCenter 派发的事件
------- onComplete2 --------
优先级被提高
------- onComplete1 -------
event.target：My name is Loader ~~
event.type：Symbol(COMPLETE)
event.data：size:10KB path:a.jpg
loader has Event.COMPLETE：true
loader has Event.COMPLETE：false
```

## API

### Event

`Event` 类作为创建事件实例的基类，当发生事件时，`Event` 实例将作为参数传递给事件侦听器。`Event` 类的属性包含有关事件的基本信息。您可以通过扩展 `Event` 类，将此类其他信息传递给事件侦听器。

#### 公共属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `type` | `string` | `[只读]` 事件的类型 |
| `target` | `object` | `[只读]` 事件目标 |
| `data` | `object` | 与此事件对象关联的可选数据 |

#### 公共方法

| 方法 |
| --- |
| Event ( type :`string`, data ? :`object` ) : `Event` <br> 创建一个作为参数传递给事件侦听器的 `Event` 对象 |
| clone() : `Event` <br> 复制该对象 |
| toString() : `string` <br> 转换为字符串 |


### EventDispatcher

`EventDispatcher` 是事件派发器类，负责进行事件的发送和侦听。通常，用户定义的类能够调度事件的最简单方法是扩展 `EventDispatcher`。如果无法扩展（即，如果该类已经扩展了另一个类），则可以创建 `EventDispatcher` 成员，并编写一些简单的映射，将调用连接到聚合的 `EventDispatcher` 中。

#### 公共方法

| 方法       |
| --------   |
| EventDispatcher ( target ? :`object` ) : `EventDispatcher` <br> 创建一个 `EventDispatcher` 类的实例 |
| addEventListener ( type :`string`, listener :`function`, thisObj ? :`object`, priority ? :`number` ) : `void` <br> 使用 `EventDispatcher` 对象注册事件侦听器对象，以使侦听器能够接收事件通知 |
| dispatchEvent ( event : `Event` ) : `void` <br> 派发事件 |
| hasEventListener ( type :`string` ) : `boolean` <br> 检查 `EventDispatcher` 对象是否为特定事件类型注册了任何侦听器 |
| once ( type :`string`, listener :`function`, thisObj ? :`object`, priority ? :`number` ) : `void` <br> 添加仅回调一次的事件侦听器，此方法与addEventListener()方法不同，addEventListener()方法会持续产生回调，而此方法在第一次回调时就会自动移除监听 |
| removeEventListener ( type :`string`, listener :`function`) : `void` <br> 从 `EventDispatcher` 对象中删除侦听器 |
| removeAll () : `void` <br> 从 `EventDispatcher` 对象中删除全部侦听器 |


### EventCenter

`EventCenter` 是一个全局的事件监听器，调用它的静态方法 `EventCenter.register()` 注册事件，然后可以在代码的任何地方调用 `EventCenter.send()` 派发事件。这种方式派发事件非常灵活，但是不便于日后的维护，一般用于监听系统的全局事件。

#### 公共方法

| 方法        |
| --------   |
| `[静态]` register ( type :`string`, listener :`function`, thisObj ? :`object`, priority ? :`number` ) : `void` <br> 注册事件侦听器对象，以使侦听器能够接收事件通知 |
| `[静态]` send ( event : `Event`, target ? :`object` ) : `void` <br> 派发事件 |
| `[静态]` unregister ( type :`string`, listener :`function`) : `void` <br> 删除侦听器 |



