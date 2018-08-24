'use strict';

const unsupportedError = name => new Error(`${name} is not supported by JSON Schema`);

const PATTERNS = {
	ALPHANUM: {
		insensitive: '^[a-zA-Z0-9]+$',
		lower: '^[a-z0-9]+$',
		upper: '^[A-Z0-9]+$'
	},
	TOKEN: {
		insensitive: '^[a-zA-Z0-9_]+$',
		lower: '^[a-z0-9_]+$',
		upper: '^[A-Z0-9_]+$'
	},
	HEX: {
		bytes: '^([a-fA-Z0-9]{2})+$',
		normal: '^[a-fA-Z0-9]+$'
	},
	BASE64: '^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$'
}


exports.alternatives = function(thing, out, converter) {
	const items = [];
	let term = 'anyOf';

	if ( out.meta && out.meta.term ) {
		term = out.meta.term;
		delete out.meta.term;
		if ( ! Object.keys(out.meta).length )
			delete out.meta;
	}

	for(const item of thing.alternatives) {
		if ( item.is || item.then || item.otherwise )
			throw unsupportedError(`alternatives.when()`);

		const processed = converter._convert(item);
		if ( processed )
			items.push(processed);
	}

	out[term] = items;
	return out;
}


exports.array = function(thing, out, converter) {
	const ordered = [];
	let items = [];

	if ( thing.flags.sparse )
		throw unsupportedError(`array.sparse()`);

	for(const rule of thing.rules) {
		const name = rule.name;

		if ( name === 'min' )
			out.minItems = rule.arg;

		else if ( name === 'max' )
			out.maxItems = rule.arg;

		else if ( name === 'length' )
			out.minItems = out.maxItems = rule.arg;

		else if ( name === 'unique' ) {
			if ( rule.arg.ignoreUndefined )
				throw unsupportedError(`array.unique(..., {ignoreUndefined: true})`);

			if ( rule.arg.comparator )
				throw unsupportedError(`array.unique(comparatorFn)`);

			out.uniqueItems = true;
		}
	}

	if ( thing.items )
		for(const item of thing.items) {
			const processed = converter._convert(item);
			if ( processed )
				items.push(processed);
		}

	if ( thing.orderedItems )
		for(const item of thing.orderedItems) {
			const processed = converter._convert(item);
			if ( processed )
				ordered.push(processed);
		}

	if ( items.length === 1 )
		items = items[0];
	else if ( items.length > 1 )
		items = {
			anyOf: items
		}
	else
		items = null;

	if ( ordered.length > 0 ) {
		out.items = ordered;
		if ( items )
			out.additionalItems = items;

	} else if ( items )
		out.items = items;

	out.type = 'array';
	return out;
}


exports.boolean = function(thing, out, converter) {
	if ( thing.truthy.length !== 1 )
		throw unsupportedError('boolean.truthy()');

	if ( thing.falsy.length !== 1 )
		throw unsupportedError('boolean.falsy()');

	if ( thing.rules.length && ! converter.opts.ignoreUnknownRules )
		throw unsupportedError(`boolean rule:${thing.rules[0].name}`);

	out.type = 'boolean';
	return out;
}


exports.binary = function(thing, out, converter) {
	out.type = 'string';
	out.format = 'binary';

	if ( thing.flags.encoding === 'base64' )
		out.format = 'byte';

	else if ( thing.flags.encoding )
		throw unsupportedError(`binary.encoding('${thing.flags.encoding}')`);


	for(const rule of thing.rules) {
		const name = rule.name;

		if ( name === 'min' )
			out.minLength = rule.arg;

		else if ( name === 'max' )
			out.maxLength = rule.arg;

		else if ( name === 'length' )
			out.minLength = out.maxLength = rule.arg;

		else if ( ! converter.opts.ignoreUnknownRules )
			throw unsupportedError(`binary rule:${rule.name}`);
	}

	return out;
}


exports.date = function(thing, out, converter) {
	out.type = 'string';
	out.format = 'date-time';

	if ( thing.flags.timestamp )
		throw unsupportedError(`date.timestamp()`);

	for(const rule of thing.rules) {
		const name = rule.name;

		if ( name === 'min' )
			out.formatMinimum = rule.arg.toISOString();

		else if ( name === 'max' )
			out.formatMaximum = rule.arg.toISOString();

		else if ( name === 'greater' )
			out.formatExclusiveMinimum = rule.arg.toISOString();

		else if ( name === 'less' )
			out.formatExclusiveMaximum = rule.arg.toISOString();

		else if ( ! converter.opts.ignoreUnknownRules )
			throw unsupportedError(`date rule:${rule.name}`);
	}

	return out;
}


