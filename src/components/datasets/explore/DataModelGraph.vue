<template>
  <div
    v-loading="isLoading"
    v-click-outside="onClickOutsideGraph"
    class="data-model-graph"
    element-loading-background="#fff"
  >
    <h2 v-if="showTitle">
      Data Model
    </h2>

    <data-model-graph-toolbar
      v-if="showToolbar"
      @zoom-in="zoomBy(1.2)"
      @zoom-out="zoomBy(0.8)"
      @center="center"
      @fullscreen="fullscreen"
      @exit-fullscreen="exitFullscreen"
    />

    <div class="chart-wrapper">
      <svg
        ref="chart"
        class="chart"
        :class="active ? `active` : ``"
      />
    </div>
    <div
      v-if="!active && hasData && showOverlay"
      class="enable-chart-wrapper"
      @click.stop="activateChart"
    >
      <div class="enable-chart-message-wrapper">
        <div class="enable-chart-message">
          Click to enable navigation. Click and drag to move. Use your scroll wheel to zoom.
        </div>
      </div>
    </div>
    <div
      v-if="!isLoading && !hasData"
      class="enable-chart-wrapper no-chart-data"
    >
      <p class="no-chart-data--copy">
        <a
          href="https://docs.pennsieve.io/docs/introduction-to-metadata-on-pennsieve"
          target="_blank"
        >
          Learn More
        </a> about how to set up your graph and start gaining insights into your data.
      </p>
    </div>

    <model-tooltip
      :model="hoveredModel"
      @mouseenter.native="shouldHideTooltip = false"
      @mouseleave.native="hideModelTooltip"
    />
  </div>
</template>

<script>
import * as d3 from 'd3'
import { pathOr, propOr, pluck, isNil, uniqBy, prop } from 'ramda'
import debounce from 'lodash/debounce'
import { mapGetters, mapState } from 'vuex'

import DataModelGraphToolbar from './DataModelGraphToolbar/DataModelGraphToolbar.vue'
import ModelTooltip from './ModelTooltip/ModelTooltip.vue'

import Request from '../../../mixins/request'

// Mock Data
import { mockData } from './mock-graph-data'

// D3 Helpers
import { positionEdge, positionNode, tickActions } from '../../../utils/d3Helpers'

// NOTE: Defining simulation variable in global scope becuase we need to initiate d3 force simulation
// within the context onf the renderChart function but we also need access to simulation in update chart function
let simulation
let zoom

