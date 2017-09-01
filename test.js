var vCard = require('./');
var test = require('tape');

var jCards = [{
  id : 'dfcc7456-8f56-11e7-bc32-d76e3ad96585'
  , displayName : 'Steve Baker'
  , phone : '555-555-5555'
  , email : 'steve-baker@notreal.com'
  , address1 : 'Street Address 1'
  , address2 : 'Street Address 2'
  , city : 'LA'
  , region : 'CA'
  , postalCode : '30303'
  , country : 'US'
  , company : 'Steve\'s Company'
  , title : "Manager"
}
,{
  id : 'e06a3556-8f56-11e7-a305-1b507b774615'
  , displayName : 'Dorothy Baker'
  , phone : '555-555-5555'
  , email : 'dorothy-baker@notreal.com'
  , address1 : 'Street Address 1'
  , address2 : 'Street Address 2'
  , city : 'LA'
  , region : 'CA'
  , postalCode : '30303'
  , country : 'US'
  , company : 'Steve\'s Company'
  , title : "Manager"
}];

var toVCardExpect = `BEGIN:VCARD
VERSION:3.0
CLASS:PUBLIC
PROFILE:VCARD
UID:dfcc7456-8f56-11e7-bc32-d76e3ad96585
FN:Steve Baker
TITLE:Manager
ADR:;Street Address 2;Street Address 1;LA;CA;30303;US
ORG:Steve's Company
TEL:555-555-5555
EMAIL:steve-baker@notreal.com
END:VCARD`;

test('vCard.toVCard()', function (t) {
  t.equal(vCard.toVCard(jCards[0]), toVCardExpect);
  t.end();
})

var toVListExpect = `BEGIN:VLIST
VERSION:1.0
FN:Peeps
CARD;EMAIL=steve-baker@notreal.com;FN=Steve Baker:dfcc7456-8f56-11e7-bc32-d76e3ad96585
CARD;EMAIL=dorothy-baker@notreal.com;FN=Dorothy Baker:e06a3556-8f56-11e7-a305-1b507b774615
END:VLIST`;

test('vCard.toVList()', function (t) {
  var result = vCard.toVList({
    displayName : 'Peeps'
    , cards : jCards
  });

  t.equal(result, toVListExpect);
  t.end();
});
