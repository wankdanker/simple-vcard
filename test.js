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
PRODID:${vCard.PRODUCT_ID}
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
  var result = vCard.toVCard(jCards[0]);

  result = result.replace(/\r/g, '');

  t.equal(result, toVCardExpect);
  t.end();
})

var toVListExpect = `BEGIN:VLIST
VERSION:1.0
FN:Peeps
CARD;EMAIL=steve-baker@notreal.com;FN=Steve Baker:dfcc7456-8f56-11e7-bc32-d
 76e3ad96585
CARD;EMAIL=dorothy-baker@notreal.com;FN=Dorothy Baker:e06a3556-8f56-11e7-a3
 05-1b507b774615
END:VLIST`;

test('vCard.toVList()', function (t) {
  var result = vCard.toVList({
    displayName : 'Peeps'
    , cards : jCards
  });

  result = result.replace(/\r/g, '');

  t.equal(result, toVListExpect);
  t.end();
});

var fromVCard = `BEGIN:VCARD
VERSION:3.0
PRODID:${vCard.PRODUCT_ID}
CLASS:PUBLIC
PROFILE:VCARD
UID:7FB3-59AEC480-D-78B1E48.vcf
N:Lastname;Firstname;;
NICKNAME:Nickname
FN:Display Name
TITLE:Titel
ROLE:Role
X-AIM:screen name
BDAY:20170905
ADR;TYPE=work:work po;work street 2;work street 1;work city;work region;wor
 k postal code;work country
ADR;TYPE=home:home po;home street 2;home street 1;home city;home region;hom
 e postal code;home country
ORG:Organization;organization unit 1;organization unit 2
TEL;TYPE=work:work phone number
TEL;TYPE=cell:cell phone number
EMAIL;TYPE=work:work@emailaddress.com
EMAIL;TYPE=home:home@emailaddress.com
URL;TYPE=work:http://work.url
URL;TYPE=home:http://home.url
CUSTOM1:custom value
CUSTOM2:custom value
CUSTOM3:custom value
END:VCARD`

var fromVCardExpect = {
  id: '7FB3-59AEC480-D-78B1E48.vcf',
  lastName: 'Lastname',
  firstName: 'Firstname',
  nickName: 'Nickname',
  displayName: 'Display Name',
  title: 'Titel',
  role: 'Role',
  screenName: 'screen name',
  birthday: '20170905',
  addresses:
   [ { po: 'work po',
       address2: 'work street 2',
       address1: 'work street 1',
       city: 'work city',
       region: 'work region',
       postalCode: 'work postal code',
       country: 'work country',
       type: 'work' },
     { po: 'home po',
       address2: 'home street 2',
       address1: 'home street 1',
       city: 'home city',
       region: 'home region',
       postalCode: 'home postal code',
       country: 'home country',
       type: 'home' } ],
  organizations: [ 'organization unit 1', 'organization unit 2' ],
  company: 'Organization',
  phones:
   [ { phone: 'work phone number', type: 'work' },
     { phone: 'cell phone number', type: 'cell' } ],
  emails:
   [ { email: 'work@emailaddress.com', type: 'work' },
     { email: 'home@emailaddress.com', type: 'home' } ],
  urls:
   [ { url: 'http://work.url', type: 'work' },
     { url: 'http://home.url', type: 'home' } ],
  custom1 : 'custom value',
  custom2 : 'custom value',
  custom3 : 'custom value'
};

test('vCard.fromVCard() -> vCard.toVCard() -> vCard.fromVCard()', function (t) {
  var result = vCard.fromVCard(fromVCard);

  t.deepEqual(result, fromVCardExpect);

  result = vCard.toVCard(result);
  result = result.replace(/\r/g, '');

  t.equal(result, fromVCard);

  result = vCard.fromVCard(result);

  t.deepEqual(result, fromVCardExpect);

  t.end();
});

test('vCard.fold()', function (t) {
  var foldString = 'PHOTO;VALUE=uri:https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAKmAAAAJGVjMmZhOGE4LTYyMGItNGIxMC05NjU5LWQ0ZGJiY2ZkZWQ5MQ.jpg'
  var foldExpect = `PHOTO;VALUE=uri:https://m
 edia.licdn.com/mpr/mpr/s
 hrinknp_400_400/AAEAAQAA
 AAAAAAKmAAAAJGVjMmZhOGE4
 LTYyMGItNGIxMC05NjU5LWQ0
 ZGJiY2ZkZWQ5MQ.jpg`;


  var result = vCard.fold(foldString, 25);
  result = result.replace(/\r/g, '');
  t.equal(result, foldExpect);

  t.end();
});

test('an x-thing', function (t) {
  var vcard = `BEGIN:VCARD
VERSION:3.0
PRODID:${vCard.PRODUCT_ID}
CLASS:PUBLIC
PROFILE:VCARD
N:Lastname;Firstname;;
FN:Display Name
X-CUSTOM-THING;TYPE=test;OTHER=mop:what;will;happen;next
END:VCARD`;

  var expect = {
    lastName: 'Lastname',
    firstName: 'Firstname',
    displayName: 'Display Name',
    'X-CUSTOM-THING': {
      params: {
        TYPE: 'test',
        OTHER: 'mop'
      },
      value: 'what;will;happen;next'
    }
  }

  var result = vCard.fromVCard(vcard);

  t.deepEqual(result, expect);

  result = vCard.toVCard(result);
  result = result.replace(/\r/g, '');

  t.equal(result, vcard);

  t.end();
});
