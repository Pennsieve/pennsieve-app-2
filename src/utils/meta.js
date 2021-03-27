/**
 * Sets document meta tag data
 * @param {String} attrName
 * @param {String} attrValue
 * @param {String} content
 */
export const setMeta = function(attrName, attrValue, content) {
  let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content || '');
}

/**
 * Sets the document title property
 * @param {String} title
 */
export const setPageTitle = function(title) {
  document.title = title;
}