import { Computed as AddLinkedPropertyComputed } from '../add-linked-property-drawer/computed';
import { Computed as ModelRecordsComputed } from '../model-records/computed';
/**
 * all of the functionality is the same as ModelRecords or AddLinkedProperty
 */
const { modelRecordsUrl } = AddLinkedPropertyComputed;
const { recordCount, propertyCount, conceptId, nonSortableColumns } = ModelRecordsComputed;
/**
 * single object with computed property functions
 */
export const Computed = {
    recordCount,
    propertyCount,
    conceptId,
    nonSortableColumns,
    modelRecordsUrl
};
//# sourceMappingURL=computed.js.map