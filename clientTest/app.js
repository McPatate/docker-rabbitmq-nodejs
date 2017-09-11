#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var mongoose = require('mongoose');

mongoose.connect('mongodb://mongodb:27017');

var Climber = require ('./model');
var names = ['Greg', 'David', 'Jim', 'John', 'Sam', 'Luc', 'Philip'];
var gyms = ['Arkose Nation', 'Solo Escalade', 'Bloc Session'];

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1)) + min;
}

amqp.connect('amqp://rabbitmq', function(err, conn) {
    console.log('Connected to rabbit');
    conn.createChannel(function(err, ch) {
	var q1 = 'fanBoard';
	var q2 = 'fanBoard2';
	var msg = '{"name": "' + names[getRandomIntInclusive(0,6)] + '", "gym": "' + gyms[getRandomIntInclusive(0,2)] + '"}';

	ch.assertQueue(q1, {durable: true});
	ch.assertQueue(q2, {durable: true});
	// Note: on Node 6 Buffer.from(msg) should be used
	ch.sendToQueue(q2, new Buffer(msg), {persistent: true});
	console.log(" [x] Sent %s", msg);
	ch.consume(q1, function (msg) {
	    console.log(" [x] Received %s", msg.content.toString());
	    conn.close();
	});
    });
});

amqp.connect('amqp://rabbitmq', function(err, conn) {
    console.log('Re-connected to rabbit');
    conn.createChannel(function (err, ch) {
	var q1 = 'fanBoard';
	var q2 = 'fanBoard2';

	ch.assertQueue(q1, {durable: true});
	ch.assertQueue(q2, {durable: true});
	ch.consume(q2, function (msg) {
	    try {
		var item = JSON.parse(msg.content.toString());
	    }
	    catch (e) {
		console.log("Invalid message received");
	    }
	    if (typeof item === "object" && item !== null) {
		console.log('item: %j', item);
		var climber = new Climber(item);

		climber.save(function(err) {
		    if (err)
			console.log('err: %j', err);
		    else
			console.log('climber saved ok');
		});
		Climber.find({}, function (err, climbers) {
		    if (err)
			console.log('err: %j', err);
		    if (!err && climbers) {
			ch.sendToQueue(q1, new Buffer(climbers.toString()), {persistent: true});
			console.log('sent: %s', climbers.toString());
		    }
		    setTimeout(function () {conn.close(); process.exit(0);}, 5000);
		});
	    }
	}, {noAck: true});
    });
});
