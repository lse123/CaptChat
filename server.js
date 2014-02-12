var express = require("express"),
	app     = express(),
	server  = require('http').createServer(app),
	io      = require('socket.io').listen(server, {log: false}),
	WEBPORT = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000,
	WEBIP   = process.env.OPENSHIFT_NODEJS_IP   || process.env.IP   || "0.0.0.0";

/* EXPRESS WEB FRAMEWORK THINGS BELOW */
app.set('views', __dirname + '/WebApp');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/WebApp/public'));
app.use(express.logger('dev'));

// Routes
app.get('/', function(req, res) {
	res.render('index', {openshift: process.env.OPENSHIFT_NODEJS_PORT ? true : false});
});

var users = {};

/* SOCKET IO THINGS BELOW */
io.sockets.on('connection', function (socket) {
	//Emit Connected message
	socket.emit('connect', {message: 'Dies ist miene Wassamelone', socketid: socket.id});

	// Listeners
	socket.on('disconnect', function (data){
		var username;
		for (var prop in users) {
			if (users.hasOwnProperty(prop)) {
				if (users[prop].sessionid === socket.id) {
					delete users[prop];
				}
			}
		}
	});
	socket.on('userInfo', function (data){
		console.log(data.username + ' connected with SessionID: ' + socket.id);
		users[data.username] = {
			sessionid : socket.id,
			pubKey : data.pubKey,
		};
		listUsers();
	});
	socket.on('startChat', function (recipient) {
		var data = {};
		if (users.hasOwnProperty(recipient)) { //Check if the requested recipient is connected
			data.name = getUserFromSocket(socket.id);
			console.log(data.name);
			data.pubKey = users[data.name].pubKey;
			sendMessage(recipient, data, 'startChat');
		} else {
			socket.emit('error', {err:'notConnected', message:'User \'' + recipient + '\' is not connected'});
		}
	});
	socket.on('message', function (data) {
		if (users.hasOwnProperty(data.user)) {
			sendMessage(data.user, data.message);
		}
	});
	socket.on('joinRoom', function (room) {
		console.log(socket.id + " JoinedRoon " + room);
		socket.join(room);
	});
	socket.on('leaveRoom', function (room) {
		socket.leave(room);
	});
});

//This is for debugging, shows list of connected usersnames
function listUsers () {
	var keys = [];
	for (var k in users) {
		if (users.hasOwnProperty(k)) {
			keys.push(k);
		}
	}
	console.log(keys);
	return keys;
}

function getUserFromSocket (socket) {
	for (var k in users) {
		if (users.hasOwnProperty(k)) {
			if (users[k].sessionid === socket) return k;
		}
	}
	return false;
}

/* Sends messages to indavidual connected clients
 * @param {String} recipient Username not socketID
 * @param {Object} data Data Object to be sent
 * @param {String} type Optional event type, default: 'message'
 */
function sendMessage (recipient, data, type) {
	type = type || 'message';
	if (users.hasOwnProperty(recipient)) {
		io.sockets.socket(users[recipient].sessionid).emit(type, data);
	}
}

server.listen(WEBPORT, WEBIP);
console.log('Web Server Running on ' + WEBIP + ':' + WEBPORT);
