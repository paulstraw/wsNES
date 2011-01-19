var conn;
function connect(){
	if(window["WebSocket"]){
		conn = new WebSocket("ws://" + location.hostname + ":3000");
	}
}

$(document).ready(function(){
	var consoleID,
		controllerID;
	
	connect();
	
	conn.onmessage = function(e){
		var data = JSON.parse(e.data),
			action = data["action"];
		
		if(action === "sendConnectionID"){
			consoleID = data["connectionID"];
			console.log(consoleID);
		} else if( action === "controllerConnect"){
			controllerID = data["controllerID"];
		} else if(action === "buttonPress"){
			var button = data["button"],
				status = data["status"],
				keyCode;
			
			switch(button){
				case "up": keyCode = 38; break;
				case "down": keyCode = 40; break;
				case "left": keyCode = 37; break;
				case "right": keyCode = 39; break;
				case "b": keyCode = 90; break;
				case "a": keyCode = 88; break;
				case "select": keyCode = 17; break;
				case "start": keyCode = 13; break;
			}
			
			$("#lastmessage").prepend(button + " " + status + "<br />");
			
			if(status === "on"){
				$(document).trigger({
					type: "keydown",
					keyCode: keyCode
				});
			} else {
				$(document).trigger({
					type: "keyup",
					keyCode: keyCode
				});
			}
		}
	};
	
	$.ajax({
		type: "get",
		url: "/listroms",
		success: function(roms){
			new JSNES({
				"ui": $("#jsnes").text("").JSNESUI({
					"Roms": roms
				})
			});
		}
	});
});