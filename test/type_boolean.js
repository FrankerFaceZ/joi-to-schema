const Joi = require('joi');
const expect = require('chai').expect;

const Converter = require('../lib/converter'),
	inst = new Converter;

const convert = thing => inst.convert(thing);

describe('type: boolean', function() {
	it('works', function() {
		const result = convert(Joi.boolean());
		expect(result).to.exist;
		expect(result.type).to.eql('boolean');
	});

	it('explicitly does not support features', function() {
		expect(() => convert(Joi.boolean.truthy('Y'))).to.throw();
		expect(() => convert(Joi.boolean.falsy('F'))).to.throw();
	});
})
