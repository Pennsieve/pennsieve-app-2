const datasetId = ($route) => { var _a; return (_a = $route === null || $route === void 0 ? void 0 : $route.params.datasetId) !== null && _a !== void 0 ? _a : ''; };
/**
 * self explanatory
 */
const conceptName = (concept) => {
    var _a;
    return (_a = concept === null || concept === void 0 ? void 0 : concept.name) !== null && _a !== void 0 ? _a : '';
};
/**
 * self explanatory
 */
const conceptId = (concept) => { var _a; return (_a = concept === null || concept === void 0 ? void 0 : concept.id) !== null && _a !== void 0 ? _a : ''; };
/**
 * self explanatory
 */
const recordCount = (concept) => { var _a; return (_a = concept === null || concept === void 0 ? void 0 : concept.count) !== null && _a !== void 0 ? _a : 0; };
/**
 * self explanatory
 */
const propertyCount = (concept) => { var _a; return (_a = concept === null || concept === void 0 ? void 0 : concept.propertyCount) !== null && _a !== void 0 ? _a : 0; };
/**
 * identifies whether this model is a proxy for files?
 */
const isFilesProxy = (route$, fileProxyId) => !!route$.params.conceptId &&
    route$.params.conceptId === fileProxyId;
/**
 * we cannot sort array-like columns
 */
const nonSortableColumns = (searchResults) => {
    if (searchResults.length) {
        return searchResults[0].values
            .filter(v => typeof v.dataType !== 'string' && v.dataType.type.toLowerCase() === 'array')
            .map(v => v.name);
    }
    return [];
};
/**
 * url for the concept instances endpoint, along with query params
 */
const modelRecordsUrl = ({ config: { conceptsUrl }, datasetId, conceptId, userToken, limit, offset, sortBy, sortDirection }) => {
    if (!datasetId || !conceptId || !userToken) {
        return;
    }
    return `${conceptsUrl}/datasets/${datasetId}/concepts/${conceptId}/instances?limit=${limit}&offset=${offset}&orderBy=${sortBy}&ascending=${sortDirection === 'asc'}`;
};
/**
 * expose a single interface for computed properties
 */
export const Computed = {
    datasetId,
    conceptName,
    conceptId,
    recordCount,
    propertyCount,
    isFilesProxy,
    nonSortableColumns,
    modelRecordsUrl,
};
//# sourceMappingURL=computed.js.map