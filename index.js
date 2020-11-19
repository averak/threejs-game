// three object
let renderer, scene, camera;
let clock = new THREE.Clock();
let robot;
let life;
let enemies = [];

// config
let level = 5; // ゲーム難易度（1〜10）
let hp = 15;
let advanced = 0; // 前進した距離
let jumpFlag = false;
let jumpFrame = -10;
let gameOver = false;
let keys = { UP: 38, DOWN: 40, RIGHT: 39, LEFT: 37, JUMP: 32 };
let keyPressed = {
  UP: false,
  DOWN: false,
  RIGHT: false,
  LEFT: false,
  JUMP: false,
};

function init() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // レンダラーを作成
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#myCanvas"),
  });
  renderer.setSize(width * 0.85, height * 0.85);
  renderer.setClearColor(0x000000);

  // シーンを作成
  scene = new THREE.Scene();

  // 環境光を作成
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  // フィールドを作成
  let field1Geometry = new THREE.BoxGeometry(600, 1, 4000, 8, 1, 40);
  let field1Material = new THREE.MeshStandardMaterial({
    color: 0xdcdc58,
    wireframe: true,
  });
  let field1 = new THREE.Mesh(field1Geometry, field1Material);
  scene.add(field1);
  let field2Geometry = new THREE.BoxGeometry(750, 1, 4000, 20, 1, 100);
  let field2Material = new THREE.MeshStandardMaterial({
    color: 0x808080,
    wireframe: true,
  });
  let field2 = new THREE.Mesh(field2Geometry, field2Material);
  field2.position.set(0, -50, 0);
  scene.add(field2);

  // 操作するロボットを作成
  let SphereGeometry = new THREE.SphereGeometry(30, 20, 20);
  let wireMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    wireframe: true,
  });
  robot = new THREE.Mesh(SphereGeometry, wireMaterial);
  robot.position.set(0, 30, 0);
  scene.add(robot);

  // 残りHP
  let lifeGeometry = new THREE.BoxGeometry(hp * 2, 5, 1);
  let lifeMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
  });
  life = new THREE.Mesh(lifeGeometry, lifeMaterial);
  life.position.set(25, 65, 0);
  scene.add(life);

  // カメラを作成
  camera = new THREE.PerspectiveCamera(45, width / height);
  camera.position.set(0, 150, 400);

  animate();
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function createEnemy() {
  let height = Math.floor(rand(1, 3)) * 50;
  let geometry = new THREE.CubeGeometry(50, height, 50, 3, 3, 3);
  let material = new THREE.MeshStandardMaterial({
    color: 0xfe54bd,
    wireframe: true,
  });

  // ランダムな位置に作成
  let result = new THREE.Mesh(geometry, material);
  result.position.set(
    rand(-275, 275),
    height / 2,
    rand(-1200, -800) - advanced
  );
  result.name = Math.random().toString(32).substring(2);
  return result;
}

