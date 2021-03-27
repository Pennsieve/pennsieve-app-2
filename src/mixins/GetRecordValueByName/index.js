import {compose, prop, defaultTo, find, propEq} from 'ramda'

export default {
  methods: {
    /**
     * Get value of a record by name
     */
    getRecordValueByName: (name, list) => compose(
      prop('value'),
      defaultTo({}),
      find(propEq('name', name)),
      defaultTo([])
    )(list)
  }
}
