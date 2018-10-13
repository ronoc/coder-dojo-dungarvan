"use strict";
require('sugar');

let Constants = module.exports = {};

/*
To determine which order we support for our charts so that we can easily compare pairs
that are not in the right direction just stick by the rules, alphabetical all the way
*/
Constants.currencies = {
  "BTC"   : 0,
  "ETH"   : 1,
  "EUR"   : 2,
  "LTC"   : 3,
  "USD"   : 4,
  "XRP"   : 6,
  "ZEC"   : 7,
  "NEO"   : 8,
  "DENT"  : 9,
  "EOS"   : 10,
  "CVC"   : 11
};

// Correalated with the DB for now.
Constants.instruments = {
  "LTC_BTC"   : 0,
  "ETH_EUR"   : 1,
  "LTC_EUR"   : 2,
  "ETH_BTC"   : 3,
  "BTC_EUR"   : 4,
  "XRP_BTC"   : 5,
  "FUN_BTC"   : 6,
  "XVG_BTC"   : 7,
  "ZEC_BTC"   : 8,
  "XVG_LTC"   : 9,
  "ZEC_LTC"   : 10,
  "LTC_ETH"   : 11,
  "LTC_NEO"   : 12,
  "NEO_ETH"   : 13,
  "NEO_BTC"   : 14,
  "DENT_NEO"  : 15,
  "DENT_ETH"  : 16,
  "DENT_BTC"  : 17,
  "EOS_NEO"   : 18,
  "EOS_ETH"   : 19,
  "EOS_BTC"   : 20,
  "CVC_BTC"   : 21,
  "CVC_ETH"   : 22,
  "BTC_USD"   : 23,
  "ETH_USD"   : 24
};

/* Supported Exchanges, neverending story ... */
Constants.exchanges = {
  "bitstamp" : 0,
  "gdax" : 1,
  "binance" : 2,
  "bittrex" : 3,
  "cryptopia" : 4,
  "kucoin" : 5
};

Constants.exchangeState = {
  OPERATIONAL : 0,
  THROTTLED : 1
};
