const Joi = require('joi');
const expect = require('chai').expect;

const Converter = require('../lib/converter'),
	inst = new Converter;

const convert = thing => inst.convert(thing);

describe('type: number', function() {
	it('works', function() {
		const result = convert(Joi.number());
		expect(result).to.exist;
		expect(result.type).to.eql('number');
	});

	it('supports integer', function() {
		const result = convert(Joi.number().integer());
		expect(result.type).to.eql('integer');
	});

	it('supports precision (kind of)', function() {
		const result = convert(Joi.number().precision(1));
		expect(result.format).to.eql('double');
	});

	it('supports min and max', function() {
		const result = convert(Joi.number().min(3).max(5));
		expect(result.minimum).to.eql(3);
		expect(result.maximum).to.eql(5);
	});

	it('supports greater and less', function() {
		const result = convert(Joi.number().greater(3).less(5));
		expect(result.exclusiveMinimum).to.eql(3);
		expect(result.exclusiveMaximum).to.eql(5);
	});

	it('supports multiple', function() {
		const result = convert(Joi.number().multiple(5));
		expect(result.multipleOf).to.eql(5);
	});

	it('supports positive', function() {
		const result = convert(Joi.number().positive());
		expect(result.exclusiveMinimum).to.eql(0);
	});

	it('supports negative', function() {
		const result = convert(Joi.number().negative());
		expect(result.exclusiveMaximum).to.eql(0);
	});

	it('supports port', function() {
		const result = convert(Joi.number().port());
		expect(result.type).to.eql('integer');
		expect(result.minimum).to.eql(0);
		expect(result.maximum).to.eql(65535);
	});
})
