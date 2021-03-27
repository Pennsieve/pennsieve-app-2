import {ModelRecord, PropertyInstance} from "../model-records/_model";

/**
 * legacy functionality - not sure if this is still relevant
 */
const getConceptTitle = (records: ModelRecord[]): Partial<PropertyInstance> => {
  const [head = { values: [] }, ...tail] = records
  return head.values.find(v => v.conceptTitle) ?? {}
}

/**
 * callback when the select all checkbox is selected
 * @param originalSelectedItemIds the original set
 * @return IMPORTANT - return a NEW set with the mutated values
 */
const onSelectAllItems = (originalSelectedItemIds: Set<string>, items: { recordId: string }[], records: ModelRecord[]): Set<string> => {
  const newSelectedItemIds = new Set(originalSelectedItemIds)
  if (items.length) {
    items.forEach(item => newSelectedItemIds.add(item.recordId))
  } else {
    records.forEach(({ id }) => newSelectedItemIds.delete(id))
  }
  return newSelectedItemIds
}

/**
 * callback when the a single checkbox is selected
 * @param originalSelectedItemIds the original set
 * @return IMPORTANT - return a NEW set with the mutated values
 */
const onSelectIndividualItem = (originalSelectedItemIds: Set<string>, value: boolean, item: { recordId: string }): Set<string> => {
  const newSelectedItemIds = new Set(originalSelectedItemIds)
  if (value) {
    newSelectedItemIds.add(item.recordId)
  } else {
    newSelectedItemIds.delete(item.recordId)
  }
  return newSelectedItemIds
}

/**
 * single object with all needed Methods
 */
export const Methods = {
  getConceptTitle,
  onSelectAllItems,
  onSelectIndividualItem
}