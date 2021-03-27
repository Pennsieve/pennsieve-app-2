import * as d3 from 'd3'
import { pathOr } from 'ramda'

/**
* Helper functions
*/

// Spacing algorithm for edges, adjust it at your own risk
export const positionEdge = function (d) {
  let x1 = d.source.x
  let y1 = d.source.y
  let x2 = d.target.x
  let y2 = d.target.y
  let dx = x2 - x1
  let dy = y2 - y1
  let dr = Math.sqrt(dx * dx + dy * dy)

    // Defaults for normal edge.
  let drx = dr
  let dry = dr
  let xRotation = 0 // degrees
  let largeArc = 0 // 1 or 0
  let sweep = 1 // 1 or 0

  // Self edge.
  if (x1 === x2 && y1 === y2) {
    // Fiddle with this angle to get loop oriented.
    xRotation = 0

    // Needs to be 1.
    largeArc = 1

    // Change sweep to change orientation of loop.
    //sweep = 0;

    // Make drx and dry different to get an ellipse
    // instead of a circle.
    drx = 15
    dry = 15

    // For whatever reason the arc collapses to a point if the beginning
    // and ending points of the arc are the same, adding 1 seems to do the trick.
    x2 = x2 + 1
    y2 = y2 + 1
  }

  return `M${x1},${y1}A${drx},${dry} ${xRotation}, ${largeArc},${sweep} ${x2},${y2}`
}

// Handle edge position, spacing, and curve
export const positionEdgeAlt = function(d) {
  let offset = 30

  const targetX = pathOr(0, ['target', 'x'], d)
  const targetY = pathOr(0, ['target', 'y'], d)
  const sourceX = pathOr(0, ['source', 'x'], d)
  const sourceY = pathOr(0, ['source', 'y'], d)


  let midpoint_x = (sourceX + targetX) / 2
  let midpoint_y = (sourceY + targetY) / 2

  let dx = (targetX - sourceX)
  let dy = (targetY - sourceY)

  let normalize = Math.sqrt((dx * dx) + (dy * dy))
  if (!normalize) {
    normalize = 1
  }

  let offSetX = midpoint_x + offset*(dy/normalize)
  let offSetY = midpoint_y - offset*(dx/normalize)

  return `M${sourceX},${sourceY}S${offSetX},${offSetY} ${targetX},${targetY}`
}

// Handle node position
export const positionNode = function(d) {
  return `translate(${d.x}, ${d.y})`
}

// Gets called on simulation tick event
// Sets the node groups in the position when dragging
export const tickActions = function() {
  // update link positions
  d3.selectAll('.link').attr('d', positionEdge)

  // update node inner positions
  d3.selectAll('.node-group').attr('transform', positionNode)
}
