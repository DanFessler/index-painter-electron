varying highp vec3 vUv;
uniform sampler2D map;
uniform highp float size;

void main() {
  gl_FragColor = vec4(vec3(vUv.x),1);
}
