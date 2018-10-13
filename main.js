
"use strict";
require('sugar');

let Arbitrager  = require("./lib/arbitrager");
let config      = require("./lib/common/config");
let constants   = require('./lib/common/constants');
let logger      = require("./lib/common/logger");
let Cryptopia   = require('./lib/exchanges/cryptopia');
let Bitstamp    = require('./lib/exchanges/bitstamp');
let GDax        = require('./lib/exchanges/gdax');

if (config.isDebug) {
  require('dotenv').load();
}

logger.initServer('Gordon-Gecko');
logger = logger.forFile(module.filename);
logger.info("logger init");

(function main(){
  let exchanges = [];
  exchanges.push(new Cryptopia({pairs : [{instrument : constants.instruments.ETH_BTC, symbol : "ETH/BTC"},
                                         {instrument : constants.instruments.LTC_BTC, symbol : "LTC/BTC"}]}),
                 new Bitstamp({pairs : [{instrument : constants.instruments.ETH_BTC, symbol : "ethbtc"},
                                        {instrument : constants.instruments.LTC_BTC, symbol : "ltcbtc"}]}));
                 new GDax({pairs : [{instrument : constants.instruments.LTC_BTC, symbol : "LTC-BTC"},
                                    {instrument : constants.instruments.ETH_BTC, symbol : "ETH-BTC"}]});
  let arb = new Arbitrager(exchanges, [constants.instruments.ETH_BTC, constants.instruments.LTC_BTC]);
//How do I do harmless comments?
// Are we there yet?
// Are we there yet?
// Are we there yet?
// Are we there yet?
// Hurry up!!!!