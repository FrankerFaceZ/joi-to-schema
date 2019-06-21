const Joi = require('@hapi/joi');
const expect = require('chai').expect;

const Converter = require('../lib/converter'),
	inst = new Converter;

const convert = thing => inst.convert(thing),
	fakeJoi = thing => ({
		isJoi: true,
		describe: () => thing
	});

describe('type: date', function() {
	it('works', function() {
		const result = convert(Joi.date());
		expect(result).to.exist;
		expect(result.type).to.eql('string');
		expect(result.format).to.eql('date-time');
	});

	it('supports min', function() {
		const result = convert(Joi.date().min('1988-05-30'));
		expect(result.formatMinimum).to.eql('1988-05-30T00:00:00.000Z');
	});

	it('supports max', function() {
		const result = convert(Joi.date().max('9999-12-31'));
		expect(result.formatMaximum).to.eql('9999-12-31T00:00:00.000Z');
	});

	it('supports greater', function() {
		const result = convert(Joi.date().greater('1988-05-30'));
		expect(result.formatExclusiveMinimum).to.eql('1988-05-30T00:00:00.000Z');
	});

	it('supports less', function() {
		const result = convert(Joi.date().less('9999-12-31'));
		expect(result.formatExclusiveMaximum).to.eql('9999-12-31T00:00:00.000Z');
	});

	it('explicitly does not support features', function() {
		expect(() => convert(Joi.date().timestamp())).to.throw();
		expect(() => convert(fakeJoi({
			type: 'date',
			rules: [{name: 'unknown'}]
		}))).to.throw();
	})
})
