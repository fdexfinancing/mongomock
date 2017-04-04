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

	describe('when getting one item of collection by some find criteria', function () {
		it('#should return all collection', function (done) {
			mongo.collection('beverages').findOne({name: 'CocaCola'}).then(function (data) {
				data.should.be.eql({name: 'CocaCola', price: 15});

				done();
			});
		});
	});
});