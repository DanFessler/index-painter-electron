import * as Three from "three";
import * as bayerTextureURL from "./textures/bayer4x4.png";
import raw from "raw.macro";
import { PolyCatmull, CatmullRom } from "./CatmullRom.js";
import Vector2 from "./Vector.js";

const planeVert = raw("./shaders/plane.vert");
const brushFrag = raw("./shaders/brush.frag");
const blitFrag = raw("./shaders/blit.frag");
const ditherFrag = raw("./shaders/dither.frag");
const gradientFrag = raw("./shaders/gradient.frag");
const indexFrag = raw("./shaders/index.frag");
const pixelateFrag = raw("./shaders/pixelate.frag");

var bayerTexture = new Three.TextureLoader().load(bayerTextureURL.default);
bayerTexture.wrapS = Three.RepeatWrapping;
bayerTexture.wrapT = Three.RepeatWrapping;
bayerTexture.magFilter = Three.NearestFilter;
bayerTexture.minFilter = Three.NearestFilter;

// Notes
// might want to abstract brush stuff into separate class
// might want to abstract palette stuff into a separate class

class Canvas {
  scene = new Three.Scene();
  layers = [];
  posHistory = [];
  lastPos = { x: null, y: null };
  isBrushing = false;
  views = [];
  history = [];
  historyPointer = 0;
  buffer2d = null;
  onChange = null;

  drawIndexed = true;

  constructor(width, height, palette, onChange) {
    this.onChange = onChange;

    this.renderer = new Three.WebGLRenderer({
      preserveDrawingBuffer: true,
      autoClear: false
    });
    this.renderer.setSize(width, height);
    this.size = { x: width, y: height };

    // Camera that draws the layers and processes filters
    this.canvasCamera = new Three.OrthographicCamera(
      0,
      width,
      0,
      height,
      0,
      1000
    );

    // Camera used for painting brush strokes to the canvas
    this.paintCamera = new Three.OrthographicCamera(
      0,
      width,
      0,
      height,
      0,
      1000
    );

    // set the layer of the paint camera to never show on the canvasCamera directly
    this.paintCamera.layers.disable(0);
    this.paintCamera.layers.enable(1);

    // These buffers are used to process all the filters before drawing to the screen
    this.bufferA = new Three.WebGLRenderTarget(width, height);
    this.bufferB = new Three.WebGLRenderTarget(width, height);
    this.bufferB.texture.format = Three.RGBFormat;

    this.buffer2d = document.createElement("canvas");
    this.buffer2d.width = this.renderer.domElement.width;
    this.buffer2d.height = this.renderer.domElement.height;
    // this.buffer2d = this.buffer2d.getContext("2d");

    // This buffer is the layer we actually paint on (should be replaced by layer system)
    this.drawLayer = new Three.WebGLRenderTarget(width, height);
    this.history.push({ action: "New Document", data: this.drawLayer.texture });
    this.historyPointer = 0;
    this.reportHistory();

    // set up 2D canvas for rendering the palette texture
    this.paletteCanvas = document.createElement("canvas");
    this.paletteCanvasCtx = this.paletteCanvas.getContext("2d");
    this.paletteCanvas.width = 256;
    this.paletteCanvas.height = 1;
    this.paletteTexture = new Three.CanvasTexture(
      this.paletteCanvas,
      Three.UVMapping,
      Three.ClampToEdgeWrapping,
      Three.ClampToEdgeWrapping,
      Three.NearestFilter,
      Three.NearestFilter
    );
    this.paletteTexture.generateMipmaps = false;

    // set up shaders
    this.BrushMaterial = new Filter(
      {
        color: { value: new Three.Color(1, 1, 1) },
        alpha: { value: 1.0 },
        hardness: { value: 1.0 },
        indexMatrix4x4: { value: bayerTexture }
      },
      brushFrag,
      true
    );
    this.pixelateFilter = new Filter(
      {
        size: { value: 64 },
        map: { value: this.bufferB.texture }
      },
      pixelateFrag
    );
    this.debugFilter = new Filter(
      {
        size: { value: 64 },
        map: { value: this.bufferB.texture }
      },
      gradientFrag
    );
    this.indexFilter = new Filter(
      {
        map: { value: this.bufferB.texture },
        palette: { value: this.paletteTexture }
      },
      indexFrag
    );
    this.ditherFilter = new Filter(
      {
        map: { value: this.bufferB.texture },
        indexMatrix4x4: { value: bayerTexture },
        canvasSize: { value: new Three.Vector2(width, height) },
        palette: { value: this.paletteTexture },
        paletteSize: { value: 12 }
      },
      ditherFrag
    );
    this.blitDrawLayer = new Filter(
      {
        map: { value: this.drawLayer.texture }
      },
      blitFrag
    );

    // line material
    this.lineMat = new Three.LineBasicMaterial({
      color: 0xff00ff,
      linewidth: 20
      // transparent: true,
      // opacity: 1,
      // dashed: false
      // vertexColors: true
    });

    // set up canvas geo
    this.canvasMesh = new Three.Mesh(new Three.PlaneGeometry(1, 1));
    this.canvasMesh.position.x = width / 2;
    this.canvasMesh.position.y = height / 2;
    this.canvasMesh.position.z = -1;
    this.canvasMesh.scale.set(width, height, 1);
    this.canvasMesh.scale.x *= -1;
    this.canvasMesh.rotateY(Math.PI);
    this.scene.add(this.canvasMesh);

    // set up brush geo
    this.brushMesh = new Three.Mesh(
      new Three.PlaneGeometry(1, 1),
      this.BrushMaterial.material
    );
    this.brushMesh.position.x = 0;
    this.brushMesh.position.y = 0;
    this.brushMesh.position.z = 0;
    this.brushMesh.scale.set(100, 100, 100);
    this.brushMesh.scale.x *= -1;
    this.brushMesh.rotateY(Math.PI);
    this.scene.add(this.brushMesh);
    this.brushMesh.layers.disable(0);
    this.brushMesh.layers.enable(1);

    this.updatePalette(palette);
  }

