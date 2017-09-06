var fs = require('fs');
var vCard = require('./');

var buffer = [];

process.stdin.on('data', function (chunk) {
  buffer.push(chunk)
});

process.stdin.on('end', function () {
  var parsed = vCard.fromVCard(buffer.join(''))
  //console.log(parsed)
  var stringified = vCard.toVCard(parsed);

  parsed = vCard.fromVCard(stringified);

  stringified = vCard.toVCard(parsed);
  
  console.log(stringified);
});

process.stdin.resume();
