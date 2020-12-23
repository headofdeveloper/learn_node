var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var mongoose = require("mongoose");


app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var dbUrl = "mongodb://172.17.0.6:27017/learning-node";

var Message = mongoose.model("Message", {
    name : String,
    message : String
});

/*
const messages = [
    {name : 'Mustafa', message : 'Hi'},
    {name : 'İclal', message : 'Hi'}
];
*/

app.get('/messages', (req,res) => {
    Message.find( {}, (err, messages) => {        
        res.send(messages);
    });
    //res.send(messages);    
});

app.post('/messages', (req,res) => {

    var message = new Message(req.body);

    message.save((err) => {
        if(err) {
            sendStatus(500);
        }

        // bu satır undefined basacak
        // express gelen request body'sini parse eden bir feature'a sahip değil
        // onun için body-parser'ı yüklememiz gerekecek
        // console.log(req.body);
        // messages.push(req.body);
        io.emit("message", req.body);
        res.sendStatus(200); 
    });

    
});

io.on("connection", (socket) => {
    console.log("User connected");
});

mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
    if(err)
    {
        console.log("mongo db connection",  err);
    }
});


var server = http.listen(3000, () => {
    console.log("server is listening on port ", server.address().port)
});