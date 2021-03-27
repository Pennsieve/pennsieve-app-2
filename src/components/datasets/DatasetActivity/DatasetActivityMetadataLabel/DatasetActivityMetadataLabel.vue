<template>
  <div>
    <template v-if="hasVariableMessage && event.totalCount === 1">
      {{ variableActivity[event.eventType] }}
    </template>

    <template v-else>
      {{ renderMetadataActivity }}
    </template>
  </div>
</template>

<script>
import { pathOr } from 'ramda'
import { ChangelogMessage } from '@/utils/constants'

/**
 * Replace variable string with data
 * Used to compute variable dataset metadata constant
 * @param {Object} event
 * @param {Object} variable
 * @param {Array} path
 * @returns {String}
 */
const getVariableMetadata = (event, variable, path) => {
  const replacement = pathOr('', path, event)
  return ChangelogMessage.METADATA_UPDATE[event.eventType].singular.replace(variable, replacement)
}

/**
 * Replace variable string with data
 * Used to compute variable dataset metadata constant
 * @param {Object} event
 * @returns {String}
 */
const getFullnameMetadata = (event) => {
  const firstName = pathOr('', ['event', 'detail', 'firstName'], event)
  const lastName = pathOr('', ['event', 'detail', 'lastName'], event)
  return ChangelogMessage.METADATA_UPDATE[event.eventType].singular.replace(['[FULLNAME]'], `${firstName} ${lastName}`)
}

/**
 * Replace variable string with data
 * Used to compute dataset status message
 * @param {Object} event
 * @returns {String}
 */
const getStatusMetadata = (event) => {
  const oldStatus = pathOr('', ['event', 'detail', 'oldStatus', 'displayName'], event)
  const newStatus = pathOr('', ['event', 'detail', 'newStatus', 'displayName'], event)

  const verbiage = event.totalCount > 1
    ? 'plural'
    : 'singular'
  return ChangelogMessage.METADATA_UPDATE.UPDATE_STATUS[verbiage].replace('[OLDNAME]', oldStatus).replace('[NEWNAME]', newStatus)
}

export default {
  name: 'DatasetActivityMetadataLabel',

  props: {
    event: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      variableActivity: {
        'ADD_EXTERNAL_PUBLICATION': getVariableMetadata(this.event, '[DOI]', ['event', 'detail', 'doi']),
        'REMOVE_EXTERNAL_PUBLICATION': getVariableMetadata(this.event, '[DOI]', ['event', 'detail', 'doi']),
        'ADD_COLLECTION': getVariableMetadata(this.event, '[NAME]', ['event', 'detail', 'name']),
        'REMOVE_COLLECTION': getVariableMetadata(this.event, '[NAME]', ['event', 'detail', 'name']),
        'ADD_TAG': getVariableMetadata(this.event, '[NAME]', ['event', 'detail', 'name']),
        'REMOVE_TAG': getVariableMetadata(this.event, '[NAME]', ['event', 'detail', 'name']),
        'ADD_CONTRIBUTOR': getFullnameMetadata(this.event),
        'REMOVE_CONTRIBUTOR': getFullnameMetadata(this.event),
        'UPDATE_STATUS': getStatusMetadata(this.event),
        'UPDATE_IGNORE_FILES': getVariableMetadata(this.event, '[NUMBER]', ['event', 'detail', 'totalCount']),
        'UPDATE_LICENSE': getVariableMetadata(this.event, '[LICENSE]', ['event', 'detail', 'newLicense']),
      }
    }
  },

  computed: {
    /**
     * Computes if the activity is a variable message activity
     * @returns {Boolean}
     */
    hasVariableMessage: function() {
      return Object.keys(this.variableActivity).includes(this.event.eventType)
    },

    /**
     * Compute the activity, depending on the totalCount
     * for activity that doesn't have variable content in
     * the message
     * @returns {String}
     */
    renderMetadataActivity: function() {
      return this.event.totalCount > 1
        ? `${this.event.totalCount} ${ChangelogMessage.METADATA_UPDATE[this.event.eventType].plural}`
        : ChangelogMessage.METADATA_UPDATE[this.event.eventType].singular
    }
  }
}
</script>
