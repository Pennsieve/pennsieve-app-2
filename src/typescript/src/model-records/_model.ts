// @todo move to top level model
export interface EntityMetaData {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Model extends EntityMetaData {
  id: string;
  count: number;
  locked: boolean;
  name: string;
  displayName: string;
  description: string;
  propertyCount: number;
  templateId: string | null;
}

export type ValueSingleType = string | number | boolean
export type ValueArrayType = string[] | number[] | boolean[]
export type ValueType = null | ValueSingleType | ValueArrayType

export interface PropertyInstance {
  conceptTitle: boolean;
  dataType: any; // @todo bring back data-type.ts model
  default: boolean;
  displayName: string;
  locked: boolean;
  name: string;
  required: boolean;
  value: ValueType
}

export interface ModelRecord extends EntityMetaData {
  id: string;
  type: string;
  values: PropertyInstance[]
}

export interface ModelRecordsRoute {
  readonly params: {
    readonly datasetId?: string;
    readonly conceptId?: string;
  }
}

export interface ModelRecordsComponentInstance {
  config: { conceptsUrl: string };
  datasetId: string;
  conceptId: string;
  userToken: string | undefined;
  isFilesProxy: boolean;
  concepts: Model[];
  concept: Partial<Model>;
  modelRecordsUrl: string | undefined;
  limit: number;
  offset: number;
  sortDirection: 'asc' | 'desc';
  sortBy: string;
  prefixField: (input: string, encode: boolean) => string;
  resultsLoading: boolean;
  searchResults: ModelRecord[];
  totalResults: number;
  sendXhr: <T>(url: string, opts: object) => Promise<T>;
  logger: (...args: any) => void;
  fetchRecords: () => void;
}
