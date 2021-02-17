varying vec3 vUv;
uniform sampler2D map;
uniform float size;

void main() {
  gl_FragColor = texture2D(map, vUv.xy );
}
