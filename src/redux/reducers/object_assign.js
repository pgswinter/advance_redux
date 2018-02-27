function test() {
  'use strict';

  let obj1 = { a: 0 , b: { c: 0}};
  let obj2 = Object.assign({}, obj1);

  // Deep Clone. Sử dụng JSON.parse để copy object mà không thay đổi giá trị từ object 1
  obj2 = JSON.parse(JSON.stringify(obj1));

  // Clone bình thường
  obj1.a = 1
  obj2.a = 2

  // Deep Clone. Sử dụng JSON.parse để copy object mà không thay đổi giá trị từ object 1
  obj2.b.c = 3

  console.log(obj1);
  console.log(obj2);
  console.log(JSON.stringify(obj1));
  console.log(JSON.stringify(obj2));

}

test();

console.log("Merging objects")

var o1 = { a: 1 };
var o2 = { b: 2 };
var o3 = { c: 3 };

console.log(o1);

var obj = Object.assign(o1, o2, o3);
console.log(obj);
console.log(o1); // đối tượng o1 đã bị thay đổi
console.log(o2);
console.log(o3);

console.log("Merging objects with same properties")

var o1 = { a: 1, b: 1, c: 1 };
var o2 = { b: 2, c: 2, d: 4 };
var o3 = { c: 3 };

var obj = Object.assign({}, o1, o2, o3); // Sử dụng thêm 1 oject rỗng "{}" để tránh bị thay đổi o1
console.log(obj)
console.log(o1)
console.log(o2)
console.log(o3)

// Các thuộc tính bị ghi đè bởi những đối tượng khác. Những đối tương này
// có cùng thuộc tính sau khi merge

//  Copy loại thuộc tính ký tự symbold-typed

console.log("Copying symbol-typed properties");

var o1 = { a: 1 };
var o2 = { [Symbol('foo')]: 2 };

var obj = Object.assign({}, o1, o2);
console.log(obj);

// Lấy các thuộc tính loại symbol trong mảng đã được merge
Object.getOwnPropertySymbols(obj);
console.log(Object.getOwnPropertySymbols(obj));

console.log("Properties on the prototype chain and non-enumerable properties cannot be copied")

var obj = Object.create(
  { foo: 1 }, 
  { // foo is on obj's prototype chain. Đối tượng nằm trong mắt xích prototype
    bar: {
      value: 2 , // bar is a non-enumerable property. Thuộc tính không đếm đượ. Đây là mặc định DEFAULT
    },
    baz: {
      value: 3,
      enumerable: true  // baz is an own enumerable property. SET thêm enumerable: true để trở thành đếm được
    }
  }
);

var copy = Object.assign({}, obj);
console.log(copy); // { baz: 3 }

console.log("Primitives will be wrapped to objects")

var v1 = 'abc'; // abc sẽ trở thành {"0":"a","1":"b","2":"c"}
var v2 = true;
var v3 = 10;
var v4 = Symbol('foo');
var o2 = { [Symbol('foo')]: 2 }; // có sẵn thuộc tính đếm
var o2_1 = { 2: [Symbol('foo')]  }; // ghi đè chơi thôi : ))

var obj = Object.assign({}, v1, null, v2, undefined, v3, v4, o2, o2_1); 
// Primitives will be wrapped, null and undefined will be ignored.
// Note, only string wrappers can have own enumerable properties.
console.log(obj)
console.log(JSON.stringify(obj)); // { "0": "a", "1": "b", "2": "c" }

console.log("Exceptions will interrupt the ongoing copying task")

var target = Object.defineProperty({}, 'foo', {
  value: 1,
  writable: false
}); // target.foo is a read-only property

/* 
Object.assign(target, { bar: 2 }, { foo2: 3, foo: 3, foo3: 3 }, { baz: 4 });
// TypeError: "foo" is read-only
// The Exception is thrown when assigning target.foo

console.log(target.bar);  // 2, the first source was copied successfully.
console.log(target.foo2); // 3, the first property of the second source was copied successfully.
console.log(target.foo);  // 1, exception is thrown here.
console.log(target.foo3); // undefined, assign method has finished, foo3 will not be copied.
console.log(target.baz);  // undefined, the third source will not be copied either.
*/
console.log("Copying accessors")

var obj = {
  foo: 1,
  get bar() {
    return 2;
  }
};

var copy = Object.assign({}, obj);
console.log(copy); 
// { foo: 1, bar: 2 }, the value of copy.bar is obj.bar's getter's return value.

// This is an assign function that copies full descriptors
function completeAssign(target, ...sources) {
  sources.forEach(source => {
    let descriptors = Object.keys(source).reduce((descriptors, key) => {
      descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
      return descriptors;
    }, {});
    // by default, Object.assign copies enumerable Symbols too
    Object.getOwnPropertySymbols(source).forEach(sym => {
      let descriptor = Object.getOwnPropertyDescriptor(source, sym);
      if (descriptor.enumerable) {
        descriptors[sym] = descriptor;
      }
    });
    Object.defineProperties(target, descriptors);
  });
  return target;
}

var copy = completeAssign({}, obj);
console.log(copy);
// { foo:1, get bar() { return 2 } }