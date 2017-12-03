#!/usr/bin/env node
const fs = require("fs");

const args = process.argv.slice(2);

const opcodes = fs
  .readFileSync(__dirname + "/evm.csv")
  .toString()
  .split("\n")
  .filter(e => e !== "")
  .map(e => e.split(" "))
  .reduce((a,[k, v]) => {a[k] = v; return a;}, {});
var data = fs.readFileSync(args[0]).toString().trim()+"00";

let toHex = dec =>  {
  let pos = dec.toString(16);
  if(pos.length % 2 === 1) pos = "0" + pos;
  return pos;
}

var str = "";
for(var i=0; i < data.length/2; i++) {
  let pos = toHex(i);
  let opcode = data[i*2]+data[i*2+1];
  str += `code N_${pos}  N_${opcode}  *   % ${opcodes[opcode]}\n`;

  // PUSH_X
  if( (data[i*2] === "6") || data[i*2] === "7" ) {
    let nextPos = toHex(i+1);
    let push_amount = parseInt(opcode, 16) - 95;
    str += `code N_${nextPos}  ${opcode === "60" ? "N" : "A"}_${data.slice((i+1)*2, (i+1+push_amount)*2)}  * \n`;
    i += push_amount;
  }
}

console.log(str);
