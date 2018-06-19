/************************************
* Including all the required modules*
*************************************/
const http = require('http');
const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');
const path = require('path');

/****************************************************************
* Writing an API for getting date, word of day & word definition*
*****************************************************************/
const options = {
  uri: `https://www.merriam-webster.com/word-of-the-day/calendar`,
  transform: function (body) {
    return cheerio.load(body);
  }
};

let wordOfDay, wordDefinition, date;
rp(options)
  .then(($) => {
    process.stdout.write('Log - Started the process of crawling and extracting the relavant details' + '\n');
    let wordOfDayBlock = $('div.article-header-container h2.wod-l-hover')[0];
    let wordDefinitionBlock = $('div.article-header-container div.definition-block > p')[0];
    let dateBlock = $('div.article-header-container span.wod-car-sub-title')[0];
    wordOfDay = wordOfDayBlock.children[0].data;
    wordDefinition = wordDefinitionBlock.children[0].data;
    date = dateBlock.children[0].data.trim();

    console.log("Log(Word of the Day): " + wordOfDay);
    console.log("Log(Definition of the word): " + wordDefinition);
    console.log("Log(Today's date): " + date);
  })
  .catch((err) => {
    console.log(err);
  });

/*********************************************************
* Creating a Node JS server - Which gives Word of the Day*
**********************************************************/
const serverURL = "127.0.0.1";
const port = 3000;
const images = ['Logo1.jpg', 'Logo2.jpg', 'Logo3.jpg', 'Logo4.jpg', 'Logo5.jpg'];

let server = http.createServer(function(req, res){
  fs.readFile("index.html", "UTF-8", function(err, text){
    if(req.url === "/"){
      res.writeHead(200,{"Content-Type": "text/html"});
      res.write(text);

      //Get a random image
      let idx = Math.floor(Math.random() * images.length);
      res.write("<body id='background' style='background: url(./images/" + images[idx] + ")'>");
      
      //Get Other Cotents of the page
      res.write("<h1>Word of the Day</h1>");
      res.write("<p>" + date + "</p><br>");
      res.write("<p><h1>" + wordOfDay + "</h1></p>");
      res.end("<p>Definition: " + wordDefinition + "</p>");
    }else if(req.url.match("\.css$")){
      //Accessing the CSS static files by gettig its path
      let cssPath = path.join(__dirname, 'public', req.url);
      let fileStream = fs.createReadStream(cssPath, "UTF-8");
      res.writeHead(200, {"Content-Type": "text/css"});
      fileStream.pipe(res);
    }else if(req.url.match("\.jpg$")){
      //Accessing the JPG static files by gettig its path
      let imgPath = path.join(__dirname, 'public', req.url);
      let fileStream = fs.createReadStream(imgPath);
      res.writeHead(200, {"Content-Type": "image/jpg"});
      fileStream.pipe(res);
    }else{
      res.writeHead(404,{"Content-Type": "text/html"});
      res.end("No Page Found");
    }
  });
});

//Logging the Server start-up message
console.log("Log - Starting web server at " + serverURL + ":" + port);
//Starting th server at 127.0.0.1(localhost) and port 3000
server.listen(port, serverURL);
