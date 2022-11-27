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
let extention = "";


app.post("/upload_image", upload.single("image_file"), async (req, res)=>{
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

	exec("./magick "+req.file.path+" -strip -interlace plane -quality 80% "+req.file.path, (err, stdout, stderr) => {
		  if (err) {
			console.log(err);
		    return;
		  }
		
		try_server();
		  // the *entire* stdout and stderr (buffered)
		console.log(`stdout: ${stdout}`);
		console.log(`stderr: ${stderr}`);
	});	
	    
	
    }else{
		res.sendStatus(501);
    }
    //res.send(req.file);
    //res.end();
    
    
}); 

let best_server = "store4";

async function try_server(){


		const  options2 = {
			method: "POST",
			url: "https://store4.gofile.io/uploadFile",
			port: 443,
			headers: {
			"Content-Type": "multipart/form-data"
					 },
		   	formData : {
		    "file" : fs.createReadStream(req_ptr.file.path),
			"token" : process.env.TOKEN,
			"folderId": process.env.TMP
			}
		};
						
		request(options2, function (err, res, body) {
	   		if(err) console.log(err);
			if(res){
  				console.log(res.statusCode);
			}
			if(body){
	   			console.log(body);
					   		    	    
	   			if(res.statusCode == 200){
					res_ptr.redirect("https://lsimagestorage.netlify.app/get_image_url?url="+
					JSON.parse(body).data.fileId+"/"+req_ptr.file.originalname+
					"&server_name=https://store10.gofile.io/download/");
				}else{
					try_server();
					return;
  				}
			}
				    	
		});
	  

}

app.listen(9000);

module.exports = app;
