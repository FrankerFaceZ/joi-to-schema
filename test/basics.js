const Joi = require('joi');
const expect = require('chai').expect;

const Converter = require('../lib/converter'),
	inst = new Converter;

const convert = thing => inst.convert(thing),
	fakeJoi = thing => ({
		isJoi: true,
		describe: () => thing
	});


describe('basics', function() {
	it('exists', function() {
		expect(Converter).to.exist;
		expect(Converter).to.be.a('function');
	});

	it('creates an instance', function() {
		let inst = Converter();
		expect(inst).to.exist;
		expect(inst).to.be.an.instanceOf(Converter);

		inst = new Converter();
		expect(inst).to.exist;
		expect(inst).to.be.an.instanceOf(Converter);
	});

	it('only accepts Joi', function() {
		expect(() => convert({})).to.throw();
	});

	it('handles about unknown types', function() {
		const thing = fakeJoi({type: 'test'});
		expect(() => convert(thing)).to.throw();

		const i2 = Converter({ignoreUnknownTypes: true}),
			result = i2.convert(thing);

		expect(result).to.not.exist;
	});

	it('preserves metadata', function() {
		const result = convert(Joi.object().meta({test: true}).meta({foo: 'bar'}));
		expect(result.meta).to.exist;
		expect(result.meta.test).to.eql(true);
		expect(result.meta.foo).to.eql('bar');
	});

	it('preserves notes on meta', function() {
		const result = convert(Joi.object().notes('test').notes('another'));
		expect(result.meta).to.exist;
		expect(result.meta.notes).to.eql(['test', 'another']);
	});

	it('preserves tags on meta', function() {
		const result = convert(Joi.object().tags(['test']).tags(['foo', 'bar']));
		expect(result.meta).to.exist;
		expect(result.meta.tags).to.eql(['test', 'foo', 'bar']);
	});

	it('preserves unit on meta', function() {
		const result = convert(Joi.object().unit('test'));
		expect(result.meta).to.exist;
		expect(result.meta.unit).to.eql('test');
	});

	it('preserves examples', function() {
		const result = convert(Joi.string().example('foo').example('bar'));
		expect(result.examples).to.eql(['foo', 'bar']);
	});

	it('preserves label', function() {
		const result = convert(Joi.string().label('test'));
		expect(result.title).to.eql('test');
	});

	it('preserves description', function() {
		const result = convert(Joi.string().description('test'));
		expect(result.description).to.eql('test');
	});

	it('preserves default', function() {
		const result = convert(Joi.number().default(42));
		expect(result.default).to.eql(42);
	});

	it('supports custom types', function() {
		const inst = new Converter({
			types: {
				foo: (thing, out) => {
					out.type = 'bar';
					return out;
				},
				baz: () => null
			}
		});

		let result = inst.convert(fakeJoi({type: 'foo'}));
		expect(result).to.exist;
		expect(result.type).to.eql('bar');

		result = inst.convert(fakeJoi({type: 'baz'}));
		expect(result).to.not.exist;
	})
});