exports.number = function(thing, out, converter) {
	out.type = 'number';

	for(const rule of thing.rules) {
		const name = rule.name;

		if ( name === 'integer' )
			out.type = 'integer';

		else if ( name === 'precision' ) {
			out.type = 'number';
			out.format = 'double';

		} else if ( name === 'greater' )
			out.exclusiveMinimum = rule.arg;

		else if ( name === 'less' )
			out.exclusiveMaximum = rule.arg;

		else if ( name === 'min' )
			out.minimum = rule.arg;

		else if ( name === 'max' )
			out.maximum = rule.arg;

		else if ( name === 'multiple' )
			out.multipleOf = rule.arg;

		else if ( name === 'positive' )
			out.exclusiveMinimum = Math.max(0, out.exclusiveMinimum || 0);

		else if ( name === 'negative' )
			out.exclusiveMaximum = Math.min(0, out.exclusiveMaximum || 0);

		else if ( name === 'port' ) {
			out.type = 'integer';
			out.minimum = Math.max(0, out.minimum || 0);
			out.maximum = Math.min(65535, out.maximum || 65535);

		} else if ( ! converter.opts.ignoreUnknownRules )
			throw unsupportedError(`number rule:${rule.name}`);
	}

	return out;
}


exports.object = function(thing, out, converter) {
	out.type = 'object';

	if ( thing.flags.allowUnknown != null )
		out.additionalProperties = thing.flags.allowUnknown;

	for(const rule of thing.rules) {
		const name = rule.name;

		if ( name === 'min' )
			out.minProperties = rule.arg;

		else if ( name === 'max' )
			out.maxProperties = rule.arg;

		else if ( name === 'length' )
			out.minProperties = out.maxProperties = rule.arg;

		else if ( ! converter.opts.ignoreUnknownRules )
			throw unsupportedError(`object rule:${rule.name}`);
	}

	const required = [];

	if ( thing.children ) {
		const properties = out.properties = {};

		for(const [key, item] of Object.entries(thing.children)) {
			const presence = item.flags && item.flags.presence || 'optional';
			if ( presence === 'forbidden' )
				continue;

			const processed = converter._convert(item);
			if ( ! item )
				continue;

			if ( presence === 'required' )
				required.push(key);

			properties[key] = processed;
		}
	}

	if ( thing.patterns ) {
		const properties = out.patternProperties = {};
		for(const rule of thing.patterns) {
			if ( rule.schema )
				throw unsupportedError(`object.pattern(schema)`);

			const processed = converter._convert(rule.rule);
			if ( processed ) {
				const regex = rule.regex;
				properties[regex.slice(1, regex.lastIndexOf('/'))] = processed;
			}
		}
	}

	if ( thing.dependencies ) {
		const dependencies = out.dependencies = {};
		for(const rule of thing.dependencies) {
			const type = rule.type;

			if ( type === 'and' ) {
				for(const value of rule.peers)
					dependencies[value] = rule.peers.filter(x => x !== value);

			} else if ( type === 'with' ) {
				dependencies[rule.key] = rule.peers;

			} else
				throw unsupportedError(`object dependency:${type}`);
		}
	}

	if ( required.length )
		out.required = required;

	return out;
}


exports.string = function(thing, out, converter) {
	out.type = 'string';

	if ( thing.flags.truncate )
		throw unsupportedError('string.truncate()');

	if ( thing.flags.trim )
		throw unsupportedError('string.trim()');

	if ( thing.flags.normalize )
		throw unsupportedError('string.normalize()');

	if ( thing.flags.insensitive )
		throw unsupportedError('string.insensitive()');

	for(const rule of thing.rules) {
		const name = rule.name;

		if ( name === 'min' )
			out.minLength = rule.arg;

		else if ( name === 'max' )
			out.maxLength = rule.arg;

		else if ( name === 'length' )
			out.minLength = out.maxLength = rule.arg;

		else if ( name === 'alphanum' )
			out.pattern = PATTERNS.ALPHANUM[thing.flags.case || 'insensitive'];

		else if ( name === 'token' )
			out.pattern = PATTERNS.TOKEN[thing.flags.case || 'insensitive'];

		else if ( name === 'ip' )
			out.format = converter.opts.ipFormat || 'ipv4';

		else if ( name === 'uri' )
			out.format = 'uri';

		else if ( name === 'guid' )
			out.format = 'uuid';

		else if ( name === 'hex' )
			out.pattern = PATTERNS.HEX[thing.flags.byteAligned ? 'bytes' : 'normal'];

		else if ( name === 'base64' || name === 'dataUri' )
			out.pattern = rule.arg.source;

		else if ( name === 'hostname' )
			out.format = 'hostname';

		else if ( name === 'email' )
			out.format = 'email';

		else if ( name === 'isoDate' )
			out.format = 'date-time';

		else if ( name === 'regex' ) {
			if ( rule.arg.invert )
				throw unsupportedError('string.regex(..., {invert: true})');

			out.pattern = rule.arg.pattern.source;

		} else if ( ! converter.opts.ignoreUnknownRules )
			throw unsupportedError(`string rule:${rule.name}`);
	}

	return out;
}
