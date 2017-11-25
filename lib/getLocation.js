var hash, location, pathname;

location = window.location;

({hash, pathname} = location);

export var getHash = function() {
  if (hash === '') {
    return 1;
  } else {
    return Number(hash.match(/\d+/g)[0]);
  }
};

export var getAvNumber = function() {
  return pathname.match(/av\d+/ig)[0];
};
