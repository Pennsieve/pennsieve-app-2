<template>
  <router-view
    name="stage"
    :datasets="datasets"
    :dataset="dataset"
    list-type="dataset"
  />
</template>

<script>
  import {mapActions, mapGetters, mapState} from 'vuex'
  import {compose, defaultTo, find, path, pathEq, pathOr, propEq, propOr} from 'ramda'

  import Request from '../../mixins/request'
  import Sorter from '../../mixins/sorter'
  import EventBus from '../../utils/event-bus'
  import GetDatasetDoi from '@/mixins/get-dataset-doi'

  export default {
    name: 'BfDatasets',

    mixins: [
      GetDatasetDoi,
      Request,
      Sorter
    ],

    data: function() {
      return {
        isLoading: false
      }
    },

    computed: {
      ...mapState([
        'datasets',
        'userToken',
        'concepts',
        'scientificUnits',
        'config',
        'dataset',
        'isDatasetOwner',
        'activeOrganization',
        'datasetRole',
        'activeOrgSynced'
      ]),

      ...mapGetters([
        'getActiveOrganization',
        'hasFeature',
        'getPermission',
        'isOrgSynced'
      ]),

       /**
       * Get units URL
       * @returns {String}
       */
      scientificUnitsUrl: function() {
        const datasetId = pathOr('', ['content', 'id'], this.dataset)
        return this.userToken && datasetId ? `${this.config.apiUrl}/models/datasets/${datasetId}/properties/units?api_key=${this.userToken}` : ''
      },

      /**
       * Compute URL to get a dataset
       * @returns {String}
       */
      getDatasetUrl: function() {
        const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
        return this.config.apiUrl && this.userToken && datasetId && this.isOrgSynced
          ? `${this.config.apiUrl}/datasets/${datasetId}?api_key=${this.userToken}&includePublishedDataset=true&includeCollaboratorCounts=true`
          : ''
      },

       /**
       * Returns the active organization id
       * @returns {String}
       */
      activeOrgId: function() {
        return path(['organization', 'intId'], this.activeOrganization)
      },
      /**
       * Compute active record url to retrieve submission asset
       * @returns {String}
       */
      getModelTemplatesUrl: function() {
        if (!this.activeOrgId || !this.userToken) {
          return
        }
        return `${this.config.apiUrl}/model-schema/organizations/${this.activeOrgId}/templates`
      },
    },

    watch: {



      /**
       * Watch to compute dataset
       */
      getDatasetUrl: {
        handler: function(val) {
          if (val) {
            this.getDataset()
          }
        },
        immediate: true
      }
    },

    mounted() {
      EventBus.$on('get-dataset-contributors', this.getDatasetContributors.bind(this))
    },

    beforeDestroy() {
      EventBus.$off('get-dataset-contributors', this.getDatasetContributors.bind(this))
    },

    methods: {
      ...mapActions([
        'updateConcepts',
        'updateIsLoadingConcepts',
        'updateFilesProxyId',
        'updateSites',
        'setDataset',
        'setDatasetEtag',
        'setRelationshipTypes',
        'updateIsLoadingRelationshipTypes',
        'updateModelTemplates',
        'setDatasetRole',
        'setDatasetBanner',
        'setIsLoadingDatasetBanner',
        'setDatasetDescription',
        'setDatasetDescriptionEtag',
        'setIsLoadingDatasetDoi',
        'setIsLoadingDatasetIgnoreFiles',
        'setDatasetDoi',
        'setDatasetIgnoreFiles',
        'setIsLoadingDatasetDescription',
        'setIsLoadingDatasetContributors',
        'setDatasetContributors',
        'updateScientificUnits',
        'setChangelogText'
      ]),


       /**
      * Retrieves list of scientific units
    */
    getScientificUnits: function() {
      this.sendXhr(this.scientificUnitsUrl).then(resp => {
        this.updateScientificUnits([
          ...resp,
          {
            dimension: 'Other',
            units: [{
              name: 'Other',
              displayName: 'Other',
              description: 'Other'
            }]
          }
        ])
      })
      .catch(this.handleXhrError.bind(this))
    },

      /**
       * Get the current dataset
       */
      getDataset: function() {
        const datasetId = pathOr('', ['params', 'datasetId'], this.$route)

        // Reset state of dataset
        this.setRelationshipTypes([])
        this.updateConcepts([])
        this.updateFilesProxyId(null)
        this.setDatasetDescription('')
        this.setDatasetBanner('')

        fetch(this.getDatasetUrl)
          .then(response => {
            if (response.ok) {
              response.json()
                .then(dataset => {
                  this.setDatasetEtag(response.headers.get('etag'));
                  this.setDataset(dataset)
                  this.getScientificUnits()
                })
                .then(() => {
                  return this.getUserRole()
                })
                .then(() => {
                  if (this.getPermission('manager')) {
                    this.getDatasetIgnoreFiles(datasetId)
                  }
                })
                .then(() => {
                  this.getConcepts()
                  EventBus.$emit('get-file-proxy-id')
                })
            } else {
              throw response
            }
          })
          .catch(() => {
            this.onGetDatasetError()
          })
        this.getDatasetBanner(datasetId)
        this.getDatasetDescription(datasetId)
        this.getDatasetDoi(datasetId)
        this.getDatasetContributors(datasetId)
        this.getDatasetChangelog(datasetId)
      },

      /**
       * Handle dataset that doesn't exist
       */
      onGetDatasetError: function() {
        // Check if the dataset exists, and redirect if not
        if (this.$route.name !== 'datasets-list') {

          let routeName = 'datasets-list'

          return this.$router.replace({
            name: routeName
          })
        }
      },

      /**
       * Get the dataset's description
       * @param {String} datasetId
       */
      getDatasetDescription: function(datasetId) {
        this.setIsLoadingDatasetDescription(true)
        const url = `${this.config.apiUrl}/datasets/${datasetId}/readme?api_key=${this.userToken}`
        fetch(url)
          .then(response => {
            if (response.ok) {
              response.json().then(data => {
                const readme = propOr('', 'readme', data)
                this.setDatasetDescriptionEtag(response.headers.get('etag'))
                this.setDatasetDescription(readme)
              })
            } else {
              throw response
            }
          })
          .catch(this.handleXhrError.bind(this))
          .finally(() => {
            this.setIsLoadingDatasetDescription(false)
          })
      },

      getDatasetChangelog: function(datasetId) {
        //this.setIsLoadingDatasetDescription(true)
        const url = `${this.config.apiUrl}/datasets/${datasetId}/changelog?api_key=${this.userToken}`
        fetch(url)
          .then(response => {
            if (response.ok) {
              response.json().then(data => {
                const changelog = propOr('', 'changelog', data)
                //this.setDatasetDescriptionEtag(response.headers.get('etag'))
                this.setChangelogText(changelog)
              })
            } else {
              throw response
            }
          })
          .catch(this.handleXhrError.bind(this))
          .finally(() => {
            //this.setIsLoadingDatasetDescription(false)
          })
      },

      /**
       * Get banner image for dataset
       * @param {String} datasetId
       */
      getDatasetBanner: function(datasetId) {
        this.setIsLoadingDatasetBanner(true)
        const url = `${this.config.apiUrl}/datasets/${datasetId}/banner?api_key=${this.userToken}`
        this.sendXhr(url)
        .then(response => {
          const banner = propOr('', 'banner', response)
          this.setDatasetBanner(banner).then(() => {
            this.setIsLoadingDatasetBanner(false)
          })
        })
        .catch(this.handleXhrError.bind(this))
      },

      /**
       * Get the dataset's contributors
       * @param {String} datasetId
       */
      getDatasetContributors: function(datasetId) {
        this.setIsLoadingDatasetContributors(true)
        const url = `${this.config.apiUrl}/datasets/${datasetId}/contributors?api_key=${this.userToken}`
        this.sendXhr(url)
        .then(response => {
          this.setDatasetContributors(response)
        })
        .catch(this.handleXhrError.bind(this))
        .finally(() => {
          this.setIsLoadingDatasetContributors(false)
        })
      },

      /**
       * Get the dataset's list of ignore files
       * @param {String} datasetId
       */
      getDatasetIgnoreFiles: function(datasetId) {
        this.setIsLoadingDatasetIgnoreFiles(true)
        const url = `${this.config.apiUrl}/datasets/${datasetId}/ignore-files?api_key=${this.userToken}`
        this.sendXhr(url)
        .then(resp => {
          const ignoreFiles = (resp.ignoreFiles || []).map(file => ({fileName: file.fileName}))
          this.setDatasetIgnoreFiles(ignoreFiles)
        })
        .catch(this.handleXhrError.bind(this))
        .finally(() => {
          this.setIsLoadingDatasetIgnoreFiles(false)
        })
      },

      /**
       * Gets sites for dataset
       */
      getSites: function() {
        const defaultPromise = Promise.resolve([])
        const datasetId = pathOr(0, ['content', 'id'], this.dataset)
        if (datasetId === 0) {
          return this.updateSites([])
        }

        this.updateIsLoadingConcepts(true)

        const url = `${this.config.conceptsUrl}/datasets/${datasetId}/concepts/site/instances`
        return this.sendXhr(url, {
          header: {
            'Authorization': `bearer ${this.userToken}`
          }
        })
        .then(response => {
          this.updateSites(response)
        })
        .catch(_ => this.updateSites([]))
      },

      /**
       * Get user's role
       * @returns {Promise}
       */
      getUserRole: async function() {
        const datasetId = pathOr(0, ['content', 'id'], this.dataset)
        const url = `${this.config.apiUrl}/datasets/${datasetId}/role?api_key=${this.userToken}`
        try {
          const role = await this.sendXhr(url)
          return this.setDatasetRole(role)
        } catch (error) {
          this.updateSites([])
        }
      },

      /**
       * Gets concepts for dataset
       */
      getConcepts: function() {
        const defaultPromise = Promise.resolve([])
        const datasetId = pathOr(0, ['content', 'id'], this.dataset)
        if (datasetId === 0) {
          return this.updateConcepts([])
        }

        this.updateIsLoadingConcepts(true)
        this.updateIsLoadingRelationshipTypes(true)

        const url = `${this.config.conceptsUrl}/datasets/${datasetId}/concepts`
        return fetch(url, {
          headers: {
            'Authorization': `bearer ${this.userToken}`,
            'Content-type': 'application/json'
          }
        })
          .then(response => {
            return response.json()
          })
          .then(response => {
            const sortedModels = this.returnSort('displayName', response, 'asc')
            this.updateConcepts(sortedModels)
              .then(() => {
                this.updateIsLoadingConcepts(false)
                this.getRelationshipTypes()
                this.getModelTemplates()
              })
          })
          .catch(_ => this.updateConcepts([]))
      },
      /**
       * Determines if template is already in use
       * @param {String} templateName
       * @returns {Boolean}
       */
      templateInUse: function(templateName) {
        const templateExists = find(propEq('name', templateName), this.concepts)
        return Boolean(templateExists)
      },
      /**
       * Get model templates
       */
      getModelTemplates: function(){
        // if (!this.getModelTemplatesUrl) {
        //   return
        // }
        // this.sendXhr(this.getModelTemplatesUrl, {
        //   header: {
        //     'Authorization': `bearer ${this.userToken}`
        //   },
        // })
        //   .then(resp => {
        //     const updatedTemplates = resp.map(template => {
        //       template.isDisabled = this.templateInUse(template.name)
        //       return template
        //     })
        //     this.updateModelTemplates(updatedTemplates)
        //   })
        //   .catch(this.handleXhrError.bind(this))
      },

      /**
       * Get relationship types for dataset
       */
      getRelationshipTypes: function() {
        const datasetId = pathOr(0, ['content', 'id'], this.dataset)
        if (datasetId === 0) {
          return this.setRelationshipTypes([])
        }
        const url = `${this.config.conceptsUrl}/datasets/${datasetId}/relationships`
        return this.sendXhr(url, {
          header: {
            'Authorization': `bearer ${this.userToken}`
          }
        })
          .then(response => {
            this.setRelationshipTypes(response).then(this.updateIsLoadingRelationshipTypes(false))
          })
          .catch(_ => this.setRelationshipTypes([]))
      },

      findDataset: (id, list) => compose(
        defaultTo({}),
        find(pathEq(['content', 'id'], id)),
        defaultTo([])
      )(list)
    }
  }
</script>
