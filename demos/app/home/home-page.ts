import { Renderer } from "nativescript-three";
import {
  WebGLRenderer,
  MeshNormalMaterial,
  Scene,
  PerspectiveCamera,
  Geometry,
  Vector3,
  LineBasicMaterial,
  Line,
  Color,
  BoxGeometry,
  
  CubicBezierCurve,

  CylinderGeometry,
  ConeGeometry,
  ConeBufferGeometry,
  CircleGeometry,
  CircleBufferGeometry,
  
  SphereBufferGeometry,

  ParametricGeometry,
  ParametricBufferGeometry,
  
  OctahedronGeometry,

  MeshBasicMaterial,
  Mesh,
  TorusGeometry,
  MeshPhongMaterial,
  DodecahedronGeometry,
  MeshLambertMaterial,
  PointLight,
  Vector4,
  OrthographicCamera,
  AmbientLight,
  SpotLight,
  BoxBufferGeometry,
  BasicShadowMap,
  
  DirectionalLight,
  DirectionalLightHelper,
  
  HemisphereLight,
  HemisphereLightHelper,
  
  
  PlaneBufferGeometry,
  PlaneGeometry,
  MeshStandardMaterial,
  DoubleSide,
  CameraHelper,
  Vector2,
  TextureLoader,
  RepeatWrapping,
  CubeCamera,
  LinearMipmapLinearFilter,
  IcosahedronBufferGeometry,
  Float32BufferAttribute,
  Fog,
  Clock,

  GridHelper,
  sRGBEncoding,
  CubeTextureLoader,
  LinearFilter,
  ShaderMaterial,
  BufferGeometry,
  BufferAttribute,
  Points,
  Frustum,
  Matrix4,
  UnsignedByteType,
  ACESFilmicToneMapping,
  PMREMGenerator,
  MeshPhysicalMaterial,
  LoopOnce,
  AnimationMixer,
  LoopRepeat,
} from "three";

let canvas;

import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { HomeViewModel } from "./home-view-model";
import { Sky } from "../assets/jsm/objects/Sky";
import { Water } from "../assets/jsm/objects/Water";
import { OrbitControls } from "../assets/jsm/controls/OrbitControls";
import { FirstPersonControls } from "../assets/jsm/controls/FirstPersonControls";
import { GLTFLoader } from "../assets/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "../assets/jsm/loaders/DRACOLoader";
import { RGBELoader } from "../assets/jsm/loaders/RGBELoader";
import { TypedArrayUtils } from "../assets/jsm/utils/TypedArrayUtils";



export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;

    page.bindingContext = new HomeViewModel();
}

export function pageLoaded(args) {
    const page = args.object;
}

class IconMesh extends Mesh {
    constructor() {
        super(new BoxBufferGeometry(5.0, 5.0, 5.0), new MeshNormalMaterial());
    }
}

declare var java;

export function loaded(args) {
    console.log("loaded", args.object);
}
export function unloaded(args) {
    console.log("unloaded");
}

export function canvasLoaded(args) {
  
  canvas = args.object;

  // threeDepth(args);

  //threeCrate(args);
  //skinningAndMorphing(args);
  //nearestNeighbour(args);
  //threeOcean(args);
  //threeCube(args);

  //threeCar(args);
  
  //threeOcean(args)
  
  myWorld(args)
  
}

var root = "~/";


