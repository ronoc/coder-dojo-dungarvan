'use strict';
require('sugar');
let _            = require('underscore');
let async        = require('async');

let constants    = require("./common/constants");
let utilities    = require("./common/utilities");
let logger       = require("./common/logger").forFile("arbitrager");
let metrics      = require('./common/metrics').forPrefix("arbitrager");
let util         = require('util');

let Arbitrager = module.exports = function(exchanges, instruments) {
  this.exchanges = exchanges;
  this.instruments = instruments;
  setInterval(this.fetchPrices.bind(this), 5000);
};

Arbitrager.prototype.fetchPrices = function(){
  let self = this;
  let results = {};
  self.instruments.each(t => {
    results[t] = [];
    self.exchanges.each(e => {
      let lp = e.lastPrice(t);
      if(!lp){
        logger.warn("couldn't fetch last price from exchange " + e.name + " for instrument " + t);
        return;
      }
      results[t].push(lp);
    });

    if(results[t].length < 2){
      logger.warn("not enough results for instrument " + t);
      console.log("results " + JSON.stringify(results[t]));
      return;
    }
    self.calculateSpreads(t, results[t]);
  });
};

Arbitrager.prototype.calculateSpreads = function(pair, prices){
  let sorted = prices;
  let self = this;

  sorted.each(s1 => {
    sorted.each(s2 => {
      if(!(sorted.indexOf(s2) > sorted.indexOf(s1))){
        logger.warn("no yield ?");
        return;
      }
      if(!s1.price){
        logger.warn(util.format("price for %s is not valid on %s",
                                  _.invert(constants.instruments)[pair],
                                  s1.exchange));
        return;
      }

      if(!s2.price){
        logger.warn(util.format("price for %s is not valid on %s",
                                  _.invert(constants.instruments)[pair],
                                  s1.exchange));
        return;
      }

      let delta = s2.price - s1.price;
      let yld;

      // if our delta is minus this implies the buyside is s2.
      if(delta < 0)
        yld = (delta/s2.price) * 100;
      else
        yld = (delta/s1.price) * 100;

      if(yld > 100) {
        logger.debug("spurious data, yld greater than 100 on instrument " +
                     _.invert(constants.instruments)[pair]);
        return;
      }

      logger.info("-------------------------");
      logger.info("Spread for " + _.invert(constants.instruments)[pair] + " " +  delta + " which is a yield of " + yld);
      if(yld > 0){
        logger.info("buy side exhange " + s1.exchange + " price : " + s1.price);
        logger.info("sell side exhange " + s2.exchange + " price : " + s2.price);
      }
      else{
        logger.info("buy side exhange " + s2.exchange + " price : " + s2.price);
        logger.info("sell side exhange " + s1.exchange + " price : " + s1.price);
      }

      let observed = {
        targetYield : yld,
        instrument : pair,
        timestamp : utilities.getUnixTimestamp(),
        strikeCount : 0
      };

      let graphYield = yld;

      if(s2.price > s1.price){
        observed.buySide = s1.exchangeId;
        observed.sellSide = s2.exchangeId;
      }
      else{
        observed.buySide = s2.exchangeId;
        observed.sellSide = s1.exchangeId;
        graphYield * -1; //Keep the exchange ordering constant for the graphs
      }

      var t = util.format("largestYield.%s.%s_%s",
                           _.invert(constants.instruments)[pair],
                           s1.exchange,
                           s2.exchange);
      // reset the gauge.
      metrics.gauge(t,0);
      // graph it.
      metrics.gauge(t,graphYield);  //ensure to minus the yld to imply the buy direction has changed,
                                    //^ fixed exchanges in key
    });
  });
};

