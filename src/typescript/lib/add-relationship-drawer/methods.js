/**
 * legacy functionality - not sure if this is still relevant
 */
const getConceptTitle = (records) => {
    var _a;
    const [head = { values: [] }, ...tail] = records;
    return (_a = head.values.find(v => v.conceptTitle)) !== null && _a !== void 0 ? _a : {};
};
/**
 * callback when the select all checkbox is selected
 * @param originalSelectedItemIds the original set
 * @return IMPORTANT - return a NEW set with the mutated values
 */
const onSelectAllItems = (originalSelectedItemIds, items, records) => {
    const newSelectedItemIds = new Set(originalSelectedItemIds);
    if (items.length) {
        items.forEach(item => newSelectedItemIds.add(item.recordId));
    }
    else {
        records.forEach(({ id }) => newSelectedItemIds.delete(id));
    }
    return newSelectedItemIds;
};
/**
 * callback when the a single checkbox is selected
 * @param originalSelectedItemIds the original set
 * @return IMPORTANT - return a NEW set with the mutated values
 */
const onSelectIndividualItem = (originalSelectedItemIds, value, item) => {
    const newSelectedItemIds = new Set(originalSelectedItemIds);
    if (value) {
        newSelectedItemIds.add(item.recordId);
    }
    else {
        newSelectedItemIds.delete(item.recordId);
    }
    return newSelectedItemIds;
};
/**
 * single object with all needed Methods
 */
export const Methods = {
    getConceptTitle,
    onSelectAllItems,
    onSelectIndividualItem
};
//# sourceMappingURL=methods.js.map