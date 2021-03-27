import { toLower, compose, pathOr, defaultTo, map, indexOf, not, contains } from 'ramda'

export default {
  methods: {
    /**
     * Gets all items from an array by path and returns as lowercase string
     * @param {Array} keyPath
     * @return {Array}
     */
    getItemsLower: (keyPath) => compose(
      toLower(),
      pathOr('', keyPath),
      defaultTo([])
    ),

    /**
     * Checks if items in an array are unique compared to the input
     * @param {Array} list
     * @param {Array} keyPath
     * @param {string} name
     * @param {string} exclude
     * @param {Boolean} caseInsensitive
     * @return {Boolean}
     */
    checkUniqueName: function(list, keyPath, name, exclude, caseInsensitive = true) {
      if (caseInsensitive){
        let filteredNames = map(this.getItemsLower(keyPath), list);

        // Remove name from list if excluding
        if(exclude) {
          const index = indexOf(toLower(exclude), filteredNames);
          if(index >= 0) {
            filteredNames.splice(index, 1);
          }
        }
        return not(contains(toLower(name), filteredNames));
      }
      else {
        let filteredNames = map(this.getItemsLower(keyPath), list);

        // Remove name from list if excluding
        if(exclude) {
          const index = indexOf(exclude, filteredNames);
          if(index >= 0) {
            filteredNames.splice(index, 1);
          }
        }
        return not(contains(name, filteredNames));
      }
    }
  }
}
