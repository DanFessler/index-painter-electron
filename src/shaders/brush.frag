varying highp vec3 vUv;
uniform highp vec3 color;
uniform highp float alpha;
uniform highp float hardness;
uniform sampler2D indexMatrix4x4;

void main() {
  highp vec3 newUv = vUv - 0.5;
  highp float a = 1.0 - sqrt( (newUv.x*newUv.x) + (newUv.y*newUv.y) )*2.0;

  a = smoothstep(hardness/2.0,(1.0-hardness)/2.0 + 0.5,a) * alpha;
  gl_FragColor = vec4(color.x, color.x, color.x, a);
}
