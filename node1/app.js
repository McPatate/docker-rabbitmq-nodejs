#!/usr/bin/env node

var amqp = require('amqp');
var mongoose = require('mongoose');

// Solve healthcheck problem in docker-compose then remove this line
setTimeout(function() { mongoose.connect('mongodb://mongodb:27017'); }, 10000);

var Climber = require ('./model');

/*var climber = new Climber({ name: "Denis", gym: "Arkose Nation"});

climber.save(function(err) {
    if (err)
	console.log('err: %j', err);
});*/


console.log('Starting to connect to Rabbit MQ...');

var connection = amqp.createConnection({ host: "rabbitmq" }, {reconnect:false});

console.log('Connection Created. Waiting for connection be ready...');

// Wait for connection to become established.
connection.on('ready', function () {
    console.log('Connection ready for use. Connecting to "logs" exchange...');

    connection.exchange('logs', {type: 'fanout', autoDelete: false}, function(exchange){
	console.log('The "logs" exchange is now ready for use. Publishing message...');

	var message = 'hello world @ ' + new Date();
	exchange.publish('', message);

	console.log('Published message: "' + message + '"');
	// Allow 1 second for the message publishing to complete
	setTimeout(function() {

	    console.log('Disconnecting...');

	    connection.disconnect();

	    console.log('Disconnected. Exiting...');
	}, 200);
    });
});

/*
if( process.argv.length < 3) {
    console.error('Please provide a queue name to connect to');
    return process.exit(1);
}

console.log('Starting to connect to Rabbit MQ...');

var connection = amqp.createConnection({ host: process.env.RABBITMQ_PORT_5672_TCP_ADDR }, {reconnect:false});

console.log('Connection Created. Waiting for connection be ready...');

// Wait for connection to become established.
connection.on('ready', function () {
    console.log('Connection ready for use. Connecting to "logs" exchange...');

    connection.exchange('logs', {type: 'fanout', autoDelete: false}, function(exchange){

	var queueName = process.argv[2];
	console.log('The "logs" exchange is now ready for use. Connecting to queue ' + queueName);

	connection.queue(queueName, { autoDelete: false }, function(q){
	    console.log('Connected to "' + queueName + '" queue. Waiting for queue to become ready');

	    // Catch all messages
	    q.bind('logs', '');

	    //q.on('queueBindOk', function() {
	    console.log('The queue is now ready for use. Subscribing for messages (Ctrl+c to disconnect)...');

	    // Receive messages
	    q.subscribe(function (message) {
		console.log('Received message... ');
		// Print messages to stdout
		var buf = new Buffer(message.data);
		console.log(buf.toString('utf-8'));
	    });
	    //});
	});
    });
});
*/
