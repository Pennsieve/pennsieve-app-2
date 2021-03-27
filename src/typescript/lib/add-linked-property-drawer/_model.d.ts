import { ModelRecord, ModelRecordsComponentInstance } from "../model-records/_model";
export interface LinkedProperty {
    linkedPropertyId: string;
    schemaLinkedProperty: {
        displayName: string;
        id: string;
        name: string;
    };
    to: {
        modelDisplayName: string;
        modelId: string;
        recordDisplayName: string;
        recordId: string;
    };
}
export interface ConceptInstanceRoute {
    readonly params: {
        readonly datasetId?: string;
        readonly instanceId?: string;
    };
}
export declare type AddLinkedPropertyComponentInstance = {
    $route: ConceptInstanceRoute;
    radioSelection: string;
    initialSelection: string;
    linkedProperty: Partial<LinkedProperty>;
    isCreating: boolean;
    visible: boolean;
    recordTo: Partial<ModelRecord>;
} & Omit<ModelRecordsComponentInstance, '$route' | 'isFilesProxy' | 'concepts'>;
//# sourceMappingURL=_model.d.ts.map