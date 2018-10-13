'use strict';
require('sugar');

let config = require('./config');

let StatsdClient = require('statsd-client');
let MetricsClient = new StatsdClient({
  host: "ec2-174-129-63-33.compute-1.amazonaws.com",
  port: 8126,
  prefix: 'coderdojo'
});

let Metrics = function(prefix) {
  this.prefix_ = prefix;
  this.client_ = MetricsClient.getChildClient(prefix);
};

// Load up the prototype with nullops or actual calls to statsd
['increment', 'decrement', 'counter', 'gauge','histogram', 'gaugeDelta', 'set', 'timing'].forEach(function(methodName) {
  Metrics.prototype[methodName] = config.isTesting ? function() {}
                     : function() { this.client_[methodName].apply(this.client_, arguments); };
});

// name can be an array of names or just a name
Metrics.prototype.startTimer = function(name) {
  let self = this;
  const start = Date.now();
  return function onDoneTiming() {
    let duration = Date.now() - start;
    if (Object.isArray(name)) {
      name.forEach(n => self.timing(n, duration));
    } else {
      self.timing(name, duration);
    }
    return duration;
  };
};

module.exports = {
  forPrefix: function(prefix) {
    return new Metrics(prefix);
  }
};
