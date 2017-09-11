#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var mongoose = require('mongoose');
var Climber = require ('./model');

// Solve healthcheck problem in docker-compose then remove this line
setTimeout(function() {

    mongoose.connect('mongodb://mongodb:27017');
    amqp.connect('amqp://rabbitmq', function(err, conn) {
	console.log('Connected to rabbit');
	conn.createChannel(function(err, ch) {
	    var q1 = 'fanBoard';
	    var q2 = 'fanBoard2';

	    ch.assertQueue(q1, {durable: true});
	    ch.assertQueue(q2, {durable: true});
	    ch.consume(q2, function(msg) {
		try {
		    var item = JSON.parse(msg.content.toString());
		}
	        catch (e) {
		    console.log(" [x] Received %s", msg.content.toString());
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

}, 20000);
