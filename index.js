var pkg = require('./package.json');
var vCard = module.exports = {};

vCard.FOLD_AT_LENGTH = 75;
vCard.PRODUCT_ID = '-//simple-vcard//Version ' + pkg.version + '//EN';

vCard.toVCard = function (obj) {
  var tmp = [];

  tmp.push(vCard.pair('BEGIN', 'VCARD'));
  tmp.push(vCard.pair('VERSION', '3.0'));
  tmp.push(vCard.pair('PRODID', vCard.PRODUCT_ID));
  tmp.push(vCard.pair('CLASS', 'PUBLIC'));
  tmp.push(vCard.pair('PROFILE', 'VCARD'));

  var keys = Object.keys(obj);

  vCard.VCARD_THINGS.forEach(function (thing) {
    if (thing.arrayKey && obj[thing.arrayKey]) {
      if (thing.arrayizeExtras) {
        tmp.push(vCard.line(thing, obj, obj[thing.arrayKey]));
      }
      else {
        obj[thing.arrayKey].forEach(function (item) {
          tmp.push(vCard.line(thing, item));
        });
      }

      return;
    }
    else if (!vCard.intersects(keys, thing.fields)) {
      return;
    }

    tmp.push(vCard.line(thing, obj));
  });

  //now process any of the custom X- fields
  Object.keys(obj).forEach(function (key) {
    if (!/^x-|^X-/.test(key)) {
      return;
    }

    var custom = obj[key];

    //if it's just a value and not a parsed custom object, then just set the
    //value and move on to the next key
    if (typeof custom !== 'object') {
      return tmp.push(vCard.pair(key, custom));
    }

    var value = custom.value;
    var params = vCard.joinParams(custom.params)

    if (params) {
      tmp.push(vCard.pair([key, params].join(';'), value))
    }
    else {
      tmp.push(vCard.pair(key, value));
    }
  });

  tmp.push(vCard.pair('END', 'VCARD'));

  return tmp.join('\r\n');
}

vCard.joinParams = function (params) {
  var result = [];

  Object.keys(params).forEach(function (param) {
    result.push(param + '=' + params[param]);
  });

  return result.join(';');
}

vCard.toVList = function (obj) {
  var tmp = [];

  tmp.push(vCard.pair('BEGIN', 'VLIST'));
  tmp.push(vCard.pair('VERSION', '1.0'));

  var keys = Object.keys(obj);

  vCard.VLIST_THINGS.forEach(function (thing) {
    if (thing.arrayKey && obj[thing.arrayKey]) {
      obj[thing.arrayKey].forEach(function (item) {
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

  return tmp.join('\r\n');
}

vCard.line = function (thing, obj, extras) {
  var values = thing.fields.map(function (field) {
    return obj[field] || "";
  });

  if (extras && Array.isArray(extras)) {
    values = values.concat(extras);
  }

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

  tmp = tmp.join(':');

  if (tmp.length <= 75) {
    return tmp;
  }

  return vCard.fold(tmp);
}

vCard.fold = function (str, foldAtLength) {
  var tmp = '';
  var offset = 0;
  var chunkSize = foldAtLength || vCard.FOLD_AT_LENGTH;

  for (var x = 0; x < str.length; ) {
    if (x > 0 && str.length - x >= 0) {
      tmp += '\r\n ';
    }

    tmp += str.substr(x, chunkSize);

    if (x === 0) {
      x += chunkSize;
      chunkSize -= 1;
    }
    else {
      x += chunkSize;
    }
  }

  return tmp;
};

vCard.unfold = function (str) {
  return str.replace(/\r?\n[\ \t]+/gm, '');
}

vCard.fromVCard = function (str) {
  var card = {};

  //unfold
  str = vCard.unfold(str);

  //split
  var lines = str.split(/\r?\n/g);

  lines.forEach(function (line) {
    var tokens = line.split(/:/);
    var params = tokens.shift().split(/;/); //the 0th element are the params
    var name = params.shift(); //the 0th element is the name
    var value = tokens.join(':'); //rejoin the rest of the tokens with :
    var object;

    var thing = vCard.VCARD_THINGS_LOOKUP[name];

    if (thing) {
      var values = value.split(/;/gi);

      if (thing.arrayKey && thing.arrayizeExtras) {
        if (values.length > 1) {
          card[thing.arrayKey] = card[thing.arrayKey] || [];

          for (; values.length > 1;) {
            card[thing.arrayKey].push(values.pop());
          }

          card[thing.arrayKey].reverse()
        }

        object = card;
      }
      else if (thing.arrayKey) {
        card[thing.arrayKey] = card[thing.arrayKey] || [];
        object = {};
        card[thing.arrayKey].push(object);
      }
      else {
        object = card;
      }

      values.forEach(function (val, ix) {
        if (val) {
          object[thing.fields[ix]] = val;
        }
      });

      if (params.length && thing.paramsValueLookup) {
        params.forEach(function (param) {
          var tokens = param.split(/=/);
          var name = tokens[0];
          var value = tokens[1];

          object[thing.paramsValueLookup[name]] = value;
        });
      }

      return
    }
    else if (/^x-|^X-/.test(name)) {
      //this is an X- field, need to do a special copy
      var tmp = {};

      //this is duplicated from above pretty much
      params.forEach(function (param) {
        var tokens = param.split(/=/);
        var name = tokens[0];
        var value = tokens[1];

        tmp[name] = value;
      });

      object = {
        params : tmp
        , value : value
      };

      card[name] = object;
    }
    else {
      //we don't have a registered thing for this, do something generic
      //card[name] = value;

    }
  });

  return card;
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
  , { name : "ORG", arrayKey : "organizations", arrayizeExtras : true, fields : ["company"], }
  , { name : "TEL", arrayKey : "phones", fields : ["phone"], params : { type : "TYPE" } }
  , { name : "EMAIL", arrayKey : "emails", fields : ["email"], params : { type : "TYPE" } }
  , { name : "URL", arrayKey : "urls", fields : ["url"], params : { type : "TYPE" } }
  , { name : "NOTE", fields : ["note"] }
  , { name : "CUSTOM1", fields : ["custom1"] }
  , { name : "CUSTOM2", fields : ["custom2"] }
  , { name : "CUSTOM3", fields : ["custom3"] }
  , { name : "CUSTOM4", fields : ["custom4"] }
  , { name : "CUSTOM5", fields : ["custom5"] }
  , { name : "PHOTO", arrayKey : "photos", fields : ["photo"], params : { type : 'TYPE', value : "VALUE" } }
  , { name : "REV", fields : ["revision"] }
  , { name : "MAILER", fields : ["mailer"] }
  , { name : "LOGO", fields : ["logo"] }
  , { name : "CATEGORIES", fields : ["categories"] }
];

vCard.VCARD_THINGS_LOOKUP = {};

vCard.VCARD_THINGS.forEach(function (thing) {
  vCard.VCARD_THINGS_LOOKUP[thing.name] = thing;

  if (thing.params) {
    thing.paramsValueLookup = {};
    Object.keys(thing.params).forEach(function (param) {
      thing.paramsValueLookup[thing.params[param]] = param;
    });
  }
});

vCard.VLIST_THINGS = [
  { name : "FN", fields : ["displayName"] }
  , { name : "UID", fields : ['id'] }
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
