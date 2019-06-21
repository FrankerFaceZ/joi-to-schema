const Joi = require('@hapi/joi');
const expect = require('chai').expect;

const Converter = require('../lib/converter');


describe('extraction', function() {
	it('requires a slash', function() {
		expect(() => Converter({extractPath: 'test'})).to.throw();
	})

	it('can extract schema sub-trees', function() {
		const inst = Converter({extract: true}),
			result = inst.convert(Joi.object({
				foo: Joi.string(),
				bar: Joi.string()
			}).meta({
				extract: 'Baz'
			}));

		expect(result).to.exist;
		expect(result.type).to.not.exist;
		expect(result['$ref']).to.eql('#/Baz');

		expect(inst.schemas).to.exist;
		expect(inst.schemas.Baz).to.exist;
		expect(inst.schemas.Baz.type).to.eql('object');
		expect(inst.schemas.Baz.properties).to.exist;
		expect(inst.schemas.Baz.properties.foo).to.eql({type: 'string'});
	});

	it('sanitize meta', function() {
		const inst = Converter({extract: true});
		inst.convert(Joi.object().meta({
			extract: 'Foo',
		}));

		inst.convert(Joi.object().meta({
			extract: 'Bar',
			test: 42
		}));

		expect(inst.schemas).to.exist;
		expect(inst.schemas.Foo).to.exist;
		expect(inst.schemas.Foo.meta).to.not.exist;

		expect(inst.schemas.Bar).to.exist;
		expect(inst.schemas.Bar.meta).to.exist;
		expect(inst.schemas.Bar.meta.extract).to.not.exist;
		expect(inst.schemas.Bar.meta.test).to.eql(42);
	})

	it('skips known schemas', function() {
		const inst = Converter({extract: true, extractPath: '/test/'});
		inst.convert(Joi.object({
			foo: Joi.string()
		}).meta({
			extract: 'Bar'
		}));

		const result = inst.convert(Joi.object({
			baz: Joi.string()
		}).meta({
			extract: 'Bar'
		}));

		expect(result).to.exist;
		expect(result.type).to.not.exist;
		expect(result['$ref']).to.eql('#/test/Bar');

		expect(inst.schemas).to.exist;
		expect(inst.schemas.test).to.exist;
		expect(inst.schemas.test.Bar).to.exist;
		expect(inst.schemas.test.Bar.type).to.eql('object');
		expect(inst.schemas.test.Bar.properties).to.exist;
		expect(inst.schemas.test.Bar.properties.foo).to.eql({type: 'string'});
		expect(inst.schemas.test.Bar.properties.baz).to.not.exist;
	})

	it('can extract with absolute paths', function() {
		const inst = Converter({extract: true, extractPath: '/test/'}),
			result = inst.convert(Joi.object({
				foo: Joi.string()
			}).meta({
				extract: '/Bar/Baz',
			}));

		expect(result).to.exist;
		expect(result.type).to.not.exist;
		expect(result['$ref']).to.eql('#/Bar/Baz');
	})
})
