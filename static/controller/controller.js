$(document).ready(function(){
	var conn,
		controllerID,
		consoleID,
		standalone = window.navigator.standalone;
	
	//Stop touchmove from scrolling the page:
	$(document).bind("touchmove", function(e){
		e.preventDefault();
	});
	
	if(standalone){
		init();
	} else {
		$("#installer").show();
	}
	
	function init(){
		if(!window.WebSocket){
			alert("Your browser doesn't support WebSockets; please update to iOS 4.2 or later.");
			return;
		}
		
		conn = new WebSocket("ws://" + location.hostname + ":3000");
			conn.onmessage = function(e){
			var data = JSON.parse(e.data),
				action = data["action"];
			
			if(action === "sendConnectionID"){
				controllerID = data["id"];
			} else if(action === "connectedToConsole"){
				connectedToConsole();
			}
		};
		
		setTimeout(function(){
			checkOrientation(true);
		}, 50);
		
		$(window).bind("orientationchange", function(){
			checkOrientation();
		});
		
		$("input").keydown(connectToConsole);
		
		
	};
	
	function checkOrientation(launch){
		var orientation = window.orientation;
		
		if(launch){
			$("#orientation").fadeIn(120);
			return;
		}
		
		if(orientation === 0){
			if(consoleID){
				sendButtonPress("start", "on");
				sendButtonPress("start", "off");
			}
			
			$("#orientation").fadeIn(120);
		} else {
			$("#orientation").fadeOut(200);
		}
	}
	
	function sendButtonPress(button, status){
		conn.send(JSON.stringify({
			"action": "buttonPress",
			"button": button,
			"status": status
		}));
	}
	
	function connectToConsole(e){
		if(e.which === 13){
			e.preventDefault();
			
			conn.send(JSON.stringify({
				"action": "connectToConsole",
				"consoleID": $("input").val()
			}));
		}
	}
	
	function connectedToConsole(){
		consoleID = $("input").val();
		initController();
	}
	
	function initController(){
		$("#connect").fadeOut(200);
		$("#controller").fadeIn(200);
		
		var gammaButtonState = false;
		$(window).bind("deviceorientation", function(evt){
			var e = evt.originalEvent,
				gamma = e.gamma;
			
			if((gamma > 55 && gamma < 130) || (gamma < -55 && gamma > -130)){
				if(gammaButtonState === false){
					gammaButtonState = true;
					sendButtonPress("a", "on");
				}
			} else if(gammaButtonState === true){
				gammaButtonState = false;
				sendButtonPress("a", "off");
			}
		});
		
		$("#a").bind({
			touchstart: function(){
				console.log("astart");
				sendButtonPress("a", "on");
			},
			touchend: function(){
				sendButtonPress("a", "off");
			}
		});
		
		$("#b").bind({
			touchstart: function(){
				sendButtonPress("b", "on");
			},
			touchend: function(){
				sendButtonPress("b", "off");
			}
		});
		
		$("#start").bind({
			touchstart: function(){
				sendButtonPress("start", "on");
			},
			touchend: function(){
				sendButtonPress("start", "off");
			}
		});
		
		$("#select").bind({
			touchstart: function(){
				sendButtonPress("select", "on");
			},
			touchend: function(){
				sendButtonPress("select", "off");
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
				
				sendButtonPress(button, "on");
			},
			touchmove: function(event){
				var e = event.originalEvent,
					touchTarget = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY),
					button = $(touchTarget).attr("id"),
					buttonClass = $(touchTarget).attr("class");
				
				if(buttonClass !== "dpad"){
					if(lastDpadAction !== lastDpadButton + "_off"){
						lastDpadAction = lastDpadButton + "_off";
						
						sendButtonPress(lastDpadButton, "off");
					}
				} else if(lastDpadAction !== button + "_on"){
					lastDpadAction = button + "_on";
					lastDpadButton = button;
					
					sendButtonPress(button, "on");
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
					
					sendButtonPress(button, "off");
				}
			}
		});
	}
});