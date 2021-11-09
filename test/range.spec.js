const Validator = require('../src');

var validator = new Validator();
validator.addRules(['rangelength: (1,10]']);

var res = validator.check(10000);

console.log(res);
