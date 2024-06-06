import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; 
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

// Source: Jacob's tutoring hours
const MANAGER = new THREE.LoadingManager();
const DRACO_LOADER = new DRACOLoader(MANAGER).setDecoderPath(
	`three/addons/libs/draco/gltf/`,
);
const KTX2_LOADER = new KTX2Loader(MANAGER).setTranscoderPath(
	`three/addons/jsm/libs/basis/`,
);

function main() {

    // SETUP
	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { canvas, antialias: true } );
	
	// Source for next two lines: ChatGPT
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio * 2);
	renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	// CAMERA
	// Source: Kitty Playground by Yukti Malhan https://people.ucsc.edu/~ymalhan/asg5/asg5.html
    let camera;
	initCamera();
	let controls = new OrbitControls(camera, canvas); 

	const scene = new THREE.Scene();

	// FLOOR PLANE

	{
		let planeSize = 150;
		let planeThickness = 5;

		const loader = new THREE.TextureLoader();
		const texture = loader.load('background/floor.jpg');
		texture.encoding = THREE.sRGBEncoding;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;

		const repeats = planeSize / 2;
		texture.repeat.set(repeats, repeats);

		const planeGeo = new THREE.BoxGeometry(70, planeThickness, planeSize);
		const planeMat = new THREE.MeshPhongMaterial({
			map: texture,
			side: THREE.DoubleSide,
		});

		const mesh = new THREE.Mesh(planeGeo, planeMat);
		mesh.receiveShadow = true;

		scene.add(mesh);
	}
	
	function initCamera() {
		const fov = 75;
		const aspect = window.innerWidth / window.innerHeight;
		const near = 0.1;
		const far = 1000;

		camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0, 12, 70);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 12, 0);
        controls.update();
	}

	// LIGHTS: Ambient, Directional, Hemisphere

	{

		const color = 0xFFFFFF;
		const intensity = 1.5;
		const light = new THREE.AmbientLight(color, intensity);
		scene.add(light);

	}

	{
		const color = 0xFFEAD0;
		const intensity = 2;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(5, 10, -10);
		light.castShadow = true;

		// Shadow properties
		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 2048;
		const d = 50;
		light.shadow.camera.left = -d;
		light.shadow.camera.right = d;
		light.shadow.camera.top = d;
		light.shadow.camera.bottom = -d;
		light.shadow.camera.near = 0.1;
		light.shadow.camera.far = 1000;

		scene.add(light);
	}

	// SKYBOX
	// Source: https://threejs.org/manual/?q=sky#en/backgrounds,
	//		https://jaxry.github.io/panorama-to-cubemap/
	{
		const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
			'./background/px.png',
			'./background/nx.png',
			'./background/py.png',
			'./background/ny.png',
			'./background/pz.png',
			'./background/nz.png',
        ])
			texture.encoding = THREE.sRGBEncoding;
			
			scene.background = texture;
	}

    // Models
	// Source: Jacob's tutoring hours, Kitty Playground, and ChatGPT

	const gltfLoader = new GLTFLoader(MANAGER).setDRACOLoader(DRACO_LOADER).setKTX2Loader(KTX2_LOADER.detectSupport(renderer));

	{	// Cat
		gltfLoader.load('models/sleepycat/scene.gltf', (gltf) => {
			gltf.scene.scale.set(60, 60, 60);
			gltf.scene.position.set(15, 5.1, -50);
			const model = gltf.scene;
			model.castShadow = true;
			model.receiveShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) {
                    if (!(node.material instanceof THREE.MeshStandardMaterial)) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: node.material.color,
                            map: node.material.map,
                            normalMap: node.material.normalMap,
                            metalness: 0.5,
                            roughness: 0.5
                        });
                    }
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
			scene.add(model);
		});
    }

	{	// bagel
		gltfLoader.load('models/bagel2/scene.gltf', (gltf) => {
			gltf.scene.scale.set(50, 50, 50);
			gltf.scene.position.set(-5, 4.6, -40);
			const model = gltf.scene;
			model.castShadow = true;
			model.receiveShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) {
                    if (!(node.material instanceof THREE.MeshStandardMaterial)) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: node.material.color,
                            map: node.material.map,
                            normalMap: node.material.normalMap,
                            metalness: 0.5,
                            roughness: 0.5
                        });
                    }
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
			scene.add(model);
		});
	}

	{	// Toast
		gltfLoader.load('models/toast/scene.gltf', (gltf) => {
			gltf.encoding = THREE.sRGBEncoding;
			gltf.scene.scale.set(80, 80, 80);
			gltf.scene.position.set(-20, 3.8, 14);
			const model = gltf.scene;
			model.castShadow = true;
			model.receiveShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) {
                    if (!(node.material instanceof THREE.MeshStandardMaterial)) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: node.material.color,
                            map: node.material.map,
                            normalMap: node.material.normalMap,
                            metalness: 0.5,
                            roughness: 0.5
                        });
                    }
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
			scene.add(model);
		});
	}

	{	// Coffee cup
		gltfLoader.load('models/coffee_cup/scene.gltf', (gltf) => {
			gltf.scene.scale.set(70, 70, 70);
			gltf.scene.position.set(10, 5.445, 10);
			const model = gltf.scene;
			model.castShadow = true;
			model.receiveShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) {
                    if (!(node.material instanceof THREE.MeshStandardMaterial)) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: node.material.color,
                            map: node.material.map,
                            normalMap: node.material.normalMap,
                            metalness: 0.5,
                            roughness: 0.5
                        });
                    }
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
			scene.add(model);
		});
    }

	{	// Newspaper
		gltfLoader.load('models/folded_newspaper/scene.gltf', (gltf) => {
			gltf.scene.scale.set(0.9, 0.9, 0.9);
			gltf.scene.position.set(20, 2.8, -10);
			gltf.scene.rotation.set(0, 15, 0);
			const model = gltf.scene;
			model.castShadow = true;
			model.receiveShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) {
                    if (!(node.material instanceof THREE.MeshStandardMaterial)) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: node.material.color,
                            map: node.material.map,
                            normalMap: node.material.normalMap,
                            metalness: 0.5,
                            roughness: 0.5
                        });
                    }
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
			scene.add(model);
		});
    }

	{	// Folder
		gltfLoader.load('models/folder/scene.gltf', (gltf) => {
			gltf.scene.scale.set(0.7, 0.7, 0.7);
			gltf.scene.position.set(-20, 3, -50);
			gltf.scene.rotation.set(0, Math.PI, 0);
			const model = gltf.scene;
			model.castShadow = true;
			model.receiveShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) {
                    if (!(node.material instanceof THREE.MeshStandardMaterial)) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: node.material.color,
                            map: node.material.map,
                            normalMap: node.material.normalMap,
                            metalness: 0.5,
                            roughness: 0.5
                        });
                    }
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
			scene.add(model);
		});
    }

	{	// Pastry plate
		gltfLoader.load('models/pastries/scene.gltf', (gltf) => {
			gltf.scene.scale.set(20, 20, 20);
			gltf.scene.position.set(-5, 5.1, 50);
			const model = gltf.scene;
			model.castShadow = true;
			model.receiveShadow = true;
			gltf.scene.traverse((node) => {
				if (node.isMesh) {
                    if (!(node.material instanceof THREE.MeshStandardMaterial)) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: node.material.color,
                            map: node.material.map,
                            normalMap: node.material.normalMap,
                            metalness: 0.5,
                            roughness: 0.5
                        });
                    }
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
			scene.add(model);
		});
	}

	{	// Coffee cake
		gltfLoader.load('models/coffee_cake/scene.gltf', (gltf) => {
			gltf.scene.scale.set(2, 2, 2);
			gltf.scene.position.set(27, 2.1, -1);
			const model = gltf.scene;
			model.castShadow = true;
			model.receiveShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) {
                    if (!(node.material instanceof THREE.MeshStandardMaterial)) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: node.material.color,
                            map: node.material.map,
                            normalMap: node.material.normalMap,
                            metalness: 0.5,
                            roughness: 0.5
                        });
                    }
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
			scene.add(model);
		});
	}

	
	{	// Iced coffee
		gltfLoader.load('models/icedcoffee2/scene.gltf', (gltf) => {
			gltf.scene.scale.set(70, 70, 70);
			gltf.scene.position.set(-15, -17.58, -38);
			const model = gltf.scene;
			model.castShadow = true;
			model.receiveShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) {
                    if (!(node.material instanceof THREE.MeshStandardMaterial)) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: node.material.color,
                            map: node.material.map,
                            normalMap: node.material.normalMap,
                            metalness: 0.5,
                            roughness: 0.5
                        });
                    }
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
			scene.add(model);
		});
    }

	{	// mac
		gltfLoader.load('models/mac/scene.gltf', (gltf) => {
			gltf.scene.scale.set(80, 80, 80);
			gltf.scene.position.set(20, 3, 40);
			gltf.scene.rotation.set(0, Math.PI / 2, 0);
			const model = gltf.scene;
			model.castShadow = true;
			model.receiveShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) {
                    if (!(node.material instanceof THREE.MeshStandardMaterial)) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: node.material.color,
                            map: node.material.map,
                            normalMap: node.material.normalMap,
                            metalness: 0.5,
                            roughness: 0.5
                        });
                    }
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
			scene.add(model);
		});
    }

	{	// Pen
		gltfLoader.load('models/pen/scene.gltf', (gltf) => {
			gltf.scene.scale.set(0.5, 0.5, 0.5);
			gltf.scene.position.set(-20, 2.8, 60);
			gltf.scene.rotation.set(0, Math.PI / 6, 0);
			const model = gltf.scene;
			model.castShadow = true;
			model.receiveShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) {
                    if (!(node.material instanceof THREE.MeshStandardMaterial)) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: node.material.color,
                            map: node.material.map,
                            normalMap: node.material.normalMap,
                            metalness: 0.5,
                            roughness: 0.5
                        });
                    }
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
			scene.add(model);
		});
	}

	{	// Novel
		gltfLoader.load('models/novel/scene.gltf', (gltf) => {
			gltf.scene.scale.set(100, 100, 100);
			gltf.scene.position.set(-20, 2.6, 27);
			gltf.scene.rotation.set(0, Math.PI, 0);
			const model = gltf.scene;
			model.castShadow = true;
			model.receiveShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) {
                    if (!(node.material instanceof THREE.MeshStandardMaterial)) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: node.material.color,
                            map: node.material.map,
                            normalMap: node.material.normalMap,
                            metalness: 0.5,
                            roughness: 0.5
                        });
                    }
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
			scene.add(model);
		});
	}
	
	{	// Coffee cup blue
		gltfLoader.load('models/coffee_cup_with_plate/scene.gltf', (gltf) => {
			gltf.scene.scale.set(70, 70, 70);
			gltf.scene.position.set(20, 2.6, 60);
			const model = gltf.scene;
			model.castShadow = true;
			model.receiveShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) {
                    if (!(node.material instanceof THREE.MeshStandardMaterial)) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: node.material.color,
                            map: node.material.map,
                            normalMap: node.material.normalMap,
                            metalness: 0.5,
                            roughness: 0.5
                        });
                    }
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
			scene.add(model);
		});
	}	

	function render( time ) {

		time *= 0.001; // convert time to seconds

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();
