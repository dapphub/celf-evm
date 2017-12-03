#!/usr/bin/env node
const fs = require("fs");
const args = process.argv.slice(2);
const BN = require('bn.js');
const colors = require('colors');

var data = fs.readFileSync(args[0]).toString();
var src = args[1] && fs.readFileSync(args[1]).toString() || "";
const evm = fs.readFileSync(__dirname+"/evm.csv")
.toString()
.split("\n")
.map(e => e.split(" "))
.reduce((a, e) => {a[e[0]] = e[1]; return a;},{});

if(data.indexOf("-5-") > -1) {
  data = data.slice(data.indexOf("-5-")+3);
} else {
  data = data.slice(data.indexOf("\n\n")+2);
}
if(data.indexOf("----") > -1) data = data.slice(0, data.indexOf("----"));
if(data.indexOf("Success") > -1) data = data.slice(0, data.indexOf("Success"))

var traces = data.split("\n\n");
// traces = traces.slice(0, traces.length -1 );

data = traces.map(function (val, i) {
  let ctxArray = val
    .split(",")
    .map(e => e.trim())
    .filter(e => !((/^code/).test(e)))
    .filter(e => !((/:neq/).test(e)))
    .filter(e => !((/:eq/).test(e)))
    .map(e => e.replace(/\(i\W!/g,"i"))
    .map(e => e.replace(/\(o\W!/g,"o"))
    .map(e => e.replace(/\(s\W!/g,"s"))
    .map(e => e.replace(/\Wlin/,""))
    .map(e => e.replace(/e\)+/g,""))
    .map(e => e.replace(/\W(s+)e/g, (m, v) => {
      return " "+(v.length).toString();
    }))
    .map(e => e.replace(/\W([oi]+)/g, (m, v) => {
      let num = v.split("")
        .map(d => d === "o" ? "0" : "1")
        .reverse()
        .join("");
      let bn = new BN(num, 2);
      // let hex = bn.toString(16, num.length/4);
      let hex = bn.toString(16);
      if(hex.length % 2 === 1) hex = "0"+hex;
      return " "+hex
    }))
  .map(e => e.replace(/\(sha3\W+(\d+)/, (v, m)=>`sha3(${m})`))
    .sort()
  let table = ctxArray
    .map(e => e.split(" "));
  let maxFields = table.reduce((a, e) => e.length > a.length ? e.map(z => 0) : a, [])
  maxFields = table.reduce((a, e) => {
    for(var i=0; i<e.length; i++) {
      if(e[i].length > a[i]) a[i] = e[i].length
    }
    return a;
  }, maxFields);
  let pc = "";
  let formatted = table.map(e => {
    let row = e
      .map((v, i) => v + " ".repeat(maxFields[i] - v.length))
      .join("  ");
    if(e[0] === "pc") {
      pc = e[1];
      return row.yellow;
    }
    if(e[0] === "stack") return row.blue;
    return row;
  }).join("\n")

  let code = "";
  if(pc !== "") {
    let pcNum = parseInt(pc, 16);
    let opcode = src.slice(pcNum*2, pcNum*2+2);
    code = evm[opcode] || opcode.toString();
    // Add push content
    if( opcode[0] === "6" || opcode[0] === "7") {
      let from = (pcNum+1);
      let to = (pcNum + (parseInt(opcode, 16) - parseInt("5f", 16)));
      code += " " + src.slice(from*2, to*2+2)+"."
    }
  }

  let length = process.stdout.columns || 50 ;
  let seperatorlength = Math.max(5, length - 7 - code.length);

  return `${i}.  ${"-".repeat(seperatorlength)}  ${code}\n${formatted}`;
})

console.log(data.join("\n\n"));
fs.writeFileSync("tmp", data.join("\n\n"));