  draw() {
    this.renderer.setRenderTarget(this.bufferA);
    this.renderer.autoClear = true;

    // loop through and apply filters
    if (this.drawIndexed) {
      this.drawFilters([
        this.blitDrawLayer.material,
        this.ditherFilter.material
        // this.indexFilter.material
      ]);
    } else {
      this.drawFilters([this.blitDrawLayer.material]);
    }

    this.updateViews();
  }

  updateViews() {
    // draw the result to each canvas 2d view
    this.views.forEach(view => {
      view.drawImage(this.renderer.domElement, 0, 0);
    });
  }

  drawFilters(filters) {
    filters.forEach((filter, i, arr) => {
      // if last filter, just display result directly to screen
      if (i === arr.length - 1) this.renderer.setRenderTarget(null);

      this.canvasMesh.material = filter;
      this.renderer.render(this.scene, this.canvasCamera);
      this.renderer.copyFramebufferToTexture(
        new Three.Vector2(0, 0),
        this.bufferB.texture,
        0
      );
    });
  }

  addView(context) {
    this.views.push(context);
  }

  removeView(context) {
    this.views = this.views.filter(view => view !== context);
  }

  beginStroke(pos, brush, index) {
    this.distFromLastStamp = 0;

    this.lastPos = pos;
    let historyPos = { ...pos };
    this.posHistory = [historyPos, historyPos, historyPos];
    this.isBrushing = true;
    this.stamp(pos.x, pos.y, brush, index, pos.z);
  }

  applyBrushPressure(brush, pressure) {
    return {
      ...brush,
      flow: brush.flowPressure ? brush.flow * pressure : brush.flow,
      size: brush.sizePressure ? Math.max(brush.size * pressure, 1) : brush.size
    };
  }

  endStroke() {
    if (this.isBrushing) {
      this.posHistory = [];
      this.isBrushing = false;
      // this.pushHistory("Stroke");
      this.draw();
    }
  }

  pushHistory(action) {
    // if we are in the middle of our history, then chip off the remaining
    if (this.historyPointer < this.history.length - 1) {
      this.history.splice(this.historyPointer + 1);
    }

    // push the image data to the history stack
    this.history.push({
      action: action,
      data: this.getLayerData()
    });
    this.historyPointer++;

    this.reportHistory();
  }

  getLayerData() {
    // Draw unfiltered buffer
    this.drawFilters([this.blitDrawLayer.material]);

    // Create temporary 2d canvas to copy to.
    let tempCanvas = document.createElement("canvas");
    tempCanvas.width = this.renderer.domElement.width;
    tempCanvas.height = this.renderer.domElement.height;
    let ctx = this.buffer2d.getContext("2d");
    ctx.drawImage(this.renderer.domElement, 0, 0);

    // Return image data from temporary canvas
    return ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  }

  reportHistory() {
    if (this.onChange) this.onChange(this.getHistory());
  }

