function createClass (constructor, protoProp, staticProp, Super) {
    Super = Super || null;

    var Class = Object.create(Super);
    Class.constructor = constructor;
    Class.constructor.prototype = Object.create(Super && Super.constructor.prototype || null, {
        "constructor": { configurable: true, enumerable: false, writable: true, value: Class }
    });
    Object.keys(protoProp).forEach(function (i) { Class.constructor.prototype[i] = protoProp[i]; });
    Object.keys(staticProp).forEach(function (i) { Class[i] = staticProp[i]; });
    return Class;
}
var Class = createClass(function () {}, {}, {
    create: function () { return new this.constructor() }, //TODO: 参数传递 另外，为了让子类能直接借用构造函数，这里create无法做额外工作甚至可以不需要
    extends: function (constructor, protoProp, staticProp) {
        return createClass(constructor, protoProp, staticProp, this);
    }
});

function test () {
    var Anim = Class.extends(function () {
    }, {a: 'anim'}, {A: 'Anim'});
    var Person = Anim.extends(function (name) {
        this.name = name || "no Name";
    }, {
        sayHello: function () { return "👋"; },
        die: function () { return "die"; }
    }, {
        war: function () { return "☠"; }
    });
    var Chinese = Person.extends(function (familyName, name) {
        Person.constructor.call(this, familyName + name);
    }, {
        sayHello: function () { return "你好"; }
    }, {
        war: function () { return "民不聊生"; }
    });

    var a = Anim.create();
    assert(a.a === 'anim');
    assert(a.constructor === Anim);
    //assert(a instanceof Anim); //FIXME: Error: instanceof 只支持函数, 故此处失效
    
    var p = Person.create("p");
    assert(p.a === 'anim');
    assert(p.constructor === Person);
    //assert(p instanceof Anim); //FIXME: Error: instanceof 只支持函数, 故此处失效
    //assert(p.name === 'p'); //FIXME: Error: 缺少参数传递

    [
        Person.create("p"),
        Chinese.create("c")
    ].forEach(function (each) {
            var EachClass = each.constructor;
            console.log("\n-------");
            console.log(each);
            console.log(each.a);
            console.log(each.name);
            console.log(EachClass.A);
            each.die && each.die();
            each.sayHello && each.sayHello();
            EachClass.war && EachClass.war();
        });
}
function assert (condition, errMsg) {
    if (condition !== true) throw errMsg || "Error!";
}
test();