import { ModelRecord, PropertyInstance } from "../model-records/_model";
/**
 * single object with all needed Methods
 */
export declare const Methods: {
    getConceptTitle: (records: ModelRecord[]) => Partial<PropertyInstance>;
    onSelectAllItems: (originalSelectedItemIds: Set<string>, items: {
        recordId: string;
    }[], records: ModelRecord[]) => Set<string>;
    onSelectIndividualItem: (originalSelectedItemIds: Set<string>, value: boolean, item: {
        recordId: string;
    }) => Set<string>;
};
//# sourceMappingURL=methods.d.ts.map