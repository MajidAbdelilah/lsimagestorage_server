const express = require("express");
const app = express();
require('dotenv').config();
const { exec } = require("child_process");
var fs = require('fs');
const request = require("request");
const multer = require("multer")
const upload = multer({dest: "/tmp/"})
app.get("/", (req, res)=>{
    res.send("GET OUT OF HERE");
});

	
let res_ptr;
let req_ptr;
let image_file_path = "/tmp/result2.jpg";
let extention = "";

let server_index = 0;
let servers = ["store1", "store2", "store3", "store4"];
    
app.post("/upload_image", upload.single("image_file"), async (req, res)=>{
 	 res_ptr;
	 req_ptr;
 	image_file_path = "/tmp/result2.jpg";
 	extention = "";

 	server_index = 0;
 	servers = ["store1", "store2", "store3", "store4"];

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

    

function try_server(){

console.log("try_server = " + servers[server_index]);

	const options = {
	    method: "POST",
	    url: "https://"+servers[server_index]+".gofile.io/uploadFile",
	    port: 443,
	    headers: {
	        "Content-Type": "multipart/form-data"
	    },
	    formData : {
	        "file" : fs.createReadStream(image_file_path),
	        "token" : process.env.TOKEN,
	        "folderId": process.env.TMP
	    }
	};
	
	request(options, function (err, res, body) {
	    if(err) console.log(err);
	    console.log(body);
	   	console.log(res.statusCode);
	   	    	    
	    if(res.statusCode == 200){
			res_ptr.redirect("https://lsimagestorage.netlify.app/get_image_url?url="+JSON.parse(body).data.fileId+"/"+req_ptr.file.originalname.replace(extention, ".jpg")+"&server_name=https://"+servers[server_index]+".gofile.io/download/");
    	}else{
			res_ptr.sendStatus(500);
    		
    	}
    	
	});
	
}

app.listen(9000);

module.exports = app;
