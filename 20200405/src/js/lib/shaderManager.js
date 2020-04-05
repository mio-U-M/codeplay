import { IMG_DIR } from "../../constants.yml";
import gsap from "gsap";
import vert from "../../shader/vertics.vert";
import frag from "../../shader/fragment.frag";

const TEXTURE_1 = `${IMG_DIR}/texture1.jpg`;
const TEXTURE_1_BLUR = `${IMG_DIR}/texture1_blur.jpg`;

export default class ShaderManager {
    constructor(canvas) {
        this.canvas = canvas;

        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.mesh = null;

        this.texture = [];
        this.uniforms = null;

        // animation
        this.isBlurActive = false;
    }

    init() {
        this.setupWebgl();
        this.resize();

        gsap.ticker.add(time => {
            if (this.isBlurActive && this.uniforms.uMainOpacity.value > 0) {
                this.uniforms.uMainOpacity.value -= 0.05;
            }
            if (!this.isBlurActive && this.uniforms.uMainOpacity.value < 1.0) {
                this.uniforms.uMainOpacity.value += 0.05;
            }

            this.uniforms.uTime.value = time;
            this.renderer.render(this.scene, this.camera);
        });
    }

    setupWebgl() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true
        });
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera();
        const geometry = new THREE.PlaneBufferGeometry(2, 2, 128, 128);

        // texture
        this.texture.push(new THREE.TextureLoader().load(TEXTURE_1));
        this.texture.push(new THREE.TextureLoader().load(TEXTURE_1_BLUR));

        this.uniforms = {
            uResolution: { type: "v2", value: new THREE.Vector2() },
            uTime: { type: "f", value: 0 },
            uTexture1: {
                type: "t",
                value: this.texture[0]
            },
            uTexture1Blur: {
                type: "t",
                value: this.texture[1]
            },
            // blur
            uMainOpacity: { type: "f", value: 1.0 }
        };

        const material = new THREE.RawShaderMaterial({
            uniforms: this.uniforms,
            fragmentShader: frag,
            vertexShader: vert
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    resize() {
        const size =
            window.innerWidth > window.innerHeight
                ? window.innerWidth
                : window.innerHeight;
        this.canvas.style.width = window.innerWidth;
        this.canvas.style.height = window.innerHeight;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.uniforms.uResolution.value.x = this.renderer.domElement.width;
        this.uniforms.uResolution.value.y = this.renderer.domElement.height;
    }

    changeView() {
        this.isBlurActive = !this.isBlurActive;
    }
}
