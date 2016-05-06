function createClass (constructor, protoProp, staticProp, Super) {
    Super = Super || Object;
    var Class = constructor;
    Object.setPrototypeOf(Class, Super);
    Class.prototype = Object.create(Super.prototype, {
        "constructor": { configurable: true, enumerable: false, writable: true, value: Class }
    });
    Object.keys(protoProp).forEach(function (i) { Class.prototype[i] = protoProp[i]; });
    Object.keys(staticProp).forEach(function (i) { Class[i] = staticProp[i]; });
    return Class;
}
var Class = createClass(function () {}, {}, {
    extends: function (constructor, protoProp, staticProp) {
        return createClass(constructor, protoProp, staticProp, this);
    }
});

//test util:
function assert (condition, errMsg, noSuccessTip) {
    errMsg = errMsg || "";
    if (condition !== true) {
        console.log("❌  "  + errMsg);
        console.trace();
    } else if (!noSuccessTip) {
        console.log("✅  " + errMsg);
    }
}

function assertInherit (to, from, key, message) {
    assert(!to.hasOwnProperty(key) && from.hasOwnProperty(key) && to[key] === from[key], 
        message || "to从from上原型继承" + key + "属性", 
        !message);
}
function assertNoInherit (to, from, key, message) {
    assert(from.hasOwnProperty(key) && to.hasOwnProperty(key),
        message || "to没有从from上原型继承" + key + "属性",
        !message);
}

function assertConstructor (o, C, noSuccessTip) {
    assert(o.constructor === C, "实例constructor值正确", noSuccessTip);
}
/**
 * @param o
 * @param [noSuccessTip=false]
 * @param C {...Function}
 */
function assertInstanceOf (o, noSuccessTip, C) {
    var list = [].slice.call(arguments, 2);
    if (typeof noSuccessTip === "function") {
        list.unshift(noSuccessTip);
        noSuccessTip = false;
    }
    assert(list.every(function (C) {
        return o instanceof C;
    }), "构造函数链上均可正确应用instanceOf", noSuccessTip);
}
function assertAncestorClass (Descendant, Ancestor, noSuccessTip) {
    assert(Descendant !== Ancestor && Ancestor.isPrototypeOf(Descendant), "Descendant应是Ancestor的后代类", noSuccessTip);
}
function assertDescendantInstance (o, C, noSuccessTip) {
    assertAncestorClass(o.constructor, C, noSuccessTip);
}

function assertInheritFromClass (o, C, key) {
    assertConstructor(o, C, true);
    assertInherit(o, C.prototype, key, "实例正确从类原型继承属性");
}

function assertInstanceInherit (o, C, key) {
    assertDescendantInstance(o, C, true);
    assertInherit(o, C.prototype, key, "后代类实例正确获取继承属性");
}
function assertStaticInherit (o, C, key) {
    assertDescendantInstance(o, C, true);
    assertInherit(o.constructor, C, key, "后代类构造函数上正确继承祖先类静态属性");
}

function assertInstanceOverwrite (o, C, key) {
    assertDescendantInstance(o, C, true);
    assertNoInherit(o.constructor.prototype, C.prototype, key, "子类原型上重写了祖先类原型上属性");
}
function assertStaticOverwrite (o, C, key) {
    assertDescendantInstance(o, C, true);
    assertNoInherit(o.constructor, C, key, "子类上重写了祖先类上属性");
}

//test:
var Anim = Class.extends(function () {
}, {a: 'anim'}, {A: 'Anim'});
var Person = Anim.extends(function (name) {
    this.name = name || "";
}, {
    sayHello: function () { return "☺"; },
    die: function () { return "☠"; }
}, {
    war: function () { return "⚒"; }
});
var Chinese = Person.extends(function (familyName, name) {
    Person.call(this, familyName + name);
}, {
    sayHello: function () { return "你好"; }
}, {
    war: function () { return "民不聊生"; }
});

console.log("\n--Anim--");
var a = new Anim();
assertConstructor(a, Anim);
assertInstanceOf(a, Anim, Object);
assertInheritFromClass(a, Anim, 'a');

console.log("\n--Person--");
var p = new Person("p");
assertConstructor(p, Person);
assertInstanceOf(p, Person, Anim, Object);
assertInstanceInherit(p, Anim, 'a');
assertStaticInherit(p, Anim, 'A');
assert(p.name === 'p', "构造函数初始化参数正确");

console.log("\n--Chinese--");
var c = new Chinese("lv", "sheng");
assertConstructor(c, Chinese);
assertInstanceOf(c, Chinese, Person, Anim, Object);
assertInstanceInherit(c, Anim, 'a');
assertStaticInherit(c, Anim, 'A');
assert(c.name === 'lvsheng', "构造函数初始化参数正确");
assertInstanceOverwrite(c, Person, 'sayHello');
assertInstanceInherit(c, Person, 'die');
assertStaticOverwrite(c, Person, 'war');

[
    new Anim(),
    new Person("person1"),
    new Chinese("lv", "sheng")
].forEach(function (each) {
        var EachClass = each.constructor;
        console.log("\n-------");
        console.log("each:", each);
        console.log("each.a:", each.a);
        console.log("EachClass.A:", EachClass.A);
        console.log("each.name:", each.name);
        console.log("each.die(no overwrite):", each.die && each.die());
        console.log("each.sayHello(overwrite):", each.sayHello && each.sayHello());
        console.log("EachClass.war(overwrite):", EachClass.war && EachClass.war());
    });
