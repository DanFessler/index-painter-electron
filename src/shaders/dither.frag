varying vec3 vUv;
uniform sampler2D map;
uniform vec2 canvasSize;
uniform sampler2D palette;
uniform sampler2D indexMatrix4x4;
uniform float paletteSize;

void main() {
  float ditherValue = texture2D(indexMatrix4x4, vUv.xy * (canvasSize/4.0) ).x;
  float inputValue =  texture2D(map, vUv.xy).x;
  float mixedValue = mix(inputValue, ditherValue, 1.0/(paletteSize+1.0) * 1.0);

  gl_FragColor = texture2D(palette, vec2(mixedValue + (0.5/256.0), 0.5));
  // gl_FragColor = texture2D(palette, vec2(inputValue + (0.5/256.0), 0.5));
}
