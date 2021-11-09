const range = require('./range');

function format(source, params) {
    if (arguments.length === 1) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(source);

            return format.apply(this, args);
        };
    }

    if (params === undefined) {
        return source;
    }

    if (arguments.length > 2 && params.constructor !== Array) {
        params = Array.prototype.slice.call(arguments, 1);
    }

    if (params.constructor !== Array) {
        params = [params];
    }

    params.forEach(function (param, i) {
        source = source.replace(
            new RegExp('\\{' + i + '\\}', 'g'),
            function () {
                return param;
            }
        );
    });

    return source;
}

function Validator(rules) {
    this.rules = rules || [];
}

Validator.prototype.format = format;

Validator.prototype.methods = {
    required: function (value) {
        return (
            value !== undefined &&
            value !== null &&
            String(value).trim().length > 0
        );
    },
    email: function (value) {
        return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
            value
        );
    },
    url: function (value) {
        return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
            value
        );
    },
    date: function (value) {
        return !/Invalid|NaN/.test(new Date(value).toString());
    },
    number: function (value) {
        return /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
    },
    digits: function (value) {
        return /^\d+$/.test(value);
    },
    minlength: function (value, param, include) {
        return include ? value.length >= param : value.length > param;
    },
    maxlength: function (value, param, include) {
        return include ? value.length <= param : value.length < param;
    },
    rangelength: function (value, param) {
        const len = String(value).length;

        return range(len, param);
    },
    min: function (value, param, include) {
        return include ? value >= param : value > param;
    },
    max: function (value, param, include) {
        return include ? value <= param : value.length < param;
    },
    range: function (value, param) {
        return range(value, param);
    },
    step: function (value, param) {
        var decimalPlaces = function (num) {
                var match = ('' + num).match(/(?:\.(\d+))?$/);
                if (!match) {
                    return 0;
                }

                return match[1] ? match[1].length : 0;
            },
            toInt = function (num) {
                return Math.round(num * Math.pow(10, decimals));
            },
            valid = true,
            decimals;

        decimals = decimalPlaces(param);

        if (
            decimalPlaces(value) > decimals ||
            toInt(value) % toInt(param) !== 0
        ) {
            valid = false;
        }

        return valid;
    },
    equalTo: function (value, param) {
        return value === param;
    },
};

Validator.prototype.messages = {
    required: '这是必填字段',
    email: '请输入有效的电子邮件地址',
    url: '请输入有效的网址',
    date: '请输入有效的日期',
    number: '请输入有效的数字',
    digits: '只能输入数字',
    equalTo: '你的输入不相同',
    maxlength: format('最多可以输入 {0} 个字符'),
    minlength: format('最少要输入 {0} 个字符'),
    rangelength: format('请输入长度在 {0} 之间的字符串'),
    range: format('请输入范围在 {0} 之间的数值'),
    step: format('请输入 {0} 的整数倍值'),
    max: format('请输入不大于 {0} 的数值'),
    min: format('请输入不小于 {0} 的数值'),
};

Validator.prototype.addMethod = function (name, method, message) {
    this.methods[name] = method;
    this.messages[name] = message != undefined ? message : this.messages[name];
};

Validator.prototype.addRules = function (rules) {
    if (Array.isArray(rules)) {
        for (var i = 0; i < rules.length; i++) {
            if (typeof rules[i] === 'string') {
                this.addRule({
                    name: rules[i],
                });
            } else {
                this.addRule(rules[i]);
            }
        }
    } else {
        this.addRule(rules);
    }
};

Validator.prototype.addRule = function (rule) {
    var name = rule.name,
        message = rule.message;

    var params = name.split(':');
    var name = params.shift();

    if (this.methods[name]) {
        this.rules.push({
            name,
            params: params.map(v => v.trim()),
            message: message,
        });
    } else {
        throw Error(`Not Found [${name}] in Validator`);
    }
};

Validator.prototype.check = function (value) {
    for (var i = 0; i < this.rules.length; i++) {
        var rule = this.rules[i];

        var argv = [].concat(value, rule.params);

        var flag = this.methods[rule.name].apply(this, argv);

        if (!flag) {
            var theregex = /\$?\{(\d+)\}/g;
            var message = rule.message || this.messages[rule.name];

            if (typeof message === 'function') {
                message = message.apply(this, rule.params);
            } else if (theregex.test(message)) {
                message = this.format(
                    message.replace(theregex, '{$1}'),
                    rule.params
                );
            }

            return message;
        } else {
            return true;
        }
    }
};

Validator.addMethod = function (name, method, message) {
    Validator.prototype.methods[name] = method;
    Validator.prototype.messages[name] =
        message != undefined ? message : this.messages[name];
};

module.exports = Validator;
