'use strict';
require('sugar');

let fs = require('fs');
let util = require('util');
let winston = require('winston');

require('express-winston');
require('winston-papertrail');

let levels = {
  trace: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5
};

let colors = {
  trace: 'white',
  debug: 'blue',
  info: 'green',
  warn: 'yellow',
  error: 'red'
};

winston.addColors(colors);
let logger = new (winston.Logger)({ levels: levels });

let PROGRAM = 'Harry Caul';
let DEBUG = process.env.DEBUG_LEVEL || 'trace';
let DEBUG_LEVEL = levels[DEBUG];
let VERSION = 'tree';

function lineNumber() {
  return (new Error()).stack.split('\n')[3].match(/:([0-9]+):/)[1];
}

function functionName() {
  try {
    return (new Error()).stack.split('\n')[3].match(/at (\w+(\.<?[\w\b]+>?)*)/)[1];
  } catch(e)
  {
    return '';
  }
}

function getWinstonTimestampValue() {
  return Date.create().format('{HH}:{mm}:{ss}');
}

let Logger = function(filename) {
  this.prefix_ = filename + ':';
  this.logger_ = logger;
};

Logger.prototype.trace = function () {
  if (DEBUG_LEVEL > levels.trace) return;
  let string = util.format.apply(null, arguments);
  this.logger_.trace(this.prefix_ + lineNumber() + ':' + functionName() + ': ' + string);
};

Logger.prototype.debug = function () {
  if (DEBUG_LEVEL > levels.debug) return;
  let string = util.format.apply(null, arguments);
  this.logger_.debug(this.prefix_ + lineNumber() + ':' + functionName() + ': ' + string);
};

Logger.prototype.info = function() {
  if (DEBUG_LEVEL > levels.info) return;
  let string = util.format.apply(null, arguments);
  this.logger_.info(this.prefix_ + ': ' + string);
};

Logger.prototype.log = function() {
  this.info.apply(this, arguments);
};

Logger.prototype.warn = function() {
  let string = util.format.apply(null, arguments);
  this.logger_.warn(this.prefix_ + lineNumber() + ': ' + string);
};

Logger.prototype.error = function() {
  let args = Array.prototype.slice.call(arguments, 0);
  let string = util.format.apply(null, arguments);
  let errorString = this.prefix_ + lineNumber() + ': ' +  string;

  let error = args.find(function (v) { return v instanceof Error; });
  if (!!error) {
    // an error was passed into the arguments list, so lets sugar the
    // displayed message with a little more than an error message.
    errorString += '\n';
    errorString += error.stack;
  }

  this.logger_.error(errorString);
};

Logger.prototype.stream = function() {
  let self = this;

  return {
    write: function(message) {
      self.info(message);
    }
  };
};

exports.forFile = function(filename) {
  filename = filename.split('/').last();
  return new Logger(filename);
};

let initialized = false;

exports.init = function() {
  if (initialized) return;

  initialized = true;
  logger.add(winston.transports.Console, { level: DEBUG, colorize: true, timestamp: true });
};

exports.initServer = function(program) {
  if (initialized) return;

  initialized = true;

  PROGRAM = program || PROGRAM;
  if (process.env.LOGGER_SUFFIX){
    PROGRAM = util.format('%s-%s', PROGRAM, process.env.LOGGER_SUFFIX);
  }

  logger.add(winston.transports.Console, {
    level: DEBUG,
    colorize: true,
    timestamp: getWinstonTimestampValue()
  });

  if (process.env.PAPERTRAIL){
    logger.add(winston.transports.Papertrail, {
      level: 'info',
      host: config.PAPERTRAIL_HOST,
      port: parseInt(config.PAPERTRAIL_PORT),
      program: PROGRAM,
      colorize: true
    });
  }
};

/*
Logger.prototype.getExpressErrorTransports = function() {
  let transports = [];

  // Always add console transport
  transports.add(new winston.transports.Console({
    colorize: true,
    timestamp: getWinstonTimestampValue()
  }));

  // We only want to send out errors to Papertrail on prod
  transports.add(new winston.transports.Papertrail({
    host: 'logs.papertrailapp.com',
    port: 48326,
    program: PROGRAM,
    colorize: true
  }));

  return transports;
};
*/