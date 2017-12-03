#!/usr/bin/env node
const fs = require("fs");
const args = process.argv.slice(2);
const BN = require('bn.js');
const path = require('path');


const link = function (filepath) {
  var data = fs.readFileSync(filepath).toString();

  data = data.replace(/#import\(([^\)]*)\)/g, (match, file) => {
    let child = link(file);
    console.log(`imported ${file}`);
    return child;
  })

  data = data.replace(/N_([[0-9a-f]*)/g, (match, number) => {
    var n = new BN(number, 16);
    var str = n.toString(2);
    str = "0".repeat(256-str.length) + str;
    str = str.split('').reverse();
    const toType = v => v === "0" ? "o" : "i";
    var toBin = (str) => {
      if(str.length === 1) return "(" + toType(str[0])+ " e)"
      return `(${toType(str[0])} ${toBin(str.slice(1))})`;
    }
    return toBin(str);
  })

  data = data.replace(/A_([[0-9a-f]*)/g, (match, number) => {
    var n = new BN(number, 16);
    var str = n.toString(2)
    str = "0".repeat(256-str.length) + str;
    str = str.split('').reverse();
    // if(str.length % 8 !== 0) {
    //   for(var i=str.length % 8; i<8; i++ ) {
    //     str = str.concat(["0"]);
    //   }
    // }
    const toType = v => v === "0" ? "o" : "i";
    var toBin = (str) => {
      if(str.length === 1) return "(" + toType(str[0])+ " e)"
      return `(${toType(str[0])} ${toBin(str.slice(1))})`;
    }
    let type = toBin(str);
    return type;
  })

  return data;
}

var data = link(args[0])

fs.writeFileSync(args[1], data);


