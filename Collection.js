var _ = require('./util');
var Cursor = require('./Cursor');
var Promise = require('es6-promise').Promise;
var err = null;

function noop() {
}

function Collection(initialArray) {
	this._data = initialArray.slice();
	this._mutableData = initialArray.slice();
}

Collection.prototype._restore = function () {
	this._mutableData = this._data.slice();
};

Collection.prototype.find = function (query, fields, options) {
	query = query || {};
	//source, query, fields, options
	var cursor = new Cursor(this._mutableData.slice(), query, fields, options);
	return cursor;
};

Collection.prototype.save = function (doc, options, callback) {
	if (!callback) {
		callback = options;
	}


	if (doc._id) {
		if (callback && typeof callback === 'function') {
			this.update({_id: doc._id}, doc, {upsert: true}, callback);
		}
		else {
			return this.update({_id: doc._id}, doc, {upsert: true});
		}
	} else {
		if (callback && typeof callback === 'function') {
			this.insert(doc, callback);
		}
		else {
			return this.insert(doc);
		}
	}

};

Collection.prototype.findOne = function(query, callback) {
	var self = this;
	// Execute using callback

	if(callback && typeof callback === 'function') {
		return findOne.call(this, query, callback);
	}

	// Return a Promise
	return new Promise(function (resolve, reject) {
		if(err){
			return reject(err);
		}

		resolve(_(self._data).findOne(query));
	});
};

var findOne = function (query, callback) {
	callback(null, _(this._data).findOne(query));
};

Collection.prototype.count = function (query, options, callback) {
	if ('function' === typeof options) {
		callback = options, options = {};
	}
	if (options === null) {
		options = {};
	}

	if ('function' !== typeof callback) {
		callback = null;
	}

	var count = _(this._data).find(query, options).length;
	callback(null, count);
};

Collection.prototype.toArray = function (callback) {
	if (callback) {
		callback(null, this._mutableData.slice());
	}
};

Collection.prototype.insert = function (doc, options, callback) {
	var self = this;

	if ('function' === typeof options) {
		callback = options, options = {};
	}

	if (options === null) {
		options = {};
	}

	if(callback && typeof callback === 'function') {
		return insert.call(this, doc, options, callback);
	}

	return new Promise(function (resolve, reject) {
		if(err){
			return reject(err);
		}

		var counter = _(self._data).insert(doc);
		self._restore();

		resolve(counter);
	});
};

var insert = function (doc, options, callback) {
	_(this._data).insert(doc);
	this._restore();
	callback(null, doc);
};


Collection.prototype.update = function (query, modifier, options, callback) {
	var self = this;

	if ('function' === typeof options) {
		callback = options, options = {};
	}

	if (options === null) {
		options = {};
	}

	if (modifier.$set && modifier.$set._id) {
		delete modifier.$set._id;
	}

	if(callback && typeof callback === 'function') {
		return update.call(this, query, modifier, options, callback);
	}

	return new Promise(function (resolve, reject) {
		if(err){
			return reject(err);
		}

		var counter = _(self._data).update(query, modifier, options);
		self._restore();

		resolve(counter);
	});
};


var update = function (query, modifier, options, callback) {
	var counter = _(this._data).update(query, modifier, options);
	this._restore();

	callback(null, counter);
};


Collection.prototype.remove = function (query, callback) {
	var self = this;

	if(callback && typeof callback === 'function') {
		return remove.call(this, query, callback);
	}

	callback = callback || noop;
	_(this._data).remove(query);
	this._restore();
	callback();

	return new Promise(function (resolve, reject) {
		if(err){
			return reject(err);
		}

		_(self._data).remove(query);
		self._restore();

		resolve();
	});
};

var remove = function (query, callback) {
	_(this._data).remove(query);
	this._restore();
	callback();
};

Collection.prototype.findAndModify = function (query, sort, modifier, options, callback) {
	var self = this;

	if ('function' === typeof options) {
		callback = options, options = {};
	}

	if (options === null) {
		options = {};
	}

	if (modifier.$set && modifier.$set._id) {
		delete modifier.$set._id;
	}

	if(callback && typeof callback === 'function') {
		return findAndModify.call(this, query, modifier, options, callback);
	}

	return new Promise(function (resolve, reject) {
		if(err){
			return reject(err);
		}

		var doc = _(self._data).findAndModify(query, modifier, options);
		self._restore();

		resolve(doc);
	});
};

var findAndModify = function (query, modifier, options, callback) {
	var doc = _(this._data).findAndModify(query, modifier, options);
	this._restore();
	callback(null, doc);
};

Collection.prototype.findOneAndUpdate = function (query, modifier, options, callback) {
	var self = this;

	if ('function' === typeof options) {
		callback = options, options = {};
	}

	if (options === null) {
		options = {};
	}

	if (modifier.$set && modifier.$set._id) {
		delete modifier.$set._id;
	}

	if(callback && typeof callback === 'function') {
		return findAndModify.call(this, query, modifier, options, callback);
	}

	return new Promise(function (resolve, reject) {
		if(err){
			return reject(err);
		}

		var doc = _(self._data).findAndModify(query, modifier, options);
		self._restore();

		resolve(doc);
	});
};

module.exports = Collection;