function diffArray(arr1, arr2) {
    let combineArr = arr1.concat(arr2);
    let diff = combineArr.filter(item => !arr1.includes(item) || !arr2.includes(item));

    //filter จะคืนค่าเฉพาะ T เท่านั้น 
    //เงื่อนไขคือนำ item (item คือ ข้อมูลที่อยู่ใน combineArr) มาตรวจสอบว่าอยู่ใน Arr1 หรือไม่ ถ้าอยู่จะเป็น T และนำมาตรวจสอบกับ Arr2 อีกที ถ้าอยู่จะได้ผลเป็น T filter ก็จะทำงาน

    return diff.sort((a, b) => a - b);

    // sort เป็นฟังชันเปรียบเทียบค่า 2 ค่า และจะทำวนจนกว่าจะเรียบตำแหน่งกันเสร็จ
}

console.log(diffArray([1, 2, 3], [100, 2, 1, 10]))