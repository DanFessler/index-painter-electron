varying vec3 vUv;
void main() {
  // This is simply due to UVs on default plane being weird
  vUv = position + 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
