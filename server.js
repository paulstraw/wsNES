var ws = require("websocket-server"),
	wsserver = ws.createServer(),
	express = require("express"),
	httpserver = express.createServer(),
	connect = require("connect");

wsserver.addListener("connection", function(conn){
	console.log("connected");
	conn.addListener("message", function(message){
		message = JSON.parse(message);
		message["id"] = conn.id;
		conn.broadcast(JSON.stringify(message));
	});
});

wsserver.addListener("close", function(conn){
	console.log("closed");
	conn.broadcast(
		JSON.stringify({
			"id": conn.id,
			"action": "close"
		})
	);
});

wsserver.listen(3000);


//static stuff:
httpserver.configure(function(){
	httpserver.use(express.staticProvider("static"));
});

httpserver.get("/", function(req, res){
	agent = req.headers["user-agent"];
	
	if(agent.indexOf("iPhone") > -1){
		res.redirect("controller/");
	} else {
		res.redirect("console/");
	}
});

httpserver.listen(80);