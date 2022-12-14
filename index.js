const express = require("express");
const app = express();
require('dotenv').config();
const { exec } = require("child_process");
const { Curl } = require('node-libcurl');
var fs = require('fs');
const { curly } = require('node-libcurl');

const curl = new Curl();
const close = curl.close.bind(curl);


app.get("/", (req, res)=>{
    res.send("GET OUT OF HERE");
});

	
    
    curl.on('end', on_end);
    curl.on('error', close);
    
let res_ptr;
let req_ptr;
let image_file_path = "/tmp/result.jpg";
let extention = "";

let server_index = 0;
let servers = ["store1", "store2", "store3", "store4"];
    
app.post("/upload_image", async (req, res)=>{
	extention = "";
	server_index = 0;
    let name_len = req.file.originalname.length;
      
    for(let i=req.file.originalname.lastIndexOf("."); i<name_len; i++){
	extention+=req.file.originalname.charAt(i);
	
    }

    console.log("extention = "+extention)
    fs.rename(req.file.path, req.file.path+extention, function(err) {
    if ( err ) console.log('ERROR Renaming failed: ' + err);
});
    req.file.path = req.file.path+extention;;
    
    
    res_ptr = res;
    req_ptr = req;
    console.log(req.file.mimetype)
    if(req.file.mimetype.charAt(0) == "i" &&
      req.file.mimetype.charAt(1) == "m" &&
      req.file.mimetype.charAt(2) == "a" &&
      req.file.mimetype.charAt(3) == "g" &&
      req.file.mimetype.charAt(4) == "e" &&
       req.file.mimetype.charAt(5) == "/" &&
      req.file.size <= 5400000){
	console.log("req.file.path = " + req.file.path)
	console.log("req_ptr.file.path = " + req_ptr.file.path)
	
	exec("./magick "+req.file.path+" -strip -interlace Plane  -quality 70% "+image_file_path, (err, stdout, stderr)=>{
	    
	    if(err) console.log(err);
	    if(stderr) console.log(stderr);
	    console.log(stdout);
	    
	});
	
	try_server();
	
    }else{
	res.sendStatus(501);
    }
    //res.send(req.file);
    //res.end();
    
    
}); 

    
function on_end(statusCode, data, headers){
	console.log("statusCode = "+statusCode);
	console.log("data = "+data);
	console.log("headers = "+headers);
    if(statusCode == 200){
	res_ptr.redirect("https://lsimagestorage.netlify.app/get_image_url?url="+JSON.parse(data).data.fileId+"/"+req_ptr.file.originalname.replace(extention, ".jpg")+"&server_name=https://"+servers[server_index]+".gofile.io/download/");
    }else{
    server_index++;
	try_server();
	//res_ptr.sendStatus(statusCode);
    
    }
}

function try_server(){
console.log("try_server = " + servers[server_index]);
	curl.setOpt(Curl.option.URL, "https://"+servers[server_index]+".gofile.io/uploadFile");
	curl.setOpt(Curl.option.HTTPPOST, [
	    { name: 'file', file: image_file_path, type: "*/*"},
	    { name: 'token', contents: token },
	    { name: 'folderId', contents: tmp }
	]);
	curl.perform();
}

//app.listen(9000);

module.exports = app;
