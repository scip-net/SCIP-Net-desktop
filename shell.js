var username = 'researcher';
var hostname = 'scip.net';
var directory = '~';

var prompt = username + '@' + hostname + ':' + directory + '$ ';
var defaultHTML = "<span id='prompt'></span><input id='cmd' type='text' autofocus autocomplete='off' maxlength=85 onBlur='var e = this; setTimeout(function() { e.focus(); }, 0);' onKeyDown='readCommand(event);moveCursor(this.value.length, event)'><span id='caret' style='left:0'></span>";
var cursor;

function moveCursor(length, e) {
	code = e.keyCode ? e.keyCode : e.charCode;
	if (code == 8) {
		if (length == 0) return;

		cursor.style.left = parseInt(cursor.style.left) - 11 + "px";
	} else {
		var inp = String.fromCharCode(code);
		if (/[a-zA-Z0-9-_ ]/.test(inp)) {
			cursor.style.left = parseInt(cursor.style.left) + 11 + "px";
		}
	}
}

function refreshPrompt() {
	prompt = username + '@' + hostname + ':' + directory + '$ ';
	document.getElementById('prompt').innerHTMl = prompt;	

	cursor = document.getElementById('caret'); // Reference the element again because it changed
}

function printPrompt(cmd, output) {
	if (cmd && cmd != 'clear') {
		line = prompt + cmd + '<br>';
		if (output) {
			line += output + '<br>';
		}
	} else {
		line = '';
	}
	
	shell = document.getElementById('shell');
	shell.innerHTML = shell.innerHTML.substring(0, shell.innerHTML.indexOf('<span')) + line + defaultHTML;

	refreshPrompt();
	
	document.getElementById('prompt').innerHTML = prompt;	
	document.getElementById('cmd').focus();
}

function executeCommand(cmd) {
	args = cmd.split(' ');
    output = '';
    
	switch (args[0]) {
		case 'help':
			output += "---[SCPShell Available Commands]---\n";
			output += " help&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Display this page.\n";
			output += " clear&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Clear the screen.\n";
			output += " pwd&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Display the current working directory.\n";
			output += " whoami&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Display the current logged in user.\n";
			
			break;
		case 'clear':
            document.getElementById('shell').innerHTML = defaultHTML;
            
			break;
		case 'pwd':
            output += directory.replace('~','/home/' + username);
            
			break;
		case 'whoami':
            output += username;
            
			break;
		default:
            output += args[0] + ': command does not exist';
            
			break;
    }
    
	return output.replace(/\n/g,'<br>');
}

function readCommand(e) {
	code = e.keyCode ? e.keyCode : e.charCode;
	switch (code) {
		case 13: // Enter
			command = cleanHTMLChars(document.getElementById('cmd').value);
			output = executeCommand(command);
			printPrompt(command, output);
            
			break;
	}
}

function initShell() {
	document.title = 'Logged in as: ' + username;
	document.getElementById('shell').innerHTML = defaultHTML;
	document.getElementById('prompt').innerHTML = prompt;	
	document.getElementById('cmd').focus();
	cursor = document.getElementById('caret');
}

function cleanHTMLChars(str) {
	return str.replace(/</g, '&lt;').replace(/\>/g, '&gt;');
}