import {
  compose,
  filter,
  join,
  pickAll,
  ifElse,
  length,
  concat,
  always,
  propOr
} from 'ramda'

export const displayName = compose(
  join(' '),
  filter(val => val && val.length),
  Object.values,
  pickAll(['firstName', 'middleInitial', 'lastName'])
)

export const displayDegree = compose(
  ifElse(
    length,
    concat(', '),
    always('')
  ),
  propOr('', 'degree')
)

export const displayNameAndDegree = data => displayName(data) + displayDegree(data)
