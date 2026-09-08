# WebRenderer

基于 HTML5 Canvas 的软件光栅化 3D 渲染器。不依赖 WebGL，用 TypeScript 在 CPU 上完成顶点变换、三角形扫描线和像素着色，再把结果写入 `ImageData` 画到 2D Canvas。

A software 3D rasterizer on HTML5 Canvas. It does not use WebGL: TypeScript on the CPU handles vertex transforms, triangle scan conversion, and per-pixel shading, then writes an `ImageData` buffer to a 2D canvas.

本仓库是标准的 **Node + TypeScript** 项目：用 **npm** 管理依赖，用 **Vite** 做开发服务器和打包，源码全部是 ES 模块。

---

## 这是什么 / What this is

WebRenderer 是一个教学向的迷你渲染管线，结构接近常见的「场景图 + 相机 + 材质 + 光照」写法，但光栅化过程全部是手写的：

- 透视投影、LookAt 视图矩阵、模型变换（平移 / 旋转）
- Bresenham 画线、平底/平顶三角形扫描线填充
- Z-Buffer 深度测试
- 顶点色插值
- Phong 风格光照（环境光 + 漫反射 + 镜面反射）
- 点光源 / 方向光
- 漫反射贴图 + 高光贴图采样
- 线框模式

它目前只绘制 `Box` 立方体，适合用来理解「一个像素是怎么从 3D 顶点算出来的」，而不是作为通用游戏引擎。

---

## 功能 / Features

| 能力 | 说明 |
| --- | --- |
| 软件光栅化 | `CanvasRenderingContext2D` + `ImageData`，逐像素写颜色 |
| 深度缓冲 | `enableZBuffer` 控制，默认开启 |
| 相机 | 透视投影 `Camera`，`lookAt(pos, target, up)` |
| 场景 | `Scene` 管理子物体和一盏灯 |
| 几何 | `Box`（8 顶点立方体），支持位置、旋转、顶点色、线框 |
| 光照 | `Light.POINT_LIGHT` / `Light.DIRECTION_LIGHT`，环境 / 漫反射 / 高光分量 |
| 材质 | `Material`：纯色 `Color` 或 `Texture`（diffuse + specular） |
| 资源加载 | `ImageLoader` / `TextureLoader` 从 URL 读图并转成 `ImageData` |
| 示例 | 彩色旋转立方体；带贴图与光照的立方体 + 线框立方体 |

---

## 环境 / Requirements

- Node.js 18 或更高
- npm 9 或更高（随 Node 一起安装即可）

---

## 构建与运行 / Build & Run

```shell
npm install
npm run dev
```

浏览器打开终端里提示的本地地址（默认 `http://localhost:5173`）。点击画面可暂停 / 继续旋转。

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | Vite 开发服务器（TypeScript 原生加载，热更新） |
| `npm run build` | 先 `tsc --noEmit` 做类型检查，再打包到 `dist/` |
| `npm run preview` | 预览生产构建 |
| `npm run typecheck` | 只跑 TypeScript 检查 |

Push 和 PR 会跑 GitHub Actions：`npm ci`、`npm run typecheck`、`npm run build`。

在 VS Code 里，默认构建任务（`Shift+Cmd+B` / `Shift+Ctrl+B`）会执行 `npm run build`。

### 切换示例

默认跑彩色立方体。要看光照和贴图，改 `src/main.ts`：

```ts
import { ExampleLightAndTextures } from "./examples/ExampleLightAndTextures";

ExampleLightAndTextures.main();
```

开发模式下保存即可热更新，不必再手动拼接 JS。

---

## 目录结构 / Layout

```
.
├── package.json               # npm 脚本与开发依赖（typescript、vite）
├── package-lock.json
├── tsconfig.json              # ESNext + bundler 解析，strict
├── vite.config.ts
├── index.html                 # Vite 入口，加载 /src/main.ts
├── public/assets/             # 静态贴图（`publicUrl()` 按 Vite `base` 解析）
└── src/
    ├── main.ts                # 应用入口：启动哪个示例
    ├── index.ts               # 公共 API 再导出
    ├── WebRenderer.ts         # 光栅化核心、着色器、Z-Buffer
    ├── Scene.ts / Camera.ts / Vertex.ts
    ├── examples/
    │   ├── ExampleColorfulRectangle.ts
    │   └── ExampleLightAndTextures.ts
    ├── Object3D/
    ├── materials/
    ├── math/
    └── loaders/
```

