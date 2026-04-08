# CS559 3D Framework (a.k.a. "Graphics Town")

**This is the Spring 26 Version of the Framework!**

This directory contains framework code to be used for the assignments for the
CS559 (Computer Graphics) class at the University of Wisconsin.

It provides a thin wrapper around the [THREE.JS](https://threejs.org/) library to make it more convenient to do class assignments.

The 2026 version did some cleanup work (with help from AI) to make some of the type descriptions cleaner. It also re-worked the AutoUI organization so that it correctly provides all of the options it was supposed to. This is a direct evolution of the 2021 version, which was a re-write of the 2019 version. There were older versions - but those were before we started to use three.js.

The 2026 master version is built into the Workbooks repository. Things are configured to automatically generate the documentation using JSDOC and publish it to a [GitHub Page](https://cs559.github.io/CS559-Framework26/).

For Spring 2026, we target [THREE.JS](https://threejs.org/) r180 for framework compatibility and course materials. Migrations away from deprecated aspects of three should be complete.

The closest thing to a tutorial for the Framework code is the first workbook/assignment that uses it. It was supposed to be in Workbook 4 of 2026, but got pushed to Workbook 5.

If you want to read about the history of Graphics Town (prior to 2014) and see what the old C++ version was like, read [this](http://graphics.cs.wisc.edu/WP/cs559-fall2014/2014/11/07/project-2-graphics-town-framework-code/). If you want to see the original JavaScript framework, you can look [here](http://graphics.cs.wisc.edu/WP/cs559-fall2015/2015/10/15/project-program-group-2-graphics-town/) for a description. Yes, that really was all the documentation we gave to students.

**WARNING:** The documentation is created using JSDoc, and I am not a JSDoc expert. You should also read the code directly. There may also be version skew between the documentation and the code. Trust the code.

A version of the documentation is available on [GitHub Pages](https://cs559.github.io/CS559-Framework/). This is automatically built by GitHub (using continuous integration) and stored in a branch.

## What is this anyway?

The framework is some common code that sets up simple demos in that use [THREE.JS](https://threejs.org/).
It's main goal is to make it easier to get simple demos done. It takes care of the common things you need to 
put into every single demo you make, so you don't have to re-type it every time. The framework code allows you to focus on creating graphics objects and defining their behavior (for animation). You don’t need to worry about setting up a user interface, or the basic stuff of the world. It will give you “good enough” defaults that you can focus on the parts of the assignment you care about.

The main pieces that the Framework provides:

1. **A "World"** - `GrWorld` is the basic container of your world. It contains a THREE.js `Scene` and a `THREE.js` renderer. When you create the world, it takes care of setting up the Scene and Renderer (including putting the Canvas on the page). It creates some lights, cameras, and a groundplane. The `GrWorld` constructor takes a lot of parameters, so you can tweak things to your needs.

2. **Objects** - `GrObject` is a wrapper around THREE `Object3D` (or to be more precise, it can contain a list of them). It helps add a bit more functionality for objects, including animation, control panels, things for viewing, ...

3. **Control Panels** - `AutoUI` will automatically make control panels for your objects (so you can manipulate the sliders with parameters). Note: the control panel works best if it is attached to a world, and should be configured through the world options. Individual objects can override the world defaults (but this is not recommended)

4. **Convenience Objects** - There is an OBJ loader, an FBX loader, a GLTF, and a shader loader - all things you could do yourself. The built-in ones put temporary objects in place while the real objects load.

5. **Sample Objects** - for reference.

6. **An Animation Loop** - so you don't need to write it yourself (again).

None of this is complicated. Basically, the Framework takes care of doing a bunch of the boring stuff you need to do each time you make another small program. This lets us try things out quickly.

The framework is designed to make it easy to build bigger things by putting more of the code into objects. For example, each object can take care of its own animation and slider-based user interface; the infrastructure assembles these together.

## What you really want to know

Most of the work that you will do (as a student) will be creating subclasses of `GrObject` to make new kinds of objects for the world. You should make sure you understand how `GrObject` works. You can see examples in `SimpleObjects` and `TestObjects`. Even more examples are provided with the assignments and the online demos given with lectures.

## Some important details

Because you need to have the objects when the `GrObject` is created, this can be a problem if you don't have the object immediately (for example, if you are loading an obj file). The best way to deal with this is to create a THREE `Group` object when the `GrObject` is created and then add the new object to the group. Even better: put a temporary object into the group, and replace it with the new object when it is loaded. Here is a simple example (using `sleep` rather than a real loader, but it's the same delayed execution thing). Beware of the non-lexical `this` (you can't use `this` in the deferred function). What this example does is create an Object that is a cube initially, but changes to a TorusKnot after 2 seconds.

```javascript
export class BetterDelayTest extends GrObject {
  constructor() {
    let group = new T.Group();
    super("Delay-Test", group);
    this.group = group;
    // make a cube that will be there temporarily
    let tempCube = new T.Mesh(
      new T.BoxGeometry(),
      new T.MeshStandardMaterial()
    );
    group.add(tempCube);
    // use sleep, rather than OBJ loader
    sleep(2000).then(function() {
      group.remove(tempCube);
      group.add(
        new T.Mesh(
          new T.TorusKnotGeometry(),
          new T.MeshStandardMaterial({ color: "purple" })
        )
      );
    });
  }
}
```

## Updating to 26

This section captures the one-time framework modernization policy for Spring 2026.

1. Runtime target is pinned to `three r180` (`0.180.0`) for the semester.
2. Backward compatibility with pre-26 workbook code is not required.
3. Existing workbook pages are expected to be updated as part of the rollout.
4. `GLTFLoader` is preferred for new examples, but OBJ/MTL and FBX remain supported.
5. VR support remains optional and disconnected by default (only enabled via explicit `world.enableVR()`).

### UI behavior

Camera/view mode behavior is documented in `UI.md`.

### AutoUI migration (Spring 2026)

`AutoUI` now uses a world-scoped options object API.

1. Old positional constructor calls are removed.
2. Global page-level UI fallback (`panel-panel` and shared `#gui`) is removed.
3. UI placement/style defaults come from `GrWorld` via `world.getAutoUIOptions()`.
4. Default lil-gui placement is `canvas-overlay`, which anchors controls to the world canvas container.
5. Optional lil-gui placement `floating` uses the page top-right corner.

`canvas-overlay` is container-relative by design. This can be surprising in multi-view
layouts (like camera toy): if a world's canvas shares a larger flex/grid container with
other elements, the panel anchors to that world's container top-right, which may appear
beside the canvas rather than directly over a canvas corner.

If you want strict per-canvas overlay, give each world its own dedicated container and use
that as `where` (or provide per-world `where` via `setAutoUIOptions`).

#### New usage pattern

```javascript
const world = new GrWorld({ where: someContainer });
new AutoUI(myObject, { world });
```

#### Overriding for special demos

```javascript
new AutoUI(myObject, {
  world,
  where: customDiv,
  width: 280,
  widthdiv: 1,
  adjusted: true,
  useLilGUI: false,
  labelDisplay: "inline"
});

// World-level policy examples:
// world.setAutoUIOptions({ guiPlacement: "floating" });      // page top-right
// world.setAutoUIOptions({ guiPlacement: "where" });         // place in world.where container
// world.setAutoUIOptions({ guiPlacement: "canvas-overlay" }); // overlay top-right of canvas container (default)
```

#### How to update external demos (not in this workspace)

1. Replace every `new AutoUI(obj, ...)` positional call with `new AutoUI(obj, { ... })`.
2. Add `world` in the options object for each call.
3. Move former positional args into named options:
4. `width` from arg 2
5. `where` from arg 3
6. `widthdiv` from arg 4
7. `adjusted` from arg 5
8. `useLilGUI` and `labelDisplay` from old arg 6 behavior
9. Ensure each world has a UI container (`GrWorld({ where: ... })`), or explicitly pass `where` per AutoUI.
10. For multi-world pages, pass each world's own container so controls do not mix.

#### Why this change

1. One coherent control panel policy per world.
2. No global DOM id collisions across demos.
3. Cleaner support for pages with multiple worlds/renderers.

### Type checking

Workspace-level JS type checking is provided via:

1. `tsconfig.typecheck.json`
2. VS Code task `Typecheck Workbook JS`

Canonical command:

```bash
npx -y -p typescript tsc -p tsconfig.typecheck.json --noEmit
```

This avoids requiring a globally installed `tsc` binary.

##  License

This library is provided under a 2-clause BSD open source license. 

From: https://opensource.org/licenses/BSD-2-Clause

Copyright &copy; 2021,2023, 2026 Michael Gleicher

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
