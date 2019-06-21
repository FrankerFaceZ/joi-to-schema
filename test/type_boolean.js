const Joi = require('@hapi/joi');
const expect = require('chai').expect;

const Converter = require('../lib/converter'),
	inst = new Converter;

const convert = thing => inst.convert(thing),
	fakeJoi = thing => ({
		isJoi: true,
		describe: () => thing
	});

describe('type: boolean', function() {
	it('works', function() {
		const result = convert(Joi.boolean());
		expect(result).to.exist;
		expect(result.type).to.eql('boolean');
	});

	it('explicitly does not support features', function() {
		expect(() => convert(Joi.boolean().truthy('Y'))).to.throw();
		expect(() => convert(Joi.boolean().falsy('F'))).to.throw();
		expect(() => convert(fakeJoi({
			type: 'boolean',
			truthy: [true],
			falsy: [false],
			rules: [{name: 'unknown'}]
		}))).to.throw();
	});
})
