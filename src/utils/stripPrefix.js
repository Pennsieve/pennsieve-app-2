/**
* Strips off system prefix from sortBy values
* @param {String} str
* @returns {String}
*/
const stripPrefix = (str) => {
 const prefix = '$'
 const encoded = encodeURIComponent(prefix)
 switch (true) {
   case str.indexOf(prefix) === 0:
     return str.substr(1)
   case str.indexOf(encoded) === 0:
     return str.substr(3)
   default:
     return str
  }
}

export default stripPrefix