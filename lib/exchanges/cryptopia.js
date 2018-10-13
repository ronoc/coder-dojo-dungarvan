'use strict';
require('sugar');

let util 	      = require('util');
let request     = require('request');
let _           = require('underscore');

let config      = require("../common/config");
let constants   = require("../common/constants");
let Exchange 	  = require('./exchange');
let logger      = require("../common/logger").forFile(module.filename);

let Crypt = module.exports = function(properties) {
  this.constructor.super_.call(this, constants.exchanges.cryptopia, properties);
};

const baseUri = "https://www.cryptopia.co.nz/api/";
const SCALAR = 1000000;

util.inherits(Crypt, Exchange);

Crypt.prototype.init = function(){
};

Crypt.prototype.startTicker = function(){
  logger.info("start ticker " + this.name);
  setTimeout(this.getPrices.bind(this), 1000);
};

Crypt.prototype.getPrices = function(){
  let self= this;
  let target = util.format("%s%s", baseUri, "GetMarkets");
  request(target, (err, resp, body) => {
    if(err){
      console.log(self.name + ": error requesting prices : " + err);
      setTimeout(self.getPrices.bind(self), 5000);
      return;
    }
    let d = JSON.parse(body);
    if(d){
      self.tradeHistory.each(p => {
        let td = d.Data.find(t => { return t.Label === p.symbol;});
        self.updateHistory(p.instrument, td.LastPrice);
      });
    }
    setTimeout(self.getPrices.bind(self), 5000);
  });
};

