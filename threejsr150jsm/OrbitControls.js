import {EventDispatcher, MOUSE, Quaternion, Spherical, TOUCH, Vector2, Vector3} from "three";
const _changeEvent = {
    type: "change"
}
  , _startEvent = {
    type: "start"
}
  , _endEvent = {
    type: "end"
};
class OrbitControls extends EventDispatcher {
    constructor(object, domElement) {
        super(),
        this.object = object,
        this.domElement = domElement,
        this.domElement.style.touchAction = "none",
        this.enabled = !0,
        this.target = new Vector3,
        this.minDistance = 0,
        this.maxDistance = 1 / 0,
        this.minZoom = 0,
        this.maxZoom = 1 / 0,
        this.minPolarAngle = 0,
        this.maxPolarAngle = Math.PI,
        this.minAzimuthAngle = -1 / 0,
        this.maxAzimuthAngle = 1 / 0,
        this.enableDamping = !1,
        this.dampingFactor = .05,
        this.enableZoom = !0,
        this.zoomSpeed = 1,
        this.enableRotate = !0,
        this.rotateSpeed = 1,
        this.enablePan = !0,
        this.panSpeed = 1,
        this.screenSpacePanning = !0,
        this.keyPanSpeed = 7,
        this.autoRotate = !1,
        this.autoRotateSpeed = 2,
        this.keys = {
            LEFT: "ArrowLeft",
            UP: "ArrowUp",
            RIGHT: "ArrowRight",
            BOTTOM: "ArrowDown"
        },
        this.mouseButtons = {
            LEFT: MOUSE.ROTATE,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.PAN
        },
        this.touches = {
            ONE: TOUCH.ROTATE,
            TWO: TOUCH.DOLLY_PAN
        },
        this.target0 = this.target.clone(),
        this.position0 = this.object.position.clone(),
        this.zoom0 = this.object.zoom,
        this._domElementKeyEvents = null,
        this.getPolarAngle = function() {
            return spherical.phi
        }
        ,
        this.getAzimuthalAngle = function() {
            return spherical.theta
        }
        ,
        this.getDistance = function() {
            return this.object.position.distanceTo(this.target)
        }
        ,
        this.listenToKeyEvents = function(domElement) {
            domElement.addEventListener("keydown", onKeyDown),
            this._domElementKeyEvents = domElement
        }
        ,
        this.stopListenToKeyEvents = function() {
            this._domElementKeyEvents.removeEventListener("keydown", onKeyDown),
            this._domElementKeyEvents = null
        }
        ,
        this.saveState = function() {
            scope.target0.copy(scope.target),
            scope.position0.copy(scope.object.position),
            scope.zoom0 = scope.object.zoom
        }
        ,
        this.reset = function() {
            scope.target.copy(scope.target0),
            scope.object.position.copy(scope.position0),
            scope.object.zoom = scope.zoom0,
            scope.object.updateProjectionMatrix(),
            scope.dispatchEvent(_changeEvent),
            scope.update(),
            state = STATE.NONE
        }
        ,
        this.update = function() {
            const offset = new Vector3
              , quat = (new Quaternion).setFromUnitVectors(object.up, new Vector3(0,1,0))
              , quatInverse = quat.clone().invert()
              , lastPosition = new Vector3
              , lastQuaternion = new Quaternion
              , twoPI = 2 * Math.PI;
            return function update() {
                const position = scope.object.position;
                offset.copy(position).sub(scope.target),
                offset.applyQuaternion(quat),
                spherical.setFromVector3(offset),
                scope.autoRotate && state === STATE.NONE && rotateLeft(getAutoRotationAngle()),
                scope.enableDamping ? (spherical.theta += sphericalDelta.theta * scope.dampingFactor,
                spherical.phi += sphericalDelta.phi * scope.dampingFactor) : (spherical.theta += sphericalDelta.theta,
                spherical.phi += sphericalDelta.phi);
                let min = scope.minAzimuthAngle
                  , max = scope.maxAzimuthAngle;
                return isFinite(min) && isFinite(max) && (min < -Math.PI ? min += twoPI : min > Math.PI && (min -= twoPI),
                max < -Math.PI ? max += twoPI : max > Math.PI && (max -= twoPI),
                spherical.theta = min <= max ? Math.max(min, Math.min(max, spherical.theta)) : spherical.theta > (min + max) / 2 ? Math.max(min, spherical.theta) : Math.min(max, spherical.theta)),
                spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi)),
                spherical.makeSafe(),
                spherical.radius *= scale,
                spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius)),
                !0 === scope.enableDamping ? scope.target.addScaledVector(panOffset, scope.dampingFactor) : scope.target.add(panOffset),
                offset.setFromSpherical(spherical),
                offset.applyQuaternion(quatInverse),
                position.copy(scope.target).add(offset),
                scope.object.lookAt(scope.target),
                !0 === scope.enableDamping ? (sphericalDelta.theta *= 1 - scope.dampingFactor,
                sphericalDelta.phi *= 1 - scope.dampingFactor,
                panOffset.multiplyScalar(1 - scope.dampingFactor)) : (sphericalDelta.set(0, 0, 0),
                panOffset.set(0, 0, 0)),
                scale = 1,
                !!(zoomChanged || lastPosition.distanceToSquared(scope.object.position) > EPS || 8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) && (scope.dispatchEvent(_changeEvent),
                lastPosition.copy(scope.object.position),
                lastQuaternion.copy(scope.object.quaternion),
                zoomChanged = !1,
                !0)
            }
        }(),
        this.dispose = function() {
            scope.domElement.removeEventListener("contextmenu", onContextMenu),
            scope.domElement.removeEventListener("pointerdown", onPointerDown),
            scope.domElement.removeEventListener("pointercancel", onPointerUp),
            scope.domElement.removeEventListener("wheel", onMouseWheel),
            scope.domElement.removeEventListener("pointermove", onPointerMove),
            scope.domElement.removeEventListener("pointerup", onPointerUp),
            null !== scope._domElementKeyEvents && (scope._domElementKeyEvents.removeEventListener("keydown", onKeyDown),
            scope._domElementKeyEvents = null)
        }
        ;
        const scope = this
          , STATE = {
            NONE: -1,
            ROTATE: 0,
            DOLLY: 1,
            PAN: 2,
            TOUCH_ROTATE: 3,
            TOUCH_PAN: 4,
            TOUCH_DOLLY_PAN: 5,
            TOUCH_DOLLY_ROTATE: 6
        };
        let state = STATE.NONE;
        const EPS = 1e-6
          , spherical = new Spherical
          , sphericalDelta = new Spherical;
        let scale = 1;
        const panOffset = new Vector3;
        let zoomChanged = !1;
        const rotateStart = new Vector2
          , rotateEnd = new Vector2
          , rotateDelta = new Vector2
          , panStart = new Vector2
          , panEnd = new Vector2
          , panDelta = new Vector2
          , dollyStart = new Vector2
          , dollyEnd = new Vector2
          , dollyDelta = new Vector2
          , pointers = []
          , pointerPositions = {};
        function getAutoRotationAngle() {
            return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed
        }
        function getZoomScale() {
            return Math.pow(.95, scope.zoomSpeed)
        }
        function rotateLeft(angle) {
            sphericalDelta.theta -= angle
        }
        function rotateUp(angle) {
            sphericalDelta.phi -= angle
        }
        const panLeft = function() {
            const v = new Vector3;
            return function panLeft(distance, objectMatrix) {
                v.setFromMatrixColumn(objectMatrix, 0),
                v.multiplyScalar(-distance),
                panOffset.add(v)
            }
        }()
          , panUp = function() {
            const v = new Vector3;
            return function panUp(distance, objectMatrix) {
                !0 === scope.screenSpacePanning ? v.setFromMatrixColumn(objectMatrix, 1) : (v.setFromMatrixColumn(objectMatrix, 0),
                v.crossVectors(scope.object.up, v)),
                v.multiplyScalar(distance),
                panOffset.add(v)
            }
        }()
          , pan = function() {
            const offset = new Vector3;
            return function pan(deltaX, deltaY) {
                const element = scope.domElement;
                if (scope.object.isPerspectiveCamera) {
                    const position = scope.object.position;
                    offset.copy(position).sub(scope.target);
                    let targetDistance = offset.length();
                    targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180),
                    panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix),
                    panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix)
                } else
                    scope.object.isOrthographicCamera ? (panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix),
                    panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),
                    scope.enablePan = !1)
            }
        }();
        function dollyOut(dollyScale) {
            scope.object.isPerspectiveCamera ? scale /= dollyScale : scope.object.isOrthographicCamera ? (scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale)),
            scope.object.updateProjectionMatrix(),
            zoomChanged = !0) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),
            scope.enableZoom = !1)
        }
        function dollyIn(dollyScale) {
            scope.object.isPerspectiveCamera ? scale *= dollyScale : scope.object.isOrthographicCamera ? (scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale)),
            scope.object.updateProjectionMatrix(),
            zoomChanged = !0) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),
            scope.enableZoom = !1)
        }
        function handleMouseDownRotate(event) {
            rotateStart.set(event.clientX, event.clientY)
        }
        function handleMouseDownDolly(event) {
            dollyStart.set(event.clientX, event.clientY)
        }
        function handleMouseDownPan(event) {
            panStart.set(event.clientX, event.clientY)
        }
        function handleMouseMoveRotate(event) {
            rotateEnd.set(event.clientX, event.clientY),
            rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
            const element = scope.domElement;
            rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight),
            rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight),
            rotateStart.copy(rotateEnd),
            scope.update()
        }
        function handleMouseMoveDolly(event) {
            dollyEnd.set(event.clientX, event.clientY),
            dollyDelta.subVectors(dollyEnd, dollyStart),
            dollyDelta.y > 0 ? dollyOut(getZoomScale()) : dollyDelta.y < 0 && dollyIn(getZoomScale()),
            dollyStart.copy(dollyEnd),
            scope.update()
        }
        function handleMouseMovePan(event) {
            panEnd.set(event.clientX, event.clientY),
            panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed),
            pan(panDelta.x, panDelta.y),
            panStart.copy(panEnd),
            scope.update()
        }
        function handleMouseWheel(event) {
            event.deltaY < 0 ? dollyIn(getZoomScale()) : event.deltaY > 0 && dollyOut(getZoomScale()),
            scope.update()
        }
        function handleKeyDown(event) {
            let needsUpdate = !1;
            switch (event.code) {
            case scope.keys.UP:
                event.ctrlKey || event.metaKey || event.shiftKey ? rotateUp(2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight) : pan(0, scope.keyPanSpeed),
                needsUpdate = !0;
                break;
            case scope.keys.BOTTOM:
                event.ctrlKey || event.metaKey || event.shiftKey ? rotateUp(-2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight) : pan(0, -scope.keyPanSpeed),
                needsUpdate = !0;
                break;
            case scope.keys.LEFT:
                event.ctrlKey || event.metaKey || event.shiftKey ? rotateLeft(2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight) : pan(scope.keyPanSpeed, 0),
                needsUpdate = !0;
                break;
            case scope.keys.RIGHT:
                event.ctrlKey || event.metaKey || event.shiftKey ? rotateLeft(-2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight) : pan(-scope.keyPanSpeed, 0),
                needsUpdate = !0
            }
            needsUpdate && (event.preventDefault(),
            scope.update())
        }
        function handleTouchStartRotate() {
            if (1 === pointers.length)
                rotateStart.set(pointers[0].pageX, pointers[0].pageY);
            else {
                const x = .5 * (pointers[0].pageX + pointers[1].pageX)
                  , y = .5 * (pointers[0].pageY + pointers[1].pageY);
                rotateStart.set(x, y)
            }
        }
        function handleTouchStartPan() {
            if (1 === pointers.length)
                panStart.set(pointers[0].pageX, pointers[0].pageY);
            else {
                const x = .5 * (pointers[0].pageX + pointers[1].pageX)
                  , y = .5 * (pointers[0].pageY + pointers[1].pageY);
                panStart.set(x, y)
            }
        }
        function handleTouchStartDolly() {
            const dx = pointers[0].pageX - pointers[1].pageX
              , dy = pointers[0].pageY - pointers[1].pageY
              , distance = Math.sqrt(dx * dx + dy * dy);
            dollyStart.set(0, distance)
        }
        function handleTouchStartDollyPan() {
            scope.enableZoom && handleTouchStartDolly(),
            scope.enablePan && handleTouchStartPan()
        }
        function handleTouchStartDollyRotate() {
            scope.enableZoom && handleTouchStartDolly(),
            scope.enableRotate && handleTouchStartRotate()
        }
        function handleTouchMoveRotate(event) {
            if (1 == pointers.length)
                rotateEnd.set(event.pageX, event.pageY);
            else {
                const position = getSecondPointerPosition(event)
                  , x = .5 * (event.pageX + position.x)
                  , y = .5 * (event.pageY + position.y);
                rotateEnd.set(x, y)
            }
            rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
            const element = scope.domElement;
            rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight),
            rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight),
            rotateStart.copy(rotateEnd)
        }
        function handleTouchMovePan(event) {
            if (1 === pointers.length)
                panEnd.set(event.pageX, event.pageY);
            else {
                const position = getSecondPointerPosition(event)
                  , x = .5 * (event.pageX + position.x)
                  , y = .5 * (event.pageY + position.y);
                panEnd.set(x, y)
            }
            panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed),
            pan(panDelta.x, panDelta.y),
            panStart.copy(panEnd)
        }
        function handleTouchMoveDolly(event) {
            const position = getSecondPointerPosition(event)
              , dx = event.pageX - position.x
              , dy = event.pageY - position.y
              , distance = Math.sqrt(dx * dx + dy * dy);
            dollyEnd.set(0, distance),
            dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed)),
            dollyOut(dollyDelta.y),
            dollyStart.copy(dollyEnd)
        }
        function handleTouchMoveDollyPan(event) {
            scope.enableZoom && handleTouchMoveDolly(event),
            scope.enablePan && handleTouchMovePan(event)
        }
        function handleTouchMoveDollyRotate(event) {
            scope.enableZoom && handleTouchMoveDolly(event),
            scope.enableRotate && handleTouchMoveRotate(event)
        }
        function onPointerDown(event) {
            !1 !== scope.enabled && (0 === pointers.length && (scope.domElement.setPointerCapture(event.pointerId),
            scope.domElement.addEventListener("pointermove", onPointerMove),
            scope.domElement.addEventListener("pointerup", onPointerUp)),
            addPointer(event),
            "touch" === event.pointerType ? onTouchStart(event) : onMouseDown(event))
        }
        function onPointerMove(event) {
            !1 !== scope.enabled && ("touch" === event.pointerType ? onTouchMove(event) : onMouseMove(event))
        }
        function onPointerUp(event) {
            removePointer(event),
            0 === pointers.length && (scope.domElement.releasePointerCapture(event.pointerId),
            scope.domElement.removeEventListener("pointermove", onPointerMove),
            scope.domElement.removeEventListener("pointerup", onPointerUp)),
            scope.dispatchEvent(_endEvent),
            state = STATE.NONE
        }
        function onMouseDown(event) {
            let mouseAction;
            switch (event.button) {
            case 0:
                mouseAction = scope.mouseButtons.LEFT;
                break;
            case 1:
                mouseAction = scope.mouseButtons.MIDDLE;
                break;
            case 2:
                mouseAction = scope.mouseButtons.RIGHT;
                break;
            default:
                mouseAction = -1
            }
            switch (mouseAction) {
            case MOUSE.DOLLY:
                if (!1 === scope.enableZoom)
                    return;
                handleMouseDownDolly(event),
                state = STATE.DOLLY;
                break;
            case MOUSE.ROTATE:
                if (event.ctrlKey || event.metaKey || event.shiftKey) {
                    if (!1 === scope.enablePan)
                        return;
                    handleMouseDownPan(event),
                    state = STATE.PAN
                } else {
                    if (!1 === scope.enableRotate)
                        return;
                    handleMouseDownRotate(event),
                    state = STATE.ROTATE
                }
                break;
            case MOUSE.PAN:
                if (event.ctrlKey || event.metaKey || event.shiftKey) {
                    if (!1 === scope.enableRotate)
                        return;
                    handleMouseDownRotate(event),
                    state = STATE.ROTATE
                } else {
                    if (!1 === scope.enablePan)
                        return;
                    handleMouseDownPan(event),
                    state = STATE.PAN
                }
                break;
            default:
                state = STATE.NONE
            }
            state !== STATE.NONE && scope.dispatchEvent(_startEvent)
        }
        function onMouseMove(event) {
            switch (state) {
            case STATE.ROTATE:
                if (!1 === scope.enableRotate)
                    return;
                handleMouseMoveRotate(event);
                break;
            case STATE.DOLLY:
                if (!1 === scope.enableZoom)
                    return;
                handleMouseMoveDolly(event);
                break;
            case STATE.PAN:
                if (!1 === scope.enablePan)
                    return;
                handleMouseMovePan(event)
            }
        }
        function onMouseWheel(event) {
            !1 !== scope.enabled && !1 !== scope.enableZoom && state === STATE.NONE && (event.preventDefault(),
            scope.dispatchEvent(_startEvent),
            handleMouseWheel(event),
            scope.dispatchEvent(_endEvent))
        }
        function onKeyDown(event) {
            !1 !== scope.enabled && !1 !== scope.enablePan && handleKeyDown(event)
        }
        function onTouchStart(event) {
            switch (trackPointer(event),
            pointers.length) {
            case 1:
                switch (scope.touches.ONE) {
                case TOUCH.ROTATE:
                    if (!1 === scope.enableRotate)
                        return;
                    handleTouchStartRotate(),
                    state = STATE.TOUCH_ROTATE;
                    break;
                case TOUCH.PAN:
                    if (!1 === scope.enablePan)
                        return;
                    handleTouchStartPan(),
                    state = STATE.TOUCH_PAN;
                    break;
                default:
                    state = STATE.NONE
                }
                break;
            case 2:
                switch (scope.touches.TWO) {
                case TOUCH.DOLLY_PAN:
                    if (!1 === scope.enableZoom && !1 === scope.enablePan)
                        return;
                    handleTouchStartDollyPan(),
                    state = STATE.TOUCH_DOLLY_PAN;
                    break;
                case TOUCH.DOLLY_ROTATE:
                    if (!1 === scope.enableZoom && !1 === scope.enableRotate)
                        return;
                    handleTouchStartDollyRotate(),
                    state = STATE.TOUCH_DOLLY_ROTATE;
                    break;
                default:
                    state = STATE.NONE
                }
                break;
            default:
                state = STATE.NONE
            }
            state !== STATE.NONE && scope.dispatchEvent(_startEvent)
        }
        function onTouchMove(event) {
            switch (trackPointer(event),
            state) {
            case STATE.TOUCH_ROTATE:
                if (!1 === scope.enableRotate)
                    return;
                handleTouchMoveRotate(event),
                scope.update();
                break;
            case STATE.TOUCH_PAN:
                if (!1 === scope.enablePan)
                    return;
                handleTouchMovePan(event),
                scope.update();
                break;
            case STATE.TOUCH_DOLLY_PAN:
                if (!1 === scope.enableZoom && !1 === scope.enablePan)
                    return;
                handleTouchMoveDollyPan(event),
                scope.update();
                break;
            case STATE.TOUCH_DOLLY_ROTATE:
                if (!1 === scope.enableZoom && !1 === scope.enableRotate)
                    return;
                handleTouchMoveDollyRotate(event),
                scope.update();
                break;
            default:
                state = STATE.NONE
            }
        }
        function onContextMenu(event) {
            !1 !== scope.enabled && event.preventDefault()
        }
        function addPointer(event) {
            pointers.push(event)
        }
        function removePointer(event) {
            delete pointerPositions[event.pointerId];
            for (let i = 0; i < pointers.length; i++)
                if (pointers[i].pointerId == event.pointerId)
                    return void pointers.splice(i, 1)
        }
        function trackPointer(event) {
            let position = pointerPositions[event.pointerId];
            void 0 === position && (position = new Vector2,
            pointerPositions[event.pointerId] = position),
            position.set(event.pageX, event.pageY)
        }
        function getSecondPointerPosition(event) {
            const pointer = event.pointerId === pointers[0].pointerId ? pointers[1] : pointers[0];
            return pointerPositions[pointer.pointerId]
        }
        scope.domElement.addEventListener("contextmenu", onContextMenu),
        scope.domElement.addEventListener("pointerdown", onPointerDown),
        scope.domElement.addEventListener("pointercancel", onPointerUp),
        scope.domElement.addEventListener("wheel", onMouseWheel, {
            passive: !1
        }),
        this.update()
    }
}
export {OrbitControls};
