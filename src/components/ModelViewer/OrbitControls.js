import {
    EventDispatcher,
    MOUSE,
    Quaternion,
    Spherical,
    Mesh,
    MeshBasicMaterial,
    SphereGeometry,
    Raycaster,
    Vector2,
    Vector3,
    Matrix4
} from 'three';

// OrbitControls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

class OrbitControls extends EventDispatcher {

    constructor(camera, domElement, scene) {

        super();

        this.camera = camera;
        this.domElement = domElement;
        this.scene = scene;

        // Calculate the initial eye, target, and up vectors
        //const eye = new Vector3(0, top, front);
        this.target = new Vector3(0, 0, 0);
        this.up = new Vector3(0, 1, 0);

        this.draggingObj = {};

        // set camera position and rotation
        // camera.position.set(eye.x, eye.y, eye.z);
        // camera.lookAt(target);
        this.camera.up.set(this.up.x, this.up.y, this.up.z);

        this.domElement.style.touchAction = 'none'; // disable touch scroll
        const panStart = new Vector2();
        const panEnd = new Vector2();
        const panDelta = new Vector2();

        const orbitStart = new Vector2();
        const orbitEnd = new Vector2();

        let isPanEnabled = false;
        let isRotateEnabled = false;

        const scope = this;

        this.setFrontView = function () {
            scope.object = scope.scene.getObjectByName('modelObject');
            if (!scope.object) {
                return false;
            }

            const pointer = scope.scene.getObjectByName('POINTER_NAME');
            if (pointer) {
                scope.scene.remove(pointer);
            }

            const objectCenter = new Vector3();
            scope.object.geometry.computeBoundingBox();
            scope.object.geometry.boundingBox.getCenter(objectCenter);

            scope.target = objectCenter;

            // calculate camera distance to object
            const objectSize = scope.object.geometry.boundingBox.getSize(new Vector3());
            const maxDimension = Math.max(objectSize.x, objectSize.y, objectSize.z);
            const fov = scope.camera.isOrthographicCamera ? scope.camera.top : scope.camera.fov;
            const distance = maxDimension / (2 * Math.tan(fov * Math.PI / 360));
            const front = objectCenter.z + distance;

            //const eye = new Vector3(objectCenter.x, objectCenter.y, front);
            scope.camera.position.set(objectCenter.x, objectCenter.y, front + objectSize.z);
            scope.camera.lookAt(scope.target);
            scope.camera.up.set(scope.up.x, scope.up.y, scope.up.z);

            return true;
        }

        this.setRightView = function () {
            if (!scope.setFrontView()) {
                return;
            }
            const point = new Vector3(scope.target.x, scope.target.y, scope.target.z);

            const angle = Math.PI / 2;
            const rotationMatrix = new Matrix4().setPosition(point)
                .multiply(new Matrix4().makeRotationY(angle))
                .multiply(new Matrix4().setPosition(new Vector3().sub(point)));

            scope.camera.position.applyMatrix4(rotationMatrix);
            scope.camera.lookAt(scope.target);

        }

        this.setLeftView = function () {
            if (!scope.setFrontView()) {
                return;
            }
            const point = new Vector3(scope.target.x, scope.target.y, scope.target.z);

            const angle = Math.PI * 3 / 2;
            const rotationMatrix = new Matrix4().setPosition(point)
                .multiply(new Matrix4().makeRotationY(angle))
                .multiply(new Matrix4().setPosition(new Vector3().sub(point)));

            scope.camera.position.applyMatrix4(rotationMatrix);
            scope.camera.lookAt(scope.target);
        }

        this.setTopView = function () {
            if (!scope.setFrontView()) {
                return;
            }
            const point = new Vector3(scope.target.x, scope.target.y, scope.target.z);

            const angle = Math.PI * 3 / 2;
            const rotationMatrix = new Matrix4().setPosition(point)
                .multiply(new Matrix4().makeRotationX(angle))
                .multiply(new Matrix4().setPosition(new Vector3().sub(point)));

            scope.camera.position.applyMatrix4(rotationMatrix);
            scope.camera.lookAt(scope.target);
        }

        this.setBottomView = function () {
            if (!scope.setFrontView()) {
                return;
            }
            const point = new Vector3(scope.target.x, scope.target.y, scope.target.z);

            const angle = Math.PI / 2;
            const rotationMatrix = new Matrix4().setPosition(point)
                .multiply(new Matrix4().makeRotationX(angle))
                .multiply(new Matrix4().setPosition(new Vector3().sub(point)));

            scope.camera.position.applyMatrix4(rotationMatrix);
            scope.camera.lookAt(scope.target);
        }

        this.setRearView = function () {
            if (!scope.setFrontView()) {
                return;
            }
            const point = new Vector3(scope.target.x, scope.target.y, scope.target.z);

            const angle = Math.PI;
            const rotationMatrix = new Matrix4().setPosition(point)
                .multiply(new Matrix4().makeRotationY(angle))
                .multiply(new Matrix4().setPosition(new Vector3().sub(point)));

            scope.camera.position.applyMatrix4(rotationMatrix);
            scope.camera.lookAt(scope.target);
        }

        this.setIsoView = function () {
            if (!scope.setFrontView()) {
                return;
            }
            const point = new Vector3(scope.target.x, scope.target.y, scope.target.z);

            const angle = Math.PI / 6;
            const rotationMatrix = new Matrix4().setPosition(point)
                .multiply(new Matrix4().makeRotationY(angle * 3 / 2))
                .multiply(new Matrix4().makeRotationX(-angle))
                .multiply(new Matrix4().setPosition(new Vector3().sub(point)));

            scope.camera.position.applyMatrix4(rotationMatrix);
            scope.camera.lookAt(scope.target);
        }

        function handleMouseMovePan(event) {
            panEnd.set(event.clientX, event.clientY);

            panDelta.subVectors(panEnd, panStart);

            const element = scope.domElement;
            const offset = new Vector3();
            if (scope.camera.isPerspectiveCamera) {

                // perspective
                const position = scope.camera.position;
                offset.copy(position).sub(scope.target);
                let targetDistance = offset.length();

                // half of the fov is center to top of screen
                targetDistance *= Math.tan((scope.camera.fov / 2) * Math.PI / 180.0);

                // we use only clientHeight here so aspect ratio does not distort speed
                const v = new Vector3();

                v.setFromMatrixColumn(scope.camera.matrix, 0); // get X column of objectMatrix
                v.multiplyScalar(- (2 * panDelta.x * targetDistance / element.clientHeight));

                scope.target.add(v);
                scope.camera.position.add(v);

                const u = new Vector3();

                u.setFromMatrixColumn(scope.camera.matrix, 1);
                u.multiplyScalar(2 * panDelta.y * targetDistance / element.clientHeight);

                scope.target.add(u);
                scope.camera.position.add(u);

            } else if (scope.camera.isOrthographicCamera) {

                // orthographic
                const v = new Vector3();

                v.setFromMatrixColumn(scope.camera.matrix, 0); // get X column of objectMatrix
                v.multiplyScalar(- (panDelta.x * (scope.camera.right - scope.camera.left) / scope.camera.zoom / element.clientWidth));

                scope.target.add(v);
                scope.camera.position.add(v);

                const u = new Vector3();

                u.setFromMatrixColumn(scope.camera.matrix, 1);
                u.multiplyScalar(panDelta.y * (scope.camera.top - scope.camera.bottom) / scope.camera.zoom / element.clientHeight);

                scope.target.add(u);
                scope.camera.position.add(u);

            }

            panStart.copy(panEnd);
            scope.camera.lookAt(scope.target);

        }

        function convertCoordinates(x, y) {
            const rect = scope.domElement.getBoundingClientRect();
            var mouseX = ((x - rect.left) / rect.width) * 2 - 1;
            var mouseY = - ((y - rect.top) / rect.height) * 2 + 1;
            var point = new Vector2(mouseX, mouseY);

            return point;
        }

        function handleMouseMoveRotate(event) {
            const point = convertCoordinates(event.clientX, event.clientY);

            orbitEnd.set(point.x, point.y);

            // Define vectors a and b in the local coordinate system of the sphere
            var a = targetPlaneToSphere(orbitStart);
            var b = targetPlaneToSphere(orbitEnd);

            // Compute the angle between a and b
            var angle = Math.acos(a.dot(b));

            // Multiply a and b to produce the axis of rotation
            var axis = new Vector3();
            axis.crossVectors(b, a).normalize();
            
            // Transform axis from LCS to WCS
            var toWorldCameraSpace = scope.camera.modelViewMatrix.transpose();
            var axisWCS = axis.applyMatrix4(toWorldCameraSpace);

            // Calculate the orbit matrix
            var orbitMatrix = new Matrix4().makeRotationAxis(axisWCS, angle);
            // Apply the orbit matrix to the sphere
            //scope.camera.position.applyMatrix4(orbitMatrix);
            var tttt = new Vector3().copy(scope.camera.position).sub(scope.target).applyMatrix4(orbitMatrix).add(scope.target);
            scope.camera.position.set(tttt.x, tttt.y, tttt.z);

            //scope.camera.up.applyMatrix4(orbitMatrix);

            orbitStart.copy(orbitEnd);

            scope.camera.lookAt(scope.target);
        }

        function targetPlaneToSphere(point) {
            const vec = new Vector3();
            if (point.length() >= 1.0) {
                point.normalize();
                vec.set(point.x, point.y, 0.0);
            } else {
                const z = Math.sqrt(1.0 - Math.pow(point.x, 2) - Math.pow(point.y, 2));
                vec.set(point.x, point.y, z * -1);
            }

            return vec;
        }

        function moveRaycaster(x, y) {
            const raycaster = new Raycaster();
            raycaster.setFromCamera(new Vector2(x, y), scope.camera);
            const intersects = raycaster.intersectObject(
                scope.scene.getObjectByName("modelObject")
            );

            let pointer = scope.scene.getObjectByName("POINTER_NAME");
            if (intersects.length > 0) {

                if (!pointer) {
                    const pointSize = intersects[0].object.geometry.boundingSphere.radius / 200;
                    pointer = new Mesh(
                        new SphereGeometry(pointSize),
                        new MeshBasicMaterial({
                            color: 0xff0000,
                        })
                    );

                    pointer.name = "POINTER_NAME";
                }

                pointer.position.copy(intersects[0].point);
                scope.target.copy(pointer.position);
                scope.scene.add(pointer);
                scope.camera.lookAt(pointer.position.x, pointer.position.y, pointer.position.z)
            } else if (pointer) {
                scope.scene.remove(pointer);
            }

        }

        function zoomCamera(delta, step = 0.5) {

            if (delta > 0) {

                const currentZoom = parseFloat(scope.camera.zoom.toFixed(4));

                if (currentZoom > step) {

                    scope.camera.zoom -= step;

                }

            } else {

                scope.camera.zoom += step;

            }

            scope.camera.updateProjectionMatrix();

            let direction = new Vector3();

            scope.camera.getWorldDirection(direction);


            let pointer = scope.scene.getObjectByName("POINTER_NAME");
            if (pointer) {
                scope.camera.lookAt(
                    pointer.position.x,
                    pointer.position.y,
                    pointer.position.z
                );
            }
        }

        function onMouseMove(event) {
            if (isRotateEnabled) {
                handleMouseMoveRotate(event);
            } else if (isPanEnabled) {
                handleMouseMovePan(event);
            }
        }

        function onMouseDown(event) {

            const point = convertCoordinates(event.clientX, event.clientY);
            moveRaycaster(point.x, point.y);

            if (event.button === 0) {
                let pointer = scope.scene.getObjectByName("POINTER_NAME");
                if (pointer) {
                    isRotateEnabled = true;
                }
            } else if (event.button === 2) {
                isPanEnabled = true;
            }

            panStart.set(event.clientX, event.clientY);
            orbitStart.set(point.x, point.y);
        }

        function onMouseWheel(event) {
            zoomCamera(event.deltaY);
            // set the scaling factor
            //const scale = event.deltaY < 0 ? 0.1 : -0.1; // adjust as needed
            // const scale = event.deltaY < 0 ? 0.9 : 1.1; // adjust as needed

            // // create a raycaster object
            // const raycaster = new Raycaster();

            // // set the raycaster's origin to the camera's position
            // //raycaster.ray.origin.copy(scope.camera.position);

            // // get the normalized device coordinates (-1 to +1) from the clientX and clientY positions
            // const mouse = new Vector2();
            // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // // set the raycaster's direction based on the mouse position
            // //raycaster.ray.direction.set(mouse.x, mouse.y, 0.5).unproject(scope.camera).sub(scope.camera.position).normalize();
            // raycaster.setFromCamera(new Vector2(mouse.x, mouse.y), scope.camera);

            // // get an array of intersections between the ray and the scene objects
            // const intersects = raycaster.intersectObject(scope.object);

            // let pointToZoom = new Vector3(0, 0, 0);
            // // if there is at least one intersection, get the coordinates of the first one
            // if (intersects.length > 0) {
            //     const point = intersects[0].point;
            //     console.log(`3D point: x=${point.x}, y=${point.y}, z=${point.z}`);
            //     pointToZoom = new Vector3(point.x, point.y, point.z);
            // }

            // debugger;

            // // create a translation matrix to move the camera to the target point
            // const translationMatrix = new Matrix4().makeTranslation(pointToZoom.x, pointToZoom.y, pointToZoom.z);

            // // create a scaling matrix to zoom in on the target point
            // const scalingMatrix = new Matrix4().makeScale(scale, scale, scale);

            // // multiply the translation matrix and the scaling matrix to create a combined transformation matrix
            // const transformationMatrix = new Matrix4().multiplyMatrices(translationMatrix, scalingMatrix);

            // // apply the transformation matrix to the camera's position and orientation
            // scope.camera.position.applyMatrix4(transformationMatrix);
            //scope.camera.zoom += scale;
            //scope.camera.updateProjectionMatrix();
            // scope.camera.lookAt(pointToZoom.x, pointToZoom.y, pointToZoom.z);
        }

        function onMouseUp(event) {
            if (event.button === 0) {
                isRotateEnabled = false;
            } else if (event.button === 2) {
                isPanEnabled = false;
            }
        }

        function onPointerDown(event) {

            scope.domElement.setPointerCapture(event.pointerId);
            scope.domElement.addEventListener('pointermove', onPointerMove);
            scope.domElement.addEventListener('pointerup', onPointerUp);

            onMouseDown(event);
        }

        function onPointerMove(event) {
            onMouseMove(event);
        }

        function onPointerUp(event) {
            onMouseUp(event);

            scope.domElement.releasePointerCapture(event.pointerId);
            scope.domElement.removeEventListener('pointermove', onPointerMove);
            scope.domElement.removeEventListener('pointerup', onPointerUp);
        }

        scope.domElement.addEventListener('pointerdown', onPointerDown);
        scope.domElement.addEventListener('wheel', onMouseWheel, { passive: false });
    }
}

export { OrbitControls };
