# CS559 Framework UI Modes (Spring 2026)

This note documents camera/view behavior for the framework in `GrWorld` + `WorldUI`.

## Modes

The world UI supports four view modes:

1. `Orbit Camera`
2. `Fly Camera`
3. `Follow Object`
4. `Drive Object`

### Orbit Camera

- Uses `OrbitControls`.
- Intended default for general object viewing.
- In solo mode, camera is positioned from `GrObject.lookFromLookAt()`.

### Fly Camera

- Uses `FlyControls`.
- Useful for free navigation in larger scenes.

### Follow Object

- Requires an active object with `rideable` set.
- Camera is parented to the rideable object and positioned behind/above it.

### Drive Object

- Requires an active object with `rideable` set.
- Camera is parented to the rideable object and moved to object-local origin.
- Active object is hidden while driving.

## Solo Mode

`View Solo Object` switches rendering to the solo scene/camera for the selected object.

- Works with each view mode.
- Uses `lookFromLookAt` for initial framing.

## VR Status

VR support remains in the codebase but is disconnected by default.

- VR is enabled only if code explicitly calls `world.enableVR()`.
- Student-facing assignments should not depend on VR behavior.
- Non-VR coursework should assume standard camera/view modes only.

## Notes For Course Authors

- If a scene uses `Drive` or `Follow`, ensure there is at least one object with `rideable` defined.
- If a scene uses `LookAt`, ensure selectable object names are valid and unique.
- Keep mode expectations documented in assignment pages when mode-specific behavior is required.
