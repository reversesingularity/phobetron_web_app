"use strict";
var TEXTURE_ROOT = ""
  , THESKYLIVE = {}
  , K_GAUSS = .01720209895;
THESKYLIVE.OrbitVisualizer = function(theContainer, initdata) {
    this.objects = {},
    this.objectsArray = [],
    this.planets = {
        mercury: {
            name: "Mercury",
            threejs: {},
            a0: .38709927,
            e0: .20563593,
            i0: 7.00497902,
            ml0: 252.2503235,
            lp0: 77.45779628,
            o0: 48.33076593,
            ad: 37e-8,
            ed: 1906e-8,
            id: -.00594749,
            mld: 149472.67411175,
            lpd: .16047689,
            od: -.12534081
        },
        venus: {
            name: "Venus",
            threejs: {},
            a0: .72333566,
            e0: .00677672,
            i0: 3.39467605,
            ml0: 181.9790995,
            lp0: 131.60246718,
            o0: 76.67984255,
            ad: 39e-7,
            ed: -4107e-8,
            id: -7889e-7,
            mld: 58517.81538729,
            lpd: .00268329,
            od: -.27769418
        },
        earth: {
            name: "Earth",
            threejs: {},
            a0: 1.00000261,
            e0: .01671123,
            i0: -1531e-8,
            ml0: 100.46457166,
            lp0: 102.93768193,
            o0: 0,
            ad: 562e-8,
            ed: -4392e-8,
            id: -.01294668,
            mld: 35999.37244981,
            lpd: .32327364,
            od: 0
        },
        mars: {
            name: "Mars",
            threejs: {},
            a0: 1.52371034,
            e0: .0933941,
            i0: 1.84969142,
            ml0: -4.55343205,
            lp0: -23.94362959,
            o0: 49.55953891,
            ad: 1847e-8,
            ed: 7882e-8,
            id: -.00813131,
            mld: 19140.30268499,
            lpd: .44441088,
            od: -.29257343
        },
        jupiter: {
            name: "Jupiter",
            threejs: {},
            a0: 5.202887,
            e0: .04838624,
            i0: 1.30439695,
            ml0: 34.39644051,
            lp0: 14.72847983,
            o0: 100.47390909,
            ad: -11607e-8,
            ed: -13253e-8,
            id: -.00183714,
            mld: 3034.74612775,
            lpd: .21252668,
            od: .20469106
        },
        saturn: {
            name: "Saturn",
            threejs: {},
            a0: 9.53667594,
            e0: .05386179,
            i0: 2.48599187,
            ml0: 49.95424423,
            lp0: 92.59887831,
            o0: 113.66242448,
            ad: -.0012506,
            ed: -50991e-8,
            id: .00193609,
            mld: 1222.49362201,
            lpd: -.41897216,
            od: -.28867794
        },
        uranus: {
            name: "Uranus",
            threejs: {},
            a0: 19.18916464,
            e0: .04725744,
            i0: .77263783,
            ml0: 313.23810451,
            lp0: 170.9542763,
            o0: 74.01692503,
            ad: -.00196176,
            ed: -4397e-8,
            id: -.00242939,
            mld: 428.48202785,
            lpd: .40805281,
            od: .04240589
        },
        neptune: {
            name: "Neptune",
            threejs: {},
            a0: 30.06992276,
            e0: .00859048,
            i0: 1.77004347,
            ml0: -55.12002969,
            lp0: 44.96476227,
            o0: 131.78422574,
            ad: 26291e-8,
            ed: 5105e-8,
            id: 35372e-8,
            mld: 218.45945325,
            lpd: -.32241464,
            od: -.00508664
        },
        pluto: {
            name: "Pluto",
            threejs: {},
            a0: 39.48211675,
            e0: .2488273,
            i0: 17.14001206,
            ml0: 238.92903833,
            lp0: 224.06891629,
            o0: 110.30393684,
            ad: -31596e-8,
            ed: 517e-7,
            id: 4818e-8,
            mld: 145.20780515,
            lpd: -.04062942,
            od: -.01183482
        }
    },
    this.planetColors = {
        mercury: 15790320,
        venus: 16119203,
        earth: 3381759,
        mars: 16711680,
        jupiter: 16744448,
        saturn: 16766720,
        uranus: 3067050,
        neptune: 4286945,
        pluto: 8620942,
        sun: 16777215
    },
    this.planetOrbitColors = {
        mercury: 9868950,
        venus: 10272194,
        earth: 6001087,
        mars: 13854502,
        jupiter: 11709303,
        saturn: 14600594,
        uranus: 12048607,
        neptune: 10129363,
        pluto: 8620942,
        sun: 16777215
    },
    this.selectedObjectColor = 65280,
    this.previousSelectedObjectColor = null,
    this.hilightedObjectColor = 16711680,
    this.previousHilightedObjectColor = null,
    this.clock = new THREE.Clock,
    this.container = theContainer,
    this.WIDTH = this.container.clientWidth,
    this.HEIGHT = this.container.clientHeight,
    this.orbitSegments = 1e3,
    this.camera = null,
    this.scene = null,
    this.renderer = null,
    this.controls = null,
    this.renderScene = null,
    this.rayCaster = null,
    this.hilightedObject = null,
    this.selectedObject = null,
    this.objectsSelectable = !1,
    this.lockedObjectListeners = [],
    this.CONTROL_TYPES = {
        TRACKBALL: 0,
        ORBIT: 1
    },
    this.controlsType = this.CONTROL_TYPES.ORBIT,
    this.controlsMaxDistance = 500,
    this.controlsMinDistance = .2,
    this.mouse = new THREE.Vector2,
    this.STATE = {
        NONE: -1,
        CLICK: 0,
        PAN: 1
    },
    this.mouseState = this.STATE.NONE,
    this.cameraTarget = new THREE.Vector3(0,0,0),
    this.followedObject = null,
    this.followedObjectDistance = null,
    this.rotX = 0,
    this.rotY = 1,
    this.rotZ = 0,
    this.textureLoader = new THREE.TextureLoader,
    this.textureFlare0 = this.textureLoader.load(TEXTURE_ROOT + "/images/textures/threejs/lensflare/lensflare0.png"),
    this.textureFlare2 = this.textureLoader.load(TEXTURE_ROOT + "/images/textures/threejs/lensflare/lensflare2.png"),
    this.textureFlare3 = this.textureLoader.load(TEXTURE_ROOT + "/images/textures/threejs/lensflare/lensflare3.png"),
    this.sprite = this.textureLoader.load(TEXTURE_ROOT + "/images/textures/planet.png"),
    this.cometTexture = this.textureLoader.load(TEXTURE_ROOT + "/images/textures/comet.png"),
    this.fogToPlanet = !0,
    this.fogToPlanetOrbit = !0,
    this.fogToObject = !0,
    this.fogToObjectOrbit = !0,
    this.labelFontName = "Arial",
    this.labelFontColor = "#ccccdd",
    this.labelFontSizePixels = 16,
    this.labelOversampligFactor = 7,
    this.camera = new THREE.PerspectiveCamera(50,this.WIDTH / this.HEIGHT,.01,2e7),
    this.camera.position.z = 10,
    this.camera.position.y = 5,
    this.rayCaster = new THREE.Raycaster,
    this.rayCaster.params.Points.threshold = 5e-5,
    this.rayCaster.params.Line.threshold = .1,
    this.rayCaster.far = 1e10,
    this.objectMaterials = {
        default: {
            orbitMaterial: {
                color: 16711935,
                opacity: 1,
                linewidth: .5,
                fog: this.fogToObjectOrbit
            },
            bodyMaterial: {
                size: 15,
                sizeAttenuation: !1,
                map: this.sprite,
                alphaTest: .5,
                transparent: !0,
                fog: this.fogToObject
            },
            labelMaterial: {
                family: this.labelFontName,
                size: this.labelFontSizePixels
            }
        },
        comets: {
            orbitMaterial: {
                color: 10048955,
                opacity: 1,
                linewidth: .5,
                fog: this.fogToObjectOrbit
            },
            bodyMaterial: {
                size: 80,
                sizeAttenuation: !1,
                map: this.cometTexture,
                alphaTest: .8,
                transparent: !0,
                color: 14540287
            },
            labelMaterial: {
                family: this.labelFontName,
                size: this.labelFontSizePixels
            }
        }
    },
    this.scene = new THREE.Scene,
    this.renderer = new THREE.WebGLRenderer({
        antialias: !0,
        alpha: !0,
        preserveDrawingBuffer: !0
    }),
    this.renderer.setPixelRatio(window.devicePixelRatio),
    this.renderer.setSize(this.WIDTH, this.HEIGHT),
    this.container.appendChild(this.renderer.domElement),
    this.setupControls(),
    this.isCameraAnimated = !0,
    this.skyTexture = TEXTURE_ROOT + "/images/textures/galaxy_2400_70.webp",
    initdata && (initdata.hasOwnProperty("skyTexture") && (this.skyTexture = initdata.skyTexture),
    initdata.hasOwnProperty("isCameraAnimated") && (this.isCameraAnimated = initdata.isCameraAnimated)),
    this.utcTimeMillis = (new Date).getTime(),
    this.addSun(),
    this.addPlanets(),
    this.addSky();
    var gridHelper = new THREE.GridHelper(40,2e3,255,3355443)
      , axesHelper = new THREE.AxesHelper(1e3);
    theContainer.addEventListener("mousemove", this.onDocumentMouseMove.bind(this), !1),
    theContainer.addEventListener("mouseup", this.onDocumentMouseUp.bind(this), !1),
    theContainer.addEventListener("mousedown", this.onDocumentMouseDown.bind(this), !1),
    window.addEventListener("resize", this.onWindowResize.bind(this), !1)
}
,
THESKYLIVE.OrbitVisualizer.prototype = {
    constructor: THESKYLIVE.OrbitVisualizer,
    setUtcTimeMillis: function(utc) {
        this.utcTimeMillis = utc,
        this.updatePlanetsPosition(),
        this.updateObjectsPosition()
    },
    setupControls: function() {
        if (this.controlsType == this.CONTROL_TYPES.TRACKBALL)
            this.controls = new THREE.TrackballControls(this.camera,this.container),
            this.controls.staticMoving = !0,
            this.controls.rotateSpeed = 3,
            this.controls.zoomSpeed = 2,
            this.controls.panSpeed = 1.5,
            this.controls.noZoom = !1,
            this.controls.noPan = !1,
            this.controls.dynamicDampingFactor = .3;
        else if (this.controlsType == this.CONTROL_TYPES.ORBIT) {
            try {
                this.controls = new OrbitControls(this.camera,this.container)
            } catch (e) {
                this.controls = new THREE.OrbitControls(this.camera,this.container)
            }
            this.controls.enableDamping = !0,
            this.controls.dampingFactor = .5,
            this.controls.enablePan = !0,
            this.controls.screenSpacePanning = !1
        }
        this.controls.maxDistance = this.controlsMaxDistance,
        this.controls.minDistance = this.controlsMinDistance,
        this.controls.addEventListener("change", (function() {}
        ))
    },
    addSky: function() {
        var geometry = new THREE.SphereGeometry(1e3,60,40);
        geometry.applyMatrix4((new THREE.Matrix4).makeScale(-1, 1, 1));
        var material = new THREE.MeshBasicMaterial({
            map: this.textureLoader.load(this.skyTexture)
        })
          , sky = new THREE.Mesh(geometry,material)
          , m = new THREE.Matrix4;
        m.makeRotationY(3 * Math.PI / 2),
        m.makeRotationX(-1.099),
        sky.applyMatrix4(m),
        (m = new THREE.Matrix4).makeRotationY(Math.PI / 2),
        sky.applyMatrix4(m),
        this.scene.add(sky)
    },
    addSun: function() {
        var light = new THREE.PointLight(16777215,1.5,2e3)
          , lensflareParent = "Lensflare"in THREE ? THREE : window
          , lensflare = new lensflareParent.Lensflare;
        lensflare.addElement(new lensflareParent.LensflareElement(this.textureFlare0,200,.002,light.color)),
        lensflare.addElement(new lensflareParent.LensflareElement(this.textureFlare3,60,.6)),
        lensflare.addElement(new lensflareParent.LensflareElement(this.textureFlare3,70,.7)),
        lensflare.addElement(new lensflareParent.LensflareElement(this.textureFlare3,120,.9)),
        lensflare.addElement(new lensflareParent.LensflareElement(this.textureFlare3,70,1)),
        light.add(lensflare),
        this.scene.add(light);
        var sunGeometry = new THREE.BufferGeometry;
        sunGeometry.vertices = [];
        var vertex = new THREE.Vector3;
        sunGeometry.vertices.push(vertex.x, vertex.y, vertex.z),
        sunGeometry.setAttribute("position", new THREE.Float32BufferAttribute(sunGeometry.vertices,3));
        var material = new THREE.PointsMaterial({
            size: 15,
            sizeAttenuation: !1,
            map: this.sprite,
            transparent: !0,
            alphaTest: .9,
            fog: !1
        });
        material.color.set(this.planetColors.sun);
        var sunBody = new THREE.Points(sunGeometry,material);
        sunBody.name = "sun";
        var sunLabel = this.getLabel("Sun", {
            family: this.labelFontName,
            size: this.labelFontSizePixels
        });
        this.scene.add(sunBody),
        this.scene.add(sunLabel),
        this.objectsArray.push(sunBody)
    },
    addPlanets: function() {
        this.addPlanetOrbits(),
        this.addPlanetBodies(),
        this.updatePlanetsPosition()
    },
    addPlanetOrbits: function() {
        for (var key in this.planets)
            if (this.planets.hasOwnProperty(key)) {
                this.updateMeanElements((new Date).getTime(), this.planets[key]);
                var orbitGeometry = this.getEllipticalOrbitGeometry(this.planets[key].a, this.planets[key].e)
                  , object = new THREE.LineSegments(orbitGeometry,new THREE.LineBasicMaterial({
                    color: this.planetOrbitColors[key],
                    opacity: 1,
                    linewidth: 1,
                    fog: this.fogToPlanetOrbit
                }))
                  , m2 = new THREE.Matrix4;
                m2.makeRotationY(this.planets[key].o),
                object.applyMatrix4(m2),
                object.rotateOnAxis(new THREE.Vector3(1,0,0), this.planets[key].i),
                object.rotateOnAxis(new THREE.Vector3(0,1,0), this.planets[key].lp - this.planets[key].o),
                this.planets[key].threejs.orbit = object,
                object.name = key,
                this.scene.add(object),
                this.objectsArray.push(object)
            }
    },
    addPlanetBodies: function() {
        for (var key in this.planets)
            if (this.planets.hasOwnProperty(key)) {
                var planet = this.planets[key]
                  , planetGeometry = new THREE.BufferGeometry;
                planetGeometry.vertices = [];
                var vertex = new THREE.Vector3;
                planetGeometry.vertices.push(vertex.x, vertex.y, vertex.z);
                var material = new THREE.PointsMaterial({
                    size: 18,
                    sizeAttenuation: !1,
                    map: this.sprite,
                    alphaTest: .5,
                    transparent: !0,
                    fog: this.fogToPlanet
                });
                material.color.set(this.planetColors[key]),
                planetGeometry.setAttribute("position", new THREE.Float32BufferAttribute(planetGeometry.vertices,3)),
                planet.threejs.body = new THREE.Points(planetGeometry,material),
                planet.threejs.body.name = key,
                planet.threejs.label = this.getLabel(planet.name, {
                    family: this.labelFontName,
                    size: this.labelFontSizePixels
                }),
                this.scene.add(planet.threejs.body),
                this.scene.add(planet.threejs.label),
                this.objectsArray.push(planet.threejs.body)
            }
    },
    getMaterialPropsForObject: function(obj) {
        var category = "category"in obj ? obj.category : "default";
        return category in this.objectMaterials ? this.objectMaterials[category] : this.objectMaterials.default
    },
    addKeplerianObject: function(obj) {
        var id = obj.id
          , name = obj.name
          , elements = obj.elements
          , materialProps = this.getMaterialPropsForObject(obj);
        obj.threejs = {},
        obj.threejs.orbit = this.getObjectOrbit(elements, materialProps.orbitMaterial),
        obj.threejs.orbit.name = id,
        "comets" == obj.category ? obj.threejs.body = this.getBodyObject(obj, {
            size: 90,
            sizeAttenuation: !1,
            map: this.textureLoader.load(TEXTURE_ROOT + "/images/textures/comet.png"),
            alphaTest: .8,
            transparent: !0,
            color: 14540287
        }) : obj.threejs.body = this.getBodyObject(obj, materialProps.bodyMaterial),
        obj.threejs.body.name = id,
        obj.threejs.label = this.getLabel(name, materialProps.labelMaterial),
        this.scene.add(obj.threejs.orbit),
        this.scene.add(obj.threejs.body),
        this.scene.add(obj.threejs.label),
        this.objects[id] = obj,
        this.objectsArray.push(obj.threejs.body),
        this.objectsArray.push(obj.threejs.orbit),
        this.updateObjectPosition(id)
    },
    addNonKeplerianObject: function(obj) {
        var id = obj.id
          , name = obj.name
          , materialProps = this.getMaterialPropsForObject(obj);
        obj.threejs = {},
        "comets" == obj.category ? obj.threejs.body = this.getBodyObject(obj, {
            size: 90,
            sizeAttenuation: !1,
            map: this.textureLoader.load(TEXTURE_ROOT + "/images/textures/comet.png"),
            alphaTest: .8,
            transparent: !0,
            color: 14540287
        }) : obj.threejs.body = this.getBodyObject(obj, materialProps.bodyMaterial),
        obj.threejs.body.name = id,
        obj.threejs.label = this.getLabel(name, materialProps.labelMaterial),
        this.scene.add(obj.threejs.body),
        this.scene.add(obj.threejs.label),
        this.objects[id] = obj,
        this.objectsArray.push(obj.threejs.body),
        obj.threejs.body.position.x = obj.coordinates.x,
        obj.threejs.body.position.y = obj.coordinates.z,
        obj.threejs.body.position.z = -obj.coordinates.y,
        obj.threejs.label.position.x = obj.coordinates.x,
        obj.threejs.label.position.y = obj.coordinates.z,
        obj.threejs.label.position.z = -obj.coordinates.y
    },
    getObjectOrbit: function(elements, material) {
        var orbitGeometry;
        elements.e < 1 ? (void 0 === elements.a && (elements.a = elements.p / (1 - elements.e)),
        orbitGeometry = this.getEllipticalOrbitGeometry(elements.a, elements.e)) : orbitGeometry = 1 == elements.e ? this.getParabolicOrbitGeometry(elements.p) : this.getHyperbolicOrbitGeometry(elements.p, elements.e);
        var object = new THREE.LineSegments(orbitGeometry,new THREE.LineBasicMaterial(material))
          , m2 = new THREE.Matrix4;
        return m2.makeRotationY(this.deg2rad(elements.o)),
        object.applyMatrix4(m2),
        object.rotateOnAxis(new THREE.Vector3(1,0,0), this.deg2rad(elements.i)),
        object.rotateOnAxis(new THREE.Vector3(0,1,0), this.deg2rad(elements.ap)),
        object
    },
    getBodyObject: function(obj, material) {
        var vertex = new THREE.Vector3
          , planetGeometry = new THREE.BufferGeometry;
        planetGeometry.vertices = [],
        planetGeometry.vertices.push(vertex.x, vertex.y, vertex.z);
        var material = new THREE.PointsMaterial(material), particles;
        return planetGeometry.setAttribute("position", new THREE.Float32BufferAttribute(planetGeometry.vertices,3)),
        new THREE.Points(planetGeometry,material)
    },
    updatePlanetsPosition: function() {
        for (var key in this.planets)
            if (this.planets.hasOwnProperty(key)) {
                var planet = this.planets[key]
                  , coordinates = this.getPlanetHeliocentricPosition(this.utcTimeMillis, planet);
                planet.threejs.body.position.x = coordinates.x,
                planet.threejs.body.position.y = coordinates.z,
                planet.threejs.body.position.z = -coordinates.y,
                planet.threejs.label.position.x = coordinates.x,
                planet.threejs.label.position.y = coordinates.z,
                planet.threejs.label.position.z = -coordinates.y
            }
    },
    updateObjectPosition: function(id) {
        var object = this.objects[id]
          , coordinates = this.calculateObjectPosition(object.elements, this.utcTimeMillis);
        object.helioCoords = coordinates,
        object.threejs.body.position.x = coordinates.x,
        object.threejs.body.position.y = coordinates.z,
        object.threejs.body.position.z = -coordinates.y,
        object.threejs.label.position.x = coordinates.x,
        object.threejs.label.position.y = coordinates.z,
        object.threejs.label.position.z = -coordinates.y
    },
    updateObjectsPosition: function() {
        for (var key in this.objects) {
            var o;
            if (this.objects.hasOwnProperty(key))
                this.objects[key].hasOwnProperty("elements") && this.updateObjectPosition(key)
        }
    },
    removeAllObjects: function() {
        for (var key in this.objects)
            if (this.objects.hasOwnProperty(key)) {
                var o = this.objects[key];
                if (o.hasOwnProperty("threejs")) {
                    var t = o.threejs;
                    t.hasOwnProperty("body") && this.scene.remove(t.body),
                    t.hasOwnProperty("orbit") && this.scene.remove(t.orbit),
                    t.hasOwnProperty("label") && this.scene.remove(t.label)
                }
            }
    },
    removeObject: function(object_id) {
        for (var key in this.objects)
            if (this.objects.hasOwnProperty(key) && key == object_id) {
                var o = this.objects[key];
                if (o.hasOwnProperty("threejs")) {
                    var t = o.threejs;
                    t.hasOwnProperty("body") && this.scene.remove(t.body),
                    t.hasOwnProperty("orbit") && this.scene.remove(t.orbit),
                    t.hasOwnProperty("label") && this.scene.remove(t.label)
                }
            }
    },
    setCameraDistance: function(distance) {
        var p = this.camera.position, current_distance, f = distance / Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        this.camera.position.x = p.x * f,
        this.camera.position.y = p.y * f,
        this.camera.position.z = p.z * f
    },
    setCameraLookAt: function(x, y, z) {
        var r = Math.sqrt(x * x + y * y + 1);
        this.rotX = 0,
        this.rotY = 1,
        this.rotZ = 0,
        this.controls.target = this.cameraTarget,
        this.cameraTarget = new THREE.Vector3(x,y,z),
        this.camera.lookAt(this.cameraTarget),
        this.controls.update()
    },
    getObjectById: function(objectId) {
        var obj = null;
        return objectId in this.planets ? obj = this.planets[objectId] : objectId in this.objects && (obj = this.objects[objectId]),
        obj
    },
    cameraLookAtPlanet: function(objectName, distance) {
        this.cameraLookAtObject(objectName, distance)
    },
    cameraLookAtObject: function(objectId, distance) {
        var obj = this.getObjectById(objectId);
        if (null != obj) {
            if (null != distance) {
                var cx = obj.threejs.body.position.x + distance * Math.cos(Math.PI / 4)
                  , cy = obj.threejs.body.position.y + .5
                  , cz = obj.threejs.body.position.z + distance * Math.sin(Math.PI / 4);
                this.camera.position.x = cx,
                this.camera.position.y = cy,
                this.camera.position.z = cz
            }
            this.setCameraLookAt(obj.threejs.body.position.x, obj.threejs.body.position.y, obj.threejs.body.position.z),
            this.controls.target.x = obj.threejs.body.position.x,
            this.controls.target.y = obj.threejs.body.position.y,
            this.controls.target.z = obj.threejs.body.position.z,
            this.controls.update()
        }
    },
    cameraUnfollow: function(props) {
        this.followedObject = null,
        this.followedObjectDistance = null,
        props.reset && (this.setCameraLookAt(0, 0, 0),
        this.controls.target.x = 0,
        this.controls.target.y = 0,
        this.controls.target.z = 0,
        this.controls.update())
    },
    cameraFollowObject: function(objectId, distance) {
        if ("sun" != objectId) {
            var obj = this.getObjectById(objectId);
            if (obj) {
                this.followedObject = obj,
                this.followedObjectDistance = distance;
                var cx = 1.4 * this.followedObject.threejs.body.position.x
                  , cy = 1.4 * this.followedObject.threejs.body.position.y
                  , cz = 1.4 * this.followedObject.threejs.body.position.z;
                this.setCameraLookAt(this.followedObject.threejs.body.position.x, this.followedObject.threejs.body.position.y, this.followedObject.threejs.body.position.z)
            }
        } else
            this.cameraUnfollow({
                reset: !0
            })
    },
    sceneCenterToPlanet: function(objectName) {
        var planet = this.planets[objectName];
        scene.translateX(planet.threejs.body.position.x),
        scene.translateY(planet.threejs.body.position.y),
        scene.translateZ(planet.threejs.body.position.z)
    },
    getEllipticalOrbitGeometry: function(a, e) {
        for (var numSegments = e > .8 ? 4 * this.orbitSegments : 2 * this.orbitSegments, vertices = [], b = a * Math.sqrt(1 - e * e), prev_x, prev_z, i = 0; i <= numSegments; i++) {
            var E = i / numSegments * 2 * Math.PI
              , x = a * (Math.cos(E) - e)
              , z = b * Math.sin(E);
            i > 0 && (vertices.push(prev_x, 0, prev_z),
            vertices.push(x, 0, z)),
            prev_x = x,
            prev_z = z
        }
        var geometry = new THREE.BufferGeometry;
        return geometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(vertices),3)),
        geometry
    },
    getHyperbolicOrbitGeometry: function(p, e) {
        var q, a = p / (e - 1), maxDistance = 200, numSegments = 4 * this.orbitSegments, vertices = [], H_max, cosh_H_max = (200 / a + 1) / e, prev_x, prev_z;
        H_max = cosh_H_max > 1 && "function" == typeof Math.acosh ? Math.acosh(cosh_H_max) : 3;
        for (var i = 0; i <= numSegments; i++) {
            var H = i / numSegments * 2 * H_max - H_max
              , x = a * (e - Math.cosh(H))
              , z = a * Math.sqrt(e * e - 1) * Math.sinh(H);
            i > 0 && (vertices.push(prev_x, 0, prev_z),
            vertices.push(x, 0, z)),
            prev_x = x,
            prev_z = z
        }
        var geometry = new THREE.BufferGeometry;
        return geometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(vertices),3)),
        geometry
    },
    getParabolicOrbitGeometry: function(p) {
        for (var q = p, maxDistance = 200, numSegments = 4 * this.orbitSegments, vertices = [], s_max_sq = 200 / q - 1, s_max = s_max_sq > 0 ? Math.sqrt(s_max_sq) : 10, prev_x, prev_z, i = 0; i <= numSegments; i++) {
            var s = i / numSegments * 2 * s_max - s_max
              , x = q * (1 - s * s)
              , z = 2 * q * s;
            i > 0 && (vertices.push(prev_x, 0, prev_z),
            vertices.push(x, 0, z)),
            prev_x = x,
            prev_z = z
        }
        var geometry = new THREE.BufferGeometry;
        return geometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(vertices),3)),
        geometry
    },
    getOrbitShape: function(a, e) {
        var shape = new THREE.Shape, i, x = 0, y = 0, z = 0, alpha = 0, t = 0, geometry;
        for (r = a * (1 - e * e) / (1 + e * Math.cos(alpha)),
        shape.moveTo(r, 0),
        i = 1; i <= orbits_resolution; i++)
            alpha = i * angular_step,
            r = a * (1 - e * e) / (1 + e * Math.cos(alpha)),
            x = r * Math.cos(alpha),
            y = r * Math.sin(alpha),
            shape.lineTo(x, y);
        return shape.lineTo(r, 0),
        new THREE.ShapeGeometry(shape)
    },
    onWindowResize: function() {
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight),
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight,
        this.camera.updateProjectionMatrix()
    },
    render: function() {
        var delta = this.clock.getDelta();
        this.followedObject && (this.camera.lookAt(this.followedObject.threejs.body.position),
        this.controls.target.x = this.followedObject.threejs.body.position.x,
        this.controls.target.y = this.followedObject.threejs.body.position.y,
        this.controls.target.z = this.followedObject.threejs.body.position.z,
        this.controls.update()),
        this.isCameraAnimated && this.animateCamera(delta),
        this.renderer.render(this.scene, this.camera);
        const sunScreenPos = this.world2Screen(this.objectsArray[0].position);
        for (var key in this.objects) {
            const o = this.objects[key];
            if ("comets" == o.category) {
                const oScreenPosition = this.world2Screen(o.threejs.body.position)
                  , rotAngle = Math.atan2(sunScreenPos.y - oScreenPosition.y, oScreenPosition.x - sunScreenPos.x) - Math.PI / 4;
                o.threejs.body.material.map.center = new THREE.Vector2(.5,.5),
                o.threejs.body.material.map.rotation = rotAngle
            }
        }
    },
    world2Screen: function(position) {
        const width = this.container.clientWidth
          , height = this.container.clientHeight
          , widthHalf = width / 2
          , heightHalf = height / 2;
        var pClone = position.clone();
        return pClone.project(this.camera),
        pClone.x = pClone.x * widthHalf + widthHalf,
        pClone.y = -pClone.y * heightHalf + heightHalf,
        pClone
    },
    deg2rad: function(a) {
        return a * Math.PI / 180
    },
    rad2deg: function(a) {
        return 180 * a / Math.PI
    },
    getTEph: function(utcMillis) {
        return utcMillis / 864e5 + 2440587.5
    },
    getPlanetHeliocentricPosition: function(utcMillis, elements) {
        return this.updateMeanElements(utcMillis, elements),
        this.getObjectHeliocentricPosition(utcMillis, elements)
    },
    getObjectHeliocentricPosition: function(utcMillis, elements) {
        var omega = elements.lp - elements.o, M = this.toNormalRange(elements.ml - elements.lp), E = this.solveKepler(elements.e, M), x = elements.a * (Math.cos(E) - elements.e), y = elements.a * Math.sqrt(1 - elements.e * elements.e) * Math.sin(E), xEcl, yEcl, zEcl;
        return {
            x: (Math.cos(omega) * Math.cos(elements.o) - Math.sin(omega) * Math.sin(elements.o) * Math.cos(elements.i)) * x + (-Math.sin(omega) * Math.cos(elements.o) - Math.cos(omega) * Math.sin(elements.o) * Math.cos(elements.i)) * y,
            y: (Math.cos(omega) * Math.sin(elements.o) + Math.sin(omega) * Math.cos(elements.o) * Math.cos(elements.i)) * x + (-Math.sin(omega) * Math.sin(elements.o) + Math.cos(omega) * Math.cos(elements.o) * Math.cos(elements.i)) * y,
            z: Math.sin(omega) * Math.sin(elements.i) * x + Math.cos(omega) * Math.sin(elements.i) * y,
            r: Math.sqrt(x * x + y * y)
        }
    },
    calculateObjectPosition: function(elements, utcMillis) {
        const e = elements.e
          , i_deg = elements.i
          , o_deg = elements.o
          , ap_deg = elements.ap
          , tpjd = elements.tpjd
          , jd = this.getTEph(utcMillis)
          , t_since_perihelion = jd - tpjd
          , i_rad = this.deg2rad(i_deg)
          , o_rad = this.deg2rad(o_deg)
          , ap_rad = this.deg2rad(ap_deg);
        let x_orb, y_orb;
        if (e < 1) {
            let a = elements.a;
            void 0 === a && void 0 !== elements.p && (a = elements.p / (1 - e));
            const mean_motion_rad_per_day = K_GAUSS / Math.pow(a, 1.5)
              , M = mean_motion_rad_per_day * t_since_perihelion
              , E = this.solveKepler(e, M);
            x_orb = a * (Math.cos(E) - e),
            y_orb = a * Math.sqrt(1 - e * e) * Math.sin(E)
        } else if (1 === e) {
            const q = elements.p
              , nu = this.solveKeplerParabolic(q, t_since_perihelion)
              , r = q * (1 + Math.tan(nu / 2) * Math.tan(nu / 2));
            x_orb = r * Math.cos(nu),
            y_orb = r * Math.sin(nu)
        } else {
            let a;
            if (void 0 !== elements.a)
                a = elements.a;
            else {
                if (void 0 === elements.p)
                    return console.error("Hyperbolic orbit requires semi-major axis 'a' or perihelion distance 'p'."),
                    {
                        x: 0,
                        y: 0,
                        z: 0,
                        r: 0
                    };
                a = elements.p / (e - 1)
            }
            const mean_motion_rad_per_day = K_GAUSS / Math.pow(a, 1.5)
              , M = mean_motion_rad_per_day * t_since_perihelion
              , H = this.solveKeplerHyperbolic(e, M);
            x_orb = a * (e - Math.cosh(H)),
            y_orb = a * Math.sqrt(e * e - 1) * Math.sinh(H)
        }
        const cos_ap = Math.cos(ap_rad)
          , sin_ap = Math.sin(ap_rad)
          , cos_o = Math.cos(o_rad)
          , sin_o = Math.sin(o_rad)
          , cos_i = Math.cos(i_rad)
          , sin_i = Math.sin(i_rad)
          , Px = cos_ap * cos_o - sin_ap * sin_o * cos_i
          , Py = cos_ap * sin_o + sin_ap * cos_o * cos_i
          , Pz = sin_ap * sin_i
          , Qx = -sin_ap * cos_o - cos_ap * sin_o * cos_i
          , Qy = -sin_ap * sin_o + cos_ap * cos_o * cos_i
          , Qz = cos_ap * sin_i
          , xEcl = Px * x_orb + Qx * y_orb
          , yEcl = Py * x_orb + Qy * y_orb
          , zEcl = Pz * x_orb + Qz * y_orb;
        return {
            x: xEcl,
            y: yEcl,
            z: zEcl,
            r: Math.sqrt(x_orb * x_orb + y_orb * y_orb)
        }
    },
    updateMeanElements: function(utcMillis, elements) {
        var tEph, t = (this.getTEph(utcMillis) - 2451545) / 36525;
        elements.a = elements.a0 + elements.ad * t,
        elements.e = elements.e0 + elements.ed * t,
        elements.i = this.deg2rad(elements.i0 + elements.id * t),
        elements.ml = this.deg2rad(elements.ml0 + elements.mld * t),
        elements.lp = this.deg2rad(elements.lp0 + elements.lpd * t),
        elements.o = this.deg2rad(elements.o0 + elements.od * t)
    },
    solveKepler: function(e, M) {
        var threshold = 1e-8, E;
        E = e < .8 ? M : Math.PI;
        for (var dE = 1 / 0, maxIter = 100, i = 0; i < 100 && Math.abs(dE) > 1e-8; i++) {
            var f = E - e * Math.sin(E) - M
              , df = 1 - e * Math.cos(E);
            if (Math.abs(df) < 1e-10)
                break;
            E += dE = -f / df
        }
        return E
    },
    solveKeplerHyperbolic: function(e, M) {
        let H = M;
        e > 1.2 && (H = Math.log(2 * M / e + 1.8)),
        !isNaN(H) && isFinite(H) || (H = 0);
        const threshold = 1e-8;
        let dH = 1 / 0;
        const maxIter = 100;
        for (let i = 0; i < 100 && Math.abs(dH) > 1e-8; i++) {
            const sinhH = Math.sinh(H)
              , coshH = Math.cosh(H)
              , f = e * sinhH - H - M
              , df = e * coshH - 1;
            if (Math.abs(df) < 1e-10)
                break;
            dH = -f / df,
            H += dH
        }
        return H
    },
    solveKeplerParabolic: function(q, t_since_perihelion) {
        const M_parabolic = K_GAUSS * t_since_perihelion / (Math.sqrt(2) * Math.pow(q, 1.5));
        let s = M_parabolic;
        const threshold = 1e-8;
        let dS = 1 / 0;
        const maxIter = 100;
        for (let i = 0; i < 100 && Math.abs(dS) > 1e-8; i++) {
            const f = s * s * s / 3 + s - M_parabolic
              , df = s * s + 1;
            if (Math.abs(df) < 1e-10)
                break;
            dS = -f / df,
            s += dS
        }
        return 2 * Math.atan(s)
    },
    toNormalRange: function(angle) {
        var n, result = angle - 2 * Math.floor(angle / 2 / Math.PI) * Math.PI;
        return result > Math.PI && (result -= 2 * Math.PI),
        result
    },
    getLabel: function(label, font) {
        var texture = this.createTextureFromString(label, font)
          , label = new THREE.Vector3
          , geometry = new THREE.BufferGeometry;
        geometry.vertices = [],
        geometry.vertices.push(label.x, label.y, label.z);
        var material = new THREE.PointsMaterial({
            size: Math.floor(texture.image.width / this.labelOversampligFactor),
            sizeAttenuation: !1,
            map: texture,
            transparent: !0,
            depthTest: !0,
            depthWrite: !1
        }), object;
        return geometry.setAttribute("position", new THREE.Float32BufferAttribute(geometry.vertices,3)),
        new THREE.Points(geometry,material)
    },
    createTextureFromString: function(str, font) {
        var _fontFamily = this.labelFontName
          , _fontSize = this.labelFontSizePixels
          , _fontColor = this.labelFontColor;
        void 0 !== font && (void 0 !== font.family && (_fontFamily = font.family),
        void 0 !== font.size && (_fontSize = font.size),
        void 0 !== font.color && (_fontColor = font.color)),
        _fontSize *= this.labelOversampligFactor;
        var c1, ctx1 = document.createElement("canvas").getContext("2d");
        ctx1.font = _fontSize + "px " + _fontFamily;
        var textMeasure = ctx1.measureText(str)
          , c = document.createElement("canvas");
        c.width = 2 * textMeasure.width + 20 * this.labelOversampligFactor,
        c.height = c.width;
        var ctx = c.getContext("2d");
        ctx.font = _fontSize + "px " + _fontFamily,
        ctx.fillStyle = _fontColor,
        ctx.fillText(str, 0, c.height / 2 + _fontSize / 2);
        var tex = new THREE.Texture(c);
        return tex.needsUpdate = !0,
        tex
    },
    animateCamera: function(delta) {
        this.scene.rotateOnAxis(new THREE.Vector3(this.rotX,this.rotY,this.rotZ), .01 * delta)
    },
    onDocumentMouseMove: function(event) {
        if (this.objectsSelectable && (this.mouseState == this.STATE.CLICK && (this.mouseState = this.STATE.PAN),
        this.mouseState != this.STATE.PAN)) {
            this.mouse.x = event.clientX / window.innerWidth * 2 - 1,
            this.mouse.y = -event.clientY / window.innerHeight * 2 + 1,
            this.rayCaster.setFromCamera(this.mouse, this.camera);
            var intersects = this.rayCaster.intersectObjects(this.objectsArray);
            if (intersects.length > 0 && "" != intersects[0].object.name) {
                if (null != this.selectedObject && intersects[0].object == this.selectedObject)
                    return;
                if (null != this.hilightedObject && this.hilightedObject != intersects[0].object)
                    return;
                null != this.hilightedObject && this.hilightedObject.material.color.setHex(this.previousHilightedObjectColor),
                this.hilightedObject = intersects[0].object,
                this.previousHilightedObjectColor = this.hilightedObject.material.color.getHex(),
                this.hilightedObject.material.color.setHex(this.hilightedObjectColor),
                $("html,body").css("cursor", "pointer")
            } else
                $("html,body").css("cursor", "default"),
                this.hilightedObject && this.hilightedObject != this.selectedObject && this.hilightedObject.material.color.setHex(this.previousHilightedObjectColor),
                this.hilightedObject = null
        }
    },
    onDocumentMouseDown: function(event) {
        this.mouseState = this.STATE.CLICK
    },
    onDocumentMouseUp: function(event) {
        if (this.objectsSelectable) {
            if (this.mouseState != this.STATE.PAN && null != this.hilightedObject && this.hilightedObject != this.selectedObject) {
                null != this.selectedObject && (this.selectedObject.material.color.setHex(this.previousSelectedObjectColor),
                this.selectedObject = null),
                this.selectedObject = this.hilightedObject,
                this.previousSelectedObjectColor = this.previousHilightedObjectColor,
                this.selectedObject.material.color.setHex(this.selectedObjectColor),
                this.cameraFollowObject(this.selectedObject.name, 1);
                for (var i = 0; i < this.lockedObjectListeners.length; i++)
                    this.lockedObjectListeners[i](this.selectedObject)
            }
            this.mouseState = this.STATE.NONE
        }
    },
    addLockedObjectListener: function(listener) {
        this.lockedObjectListeners.push(listener)
    }
};
