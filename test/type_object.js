const Joi = require('joi');
const expect = require('chai').expect;

const Converter = require('../lib/converter'),
	inst = new Converter;

const convert = thing => inst.convert(thing),
	throwConvert = thing => expect(() => convert(thing)).to.throw(),
	fakeJoi = thing => ({
		isJoi: true,
		describe: () => thing
	});


describe('type: object', function() {
	it('works', function() {
		const result = convert(Joi.object());
		expect(result).to.exist;
		expect(result.type).to.eql('object');
	});

	it('supports min and max', function() {
		const result = convert(Joi.object().min(3).max(5));
		expect(result.minProperties).to.eql(3);
		expect(result.maxProperties).to.eql(5);
	});

	it('supports length', function() {
		const result = convert(Joi.object().length(42));
		expect(result.minProperties).to.eql(42);
		expect(result.maxProperties).to.eql(42);
	});

	it('supports children', function() {
		const result = convert(Joi.object({
			a: Joi.number()
		}));

		expect(result.properties).to.exist;
		expect(result.properties.a).to.exist;
		expect(result.properties.a.type).to.eql('number');
	});

	it('supports unknown', function() {
		let result = convert(Joi.object());
		expect(result.additionalProperties).to.not.exist;

		result = convert(Joi.object().unknown());
		expect(result.additionalProperties).to.eql(true);

		result = convert(Joi.object().unknown(false));
		expect(result.additionalProperties).to.eql(false);
	});

	it('ignores unknown types', function() {
		const inst = new Converter({ignoreUnknownTypes: true}),
			result = inst.convert(fakeJoi({
				type: 'object',
				children: {
					'test': {
						type: 'foo'
					}
				},
				patterns: [
					{regex: '/test/', rule: {type: 'foo'}}
				]
			}));

		expect(result).to.exist;
		expect(result.type).to.eql('object');
		expect(result.properties).to.exist;
		expect(result.properties.test).to.not.exist;
		expect(result.patternProperties).to.exist;
		expect(result.patternProperties['test']).to.not.exist;
	});

	it('supports required and forbidden', function() {
		const result = convert(Joi.object({
			a: Joi.number().required(),
			b: Joi.object().forbidden()
		}));

		expect(result.required).to.exist;
		expect(result.properties.b).to.not.exist;
		expect(result.required).to.eql(['a']);
	});

	it('supports patterns', function() {
		const result = convert(Joi.object().pattern(/\d+/, Joi.boolean()));
		expect(result.patternProperties).to.exist;
		expect(result.patternProperties['\\d+']).to.exist;
		expect(result.patternProperties['\\d+'].type).to.eql('boolean');
	});

	it('supports dependencies', function() {
		let result = convert(Joi.object().with('foo', 'bar'));
		expect(result.dependencies).to.exist;
		expect(result.dependencies.foo).to.eql(['bar']);

		result = convert(Joi.object().and('foo', 'bar', 'baz'));
		expect(result.dependencies).to.exist;
		expect(result.dependencies.foo).to.eql(['bar', 'baz']);
		expect(result.dependencies.bar).to.eql(['foo', 'baz']);
		expect(result.dependencies.baz).to.eql(['foo', 'bar']);
	})

	it('explicitly does not support features', function() {
		throwConvert(Joi.object().pattern(Joi.string().min(3).max(5), Joi.boolean()));
		throwConvert(Joi.object().or('a', 'b'));
		throwConvert(fakeJoi({
			type: 'object',
			rules: [{name: 'unknown'}]
		}));
	});
})
