'use strict';
require('sugar');

let async        = require('async');
let FixedArray   = require("fixed-array");
let _            = require('underscore');

let constants    = require("../common/constants");
let utilities    = require("../common/utilities");
let logger       = require("../common/logger").forFile("exchange.js");

let path         = require('path');
let request      = require('request');
let util         = require('util');

let Exchange = module.exports = function(ex, properties) {
  this.exchangeId = ex;
  this.name = _.invert(constants.exchanges)[ex].capitalize();
  this.tradeHistory = [];
  this.lastUpdated = 0;
  this.tickerId;

  let self = this;
  self.timeout = 60000;

	if(properties && properties.pairs){
		properties.pairs.each(p => {
			p.prices = FixedArray(5);
			self.tradeHistory.push(p);
		});
	}
  this.init();

  if(!self.tradeHistory.isEmpty())
    this.tickerId = this.startTicker();

  this.state = constants.exchangeState.OPERATIONAL;
  this.metrics = require('../common/metrics').forPrefix(this.name);
};

Exchange.prototype.startTicker = function(){
  throw new Error("StartTicker not defined on the child class");
};

Exchange.prototype.stopTicker = function(){
  logger.info("stopping ticker on " + this.name);
  if(!this.tickerId)
    return;
  clearInterval(this.tickerId);
};

Exchange.prototype.updateHistory = function(name, update){
  let iName = _.invert(constants.instruments)[name];
  let debug = util.format("updateTradeHistory on %s with price %s for instrument %s",
                          this.name,
                          JSON.stringify(update),
                          iName);
  let history = this.tradeHistory.find(p => {return p.instrument === name;});
  history.prices.push(update);
  this.lastUpdated = utilities.getUnixTimestamp();
  let key = util.format("conor.%s.price", iName);
  logger.info("update history " + this.name + " instrument " + iName + " price " + update);
  this.metrics.timing(key, update);
};

Exchange.prototype.lastPrice = function(instrument){
  if(this.lastUpdated !== 0 &&
    this.lastUpdated < (utilities.getUnixTimestamp() - (3 * 60))){
    logger.info("%s ticker has stopped, restart it", this.name);
    this.startTicker();
    return;
  }

  let history = this.tradeHistory.find(p => {return p.instrument === instrument;});

  if(!history){
    logger.warn("couldn't find a history for name " + name);
    return;
  }

  let t = {price : history.prices.mean(),
           exchange : this.name,
           exchangeId : this.exchangeId};
  return t;
};