function update() {
  // 前進
  advanced++;
  camera.position.z--;
  robot.position.z--;
  life.position.z--;

  // ある程度前進したら元の位置に戻す
  if (advanced % 400 == 0) {
    advanced = 0;
    camera.position.z += 400;
    robot.position.z += 400;
    life.position.z += 400;
    for (let i = 0; i < enemies.length; i++) enemies[i].position.z += 400;
  }

  // 操作ロボットを移動
  let moveDistance = level * 50 * clock.getDelta();
  if (keyPressed["UP"]) {
    if (camera.position.z - robot.position.z < 800) {
      robot.position.z -= moveDistance;
      life.position.z -= moveDistance;
      robot.rotation.x -= 0.1;
    }
  }
  if (keyPressed["DOWN"]) {
    if (camera.position.z - robot.position.z > 400) {
      robot.position.z += moveDistance;
      life.position.z += moveDistance;
      robot.rotation.x += 0.1;
    }
  }
  if (keyPressed["RIGHT"]) {
    if (robot.position.x < 300) {
      robot.position.x += moveDistance;
      life.position.x += moveDistance;
      robot.rotation.z -= 0.1;
    }
    if (camera.position.x < 150) {
      camera.position.x += moveDistance * 0.6;
      if (camera.rotation.z < (5 * Math.PI) / 180) {
        camera.rotation.z += (0.2 * Math.PI) / 180;
      }
    }
  }
  if (keyPressed["LEFT"]) {
    if (robot.position.x > -300) {
      robot.position.x -= moveDistance;
      life.position.x -= moveDistance;
      robot.rotation.z += 0.1;
    }
    if (camera.position.x > -150) {
      camera.position.x -= moveDistance * 0.6;
      if (camera.rotation.z > (-5 * Math.PI) / 180) {
        camera.rotation.z -= (0.2 * Math.PI) / 180;
      }
    }
  }
  if (!(keyPressed["RIGHT"] || keyPressed["LEFT"])) {
    camera.rotation.z -= camera.rotation.z / 10;
  }
  if (keyPressed["JUMP"]) {
    jumpFlag = true;
  }

  // 一定確率で敵オブジェクトを作成
  if (
    (Math.random() < level * 0.006 && enemies.length < 30) ||
    enemies.length == 0
  ) {
    let enemy = createEnemy();
    enemies.push(enemy);
    scene.add(enemy);
  }

  // 敵を移動させる
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].position.z > camera.position.z) {
      scene.remove(enemies[i]);
      enemies.splice(i, 1);
    } else {
      enemies[i].position.z += level * 2.5;
    }
  }

  // ジャンプ
  if (jumpFlag) {
    jumpFrame += 0.7;
    let delte = -Math.pow(jumpFrame, 2) + 100;
    robot.position.y = delte * 1.2 + 30;
    life.position.y = delte * 1.2 + 65;
    if (robot.position.y <= 30) {
      robot.position.y = 30;
      life.position.y = 65;
      jumpFlag = false;
      jumpFrame = -10;
    }
  }

  // 当たり判定
  robot.material.color.setHex(0x00ff00);
  for (let i = 0; i < enemies.length; i++) {
    if (judgeCrash(enemies[i])) {
      scene.remove(enemies[i]);
      enemies.splice(i, 1);
      robot.material.color.setHex(0x000000);
      damage();
    }
  }
}

function judgeCrash(enemy) {
  return (
    Math.abs(enemy.position.x - robot.position.x) <= 30 + 25 &&
    Math.abs(enemy.position.y - robot.position.y) <= 30 + 25 &&
    Math.abs(enemy.position.z - robot.position.z) <= 30 + 25
  );
}

function damage() {
  hp -= 1;
  let lifeGeometry = new THREE.BoxGeometry(hp * 2, 5, 1);
  life.geometry = lifeGeometry;
  life.position.x -= 1;

  let color;
  if (hp >= 10) {
    color = 0x00ff00;
  } else if (hp >= 5) {
    color = 0xffff00;
  } else {
    color = 0xff0000;
  }
  life.material.color.setHex(color);

  if (hp <= 0) {
    // ゲームオーバー
    scene.remove(life);
    gameOver = true;
  }
}

function keyPress(event_k) {
  Object.keys(keys).forEach((key) => {
    if (event_k.which == keys[key]) keyPressed[key] = true;
  });
}

function keyRelease(event_k) {
  Object.keys(keys).forEach((key) => {
    if (event_k.which == keys[key]) keyPressed[key] = false;
  });
}

function animate() {
  id = requestAnimationFrame(animate);
  update();
  render();

  if (gameOver) {
    robot.material.color.setHex(0xff0000);
    render();
    cancelAnimationFrame(id);
  }
}

function render() {
  renderer.render(scene, camera);
}

window.addEventListener("DOMContentLoaded", init);
document.addEventListener("keydown", keyPress, false);
document.addEventListener("keyup", keyRelease, false);
