/**
 * execute the fetch of records from the concept instances endpoint
 */
const fetchRecords = async (instance) => {
    var _a;
    if (!instance.modelRecordsUrl)
        return Promise.resolve();
    instance.resultsLoading = true;
    instance.searchResults = [];
    try {
        instance.searchResults = await instance.sendXhr(instance.modelRecordsUrl, {
            header: {
                'Authorization': `bearer ${instance.userToken}`
            },
            method: 'GET',
        });
        instance.resultsLoading = false;
    }
    catch (err) {
        instance.resultsLoading = false;
        instance.logger(['Error', (_a = err.statusText) !== null && _a !== void 0 ? _a : err], 'error');
    }
};
/**
 * call back when a column is sorted
 */
const onUpdateSort = (instance, sortBy) => {
    if (instance.sortBy === sortBy) {
        instance.sortDirection = instance.sortDirection === 'asc' ? 'desc' : 'asc';
    }
    else {
        instance.sortBy = sortBy || 'createdAt';
    }
    instance.offset = 0;
    instance.fetchRecords();
};
/**
 * callback when the records per page is changed
 */
const onUpdateLimit = (instance, limit) => {
    instance.offset = 0;
    instance.limit = limit;
    instance.fetchRecords();
};
/**
 * callback for when the page number is changed
 */
const onPaginationPageChange = (instance, page) => {
    instance.offset = (page - 1) * instance.limit;
    instance.fetchRecords();
};
/**
 * single object to expose the method helpers
 */
export const Methods = {
    fetchRecords,
    onUpdateSort,
    onUpdateLimit,
    onPaginationPageChange
};
//# sourceMappingURL=methods.js.map