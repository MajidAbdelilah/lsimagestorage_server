const express = require("express");
const app = express();
const { Deta } = require("deta");
const multer = require("multer");
const upload = multer({ dest: '/tmp' })
require('dotenv').config();
const { exec } = require("child_process");
const { Curl } = require('node-libcurl');

const { curly } = require('node-libcurl');

const token = process.env.TOKEN
const tmp= process.env.TMP

const curl = new Curl();
const close = curl.close.bind(curl);


app.get("/", (req, res)=>{
    res.send("GET OUT OF HERE");
});



app.post("/upload_image", upload.single("image_file"), async (req, res)=>{

    console.log(req.file.mimetype)
    if(req.file.mimetype.charAt(0) == "i" &&
      req.file.mimetype.charAt(1) == "m" &&
      req.file.mimetype.charAt(2) == "a" &&
      req.file.mimetype.charAt(3) == "g" &&
      req.file.mimetype.charAt(4) == "e" &&
       req.file.mimetype.charAt(5) == "/" &&
      req.file.size <= 1000000){

	curl.setOpt(Curl.option.URL, 'https://store1.gofile.io/uploadFile');
	curl.setOpt(Curl.option.HTTPPOST, [
	    { name: 'file', file: 'test2.jpg', type: '*/*' },
	    { name: 'token', contents: token },
	    { name: 'folderId', contents: tmp }
	]);

    }
    
    
    curl.on('end', ( statusCode, data, headers )=>{

	console.log("statusCode = "+statusCode);
	console.log("data = "+data);
	console.log("headers = "+headers);
	if(statusCode == 200){
	    res.redirect();
	}
	
	
    });
    curl.on('error', close);
    
    curl.perform();
    res.end();
    
});


app.listen(9000);

module.exports = app;
