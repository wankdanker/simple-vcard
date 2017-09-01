simple-vcard
------------

A module to transform simple javascript objects into vCards and vLists

example
-------

```js
var vCard = require('simple-vcard');

var jCard = {
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
};

var result = vCard.toVCard(jCard);
```
#### Result
```
BEGIN:VCARD
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
END:VCARD
```

vCard.toVCard(jCard)
-------------------

jCard is a Javascript object containing any of these attributes:

* id
* lastName
* firstName
* middleInitial
* prefix
* nickName
* displayName
* title
* role
* screenName
* birthday
* po
* address2
* address1
* city
* region
* postalCode
* country
* company
* phone
* email
* url
* note

license
-------

MIT
