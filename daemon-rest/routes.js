const fs = require("fs");
const controllersPath = "./controllers";
let controllers = [];

fs.readFileSync(controllersPath).forEach(file => {
  controllers.push(file);
});

console.log(controllers);

module.exports = controllers;
