// # Node JS HeightMap API

var express = require('express');
var app = express();

var exec = require('child_process').exec;
var ls_cmd = 'ls -lah';

var location_cmd = 'gdallocationinfo';
var srtm_data_path = '/home/matkins/code/heightmap/data/srtm/';

// ## Test Exec Command

// The root of the application just does a command line list directory contents
app.get('/', function (req, res) {
  console.log('Request received from: ' + req.connection.remoteAddress);

  exec(ls_cmd, function(err, stdout, stderr) {
    console.log(`${stdout}`);
  });

  res.send('Hello World!');
});

// ## Request Height Map

// Sending in a `lat` and `lon` generates a heightmap for unity
app.get('/heightmap/:lat/:lon', function(req, res) {
  console.log('Request received from: ' + req.connection.remoteAddress);
  console.log('lat: ' + req.params.lat);
  console.log('lon: ' + req.params.lon);

  res.send(req.params.lat + ',' + req.params.lon);
});

// ## Request Height Point

// Sending in a `lat` and `lon` returns a height value in meters
app.get('/heightpoint/:lat/:lon', function(req, res) {
  console.log('Request received from: ' + req.connection.remoteAddress);
  console.log('lat: ' + req.params.lat);
  console.log('lon: ' + req.params.lon);

  var lat = req.params.lat;
  var lon = req.params.lon;
  var cmd = location_cmd + ' ' + srtm_data_path + getHGT(lat, lon) + ' -wgs84 ' + lon + ' ' + lat;

  var response = {'units':'meters'};
  response.lat = lat;
  response.lon = lon;

  console.log('instance: ' + typeof response);

  exec(cmd, function(err, stdout, stderr) {
    console.log(`${stdout}`);
    var height = getHeightPointValue(response, stdout);
    response['height'] = height;
    res.send(response);
  });
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

// ### Function to find the correct SRTM HGT file from the given `lat` and `lon`
function getHGT(lat, lon) {
  var file = '';

  // TODO: handle getting the right file for south coordinates
  if (lat[0] === '-') {
    file += 'S' + lat.substr(1, 2);
  } else {
    file += 'N' + lat.substr(0, 2);
  }

  if (lon[0] === '-') {
    file += 'W';
    if (lon[3] === '.') {
      file += '0' + (parseInt(lon.substr(1, 2)) + 1);
    } else {
      file += (parseInt(lon.substr(1, 3)) + 1);
    }
  } else {
    file += 'E';
    if (lon[2] === '.') {
      file += '0' + lon.substr(0, 2);
    } else {
      file += lon.substr(0, 3);
    }
  }

  return file + '.hgt';
}

// ### Function to strip out the height value from the output
function getHeightPointValue(obj, out) {
  var find = 'Value: ';
  return out.substring(out.indexOf(find) + find.length).trim();
}
