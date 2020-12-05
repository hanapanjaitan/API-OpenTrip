// function babi(arr) {
//     let targetO = 0
//     let targetX = 0
//     let awalX = 0
//     let kosong = 0
//     let jarak = 0
//     let isiX = []
//     let jarakArr = []
//     let counter = 0

//     for (i=0; i<arr.length; i++){
//         if(arr[i] == 'o'){
//             targetO = i
//         }else if(arr[i] == 'x'){
//             awalX = i
//             // counter ++
//             // jarak = Math.abs(targetO - awalX)
//             // // if(jarak)
//             isiX.push(i)
//         }else{
//             kosong = 0
//         }
        
//     }

//     for (j=0; j<isiX.length; j++){
//         jarak = Math.abs(targetO - targetX[i])
//         jarakArr.push(jarak)
//     }
//     console.log(isiX)
//     console.log(jarakArr)
//     return targetX-targetO+kosong

// }
// console.log(babi(['x', ' ', ' ', ' ', 'x', ' ', 'o', ' ']))
// console.log(babi([' ', ' ', 'o', ' ', 'x', ' ', 'x', ' ']))

// function kali(num) {
//     let counter = 1
//     let hasil = []

//     do {
//         if(num%counter == 0){
//             // console.log(num%counter)
//             hasil.push(`${counter}x${num/counter}`)
//         }

//         counter++
//     } while (counter <= num);
//     return hasil
// }

// console.log(kali(24))
// console.log(kali(90))
// console.log(kali(20))
// console.log(kali(179))
// console.log(kali(1))

var val = Math.floor(1000 + Math.random() * 9000);
console.log(val);