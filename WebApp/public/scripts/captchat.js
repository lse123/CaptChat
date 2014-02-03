CaptChat = {
	tCtx: {}, //Canvas context will be assigned here on page load
	fontSize: 20,
	runScript: function(e) {
		if (e.keyCode == 13 && document.getElementById('input').value) {
			//Connection.sendMessage(document.getElementById('input').value);
			CaptChat.doTheThing();
			$('.js_messages').append('<br/>'); //New line between messages
			$('.js_messages').animate({ scrollTop: $('.js_messages').outerHeight() }, 400, 'swing', function() {
										$('.js_messages').stop(); //Stop scroll to prevent it affecting user scrolling
									});
			document.getElementById('input').value = '';
		}
	},

	doTheThing: function(input, partner) {
		input = input || document.getElementById('input').value;
		input = input.trim().replace(/\s+/g, ' ').split(' ');

		var message = $('<span/>', { class: partner ? 'partnerMessage' : 'aMessage' });
		var dataUrlMessage = []; //Array of image dataURLs

		var i = 0;
		for( var word in input ) { //Split message into individual words and Captcha each word
			CaptChat.canvas.width(CaptChat.textWidth(input[word])+10);
			CaptChat.captchaIfy(input[word]);
			message.append(CaptChat.canvas.toImg());

			dataUrlMessage[i] = CaptChat.tCtx.canvas.toDataURL(); //Add dataURL

			CaptChat.canvas.clear();
			i++;
		}

		Connection.sendMessage(JSON.stringify(dataUrlMessage)); //Stringify array and send to server
		$('.js_messages').append(message);
	},

	captchaIfy: function(input) {
		CaptChat.canvas.clear();	//Clear previous Canvas for redraw our captcha

		//Draws random lines behind word
		var numLines = Math.floor(Math.random() * (15 - 5 + 1) + 5);
		for (var i=0;i<numLines;i++) {
			var rX1 = Math.random() * CaptChat.canvas.width(); //Line start position
			var rY1 = Math.random() * CaptChat.canvas.height();
			var rX2 = Math.random() * CaptChat.canvas.width(); //Line end position
			var rY2 = Math.random() * CaptChat.canvas.height();
			var rR = Math.random() * 255; //Random colour for line
			var rG = Math.random() * 255;
			var rB = Math.random() * 255;

			//Draw that line
			CaptChat.tCtx.beginPath();
			CaptChat.tCtx.strokeStyle = 'rgb(' + rR + ',' + rG + ',' + rB + ')';
			CaptChat.tCtx.lineWidth = Math.random() * 1;
			CaptChat.tCtx.moveTo(rX1, rY1);
			CaptChat.tCtx.lineTo(rX2, rY2);
			CaptChat.tCtx.stroke();
		}

		var pos = 0;
		var baseLines = ["middle", "alphabetic"];
		var fMax = CaptChat.fontSize + 2;
		var fMin = CaptChat.fontSize - 2;
			CaptChat.tCtx.strokeStyle = "#000000";
		for (var j = 0; j < input.length; j++) {
			var width = CaptChat.textWidth(input[j]);
			var fontSize = Math.floor(Math.random()*(fMax - fMin + 1) + fMin );
			CaptChat.tCtx.font = "normal "+ fontSize +"px MomsTypewriter";
			CaptChat.tCtx.textBaseline = baseLines[Math.floor(Math.random() * baseLines.length)];
			CaptChat.tCtx.lineWidth = Math.random() * (2 - 0.5) + 0.5;				//Randomish stroke widths
			CaptChat.tCtx.strokeText(input[j],pos,20);
			pos += width;
		}
		// CaptChat.tCtx.strokeText(input,0,20,CaptChat.canvas.width());			//Stroke random string to canvas
	},

	receiveMessage: function(message) { //Displays messages received from other people. Send JSON strinified array of dataURLS
		message = JSON.parse(message);
		var messageSpan = $('<span/>', { class: 'partnerMessage' });
		for (var i=0;i<message.length;i++) {
			var img = $('<img/>', { src: message[i] });
			messageSpan.append(img);
		}
		$('.js_messages').append(messageSpan);
		$('.js_messages').animate({ scrollTop: $('.js_messages').outerHeight() }, 400, 'swing', function() {
							$('.js_messages').stop(); //Stop scroll to prevent it affecting user scrolling
						});
		if (!document.hasFocus()) {
			$('#notify').get(0).play();
		}
	},

	canvas: {
		/*****THERE IS BASICALLY NO TYPE CHECKING, ONLY SEND ACTUAL WIDTH/HEIGHT VALUES KTHX*****/
		//width() returns width, width(width) sets width then returns confirmation
		width: function(width) {
			if( arguments.length ) {
				document.getElementById('textCanvas').width = width;
			}
			return document.getElementById('textCanvas').width;
		},

		//height() returns height, height(height) sets height then returns confirmation
		height: function(height) {
			if( arguments.length ){
				document.getElementById('textCanvas').height = height;
			}
			return document.getElementById('textCanvas').height;
		},

		clear: function(tCtx) {
			tCtx = tCtx || CaptChat.tCtx;
			tCtx.clearRect(0,0,CaptChat.canvas.width(),CaptChat.canvas.height());
		},

		toDataURL: function(tCtx) {
			tCtx = tCtx || CaptChat.tCtx;
			return tCtx.canvas.toDataURL;
		},

		toImg: function(tCtx) {
			tCtx = tCtx || CaptChat.tCtx;
			var	imageElem = document.createElement('img');
			imageElem.src = tCtx.canvas.toDataURL();

			return imageElem;
		},
	},

	// Returns actual pixel width of @param:text or everything inside #input if nothing passed
	textWidth : function(text) {
		text = text || document.getElementById('input').value;
		var textSpan = document.getElementById('textSpan');
		textSpan.style.fontSize = CaptChat.fontSize + 'px'; //Makes sure we're measuring the right font size
		textSpan.innerHTML = text;
		return $(textSpan).width();
	},

	appendImg: function(img) {
		var messages = document.getElementByClassName('messages');
		messages.appendChild(img);
	},
};