源码使用 `import` / `export`，不再依赖全局类或 `build.sh` + uglify 拼接。

---

## 渲染管线 / Pipeline

场景里每个 `Box` 会走一条简化的固定管线（见 `src/WebRenderer.ts`）：

```
Scene + Camera
    │
    ▼
drawBox
    ├─ 线框：投影 8 个顶点 → Bresenham 画边
    └─ 实体：drawBoxPipLine
            │
            ▼
        vertexShader
            投影 * 视图 * 模型 → clip space
            记录世界坐标 fragPos、UV
            │
            ▼
        geometryAssemble
            透视除法 (x/w, y/w, z/w)
            NDC → 屏幕坐标
            拆成平底 / 平顶三角形
            │
            ▼
        扫描线插值
            位置、颜色、深度、UV、fragPos
            │
            ▼
        fragmentShader
            无材质：顶点色
            Color 材质：Phong 着色
            Texture 材质：采样贴图后再做 Phong
            │
            ▼
        drawPixel + Z-Buffer → putImageData
```

法线会用 `(model⁻¹)ᵀ` 的 3×3 部分变换，避免非均匀缩放把光照方向弄歪。

---

## 最小用法 / Minimal usage

```ts
import { WebRenderer } from "./WebRenderer";
import { Scene } from "./Scene";
import { Camera } from "./Camera";
import { Box } from "./Object3D/Box";
import { Color } from "./materials/Color";
import { Vec3 } from "./math/Vec3";
import { _Math } from "./math/Math";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const renderer = new WebRenderer(canvas, window.innerWidth, window.innerHeight);

const scene = new Scene();
const camera = new Camera(_Math.radians(45), canvas.width / canvas.height, 10, 80000);
camera.lookAt(new Vec3(2400, 1600, 4000), new Vec3(0, 0, 0), new Vec3(0, 1, 0));

const box = new Box(800, 800, 800);
box.setVertexColor(0, new Color(0xff0000));
scene.addChild(box);

function frame() {
    box.rotation.y += 0.02;
    renderer.renderScene(scene, camera);
    requestAnimationFrame(frame);
}
frame();
```

也可以从包入口一次引入：

```ts
import { WebRenderer, Scene, Camera, Box, Color, Vec3, _Math } from "./index";
```

带材质和点光：

```ts
import { Light } from "./materials/Light";
import { Material } from "./materials/Material";
import { TextureLoader } from "./loaders/TextureLoader";
import { publicUrl } from "./publicUrl";

const light = new Light(new Color(0xffffff), Light.POINT_LIGHT);
light.pos.set(2400, 1600, 2400);
scene.light = light;

const texture = TextureLoader.createTexture()
    .loadDiffuse(publicUrl("assets/container.png"))
    .loadSpecular(publicUrl("assets/container_specular.png"))
    .getTexture();

const material = new Material();
material.diffuse = texture;
material.shininess = 16;
box.material = material;
```

贴图是异步加载的：`getTexture()` 会立刻返回空壳，`ImageData` 到位后下一帧才会带上纹理。

---

## 现状与边界 / Current limits

- 只实现了 `Box`。其他物体类型会在 `renderScene` 里打警告并跳过。
- 场景里只有一盏灯。
- 没有近远平面裁剪三角形、没有背面剔除、没有 MIP、UV 也没有做边界包裹。
- 扫描线插值是线性的，没有透视校正，大透视时贴图可能发飘。
- 渲染算法仍是 2018 年的学习实现；工程结构已改为 npm + TypeScript 模块。

这些限制是刻意的：管线短、每一步都能在一个文件里读完。

---

## License

仓库未声明许可证。以 GitHub 上的默认版权约定为准。
