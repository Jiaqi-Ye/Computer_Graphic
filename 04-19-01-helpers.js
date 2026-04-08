// Helper functions
// Students do not need to change these - but they may need to read the 
// code to understand where things are
// @ts-check
/* jshint -W069, esversion:6 */
import * as T from "https://unpkg.com/three@0.180.0/build/three.module.js";


// Simple wrapper function for code to set up the basic scene
// Specifically, sets up the stuff students don't need to use directly.
// This makes a scene, places the 4 pedestals, and makes an ambient light
export function setupBasicScene() {
    // make a scene
    let scene = new T.Scene();

    // make a ground plane.
    let geometry1 = new T.BoxGeometry(10, 0.1, 10);
    let material1 = new T.MeshStandardMaterial({
      color: "#dddddd",
      metalness: 0.2,
      roughness: 0.8
    });
    /**@type{T.Mesh} */
    let ground = new T.Mesh(geometry1, material1);
    ground.position.set(0, -1, 0);
    scene.add(ground);

    /* Make the 4 pedestals */

    let locs = [-2, 2];
    /**@type{T.BufferGeometry} */
    let geometry2 = new T.CylinderGeometry(0.5, 0.75, 2, 16, 8);
    /**@type{T.Material} */
    let material2 = new T.MeshPhongMaterial({
      color: "#888888",
      shininess: 50
    });
    locs.forEach(function(x_loc) {
      locs.forEach(function(z_loc) {
        /**@type{T.Mesh} */
        let object = new T.Mesh(geometry2, material2);
        object.position.x = x_loc;
        object.position.z = z_loc;
        object.position.y = 0;
        object.receiveShadow = true;

        scene.add(object);
      });
    });

    /**@type{T.AmbientLight} */
    let amb_light = new T.AmbientLight(0xffffff, 0.2);
    scene.add(amb_light);

    // make sure to return it
    return scene;
}



