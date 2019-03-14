// Three.js
const head: THREE.Object3D = new THREE.Object3D();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(70, window.innerHeight / window.innerWidth, 0.01, 500);
const scene: THREE.Scene = new THREE.Scene();
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });

$(document).ready(() => {
  setupThree();
  setupWebVR();
  getCamera();
  setupKeyEvent();
});

const getCamera = function () {
  const constraints: MediaStreamConstraints = {
    audio: false,
    video: true
  };

  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    const myVideo = (<HTMLVideoElement>$('#my-video').get(0));
    myVideo.srcObject = stream;

    createDummySphere(myVideo);
  });
}

// THREE.JS -----------------------------------------------------

const setupThree = function () {
  const container = document.getElementById('main');
  scene.background = new THREE.Color(0x505050);
  camera.position.set(0, 0, 0);
  head.position.set(0, 0, 0);
  head.add(camera);
  scene.add(head);

  let light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.vr.enabled = true;
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);
  onWindowResize();

  renderer.animate(render);
}

const onWindowResize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

const render = function () {
  // 首座標固定（回転のみする）
  head.position.set(-camera.position.x, -camera.position.y, -camera.position.z);
  // メインの描画
  renderer.render(scene, camera);
}

const createDummySphere = function (video: HTMLVideoElement) {
  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;

  const planeGeometry = new THREE.PlaneGeometry(4, 3, 1, 1);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: texture,
    transparent: true,
    opacity: 1.0,
    side: THREE.DoubleSide,
    // blending: THREE.NormalBlending,
    depthWrite: false
  });
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  planeMesh.position.set(0, 0, -4);
  scene.add(planeMesh);

  // const sphereGeometry = new THREE.SphereGeometry(2, 10, 10);
  // const sphereMesh = new THREE.Mesh(sphereGeometry, planeMaterial);
  // sphereMesh.position.set(0, 0, -10);
  // scene.add(sphereMesh);
}

let vrdisplay: VRDisplay = null;
let isVR: boolean = false;
const setupWebVR = function () {
  navigator.getVRDisplays().then((displays) => {
    if (displays.length > 0) {
      vrdisplay = displays[0];
      renderer.vr.setDevice(vrdisplay);
      console.log(displays[0].capabilities);
      console.log(displays[0].displayName);
      console.log(displays[0].isConnected);
      console.log(displays[0].stageParameters);
      console.log(displays[0].getEyeParameters('left'));
      console.log(displays[0].stageParameters);
    } else {
      // showVRNotFound();
    }
  });
}

const toggleVR = function () {
  if (vrdisplay == null) return;

  if (vrdisplay.isPresenting) {
    vrdisplay.exitPresent();
    renderer.vr.enabled = false;
    let w = window.innerWidth;
    // VR中にヘッドトラッキングを無理矢理戻しているのを初期状態にリセット。
    camera.position.set(0, 0, 0);
    head.position.set(0, 0, 0);
    isVR = false;
  } else {
    vrdisplay.requestPresent([{ source: renderer.domElement }]);
    renderer.vr.enabled = true;
    let w = window.innerWidth;
    isVR = true;
  }
}

const setupKeyEvent = function () {
  $(document).on('keydown', (e) => {
    if (e.key == 'v') {
      toggleVR();
    }
  });
}