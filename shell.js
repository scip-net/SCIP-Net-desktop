var defaultHTML = "<span id='prompt'></span><span id='typer'></span><input id='cmd' type='text' autofocus autocomplete='off' onBlur='var e = this; setTimeout(function() { e.focus(); }, 0);' onkeydown='shell.read(event);shell.updateTyper(this.value, event);'><span id='caret' style='left:0px'></span>";

shell = {
	state: 0,
	letterSpacing: 11,
	cursorPosition: 0,
	username: 'researcher',
	hostname: 'scip.net',
	shellElem: null,
	commandElem: null,
	cursor: null,
	typer: null
};
shell.promptText = shell.username + '@' + shell.hostname + '> ';

shell.updateTyper = function(value, e) {
	code = e.keyCode ? e.keyCode : e.charCode;
	if (code == 13)/*Enter*/ return;

	var length = value.length;
	shell.typer.innerHTML = value;

	// TODO: "Del" key
	switch (code) {
		case 8: // Backspace
			if (length == 0 || shell.cursorPosition == 0) return; // No characters to delete.

			shell.cursorPosition--;
			shell.typer.innerHTML = shell.typer.innerHTML.slice(0, shell.cursorPosition) + shell.typer.innerHTML.slice(shell.cursorPosition + 1);
			break;
		case 37: // Left arrow
			if (shell.cursorPosition == 0) return; // Reached beginning of message.

			shell.cursor.style.left = parseInt(shell.cursor.style.left) - shell.letterSpacing + "px";
			shell.cursorPosition--;
			break;
		case 39: // Right arrow
			if (shell.cursorPosition == length) return; // Reached end of message.

			shell.cursor.style.left = parseInt(shell.cursor.style.left) + shell.letterSpacing + "px";
			shell.cursorPosition++;
			break;
		default:
			// Since we are handling the keydown event, the handler will be called before the key
			// has been released, and the character typed into the text field. This creates a
			// difference of one character between the text field and the typer.
			// This compensates for that.
			if(code == 32 /*space*/
			|| (code >= 48 && code <= 57) /*0-9*/
			|| (code >= 65 && code <= 120) /*a-z*/
			|| (code >= 186 && code <= 192) /*,./`-=*/
			|| (code >= 219 && code <= 222) /*[];'\*/
			|| code == 226) { /*other \*/
				typer.innerHTML = shell.typer.innerHTML.slice(0, shell.cursorPosition) + e.key + shell.typer.innerHTML.slice(shell.cursorPosition, shell.typer.innerHTML.length);
				shell.cursorPosition++;
			}
			break;
	}
}

shell.refresh = function() {
	document.getElementById('prompt').innerHTML = shell.promptText;

	shell.commandElem = document.getElementById('cmd');
	shell.commandElem.focus();

	shell.cursor = document.getElementById('caret');
	shell.typer = document.getElementById('typer');
}

shell.print = function(command, output) {
	if (command && command != 'clear') {
		line = shell.promptText + command + '<br>';
		if (output) {
			line += output + '<br>';
		}
	} else {
		line = '';
	}
	
	shell.shellElem.innerHTML = shell.shellElem.innerHTML.substring(0, shell.shellElem.innerHTML.indexOf('<span')) + line + defaultHTML;

	shell.refresh();

	shell.cursorPosition = 0;
	shell.typer.innerHTML = '';
}

shell.executeViewerIntCommand = function(command) {
	args = command.split(' ');
    output = '';
    
	switch (args[0]) {
		case 'exit':
		case 'quit':
		case 'q':
			shell.promptText = shell.username + '@' + shell.hostname + '> ';
			shell.state = 0;
			document.getElementById('prompt').innerHTML = shell.promptText;
			document.getElementById('header').style.backgroundColor = 'green';
			document.getElementById('headerTitle').innerHTML = '<center>SCIP Shell</center>';
			document.getElementById('headerTitle').innerHTML = '<center>SCIP Shell</center>';
			document.getElementById('crt').style.backgroundImage = "url(assets/logo-green.png)";
			
			break;
		default:
            output += 'Unknown input ' + args[0];
            
			break;
    }
	return output;
}

shell.execute = function(command) {
	args = command.split(' ');
    output = '';
    
	switch (args[0]) {
		case 'help':
			output += "---[SCPShell Available Commands]---\n";
			output += " help&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Display this page.\n";
			output += " clear&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Clear the screen.\n";
			output += " pwd&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Display the current working directory.\n";
			output += " whoami&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Display the current user.\n";
			
			break;
		case 'clear':
			shell.shellElem.innerHTML = defaultHTML;
			shell.refresh();
            
			break;
		case 'pwd':
            output += directory.replace('~','/home/' + shell.username);
            
			break;
		case 'whoami':
            output += shell.username;
            
			break;
		case 'scp':
			if (args.length == 3 && args[1] == '-n') {
				fetchSCP(args[2]);
			} else {
				output += "Invalid arguments.\n";
				output += "-n &nbsp;&nbsp;&nbsp;Specify the item ID to fetch\n";
			}

			break;
		default:
            output += 'Unknown command: ' + args[0];
            
			break;
    }
	return output.replace(/\n/g,'<br>');
}

