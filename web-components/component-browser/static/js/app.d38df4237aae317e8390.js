webpackJsonp([1],{

/***/ "7zck":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ "HToE":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ "NHnr":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

// EXTERNAL MODULE: ./node_modules/vuetify/dist/vuetify.min.css
var vuetify_min = __webpack_require__("7zck");
var vuetify_min_default = /*#__PURE__*/__webpack_require__.n(vuetify_min);

// EXTERNAL MODULE: ./node_modules/vue/dist/vue.esm.js
var vue_esm = __webpack_require__("7+uW");

// EXTERNAL MODULE: ./node_modules/vuetify/dist/vuetify.js
var vuetify = __webpack_require__("3EgV");
var vuetify_default = /*#__PURE__*/__webpack_require__.n(vuetify);

// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./src/App.vue
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ var App = ({
  name: 'app'
});
// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-923d3392","hasScoped":false,"transformToRequire":{"video":"src","source":"src","img":"src","image":"xlink:href"},"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./src/App.vue
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"app"}},[_c('v-app',{attrs:{"light":""}},[_c('v-content',[_c('v-container',{attrs:{"fluid":""}},[_c('h1',{staticClass:"mt-4"},[_vm._v("Blackfynn Web Component Browser")]),_vm._v(" "),_c('router-view')],1)],1)],1)],1)}
var staticRenderFns = []
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ var selectortype_template_index_0_src_App = (esExports);
// CONCATENATED MODULE: ./src/App.vue
function injectStyle (ssrContext) {
  __webpack_require__("HToE")
}
var normalizeComponent = __webpack_require__("VU/8")
/* script */

/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  App,
  selectortype_template_index_0_src_App,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)

/* harmony default export */ var src_App = (Component.exports);

// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./src/components/WebComponent.vue
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ var WebComponent = ({
  props: {
    name: String,
    description: String,
    path: String,
    docs: Boolean
  },
  computed: {
    formattedUrl: function formattedUrl() {
      // FIXME: naive approach, should use regex pattern
      var pathSplit = this.path.split('/');
      var path = pathSplit.slice(0, pathSplit.length - 1).join('/');
      return 'http://localhost:3000/' + path;
    },
    icon: function icon() {
      if (this.docs) return 'check_circle';
      return 'report';
    },
    iconColor: function iconColor() {
      if (this.docs) return 'green';
      return 'red';
    },
    disabled: function disabled() {
      if (this.docs) return false;
      return true;
    }
  }
});
// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-06d9919a","hasScoped":true,"transformToRequire":{"video":"src","source":"src","img":"src","image":"xlink:href"},"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./src/components/WebComponent.vue
var WebComponent_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"bf-card"}},[_c('div',{attrs:{"id":"header-wrap"}},[_c('div',{staticClass:"bf-headline"},[_vm._v(_vm._s(_vm.name))]),_vm._v(" "),_c('v-icon',{attrs:{"id":"doc-status","color":_vm.iconColor}},[_vm._v(_vm._s(_vm.icon))])],1),_vm._v(" "),_c('v-layout',{attrs:{"row":""}},[_c('v-flex',{attrs:{"xs12":"","md3":""}},[_c('div',{attrs:{"id":"bf-card-body"}},[_c('a',{attrs:{"id":"component-link","href":_vm.formattedUrl}},[_c('button',{attrs:{"id":"view-button","disabled":_vm.disabled}},[_vm._v("View")])])])])],1)],1)}
var WebComponent_staticRenderFns = []
var WebComponent_esExports = { render: WebComponent_render, staticRenderFns: WebComponent_staticRenderFns }
/* harmony default export */ var components_WebComponent = (WebComponent_esExports);
// CONCATENATED MODULE: ./src/components/WebComponent.vue
function WebComponent_injectStyle (ssrContext) {
  __webpack_require__("lDDt")
}
var WebComponent_normalizeComponent = __webpack_require__("VU/8")
/* script */

/* template */

/* template functional */
var WebComponent___vue_template_functional__ = false
/* styles */
var WebComponent___vue_styles__ = WebComponent_injectStyle
/* scopeId */
var WebComponent___vue_scopeId__ = "data-v-06d9919a"
/* moduleIdentifier (server only) */
var WebComponent___vue_module_identifier__ = null
var WebComponent_Component = WebComponent_normalizeComponent(
  WebComponent,
  components_WebComponent,
  WebComponent___vue_template_functional__,
  WebComponent___vue_styles__,
  WebComponent___vue_scopeId__,
  WebComponent___vue_module_identifier__
)

/* harmony default export */ var src_components_WebComponent = (WebComponent_Component.exports);

// EXTERNAL MODULE: ./node_modules/vue-router/dist/vue-router.esm.js
var vue_router_esm = __webpack_require__("/ocq");

// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./src/components/WebComponentList.vue
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ var WebComponentList = ({
  created: function created() {
    var _this = this;

    fetch('./static/component_index.json').then(function (response) {
      if (response.ok) {
        return response.json();
      }

      throw new Error(response);
    }).then(function (json) {
      _this.elements = json.components;
      _this.searchResults = json.components;
      _this.isLoading = false;
    }).catch(function (err) {
      console.error(err);
      _this.isLoading = false;
    });
  },
  data: function data() {
    return {
      searchText: "",
      searchResults: [],
      isLoading: true,
      elements: [{
        name: "blackfynn-analytics",
        path: "src/components/blackfynn/analytics/analytics.html"
      }, {
        name: "blackfynn-data-simple-input",
        path: "src/components/blackfynn/data/simple-input.html"
      }, {
        name: 'bf-search-input',
        path: 'src/components/blackfynn/data/bf-search-input/bf-search-input.html'
      }, {
        name: "blackfynn-upload-file",
        path: "src/components/blackfynn/upload/file.html"
      }]
    };
  },

  watch: {
    searchText: function searchText(value) {
      this.filterElements(value);
    }
  },
  methods: {
    filterElements: function filterElements(searchText) {
      var filtered = this.elements.filter(function (element) {
        return element.name.includes(searchText);
      });
      this.searchResults = filtered;
    }
  },
  computed: {
    totalComponents: function totalComponents() {
      return this.elements.length;
    },
    coverage: function coverage() {
      var elements = this.elements;
      var haveDocs = 0;

      for (var x = 0; x < elements.length; x++) {
        if (elements[x].docs) haveDocs += 1;
      }
      var pct = Math.floor(haveDocs / elements.length * 100);
      return haveDocs + " / " + elements.length + " (" + pct + "%)";
    }
  }
});
// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-16e269de","hasScoped":true,"transformToRequire":{"video":"src","source":"src","img":"src","image":"xlink:href"},"buble":{"transforms":{}}}!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./src/components/WebComponentList.vue
var WebComponentList_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-container',{attrs:{"grid-list-md":"","fluid":""}},[_c('v-layout',{staticClass:"mb-4",attrs:{"row":"","justify-center":""}},[_c('v-flex',{attrs:{"xs4":""}},[_c('v-text-field',{staticClass:"input-group--focused",attrs:{"name":"search","placeholder":"Search for components by name","autofocus":"","single-line":""},model:{value:(_vm.searchText),callback:function ($$v) {_vm.searchText=$$v},expression:"searchText"}})],1)],1),_vm._v(" "),(_vm.isLoading)?_c('v-layout',[_c('v-flex',{attrs:{"xs12":""}},[_c('v-progress-circular',{attrs:{"indeterminate":"","size":50,"color":"primary"}})],1)],1):_vm._e(),_vm._v(" "),(!_vm.isLoading)?_c('v-layout',{staticClass:"mb-4",attrs:{"row":"","wrap":""}},[_c('v-flex',{attrs:{"xs12":"","md3":""}},[_c('h2',{staticClass:"text-xs-left"},[_vm._v("Number of Components: "+_vm._s(_vm.totalComponents)+" ")])]),_vm._v(" "),_c('v-flex',{attrs:{"xs12":"","md3":""}},[_c('h2',{staticClass:"text-xs-left"},[_vm._v("Component Pages: "+_vm._s(_vm.coverage)+" ")])])],1):_vm._e(),_vm._v(" "),(!_vm.isLoading)?_c('v-layout',{attrs:{"row":"","wrap":""}},_vm._l((_vm.searchResults),function(item,index){return _c('v-flex',{key:item.name,staticClass:"mb-4",attrs:{"xs12":"","md3":""}},[_c('web-component',_vm._b({attrs:{"index":index}},'web-component',item,false))],1)})):_vm._e()],1)}
var WebComponentList_staticRenderFns = []
var WebComponentList_esExports = { render: WebComponentList_render, staticRenderFns: WebComponentList_staticRenderFns }
/* harmony default export */ var components_WebComponentList = (WebComponentList_esExports);
// CONCATENATED MODULE: ./src/components/WebComponentList.vue
function WebComponentList_injectStyle (ssrContext) {
  __webpack_require__("mJ60")
}
var WebComponentList_normalizeComponent = __webpack_require__("VU/8")
/* script */

/* template */

/* template functional */
var WebComponentList___vue_template_functional__ = false
/* styles */
var WebComponentList___vue_styles__ = WebComponentList_injectStyle
/* scopeId */
var WebComponentList___vue_scopeId__ = "data-v-16e269de"
/* moduleIdentifier (server only) */
var WebComponentList___vue_module_identifier__ = null
var WebComponentList_Component = WebComponentList_normalizeComponent(
  WebComponentList,
  components_WebComponentList,
  WebComponentList___vue_template_functional__,
  WebComponentList___vue_styles__,
  WebComponentList___vue_scopeId__,
  WebComponentList___vue_module_identifier__
)

/* harmony default export */ var src_components_WebComponentList = (WebComponentList_Component.exports);

// CONCATENATED MODULE: ./src/router/index.js




vue_esm["a" /* default */].use(vue_router_esm["a" /* default */]);

/* harmony default export */ var router = (new vue_router_esm["a" /* default */]({
  routes: [{
    path: '/',
    name: 'Home',
    component: src_components_WebComponentList
  }]
}));
// CONCATENATED MODULE: ./src/main.js
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.








vue_esm["a" /* default */].config.productionTip = false;

vue_esm["a" /* default */].component('web-component', src_components_WebComponent);

vue_esm["a" /* default */].use(vuetify_default.a, {
  theme: {
    primary: '#2760FF',
    secondary: '#b0bec5',
    accent: '#8c9eff',
    error: '#b71c1c'
  }
});

/* eslint-disable no-new */
new vue_esm["a" /* default */]({
  el: '#app',
  router: router,
  template: '<App/>',
  components: { App: src_App }
});

/***/ }),

/***/ "lDDt":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ "mJ60":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })

},["NHnr"]);
//# sourceMappingURL=app.d38df4237aae317e8390.js.map