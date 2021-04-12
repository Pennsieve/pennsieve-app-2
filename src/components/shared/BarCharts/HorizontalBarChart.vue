<template>
  <svg
    :id="chartId"
    class="horizontal-bar-chart"
  />
</template>

<script>
import * as d3 from 'd3'

/**
 * Makes bar chart responsive based on window resize
 * @param {Object} svg
 */
const responsify = function(svg) {
  // get container + svg aspect ratio
  const container = d3.select(svg.node().parentNode)
  const width = svg.node().getBoundingClientRect().width
  const height = svg.node().getBoundingClientRect().height
  const aspect = width / height

  // get width of container and resize svg to fit it
  const resize = () => {
    const targetWidth = container.node().getBoundingClientRect().width
    const targetHeight = container.node().getBoundingClientRect().height
    svg.attr('width', targetWidth)
    svg.attr('height', targetHeight)
  }

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg.attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMinYMid')
    .call(resize)

  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/d3/d3-selection/blob/master/README.md#selection_on
  d3.select(window)
    .on(`resize.${svg.attr('id')}`, resize)
}

export default {
  name: 'HorizontalBarChart',

  props: {
    chartId: {
      type: String
    },
    chartData: {
      type: Array,
    },
    barColor: {
      type: String,
      default: '#2760FF'
    },
  },

  watch: {
    chartData: {
      handler: function(data) {
        if (data) {
          this.$nextTick(() => this.createChart(data))
        }
      },
      immediate: true
    }
  },

  beforeDestroy() {
    const svg = d3.select(`#${this.chartId}`)
    if (svg) {
      svg.remove()
      d3.select(window)
        .on(`resize.${this.chartId}`, null)
    }
  },

  methods: {
    /**
     * Creates horizontal bar chart
     * @param {Array} data
     */
    createChart: function(data) {
      // select svg element
      const svg = d3.select(`#${this.chartId}`)
      const elem = svg.node()
      const dimensions = elem.getBoundingClientRect()
      if (!svg || !dimensions.right) {
        return
      }

      // set-up chart margins
      const margin = {top: 8, right: 8, bottom: 45, left: 90}
      const realWidth = dimensions.width
      const realHeight = dimensions.height
      const width = realWidth - margin.left - margin.right
      const height = realHeight - margin.top - margin.bottom

      // max label character length
      const maxLabelLength = 11

      // create element for tooltip
      const tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'horizontal-bar-chart-tooltip')

      // create chart axis
      const x = d3.scaleLinear().range([0, width])
      const y = d3.scaleBand().range([0, height])

      const g = svg
        .call(responsify)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

      x.domain([0, d3.max(data, d => d.value)])
      y.domain(data.map(d => d.key)).padding(0.3)

      g.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(5))

      g.append('g')
        .attr('class', 'y axis')
        .call(
          d3.axisLeft(y).tickFormat(x => {
            const str = x.toString()
            return str.length > maxLabelLength ? `${str.substr(0, maxLabelLength)}...` : x
          })
        );

      g.select('.y.axis')
        .selectAll('.tick')
        .on('mousemove', function(d) {
          if (d.length <= maxLabelLength) {
            return
          }
          tooltip
            .style('left', `${d3.event.pageX + 8}px`)
            .style('top', `${d3.event.pageY + 20}px`)
            .style('display', 'block')
            .html(d)
        })
        .on('mouseout', function() {
          tooltip
            .style('display', 'none')
        })


      // create bars and attach mouse-events to render the tooltip
      g.selectAll('.bar')
          .data(data)
        .enter().append('rect')
          .attr('class', 'bar')
          .attr('fill', this.barColor)
          .attr('x', 0)
          .attr('height', y.bandwidth())
          .attr('y', d => y(d.key))
          .attr('width', d => x(d.value))
          .on('mouseover', function() {
            d3.select(this)
            	.attr('fill-opacity', 0.75);
          })
          .on('mousemove', function(d) {
              tooltip
                .style('left', `${d3.event.pageX + 8}px`)
                .style('top', `${d3.event.pageY + 20}px`)
                .style('display', 'block')
                .html(d.value)
          })
          .on('mouseout', function() {
            d3.select(this)
              .attr('fill-opacity', 1)
            tooltip
              .style('display', 'none')
          })
    },
  },
}
</script>

<style lang="scss">
  @import '../../../assets/_variables.scss';

  .horizontal-bar-chart {
    width: 100%;
    height: 100%;

    .axis path, .axis line {
      fill: none;
      stroke: $gray_2;
      stroke-width: 1px;
      shape-rendering: crispEdges;
    }
    text {
      fill: #9B9B9B;
      font-family: $system-font;
      font-size: 12px;
    }
    .y text {
      fill: #4a4a4a;
    }
  }

  .horizontal-bar-chart-tooltip {
    background: #fff;
    border: 1px solid $gray_2;
    border-radius: 3px;
    box-shadow: 0 2px 10px 0 rgba(0,0,0,0.15);
    display: none;
    padding: 4px 8px;
    position: absolute;
    z-index: 99;
  }
</style>