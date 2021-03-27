<template>
  <transition name="dialog-fade">
    <div
      class="bf-drop-info"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
      @dragover.prevent
      @drop="onDrop"
    >
      <div class="bf-drop-info-content">
        <img
          src="/static/images/illustrations/illo-drag-and-drop.svg"
          alt="Illustration of file system"
          height="225"
          width="339"
        >
        <h2>Drag and drop files here</h2>
        <p>We don’t recommend uploading more than 10GB through the web UI, due to browser limitations. If you’re uploading large amounts of data, please use the Blackfynn API.</p>
        <span class="circle one" />
        <span class="circle two" />
        <span class="circle three" />
      </div>
    </div>
  </transition>
</template>

<script>
  import EventBus from '../../../../utils/event-bus'

  export default {
    name: 'BfDropInfo',

    props: {
      showDropInfo: Boolean,
      file: {
        type: Object,
        default: function() {
          return {}
        }
      }
    },

    data: function() {
      return {
        dragCounter: 0
      }
    },

    methods: {
      /**
       * On drag enter, hide drop info
       * @param {Object} evt
       */
      onDragEnter: function(evt) {
        this.dragCounter += 1
        if (evt.dataTransfer.types && this.dragCounter === 1) {
          for (let i = 0; i < evt.dataTransfer.types.length; i++) {
            if (evt.dataTransfer.types[i] === 'Files') {
              evt.dataTransfer.dropEffect = 'copy'
              evt.preventDefault()
              this.$emit('update:showDropInfo', true)
            }
          }
        }
      },

      /**
       * On drag leave, hide drop info
       * @param {Object} evt
       */
      onDragLeave: function(evt) {
        evt.preventDefault()
        this.dragCounter -= 1

        if (this.dragCounter === 0) {
          this.$emit('update:showDropInfo', false)
        }
      },

      /**
       * On drop, send files to BfUpload
       * @param {Object} evt
       */
      onDrop: function(evt) {
        evt.preventDefault()

        // Close the dialog
        this.$emit('update:showDropInfo', false)

        // Set the upload destination
        this.$store.dispatch('updateUploadDestination', this.file)

        EventBus.$emit('add-to-upload-queue', {
          dataTransfer: evt.dataTransfer
        })
      },
    }
  }
</script>

<style scoped lang="scss">
  @import '../../../../assets/_variables.scss';

  .bf-drop-info {
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 3000;
    &:after {
      background: rgba(0,0,0,.5);
      content: '';
      height: 150vh;
      left: 0;
      position: fixed;
      top: 0;
      width: 150vw;
      z-index: 1;
    }
  }
  .bf-drop-info-content {
    background: $app-primary-color;
    border-radius: 5px;
    box-shadow: 0 2px 15px 0 rgba(0,0,0,0.25), 0 28px 41px 0 rgba(33,43,54,0.2);
    box-sizing: border-box;
    color: $white-matter;
    height: 440px;
    margin: 15vh auto 50px;
    overflow: hidden;
    padding: 16px;
    position: relative;
    text-align: center;
    width: 540px;
    z-index: 2;
  }
  img, h2, p {
    position: relative;
    z-index: 1;
  }
  img {
    margin-bottom: 16px;
  }
  h2 {
    color: #fff;
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px;
  }
  p {
    margin: 0 auto;
    max-width: 460px;
  }
  .circle {
    background: #376df7;
    border-radius: 50%;
    display: block;
    height: 193px;
    pointer-events: none;
    position: absolute;
    width: 193px;
    z-index: 0;
    &.one {
      left: -42px;
      top: -42px;
    }
    &.two {
      bottom: -107px;
      right: -83px;
    }
    &.three {
      bottom: 30px;
      height: 56px;
      left: 25px;
      width: 56px;
    }
  }
</style>
