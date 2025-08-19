const getService = (name) => {
  return metrix.service(`admin::${name}`);
};

export { getService };
