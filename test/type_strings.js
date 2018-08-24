const Joi = require('joi');
const expect = require('chai').expect;

const Converter = require('../lib/converter'),
	inst = new Converter;

const convert = thing => inst.convert(thing);


describe('type: strings', function() {
	it('supports Joi.string', function() {
		const result = convert(Joi.string());
		expect(result).to.exist;
		expect(result.type).to.eql('string');
	});

	it('supports min', function() {
		const result = convert(Joi.string().min(3));
		expect(result).to.exist;
		expect(result.minLength).to.eql(3);
	});

	it('supports max', function() {
		const result = convert(Joi.string().max(5));
		expect(result).to.exist;
		expect(result.maxLength).to.eql(5);
	});

	it('supports length', function() {
		const result = convert(Joi.string().length(5));
		expect(result).to.exist;
		expect(result.minLength).to.eql(5);
		expect(result.maxLength).to.eql(5);
	});

	it('allows null', function() {
		const result = convert(Joi.string().allow(null));
		expect(result).to.exist;
		expect(result.nullable).to.eql(true);
	});

	it('allows valid', function() {
		const result = convert(Joi.string().valid('yes', 'no').allow(null));
		expect(result).to.exist;
		expect(result.enum).to.eql(['yes', 'no']);
	})

	it('supports pattern', function() {
		const result = convert(Joi.string().regex(/\d+/));
		expect(result).to.exist;
		expect(result.pattern).to.eql('\\d+');
	});

	it('supports alphanum', function() {
		const result = convert(Joi.string().alphanum());
		expect(result).to.exist;
		expect(result.pattern).to.exist;
	});

	it('supports token', function() {
		const result = convert(Joi.string().token());
		expect(result).to.exist;
		expect(result.pattern).to.exist;
	});

	it('supports hex', function() {
		const result = convert(Joi.string().hex());
		expect(result).to.exist;
		expect(result.pattern).to.exist;

		const other = convert(Joi.string().hex({byteAligned: true}));
		expect(other).to.exist;
		expect(other.pattern).to.not.eql(result.pattern);
	});

	it('supports base64', function() {
		const result = convert(Joi.string().base64());
		expect(result).to.exist;
		expect(result.pattern).to.exist;

		const other = convert(Joi.string().base64({paddingRequired: false}));
		expect(other).to.exist;
		expect(other.pattern).to.not.eql(result.pattern);
	});

	it('supports data uri', function() {
		const result = convert(Joi.string().dataUri());
		expect(result).to.exist;
		expect(result.pattern).to.exist;
	});

	it('supports a few formats', function() {
		expect(convert(Joi.string().ip()).format).to.eql('ipv4');
		expect(convert(Joi.string().uri()).format).to.eql('uri');
		expect(convert(Joi.string().guid()).format).to.eql('uuid');
		expect(convert(Joi.string().hostname()).format).to.eql('hostname');
		expect(convert(Joi.string().email()).format).to.eql('email');
		expect(convert(Joi.string().isoDate()).format).to.eql('date-time');
	});

	it('explicitly does not support features', function() {
		expect(() => convert(Joi.string().regex(/\d+/, {invert: true}))).to.throw();
		expect(() => convert(Joi.string().creditCard())).to.throw();
		expect(() => convert(Joi.string().insensitive())).to.throw();
		expect(() => convert(Joi.string().truncate())).to.throw();
		expect(() => convert(Joi.string().trim())).to.throw();
		expect(() => convert(Joi.string().normalize())).to.throw();
	});
})
