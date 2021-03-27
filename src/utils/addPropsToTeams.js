import { pathOr, propOr } from 'ramda'

/**
 * Adds lastName and role properties to teams
 * @param {Array} list
 * @returns {Array}
 */
const addPropsToTeams = function(list) {
  return list.map(member => {
    const defaultName = propOr('', 'name', member)
    const teamName = pathOr(defaultName, ['team', 'name'], member)
    const defaultId = propOr('', 'id', member)
    const teamId = pathOr(defaultId, ['team', 'id'], member)
    const props = {
      id: teamId,
      lastName: teamName,
      role: 'Collaborator'
    }
    return teamName ? Object.assign({}, member, props) : member
  })
}

export default addPropsToTeams