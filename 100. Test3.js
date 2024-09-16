function calculateNumSum(num) {
    while(num>=10){
        let product = 1;
        let strNum = num.toString();
        for (let i=0 ; i<strNum.length ; i++){
            product *= Number(strNum[i]);
        }
        num = product;
    }

    return num
    
}

let input = 989;
let result = calculateNumSum(input)

console.log(result);