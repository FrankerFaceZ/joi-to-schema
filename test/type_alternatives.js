const Joi = require('@hapi/joi');
const expect = require('chai').expect;

const Converter = require('../lib/converter'),
	inst = new Converter;

const convert = thing => inst.convert(thing),
	fakeJoi = thing => ({
		isJoi: true,
		describe: () => thing
	});


describe('type: alternatives', function() {
	it('try works', function() {
		const result = convert(Joi.alternatives().try(Joi.string(), Joi.number()));
		expect(result).to.exist;
		expect(result.anyOf).to.exist;
		expect(result.anyOf.length).to.eql(2);
		expect(result.anyOf[0].type).to.eql('string');
		expect(result.anyOf[1].type).to.eql('number');
	});

	it('uses custom terms', function() {
		let result = convert(Joi.alternatives().try(Joi.string(), Joi.number()).meta({
			term: 'allOf'
		}));

		expect(result).to.exist;
		expect(result.allOf).to.exist;
		expect(result.allOf.length).to.eql(2);
		expect(result.meta).to.not.exist;

		result = convert(Joi.alternatives().try(Joi.string(), Joi.number()).meta({
			term: 'allOf',
			extra: true
		}));

		expect(result).to.exist;
		expect(result.allOf).to.exist;
		expect(result.allOf.length).to.eql(2);
		expect(result.meta).to.exist;
		expect(result.meta.term).to.not.exist;
		expect(result.meta.extra).to.eql(true);
	});

	it('ignores unknown types', function() {
		const inst = new Converter({ignoreUnknownTypes: true}),
			result = inst.convert(fakeJoi({
				type: 'alternatives',
				alternatives: [
					{type: 'foo'},
					{type: 'string'}
				]
			}));

		expect(result).to.exist;
		expect(result.anyOf).to.exist;
		expect(result.anyOf.length).to.eql(1);
		expect(result.anyOf[0].type).to.eql('string');
	});

	it('does not support when', function() {
		expect(() => convert(Joi.alternatives().when('b', {
			is: 5, then: Joi.string()
		}))).to.throw();

		expect(() => convert(Joi.alternatives().when(
			Joi.object({b: 5}).unknown(),
			{
				then: Joi.object({
					a: Joi.string(),
					b: Joi.number()
				})
			}
		))).to.throw();
	})
})
