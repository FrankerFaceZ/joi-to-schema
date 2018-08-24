'use strict';

const TYPES = require('./types');

module.exports = Converter;

/**
 * Create a new Converter.
 *
 * @constructor
 * @param {Object} [opts] Options for initializing this Converter
 * @param {Object} [opts.types] Custom handlers for different Joi types.
 * @param {String} [opts.ipFormat=ipv4] The specific format for IP formatted strings.
 * This should be `ipv4` or `ipv6`.
 * @param {String} [opts.extractPath="/components/schemas/"] When extracting sub-trees
 * from the generated schema, the references should be generated with this base path.
 * @param {Boolean} [opts.ignoreUnknownRules=false] If this is true, the converter will
 * skip rules with unknown names rather than throwing an error.
 * @param {Boolean} [opts.ignoreUnknownTypes=false] If this is true, the converter will
 * skip objects with unknown types rather than throwing an error.
 *
 * @property {Object} schemas Any sub-trees that are extracted from schemas generated
 * with {@link Converter#convert} will be stored on this object for easy access
 * and re-use.
 */
function Converter(opts) {
	if ( !(this instanceof Converter) )
		return new Converter(opts);

	this.opts = opts || {};
	this.opts.ipFormat = this.opts.ipFormat || 'ipv4';
	this.opts.types = this.opts.types || {};
	this.opts.extractPath = this.opts.extractPath || '/components/schemas/';

	this.schemas = {};
}


/**
 * Recursively convert a [Joi](https://github.com/hapijs/joi/) schema
 * object into a JSON schema and return the resulting schema. This supports
 * most of Joi, throwing errors when it encounters something it is
 * unable to handle.
 *
 * Metadata is passed through directly to the resulting object. Other
 * data is passed through type-specific handlers.
 *
 * If a Joi object has attached `className` metadata, the resulting schema
 * will be extracted from the tree and placed into {@link Converter#schemas}.
 * A `$ref` will be inserted into the tree in its place.
 *
 * @example
 * my_converter.convert(Joi.string().min(3))
 *
 * // {
 * //     "type": "string",
 * //     "minLength": 3
 * // }
 *
 * @example
 * my_converter.convert(Joi.object({
 *     bar: Joi.string()
 * }).meta({
 *     className: 'Foo'
 * }))
 *
 * // {
 * //     "$ref": "#/components/schemas/Foo"
 * // }
 *
 *
 * my_converter.schemas
 *
 * // {
 * //     Foo: {
 * //         type: 'object',
 * //         properties: {
 * //             bar: {type: 'string'}
 * //         }
 * //     }
 * // }
 *
 *
 * @param {Joi} schema The Joi schema to convert
 * @returns {Object} The converted JSON Schema
 * @throws {Error} If we encounter an unknown Joi type, an unknown rule,
 * or a rule that we are unable to correctly translate into JSON Schema,
 * an error is thrown.
 */
Converter.prototype.convert = function(schema) {
	if ( ! schema.isJoi )
		throw new TypeError('schema must be a Joi object');

	// Get a more reasonable representation of the schema to work with.
	schema = schema.describe();

	return this._convert(schema);
}

/**
 * The heart of the conversion process. This is the method that actually
 * builds the output and calls the type-specific handlers.
 *
 * @private
 * @param {Object} thing The schema to convert, output from {@link Joi#describe}.
 * @returns {Object} JSON Schema
 */
Converter.prototype._convert = function(thing) {
	const type = thing.type,
		fn = this.opts.types[type] || TYPES[type];

	if ( ! fn ) {
		if ( this.opts.ignoreUnknownTypes )
			return;

		throw new Error('unknown type for Joi object', type);
	}

	thing.rules = thing.rules || [];
	thing.valids = thing.valids || [];
	thing.flags = thing.flags || {};

	let out = {};

	if ( thing.valids.includes(null) )
		out.nullable = true;

	if ( thing.flags.allowOnly && thing.valids.length ) {
		out.enum = thing.valids.filter(x => x !== null);
	}

	if ( thing.meta )
		out.meta = Object.assign({}, ...thing.meta);

	if ( thing.notes ) {
		const meta = out.meta = out.meta || {};
		meta.notes = (meta.notes || []).concat(thing.notes);
	}

	if ( thing.tags ) {
		const meta = out.meta = out.meta || {};
		meta.tags = (meta.tags || []).concat(thing.tags);
	}

	if ( thing.unit ) {
		const meta = out.meta = out.meta || {};
		meta.unit = thing.unit;
	}

	if ( thing.examples )
		out.examples = thing.examples;

	if ( thing.label )
		out.title = thing.label;

	if ( thing.description )
		out.description = thing.description;

	if ( thing.flags.default !== undefined )
		out.default = thing.flags.default;

	out = fn(thing, out, this);
	if ( ! out )
		return;

	if ( out.meta && out.meta.className ) {
		const name = out.meta.className,
			path = name.startsWith('/') ? name : this.opts.extractPath + name;

		delete out.meta.className;
		if ( ! Object.keys(out.meta).length )
			delete out.meta;

		this.schemas[name] = out;

		return {
			'$ref': `#${path}`
		}
	}

	return out;
}
