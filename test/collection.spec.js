var MongoMock = require('../MongoMock');

describe('Collection test', function () {
	var mongo, result;

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

	it("#should have collection functionality", function () {
		mongo.collection('fruits').should.have.property('find');
		mongo.collection('fruits').should.have.property('findOne');
		mongo.collection('fruits').should.have.property('findAndModify');
		mongo.collection('fruits').should.have.property('update');
		mongo.collection('fruits').should.have.property('insert');
		mongo.collection('fruits').should.have.property('remove');
	});

	describe('when getting all collection by empty find criteria', function () {
		before(function (done) {
			mongo.collection('fruits').find({}).toArray(function (err, data) {
				result = data;
				done();
			});
		});

		it('#should return all collection', function () {
			result.should.have.length(4);
		});
	});

	describe('when filtering collection by basic criteria', function () {

		before(function (done) {
			mongo.collection('fruits').find({price: 20}).toArray(function (err, fruits) {
				result = fruits;
				done();
			});
		});

		it('#should return 2 fruits with price 20', function () {
			result.should.have.length(2);
		});
	});


	describe('when filtering collection by complex criteria', function () {

		before(function (done) {
			var criteria = {$or: [
				{price: {$gte: 25}} ,
				{tags: { $in: ['Turkey'] }}
			]};
			mongo.collection('fruits').find(criteria).toArray(function (err, fruits) {
				result = fruits;
				done();
			});
		});

		it('#should return 2 fruits, one with price 25 second one with tags containing "Turkey"', function () {
			result.should.have.length(2);
			//todo:update
		});

	});

	describe('when stream collection', function () {
		var cursor, matchcollection = [];
		before(function (done) {
			cursor = mongo.collection('beverages').find();
			cursor.on('data', function (doc) {
				if(doc) {
					matchcollection.push(doc);
				}
			});
			cursor.on('end', done);
		});
		it('should stream all beverages collection', function () {
			matchcollection.should.have.length(3);
		});
	});
});

describe('Verify with callback is working after promises', function () {
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

	it('#should return collection by key', function (done) {
		mongo.collection('beverages').findOne({name: 'CocaCola'}, function (err, data) {
			data.should.be.eql({name: 'CocaCola', price: 15});
			done();
		});
	});

	it('#should update collection item', function (done) {
		mongo.collection('beverages').update({name: 'CocaCola'}, {$set: {price: 20}}, function (err, data) {
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
		mongo.collection('beverages').insert({name: 'Soda', price: 23}, function (err, data) {
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
		mongo.collection('beverages').remove({name: 'Soda'}, function () {

			mongo.collection('beverages')._data.should.have.length(3);

			done();
		});
	});


	it('#should find and modify collection item and return new value', function (done) {
		mongo.collection('beverages').findAndModify({name: 'MongoCola'}, {}, {$set: {price: 99}}, {new: true}, function (err, data) {
			data.should.be.eql({name: 'MongoCola', price: 99});

			done();
		});
	});


	it('#should save collection item', function (done) {
		mongo.collection('beverages').save({name: 'NewCola', price: 11}, function (err, data) {
			data.should.have.property('_id');
			data.should.have.property('name');
			data.should.have.property('price');
			data.name.should.be.eql('NewCola');
			data.price.should.be.eql(11);

			done();
		});
	});
});