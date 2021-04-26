import { debounce } from 'throttle-debounce';
import { PublicationStatus, PublicationTabs, PublicationTabStatuses } from '@/utils/constants.js'

/**
 * Explore Components
 */
const App = () => import('../components/app/App.vue')
const NotFound = () => import('./not-found/NotFound.vue')
const BfNavigation = () => import('../components/bf-navigation/BfNavigation.vue')
const BfNavigationSecondary = () => import('../components/bf-navigation/BfNavigationSecondary.vue')
const Login = () => import('./login/Login.vue')
const Viewer = () => import('../components/viewer/BfViewer/BfViewer.vue')
const ResetPassword = () => import('./ResetPassword/ResetPassword.vue')
const DocsLogin = () => import('./DocsLogin/DocsLogin.vue')
const CreateOrg = () => import('./CreateOrg/CreateOrg.vue')

/**
 * User Onboarding Components
 */
const Welcome = () => import('./welcome/Welcome.vue')
const TermsOfService = () => import('./TermsOfService/TermsOfService.vue')
const SetupProfile = () => import('../components/SetupProfile/SetupProfile.vue')
const InvitePeople = () => import('../components/onboarding/InvitePeople/InvitePeople.vue')

/**
 * People Components
 */
const People = () => import('./people/People.vue')
const PeopleList = () => import('../components/people/list/PeopleList.vue')

/**
 * Publishing Components
 */
const Publishing = () => import('@/routes/Publishing/PublishingView.vue')
const PublishingDatasetsList = () => import ('@/components/Publishing/PublishingDatasetsList/PublishingDatasetsList.vue')


/**
 * Teams Components
 */
const Teams = () => import('./teams/Teams.vue')
const TeamsList = () => import('../components/teams/list/TeamsList.vue')
const TeamMembers = () => import('./team-members/TeamMembers.vue')
const TeamMembersList = () => import('../components/teams/members/TeamMembersList.vue')

/**
 * Settings Components
 */
const Settings = () => import('./settings/Settings.vue')
const OrgSettings = () => import('../components/settings/OrgSettings.vue')
const MySettings = () => import('./my-settings/MySettings.vue')
const MySettingsContainer = () => import('../components/my-settings/MySettingsContainer.vue')

/**
 * Dataset Components
 */
const Datasets = () => import('./datasets/Datasets.vue')

const BfDatasetList = () => import('../components/datasets/dataset-list/BfDatasetList.vue')
const BfDatasetFiles = () => import('../components/datasets/files/BfDatasetFiles.vue')
const BfDatasetCollaborators = () => import('../components/datasets/collaborators/BfDatasetCollaborators.vue')
const DatasetPermissions = () => import('../components/datasets/DatasetPermissions/DatasetPermissions.vue')
const DatasetActivity = () => import('../components/datasets/DatasetActivity/DatasetActivity.vue')
const EmbargoedPermissions = () => import('../components/datasets/DatasetPermissions/EmbargoedPermissions/EmbargoedPermissions.vue')
const BfDatasetSettings = () => import('../components/datasets/settings/BfDatasetSettings.vue')
const BfPublishingSettings = () => import('../components/datasets/settings/BfPublishingSettings.vue')
const DatasetOverview = () => import('../components/datasets/DatasetOverview/DatasetOverview.vue')

/**
 * Explore Components
 */
const ExploreRoute = () => import('./explore/Explore.vue')
const DatasetRecords = () => import('../components/datasets/records/DatasetRecords/DatasetRecords.vue')
const RecordsOverview = () => import('../components/datasets/records/RecordsOverview/RecordsOverview.vue')
const GraphBrowser = () => import('../components/datasets/records/GraphBrowser/GraphBrowser.vue')
const ModelRecords = () => import('../components/datasets/explore/search/ModelRecords')
const ConceptInstance = () => import('../components/datasets/explore/ConceptInstance/ConceptInstance.vue')
const GraphManagementRoute = () => import('./GraphManagement/GraphManagement.vue')
const GraphManagement = () => import('../components/datasets/management/GraphManagement/GraphManagement.vue')
const Models = () => import('../components/datasets/management/GraphManagement/Models.vue')
const RelationshipTypes = () => import('../components/datasets/management/GraphManagement/RelationshipTypes.vue')
const ConceptManagement = () => import('../components/datasets/management/ConceptManagement/ConceptManagement.vue')
const ModelTemplates = () => import('../components/datasets/management/ModelTemplates/ModelTemplates.vue')


/**
 * 404
 */
const Bf404 = () => import('../components/Bf-404/Bf-404.vue')

/**
 * ORCIDRedirect
 */

const ORCIDRedirect = () => import('../components/ORCID/ORCIDRedirect.vue')
const ORCID = () => import('../components/ORCID/ORCID.vue')

