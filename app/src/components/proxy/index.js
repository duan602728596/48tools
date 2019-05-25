export const name = 'proxy';

export function getProxy() {
  const value = localStorage.getItem(name);

  if (value) {
    return JSON.parse(value);
  } else {
    return value;
  }
}

export function setProxy(value) {
  localStorage.setItem(name, JSON.stringify(value));
}

export function getProxyIp() {
  const value = localStorage.getItem(name);

  if (value) {
    const json = JSON.parse(value);

    return json.open ? `${ json.protocol }://${ json.host }:${ json.port }` : undefined;
  } else {
    return value;
  }
}