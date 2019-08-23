function Validator(strategies) {
  this.strategies = strategies
  this.cache = []
}

Validator.prototype.add = function(dom, rules) {
  var thisArg = this
  for (var rule of rules) {
    var strategyList = rule.strategy.split(':')
    var errorMsg = rule.errorMsg
    this.cache.push(
      (function(dom, strategyList, errorMsg) {
        return function() {
          var strategy = strategyList.shift()
          strategyList.unshift(dom.value)
          strategyList.push(errorMsg)

          return thisArg.strategies[strategy].apply(dom, strategyList)
        }
      })(dom, strategyList, errorMsg)
    )
  }
}

Validator.prototype.start = function() {
  for (var valid of this.cache) {
    let errorMsg = valid()
    if (errorMsg) return errorMsg
  }
}

var strategies = {
  isNonEmpty: function(value, errorMsg) {
    return value === '' ? errorMsg : void 0
  },
  minLength: function(value, length, errorMsg) {
    return String(value).length < length ? errorMsg : void 0
  }
}

var validator = new Validator(strategies)

validator.add({ value: 1 }, [
  {
    strategy: 'isNonEmpty',
    errorMsg: '用户名不能为空'
  },
  {
    strategy: 'minLength:6',
    errorMsg: '用户名不能小于6位'
  }
])

var msg = validator.start()

console.log(msg)
