"use strict";

let Config = {} = exports;
let env = process.env;

if(env.NODE_ENV !== "production"){
  // Automatically load .env file that should be found at the root of the project dir.
  // Safely and easily swap between running in production, dev and test mode.
  require('dotenv').load();
}

Config.PAPERTRAIL_HOST = env.PAPERTRAIL_HOST;
Config.PAPERTRAIL_PORT = env.PAPERTRAIL_PORT;