var myWorld = function (args) {
  
    var camera, scene, renderer;
    var geometry, material, mesh;
    var cylinder;
    var moonObj, gC, mC;
    var meshes = [];
    var materials = []
    var colors = []
    var mL = 20;
    var light;
    var crve, pts, gP, mP, crveObj;
    var gT, mT, tors;
    var sky, sunSphere, uniforms;
  
    var duTx1, duTx2, duTx3;
  
    var effectController = {
        turbidity: 10,
        rayleigh: 2,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.8,
        luminance: 1,
        inclination: 0.49, // elevation / inclination
        azimuth: 0.25, // Facing front,
        sun: ! true
    };  
  
    var uniforms;
    var distance = 400000;
    var controls;
    var water, waterGeometry;
    var moonTx;
    var groundTx, groundM, ground;
    var cirK = 0;
  
    var hemiLight,  hemiLightHelper; 
    var dirLight, dirLightHelper
    
    var bulbGeometry, bulbLight, bulbMat;
    
  
    init();
    animate();
  
    function init() {
      
        // Canvas
        canvas = args.object;
        const context = canvas.getContext("webgl");
      
        // Camera
        // 1 - Field Of View in deg
        // 2 - Aspect Ratio
        // 3 - Near
        // 4 - Far clipping plan
        camera = new PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        camera.position.z = 3;

        // Scene
        scene = new Scene();
        scene.background = new Color(0x000000);
        scene.fog = new Fog(0x000000, 20, 100);
      
        // Light
        dirLight = new DirectionalLight( 0xffffff, 1 );
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set( - 1, 1.75, 1 );
        dirLight.position.multiplyScalar( 30 );
        scene.add( dirLight );

        dirLight.castShadow = true;

        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;  
      
        var d = 50;

        dirLight.shadow.camera.left = - d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = - d;

        dirLight.shadow.camera.far = 3500;
        dirLight.shadow.bias = - 0.0001;

        dirLightHelper = new DirectionalLightHelper( dirLight, 10 );
        scene.add( dirLightHelper );      
      
      
        hemiLight = new HemisphereLight( 0xffffff, 0xffffff, 0.6 );
        hemiLight.color.setHSL( 0.6, 1, 0.6 );
        hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        hemiLight.position.set( 0, 50, 0 );
        scene.add( hemiLight );

        hemiLightHelper = new HemisphereLightHelper( hemiLight, 10 );
        scene.add( hemiLightHelper );      
      
      
      
        // Add Sky
        sky = new Sky();
        sky.scale.setScalar( 450000 );
        scene.add( sky );
      
        // - Sun - Helper
        sunSphere = new Mesh(
            new SphereBufferGeometry( 20000, 16, 8 ),
            new MeshBasicMaterial( { color: 0xffffff } )
        );
      
        sunSphere.position.y = - 700000;
        sunSphere.visible = false;
        scene.add( sunSphere );      
      
        uniforms = sky.material.uniforms;
        // 10; 2; 0.005; 0.8; 1; 0.49; 0.25
        uniforms[ "turbidity" ].value = 10;
        uniforms[ "rayleigh" ].value = 2;
        uniforms[ "mieCoefficient" ].value = 0.005;
        uniforms[ "mieDirectionalG" ].value = 0.8;
        uniforms[ "luminance" ].value = 1;
      
        var theta = Math.PI * ( effectController.inclination - 0.5 );
        var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

        sunSphere.position.x = distance * Math.cos( phi );
        sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
        sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );      
      
        uniforms[ "sunPosition" ].value.copy( sunSphere.position );
      
      
        //----------------------------------------
        // TEXTURES
      
        // Moon
        moonTx = new TextureLoader().load(  root + "assets/txs/moon.png" );
        moonTx.wrapS = RepeatWrapping;
        moonTx.wrapT = RepeatWrapping;
        moonTx.repeat.set( 2, 2 );
      
        // Dunes
        duTx1 = new TextureLoader().load(  root + "assets/planes/dunes1.png" );
        duTx1.wrapS = RepeatWrapping;
        duTx1.wrapT = RepeatWrapping;
        duTx1.repeat.set( 2, 2 );    
        // Dunes
        duTx2 = new TextureLoader().load(  root + "assets/planes/plane1.png" );
        duTx2.wrapS = RepeatWrapping;
        duTx2.wrapT = RepeatWrapping;
        duTx2.repeat.set( 2, 2 );    
        // Dunes
        duTx3 = new TextureLoader().load(  root + "assets/planes/map12.png" );
        duTx3.wrapS = RepeatWrapping;
        duTx3.wrapT = RepeatWrapping;
        duTx3.repeat.set( 2, 2 );    
        
        // torus or triangle 
        gT = new TorusGeometry( 1.6, 0.05, 16, 18, 6.3 );
        mT = new MeshBasicMaterial({ map: duTx3 } );
        tors = new Mesh( gT, mT );
        scene.add( tors );     
      
      
        // Bulb
        bulbGeometry = new SphereBufferGeometry( 0.02, 16, 8 );
        bulbLight = new PointLight( 0xffee88, 1, 100, 2 );

        bulbMat = new MeshStandardMaterial( {
            emissive: 0xffffee,
            emissiveIntensity: 1,
            color: 0x000000
        } );
        bulbLight.add( new Mesh( bulbGeometry, bulbMat ) );
        bulbLight.position.set( 0, 0.1, 0 );
        bulbLight.castShadow = true;
      
        scene.add( bulbLight );      
      
      
        // ground
        groundTx = new TextureLoader().load( root + "assets/planes/map6.png");
        groundTx.wrapS = RepeatWrapping;
        groundTx.wrapT = RepeatWrapping;
        //groundTx.repeat.set( 25,25 );
        groundTx.anisotropy = 4;
        groundTx.repeat.set( 10, 10 );
        groundTx.encoding = sRGBEncoding;
      
        groundM = new MeshStandardMaterial( { 
          roughness: 0.8,
          color: 0xffffff,
          metalness: 0.2,
          bumpScale: 0.0005,
          map: groundTx 
        } );      
      
        ground = new Mesh( new PlaneGeometry( 250, 250 ), groundM );
        ground.position.y = - 10;
        ground.rotation.x = - Math.PI / 2;
        ground.receiveShadow = true;
      
        scene.add( ground );    
      
        // Octahedron aka moonObj
        gC = new OctahedronGeometry( 0.55, 3 );
        //mC = new MeshBasicMaterial( {color: 0xffff00} );
        mC = new MeshBasicMaterial({ map: duTx2 } );
        moonObj = new Mesh( gC, mC ); 
        scene.add( moonObj );    
      
        // squares
        for(var i=0; i<mL; i++) {
          var geometry = new BoxGeometry(0.08, 0.08, 0.5+Math.random()*4);
          colors.push({color:1000+Math.random()*999999999})
          
          //materials.push(new MeshBasicMaterial(colors[i]))
          //materials.push(new MeshNormalMaterial())
          materials.push(new MeshBasicMaterial({ map: duTx1 } ))
          
          var r  = new Mesh(geometry, materials[i]);
          r["sX"] = i*0.002;
          r["sY"] = Math.random()*0.05;
          r["sZ"] = Math.random()*0.01;
          r.position.y = 0.25 + i*0.35
          meshes.push(r);
          scene.add(r);
        }
        renderer = new WebGLRenderer({ context, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
      
    }
    function animate() {
        requestAnimationFrame(animate);
        for(var i=0; i<mL; i++) {
          var r = meshes[i];
          r.rotation.x += r.sX;
          r.rotation.y += r.sY;
          r.rotation.z += r.sZ;
        }

        cirK += 0.005;
        moonObj.position.y = Math.sin(cirK)*2
        moonObj.rotation.y += 0.02
        tors.rotation.x += 0.015
        tors.rotation.y += 0.002
        tors.rotation.z += 0.005
      
        renderer.render(scene, camera);
      
        camera.position.x = 1.5 + Math.sin(cirK)*1.2
        camera.position.z = 1.5 + Math.cos(cirK)*1.2
        camera.lookAt(moonObj.position.x, moonObj.position.y, moonObj.position.z);
      
        canvas.flush();
    }
};

var threeCube = function (args) {
    var camera, scene, renderer;
    var geometry, material, mesh;

    init();
    animate();

    function init() {
        canvas = args.object;
        const context = canvas.getContext("webgl");

        camera = new PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.01,
            1000
        );
        camera.position.z = 1;

        scene = new Scene();

        geometry = new BoxGeometry(0.2, 0.2, 0.2);
        material = new MeshNormalMaterial();

        mesh = new Mesh(geometry, material);
        scene.add(mesh);

        renderer = new WebGLRenderer({ context, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);

        mesh.rotation.x += 0.01;

        renderer.render(scene, camera);

        canvas.flush();
    }
  
  
};

var animationKkinningblending = function (args) {
    canvas = args.object;
    const context = canvas.getContext("webgl") as any;
};

var threeCar = function (args) {
    canvas = args.object;
    const context = canvas.getContext("webgl") as any;
    var camera, scene, renderer;
    var stats, carModel, materialsLib;

    var bodyMatSelect = {
        selectedIndex: 0,
    };
    var rimMatSelect = {
        selectedIndex: 0,
    };
    var glassMatSelect = {
        selectedIndex: 0,
    };

    var carParts = {
        body: [],
        rims: [],
        glass: [],
    };

    var grid,
        wheels = [];

    function init() {
        camera = new PerspectiveCamera(
            40,
            window.innerWidth / window.innerHeight,
            0.1,
            200
        );

        scene = new Scene();
        // scene.fog = new THREE.Fog( 0xd7cbb1, 1, 80 );

        new RGBELoader()
            .setDataType(UnsignedByteType)
            .setPath(root + "assets/textures/equirectangular/")
            .load("quarry_01_1k.hdr", function (texture) {
                var envMap = pmremGenerator.fromEquirectangular(texture)
                    .texture;
                pmremGenerator.dispose();

                scene.background = envMap;
                scene.environment = envMap;

                //

                initCar();
                initMaterials();
                initMaterialSelectionMenus();


                /*   function doRender(){
                            requestAnimationFrame(doRender)
                            render()
                        }
                       setTimeout(()=>{
                           console.log('render??')

                        requestAnimationFrame(doRender)
                       },5000)*/
            });


        var ground = new Mesh(
            new PlaneBufferGeometry(400, 400),
            new MeshBasicMaterial({ color: 0x6e6a62, depthWrite: false })
        );

        ground.rotation.x = -Math.PI / 2;
        ground.renderOrder = 1;
        scene.add(ground);


        grid = new GridHelper(400, 80, 0x000000, 0x000000);
        grid.material.opacity = 0.1;
        grid.material.depthWrite = false;
        grid.material.transparent = true;
        scene.add(grid);


        renderer = new WebGLRenderer({ context, antialias: true });

        renderer.setPixelRatio(window.devicePixelRatio);

        renderer.setSize(window.innerWidth, window.innerHeight);

        console.log(window.innerWidth, window.innerHeight);


        renderer.outputEncoding = sRGBEncoding;
        renderer.toneMapping = ACESFilmicToneMapping;

        var pmremGenerator = new PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();


        /*stats = new Stats();
				container.appendChild( stats.dom );
*/
        window.addEventListener("resize", onWindowResize, false);

        renderer.setAnimationLoop(render);

    }

    function initCar() {
        // TODO support this
        var dracoLoader = new DRACOLoader();
        //dracoLoader.setDecoderPath( root + 'js/libs/draco/gltf/' );
        // dracoLoader.setDecoderConfig({ type: 'js' });

        var loader = new GLTFLoader();
        //loader.setDRACOLoader( dracoLoader );



        loader.load(
            root + "models/gltf/ferrari.glb",
            function (gltf) {


                carModel = gltf.scene.children[0];

                // shadow
                var texture = new TextureLoader().load(
                    root + "models/gltf/ferrari_ao.png"
                );
                var shadow = new Mesh(
                    new PlaneBufferGeometry(0.655 * 4, 1.3 * 4),
                    new MeshBasicMaterial({
                        map: texture,
                        opacity: 0.7,
                        transparent: true,
                    })
                );
                shadow.rotation.x = -Math.PI / 2;
                shadow.renderOrder = 2;
                carModel.add(shadow);

                scene.add(carModel);

                // car parts for material selection
                carParts.body.push(carModel.getObjectByName("body"));
                carParts.rims.push(
                    carModel.getObjectByName("rim_fl"),
                    carModel.getObjectByName("rim_fr"),
                    carModel.getObjectByName("rim_rr"),
                    carModel.getObjectByName("rim_rl"),
                    carModel.getObjectByName("trim")
                );

                carParts.glass.push(carModel.getObjectByName("glass"));

                wheels.push(
                    carModel.getObjectByName("wheel_fl"),
                    carModel.getObjectByName("wheel_fr"),
                    carModel.getObjectByName("wheel_rl"),
                    carModel.getObjectByName("wheel_rr")
                );

                updateMaterials();
            },
            null,
            (e) => {
                console.log("model load error", e);
            }
        );
    }

    function initMaterials() {
        materialsLib = {
            main: [
                new MeshStandardMaterial({
                    color: 0xff4400,
                    metalness: 1.0,
                    roughness: 0.2,
                    name: "orange",
                }),
                new MeshStandardMaterial({
                    color: 0x001166,
                    metalness: 1.0,
                    roughness: 0.2,
                    name: "blue",
                }),
                new MeshStandardMaterial({
                    color: 0x990000,
                    metalness: 1.0,
                    roughness: 0.2,
                    name: "red",
                }),
                new MeshStandardMaterial({
                    color: 0x000000,
                    metalness: 1.0,
                    roughness: 0.4,
                    name: "black",
                }),
                new MeshStandardMaterial({
                    color: 0xffffff,
                    metalness: 0.1,
                    roughness: 0.2,
                    name: "white",
                }),
                new MeshStandardMaterial({
                    color: 0xffffff,
                    metalness: 1.0,
                    roughness: 0.2,
                    name: "metallic",
                }),
            ],

            glass: [
                new (MeshPhysicalMaterial as any)({
                    color: 0xffffff,
                    metalness: 0,
                    roughness: 0,
                    transparency: 1.0,
                    transparent: true,
                    name: "clear",
                }),
                new (MeshPhysicalMaterial as any)({
                    color: 0x000000,
                    metalness: 0,
                    roughness: 0,
                    transparency: 0.7,
                    transparent: true,
                    name: "smoked",
                }),
                new (MeshPhysicalMaterial as any)({
                    color: 0x001133,
                    metalness: 0,
                    roughness: 0,
                    transparency: 0.7,
                    transparent: true,
                    name: "blue",
                }),
            ],
        };
    }

    function initMaterialSelectionMenus() {
        function addOption(name, menu) {
            var option = document.createElement("option");
            option.text = name;
            option.value = name;
            //menu.add( option );
        }

        materialsLib.main.forEach(function (material) {
            addOption(material.name, bodyMatSelect);
            addOption(material.name, rimMatSelect);
        });

        materialsLib.glass.forEach(function (material) {
            addOption(material.name, glassMatSelect);
        });

        bodyMatSelect.selectedIndex = 2;
        rimMatSelect.selectedIndex = 5;
        glassMatSelect.selectedIndex = 0;

        //	bodyMatSelect.addEventListener( 'change', updateMaterials );
        //	rimMatSelect.addEventListener( 'change', updateMaterials );
        //	glassMatSelect.addEventListener( 'change', updateMaterials );
    }

    // set materials to the current values of the selection menus
    function updateMaterials() {
        var bodyMat = materialsLib.main[bodyMatSelect.selectedIndex];
        var rimMat = materialsLib.main[rimMatSelect.selectedIndex];
        var glassMat = materialsLib.glass[glassMatSelect.selectedIndex];

        carParts.body.forEach((part) => (part.material = bodyMat));
        carParts.rims.forEach((part) => (part.material = rimMat));
        carParts.glass.forEach((part) => (part.material = glassMat));
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function render() {
        var time = -performance.now() / 1000;

        camera.position.x = Math.cos(time / 10) * 6;
        camera.position.y = 1.5;
        camera.position.z = Math.sin(time / 10) * 6;
        camera.lookAt(0, 0.5, 0);

        for (var i = 0; i < wheels.length; i++) {
            wheels[i].rotation.x = time * Math.PI;
        }

        grid.position.z = -time % 5;

        renderer.render(scene, camera);
        //	stats.update();
        canvas.flush();
    }

    init();
};








