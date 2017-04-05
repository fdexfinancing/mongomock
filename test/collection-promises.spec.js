var MongoMock = require('../MongoMock');

describe('Collection test with promises', function () {
	var mongo;

	before(function () {
		var db = {
			fruits: [
				{name: 'Banana', price: 20},
				{name: 'Apple', price: 10, tags: ['Africa', 'Turkey']},
				{name: 'Orange', price: 25},
				{name: 'Pineapple', price: 20}
			],
			beverages: [
				{name: 'CocaCola', price: 15},
				{name: 'MongoCola', price: 10},
				{name: 'Pepsi', price: 25}
			]
		};
		mongo = new MongoMock(db);
	});

	it('#should return one item collection', function (done) {
		mongo.collection('beverages').findOne({name: 'CocaCola'}).then(function (data) {
			data.should.be.eql({name: 'CocaCola', price: 15});

			done();
		});
	});

	it('#should update collection item', function (done) {
		mongo.collection('beverages').update({name: 'CocaCola'}, {$set: {price: 20}}).then(function (data) {
			data.should.be.eql(1);
			mongo.collection('beverages')._mutableData.should.be.eql([
				{name: 'CocaCola', price: 20},
				{name: 'MongoCola', price: 10},
				{name: 'Pepsi', price: 25}
			]);

			done();
		});
	});

	it('#should insert collection item', function (done) {
		mongo.collection('beverages').insert({name: 'Soda', price: 23}).then(function (data) {
			data.should.have.property('_id');
			data.should.have.property('name');
			data.should.have.property('price');
			data.name.should.be.eql('Soda');
			data.price.should.be.eql(23);

			mongo.collection('beverages')._data.should.have.length(4);

			done();
		});
	});

	it('#should remove collection item', function (done) {
		mongo.collection('beverages').remove({name: 'Soda'}).then(function () {
			mongo.collection('beverages')._data.should.have.length(3);

			done();
		});
	});

	it('#should find and modify item and return new value', function (done) {
		mongo.collection('beverages').findAndModify({name: 'MongoCola'}, {}, {$set: {price: 99}}, {new: true}).then(function (data) {

			data.should.be.eql({name: 'MongoCola', price: 99});

			done();
		});
	});

	it('#should save collection item', function (done) {
		mongo.collection('beverages').save({name: 'NewCola', price: 11}).then(function (data) {
			data.should.have.property('_id');
			data.should.have.property('name');
			data.should.have.property('price');
			data.name.should.be.eql('NewCola');
			data.price.should.be.eql(11);

			done();
		});
	});
});