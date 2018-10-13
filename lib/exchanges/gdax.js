'use strict';
require('sugar');

let config      = require('../common/config');
let constants   = require("../common/constants");
let Exchange    = require('./exchange');
let logger 	    = require("../common/logger").forFile(module.filename);
let metrics     = require('../common/metrics').forPrefix("GDax");

let _           = require('underscore');
let gd          = require('gdax');
let util        = require('util');

let Gdax = module.exports = function(properties) {
  this.constructor.super_.call(this, constants.exchanges.gdax, properties);
};

util.inherits(Gdax, Exchange);

Gdax.prototype.init = function(){
};

Gdax.prototype.startTicker = function() {
  logger.info("Start ticker for Gdax");
  this.lastUpdated = 0;
  let pairs = this.tradeHistory.map(p => {return p.symbol;});
  let websocket = new gd.WebsocketClient(pairs);
  websocket.on('message', this.ticker.bind(this));
  websocket.on('error', (err) => {
    logger.warn("gdax socket error " + err);
    websocket.close();
  });
  websocket.on('close', this.ticker.bind(this));
};

Gdax.prototype.ticker = function(data){
  if(!data)
    return;

  if (!(data.type === "done" && data.reason === "filled"))
    return;

  if(!data.price)
    return;

  let pair = this.tradeHistory.find(p => {return p.symbol === data.product_id;});
  let price = parseFloat(data.price);

  if(price === NaN || price === null){
    logger.warn(this.name + " " + pair.instrument + " updated with botched price = " + price);
    return;
  }
  metrics.gauge(_.invert(constants.instruments)[pair.instrument], price);
  this.updateHistory(pair.instrument, price);
};