  getHistory() {
    return {
      pointer: this.historyPointer,
      history: this.history.map(change => change.action)
    };
  }

  blitImageData(data, renderTarget) {
    let newTexture = new Three.DataTexture(
      data.data,
      data.width,
      data.height,
      Three.RGBAFormat
    );
    newTexture.flipY = true;

    this.renderer.setRenderTarget(renderTarget);

    let newBlit = new Filter({ map: { value: newTexture } }, blitFrag);

    this.canvasMesh.material = newBlit.material;
    this.renderer.render(this.scene, this.canvasCamera);
  }

  undo = () => {
    if (this.historyPointer > 0) {
      this.historyPointer--;
      this.blitImageData(
        this.history[this.historyPointer].data,
        this.drawLayer
      );
      this.draw();
      this.reportHistory();
    }
  };

  redo = () => {
    if (this.history.length - 1 > this.historyPointer) {
      this.historyPointer++;
      this.blitImageData(
        this.history[this.historyPointer].data,
        this.drawLayer
      );
      this.draw();
      this.reportHistory();
    }
  };

  pushLayerData = data => {
    this.blitImageData(data, this.drawLayer);
    this.draw();
  };

  setHistory = pointer => {
    this.historyPointer = pointer;
    this.blitImageData(this.history[this.historyPointer].data, this.drawLayer);
    this.draw();
    this.reportHistory();
  };

  getBrushSpacing(brush, pressure) {
    return Math.max(
      (brush.size / 2) * (brush.spacing / 100) * pressure +
        (this.lastBrushSize / 2) * (brush.spacing / 100),
      1 // make sure spacing is at least 1px
    );
  }

  addPosHistory(pos) {
    this.posHistory.push(pos);
    if (this.posHistory.length > 4) this.posHistory.shift();
    return [this.posHistory[1], this.posHistory[2]];
  }

  smoothstep(a, b, t) {
    // Scale, bias and saturate x to 0..1 range
    t = Math.min(Math.max((t - a) / (b - a), 0.0), 1.0);
    // Evaluate polynomial
    return t * t * (3 - 2 * t);
  }

  polyStroke(pos, brush, index) {
    if (this.isBrushing) {
      let [startPos, endPos] = this.addPosHistory(pos);

      if (Vector2.distance(startPos, endPos) >= 0) {
        let divisions = Vector2.distance(startPos, endPos) / 4 || 1;
        let spline = new PolyCatmull(...this.posHistory, divisions, 4);

        let lengthAcc = -this.distFromLastStamp;
        while (
          spline.length - lengthAcc >=
          this.getBrushSpacing(brush, endPos.z)
        ) {
          // get hypotenuse length of triangle which intersects startPos & endPos
          // and who's base is the line tangent to the edge of their radius'
          let r1 = Math.max((brush.size / 2) * startPos.z, 0);
          let r2 = Math.max((brush.size / 2) * endPos.z, 0.0001);

          // this assumes r2 > r1, but interestingly the calc also works for r2 < r1
          let hypotenuse = (r2 * spline.length) / (r2 - r1);
          let smallHypotenuse = hypotenuse - spline.length;

          if (hypotenuse) {
            // get last brush edge pos relative to startPos
            let offset =
              lengthAcc -
              this.lastBrushSize / 2 +
              this.lastBrushSize * (brush.spacing / 100);

            let r3;
            // if start and end radius are the same, no need to calc a new one
            if (r2 === r1) r3 = r1;
            // otherwise, get radius of next stamp
            else r3 = (r2 * (smallHypotenuse + offset)) / (hypotenuse - r2);

            // get new position
            lengthAcc += Math.max(
              (this.lastBrushSize / 2 + r3) * (brush.spacing / 100),
              1
            );

            let pos = spline.getPointAtLength(
              Math.min(Math.max(lengthAcc, 0), spline.length)
            );

            this.stamp(pos.x, pos.y, brush, index, pos.z);
          } else {
            break;
          }
        }
        this.distFromLastStamp = spline.length - lengthAcc;
      }
    }
  }

