function getEmptyKeys(jsonObject) {
    let emptyKeys = [];
  
    function checkEmpty(obj, parentKey = '') {
      for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          checkEmpty(obj[key], parentKey + '.' + key);
        } else {
          if (obj[key] === '' || obj[key] === null || obj[key] === undefined) {
            emptyKeys.push(parentKey + '.' + key);
          }
        }
      }
    }
  
    checkEmpty(jsonObject);
  
    return emptyKeys.map((key) => key.slice(1));
  }


export {
    getEmptyKeys
}