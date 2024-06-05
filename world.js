import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import * as THREE from './lib/three.module.js';
// import { OrbitControls } from './lib/OrbitControls.js';
// import { OBJLoader } from '../lib/OBJLoader.js';
// import { MTLLoader } from '../lib/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; 

function main() {

    // SETUP
	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { canvas, antialias: true } );
	
	// Source for next two lines: ChatGPT
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;

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
		const intensity = 1;
		const light = new THREE.AmbientLight(color, intensity);
		scene.add(light);

	}

	{

		const color = 0xFFFFFF;
		const intensity = 1;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set(- 1, 2, 4);
		light.castShadow = true;
		scene.add(light);

	}

	{

		const skyColor = 0xB1E1FF;
        const groundColor = 0xB97A20;
        const intensity = 0.4;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
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
			// texture.wrapS = THREE.RepeatWrapping;
			// texture.wrapT = THREE.RepeatWrapping;
			// texture.minFilter = THREE.LinearMipMapLinearFilter;
			// texture.magFilter = THREE.LinearFilter;
			
			scene.background = texture;
	}

	function makeCone( color, x, y, height, radius ) {

        // Source: ChatGPT, https://threejs.org/manual/#en/primitives

		const material = new THREE.MeshPhongMaterial( { color } );
        const coneGeometry = new THREE.ConeGeometry(radius, height, 32);
		const cone = new THREE.Mesh( coneGeometry, material );
		cone.position.x = x;
		cone.position.y = y;
        scene.add( cone );

		return cone;
        
	}

	function makeCube( color, x, y, width, height, depth ) {

		// Source: https://threejs.org/manual/#en/primitives

		const material = new THREE.MeshPhongMaterial( { color } );
		const boxGeometry = new THREE.BoxGeometry(width, height, depth);
		const cube = new THREE.Mesh( boxGeometry, material );
		cube.position.x = x;
		cube.position.y = y;
		scene.add( cube );

		return cube;

	}

	function makeSphere( color, x, y, radius, width, height ) {

		// Source: ChatGPT, https://threejs.org/manual/#en/primitives

		const material = new THREE.MeshPhongMaterial( { color } );
		const sphereGeometry = new THREE.SphereGeometry(radius, width, height);
		const sphere = new THREE.Mesh( sphereGeometry, material );
		sphere.position.x = x;
		sphere.position.y = y;
		scene.add(sphere);

		return sphere;
	}

    function makeTorus( color, x, y, radius, tubeRadius ) {

        // Source: ChatGPT, https://threejs.org/manual/#en/primitives

		const material = new THREE.MeshPhongMaterial( { color } );
        const torusGeometry = new THREE.TorusGeometry(radius, tubeRadius, 32, 32);
		const torus = new THREE.Mesh( torusGeometry, material );
		torus.position.x = x;
		torus.position.y = y;
        scene.add( torus );

		return torus;

	}

    // Models

	{	// Cat
		const gltfLoader = new GLTFLoader();
		gltfLoader.load('models/sleepycat/scene.gltf', (gltf) => {
			gltf.scene.scale.set(50, 50, 50);
			gltf.scene.position.set(15, 4.3, -50);
			const model = gltf.scene;
			// model.castShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) node.castShadow = true;
            });
			scene.add(model);
		});
    }

	{	// Coffee cup
		const gltfLoader = new GLTFLoader();
		gltfLoader.load('models/coffee_cup/scene.gltf', (gltf) => {
			gltf.scene.scale.set(70, 70, 70);
			gltf.scene.position.set(10, 5.445, 10);
			const model = gltf.scene;
			// model.castShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) node.castShadow = true;
            });
			scene.add(model);
		});
    }

	// {	// Espresso machine
	// 	const gltfLoader = new GLTFLoader();
	// 	gltfLoader.load('models/commercial_coffee_machine/scene.gltf', (gltf) => {
	// 		gltf.scene.scale.set(15, 15, 15);
	// 		gltf.scene.position.set(-20, 12.9, -50);
	// 		const model = gltf.scene;
	// 		model.castShadow = true;
	// 		gltf.scene.traverse((node) => {
    //             if (node.isMesh) node.castShadow = true;
    //         });
	// 		scene.add(model);
	// 	});
    // }

	{	// Newspaper
		const gltfLoader = new GLTFLoader();
		gltfLoader.load('models/folded_newspaper/scene.gltf', (gltf) => {
			gltf.scene.scale.set(0.9, 0.9, 0.9);
			gltf.scene.position.set(20, 2.8, -10);
			gltf.scene.rotation.set(0, 15, 0);
			const model = gltf.scene;
			// model.castShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) node.castShadow = true;
            });
			scene.add(model);
		});
    }

	{	// Bagel
		const gltfLoader = new GLTFLoader();
		gltfLoader.load('models/sesame_bagel/scene.gltf', (gltf) => {
			gltf.scene.scale.set(5, 5, 5);
			gltf.scene.position.set(20, 4.3, -30);
			// gltf.scene.rotation.set(20, 0, 0);
			const model = gltf.scene;
			// model.castShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) node.castShadow = true;
            });
			scene.add(model);
		});
    }

	{	// Pastry plate
		const gltfLoader = new GLTFLoader();
		gltfLoader.load('models/pastries/scene.gltf', (gltf) => {
			gltf.scene.scale.set(20, 20, 20);
			gltf.scene.position.set(4, 5, 32);
			const model = gltf.scene;
			// model.castShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) node.castShadow = true;
            });
			scene.add(model);
		});
	}

	{	// Coffee cake
		const gltfLoader = new GLTFLoader();
		gltfLoader.load('models/coffee_cake/scene.gltf', (gltf) => {
			gltf.scene.scale.set(2, 2, 2);
			gltf.scene.position.set(27, 2, -1);
			const model = gltf.scene;
			// model.castShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) node.castShadow = true;
            });
			scene.add(model);
		});
	}

	// {	// Matcha powder bag
	// 	const gltfLoader = new GLTFLoader();
	// 	gltfLoader.load('models/matcha_bag/scene.gltf', (gltf) => {
	// 		gltf.scene.scale.set(70, 70, 70);
	// 		gltf.scene.position.set(-20, 10, -30);
	// 		const model = gltf.scene;
	// 		// model.castShadow = true;
	// 		gltf.scene.traverse((node) => {
    //             if (node.isMesh) node.castShadow = true;
    //         });
	// 		scene.add(model);
	// 	});
	// }

	// {	// Coffee beans
	// 	const gltfLoader = new GLTFLoader();
	// 	gltfLoader.load('models/coffee_beans/scene.gltf', (gltf) => {
	// 		gltf.scene.scale.set(50, 50, 50);
	// 		gltf.scene.position.set(0, 3, -30);
	// 		const model = gltf.scene;
	// 		// model.castShadow = true;
	// 		gltf.scene.traverse((node) => {
    //             if (node.isMesh) node.castShadow = true;
    //         });
	// 		scene.add(model);
	// 	});
	// }

	{	// Coffee cup blue
		const gltfLoader = new GLTFLoader();
		gltfLoader.load('models/coffee_cup_with_plate/scene.gltf', (gltf) => {
			gltf.scene.scale.set(70, 70, 70);
			gltf.scene.position.set(20, 2.6, 50);
			const model = gltf.scene;
			// model.castShadow = true;
			gltf.scene.traverse((node) => {
                if (node.isMesh) node.castShadow = true;
            });
			scene.add(model);
		});
	}

	

	function render( time ) {

		time *= 0.001; // convert time to seconds

		// shapes.forEach( ( cube, ndx ) => {

		// 	const speed = 1 + ndx * .1;
		// 	const rot = time * speed;
		// 	cube.rotation.x = rot;
		// 	cube.rotation.y = rot;

		// } );

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();