function fetchSCP(id) {
	url = 'http://www.scp-wiki.net/scp-' + id;

	request(url, function(error, response, html) {
		if (!error) {
			var $ = cheerio.load(html);

			oClass = $('strong:contains("Object Class:")')
			objectClass = oClass.parent().text().replace(/Object Class:/g, '');

			scp = $('strong:contains("Special Containment Procedures:")')
			SCPs = scp.parent().text().replace(/Special Containment Procedures:/g, '');

			SCPsArray = $('strong:contains("Special Containment Procedures:")').parent().nextUntil('strong < p').addBack();
			
			output += "Subject class:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>" + objectClass + "</strong><br>";
			output += "Subject number:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>" + id + "</strong><br><br>";
			output += "Special Containment Procedures: <strong>[]</strong><br>";
			output += "<div class='interfaceButton'>q: quit</div>";
			output += "<div class='interfaceButton'>n: next</div>";
			output += "<div class='interfaceButton'>p: prev</div>";

			shell.print('scp -n ' + id, output);
			shell.promptText = ':';
			shell.state = 1;
			document.getElementById('prompt').innerHTML = shell.promptText;
			document.getElementById('header').style.backgroundColor = 'orange';
			document.getElementById('headerTitle').innerHTML = '<center>SCP Viewer Interface</center>';
			document.getElementById('crt').style.backgroundImage = "url(assets/logo-orange.png)";
		}
	});
}

shell.read = function(e) {
	code = e.keyCode ? e.keyCode : e.charCode;
	if (code == 13) { // Enter
		command = cleanHTMLChars(cmd.value);
		if (shell.state == 1) { // SCP Viewer interface
			output = shell.executeViewerIntCommand(command);
			shell.print(command, output);
		} else {
			output = shell.execute(command);

			if (output)
				shell.print(command, output);
		}
	}
}

function initShell() {
	boot.innerHTML = '';
	document.getElementById('header').style.display = 'block';

	document.title = 'Logged in as: ' + shell.username;

	shell.shellElem = document.getElementById('shell');
	shell.shellElem.innerHTML = defaultHTML;

	shell.refresh();
	shell.typer = document.getElementById('typer');
}

function cleanHTMLChars(str) {
	return str.replace(/</g, '&lt;').replace(/\>/g, '&gt;');
}

// Loading sequence

var boot;
var charDelay = 15;

var messages = [
	{text: "Preparing boot procedure...", delay: 1000},
	{text: "===INITIATING STARTUP===", delay: 1000},
	[{text: "Verifying local filesystems.... ", delay: 800}, {text: "done", delay: 300}],
	[{text: "Enabling device drivers.... ", delay: 1200}, {text: "done", delay: 300}],
	{text: "| akclac", delay: 500},
	{text: "| acjhasbd", delay: 200},
	{text: "| pfjofp", delay: 300},
	{text: "| dklb", delay: 500},
	[{text: "…", delay: 200}, {text: "…", delay: 300}, {text: "…", delay: 500}, {text: "…", delay: 700}, {text: "…", delay: 200}, {text: "…", delay: 200}],
	[{text: "Checking service protocol.... ", delay: 1200}, {text: "done", delay: 300}],
	{text: "Boot complete", delay: 500},
];

function typeBootChar(text, callback, i, span) {
	span.innerHTML += text.charAt(i);
	boot.appendChild(span);

	if (++i < text.length) {
		setTimeout(function() {
			typeBootChar(text, callback, i, span);
		}, charDelay);
	} else {
		callback();
	}
}
  
function displayBootMessage(message, subMessageId) {
	var messageId = message;
	var message = messages[messageId];
	
	var length = 0;

	if (Object.prototype.toString.call(message) == "[object Array]") {
		length = message.length;
		message = message[subMessageId];

		subMessageId++;
	}
	var text = message.text;
	var delay = message.delay;

	if (typeof text == "undefined") {
		messageId++;
		subMessageId = 0;
		if (messageId < messages.length) {
			setTimeout(function() {displayBootMessage(messageId, subMessageId)}, delay);
		}
		return;
	}
	
	var span = document.createElement("span");

	typeBootChar(text, function() {
		if (subMessageId >= length) {
			boot.appendChild(document.createElement('br'));
			messageId++;
			if (subMessageId == length && messageId == messages.length) {
				initShell();
				return;
			}
			subMessageId = 0;
		}
		if (messageId < messages.length) {
			setTimeout(function() {displayBootMessage(messageId, subMessageId)}, delay);
		}
	}, 0, span);
}

function initLoadingSequence() {
	boot = document.getElementById('boot');

	initShell();
	// displayBootMessage(0, 0);
}