// Vue Component
export default {
  name: 'DataModelGraph',

  components: {
    DataModelGraphToolbar,
    ModelTooltip
  },

  mixins: [
    Request
  ],

  props: {
    showTitle: {
      type: Boolean,
      default: true
    },
    height: {
      type: Number,
      default: 500
    },
    hasLinks: {
      type: Boolean,
      default: true
    },
    showRelationshipTypes: {
      type: Boolean,
      default: false
    },
    relationshipLinkedProps: {
      type: Array,
      default: () => []
    },
    strength: {
      type: Number
    },
    schemaProp: {
      type: Array
    },
    showOverlay: {
      type: Boolean,
      default: true
    },
    showToolbar: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      active: false,
      activeNode: String,
      graphData: Object,
      hasData: false,
      hoveredModel: {},
      newDataArray: []
    }
  },

  computed: {
    ...mapState([
      'conceptsHash',
      'relationshipTypes',
    ]),

    ...mapGetters([
      'userToken',
      'config'
    ]),

    graphUrl: function() {
      const apiUrl = this.config.conceptsUrl
      const datasetId = pathOr('', ['params', 'datasetId'])(this.$route)
      if (apiUrl && datasetId) {
        return `${apiUrl}/datasets/${datasetId}/concepts/schema/graph`
      }
    }
  },

  watch: {
    /**
     * Watch the schema property and transform the data when available
     */
    schemaProp: {
      handler: function(val) {
        if (val) {
          this.graphData = this.transformApiResponse(val)
          this.isLoading = false
        }
      },
      immediate: true
    },

    activeNode: function() {
      const data = this.graphData
      const { edges, nodes } = this.formatData(data.edges, data.nodes, this.activeNode)
      this.updateChart(edges, nodes)
    },
    graphData: {
      handler: function(graphData) {
        let data = graphData
        if (Object.keys(data).length > 0) {
          const hasEdges = propOr([], 'edges', data).length > 0
          const hasNodes = propOr([], 'nodes', data).length > 0
          if (hasNodes) {
            this.hasData = true
          } else {
            this.hasData = false
            data = this.transformApiResponse(mockData)
          }

          this.$nextTick(() => {
            this.renderChart(data)
          })
        }
      },
      immediate: true
    },
    userToken: function() {
      if (this.userToken) {
        this.getGraphData()
      }
    },

    /**
     * Activate the chart if there is no overlay
     */
    showOverlay: {
      handler: function(val) {
        if (val === false) {
          this.activateChart()
        }
      },
      immediate: true
    }
  },

  mounted() {
    this.getGraphData()
    window.addEventListener('resize', this.handleResize.bind(this))
  },

  beforeDestroy() {
    this.destroyChart()
    window.removeEventListener('resize', this.handleResize.bind(this))
  },

  methods: {
    /**
     * Make the chart inactive when the user blurs
     */
    onClickOutsideGraph: function() {
      if (this.active) {
        this.active = false
      }
    },

    /**
     * Redraw d3 chart
     */
    resetChart: function() {
      this.destroyChart()
      this.$nextTick(() => {
        this.getGraphData()
      })
    },

    /**
     * Handles window resize event
     */
    handleResize: debounce(
      function() {
        const { edges, nodes } = this.graphData
        this.updateChart(edges, nodes)
      },
      250
    ),

    /**
     * Sets chart to active state
     */
    activateChart: function() {
      this.active = true
    },

    /**
     * Removes chart from DOM
     */
    destroyChart: function() {
      d3.select('.outer-container').remove()
    },

    /**
     * Calculate total number of edges per node
     * @param {String} key
     * @param {Object} data
     */
    getCounts: function(key, data) {
      const keyValues = pluck(key, data)
      const counts = {}
      keyValues.forEach(function(val) {
        if (counts[val]) {
          counts[val] = counts[val] += 1
        } else {
          counts[val] = 1
        }
      })
      return counts
    },

    /**
     * If activeNode is undefined, returns node that has the most relationships
     * @param {Array} edges
     */
    getActiveNode: function(edges) {
      // if active node has been set, return
      if (this.activeNode) {
        return this.activeNode
      }

      // else, get active node based on concept with the most relationships
      const edgeCounts = this.getCounts('source', edges)

      // set inital max value
      let max = { name: '', value: 0 }

      edgeCounts.forEach(edgeCount => {
        if (edgeCount >= max.value) {
          max = { name: key, value: edgeCount }
        }
      })

      return max.name
    },

    /**
     * Fetch graph data from API
     */
    getGraphData: function() {
      if (!this.userToken) {
        return
      }

      // Short circuit if data is being passed to component
      if (this.schemaProp) {
        return
      }

      if (this.showRelationshipTypes) {
        this.graphData = this.transformRelationshipTypes()
        this.isLoading = false
        return
      }

      this.sendXhr(this.graphUrl, {
        header: {
          'Authorization': `bearer ${this.userToken}`
        }
      })
      .then(response => {
        this.graphData = this.transformApiResponse(response)
      })
      .catch(this.handleXhrError.bind(this))
    },

    /**
     * Transform relationships types and concepts state
     * @returns {Object}
     */
    transformRelationshipTypes: function() {
      const conceptsHash = this.conceptsHash

      // get available nodes and edges
      const edges = []
      const nodes = []

      this.relationshipTypes.forEach(relType => {
        const { to, from } = relType

        // get nodes
        if (conceptsHash[to] && conceptsHash[from]) {
          nodes.push(conceptsHash[to])
          nodes.push(conceptsHash[from])
        }

        // get edges
        const hasSource = !isNil(from) && !isNil(conceptsHash[from])
        const hasDestination = !isNil(to) && !isNil(conceptsHash[to])

        if (hasSource && hasDestination) {
          relType.source = from
          relType.target = to
          edges.push(relType)
        }
      })


      return {
        nodes: uniqBy(prop('id'), nodes),
        edges
      }
    },

    /**
     * Transform API GET Response
     * @param {Arrray} data
     * @returns {Object}
     */
    transformApiResponse: function(data) {
      const nodes = []
      const edges = []

      data.forEach(obj => {
        if (obj.type && (obj.type === 'schemaRelationship' || obj.type === 'schemaLinkedProperty')) {
          const hasFromNode = data.findIndex(d => d.id === obj.from) >= 0
          const hasToNode = data.findIndex(d => d.id === obj.to) >= 0

          if (hasFromNode && hasToNode) {
            obj.source = obj.from
            obj.target = obj.to
            edges.push(obj)
          }
        } else {
          nodes.push(obj)
        }
      })

      return { nodes, edges }
    },

    /**
    * Format nodes and edges data for chart
    * @param {Array} rawEdges
    * @param {Array} rawNodes
    * @param {String} activeNode
    */
    formatData: function(rawEdges, rawNodes, activeNode = '') {
      const nodes = rawNodes.map(function(node) {
        // set node active state
        if (activeNode && (node.id === activeNode)) {
          node.active = true
        } else {
          node.active = false
        }
        return node
      })

      const edges = rawEdges.map(function(edge) {
        const { source, target } = edge
        // if active node === source node, update target node active state
        if (activeNode && (activeNode === source.id)) {
          const nodeIdx = nodes.findIndex(n => n.id === target.id)
          nodes[nodeIdx].active = true
          // set edge active state
          edge.active = true
        // if active node === target node, update source node active state
        } else if (activeNode && (activeNode === target.id)) {
          const nodeIdx = nodes.findIndex(n => n.id === source.id)
          nodes[nodeIdx].active = true
          // set edge active state
          edge.active = true
        } else {
          edge.active = false
        }
        return edge
      })

      return { edges, nodes }
    },

    /**
     * Compute strength value based on number of edges
     */
    getStrength: function(edges) {
      const total = edges.length

      switch(true) {
        case total >= 35:
          return -200
        case total >= 25:
          return -150
        case total >= 15:
          return -125
        default:
          return -100
      }
    },

    /**
    * Renders d3 chart
    * @param {Object} data
    */
    renderChart: function(data) {
      // Format data
      const vm = this
      const activeNode = vm.activeNode
      const { edges, nodes } = this.formatData(data.edges, data.nodes, activeNode)

      /**
      * Initial Setup
      */

      // svg element
      const chartRef = this.$refs.chart
      // svg selection
      const svg = d3.select(chartRef)
      // outer container selection
      const outerContainer = svg.append('g').attr('class', 'outer-container')
      // tooltip
      const tooltip = d3.select('.model-tooltip')
      // set width and height
      const chartPosition = chartRef.getBoundingClientRect()
      const width = Math.floor(chartPosition.width)
      const height = this.height
      const strength = this.strength ? this.strength : vm.getStrength(edges)

      svg.attr('width', width)
      svg.attr('height', height)

    /**
     * Zoom
    */

     outerContainer.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .style('z-index', 1)

      zoom = d3.zoom()
        .scaleExtent([1 / 2, 4])
        .on('zoom', zoomed)

      outerContainer.call(zoom)

      function zoomed() {
        const transform = d3.zoomTransform(this).toString()
        innerContainer.attr('transform', transform)
      }

      /**
      * Force Simulation
      */

      /**
      * 'charge' force simulates electrostatic effects, which makes the graph feel organic and natural
      * as the nodes affect each other. Negative values are repulsive. If we used a positive strength,
      * it would simulate a gravitational pull
      *
      * 'collide' force handles collisions more gracefully than other options
      */

      simulation = d3.forceSimulation()
        // pull nodes together based on relationships (links)
        .force('link', d3.forceLink().id(function(d) {
            return d.id;
        })
        .strength(0.025))
        // push nodes apart
        .force('charge', d3.forceManyBody().strength(strength))
        // collision detection
        .force('collide', d3.forceCollide().radius(12))
        // center inside the svg
        .force('center', d3.forceCenter(width / 2, height / 2))

      // add force simulation to nodes
      // tell it what to do on each tick
      simulation
        .nodes(nodes)
        .on('tick', tickActions)

      // add force simulation to edges
      // edges create forces which either push nodes together or apart depending on the applied strength
      simulation
        .force('link')
        .links(edges)

      /**
       * Improve spacing on page load
       *
       * If alpha is specified, sets the current alpha to the specified number in the range [0,1] and returns this simulation.
       * If alpha is not specified, returns the current alpha value, which defaults to 1.
       */
      simulation.alpha()

     /**
     * Markers
     */

     const defs = svg.append('defs')

     defs.append('marker')
       .attr('id', 'marker')
       .attr('viewBox', '0 -5 10 10')
       .attr('refX', 17)
       .attr('refY', -1.5)
       .attr('markerWidth', 10)
       .attr('markerHeight', 10)
       .attr('orient', 'auto')
       .attr('markerUnits', 'userSpaceOnUse')
       .append('path')
       .attr('d', 'M0,-5L10,0L0,5')
       .attr('fill', '#BDBDBD')

    defs.append('marker')
      .attr('id', 'marker-active')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 17)
      .attr('refY', -1.5)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('orient', 'auto')
      .attr('markerUnits', 'userSpaceOnUse')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgb(39,96,255, 1)')


     /**
     * Drag / Drop functionality
     */
     const dragDrop = d3.drag()
       .on('start', function(node) {
         // kill cursor pointer
         d3.select(this).style('cursor', 'auto')
         // kill tooltip
         d3.select('.tooltip').style('opacity', 0)
         // update node position
         node.fx = node.x
         node.fy = node.y
       })
       .on('drag', function (node) {
         simulation.alphaTarget(0.7).restart()
         node.fx = d3.event.x
         node.fy = d3.event.y
       })
       .on('end', function (node) {
         if (!d3.event.active) {
           simulation.alphaTarget(0)
         }
         // reset cursor pointer
         d3.select(this).style('cursor', 'pointer')

         node.fx = null
         node.fy = null
       })

     /**
     * Next we'll add the nodes and edges to the visualization.
     * We start with the edges. The order here is
     * important because we want the nodes to appear 'on top of'
     * the edges. SVG doesn't really have a convenient equivalent
     * to HTML's `z-index`; instead it relies on the order of the
     * elements in the markup. By adding the nodes _after_ the
     * edges we ensure that nodes appear on top of edges.
     */

     /**
      * Inner Container
      */
     const innerContainer = outerContainer.append('g')
        .attr('class', 'inner-container')
        .style('z-index', 2)

      /**
      * Edge elements
      */
      const edgeElements = innerContainer.append('g')
        .attr('class', 'edges')
        .selectAll('path')
        .data(edges)
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('stroke', function(d) {
          if (d.active) {
            return '#2760FF'
          }
          return '#DADADA'
        })
        .attr('sroke-width', '1px')
        .attr('fill', 'none')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 2)

      if (vm.showRelationshipTypes) {
        edgeElements
          .attr('marker-end', function(d) {
            if (d.from === d.to) {
              return ''
            }

            if (d.active) {
              return 'url(#marker-active)'
            } else {
              return 'url(#marker)'
            }
          })
      }

      /**
      * node group container
      */
      const nodeGroupContainer = innerContainer.append('g').attr('class', 'nodes')

      /**
      * node group elements
      */
      const nodeGroupElements = nodeGroupContainer.selectAll('g')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', function(d) {
          return `node-group ${d.id.toLowerCase()}`
        })

      /**
      * node circle elements
      */
      const cursor = vm.hasLinks ? 'pointer' : 'default'

      const nodeCircleElements = nodeGroupElements.append('circle')
        .attr('class', function(d) {
          return `node-circle ${d.id.toLowerCase()}`
        })
        .attr('r', 9)
        .style('cursor', cursor)
        .attr('fill', function(d) {
          return d.active ? '#2760FF' : '#BDBDBD'
        })
        .attr('data-id', function(d) {
          return d.id
        })

      /**
      * node text elements
      */
      const nodeTextElements = nodeGroupElements.append('foreignObject')
        .attr('width', '150')
        .attr('height', 1)
        .attr('class', function(d) {
          return `node-text ${d.id.toLowerCase()}`
        })
        .attr('x', 16)
        .attr('y', -7)
        .attr('data-id', function(d) {
          return d.id
        })
        .append('xhtml:div')
        .attr('class', 'node-text-div')
        .html(function(d) {
          return `<span class='node-text-span' style='cursor:${cursor}'>${d.displayName}</span>`
        })

    nodeGroupElements.call(dragDrop)


      /**
      * Events
      */

      /**
      * Node Text Click
      */
      d3.selectAll('foreignObject').on('click', handleNodeTextClick)

      function handleNodeTextClick(d) {
        if (vm.hasLinks && !vm.showRelationshipTypes) {
          vm.$router.push({ name: 'concept-search', params: { conceptId: d.id } })
        }
      }

      /**
       * Node Circle Click
       */
       d3.selectAll('.node-circle').on('click', handleNodeClick)

       function handleNodeClick(d) {
         vm.activeNode = d.id
       }

      /**
      * Chart Hover
      */
      // d3.select('.chart').on('mousemove', handleChartHover)

      function handleChartHover(d) {
        const e = d3.event
        const target = e.target
        const nodeName = target.nodeName

        const chart = document.querySelector('.chart')
        const [x, y] = d3.mouse(chart)

        // Always update position here to avoid jitter on node enter / leave
        tooltip.style('left', `${x + 16}px`)
        tooltip.style('top', `${y}px`)

        if (nodeName === 'circle') {
          tooltip.style('opacity', 1)
        } else {
          tooltip.style('opacity', 0)
        }
      }

      /**
       * Node Enter & Leave
       */
      d3.selectAll('.node-circle').on('mouseenter', handleNodeEnter)

      function handleNodeEnter(d) {
        vm.shouldHideTooltip = false

        vm.hoveredModel = d
        const textEl = vm.$el.querySelector(`.node-text[data-id="${d.id}"]`)
        if (textEl) {
          const boundingBox = textEl.getBoundingClientRect()

          tooltip.style('transform', `translate(${boundingBox.x}px, ${boundingBox.y}px)`)
        }
      }

      d3.selectAll('.node-circle').on('mouseleave', vm.hideModelTooltip)
    },

    /**
     * Updates d3 chart
     * @param {Object} data
     */
    updateChart: function(edges, nodes) {
      const vm = this

      // update svg dimensions
      const chartRef = this.$refs.chart
      if (!chartRef) {
        window.removeEventListener('resize', this.handleResize.bind(this))
        return
      }
      const svg = d3.select(chartRef)
      const chartPosition = chartRef.getBoundingClientRect()
      const width = Math.floor(chartPosition.width)
      const height = this.height

      svg.attr('width', width)
      svg.attr('height', height)

      // update outer container dimensions
      const outerContainer = d3.select('.outer-container')
      outerContainer.attr('width', width)
      outerContainer.attr('height', height)

      const rect = d3.select('.outer-container rect')
      rect.attr('width', width)
      rect.attr('height', height)


      /**
      * Edge elements
      */

      // DATA JOIN
      // Join new data with old elements, if any.
      const edgeElements = d3.selectAll('.link')
        .data(edges)

      // ENTER + UPDATE
      // After merging the entered elements with the update selection,
      // apply operations to both.
      edgeElements.enter().append('path')
        .merge(edgeElements)
        .attr('class', 'link')
        .attr('stroke', function(d) {
          if (d.active) {
            return 'rgb(39,96,255, 1)'
          }
          return '#ddd'
        })
        .attr('sroke-width', '1px')
        .attr('fill', 'none')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 2)

      if (vm.showRelationshipTypes) {
        edgeElements
          .attr('marker-end', function(d) {
            if (d.from === d.to) {
              return ''
            }

            if (d.active) {
              return 'url(#marker-active)'
            } else {
              return 'url(#marker)'
            }
          })
      }

      // EXIT
      // Remove old elements as needed.
      edgeElements.exit().remove();

      /**
      * node circle elements
      */
      const nodeCircleElements = d3.selectAll('.node-circle')
        .data(nodes)

      nodeCircleElements.enter().append('circle')
        .merge(nodeCircleElements)
        .attr('class', function(d) {
          return `node-circle ${d.id.toLowerCase()}`
        })
        .attr('r', 9)
        .style('cursor', 'pointer')
        .attr('fill', function(d) {
          return d.active ? '#2760FF' : '#BDBDBD'
        })

      nodeCircleElements.exit().remove()

      /**
      * node text elements
      */
      const nodeTextElements = d3.selectAll('.node-text-div')
        .data(nodes)

      const cursor = vm.hasLinks ? 'pointer' : 'default'
      nodeTextElements.enter().append('xhtml:div')
        .merge(nodeTextElements)
        .attr('class', 'node-text-div updated')
        .html(function(d) {
          if (d.id === vm.activeNode) {
            let activeStyles = 'background: color: #2760FF;'

            if (vm.hasLinks && !vm.showRelationshipTypes) {
              activeStyles += `cursor: ${cursor}; border-bottom: 2px solid;`
            }

            return `<span class='node-text-span' style="${activeStyles}">${d.displayName}</span>`
          }
          return `<span class='node-text-span' style='cursor: ${cursor};'>${d.displayName}</span>`
        })

      nodeTextElements.exit().remove()

      /**
       * Restart force simulation
       */

      // center inside the svg
      simulation.force('center', d3.forceCenter(width / 2, height / 2))

      // add force simulation to nodes
      // tell it what to do on each tick
      simulation.nodes(nodes)

      // add force simulation to edges
      // edges create forces which either push nodes together or apart depending on the applied strength
      simulation.force('link').links(edges)

      simulation.restart()
    },

    /**
     * Center the graph at the current zoom level
     */
    center: function() {
      const outerContainer = d3.select('.outer-container')
      outerContainer.transition().duration(400).call(zoom.transform, d3.zoomIdentity)
    },

    /**
     * Zoom the graph in or out
     */
    zoomBy: function(num) {
      const outerContainer = d3.select('.outer-container')
      outerContainer.call(zoom.scaleBy, num)
    },

    /**
     * Fullscreen the graph
     */
    fullscreen: function() {
      const graphBrowser = document.querySelector('.graph-browser')
      if (graphBrowser) {
        graphBrowser.requestFullscreen()
      }
    },

    /**
     * Fullscreen the graph
     */
    exitFullscreen: function() {
      document.exitFullscreen()
    },

    /**
     * Focus on node
     * @param {Object} evt
     */
    focusNode: function(evt) {
      const id = propOr('', 'id', evt)
      const node = this.$el.querySelector(`[data-id="${id}"]`)

      if (node) {
        const x = node.__data__.x + 150 // Account for the width of the models list sidebar
        const y = node.__data__.y
        const outerContainer = d3.select('.outer-container')
        outerContainer.transition().duration(400).call(zoom.translateTo, x, y)
        this.activeNode = id
      }
    },

    /**
     * Hide tooltip if it should be hidden
     * `shouldHideTooltip` is set to `true` on `mouseleave` of the circle node or tooltip
     * `shouldHideTooltip` is set to `false` on `mouseenter` of the circle node or tooltip
     */
    hideModelTooltip: function() {
      this.shouldHideTooltip = true
      clearTimeout(this.hideModelTooltipTimeout)

      this.hideModelTooltipTimeout = setTimeout(() => {
        if (this.shouldHideTooltip) {
          this.hoveredModel = {}
          this.shouldHideTooltip = false
        }
      }, 300)
    }
  }
}
</script>

