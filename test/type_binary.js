const Joi = require('@hapi/joi');
const expect = require('chai').expect;

const Converter = require('../lib/converter'),
	inst = new Converter;

const convert = thing => inst.convert(thing),
	fakeJoi = thing => ({
		isJoi: true,
		describe: () => thing
	});


describe('type: binary', function() {
	it('works', function() {
		const result = convert(Joi.binary());
		expect(result).to.exist;
		expect(result.type).to.eql('string');
		expect(result.format).to.eql('binary');
	});

	it('supports base64', function() {
		const result = convert(Joi.binary().encoding('base64'));
		expect(result).to.exist;
		expect(result.format).to.eql('byte');
	});

	it('supports min', function() {
		const result = convert(Joi.binary().min(3));
		expect(result.minLength).to.eql(3);
	});

	it('supports max', function() {
		const result = convert(Joi.binary().max(3));
		expect(result.maxLength).to.eql(3);
	});

	it('supports length', function() {
		const result = convert(Joi.binary().length(42));
		expect(result.minLength).to.eql(42);
		expect(result.maxLength).to.eql(42);
	});

	it('explicitly does not support features', function() {
		expect(() => convert(Joi.binary().encoding('ucs2'))).to.throw();
		expect(() => convert(fakeJoi({
			type: 'binary',
			rules: [{name: 'unknown'}]
		}))).to.throw();
	});
})
