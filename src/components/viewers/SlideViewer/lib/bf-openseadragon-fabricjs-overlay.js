// Blackfynn OpenSeadragon Canvas OverLay plugin
// Based on: OpenSeadragon canvas Overlay plugin 0.0.1 based on svg overlay plugin

(function() {
  // ----------
  OpenSeadragon.Viewer.prototype.fabricjsOverlay = function() {
    if (this._fabricjsOverlayInfo) {
      return this._fabricjsOverlayInfo;
    }

    this._fabricjsOverlayInfo = new Overlay(this);
    return this._fabricjsOverlayInfo;
  };

  // ----------
  const Overlay = function(viewer) {
    let self = this;
    let circle = null;
    let isDown = false;
    let origX = 0;
    let origY = 0;

    this._viewer = viewer;

    this._containerWidth = 0;
    this._containerHeight = 0;

    this._canvasdiv = document.createElement("div");
    this._canvasdiv.style.position = "absolute";
    this._canvasdiv.style.left = 0;
    this._canvasdiv.style.top = 0;
    this._canvasdiv.style.width = "100%";
    this._canvasdiv.style.height = "100%";
    this._viewer.canvas.appendChild(this._canvasdiv);

    this._canvas = document.createElement("canvas");
    this._canvas.setAttribute("id", "osd-overlaycanvas");
    this._canvasdiv.appendChild(this._canvas);
    this.resize();

    this._fabricCanvas = new fabric.Canvas(this._canvas);

    // Create annotation class in fabric
    this.initCustomClasses();

    this._fabricCanvas.on("path:created", function(options) {});

    this._fabricCanvas.on("object:selected", function(options) {
      if (this.isPanning || this.isMeasuring) {
        return;
      }

      this.overlay.focusObject(options.target.annID);
    });

    // Send new object to polymer element
    this._fabricCanvas.on("object:modified", function(options) {
      if (this.isMeasuring) return;

      // Find image coordinates of annotation for un-rotated image and set _original coordinates.
      let curAnn = options.target;
      let angle = this.overlay._viewer.viewport.getRotation();
      let rads = -2 * Math.PI * angle / 360;
      let objectOrigin = new fabric.Point(curAnn.left, curAnn.top);
      let rotOrigin = new fabric.Point(0, 0);
      let new_loc = fabric.util.rotatePoint(objectOrigin, rotOrigin, rads);
      curAnn._originalLeft = new_loc.x;
      curAnn._originalTop = new_loc.y;

      let position = options.target.toObject();

      this.overlay.slideViewer.updateAnnotation(options.target.annID, position);
    });
    // Send new object to polymer element
    this._fabricCanvas.on("object:added", function(options) {
      if (this.isMeasuring || this.isCircleMode) return;

      this.overlay.addAnnotation(options);
    });

    this._fabricCanvas.overlay = this;

    // disable fabric selection because default click is tracked by OSD
    this._fabricCanvas.selection = false;

    // prevent OSD click elements on fabric objects
    this._fabricCanvas.on("mouse:down", function(options) {
      if (this.isPanning || this.isMeasuring) {
        return;
      }

      if (options.target) {
        options.e.preventDefault();
        options.e.stopPropagation();
      } else if (this.isDrawing) {
        options.e.preventDefault();
        options.e.stopPropagation();
        this.isDrawingMode = true;
      } else if (this.isCircleMode){
        this.isDown = true;
        const pointer = this.getPointer(options.e);
        origX = pointer.x;
        origY = pointer.y;
        this.circle = new fabric.BlackfynnCircleAnnotation({
          left: pointer.x,
          top: pointer.y,
          rotation: this.overlay._viewer.viewport.getRotation()
        });
        this.add(this.circle);
      }
    });

    this._fabricCanvas.on("mouse:move", function(options) {
      if (!this.isDown || !this.isCircleMode) return;
      const pointer = this.getPointer(options.e);
      this.circle.set({ radius: Math.abs(origX - pointer.x) });
      this.renderAll();
    });

    this._fabricCanvas.on("mouse:up", function(options) {
      this.isDown = false;
      if(this.isCircleMode){
        // Set target to to be circle
        options.target = this.circle;
        this.overlay.addAnnotation(options);

        // Reset annotation
        this.circle = null;
      }
    });

    this._viewer.addHandler("animation", function() {
      self.resize();
      self.resizecanvas();
    });

    this._viewer.addHandler("open", function() {
      self.resize();
      self.resizecanvas();
    });

    this.resize();
  };

  // ----------
  Overlay.prototype = {
    // ----------
    canvas: function() {
      return this._canvas;
    },
    fabricCanvas: function() {
      return this._fabricCanvas;
    },
    // ----------
    clear: function() {
      this._fabricCanvas.clearAll();
    },
    focusObject: function(objectId) {
      // remove selected flag from all annotation objects on fabric
      this._fabricCanvas.getObjects().forEach(function(obj) {
        if (obj.annID === objectId) {
          obj.selected = true;
        } else {
          obj.selected = false;
        }
      }, this);

      // Rerender
      this._fabricCanvas.renderAll();

      this.slideViewer.$emit('view-annotation', {
        id: objectId
      });
    },


    // Send call to add annotation to API
    addAnnotation: function(options){
      const index = this._fabricCanvas._objects.length;
      if (!options.target) {
        options.target = {}
      }
      if (!options.target.fromServer) {
        options.target.annID = `ann${index}`;

        this.slideViewer.isSlideAnnotationDialogVisible = true
        this.slideViewer.annotation = options.target.toObject()
        this.slideViewer.isCreatingAnnotation = true
      }
      options.target.index = index;
    },

    initCustomClasses: function() {
      const _this = this;

      /**
       * Overrides fabric.Path object to add on canvas
       * @param {String} pathData Path data
       * @return {fabric.Path} Path to add on canvas
       */
      fabric.BlackfynnBrush = fabric.util.createClass(fabric.PencilBrush, {
        type: "BlackfynnBrush",
        color: "#ffbc27",

        initialize: function(options) {
          let option = options || {};
          this.callSuper("initialize", options);
        },
        createPath: function(pathData) {
          return new fabric.BlackfynnDrawAnnotation(pathData, {
            _originalAngle: this.canvas.overlay._viewer.viewport.getRotation()
          });
        }
      });

      fabric.BlackfynnDrawAnnotation = fabric.util.createClass(fabric.Path, {
        type: "BlackfynnDrawAnnotation",
        fill: 'rgba(255,188,39,0.25)',
        originY: "center",
        originX: "center",
        stroke: "#ffbc27",
        lockScalingX: true,
        lockScalingY: true,
        lockUniscaling: true,
        lockRotation: true,
        hasBorders: false,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        strokeWidth: 100,
        strokeLineCap: "round",
        selectable: false,
        angle: 0,
        layerId: 0,

        initialize: function(path, options) {
          let option = options || {};
          this.callSuper("initialize", path, options);
          this._originalLeft = this.left;
          this._originalTop = this.top;
        },
        toObject: function() {
          return {
            type: this.get("type"),
            version: "1",
            path: this.get("path"),
            angle: this._originalAngle,
            x: this._originalLeft,
            y: this._originalTop,
            annID: this.annID,
            layerId: this.layerId,
            fill: _this.getRGBA(this.color),
            stroke: this.stroke
          };
        },
        _render: function(ctx) {
          const maxZoom = this.canvas.overlay._viewer.viewport.getMaxZoom();
          const curZoom = this.canvas.overlay._viewer.viewport.getZoom();

          ctx.lineWidth = Math.max(3, maxZoom / curZoom);

          this.callSuper('_render', ctx);
        }
      });

      fabric.BlackfynnDrawAnnotation.fromObject = function(object, callback) {
        let newAnn = new fabric.BlackfynnDrawAnnotation(object.path);
        if (object.fromServer) {
          newAnn.type = "BlackfynnDrawAnnotation";
          newAnn.stroke = object.stroke;
          newAnn.fill = _this.getRGBA(object.color);
          newAnn.annID = object.annID;
          newAnn.layerId = object.layerId;
          newAnn.fromServer = true;
          newAnn._originalAngle = object.angle;
          newAnn._originalLeft = object.left;
          newAnn._originalTop = object.top;
          newAnn.angle = 0;
        }
        newAnn.setAngle(newAnn.angle);

        callback(newAnn);
      };
      fabric.BlackfynnDrawAnnotation.setLabel = function(object, label) {
        object.label = label;
      };

      fabric.BlackfynnDrawAnnotation.async = true;

      fabric.BlackfynnCircleAnnotation = fabric.util.createClass(fabric.Circle, {
        type: "BlackfynnCircleAnnotation",
        fill: 'rgba(255,188,39,0.25)',
        opacity: 1,
        originY: "center",
        originX: "center",
        stroke: "#ffbc27",
        lockScalingX: true,
        lockScalingY: true,
        lockUniscaling: true,
        lockRotation: true,
        hasBorders: false,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        strokeWidth: 1,
        strokeLineCap: "round",
        selectable: true,
        angle: 0,
        radius: 1,

        initialize: function(path, options) {
          let option = options || {};
          this.callSuper("initialize", path, options);
          this._originalLeft = this.left;
          this._originalTop = this.top;
          this._originalAngle = this.rotation;
        },
        toObject: function() {
          return {
            type: this.get("type"),
            version: "1",
            angle: this._originalAngle,
            x: this._originalLeft,
            y: this._originalTop,
            radius: this.radius,
            annID: this.annID
          };
        },
        _render: function(ctx) {
          const maxZoom = this.canvas.overlay._viewer.viewport.getMaxZoom();
          const curZoom = this.canvas.overlay._viewer.viewport.getZoom();

          ctx.lineWidth = Math.max(3, maxZoom / curZoom);

          this.callSuper("_render", ctx);
        }
      });

      fabric.BlackfynnCircleAnnotation.fromObject = function(object, callback) {
        let newAnn = new fabric.BlackfynnCircleAnnotation(object);
        if (object.fromServer) {
          newAnn.annID = object.annID;
          newAnn.fromServer = true;
          newAnn._originalAngle = object.angle;
          newAnn._originalLeft = object.left;
          newAnn._originalTop = object.top;
          newAnn.angle = 0;
        }
        newAnn.setAngle(newAnn.angle);

        callback(newAnn);
      };
      fabric.BlackfynnCircleAnnotation.setLabel = function(object, label) {
        object.label = label;
      };

      fabric.BlackfynnCircleAnnotation.async = true;
    },

    // ----------
    resize: function() {
      if (this._containerWidth !== this._viewer.container.clientWidth) {
        this._containerWidth = this._viewer.container.clientWidth;
        this._canvasdiv.setAttribute("width", this._containerWidth);
        this._canvas.setAttribute("width", this._containerWidth);
      }
      if (this._containerHeight !== this._viewer.container.clientHeight) {
        this._containerHeight = this._viewer.container.clientHeight;
        this._canvasdiv.setAttribute("height", this._containerHeight);
        this._canvas.setAttribute("height", this._containerHeight);
      }
    },
    addAnnotationFromJSON: function(ann) {
      let annotationArray = {
        objects: []
      };
      Object.keys(ann).forEach(key => {
        for (let i = 0; i < ann[key].length; i++) {
          const currentAnn = ann[key][i];
          if (currentAnn.attributes.length > 0) {
            let position = new Object();
            for (let propsI = 0; propsI < currentAnn.attributes.length; propsI++) {
              position[currentAnn.attributes[propsI].key] =
                currentAnn.attributes[propsI].value;
            }
            let curAnn = {}
            const layer = this.getLayer(currentAnn.layer_id);

            if (position.type === "BlackfynnDrawAnnotation") {
              let pathArray = []
              let newPath = []

              for (let index = 0; index < currentAnn.path.length; index++) {
                newPath = currentAnn.path[index].data;

                newPath.unshift(currentAnn.path[index].elementType);

                pathArray.push(newPath);
              }

              curAnn = {
                type: position.type,
                left: position.x,
                top: position.y,
                annID: currentAnn.id,
                fromServer: true,
                path: pathArray,
                angle: position.angle,
                fill: this.getRGBA(layer.color),
                stroke: layer.color,
                layerId: layer.id
              };
            } else if (position.type === 'BlackfynnCircleAnnotation') {
              curAnn = {
                type: position.type,
                left: position.x,
                top: position.y,
                annID: currentAnn.id,
                fromServer: true,
                angle: position.angle,
                fill: this.getRGBA(layer.color),
                stroke: layer.color,
                radius: position.radius,
                layerId: layer.id
              };
            } else {
              return;
            }

            annotationArray.objects.push(curAnn);
          }
        }
      });

      // de-serializing the objects
      this.fabricCanvas().loadFromJSON(annotationArray);

      this.setRotation(0);
    },
    // find layer from a given id
    getLayer: function(layerId) {
      const annLayers = this.slideViewer.viewerAnnotations
      const layerIndex = annLayers.findIndex(layer => layer.id === layerId)
      return annLayers[layerIndex]
    },
    // convert color name to rgba equivalent
    getRGBA: function(color) {
      switch (color) {
        case '#E94B4B': // red
          return 'rgba(255,0,0,0.25)'
        case '#18BA62': // green
          return 'rgba(0,128,0,0.25)'
        case '#FFBC27': // gold
          return 'rgba(255,215,0,0.25)'
        case '#0D4EFF': // medium blue
          return 'rgba(0,0,205,0.25)'
        case '#FF4FFF': // magenta
          return 'rgba(255,0,255,0.25)'
        case '#2760FF': // light blue
          return 'rgba(39,96,255,0.25)'
        case '#50FFFF': // cyan
          return 'rgba(80,255,255,0.25)'
        case '#FFFF4E': // yellow
          return 'rgba(255,255,78,0.25)'
        case '#512BAF': // purple
          return 'rgba(81,43,175,0.25)'
        case '#8A6ECF': // lavendar
          return 'rgba(138,110,207,0.25)'
        case '#389BAD': // teal
          return 'rgba(56,155,173,0.25)'
        case '#187D46': // dark green
          return 'rgba(56,155,173,0.25)'
        case '#B12800': // brick red
          return 'rgba(177,40,0,0.25)'
        case '#0C2475': // dark blue
          return 'rgba(12,36,117,0.25)'
        case '#FF5321': // bright orange
          return 'rgba(255,83,33,0.25)'
        case '#FF99CC': // pink
          return 'rgba(255,153,204,0.25)'
        case '#DCC180': // tan
          return 'rgba(220,193,128,0.25)'
        case '#FF6C21': // orange
          return 'rgba(255,108,33,0.25)'
        case '#000000': // black
          return 'rgba(0,0,0,0.25)'
        case '#9B9B9B': // gray
          return 'rgba(155,155,155,0.25)'
        case '#00FF00': // lime
          return 'rgba(155,155,155,0.25)'
        case '#FA8072': // salmon
          return 'rgba(250,128,114,0.25)'
        case '#808000': // olive
          return 'rgba(128,128,0,0.25)'
        case '#A0522D': // sienna
          return 'rgba(160,82,45,0.25)'
        default: // light gray
          return 'rgba(128,128,128,0.25)'
      }
    },
    objReviver: function(ann, obj) {},
    resizecanvas: function() {
      let viewportZoom = this._viewer.viewport.getZoom(true);
      let image1 = this._viewer.world.getItemAt(0);

      if (!image1) return;

      let zoom = image1.viewportToImageZoom(viewportZoom);
      this._fabricCanvas.setZoom(zoom);
      this._fabricCanvas.calcOffset();

      let angle = this._viewer.viewport.getRotation();
      let rads = 2 * Math.PI * angle / 360;

      let origin = new OpenSeadragon.Point(0, 0);

      // windowpoint as if image was not rotated
      let image1WindowPoint = image1.imageToViewerElementCoordinates(origin);

      // offset windowpoint from center canvas
      let x2 = {
        x: image1WindowPoint.x - this._containerWidth / 2,
        y: image1WindowPoint.y - this._containerHeight / 2
      };

      // windowpoint after rotation
      let x =
        this._containerWidth / 2 +
        Math.round(x2.x * Math.cos(rads) - x2.y * Math.sin(rads));
      let y =
        this._containerHeight / 2 +
        Math.round(x2.y * Math.cos(rads) + x2.x * Math.sin(rads));

      // Set fabric coordinate (0,0) to top-left of openseadragon image
      this._fabricCanvas.absolutePan(new fabric.Point(-x, -y));

      this._fabricCanvas.setWidth(this._containerWidth);
      this._fabricCanvas.setHeight(this._containerHeight);
    },
    removeAnnotation: function(id) {
      // Get FrabicJS object associated with annotation
      let obj = this.getAnnotationByUuid(id);

      // Remove FabricJs Object
      this._fabricCanvas.remove(obj);

      // Rerender
      this._fabricCanvas.renderAll();
    },
    getAnnotationByUuid: function(id) {
      const objects = this._fabricCanvas.getObjects();
      return objects.find(item  => item.annID === id);
    },
    setRotation: function(angle) {
      let rads = 2 * Math.PI * angle / 360;

      // Update location of each object in Fabric.js
      this._fabricCanvas.getObjects().forEach(function(obj) {
        if (
          obj.type === "BlackfynnDrawAnnotation" ||
          obj.type === "BlackfynnMeasureTool" ||
          obj.type === "BlackfynnCircleAnnotation" ||
          obj.type === "BlackfynnMeasureText"
        ) {
          const objectOrigin = new fabric.Point(
            obj._originalLeft,
            obj._originalTop
          );
          const rotOrigin = new fabric.Point(0, 0);

          // rotate around point (0,0) which is top-left of openSeadragon image.
          const new_loc = fabric.util.rotatePoint(
            objectOrigin,
            rotOrigin,
            2 * Math.PI * (angle - obj._originalAngle) / 360
          );

          obj.top = new_loc.y;
          obj.left = new_loc.x;
          if (obj.type !== "BlackfynnMeasureText") {
            obj.setAngle(angle - obj._originalAngle);
          }
        }
      }, this);

      // Resize to rerender
      this.resizecanvas();
    }
  };
})();
