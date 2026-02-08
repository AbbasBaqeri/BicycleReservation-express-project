const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'store.json')

function readData() {
  return JSON.parse(fs.readFileSync(filePath))
}

function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

module.exports = { readData, writeData }
