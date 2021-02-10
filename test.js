let arr = [1,2,3,4,5,6]
let arr2 = []

    if (arr2[0] !== arr[0]) { //position has been changed

        const found = arr2.findIndex(element => arr[0] === element) //first index
        let changed = arr2.slice(0, found);
        console.log(changed)

        arr2 = arr
    }

