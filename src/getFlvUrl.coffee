export getFlvUrl = (cid, sign)->
  url = "https://interface.bilibili.com/playurl?cid=#{ cid }" +
    "&appkey=84956560bc028eb7&otype=json&type=&quality=0&qn=0&tid=137&sign=#{ sign }"
  return new Promise((resolve, reject)->
    request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.addEventListener('readystatechange', (event)->
      if request.readyState == 4
        data = JSON.parse(request.response)
        resolve(data)
    , false)
    request.send()
  )

export queryUrl = (list)->
  url = []
  for item in list
    u = item.url.replace('http:', 'https:')
    url.push(u)
  return url

export download = (url)->
  return fetch(url, {
    'method': 'GET',
    'cache': 'default',
  }, 86400000).then((response)->
    return response.blob()
  ).then((blob)->
    return window.URL.createObjectURL(blob)
  )