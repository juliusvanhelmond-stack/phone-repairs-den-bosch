# 3D model requirements — iPhone 17 exploded view

The homepage section "Ontdek wat wij voor jouw iPhone kunnen betekenen" (`src/components/iphone/`)
is fully built: scroll-driven, reversible exploded view, labels, hover/click focus, information cards
linked to the repair and booking pages, mobile layout, reduced-motion and no-WebGL fallbacks.

**What is missing is the final 3D asset.** No licensed, technically accurate iPhone 17 model with
separate internal components was available (checked: project, Adobe Stock 3D — only two generic
phone slabs without internals). Until it is supplied, a procedurally modelled **stand-in** is shown
(`stand-in-phone.tsx`): iPhone 17 outer dimensions and camera layout, but a simplified, generic
interior. In demo mode the section says so. Do not present the stand-in as an accurate teardown.

## How to plug in the real model

1. Put the file in `public/models/` (or a CDN) and set
   `NEXT_PUBLIC_IPHONE_MODEL_URL=/models/iphone-17-exploded.glb`.
2. Rebuild. `IphoneModel` (`model.tsx`) loads it with `useGLTF`, normalises scale and splits it into
   parts by node name. No other code changes are needed if the naming below is followed.
3. Check the browser console in development: missing parts are reported as
   `[iphone] GLB is missing nodes for parts: …`.

The loading path is tested with a synthetic GLB:
`npx tsx scripts/validation/make-test-glb.ts public/models/test-parts.glb`, then run the dev server
with `NEXT_PUBLIC_IPHONE_MODEL_URL=/models/test-parts.glb`. (Delete the test file afterwards.)

## Asset specification

| Requirement | Value |
| --- | --- |
| Format | glTF 2.0 binary (`.glb`) |
| Compression | Meshopt (`gltfpack -cc`) supported; **no Draco** (would need an external decoder) |
| Size budget | ≤ 4 MB transfer (aim ~2 MB); textures ≤ 2048 px, KTX2/WebP where possible |
| Units / orientation | metres; phone upright along **+Y**, screen facing **+Z**, centred at origin |
| Geometry | separate meshes per component, applied transforms, clean normals, no hidden duplicate geometry |
| Polygons | ≈ 150–300k triangles total; internal parts can be lower detail than the shell |
| Materials | PBR metallic-roughness; glass with low roughness, aluminium metalness 1 |
| Licence | must allow commercial web use for Phone Repairs (and JUNE Studio as builder); keep the licence file in `docs/` |

### Required node names (first match is used)

| Part | Accepted node names | Repair link |
| --- | --- | --- |
| Front glass | `front_glass`, `FrontGlass` | Scherm reparatie |
| OLED display assembly | `display`, `oled_display`, `Display` | Scherm reparatie |
| Internal mid-frame | `midframe`, `MidFrame` | — |
| Aluminium housing / frame | `frame`, `housing`, `Frame` | — |
| Logic board | `logic_board`, `LogicBoard` | — |
| Battery | `battery`, `Battery` | Batterij vervangen |
| Rear camera module(s) | `camera_module`, `rear_camera`, `Camera` | Camera reparatie |
| Charging port (USB-C) assembly | `charging_port`, `usb_c`, `ChargingPort` | Oplaadpoort reparatie |
| Back glass / rear housing | `back_glass`, `BackGlass` | Achterkant reparatie |

Each name may be a group; all meshes below it belong to that part. Extra components
(Taptic Engine, speakers, flex cables) can be added to `PARTS` in `parts.ts` with their own
explode offset and window.

### Where to source it

- Commission a modeller (accurate teardown modelling from iFixit-style references), or
- buy a licensed "iPhone 17 exploded / teardown" model (e.g. CGTrader, TurboSquid) and verify that
  internals are modelled and separable — many models only contain the exterior.

Apple's product design is protected; use the model only in the context of offering repairs for
these devices, without suggesting endorsement by Apple.
