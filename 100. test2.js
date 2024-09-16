function calculatePowerSum(num) {
    let strNum = num.toString();
    let sum = 0;

    for (let i = 0; i < strNum.length ; i++){
        let digit = Number(strNum[i]);
        sum += Math.pow(digit, i+1);
    }

    return sum

}

let input = 675;
let result = calculatePowerSum(input);
console.log(result);