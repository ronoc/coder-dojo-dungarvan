"use strict";
require('sugar');

let util 	      = require('util');
let Pusher      = require('pusher-js/node');
let request     = require('request');
let _           = require('underscore');

let config      = require('../common/config');
let constants   = require("../common/constants");
let Exchange 	  = require('./exchange');
let logger 	    = require("../common/logger").forFile(module.filename);

const BITSTAMP_PUSHER_KEY = 'de504dc5763aeef9ff52';
const BITSTAMP_V2_URI     = "www.bitstamp.net";

let Bitstamp = module.exports = function(properties) {
  this.constructor.super_.call(this, constants.exchanges.bitstamp, properties);
};

util.inherits(Bitstamp, Exchange);

Bitstamp.prototype.init = function(){
  let self = this;
  self.client = new Pusher(BITSTAMP_PUSHER_KEY);
};

Bitstamp.prototype.startTicker = function(){
  this.lastUpdated = 0;
  let self = this;
  logger.info("Start ticker for bitstamp");
  self.tradeHistory.each(p => {
    let handler = self.client.subscribe(util.format("live_trades_%s", p.symbol));
    handler.bind('trade', this.ticker.bind(this, p.instrument));
  });
};

Bitstamp.prototype.ticker = function(pair, data){
  let instrument = this.tradeHistory.find(p => {return p.instrument === pair;});
  this.updateHistory(pair, data.price);
};
