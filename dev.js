'use strict';

const Converter = require('./lib/converter');
const Joi = require('@hapi/joi');

const inst = new Converter;

const repl = require('repl').start('> ');

repl.context.Converter = Converter;
repl.context.Joi = Joi;
repl.context.inst = inst;
repl.context.convert = (...args) => inst.convert(...args);
