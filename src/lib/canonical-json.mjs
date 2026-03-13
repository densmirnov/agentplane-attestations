function sortValue(value) {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((accumulator, key) => {
        accumulator[key] = sortValue(value[key]);
        return accumulator;
      }, {});
  }

  return value;
}

export function canonicalize(value) {
  return sortValue(value);
}

export function canonicalStringify(value) {
  return JSON.stringify(canonicalize(value), null, 2);
}
