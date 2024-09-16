function changeMoney(amountToPay, amountToPaid) {
    const banknotes = [1000, 500, 100, 50, 20, 10, 5, 2, 1]
    let change = amountToPaid - amountToPay
    let result = [];

    if (change == 0) {
        return `ไม่ต้องทอน`
    }

    if (change > 0) {

        for (i = 0; i < banknotes.length; i++) {
            let count = Math.floor(change / banknotes[i]) //Math.floor ปักเศษลง
            if (count > 0) {
                result.push(`ทอนด้วยธนาบัตร ${banknotes[i]} จำนวน ${count} ใบ/เหรียญ`)
                change -= count * banknotes[i];
            }

        }
        return result
    }

    else {
        return `เงินไม่พอ`
    }

}

console.log(changeMoney(3000, 2000));