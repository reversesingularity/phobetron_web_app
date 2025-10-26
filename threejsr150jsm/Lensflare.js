import {AdditiveBlending, Box2, BufferGeometry, Color, FramebufferTexture, InterleavedBuffer, InterleavedBufferAttribute, Mesh, MeshBasicMaterial, RawShaderMaterial, Vector2, Vector3, Vector4, RGBAFormat} from "three";
class Lensflare extends Mesh {
    constructor() {
        super(Lensflare.Geometry, new MeshBasicMaterial({
            opacity: 0,
            transparent: !0
        })),
        this.isLensflare = !0,
        this.type = "Lensflare",
        this.frustumCulled = !1,
        this.renderOrder = 1 / 0;
        const positionScreen = new Vector3
          , positionView = new Vector3
          , tempMap = new FramebufferTexture(16,16,RGBAFormat)
          , occlusionMap = new FramebufferTexture(16,16,RGBAFormat)
          , geometry = Lensflare.Geometry
          , material1a = new RawShaderMaterial({
            uniforms: {
                scale: {
                    value: null
                },
                screenPosition: {
                    value: null
                }
            },
            vertexShader: "\n\n\t\t\t\tprecision highp float;\n\n\t\t\t\tuniform vec3 screenPosition;\n\t\t\t\tuniform vec2 scale;\n\n\t\t\t\tattribute vec3 position;\n\n\t\t\t\tvoid main() {\n\n\t\t\t\t\tgl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );\n\n\t\t\t\t}",
            fragmentShader: "\n\n\t\t\t\tprecision highp float;\n\n\t\t\t\tvoid main() {\n\n\t\t\t\t\tgl_FragColor = vec4( 1.0, 0.0, 1.0, 1.0 );\n\n\t\t\t\t}",
            depthTest: !0,
            depthWrite: !1,
            transparent: !1
        })
          , material1b = new RawShaderMaterial({
            uniforms: {
                map: {
                    value: tempMap
                },
                scale: {
                    value: null
                },
                screenPosition: {
                    value: null
                }
            },
            vertexShader: "\n\n\t\t\t\tprecision highp float;\n\n\t\t\t\tuniform vec3 screenPosition;\n\t\t\t\tuniform vec2 scale;\n\n\t\t\t\tattribute vec3 position;\n\t\t\t\tattribute vec2 uv;\n\n\t\t\t\tvarying vec2 vUV;\n\n\t\t\t\tvoid main() {\n\n\t\t\t\t\tvUV = uv;\n\n\t\t\t\t\tgl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );\n\n\t\t\t\t}",
            fragmentShader: "\n\n\t\t\t\tprecision highp float;\n\n\t\t\t\tuniform sampler2D map;\n\n\t\t\t\tvarying vec2 vUV;\n\n\t\t\t\tvoid main() {\n\n\t\t\t\t\tgl_FragColor = texture2D( map, vUV );\n\n\t\t\t\t}",
            depthTest: !1,
            depthWrite: !1,
            transparent: !1
        })
          , mesh1 = new Mesh(geometry,material1a)
          , elements = []
          , shader = LensflareElement.Shader
          , material2 = new RawShaderMaterial({
            uniforms: {
                map: {
                    value: null
                },
                occlusionMap: {
                    value: occlusionMap
                },
                color: {
                    value: new Color(16777215)
                },
                scale: {
                    value: new Vector2
                },
                screenPosition: {
                    value: new Vector3
                }
            },
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            blending: AdditiveBlending,
            transparent: !0,
            depthWrite: !1
        })
          , mesh2 = new Mesh(geometry,material2);
        this.addElement = function(element) {
            elements.push(element)
        }
        ;
        const scale = new Vector2
          , screenPositionPixels = new Vector2
          , validArea = new Box2
          , viewport = new Vector4;
        this.onBeforeRender = function(renderer, scene, camera) {
            renderer.getCurrentViewport(viewport);
            const invAspect = viewport.w / viewport.z
              , halfViewportWidth = viewport.z / 2
              , halfViewportHeight = viewport.w / 2;
            let size = 16 / viewport.w;
            if (scale.set(size * invAspect, size),
            validArea.min.set(viewport.x, viewport.y),
            validArea.max.set(viewport.x + (viewport.z - 16), viewport.y + (viewport.w - 16)),
            positionView.setFromMatrixPosition(this.matrixWorld),
            positionView.applyMatrix4(camera.matrixWorldInverse),
            !(positionView.z > 0) && (positionScreen.copy(positionView).applyMatrix4(camera.projectionMatrix),
            screenPositionPixels.x = viewport.x + positionScreen.x * halfViewportWidth + halfViewportWidth - 8,
            screenPositionPixels.y = viewport.y + positionScreen.y * halfViewportHeight + halfViewportHeight - 8,
            validArea.containsPoint(screenPositionPixels))) {
                renderer.copyFramebufferToTexture(screenPositionPixels, tempMap);
                let uniforms = material1a.uniforms;
                uniforms.scale.value = scale,
                uniforms.screenPosition.value = positionScreen,
                renderer.renderBufferDirect(camera, null, geometry, material1a, mesh1, null),
                renderer.copyFramebufferToTexture(screenPositionPixels, occlusionMap),
                uniforms = material1b.uniforms,
                uniforms.scale.value = scale,
                uniforms.screenPosition.value = positionScreen,
                renderer.renderBufferDirect(camera, null, geometry, material1b, mesh1, null);
                const vecX = 2 * -positionScreen.x
                  , vecY = 2 * -positionScreen.y;
                for (let i = 0, l = elements.length; i < l; i++) {
                    const element = elements[i]
                      , uniforms = material2.uniforms;
                    uniforms.color.value.copy(element.color),
                    uniforms.map.value = element.texture,
                    uniforms.screenPosition.value.x = positionScreen.x + vecX * element.distance,
                    uniforms.screenPosition.value.y = positionScreen.y + vecY * element.distance,
                    size = element.size / viewport.w;
                    const invAspect = viewport.w / viewport.z;
                    uniforms.scale.value.set(size * invAspect, size),
                    material2.uniformsNeedUpdate = !0,
                    renderer.renderBufferDirect(camera, null, geometry, material2, mesh2, null)
                }
            }
        }
        ,
        this.dispose = function() {
            material1a.dispose(),
            material1b.dispose(),
            material2.dispose(),
            tempMap.dispose(),
            occlusionMap.dispose();
            for (let i = 0, l = elements.length; i < l; i++)
                elements[i].texture.dispose()
        }
    }
}
class LensflareElement {
    constructor(texture, size=1, distance=0, color=new Color(16777215)) {
        this.texture = texture,
        this.size = size,
        this.distance = distance,
        this.color = color
    }
}
LensflareElement.Shader = {
    uniforms: {
        map: {
            value: null
        },
        occlusionMap: {
            value: null
        },
        color: {
            value: null
        },
        scale: {
            value: null
        },
        screenPosition: {
            value: null
        }
    },
    vertexShader: "\n\n\t\tprecision highp float;\n\n\t\tuniform vec3 screenPosition;\n\t\tuniform vec2 scale;\n\n\t\tuniform sampler2D occlusionMap;\n\n\t\tattribute vec3 position;\n\t\tattribute vec2 uv;\n\n\t\tvarying vec2 vUV;\n\t\tvarying float vVisibility;\n\n\t\tvoid main() {\n\n\t\t\tvUV = uv;\n\n\t\t\tvec2 pos = position.xy;\n\n\t\t\tvec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );\n\t\t\tvisibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );\n\t\t\tvisibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );\n\t\t\tvisibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );\n\t\t\tvisibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );\n\t\t\tvisibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );\n\t\t\tvisibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );\n\t\t\tvisibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );\n\t\t\tvisibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );\n\n\t\t\tvVisibility =        visibility.r / 9.0;\n\t\t\tvVisibility *= 1.0 - visibility.g / 9.0;\n\t\t\tvVisibility *=       visibility.b / 9.0;\n\n\t\t\tgl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );\n\n\t\t}",
    fragmentShader: "\n\n\t\tprecision highp float;\n\n\t\tuniform sampler2D map;\n\t\tuniform vec3 color;\n\n\t\tvarying vec2 vUV;\n\t\tvarying float vVisibility;\n\n\t\tvoid main() {\n\n\t\t\tvec4 texture = texture2D( map, vUV );\n\t\t\ttexture.a *= vVisibility;\n\t\t\tgl_FragColor = texture;\n\t\t\tgl_FragColor.rgb *= color;\n\n\t\t}"
},
Lensflare.Geometry = function() {
    const geometry = new BufferGeometry
      , float32Array = new Float32Array([-1, -1, 0, 0, 0, 1, -1, 0, 1, 0, 1, 1, 0, 1, 1, -1, 1, 0, 0, 1])
      , interleavedBuffer = new InterleavedBuffer(float32Array,5);
    return geometry.setIndex([0, 1, 2, 0, 2, 3]),
    geometry.setAttribute("position", new InterleavedBufferAttribute(interleavedBuffer,3,0,!1)),
    geometry.setAttribute("uv", new InterleavedBufferAttribute(interleavedBuffer,2,3,!1)),
    geometry
}();
export {Lensflare, LensflareElement};
