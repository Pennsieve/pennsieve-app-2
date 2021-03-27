import  store  from '../../vuex/store'

/**
 * asserts that the passed in type is an "items" type e.g. enum or array
 */
export const isItemsDataType = (dataType) =>
// the records search endpoint returns the type as capital-A 'Array'...not sure why
  typeof dataType === 'object' && ['array', 'enum'].includes(dataType.type.toLowerCase());
/**
 * asserts the passed in string is a numeric type
 */
export const isSimpleNumber = (type) => ['long', 'double'].includes(type.toLowerCase());
/**
 * asserts that the passed in ComplexDataType is numeric
 * @param dataType
 */
export const isComplexNumber = (dataType) => isSimpleNumber(dataType.type);
/**
 * asserts that the passed in format value is a StringSubtype
 * @param format
 */
export const isStringSubtype = (format) => {
  return !!format && ['email', 'url'].includes(format.toLowerCase());
};
/**
 * returns the string representation of a complex datatype
 * @param dataType
 */
export const getComplexDataTypeString = (dataType) => {
  if (dataType.type === 'String') {
    return dataType.format && ['date', 'datetime', 'time'].includes(dataType.format.toLowerCase())
      ? 'Date'
      : dataType.type;
  }
  return dataType.type;
};
/**
 * given a model property, returns a string representation of it's datatype
 * basically, this returns the dataType as a `SimpleDataType'
 * even though it might be a `ComplexDataType` or an `ItemsDataType`
 */
export const getDataTypeString = (dataType) => {
  if (typeof dataType === 'string')
    return dataType;
  if (isItemsDataType(dataType)) {
    return getComplexDataTypeString(dataType.items);
  }
  return getComplexDataTypeString(dataType);
};
/**
 * if the property has a StingSubtype, returns that string, otherwise returns false
 */
export const hasStringSubtype = (property) => {
  if (!property || !property.dataType)
    return false;
  const { dataType } = property;
  if (typeof dataType === 'string')
    return false;
  if (isItemsDataType(dataType)) {
    if (dataType.items.type === 'String' && isStringSubtype(dataType.items.format)) {
      return dataType.items.format;
    }
  }
  if (dataType.type === 'String' && isStringSubtype(dataType.format)) {
    return dataType.format;
  }
  return false;
};
/**
 * if the given property has a scientific unit, returns that string, otherwise returns false
 * @param property
 */
export const hasUnit = (property) => {
  if (!property || !property.dataType)
    return false;
  const { dataType } = property;
  if (typeof dataType === 'string')
    return false;
  if (isItemsDataType(dataType)) {
    if (isComplexNumber(dataType.items) && dataType.items.unit) {
      return getUnitDisplayName(dataType.items.unit);
    }
    return false;
  }
  if (isComplexNumber(dataType) && dataType.unit) {
    return getUnitDisplayName(dataType.unit);
  }
  return false;
};

/**
  * Grabs the unit name and returns the displayName
  * @param {String} unit
*/
export const getUnitDisplayName = (unitName) => {
  for (const dimension of store.state.scientificUnits) {
    for (const unit of dimension.units) {
      if (unitName === unit.name) return unit.displayName
    }
  }
  return unitName
};
/**
 *
 * @param x
 */
export const assertUnreachable = (x) => {
  throw new Error("Didn't expect to get here.  Did you handle every case?");
};
import moment from 'moment';
import startCase from 'lodash/startCase';

/**
 * null, undefined, and empty string are considered "empty" values who can just be formatted as the empty string
 * @param value
 * @returns {boolean}
 */
function isEmptyValue(value) {
  return [null, undefined, ''].includes(value)
}

/**
 * helper that wraps a formatter function in another function...
 * If the provided value is empty, it skips the formatter and returns an empty string.
 * If the value is not empty, the formatter provided as an argument is called.
 * @param formatter the actual formatter
 * @return a modified formatter function that does said checks first and runs the provided formatter if they pass
 */
function emptyWrapper(formatter) {
  return value => {
    if(isEmptyValue(value)) return '';
    return formatter(value)
  }
}

/**
 * given a dataType, returns the proper formatter for a single value
 */
export const getFormatter = (dataType) => {
  const marker = getDataTypeString(dataType);
  switch (marker) {
    case 'Boolean':
      return emptyWrapper(
        value => startCase(value)
      )
    case 'Date':
      return emptyWrapper(
        value => moment.utc(value).format('MMMM D, YYYY HH:mm:ss')
      )
    case 'Long':
      return emptyWrapper(
        value => {
          const unit = hasUnit({ dataType });
          const unitSuffix = unit ? ` ${unit}` : '';
          return `${value.toString()}${unitSuffix}`;
        }
      )
    case 'Double':
      return emptyWrapper(
        value => {
          const unit = hasUnit({ dataType });
          const unitSuffix = unit ? ` ${unit}` : '';
          if (value === Math.floor(value)) {
            return `${value.toFixed(1)}${unitSuffix}`;
          }
          return `${value.toFixed(2)}${unitSuffix}`;
        }
      )
    case 'String':
      return emptyWrapper(
        value => {
          const stringSubtype = hasStringSubtype({ dataType });
          if (stringSubtype) {
            switch (stringSubtype) {
              case 'URL':
                return `<a href="${value}" target="_blank" onclick="event => event.stopPropagation()">${value}</a>`;
              case 'Email':
                return `<a href="mailto:${value}" target="_blank" onclick="event => event.stopPropagation()">${value}</a>`;
            }
          }
          return value;
        }
      )
    default:
      assertUnreachable(marker);
      return () => '';
  }
};
