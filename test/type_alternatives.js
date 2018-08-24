const Joi = require('joi');
const expect = require('chai').expect;

const Converter = require('../lib/converter'),
	inst = new Converter;

const convert = thing => inst.convert(thing);

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
		const result = convert(Joi.alternatives().try(Joi.string(), Joi.number()).meta({
			term: 'allOf'
		}));

		expect(result).to.exist;
		expect(result.allOf).to.exist;
		expect(result.allOf.length).to.eql(2);
		expect(result.meta).to.not.exist;
	})

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
