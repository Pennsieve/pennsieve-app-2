
<template>
  <div class="pdf-viewer">
    <PDFWindow
      :url="getFileUrl"
      :pkg="pkg"
      @document-errored="onDocumentErrored"
    />
  </div>
</template>

<script>
import PDFWindow from '../../viewers/PDFViewer/PDFWindow.vue'
import StaticViewer from '../../../mixins/static-viewer'


export default {
  name: 'PDFViewer',

  components: {
    PDFWindow,
  },

  mixins: [
    StaticViewer
  ],

  data() {
    return {
      documentError: undefined,
      enableUploader: true
    }
  },

  methods: {
    /**
     * Updates current PDF url
     * @param {string} url
     */
    urlUpdated(url) {
      this.documentError = undefined
      this.url = url
    },
    /**
     * Logs error if something goes wrong with PDF document
     */
    onDocumentErrored(e) {
      this.documentError = e.text
    },
  },

}
</script>

<style scoped lang="scss">
  .pdf-viewer {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif !important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #62637a;
    height: 100%;
    margin: 0;
    overflow: hidden;
    padding: 0;
    background-color: #606f7b;
  }
  label.form {
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif !important;
    font-weight: bold;
    margin-bottom: 2em;
    display: block;
  }
  input {
    padding: 0.45em;
    font-size: 1em;
  }
  .error {
    border: 1px solid red;
    background: pink;
    color: red;
    padding: 0.5em 3em;
    display: inline;
  }

  a.icon {
    cursor: pointer;
    display: block;
    border: 1px #333 solid;
    background: white;
    color: #333;
    font-weight: bold;
    padding: 0.25em;
    width: 1em;
    height: 1em;
    font-size: 1.5em;
  }
  .box-shadow {
    box-shadow: 0 15px 30px 0 rgba(0, 0, 0, 0.11), 0 5px 15px 0 rgba(0, 0, 0, 0.08);
  }
  .overflow-hidden {
    overflow: hidden;
  }

  @media print {
    body {
      background-color: transparent;
    }
    #app {
      margin: 0;
      padding: 0;
    }
  }
</style>

