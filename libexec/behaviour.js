#!/usr/bin/env node

const Web3 = require("web3");
const web3 = new Web3();
const fs = require("fs");
const keccak = require("keccak");
const sha3 = str => keccak('keccak256')
  .update(str)
  .digest()
  .toString('hex')

const args = process.argv.slice(2);
const abiFilePath = args[0];

const abi = JSON.parse(fs.readFileSync(abiFilePath));
const contract = web3.eth.contract(abi);


const layout = abi
  .map(fabi => [fabi, `${fabi.name}(${fabi.inputs.map(i => i.name).join(",")})`])
  .map(([fabi, canExpr]) => [fabi, canExpr, sha3(canExpr).slice(0, 8)])
  .map(([fabi, canExpr, sig]) => `${sig}    ${canExpr}`)
  .join("\n\n")

console.log(layout);
