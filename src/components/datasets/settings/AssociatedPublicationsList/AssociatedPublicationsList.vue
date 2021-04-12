<template>
  <div
    class="associated-publications-list"
  >
    <div
      class="doi-wrap"
    >
      <div class="doi-wrap-item">
        <div class="doi-wrap-item__content">
          <div
            v-if="publication.notFound"
            class="not-found"
          >
            <p>{{ publication.doi }}</p>
          </div>
          <div
            v-else
            class="citation"
          >
            <span
              v-html="$sanitize(publication.citation, ['i', 'b'])"
            />
            <a
              :href="publication.doiUrl"
              target="blank"
            >
              {{ publication.doiUrl }}
            </a>
          </div>
        </div>
        <div class="doi-wrap-item-dropdown">
          <el-dropdown
            slot="info"
            trigger="click"
            placement="bottom-end"
            @command="onMenuSelect"
          >
            <button class="el-dropdown-link">
              <svg-icon
                name="icon-menu"
                height="20"
                width="20"
              />
            </button>
            <el-dropdown-menu
              slot="dropdown"
              class="bf-menu"
              :offset="9"
            >
              <el-dropdown-item
                :disabled="datasetLocked"
                command="remove-citation"
              >
                Delete
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { find, propOr, propEq } from 'ramda'
import { mapGetters } from 'vuex'
import { referenceTypeOptions } from '@/utils/constants'
  export default {
    name: 'AssociatedPublicationsList',

    props: {
      publication: {
        type: Object,
        default: () => {}
      },
      relationship: {
        type: String,
        default: ''
      }
    },

    computed: {
      ...mapGetters(['datasetLocked'])
    },

    methods: {
      /**
       * When the user selects an option from
       * the menu, emit an event
       */
      onMenuSelect: function(command) {
        this.$emit(command, this.publication)
      },

      /**
       * Emit event to add citation
       */
      tryAgain: function() {
        const relationship = find(propEq('label', this.relationship), referenceTypeOptions)
        const relationshipType = propOr('', 'value', relationship)
        this.$emit('add-reference', this.publication, this.relationship, relationshipType)
      }
    },
  }
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';
.associated-publications-list {
  .doi-wrap {
    margin-top: 16px;
    .citation {
      max-width: 650px;
    }

    .not-found {
      p {
        font-weight: 500;
      }
    }

    .doi-wrap-item {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      &__content {
        display: flex;
        flex-direction: row;
        &--error-message {
          color: $red_1;
          a {
            color: $red_1;
            text-decoration: underline;
          }
          .svg-icon {
            margin-top: 0;
            text-decoration: none;
          }
        }
        &--unavailable-doi {
          font-weight: 500;
          line-height: 16px;
          margin-bottom: 7px;
        }
      }

    }
  }
}
</style>