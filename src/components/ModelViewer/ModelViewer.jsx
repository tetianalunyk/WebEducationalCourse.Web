import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import * as THREE from 'three';
import { filesService } from '../../services/FilesService';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from './OrbitControls';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './ModelViewer.css';

import Button from '@mui/material/Button';

function Model(props) {
    const { file, chosenCamera, changeCamera } = props;

    let setRightView;
    let setFrontView;
    let setBottomView;
    let setIsoView;
    let setLeftView;
    let setTopView;
    let setRearView;

    let arrowX, arrowZ, arrowY, ellipseX, ellipseY, ellipseZ;
    let scene, camera;
    let mesh;
    let objectCenter = new THREE.Vector3();

    let rotationAxe = false, translationAxe = false;

    const transformationStart = new THREE.Vector2();
    const transformationEnd = new THREE.Vector2();

    const onPointerMove = (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        var mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        var mouseY = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

        transformationEnd.set(mouseX, mouseY);

        const transformationDelta = new THREE.Vector2().copy(transformationEnd).sub(transformationStart);

        if (rotationAxe) {
            const angle = transformationDelta.x > 0 ? -Math.PI / 12 : Math.PI / 12;
            if (rotationAxe === 'Ox') {
                const rotationMatrix = new THREE.Matrix4().setPosition(objectCenter)
                    .multiply(new THREE.Matrix4().makeRotationX(angle))
                    .multiply(new THREE.Matrix4().setPosition(new THREE.Vector3().sub(objectCenter)));
                mesh.applyMatrix4(rotationMatrix);
            } else if (rotationAxe === 'Oy') {
                const rotationMatrix = new THREE.Matrix4().setPosition(objectCenter)
                    .multiply(new THREE.Matrix4().makeRotationY(angle))
                    .multiply(new THREE.Matrix4().setPosition(new THREE.Vector3().sub(objectCenter)));
                mesh.applyMatrix4(rotationMatrix);
            } else {
                const rotationMatrix = new THREE.Matrix4().setPosition(objectCenter)
                    .multiply(new THREE.Matrix4().makeRotationZ(angle))
                    .multiply(new THREE.Matrix4().setPosition(new THREE.Vector3().sub(objectCenter)));
                mesh.applyMatrix4(rotationMatrix);
            }
        } else if (translationAxe) {
            let moveLength = transformationDelta.x > 0 ? 5 : -5;
            if (translationAxe === 'Ox') {
                const translationMatrix = new THREE.Matrix4().makeTranslation(moveLength, 0, 0);
                makeTransformation(translationMatrix);
            } else if (translationAxe === 'Oy') {
                moveLength = transformationDelta.y > 0 ? 5 : -5;
                const translationMatrix = new THREE.Matrix4().makeTranslation(0, moveLength, 0);
                makeTransformation(translationMatrix);
            } else {
                moveLength = transformationDelta.x > 0 ? -5 : 5;
                const translationMatrix = new THREE.Matrix4().makeTranslation(0, 0, moveLength);
                makeTransformation(translationMatrix);
            }
        } else {
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

            const intersects = raycaster.intersectObject(scene, true);

            arrowX.setColor(0xff0000);
            arrowY.setColor(0x00ff00);
            arrowZ.setColor(0x0000ff);
            ellipseX.material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
            ellipseY.material = new THREE.LineBasicMaterial({ color: 0x0000ff });
            ellipseZ.material = new THREE.LineBasicMaterial({ color: 0xff0000 });

            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (object === arrowX.line || object === arrowX.cone) {
                    arrowX.setColor(0xFFEA00);
                } else if (object === arrowY.line || object === arrowY.cone) {
                    arrowY.setColor(0xFFEA00);
                } else if (object === arrowZ.line || object === arrowZ.cone) {
                    arrowZ.setColor(0xFFEA00);
                } else if (object === ellipseX) {
                    ellipseX.material = new THREE.LineBasicMaterial({ color: 0xFFEA00 });
                } else if (object === ellipseY) {
                    ellipseY.material = new THREE.LineBasicMaterial({ color: 0xFFEA00 });
                } else if (object === ellipseZ) {
                    ellipseZ.material = new THREE.LineBasicMaterial({ color: 0xFFEA00 });
                }
            }
        }

        transformationStart.copy(transformationEnd);
    };

    const makeTransformation = (transformationMatrix) => {
        arrowX.applyMatrix4(transformationMatrix);
        arrowY.applyMatrix4(transformationMatrix);
        arrowZ.applyMatrix4(transformationMatrix);
        ellipseX.applyMatrix4(transformationMatrix);
        ellipseY.applyMatrix4(transformationMatrix);
        ellipseZ.applyMatrix4(transformationMatrix);
        mesh.applyMatrix4(transformationMatrix);
        objectCenter.applyMatrix4(transformationMatrix);
    };

    const onClick = (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        var mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        var mouseY = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

        const intersects = raycaster.intersectObject(scene, true);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object === arrowX.line || object === arrowX.cone) {
                const translationMatrix = new THREE.Matrix4().makeTranslation(5, 0, 0);
                makeTransformation(translationMatrix);
            } else if (object === arrowY.line || object === arrowY.cone) {
                const translationMatrix = new THREE.Matrix4().makeTranslation(0, 5, 0);
                makeTransformation(translationMatrix);
            } else if (object === arrowZ.line || object === arrowZ.cone) {
                const translationMatrix = new THREE.Matrix4().makeTranslation(0, 0, 5);
                makeTransformation(translationMatrix);
            } else if (object === ellipseX) {
                const angle = Math.PI / 12;
                const rotationMatrix = new THREE.Matrix4().setPosition(objectCenter)
                    .multiply(new THREE.Matrix4().makeRotationY(angle))
                    .multiply(new THREE.Matrix4().setPosition(new THREE.Vector3().sub(objectCenter)));
                mesh.applyMatrix4(rotationMatrix);
            } else if (object === ellipseY) {
                const angle = Math.PI / 12;
                const rotationMatrix = new THREE.Matrix4().setPosition(objectCenter)
                    .multiply(new THREE.Matrix4().makeRotationX(angle))
                    .multiply(new THREE.Matrix4().setPosition(new THREE.Vector3().sub(objectCenter)));
                mesh.applyMatrix4(rotationMatrix);
            } else if (object === ellipseZ) {
                const angle = Math.PI / 12;
                const rotationMatrix = new THREE.Matrix4().setPosition(objectCenter)
                    .multiply(new THREE.Matrix4().makeRotationZ(angle))
                    .multiply(new THREE.Matrix4().setPosition(new THREE.Vector3().sub(objectCenter)));
                mesh.applyMatrix4(rotationMatrix);
            }
        }
    };

    const onPointerDown = (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        var mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        var mouseY = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

        const intersects = raycaster.intersectObject(scene, true);

        if (intersects.length > 0) {
            debugger;
            const object = intersects[0].object;
            if (object === arrowX.line || object === arrowX.cone) {
                translationAxe = 'Ox';
                transformationStart.set(mouseX, mouseY);
            } else if (object === arrowY.line || object === arrowY.cone) {
                translationAxe = 'Oy';
                transformationStart.set(mouseX, mouseY);
            } else if (object === arrowZ.line || object === arrowZ.cone) {
                translationAxe = 'Oz';
                transformationStart.set(mouseX, mouseY);
            } else if (object === ellipseX) {
                rotationAxe = 'Oy';
                transformationStart.set(mouseX, mouseY);
            } else if (object === ellipseY) {
                rotationAxe = 'Ox';
                transformationStart.set(mouseX, mouseY);
            } else if (object === ellipseZ) {
                rotationAxe = 'Oz';
                transformationStart.set(mouseX, mouseY);
            }
        }
    };

    const onPointerUp = (event) => {
        translationAxe = false;
        rotationAxe = false;
    };

    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight - 90;

    //const aspect = WIDTH / HEIGHT;

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0xDDDDDD, 1);

    const divElem = document.createElement('div');
    divElem.setAttribute('id', 'renderer');
    divElem.appendChild(renderer.domElement);

    const viewer = document.getElementById('viewer');
    const rendererInDom = document.getElementById('renderer');
    if (rendererInDom) {
        viewer.removeChild(rendererInDom);
    }
    viewer.appendChild(divElem);

    scene = new THREE.Scene();

    const light = new THREE.SpotLight();
    light.position.set(200, 200, 200);
    scene.add(light);

    const d = 75;
    const aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
    if (chosenCamera === 'perspective') {
        camera = new THREE.PerspectiveCamera(75, aspect);
    } else {
        camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    }

    camera.position.set(0, 70, 70);
    scene.add(camera);

    const controls = new OrbitControls(camera, renderer.domElement, scene);
    //const controls = new OrbitControls(camera, renderer.domElement);

    setRightView = controls.setRightView;
    setLeftView = controls.setLeftView;
    setFrontView = controls.setFrontView;
    setTopView = controls.setTopView;
    setBottomView = controls.setBottomView;
    setRearView = controls.setRearView;
    setIsoView = controls.setIsoView;

    controls.addEventListener('change', render);
    controls.setIsoView();

    window.addEventListener("resize", function () {
        var height = window.innerHeight - 90;
        var width = window.innerWidth;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    var loader;

    if (file.type === 'application/x-tgif') {
        loader = new OBJLoader();
    }
    else if (file.type === 'application/vnd.ms-pki.stl') {
        loader = new STLLoader();
    } else {
        //navigate('/');
    }

    if (loader) {
        loader.load(URL.createObjectURL(file), function (geometry) {
            var material = new THREE.MeshNormalMaterial({
                flatShading: true
            });

            if (file.type === 'application/x-tgif') {
                mesh = geometry.children[0];
                mesh.material = material;
            }
            else if (file.type === 'application/vnd.ms-pki.stl') {
                mesh = new THREE.Mesh(geometry, material);
            }

            mesh.position.set(0, 0, 0);
            mesh.name = 'modelObject';
            scene.add(mesh);

            controls.setIsoView();

            mesh.geometry.computeBoundingBox();
            mesh.geometry.boundingBox.getCenter(objectCenter);

            // calculate camera distance to object
            const objectSize = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
            const maxDimension = Math.max(objectSize.x, objectSize.y, objectSize.z);

            arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3().copy(objectCenter), maxDimension * 0.7, 0x00ff00);
            arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3().copy(objectCenter), maxDimension * 0.7, 0x0000ff);
            arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3().copy(objectCenter), maxDimension * 0.7, 0xff0000);
            scene.add(arrowX);
            scene.add(arrowZ);
            scene.add(arrowY);

            const curveZ = new THREE.EllipseCurve(0, 0, maxDimension * 0.7, maxDimension * 0.7);

            const pointsZ = curveZ.getPoints(50);
            const geometryZ = new THREE.BufferGeometry().setFromPoints(pointsZ);
            const materialZ = new THREE.LineBasicMaterial({ color: 0x0000ff });

            ellipseZ = new THREE.Line(geometryZ, materialZ);
            ellipseZ.position.z = objectCenter.z;
            ellipseZ.position.x = objectCenter.x;
            ellipseZ.position.y = objectCenter.y;

            scene.add(ellipseZ);

            const curveY = new THREE.EllipseCurve(0, 0, maxDimension * 0.7, maxDimension * 0.7);

            const pointsY = curveY.getPoints(50);
            const geometryY = new THREE.BufferGeometry().setFromPoints(pointsY);
            const materialY = new THREE.LineBasicMaterial({ color: 0xff0000 });

            ellipseY = new THREE.Line(geometryY, materialY);
            ellipseY.position.z = objectCenter.z;
            ellipseY.position.x = objectCenter.x;
            ellipseY.position.y = objectCenter.y;
            ellipseY.rotateY(Math.PI / 2);

            scene.add(ellipseY);

            const curveX = new THREE.EllipseCurve(0, 0, maxDimension * 0.7, maxDimension * 0.7);

            const pointsX = curveX.getPoints(50);
            pointsX.forEach(p => { p.z = -p.y; p.y = 0; });
            const geometryX = new THREE.BufferGeometry().setFromPoints(pointsX);
            const materialX = new THREE.LineBasicMaterial({ color: 0x00ff00 });

            ellipseX = new THREE.Line(geometryX, materialX);
            ellipseX.position.z = objectCenter.z;
            ellipseX.position.x = objectCenter.x;
            ellipseX.position.y = objectCenter.y;

            scene.add(ellipseX);

            renderer.domElement.addEventListener('pointermove', onPointerMove, false);
            renderer.domElement.addEventListener('click', onClick, false);
            //renderer.domElement.addEventListener('pointerup', onPointerUp, false);
            //renderer.domElement.addEventListener('pointerdown', onPointerDown, false);

            function animate() {
                requestAnimationFrame(animate);
            }

            animate();
        });
    }

    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    render();

    return (
        <div className='buttons'>

            {chosenCamera && <Button variant="contained" sx={{ margin: '5px' }} onClick={changeCamera}>
                {chosenCamera}
            </Button>
            }
            <Button variant="contained" sx={{ margin: '5px' }} onClick={setFrontView}>
                Front
            </Button>
            <Button variant="contained" sx={{ margin: '5px' }} onClick={setRearView}>
                Rear
            </Button>
            <Button variant="contained" sx={{ margin: '5px' }} onClick={setRightView}>
                Right
            </Button>
            <Button variant="contained" sx={{ margin: '5px' }} onClick={setLeftView}>
                Left
            </Button>
            <Button variant="contained" sx={{ margin: '5px' }} onClick={setTopView}>
                Top
            </Button>
            <Button variant="contained" sx={{ margin: '5px' }} onClick={setBottomView}>
                Bottom
            </Button>
            <Button variant="contained" sx={{ margin: '5px' }} onClick={setIsoView}>
                Iso
            </Button>
        </div>
    );
}

export default function ModelViewer(props) {
    const [file, setFile] = useState(null);
    const [camera, setCamera] = useState('perspective');
    let { modelId } = useParams();

    const changeCamera = () => {
        camera === 'perspective' ? setCamera('orthographic') : setCamera('perspective');
    };

    useEffect(() => {
        const fetchModel = async () => {
            await filesService.getFileById(modelId)
                .then(data => {
                    setFile(data);
                })
                .catch(err => {

                });
        };

        fetchModel();
    }, [modelId]);

    return (
        <>
            <div id='viewer' className='viewer'>
                <div>
                    {file && <Model file={file} chosenCamera={camera} changeCamera={changeCamera} />}
                </div>
            </div>
        </>
    );

}