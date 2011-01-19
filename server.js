var ws = require("websocket-server"),
	wsserver = ws.createServer(),
	fs = require("fs"),
	express = require("express"),
	httpserver = express.createServer();

wsserver.addListener("connection", function(conn){
	console.log("connected");
	conn.send(JSON.stringify({
		"action": "sendConnectionID",
		"connectionID": conn.id
	}));
	
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

httpserver.get("/listroms", function(req, res){
	fs.readdir("static/console/roms", function(err, files){
		if(err){
			console.log(err);
			res.send([]);
			
			return;
		}
		
		var romCount = files.length,
			romList = [];
		
		for(var i = 0; i < romCount; i++){
			var romData = [],
				romFileName = files[i],
				romFilePath = "roms/" + romFileName,
				romName = romFileName.substr(0, romFileName.lastIndexOf("."));
			
			romData.push(romName, romFilePath);
			romList.push(romData);
		}
		
		res.send(romList);
	});
});

httpserver.listen(80);