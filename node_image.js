const fs = require('fs');

const rst = fs.readFileSync('./images/wxtra.jpeg');

const u8  = new Uint8Array(rst.buffer);

console.log(u8.length);