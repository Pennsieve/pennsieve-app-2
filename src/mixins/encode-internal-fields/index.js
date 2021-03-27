const internalFields = [
  'conceptTitle',
  'count',
  'createdAt',
  'createdBy',
  'datasetId',
  'dataType',
  'default',
  'deleted',
  'deletedAt',
  'deletedBy',
  'description',
  'displayName',
  'externalId',
  'index',
  'locked',
  'organizationId',
  'propertyCount',
  'proxyType',
  'relationshipType',
  'schemaRelationshipId',
  'type',
  'updatedAt',
  'updatedBy',
]

export default {
  methods: {
    /**
     * Encodes internal field names to prevent user-generated conflicts
     * @param {String} val
     * @returns {String}
     */
    prefixField: function(val, encode = true) {
      if (internalFields.indexOf(val) < 0) {
        return val
      }
      const updatedVal = `$${val}`
      return encode ? encodeURIComponent(updatedVal) : updatedVal
    },
  }
}