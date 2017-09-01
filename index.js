var vCard = module.exports = {};

vCard.toVCard = function (obj) {
  var tmp = [];

  tmp.push(vCard.pair('BEGIN', 'VCARD'));
  tmp.push(vCard.pair('VERSION', '3.0'));
  tmp.push(vCard.pair('CLASS', 'PUBLIC'));
  tmp.push(vCard.pair('PROFILE', 'VCARD'));

  var keys = Object.keys(obj);

  vCard.VCARD_THINGS.map(function (thing) {
    if (thing.arrayKey && obj[thing.arrayKey]) {
      obj[thing.arrayKey].map(function (item) {
        tmp.push(vCard.line(thing, item));
      });

      return;
    }
    else if (!vCard.intersects(keys, thing.fields)) {
      return;
    }

    tmp.push(vCard.line(thing, obj));
  });

  tmp.push(vCard.pair('END', 'VCARD'));

  return tmp.join('\n');
}

vCard.toVList = function (obj) {
  var tmp = [];

  tmp.push(vCard.pair('BEGIN', 'VLIST'));
  tmp.push(vCard.pair('VERSION', '1.0'));

  var keys = Object.keys(obj);

  vCard.VLIST_THINGS.map(function (thing) {
    if (thing.arrayKey && obj[thing.arrayKey]) {
      obj[thing.arrayKey].map(function (item) {
        tmp.push(vCard.line(thing, item));
      });

      return;
    }
    else if (thing.arrayKey) {
      //vlists require things with array keys to be arrays
      return;
    }
    else if (!vCard.intersects(keys, thing.fields)) {
      return;
    }

    tmp.push(vCard.line(thing, obj));
  });

  tmp.push(vCard.pair('END', 'VLIST'));

  return tmp.join('\n');
}

vCard.line = function (thing, obj) {
  var values = thing.fields.map(function (field) {
    return obj[field] || "";
  });

  var name = thing.name;

  if (thing.params) {
    name = [name];

    name = name.concat(Object.keys(thing.params).map(function (field) {
      if (!obj[field]) {
        return;
      }

      return thing.params[field] + '=' + obj[field];
    }).filter(Boolean));
  }

  return vCard.pair(name, values);
};

vCard.pair = function (a, b) {
  var tmp = [];

  if (Array.isArray(a)) {
    tmp.push(a.join(';'));
  }
  else {
    tmp.push(a);
  }

  if (Array.isArray(b)) {
    tmp.push(b.join(';'));
  }
  else {
    tmp.push(b);
  }

  return tmp.join(':');
}

vCard.VCARD_THINGS = [
  { name : "UID", fields : ['id'] }
  , { name : "N", fields : ['lastName', 'firstName', 'middleInitial', 'prefix'] }
  , { name : "NICKNAME", fields : ["nickName"] }
  , { name : "FN", fields : ["displayName"] }
  , { name : "TITLE", fields : ["title"] }
  , { name : "ROLE", fields : ["role"] }
  , { name : "X-AIM", fields : ["screenName"] }
  , { name : "BDAY", fields : ["birthday"] }
  , { name : "ADR", arrayKey : "addresses", fields : ["po", "address2", "address1", "city", "region", "postalCode", "country"], params : { type : "TYPE" } }
  , { name : "ORG", fields : ["company"] }
  , { name : "TEL", arrayKey : "phones", fields : ["phone"], params : { type : "TYPE" } }
  , { name : "EMAIL", arrayKey : "emails", fields : ["email"] }
  , { name : "URL", arrayKey : "urls", fields : ["url"] }
  , { name : "NOTE", fields : ["note"] }
]

vCard.VLIST_THINGS = [
  { name : "FN", fields : ["displayName"] }
  , { name : "NICKNAME", fields : ["nickName"] }
  , { name : "DESCRIPTION", fields : ["description"] }
  , { name : "CARD", arrayKey : "cards", fields : ["id"], params : { email : "EMAIL", displayName : 'FN' } }
];

vCard.intersects = function (x, y) {
    for (var i = 0; i < x.length; i++) {
        for (var z = 0; z < y.length; z++) {
            if (x[i] == y[z]) {
                return true;
            }
        }
    }
    return false;
}
