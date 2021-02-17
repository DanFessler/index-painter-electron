varying vec3 vUv;
uniform sampler2D map;
uniform float size;

void main() {
  gl_FragColor = texture2D(map, vec2( floor(vUv.x * size)/size, floor(vUv.y * size)/size ) );
  // gl_FragColor = vec4(floor(vUv.x * size)/size, floor(vUv.y * size)/size, 0.0, 1.0);
}
