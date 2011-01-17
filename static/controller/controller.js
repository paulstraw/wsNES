var conn;
function connect(){
	if(window["WebSocket"]){
		conn = new WebSocket("ws://" + location.hostname + ":3000");
	}
};

function sendAction(button, status){
	conn.send(JSON.stringify({
		"button": button,
		"status": status
	}));
}

$(document).ready(function(){
	connect();
	
	$(document).bind("touchmove", function(e){
		e.preventDefault();
	});
	
	var gammaButtonState = false;
	$(window).bind("deviceorientation", function(evt){
		var e = evt.originalEvent,
			gamma = e.gamma;
		
		if((gamma > 55 && gamma < 120) || (gamma < -55 && gamma > -120)){
			if(gammaButtonState === false){
				gammaButtonState = true;
				sendAction("a", "on");
			}
		} else if(gammaButtonState === true){
			gammaButtonState = false;
			sendAction("a", "off");
		}
	});
	
	$("#a").bind({
		touchstart: function(){
			console.log("astart");
			sendAction("a", "on");
		},
		touchend: function(){
			sendAction("a", "off");
		}
	});
	
	$("#b").bind({
		touchstart: function(){
			sendAction("b", "on");
		},
		touchend: function(){
			sendAction("b", "off");
		}
	});
	
	$("#start").bind({
		touchstart: function(){
			sendAction("start", "on");
		},
		touchend: function(){
			sendAction("start", "off");
		}
	});
	
	$("#select").bind({
		touchstart: function(){
			sendAction("select", "on");
		},
		touchend: function(){
			sendAction("select", "off");
		}
	});
	
	var lastDpadAction,
		lastDpadButton;
	$("#dpad").bind({
		touchstart: function(event){
			var e = event.originalEvent,
				touchTarget = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY),
				button = $(touchTarget).attr("id"),
				buttonAction = button + "_on";
			
			if(touchTarget.tagName !== "LI"){
				return;
			}
			
			lastDpadButton = button;
			lastDpadAction = buttonAction;
			
			sendAction(button, "on");
			/*
conn.send(JSON.stringify({
				"action": buttonAction
			}));
*/
		},
		touchmove: function(event){
			var e = event.originalEvent,
				touchTarget = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY),
				button = $(touchTarget).attr("id"),
				buttonClass = $(touchTarget).attr("class");
			
			if(buttonClass !== "dpad"){
				if(lastDpadAction !== lastDpadButton + "_off"){
					lastDpadAction = lastDpadButton + "_off";
					
					sendAction(button, "off");
					/*
conn.send(JSON.stringify({
						"action": lastDpadButton + "_off"
					}));
*/
				}
			} else if(lastDpadAction !== button + "_on"){
				lastDpadAction = button + "_on";
				lastDpadButton = button;
				
				sendAction(button, "on");
				/*
conn.send(JSON.stringify({
					"action": button + "_on"
				}));
*/
			}
		},
		touchend: function(e){
			var touchTarget = e.target;
				button = $(touchTarget).attr("id"),
				buttonAction = button + "_off",
				buttonClass = $(touchTarget).attr("class");
			
			if(buttonClass === "dpad"){
				lastDpadButton = button;
				lastDpadAction = buttonAction;
				
				sendAction(button, "off");
				/*
conn.send(JSON.stringify({
					"action": buttonAction
				}));
*/
			}
		}
	});
});