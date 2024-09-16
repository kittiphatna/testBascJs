// function removeTrailingExclamationMark(str) {
//     return str.replace(/!+$/, '');
//   }
  
//   let stringWithExclamation = "Hello W!orld!!!";
//   let cleanedString = removeTrailingExclamationMark(stringWithExclamation);
  
//   console.log(cleanedString); 

  
// ฟังก์ชัน replace ใช้ Regular Expression /!+$/ ซึ่งหมายถึง:
// !+ หมายถึง "เครื่องหมาย '!' หนึ่งตัวหรือมากกว่า"
// $ หมายถึง "ที่ส่วนท้ายของสตริง"


let input = "Hello W!orld!!!"

function removeMask(input){
    return input.replace(/!+$/, '');
}

let cleanedString = removeMask(input);
console.log(cleanedString);
