function sortOdds(arr) {
    let odds = arr.filter(x => x % 2 !== 0);
    //ดึงข้อมูลเลขคี่ออกมาให้อยู่ในตัวแปร odds

    odds.sort((a, b) => a - b)
    //เรียงลำดับค่าน้อยไปมากของ odds

    indexOdds = 0;
    //กำหนดตำแหน่งของ odds เพื่อที่จพดึงมาใช้

    return arr.map(x => {
        if (x % 2 !== 0) {
            return odds[indexOdds++]

            //ถ้าค่าใน arr หารไม่ลงตัว (ก็คือถ้าตำแหน่งนั้นเป็นเลขคี่) จะ return ค่าที่อยู่ใน odds ตำแหน่งที่ 0 โดยที่ครั้งถัดไปจะ + ตน ไป 1
        }

        else {
            return x;
        }
    }
    );
}

console.log(sortOdds([5, 8, 6, 3, 4]));