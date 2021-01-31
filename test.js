function isObjectEqual(object1, object2) {
    console.log(object1.name === object2.name);
}

let emptArr = new Array(1);

let object = {
    name : "arf",
    age : 23
}

let o = {
    name : "arf",
    age : 28
}

emptArr.push(object)
emptArr.push(o)
console.log(emptArr)
isObjectEqual(object,o)