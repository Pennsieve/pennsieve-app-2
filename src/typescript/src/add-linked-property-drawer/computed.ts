import {ConceptInstanceRoute} from "./_model";

/**
 * disable the save button
 * @param radioSelection the currently selected item
 * @param initialSelection the originally selected item (if applicable)
 */
const disableButton = (radioSelection: string, initialSelection: string): boolean =>
  !radioSelection || radioSelection === initialSelection

/**
 * whether or not we are editing an existing linked property
 */
const isEditing = (initialSelection: string) => !!initialSelection

/**
 * url to create linked properties
 */
const linkedPropertiesUrl = ($route: ConceptInstanceRoute, conceptsUrl: string, conceptId: string): string =>
  `${conceptsUrl}/datasets/${
  $route.params.datasetId ?? ''
}/concepts/${
  conceptId
}/instances/${
  $route.params.instanceId ?? ''
}/linked`

/**
 * all computed property functions together on a single object
 */
export const Computed = {
  disableButton,
  isEditing,
  linkedPropertiesUrl
}

