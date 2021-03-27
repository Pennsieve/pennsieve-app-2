<template>
  <div class="storage-metrics">
    <h2>Dataset Size Over Time</h2>
    <div
      v-loading="isLoading"
      class="storage-metrics-loading-wrap"
      element-loading-background="#FAFAFA"
    >
      <div v-show="hasMetrics && isLoading === false">
        <h3>{{ currentStorage }} Storage Used</h3>
        <div ref="chart" />
      </div>

      <sidebar-empty-state v-if="!hasMetrics && isLoading === false">
        <img
          src="/static/images/illustrations/illo-empty-data.svg"
          width="255"
          height="113"
          alt="Image representing what the line chart would look like"
        >
        <h3>No Data to Display</h3>
        <p>
          <router-link :to="{name: 'dataset-files'}">
            Upload Files
          </router-link> or <router-link :to="{ name: 'models' }">
            Add concepts
          </router-link> to make the most of your dataset.
        </p>
      </sidebar-empty-state>
    </div>
  </div>
</template>

<script>
  import Moment from 'moment'
  import { extendMoment } from 'moment-range'
  const moment = extendMoment(Moment)

  import { bb } from 'billboard.js'
  import { compose, head, last, keys, values, propOr, prepend, objOf, pathOr, toPairs, nth, fromPairs } from 'ramda'

  import SidebarEmptyState from '../../../shared/SidebarEmptyState/SidebarEmptyState.vue'
  import StorageMetrics from '../../../../mixins/bf-storage-metrics'
  import Request from '../../../../mixins/request'
  import { mapGetters } from 'vuex'

  export default {
    name: 'DatasetStorageMetrics',

    components: {
      SidebarEmptyState
    },

    mixins: [
      Request,
      StorageMetrics
    ],

    data: function() {
      return {
        storage: {},
        chart: {},
        currentYear: 0
      }
    },

    computed: {
      ...mapGetters([
        'userToken',
        'config',
        'dataset'
      ]),

      /**
       * Compute if the dataset has enough metrics to show
       * @returns {Boolean}
       */
      hasMetrics: function() {
        const storage = propOr(0, 'storage', this.dataset)
        return storage > 0
      },

      /**
       * Compute storage used from last item in record
       * @returns {Array}
       */
      currentStorage: function() {
        const current = propOr(0, 'storage', this.dataset)
        return this.formatMetric(current)
      },

      /**
       * Fix dates from API (temporary until API response is fixed)
       * @returns {Object}
       */
      storageFixedDate: function() {
        const dates = toPairs(this.storage).map(date => {
          return [date[0] = moment(head(date)).format('YYYY-MM-DD'), last(date)]
        })

        return fromPairs(dates)
      },

      /**
       * Compute a range of four months ago to present month
       * @returns {Array}
       */
      monthsRange: function() {
        const range = moment.rangeFromInterval('month', 4, moment().subtract(4, 'months').format('YYYY-MM'))
        const months = Array.from(range.by('month'))
        return months.map(m => m.format('YYYY-MM-DD'))
      },

      /**
       * Compute chart data including gaps
       * @returns {Object}
       */
      chartData: function() {
        let lastStorage = 0
        const _this = this

        const newMonths = this.monthsRange.map(m => {
          let storage = _this.storageFixedDate[m]

          if (!storage) {
            storage = lastStorage
          } else {
            lastStorage = storage
          }
          return [
            m,
            storage
          ]
        })

        return fromPairs(newMonths)
      },

      /**
       * Compute an object out of the months to show lines on chart
       * Needs to be exact value so chart doesn't render lines between values
       * @returns {Object}
       */
      chartLineData: function() {
        return this.monthsRange.map(objOf('value'))
      },

      /**
       * Get metrics URL
       * @returns {String}
       */
      getMetricsUrl: function() {
        const datasetId = pathOr('', ['content', 'id'], this.dataset)
        if (this.config.apiUrl && this.userToken && datasetId) {

          const params = {
            api_key: this.userToken,
            end: moment().subtract(1, 'month').format(),
            start: moment().subtract(4, 'month').format(),
            period: 'MONTH',
            datasetId
          }
          const queryString = keys(params).map(key => key + '=' + params[key]).join('&');

          return `${this.config.apiUrl}/ledger/history?${queryString}`
        }
      }
    },

    watch: {
      getMetricsUrl: function() {
        this.fetchStorageMetrics()
      },

      chartData: function() {
        this.createChart()
      }
    },

    mounted: function() {
      this.fetchStorageMetrics()
    },

    beforeDestroy: function() {
      this.isLoading = true
      this.storage = {}

      // Destroy chart if it exists
      if (this.chart !== {} && typeof this.chart.destroy === 'function') {
        this.chart.destroy()
      }
    },

    methods: {
      /**
       * Get last value of an object
       */
      getLastValue: compose(
        last,
        values
      ),

      /**
       * Fetch storage metrics from the server
       */
      fetchStorageMetrics: function() {
        if (this.getMetricsUrl) {
          this.sendXhr(this.getMetricsUrl)
          .then(response => {
            const storage = propOr({}, 'days', response)

            // Use storage from dataset in state to display current storage
            const curMonthKey = moment().format('YYYY-MM')
            const curMonthStorage = propOr(0, 'storage', this.dataset)
            let curMonth = {}
            curMonth[curMonthKey] = curMonthStorage

            this.storage = Object.assign({}, storage, curMonth)
          })
          .catch(this.handleXhrError.bind(this))
        }
      },

      /**
       * Create the chart after data has loaded
       */
      createChart: function() {
        const months = keys(this.chartData)
        const storage = values(this.chartData)

        const vm = this

        this.chart = bb.generate({
          size: {
            height: 149
          },
          bindto: this.$refs.chart,
          data: {
            x: 'x',
            columns: [
              prepend('x', months),
              prepend('Storage', storage)
            ],
            color: function() {
              return '#2760FF'
            }
          },
          line: {
            classes: [
              'bf-line'
            ]
          },
          legend: {
            show: false
          },
          axis: {
            y: {
              show: false
            },
            x: {
              padding: {
                left: 1,
                right: 1000*60*60*12 // set right padding width as half of equivalent value of a day tick's width
              },
              tick: {
                outer: false,
                format: function(x) {
                  const today = new Date()
                  if (moment().isSame(x, 'Month')) {
                    return 'Today'
                  } else {
                    let dateFormat = `MMM`

                    // Add year if this is a new year that hasn't been displayed yet
                    const year = x.getYear()
                    if (year > vm.currentYear) {
                      vm.currentYear = year
                      dateFormat += ` 'YY`
                    }

                    return moment(x).format(dateFormat)
                  }
                },
                fit: true
              },
              type: 'timeseries'
            }
          },
          grid: {
            x: {
              show: false,
              lines: this.chartLineData
            },
            lines: {
              front: false
            }
          },
          point: {
            show: false
          },
          tooltip: {
            format: {
              title: () => {},
              value: (value, ratio, id, index) => {
                return this.formatMetric(value)
              }
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss">
  @import '../../../../assets/_variables.scss';
  @import '../../../../../node_modules/billboard.js/dist/billboard.min.css';
  @import '../../../../assets/_billboard.scss';

  .storage-metrics {
    padding: 24px;
    .storage-metrics-loading-wrap {
      min-height: 182px;
    }
    .bb text {
      fill: #9B9B9B;
      text-transform: uppercase;
    }
    .bb-axis-x .tick:first-of-type text {
      text-anchor: start !important;
    }
    .bb-axis-x .tick:last-of-type text {
      text-anchor: end !important;
      text-transform: none;
    }
    .el-loading-fade-enter-active {
      transition: none;
    }

    h2 {
      color: #C1C1C1;
    }
  }
</style>
