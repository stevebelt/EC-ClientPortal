/**
** Our required modules.
**/
var http = require('http')
  , express = require('express')
  , app = express()
  , server = http.createServer(app)
  , io = require('socket.io')(server)
  , schedule = require('node-schedule')
  , reload = require('reload')
  , dateandtime = require('date-and-time')
  , guid = require('guid')
  , fs = require('fs')
  , util = require('util')
  , http = require('http')
  , path = require('path')
  , xml2js = require('xml2js');

/**
** Express settings
**/
app.use(express.static('public'));
app.set('view engine', 'ejs');

/**
** allow this service to be called by pages not served by this server. (Use this before all route defintions)
**/
//var cors = require('cors');
//app.use(cors({origin: 'http://localhost:8888'}));

const ZILLOW_API_ID = 'X1-ZWz19an3qnqmtn_7galu';
// read in the test data
var testData = {};
fs.readFile(__dirname + '/sample_data.json', (err,data) => {
  if (err){
    console.log(err);
  }
  testData = JSON.parse(data);
  //console.log('loaded testData: ' + JSON.stringify(testData)); 
});
 
/**
** Express Routing.
**/
app.get('/', (req, res) => {
  res.render('home.ejs', {
    siteTitle : 'E-Closing',
    contentTitle : 'Active Files',
    files: testData.files,
    json: JSON.stringify(testData.files)
  });
});
app.get('/details', function (req, res) {
  res.render('details.ejs', {
    siteTitle : 'E-Closing',
    contentTitle : 'File 2002-70',
    data: testData.Realtor_Information,
    address: encodeURIComponent('15 Warren Street'),
    citystatezip: '02101',
    json: JSON.stringify(testData.Realtor_Information)
  });
});
app.get('/documents', function (req, res) {
  res.render('documents.ejs', {
    siteTitle : 'E-Closing',
    contentTitle : 'File 2002-70',
    data: testData.documents,
    address: encodeURIComponent('15 Warren Street'),
    citystatezip: '02101',
    documents: testData.documents,
    json: JSON.stringify(testData.documents)
  });
});
app.get('/zillow/basic', function (req, res) {
  var address = req.query.address;
  var cityStateZip = req.query.citystatezip;
  var format = req.query.format;
  var zillowAPI = util.format("http://www.zillow.com/webservice/GetDeepSearchResults.htm?zws-id=%s&address=%s&citystatezip=%s", ZILLOW_API_ID, address, cityStateZip);
  console.log('zillowAPI: %s', zillowAPI);
  http.get(zillowAPI, (zres) => {
    const statusCode = zres.statusCode;
    const contentType = zres.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
                        `Status Code: ${statusCode}`);
    } else if (!/^text\/xml/.test(contentType)) {
      error = new Error(`Invalid content-type.\n` +
                        `Expected text/xml but received ${contentType}`);
    }
    if (error) {
      console.log('Error in results: %s', error.message);
      // consume response data to free up memory
      zres.resume();
      return;
    }

    zres.setEncoding('utf8');
    let rawData = '';
    zres.on('data', (chunk) => rawData += chunk);
    zres.on('end', () => {
      try {
        //console.log('rawData: %s', rawData);
        if (format === 'xml'){
          res.close(rawData);
          return;
        }
        var parser = new xml2js.Parser();
        parser.parseString(rawData, (err, result) => {
          //console.log('JSON: ' + JSON.stringify(result));
          if (format === 'json'){
            res.json(result);
            return;
          }
          res.render('zillowSearchResults.ejs', {
            siteTitle : 'E-Closing',
            contentTitle : 'File 2002-70',
            result: result,
            json: JSON.stringify(result)
          });
        });
      } catch (e) {
        console.log(e.message);
      }
    });
  }).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
  });
});

app.get('/zillow/comps/:zpid', function (req, res) {
  var zpid = req.params.zpid;
  var format = req.query.format;
  var zillowAPI = util.format("http://www.zillow.com/webservice/GetDeepComps.htm?count=5&zws-id=%s&zpid=%s&rentzestimate=true", ZILLOW_API_ID, zpid);
  http.get(zillowAPI, (zres) => {
    const statusCode = zres.statusCode;
    const contentType = zres.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
                        `Status Code: ${statusCode}`);
    } else if (!/^text\/xml/.test(contentType)) {
      error = new Error(`Invalid content-type.\n` +
                        `Expected text/xml but received ${contentType}`);
    }
    if (error) {
      console.log('Error in results: %s', error.message);
      // consume response data to free up memory
      zres.resume();
      return;
    }

    zres.setEncoding('utf8');
    let rawData = '';
    zres.on('data', (chunk) => rawData += chunk);
    zres.on('end', () => {
      try {
        //console.log('rawData: %s', rawData);
        if (format === 'xml'){
          res.send(rawData);
          return;
        }
        var parser = new xml2js.Parser();
        parser.parseString(rawData, (err, result) => {
          //console.log(result);
          res.send(result);
        });
      } catch (e) {
        console.log(e.message);
      }
    });
  }).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
  });
});

app.get('/movie/:filename', function(req, res){

var filename = req.params.filename;
var file = __dirname + '/public/videos/' + filename;
console.log('Serving up video: ' + file);
fs.stat(file, function(err, stats) {
  if (err) {
    if (err.code === 'ENOENT') {
      // 404 Error if file not found
      return res.sendStatus(404);
    }
  res.end(err);
  }
  var range = req.headers.range;
  if (!range) {
   // 416 Wrong range
   return res.sendStatus(416);
  }
  var positions = range.replace(/bytes=/, "").split("-");
  var start = parseInt(positions[0], 10);
  var total = stats.size;
  var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
  var chunksize = (end - start) + 1;

  res.writeHead(206, {
    "Content-Range": "bytes " + start + "-" + end + "/" + total,
    "Accept-Ranges": "bytes",
    "Content-Length": chunksize,
    "Content-Type": "video/webm"
  });

  var stream = fs.createReadStream(file, { start: start, end: end })
    .on("open", function() {
      stream.pipe(res);
    }).on("error", function(err) {
      res.end(err);
    });
});




});
/**
** Websocket experiment.
**/
io.on('connection', function (socket) {
  var connections = [];

  socket.on('register-session', function (data) {
    connections.push(data.sessionId, socket);
    console.log("added to connections; {%s, %s}", data.sessionId, socket);
  });

  socket.on('private', function (data) {
    console.log('Received private: %s', data.msg);
  });


  socket.on('broadcast', function(data){
    io.emit('broadcast', data);
    console.log('Received broadcast: %s', data.msg);
  });

  socket.on('disconnect', function() {
    io.emit('broadcast', { msg: 'Someone went home' })
  });

  schedule.scheduleJob('*/10   *    *    *    *', function(){
    var time = new Date();
    io.emit('sideTab', { label: 'Server Time', val: dateandtime.format(time, 'MMM DD, YYYY h:mm:ss A') });
  });
})

// Reload code here: This is the code so the browser can auto refresh when a file changes.
reload(server, app);

server.listen(3000, function() {
  console.log('Listening on port 3000...')
});