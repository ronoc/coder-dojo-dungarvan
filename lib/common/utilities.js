'use strict';
require('sugar');

let path   = require('path');
let util   = require('util');

let constants  = require('./constants');
let logger     = require('./logger').forFile(module.filename);

let Utilities = module.exports = {};

Utilities.SECONDS_IN_DAY = Utilities.secondsInDay = 86400;

Utilities.SECONDS_IN_HOUR = Utilities.secondsInHour = 3600;

Utilities.SECONDS_IN_MINUTE = 60;

Utilities.isNullOrEmptyString = function(str) {
  return !Object.isString(str) || !str || str.isBlank();
};

Utilities.areAnyNullOrEmptyStrings = function() {
  return Object.values(arguments).any(s => {
    return Utilities.isNullOrEmptyString(s);
  });
};

Utilities.getUnixTimestamp = function() {
  return Math.floor(Date.now() / 1000);
};

Utilities.getUnixBaseTimestamp = function(timestamp, interval) {
  return Math.round(timestamp  - (timestamp % interval));
};

Utilities.getUnixMinuteTimestamp = function() {
  return Utilities.getUnixBaseTimestamp(Utilities.getUnixTimestamp(), Utilities.SECONDS_IN_MINUTE);
};

Utilities.getUnixHourTimestamp = function() {
  return Utilities.getUnixBaseTimestamp(Utilities.getUnixTimestamp(), Utilities.SECONDS_IN_HOUR);
};

Utilities.getUnixDayTimestamp = function() {
  return Utilities.getUnixBaseTimestamp(Utilities.getUnixTimestamp(), Utilities.SECONDS_IN_DAY);
};

Utilities.withinTheLast24Hrs = function(timestamp) {
  return timestamp >= Utilities.getUnixHourTimestamp() - Utilities.secondsInDay + Utilities.secondsInHour;
};

Utilities.getSha1HashString = function() {
	let shasum = crypto.createHash('sha1');
	for(let i = 0; i < arguments.length; i++){
    let arg = arguments[i];
    if (typeof(arg) === 'number'){
      shasum.update(arg.toString());
    } else {
      shasum.update(arg);
    }
	}
	return shasum.digest('hex');
};

Utilities.sha1 = Utilities.getSha1HashString;

Utilities.absolutePathTo = function(relativePath, base) {
  if (!base) base = module.filename;
  return path.resolve(path.dirname(base), relativePath);
};

/**
 * Safely parse json into an object, returning null if it fails
 * @param  {string}       The json string to parse
 * @return {Object}       The parsed object, or null
 */
Utilities.safeJsonParse = function(str) {
  let ret = null;
  try {
    ret = JSON.parse(str);
  } catch(e) {
    logger.debug('%s: %j', e, str);
  }
  return ret;
};

/**
 * Safely stringify an object into a json string, returning null if it fails
 * @param  {Object}       The object to stringify
 * @return {string}       The json string, or null
 */
Utilities.safeJsonStringify = function(obj) {
  let ret = null;
  try {
    ret = JSON.stringify(obj);
  } catch(e) {
    logger.warn('Unable to stringify %s: %s', obj, e);
  }
  return ret;
};

Utilities.safeParseInt = function(string) {
  let ret = null;
  try {
    ret = parseInt(string);
  } catch(e) {
    logger.warn('Unable to parseInt %s: %s', string, e);
  }
  return isNaN(ret) ? null : ret;
};

