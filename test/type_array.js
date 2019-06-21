const Joi = require('@hapi/joi');
const expect = require('chai').expect;

const Converter = require('../lib/converter'),
	inst = new Converter;

const convert = thing => inst.convert(thing),
	fakeJoi = thing => ({
		isJoi: true,
		describe: () => thing
	});


describe('type: array', function() {
	it('works', function() {
		const result = convert(Joi.array());
		expect(result).to.exist;
		expect(result.type).to.eql('array');
	});

	it('supports min', function() {
		const result = convert(Joi.array().min(3));
		expect(result.minItems).to.eql(3);
	});

	it('supports max', function() {
		const result = convert(Joi.array().max(5));
		expect(result.maxItems).to.eql(5);
	});

	it('supports length', function() {
		const result = convert(Joi.array().length(42));
		expect(result.minItems).to.eql(42);
		expect(result.maxItems).to.eql(42);
	});

	it('supports unique', function() {
		const result = convert(Joi.array().unique());
		expect(result.uniqueItems).to.eql(true);
	});

	it('supports a single type', function() {
		const result = convert(Joi.array().items(Joi.string()));
		expect(result.items).to.eql({type: 'string'});
		expect(result.additionalItems).to.not.exist;
	});

	it('supports multiple types', function() {
		const result = convert(Joi.array().items(Joi.number(), Joi.string()));
		expect(result.items).to.exist;
		expect(result.items.anyOf).to.exist;
		expect(result.items.anyOf.length).to.eql(2);
		expect(result.items.anyOf[0]).to.eql({type: 'number'});
		expect(result.items.anyOf[1]).to.eql({type: 'string'});
		expect(result.additionalItems).to.not.exist;
	});

	it('supports ordered types', function() {
		const result = convert(Joi.array().ordered(Joi.number(), Joi.string()));
		expect(result.items).to.exist;
		expect(result.items.length).to.eql(2);
		expect(result.items[0]).to.eql({type: 'number'});
		expect(result.items[1]).to.eql({type: 'string'});
		expect(result.additionalItems).to.not.exist;
	});

	it('supports additional types', function() {
		let result = convert(Joi.array().ordered(Joi.number(), Joi.string()).items(Joi.boolean()));
		expect(result.items).to.exist;
		expect(result.items.length).to.eql(2);
		expect(result.items[0]).to.eql({type: 'number'});
		expect(result.items[1]).to.eql({type: 'string'});
		expect(result.additionalItems).to.eql({type: 'boolean'});

		result = convert(Joi.array().ordered(Joi.number(), Joi.string()).items(Joi.number().integer(), Joi.boolean()));
		expect(result.items).to.exist;
		expect(result.items.length).to.eql(2);
		expect(result.items[0]).to.eql({type: 'number'});
		expect(result.items[1]).to.eql({type: 'string'});
		expect(result.additionalItems).to.exist;
		expect(result.additionalItems.anyOf).to.exist;
		expect(result.additionalItems.anyOf.length).to.eql(2);
		expect(result.additionalItems.anyOf[0]).to.eql({type: 'integer'});
		expect(result.additionalItems.anyOf[1]).to.eql({type: 'boolean'});
	});

	it('ignores unknown types', function() {
		const inst = new Converter({ignoreUnknownTypes: true}),
			result = inst.convert(fakeJoi({
				type: 'array',
				items: [
					{type: 'string'},
					{type: 'foo'}
				]
			})),

			result_two = inst.convert(fakeJoi({
				type: 'array',
				orderedItems: [
					{type: 'foo'},
					{type: 'number'}
				]
			}));

		expect(result).to.exist;
		expect(result.items).to.eql({type: 'string'});

		expect(result_two).to.exist;
		expect(result_two.items).to.exist;
		expect(result_two.items.length).to.eql(1);
		expect(result_two.items[0]).to.eql({type: 'number'});
	});

	it('explicitly does not support features', function() {
		expect(() => convert(Joi.array().sparse())).to.throw();
		expect(() => convert(Joi.array().unique(() => {}))).to.throw();
		expect(() => convert(Joi.array().unique(undefined, {ignoreUndefined: true}))).to.throw();

		const inst = new Converter({ignoreUnknownRules: true});
		const bad_rule = fakeJoi({
			type: 'array',
			rules: [{name: 'unknown'}]
		});

		expect(() => convert(bad_rule)).to.throw();
		expect(() => inst.convert(bad_rule)).to.not.throw();
	});
})