  stroke(pos, brush, index) {
    if (this.isBrushing) {
      // Update cursor position history
      let [startPos, endPos] = this.addPosHistory(pos);

      // divide hermite spline into linear segments and iterate.
      // We convert to linear segments in order to stamp at
      // absolute pixel spacing. Can't directly get spline length.
      // may want to make divisions dynamic based on length.
      let divisions = Math.max(Vector2.distance(startPos, endPos) / 4, 3);
      let lastPoint = this.posHistory[1];
      let spline = new CatmullRom(
        this.posHistory[0],
        this.posHistory[1],
        this.posHistory[2],
        this.posHistory[3]
      );
      if (Vector2.distance(startPos, endPos)) {
        for (let i = 1; i <= divisions; i++) {
          // get interpolated point along hermit segment
          let point = spline.getPointAtInterval(i / divisions);
          let segmentLength = Vector2.distance(lastPoint, point);
          let brushSpacing = this.getBrushSpacing(brush, point.z);

          // if segment is longer than brush spacing, linear interpolate and stamp
          if (Vector2.distance(this.lastPos, point) > brushSpacing) {
            // get vector towards destination
            let vect = Vector2.subtract(point, this.lastPos)
              .normalize()
              .multiply(brushSpacing);

            // Linear interpolate from start to end of spline segment
            let pos = this.lastPos;
            while (Vector2.distance(pos, point) > brushSpacing) {
              // move position towards destination by brushSpacing
              pos = Vector2.add(pos, vect);

              // lerp the pressure along the way
              let pressure = this.lerp(
                this.lastPos.z,
                point.z,
                Vector2.distance(pos, this.lastPos) /
                  Vector2.distance(point, this.lastPos)
              );

              // stamp
              this.stamp(pos.x, pos.y, brush, index, pressure);
            }
          } else {
            // otherwise build up stroke distance to stamp on next segments
            this.distFromLastStamp += segmentLength;

            // this is what allows stroke buildup
            if (this.distFromLastStamp > brushSpacing) {
              this.stamp(point.x, point.y, brush, index, point.z);
            }
          }

          lastPoint = point;
        }
      }
    }
  }

  stamp(x, y, brush, color, pressure) {
    this.lastPos = { x: x, y: y, z: pressure };
    this.distFromLastStamp = 0;
    brush = this.applyBrushPressure(brush, pressure);
    this.lastBrushSize = brush.size;
    this.lastPressure = pressure;

    this.brushMesh.position.x = brush.aa ? x : Math.ceil(x + 0.5) - 0.5;
    this.brushMesh.position.y = brush.aa ? y : Math.ceil(y + 0.5) - 0.5;
    this.brushMesh.scale.setScalar(brush.size * 2);

    this.renderer.autoClear = false;
    this.BrushMaterial.material.uniforms.color.value = new Three.Vector3(
      color,
      color,
      color
    );

    // set min hardness to allow AA hard brush
    this.BrushMaterial.material.uniforms.hardness.value = Math.min(
      brush.hardness / 100,
      brush.aa ? 1 - 2 / this.size.x / (brush.size / this.size.x) : 1
    );

    this.BrushMaterial.material.uniforms.alpha.value = brush.flow / 100;

    // Draw
    this.renderer.setRenderTarget(this.drawLayer);
    this.renderer.render(this.scene, this.paintCamera);
    this.renderer.setRenderTarget(null);
    this.draw();
  }

  drawLine(points) {
    const newPoints = points.map(
      point => new Three.Vector3(point.x, point.y, 0)
    );
    const geometry = new Three.BufferGeometry().setFromPoints(newPoints);
    const line = new Three.Line(geometry, this.lineMat);

    this.scene.add(line);
    this.renderer.setRenderTarget(this.drawLayer);
    this.renderer.render(this.scene, this.canvasCamera);
    this.renderer.setRenderTarget(null);
    this.draw();
    this.scene.remove(line);
  }

  updatePalette(palette) {
    this.palette = palette;
    palette.forEach((index, i, arr) => {
      let width = 256 / arr.length;
      this.paletteCanvasCtx.fillStyle = `rgb(${index.join(",")})`;
      this.paletteCanvasCtx.fillRect(
        Math.floor(i * width),
        0,
        Math.floor(i * width + width),
        1
      );
    });
    this.paletteTexture.needsUpdate = true;
    this.ditherFilter.material.uniforms.paletteSize.value = palette.length;
  }

  distance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }
}

class Filter {
  constructor(defaultUniforms, glsl, transparent) {
    this.glsl = glsl;
    this.defaultUniforms = defaultUniforms;
    this.material = this.compile();
    this.material.transparent = transparent;
  }

  setUniforms(uniforms) {
    this.material.uniforms = { ...this.material.uniforms, ...uniforms };
    return this.material;
  }

  compile() {
    return new Three.ShaderMaterial({
      uniforms: this.defaultUniforms,
      vertexShader: planeVert,
      fragmentShader: this.glsl
    });
  }
}

export default Canvas;
