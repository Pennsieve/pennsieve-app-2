export const PROPERTY_DELETION_STATES = {
  INITIAL: 'INITIAL',
  CONFIRM_RECORD_MODIFICATION: 'CONFIRM_RECORD_MODIFICATION',
  FAILED: 'FAILED'
}

export const MAX_RECORD_COUNT_FOR_PROPERTY_DELETION = 100000

export const modelUrlV2 = (conceptsUrl, activeOrganization, dataset, $route) => {
  const datasetId = dataset.content.intId
  const organizationId = activeOrganization.organization.intId
  const modelId = $route.params.conceptId

  return `${conceptsUrl}/v2/organizations/${organizationId}/datasets/${datasetId}/models/${modelId}/properties`
}