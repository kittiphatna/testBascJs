function textMid(str){
    let length = str.length
    let middle = length/2

    if(length%2 == 0){
        return str[middle-1] + str[middle]

    }else{
        return str[middle-0.5]
    }
}

console.log(textMid("test"));
console.log(textMid("testing"));
console.log(textMid("tnrrgrr"));
