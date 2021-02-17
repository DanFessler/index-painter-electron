varying vec3 vUv;
uniform sampler2D map;
uniform sampler2D palette;

void main() {
  float sourceValue = texture2D(map, vUv.xy).x;
  vec4 color = texture2D(palette, vec2(sourceValue + (0.5/256.0), 0.5));
  gl_FragColor = color;
}
