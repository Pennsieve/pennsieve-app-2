import {ModelRecordsComponentInstance, ModelRecord, ModelRecordsRoute} from "./_model";

type ConceptArg = ModelRecordsComponentInstance['concept']

const datasetId = ($route?: ModelRecordsRoute): string =>
  $route?.params.datasetId ?? ''

/**
 * self explanatory
 */
const conceptName = (concept?: ConceptArg): string => {
  return concept?.name ?? ''
}

/**
 * self explanatory
 */
const conceptId = (concept?: ConceptArg): string =>
  concept?.id ?? ''

/**
 * self explanatory
 */
const recordCount = (concept?: ConceptArg): number =>
  concept?.count ?? 0

/**
 * self explanatory
 */
const propertyCount = (concept?: ConceptArg): number =>
  concept?.propertyCount ?? 0

/**
 * identifies whether this model is a proxy for files?
 */
const isFilesProxy = (route$: ModelRecordsRoute, fileProxyId: string): boolean =>
  !!route$.params.conceptId &&
  route$.params.conceptId === fileProxyId

/**
 * we cannot sort array-like columns
 */
const nonSortableColumns = (searchResults: ModelRecord[]): string[] => {
  if (searchResults.length) {
    return searchResults[0].values
      .filter(v => typeof v.dataType !== 'string' && v.dataType.type.toLowerCase() === 'array')
      .map(v => v.name)
  }
  return []
}

/**
 * url for the concept instances endpoint, along with query params
 */
const modelRecordsUrl = ({
  config: { conceptsUrl },
  datasetId,
  conceptId,
  userToken,
  limit,
  offset,
  sortBy,
  sortDirection
}: ModelRecordsComponentInstance): string | undefined => {
  if (!datasetId || !conceptId || !userToken) {
    return
  }
  return `${
    conceptsUrl
  }/datasets/${
    datasetId
  }/concepts/${
    conceptId
  }/instances?limit=${
    limit
  }&offset=${
    offset
  }&orderBy=${
    sortBy
  }&ascending=${
    sortDirection === 'asc'
  }`
}

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
}