<style lang='scss' scoped>
@import '../../../assets/_variables.scss';

.data-model-graph {
  height: 100%;
  position: relative;
  width: 100%;
}

.chart-wrapper {
  background: #fff;
  position: relative;
  width: 100%;
}

.tooltip {
  opacity: 0;
  color: $purple_1;
  padding: 8px;
  position: absolute;
  z-index: 10;
  width: auto;
  border: 1px solid #DADADA;
  border-radius: 3px;
  background-color: $white;
  box-shadow: 0 2px 10px 0 rgba(0,0,0,0.15);
}

.chart {
  display: block;
  position: relative;
  height: 100%;
  width: 100%;
  z-index: 1;

  &.active {
    z-index: 2;
  }
}

.enable-chart-wrapper {
  align-items: start;
  display: flex;
  height: 100%;
  justify-content: center;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 3;
  left: 0;

  &.no-chart-data {
    background: rgba(64,69,84,0.86);
    z-index: 5;
    align-items: center;
    justify-content: center;
    color: #fff;

    p {
      max-width: 450px;
      margin: 0;
      text-align: center;
    }

    a {
      color: #fff;
      text-decoration: underline;

      &:hover, &:active {
        color: #fff;
        text-decoration: none;
      }
    }
  }
}

.enable-chart-message-wrapper {
	border-radius: 12px;
	background-color: $purple_1;
  cursor: pointer;
  padding: 10px 18px;
  margin:8px;
	width: auto;

  .enable-chart-message {
    color: $white;
    line-height: 14px;
    text-align: center;
  }
}
</style>
<style lang="scss">
  .data-model-graph {
    .el-loading-mask {
      transition: none;
      z-index: 2
    }

    .node-text {
      overflow: visible;
    }
  }
</style>
