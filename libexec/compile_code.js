#!/usr/bin/env node
const fs = require("fs");

const args = process.argv.slice(2);

var data = fs.readFileSync(args[0]).toString();

var str = "";
for(var i=0; i < data.length/2; i++) {
  let pos = i.toString(16);
  if(pos.length % 2 === 1) pos = "0" + pos;
  str += `code N_${pos}  N_${data[i*2]+data[i*2+1]}  *\n`;
}

console.log(str);
