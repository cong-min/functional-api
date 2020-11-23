import mapValues from 'lodash/mapValues';

export default params => JSON.stringify(
  mapValues(params, e => {
    let type = typeof e;
    if (type === 'undefined') return 'undefined';
    if (e) {
      type = e.constructor.name;
    } else if (type === 'object') {
      type = toString.call(e).slice(8, -1);
    }
    return type.toLowerCase();
  })
);