const routes = [

  /**
   * Datasets routes
   */
  {
    path: '/:orgId/datasets',
    components: {
      page: Datasets,
      navigation: BfNavigation
    },
    props: true,
    children: [
      {
        name: 'datasets-list',
        path: '',
        components: {
          stage: BfDatasetList
        },
        props: true
      }
    ]
  },
  {
    path: '/:orgId/datasets/:datasetId',
    components: {
      page: Datasets,
      navigation: BfNavigation,
      navigationSecondary: BfNavigationSecondary
    },
    children: [
      {
        path: 'records',
        components: {
          stage: ExploreRoute
        },
        props: true,
        children: [
          {
            path: '',
            name: 'records',
            props: {
              stage: true
            },
            components: {
              stage: DatasetRecords
            },
            redirect: {
              name: 'records-overview'
            },
            children: [
              {
                path: 'overview',
                name: 'records-overview',
                props: {
                  stage: true
                },
                components: {
                  stage: RecordsOverview
                }
              },
              {
                path: 'graph-browser',
                name: 'graph-browser',
                props: {
                  stage: true
                },
                components: {
                  stage: GraphBrowser
                }
              }
            ]
          },
          {
            path: ':conceptId',
            name: 'concept-search',
            props: true,
            components: {
              stage: ModelRecords
            },
            meta: {
              headerAux: true
            }
          },
          {
            path: ':conceptId/:instanceId',
            name: 'concept-instance',
            props: true,
            meta: {
              headerAux: true
            },
            components: {
              stage: ConceptInstance
            }
          }
        ]
      },
      {
        name: 'dataset-files',
        path: 'files',
        components: {
          stage: BfDatasetFiles
        },
        props: true,
        children: [
          {
            name: 'collection-files',
            path: ':fileId',
            props: true
          }
        ]
      },
      {
        path: 'files/:conceptId/:instanceId',
        name: 'file-record',
        props: true,
        components: {
          stage: ConceptInstance
        }
      },
      {
        path: 'graph-management',
        components: {
          stage: GraphManagementRoute
        },
        props: true,
        children: [
          {
            path: '',
            name: 'graph-management',
            props: true,
            components: {
              stage: GraphManagement
            },
            redirect: 'models',
            children: [
              {
                path: 'models',
                name: 'models',
                props: true,
                components: {
                  stage: Models
                }
              },
              {
                path: 'relationship-types',
                name: 'relationship-types',
                props: true,
                components: {
                  stage: RelationshipTypes
                }
              }
            ]
          },
          {
            path: 'model-templates',
            name: 'model-templates',
            props: true,
            components: {
              stage: ModelTemplates
            }
          },
          {
            path: ':conceptId',
            name: 'concept-management',
            props: true,
            components: {
              stage: ConceptManagement
            }
          },
        ]
      },
      {
        name: 'dataset-collaborators',
        path: 'collaborators',
        redirect: {
          name: 'dataset-permissions'
        }
      },
      {
        name: 'dataset-activity',
        path: 'activity',
        components: {
          stage: DatasetActivity
        },
        props: {
          stage: true
        }
      },
      {
        name: 'dataset-permissions',
        path: 'permissions',
        components: {
          stage: DatasetPermissions
        },
        props: {
          stage: true
        }
      },
      {
        name: 'embargoed-permissions',
        path: 'embargoed-permissions',
        components: {
          stage: EmbargoedPermissions
        },
        props: {
          stage: true
        }
      },
      {
        name: 'dataset-settings',
        path: 'settings',
        components: {
          stage: BfDatasetSettings
        },
        props: true
      },
      {
        name: 'publishing-settings',
        path: 'publishing-settings',
        components: {
          stage: BfPublishingSettings
        },
        props: true
      },
      {
        name: 'dataset-overview',
        path: 'overview',
        components: {
          stage: DatasetOverview
        },
        props: {
          stage: true
        }
      },
      {
        name: 'dataset',
        path: '',
        redirect: 'overview'
      },
      {
        name: 'explore',
        path: 'explore',
        redirect: 'records'
      }
    ]
  },

  /**
   * Other routes
   */
  {
    name: 'viewer',
    path: '/:orgId/datasets/:datasetId/viewer/:fileId',
    components: {
      page: Viewer
    },
    props: true
  },
  {
    name: 'create-org',
    path: '/:orgId/create-org',
    components: {
      page: CreateOrg,
      navigation: BfNavigation
    },
    props: true
  },
  {
    path: '/:orgId/people',
    components: {
      page: People,
      navigation: BfNavigation
    },
    children: [
      {
        name: 'people-list',
        path: '',
        components: {
          stage: PeopleList
        }
      },
    ],
    props: true
  },
  {
    path: '/:orgId/teams',
    components: {
      page: Teams,
      navigation: BfNavigation
    },
    children: [
      {
        name: 'teams-list',
        path: '',
        components: {
          stage: TeamsList
        }
      },
    ],
    props: true
  },
  {
    name: 'publishing',
    path: '/:orgId/publishing',
    redirect: {
      name: PublicationTabs.REVIEW
    },
    components: {
      page: Publishing,
      navigation: BfNavigation
    },
    children: [
      {
        name: PublicationTabs.REVIEW,
        path: PublicationTabs.REVIEW,
        components: {
          stage: PublishingDatasetsList
        },
        props: {
          stage: {
            publicationStatus: [PublicationStatus.REQUESTED, PublicationStatus.ACCEPTED, PublicationStatus.FAILED],
          }
        }
      },
      {
        name: PublicationTabs.PUBLISHED,
        path: PublicationTabs.PUBLISHED,
        components: {
          stage: PublishingDatasetsList
        },
        props: {
          stage: {
            publicationStatus: [PublicationStatus.COMPLETED],
          }
        }
      },
      {
        name: PublicationTabs.REJECTED,
        path: PublicationTabs.REJECTED,
        components: {
          stage: PublishingDatasetsList
        },
        props: {
          stage: {
            publicationStatus: [PublicationStatus.REJECTED],
          }
        }
      }
    ],
    props: true
  },
  {
    path: '/:orgId/teams/:id',
    components: {
      page: TeamMembers,
      navigation: BfNavigation
    },
    children: [
      {
        name: 'team-members-list',
        path: '',
        components: {
          stage: TeamMembersList
        }
      },
    ],
    props: true
  },
  {
    path: '/:orgId/settings',
    components: {
      page: Settings,
      navigation: BfNavigation
    },
    children: [
      {
        name: 'settings',
        path: '',
        components: {
          stage: OrgSettings
        }
      },
    ],
    props: true
  },
  {
    path: '/:orgId/profile',
    components: {
      page: MySettings,
      navigation: BfNavigation
    },
    children: [
      {
        name: 'my-settings-container',
        path: '',
        components: {
          stage: MySettingsContainer
        }
      },
    ],
    props: true
  },
  {
    name: 'invitation',
    path: '/invitation',
    components: {
      page: Welcome
    },
    children: [
      {
        name: 'setup-profile',
        path: 'accept/:username/:password',
        components: {
          stage: SetupProfile
        }
      }
    ]
  },
  {
    name: 'welcome',
    path: '/:orgId/welcome',
    components: {
      page: Welcome
    },
    children: [
      {
        name: 'setup-profile',
        path: 'setup-profile',
        components: {
          stage: SetupProfile
        }
      },
      {
        name: 'terms-of-service',
        path: 'terms-of-service',
        components: {
          stage: TermsOfService
        },
        props: true
      },
      {
        name: 'invite-people',
        path: 'invite-people',
        components: {
          stage: InvitePeople
        },
        props: true
      }
    ]
  },
  {
    name: 'password',
    path: '/password',
    components: {
      page: ResetPassword
    },
    props: {
      page: (route) => {
        return { resetToken: route.query.resetToken }
      }
    }
  },
  {
    name: 'welcome-to-pennsieve',
    path: '/welcome-to-pennsieve',
    components: {
      page: ResetPassword
    }
  },
  {
    path: '/orcid-redirect',
    components: {
      page: ORCID
    },
    children: [
      {
        name: 'orcid-redirect',
        path: '',
        components: {
          stage: ORCIDRedirect
        }
      },
    ],
  },
  {
    name: 'home',
    path: '/',
    components: {
      page: Login
    },
    props: true
  },
  {
    name: 'docs-login',
    path: '/docs-login',
    components: {
      page: DocsLogin
    }
  },
  /**
   * Redirects from old URLs
   */
  {
    path: '/:orgId/data-catalog',
    redirect: '/:orgId/datasets'
  },
  {
    path: '/:orgId/data-catalog/:id',
    redirect: '/:orgId/datasets/:id'
  },
  {
    path: '/:orgId/settings/members',
    redirect: '/:orgId/people'
  },
  {
    path: '/:orgId/settings/profile',
    redirect: '/:orgId/profile'
  },
  {
    path: '/:orgId/settings/api-keys',
    redirect: '/:orgId/profile'
  },
  {
    path: '/:orgId/settings/teams',
    redirect: '/:orgId/teams'
  },
  {
    path: '/:orgId/datasets/:datasetId/graph-management',
    redirect: '/:orgId/datasets/:datasetId/graph-management/models'
  },
  {
    path: '*',
    components: {
      page: NotFound,
      navigation: BfNavigation
    },
    children: [
      {
        name: 'page-not-found',
        path: '',
        components: {
          stage: Bf404
        }
      },
    ],
    props: true
  },

]

export default routes
