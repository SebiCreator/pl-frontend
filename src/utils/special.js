const nullNumber = -1;

function getEmptyKeys(jsonObject) {
  let emptyKeys = [];

  function checkEmpty(obj, parentKey = '') {
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        checkEmpty(obj[key], parentKey + '.' + key);
      } else {
        if (obj[key] === '' || obj[key] === null || obj[key] === undefined || obj[key] === nullNumber) {
          emptyKeys.push(parentKey + '.' + key);
        }
      }
    }
  }

  checkEmpty(jsonObject);

  return emptyKeys.map((key) => key.slice(1));
}

function combineObjects(obj1, obj2) {
  const combinedObj = {};

  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      combinedObj[key] = (obj1[key] === '' || obj1[key] === -1 || obj1[key] === null || obj1[key] === undefined) ? obj2[key] || "" : obj1[key] || "";
    }
  }

  for (const key in obj2) {
    if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
      combinedObj[key] = (obj2[key] === '' || obj2[key] === -1 || obj2[key] === null || obj2[key] === undefined) ? obj1[key] || "" : obj2[key] || "";
    }
  }

  return combinedObj;
}


export {
  getEmptyKeys, combineObjects
}