location = window.location
{ hash, pathname } = location

export getHash = ()->
  if hash == ''
    return 1
  else
    return Number(hash.match(/\d+/g)[0])

export getAvNumber = ()->
  return pathname.match(/av\d+/ig)[0]