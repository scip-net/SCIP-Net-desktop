var username = 'researcher';
var hostname = 'scip.net';
var directory = '~';

var prompt = username + '@' + hostname + ':' + directory + '$ ';
var defaultHTML = "<span id='prompt'></span><span id='typer'></span><input id='cmd' type='text' autofocus autocomplete='off' onBlur='var e = this; setTimeout(function() { e.focus(); }, 0);' onkeydown='readCommand(event);updateTyper(this.value, event);'><span id='caret' style='left:0px'></span>";

var cursor;
var typer;
var cursorPosition = 0;
var letterSpacing = 11;

function updateTyper(value, e) {
	code = e.keyCode ? e.keyCode : e.charCode;
	if (code == 13) return;

	var length = value.length;
	typer.innerHTML = value;

	switch (code) {
		case 8: // Backspace
			if (length == 0) return;

			cursorPosition--;
			break;
		case 37: // Left arrow
			if (cursorPosition == 0) return;

			cursor.style.left = parseInt(cursor.style.left) - letterSpacing + "px";
			cursorPosition--;
			break;
		case 39: // Right arrow
			if (cursorPosition == length) return;

			cursor.style.left = parseInt(cursor.style.left) + letterSpacing + "px";
			cursorPosition++;
			break;
		default:
			if((code >= 65 && code <= 120) /*a-z 0-9 NumPad*/
			|| (code >= 186 && code <= 192) /*,./`-=*/
			|| (code >= 219 && code <= 222) /*[];'\*/
			|| code == 226) { /*\*/
				typer.innerHTML = typer.innerHTML.slice(0, cursorPosition) + e.key + typer.innerHTML.slice(cursorPosition, typer.innerHTML.length);
				cursorPosition++;
			}
			break;
	}
}

function refreshPrompt() {
	prompt = username + '@' + hostname + ':' + directory + '$ ';
	document.getElementById('prompt').innerHTMl = prompt;	

	cursor = document.getElementById('caret');
	typer = document.getElementById('typer');
	typer.innerHTML = '';
	cursorPosition = 0;
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
	typer = document.getElementById('typer');
}

function cleanHTMLChars(str) {
	return str.replace(/</g, '&lt;').replace(/\>/g, '&gt;');
}
