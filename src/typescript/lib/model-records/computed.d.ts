import { ModelRecordsComponentInstance, ModelRecord, ModelRecordsRoute } from "./_model";
/**
 * expose a single interface for computed properties
 */
export declare const Computed: {
    datasetId: ($route?: ModelRecordsRoute | undefined) => string;
    conceptName: (concept?: Partial<import("./_model").Model> | undefined) => string;
    conceptId: (concept?: Partial<import("./_model").Model> | undefined) => string;
    recordCount: (concept?: Partial<import("./_model").Model> | undefined) => number;
    propertyCount: (concept?: Partial<import("./_model").Model> | undefined) => number;
    isFilesProxy: (route$: ModelRecordsRoute, fileProxyId: string) => boolean;
    nonSortableColumns: (searchResults: ModelRecord[]) => string[];
    modelRecordsUrl: ({ config: { conceptsUrl }, datasetId, conceptId, userToken, limit, offset, sortBy, sortDirection }: ModelRecordsComponentInstance) => string | undefined;
};
//# sourceMappingURL=computed.d.ts.map