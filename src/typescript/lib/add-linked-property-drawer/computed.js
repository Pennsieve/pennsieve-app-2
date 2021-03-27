/**
 * disable the save button
 * @param radioSelection the currently selected item
 * @param initialSelection the originally selected item (if applicable)
 */
const disableButton = (radioSelection, initialSelection) => !radioSelection || radioSelection === initialSelection;
/**
 * whether or not we are editing an existing linked property
 */
const isEditing = (initialSelection) => !!initialSelection;
/**
 * url to create linked properties
 */
const linkedPropertiesUrl = ($route, conceptsUrl, conceptId) => {
    var _a, _b;
    return `${conceptsUrl}/datasets/${(_a = $route.params.datasetId) !== null && _a !== void 0 ? _a : ''}/concepts/${conceptId}/instances/${(_b = $route.params.instanceId) !== null && _b !== void 0 ? _b : ''}/linked`;
};
/**
 * all computed property functions together on a single object
 */
export const Computed = {
    disableButton,
    isEditing,
    linkedPropertiesUrl
};
//# sourceMappingURL=computed.js.map