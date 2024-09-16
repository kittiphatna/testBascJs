
function newText(str){
    let text = "";

    for(let i = 0; i<str.length; i++){
        let currentText = str[i];       
        
        for(let j = 0; j<i; j++){
            currentText += str[i];
        }
        if(i>0){
            text += "-";
        }

        text += currentText;
        
    }
    return text;
}

console.log(newText("stlo"));