// @ts-check

import * as T from "three";
import { GrObject } from "CS559-Framework/GrObject.js";

let simpleRoundaboutObCtr = 0;
// A simple merry-go-round.
/**
 * @typedef SimpleRoundaboutProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrSimpleRoundabout extends GrObject {
  /**
   * @param {SimpleRoundaboutProperties} params
   */
  constructor(params = {}) {
    let simpleRoundabout = new T.Group();

    let base_geom = new T.CylinderGeometry(0.5, 1, 0.5, 16);
    let base_mat = new T.MeshStandardMaterial({
      color: "#888888",
      metalness: 0.5,
      roughness: 0.8
    });
    let base = new T.Mesh(base_geom, base_mat);
    base.translateY(0.25);
    simpleRoundabout.add(base);

    let platform_geom = new T.CylinderGeometry(2, 1.8, 0.3, 8, 4);
    let platform_mat = new T.MeshStandardMaterial({
      color: "blue",
      metalness: 0.3,
      roughness: 0.6
    });

    let platform_group = new T.Group();
    base.add(platform_group);
    platform_group.translateY(0.25);
    let platform = new T.Mesh(platform_geom, platform_mat);
    platform_group.add(platform);

    // note that we have to make the Object3D before we can call
    // super and we have to call super before we can use this
    super(`SimpleRoundabout-${simpleRoundaboutObCtr++}`, simpleRoundabout);
    this.whole_ob = simpleRoundabout;
    this.platform = platform_group;

    // put the object in its place
    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    simpleRoundabout.scale.set(scale, scale, scale);
  }
  /**
   * StepWorld method
   * @param {*} delta 
   * @param {*} timeOfDay 
   */
  stepWorld(delta, timeOfDay) {
    this.platform.rotateY(0.005 * delta);
  }

}

let roundaboutObCtr = 0;
// A colorful merry-go-round, with handles and differently-colored sections.
/**
 * @typedef ColoredRoundaboutProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrColoredRoundabout extends GrObject {
  /**
   * @param {ColoredRoundaboutProperties} params
   */
  constructor(params = {}) {
    let roundabout = new T.Group();

    let base_geom = new T.CylinderGeometry(0.5, 1, 0.5, 16);
    let base_mat = new T.MeshStandardMaterial({
      color: "#888888",
      metalness: 0.5,
      roughness: 0.8
    });
    let base = new T.Mesh(base_geom, base_mat);
    base.translateY(0.25);
    roundabout.add(base);

    let platform_group = new T.Group();
    base.add(platform_group);
    platform_group.translateY(0.25);

    let section_geom = new T.CylinderGeometry(
      2,
      1.8,
      0.3,
      8,
      4,
      false,
      0,
      Math.PI / 2
    );
    let section_mat;
    let section;

    let handle_geom = buildHandle();
    let handle_mat = new T.MeshStandardMaterial({
      color: "#999999",
      metalness: 0.8,
      roughness: 0.2
    });
    let handle;

    // in the loop below, we add four differently-colored sections, with handles,
    // all as part of the platform group.
    let section_colors = ["red", "blue", "yellow", "green"];
    for (let i = 0; i < section_colors.length; i++) {
      section_mat = new T.MeshStandardMaterial({
        color: section_colors[i],
        metalness: 0.3,
        roughness: 0.6
      });
      section = new T.Mesh(section_geom, section_mat);
      handle = new T.Mesh(handle_geom, handle_mat);
      section.add(handle);
      handle.rotation.set(0, Math.PI / 4, 0);
      handle.translateZ(1.5);
      platform_group.add(section);
      section.rotateY((i * Math.PI) / 2);
    }

    // note that we have to make the Object3D before we can call
    // super and we have to call super before we can use this
    super(`Roundabout-${roundaboutObCtr++}`, roundabout);
    this.whole_ob = roundabout;
    this.platform = platform_group;

    // put the object in its place
    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    roundabout.scale.set(scale, scale, scale);

    // This helper function defines a curve for the merry-go-round's handles,
    // then extrudes a tube along the curve to make the actual handle geometry.
    function buildHandle() {
      /**@type T.CurvePath */
      let handle_curve = new T.CurvePath();
      handle_curve.add(
        new T.LineCurve3(new T.Vector3(-0.5, 0, 0), new T.Vector3(-0.5, 0.8, 0))
      );
      handle_curve.add(
        new T.CubicBezierCurve3(
          new T.Vector3(-0.5, 0.8, 0),
          new T.Vector3(-0.5, 1, 0),
          new T.Vector3(0.5, 1, 0),
          new T.Vector3(0.5, 0.8, 0)
        )
      );
      handle_curve.add(
        new T.LineCurve3(new T.Vector3(0.5, 0.8, 0), new T.Vector3(0.5, 0, 0))
      );
      return new T.TubeGeometry(handle_curve, 64, 0.1, 8);
    }
  }
  /**
   * StepWorld Method
   * @param {*} delta 
   * @param {*} timeOfDay 
   */
  stepWorld(delta, timeOfDay) {
    this.platform.rotateY(0.005 * delta);
  }


}

let simpleSwingObCtr = 0;

// A basic, one-seat swingset.
/**
 * @typedef SimpleSwingProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrSimpleSwing extends GrObject {
  /**
   * @param {SimpleSwingProperties} params
   */
  constructor(params = {}) {
    let simpleSwing = new T.Group();
    addPosts(simpleSwing);

    // Here, we create a "hanger" group, which the swing chains will hang from.
    // The "chains" for the simple swing are just a couple thin cylinders.
    let hanger = new T.Group();
    simpleSwing.add(hanger);
    hanger.translateY(1.8);
    let chain_geom = new T.CylinderGeometry(0.05, 0.05, 1.4);
    let chain_mat = new T.MeshStandardMaterial({
      color: "#777777",
      metalness: 0.8,
      roughness: 0.2
    });
    let l_chain = new T.Mesh(chain_geom, chain_mat);
    let r_chain = new T.Mesh(chain_geom, chain_mat);
    hanger.add(l_chain);
    hanger.add(r_chain);
    l_chain.translateY(-0.75);
    l_chain.translateZ(0.4);
    r_chain.translateY(-0.75);
    r_chain.translateZ(-0.4);

    let seat_group = new T.Group();
    let seat_geom = new T.BoxGeometry(0.4, 0.1, 1);
    let seat_mat = new T.MeshStandardMaterial({
      color: "#554433",
      metalness: 0.1,
      roughness: 0.6
    });
    let seat = new T.Mesh(seat_geom, seat_mat);
    seat_group.add(seat);
    seat_group.position.set(0, -1.45, 0);
    hanger.add(seat_group);

    // note that we have to make the Object3D before we can call
    // super and we have to call super before we can use this
    super(`SimpleSwing-${simpleSwingObCtr++}`, simpleSwing);
    this.whole_ob = simpleSwing;
    this.hanger = hanger;
    this.seat = seat_group;

    // put the object in its place
    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    simpleSwing.scale.set(scale, scale, scale);

    this.swing_max_rotation = Math.PI / 4;
    this.swing_direction = 1;

    // This helper function creates the 5 posts for a swingset frame,
    // and positions them appropriately.
    function addPosts(group) {
      let post_material = new T.MeshStandardMaterial({
        color: "red",
        metalness: 0.6,
        roughness: 0.5
      });
      let post_geom = new T.CylinderGeometry(0.1, 0.1, 2, 16);
      let flPost = new T.Mesh(post_geom, post_material);
      group.add(flPost);
      flPost.position.set(0.4, 0.9, 0.9);
      flPost.rotateZ(Math.PI / 8);
      let blPost = new T.Mesh(post_geom, post_material);
      group.add(blPost);
      blPost.position.set(-0.4, 0.9, 0.9);
      blPost.rotateZ(-Math.PI / 8);
      let frPost = new T.Mesh(post_geom, post_material);
      group.add(frPost);
      frPost.position.set(0.4, 0.9, -0.9);
      frPost.rotateZ(Math.PI / 8);
      let brPost = new T.Mesh(post_geom, post_material);
      group.add(brPost);
      brPost.position.set(-0.4, 0.9, -0.9);
      brPost.rotateZ(-Math.PI / 8);
      let topPost = new T.Mesh(post_geom, post_material);
      group.add(topPost);
      topPost.position.set(0, 1.8, 0);
      topPost.rotateX(-Math.PI / 2);
    }
  }
  /* stepWorld method - make the swing swing! */
    stepWorld(delta, timeOfDay) {
        // if we swing too far forward or too far backward, switch directions.
        if (this.hanger.rotation.z >= this.swing_max_rotation)
            this.swing_direction = -1;
        else if (this.hanger.rotation.z <= -this.swing_max_rotation)
            this.swing_direction = 1;
        this.hanger.rotation.z += this.swing_direction * 0.003 * delta;
    }

}

let swingObCtr = 0;

// A more complicated, one-seat swingset.
// This one has actual chain links for its chains,
// and uses a nicer animation to give a more physically-plausible motion.
/**
 * @typedef AdvancedSwingProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrAdvancedSwing extends GrObject {
  /**
   * @param {AdvancedSwingProperties} params
   */
  constructor(params = {}) {
    let swing = new T.Group();
    addPosts(swing);

    let hanger = new T.Group();
    swing.add(hanger);
    hanger.translateY(1.8);
    let l_chain = new T.Group();
    let r_chain = new T.Group();
    hanger.add(l_chain);
    hanger.add(r_chain);
    // after creating chain groups, call the function to add chain links.
    growChain(l_chain, 20);
    growChain(r_chain, 20);
    l_chain.translateZ(0.4);
    r_chain.translateZ(-0.4);

    let seat_group = new T.Group();
    let seat_geom = new T.BoxGeometry(0.4, 0.1, 1);
    let seat_mat = new T.MeshStandardMaterial({
      color: "#554433",
      metalness: 0.1,
      roughness: 0.6
    });
    let seat = new T.Mesh(seat_geom, seat_mat);
    seat_group.add(seat);
    seat_group.position.set(0, -1.45, 0);
    hanger.add(seat_group);

    // note that we have to make the Object3D before we can call
    // super and we have to call super before we can use this
    super(`Swing-${swingObCtr++}`, swing);
    this.whole_ob = swing;
    this.hanger = hanger;
    this.seat = seat_group;

    // put the object in its place
    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    swing.scale.set(scale, scale, scale);

    this.swing_angle = 0;

    // This helper function creates the 5 posts for a swingset frame,
    // and positions them appropriately.
    function addPosts(group) {
      let post_material = new T.MeshStandardMaterial({
        color: "red",
        metalness: 0.6,
        roughness: 0.5
      });
      let post_geom = new T.CylinderGeometry(0.1, 0.1, 2, 16);
      let flPost = new T.Mesh(post_geom, post_material);
      group.add(flPost);
      flPost.position.set(0.4, 0.9, 0.9);
      flPost.rotateZ(Math.PI / 8);
      let blPost = new T.Mesh(post_geom, post_material);
      group.add(blPost);
      blPost.position.set(-0.4, 0.9, 0.9);
      blPost.rotateZ(-Math.PI / 8);
      let frPost = new T.Mesh(post_geom, post_material);
      group.add(frPost);
      frPost.position.set(0.4, 0.9, -0.9);
      frPost.rotateZ(Math.PI / 8);
      let brPost = new T.Mesh(post_geom, post_material);
      group.add(brPost);
      brPost.position.set(-0.4, 0.9, -0.9);
      brPost.rotateZ(-Math.PI / 8);
      let topPost = new T.Mesh(post_geom, post_material);
      group.add(topPost);
      topPost.position.set(0, 1.8, 0);
      topPost.rotateX(-Math.PI / 2);
    }

    // Helper function to add "length" number of links to a chain.
    function growChain(group, length) {
      let chain_geom = new T.TorusGeometry(0.05, 0.015);
      let chain_mat = new T.MeshStandardMaterial({
        color: "#777777",
        metalness: 0.8,
        roughness: 0.2
      });
      let link = new T.Mesh(chain_geom, chain_mat);
      group.add(link);
      for (let i = 0; i < length; i++) {
        let l_next = new T.Mesh(chain_geom, chain_mat);
        l_next.translateY(-0.07);
        link.add(l_next);
        l_next.rotation.set(0, Math.PI / 3, 0);
        link = l_next;
      }
    }
  }
  /**
   * StepWorld method
   * @param {*} delta 
   * @param {*} timeOfDay 
   */
  stepWorld(delta, timeOfDay) {
    // in this animation, use the sine of the accumulated angle to set current rotation.
    // This means the swing moves faster as it reaches the bottom of a swing,
    // and faster at either end of the swing, like a pendulum should.
    this.swing_angle += 0.005 * delta;
    this.hanger.rotation.z = (Math.sin(this.swing_angle) * Math.PI) / 4;
    this.seat.rotation.z = (Math.sin(this.swing_angle) * Math.PI) / 16;
  }

}


let carouselObCtr = 0;
// A Carousel.
/**
 * @typedef CarouselProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrCarousel extends GrObject {
  /**
   * @param {CarouselProperties} params
   */
  constructor(params = {}) {
    let width = 3;
    let carousel = new T.Group();

    let base_geom = new T.CylinderGeometry(width, width, 1, 32);
    let base_mat = new T.MeshStandardMaterial({
      color: "lightblue",
      metalness: 0.3,
      roughness: 0.8,
      emissive: "#223344",
      emissiveIntensity: 0.1
    });
    let base = new T.Mesh(base_geom, base_mat);
    base.translateY(0.5);
    carousel.add(base);

    let platform_group = new T.Group();
    base.add(platform_group);
    platform_group.translateY(0.5);

    let platform_geom = new T.CylinderGeometry(
      0.95 * width,
      0.95 * width,
      0.2,
      32
    );
    let platform_mat = new T.MeshStandardMaterial({
      color: "gold",
      metalness: 0.3,
      roughness: 0.8
    });
    let platform = new T.Mesh(platform_geom, platform_mat);
    platform_group.add(platform);

    let cpole_geom = new T.CylinderGeometry(0.3 * width, 0.3 * width, 3, 16);
    let cpole_mat = new T.MeshStandardMaterial({
      color: "gold",
      metalness: 0.8,
      roughness: 0.5
    });
    let cpole = new T.Mesh(cpole_geom, cpole_mat);
    platform_group.add(cpole);
    cpole.translateY(1.5);

    let top_trim = new T.Mesh(platform_geom, platform_mat);
    platform_group.add(top_trim);
    top_trim.translateY(3);

    let opole_geom = new T.CylinderGeometry(0.03 * width, 0.03 * width, 3, 16);
    let opole_mat = new T.MeshStandardMaterial({
      color: "#aaaaaa",
      metalness: 0.8,
      roughness: 0.5
    });
    let opole;
    let num_poles = 10;
    let poles = [];
    let horses = [];
    let horse_phases = [];
    for (let i = 0; i < num_poles; i++) {
      opole = new T.Mesh(opole_geom, opole_mat);
      platform_group.add(opole);
      opole.translateY(1.5);
      opole.rotateY((2 * i * Math.PI) / num_poles);
      opole.translateX(0.8 * width);
      poles.push(opole);

      // simple "horse" (box body + head) attached to each pole
      let horse = new T.Group();
      let horse_mat = new T.MeshStandardMaterial({
        color: "#8b5a2b",
        metalness: 0.1,
        roughness: 0.7
      });
      let body = new T.Mesh(
        new T.BoxGeometry(0.22 * width, 0.12 * width, 0.36 * width),
        horse_mat
      );
      body.position.y = -0.12 * width;
      horse.add(body);
      let head = new T.Mesh(
        new T.BoxGeometry(0.12 * width, 0.12 * width, 0.14 * width),
        horse_mat
      );
      head.position.set(0, -0.05 * width, 0.26 * width);
      horse.add(head);

      opole.add(horse);
      horse.position.y = -0.6;
      horses.push(horse);
      horse_phases.push((2 * i * Math.PI) / num_poles);
    }

    let roof_geom = new T.ConeGeometry(width, 0.5 * width, 32, 4);
    let roof = new T.Mesh(roof_geom, base_mat);
    carousel.add(roof);
    roof.translateY(4.8);

    // small bulbs around the roof edge
    let roofBulbGeom = new T.SphereGeometry(0.07 * width, 8, 8);
    let roofBulbMat = new T.MeshStandardMaterial({
      color: "#fff4b0",
      emissive: "#fff4b0",
      emissiveIntensity: 0.6,
      roughness: 0.4
    });
    for (let i = 0; i < 12; i++) {
      let bulb = new T.Mesh(roofBulbGeom, roofBulbMat);
      bulb.position.set(
        width * 0.95 * Math.cos((2 * i * Math.PI) / 12),
        4.55,
        width * 0.95 * Math.sin((2 * i * Math.PI) / 12)
      );
      carousel.add(bulb);
    }

    // note that we have to make the Object3D before we can call
    // super and we have to call super before we can use this
    super(`Carousel-${carouselObCtr++}`, carousel);
    this.whole_ob = carousel;
    this.platform = platform;
    this.platform_group = platform_group;
    this.poles = poles;
    this.horses = horses;
    this.horse_phases = horse_phases;
    this.time = 0;

    // put the object in its place
    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    carousel.scale.set(scale, scale, scale);
  }
  /**
   * StepWorld method
   * @param {*} delta
   * @param {*} timeOfDay
   */
  stepWorld(delta, timeOfDay) {
    this.time += 0.002 * delta;
    this.platform_group.rotateY(0.003 * delta);
    for (let i = 0; i < this.horses.length; i++) {
      this.horses[i].position.y =
        -0.6 + 0.45 * Math.sin(this.time + this.horse_phases[i]);
    }
  }
}

let flyingChairsObCtr = 0;
/**
 * @typedef FlyingChairsProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrFlyingChairs extends GrObject {
  /**
   * @param {FlyingChairsProperties} params
   */
  constructor(params = {}) {
    let ride = new T.Group();

    let base = new T.Mesh(
      new T.CylinderGeometry(1.2, 1.5, 0.6, 16),
      new T.MeshStandardMaterial({
        color: "#555555",
        metalness: 0.3,
        roughness: 0.8
      })
    );
    base.position.y = 0.3;
    ride.add(base);

    let column = new T.Mesh(
      new T.CylinderGeometry(0.3, 0.35, 4, 16),
      new T.MeshStandardMaterial({
        color: "#c0c0c0",
        metalness: 0.6,
        roughness: 0.3
      })
    );
    column.position.y = 2.3;
    ride.add(column);

    let spinner = new T.Group();
    spinner.position.y = 4;
    ride.add(spinner);

    let capMat = new T.MeshStandardMaterial({
      color: "#d35400",
      metalness: 0.2,
      roughness: 0.7,
      emissive: "#a84300",
      emissiveIntensity: 0.15
    });
    let cap = new T.Mesh(
      new T.ConeGeometry(1.3, 0.6, 16),
      capMat
    );
    cap.position.y = 0.3;
    spinner.add(cap);

    // light ring on cap
    let capBulbGeom = new T.SphereGeometry(0.06, 8, 8);
    let capBulbMat = new T.MeshStandardMaterial({
      color: "#fff6a5",
      emissive: "#fff6a5",
      emissiveIntensity: 0.7,
      roughness: 0.4
    });
    for (let i = 0; i < 12; i++) {
      let bulb = new T.Mesh(capBulbGeom, capBulbMat);
      bulb.position.set(
        1.1 * Math.cos((2 * i * Math.PI) / 12),
        0.1,
        1.1 * Math.sin((2 * i * Math.PI) / 12)
      );
      spinner.add(bulb);
    }

    let hangers = [];
    let num_chairs = 10;
    for (let i = 0; i < num_chairs; i++) {
      let hanger = new T.Group();
      spinner.add(hanger);
      hanger.rotateY((2 * i * Math.PI) / num_chairs);
      hanger.translateX(1.2);

      let chain = new T.Mesh(
        new T.CylinderGeometry(0.03, 0.03, 1.2, 8),
        new T.MeshStandardMaterial({
          color: "#aaaaaa",
          metalness: 0.8,
          roughness: 0.2
        })
      );
      chain.position.y = -0.6;
      hanger.add(chain);

      let seat = new T.Mesh(
        new T.BoxGeometry(0.3, 0.15, 0.3),
        new T.MeshStandardMaterial({
          color: "#3498db",
          metalness: 0.1,
          roughness: 0.7
        })
      );
      seat.position.y = -1.2;
      hanger.add(seat);

      hangers.push(hanger);
    }

    super(`FlyingChairs-${flyingChairsObCtr++}`, ride);
    this.whole_ob = ride;
    this.spinner = spinner;
    this.hangers = hangers;
    this.time = 0;

    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    ride.scale.set(scale, scale, scale);
  }
  /**
   * @param {*} delta
   * @param {*} timeOfDay
   */
  stepWorld(delta, timeOfDay) {
    this.time += 0.003 * delta;
    this.spinner.rotateY(0.004 * delta);
    let tilt = 0.2 + 0.15 * Math.sin(this.time);
    for (let hanger of this.hangers) {
      hanger.rotation.z = -tilt;
    }
  }
}

let ferrisObCtr = 0;
/**
 * @typedef FerrisWheelProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrFerrisWheel extends GrObject {
  /**
   * @param {FerrisWheelProperties} params
   */
  constructor(params = {}) {
    let wheel = new T.Group();

    let base = new T.Mesh(
      new T.CylinderGeometry(1.2, 1.5, 0.5, 16),
      new T.MeshStandardMaterial({
        color: "#666666",
        metalness: 0.3,
        roughness: 0.8
      })
    );
    base.position.y = 0.25;
    wheel.add(base);

    let supportMat = new T.MeshStandardMaterial({
      color: "#999999",
      metalness: 0.4,
      roughness: 0.5
    });
    let supportGeom = new T.BoxGeometry(0.2, 4.5, 0.2);
    let leftSupport = new T.Mesh(supportGeom, supportMat);
    let rightSupport = new T.Mesh(supportGeom, supportMat);
    leftSupport.position.set(-1, 2.5, 0);
    rightSupport.position.set(1, 2.5, 0);
    wheel.add(leftSupport);
    wheel.add(rightSupport);

    let rimGroup = new T.Group();
    rimGroup.position.y = 4.5;
    wheel.add(rimGroup);

    let rim = new T.Mesh(
      new T.TorusGeometry(2.2, 0.08, 16, 60),
      new T.MeshStandardMaterial({
        color: "#f1c40f",
        metalness: 0.4,
        roughness: 0.4
      })
    );
    rimGroup.add(rim);

    let spokes = 12;
    for (let i = 0; i < spokes; i++) {
      let spoke = new T.Mesh(
        new T.BoxGeometry(0.05, 2.2, 0.05),
        supportMat
      );
      spoke.position.y = 1.1;
      spoke.rotateZ((2 * i * Math.PI) / spokes);
      rimGroup.add(spoke);
    }

    let cabins = [];
    for (let i = 0; i < 10; i++) {
      let cabin = new T.Group();
      rimGroup.add(cabin);
      cabin.rotateZ((2 * i * Math.PI) / 10);
      cabin.translateY(2.2);
      let car = new T.Mesh(
        new T.BoxGeometry(0.4, 0.3, 0.4),
        new T.MeshStandardMaterial({
          color: "#2ecc71",
          metalness: 0.1,
          roughness: 0.7
        })
      );
      car.position.y = -0.2;
      cabin.add(car);
      cabins.push(cabin);
    }

    super(`FerrisWheel-${ferrisObCtr++}`, wheel);
    this.whole_ob = wheel;
    this.rimGroup = rimGroup;
    this.cabins = cabins;

    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    wheel.scale.set(scale, scale, scale);
  }
  /**
   * @param {*} delta
   * @param {*} timeOfDay
   */
  stepWorld(delta, timeOfDay) {
    this.rimGroup.rotateZ(0.002 * delta);
    for (let cabin of this.cabins) {
      cabin.rotation.z = -this.rimGroup.rotation.z;
    }
  }
}

let rocketObCtr = 0;
/**
 * @typedef RocketTowerProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrRocketTower extends GrObject {
  /**
   * @param {RocketTowerProperties} params
   */
  constructor(params = {}) {
    let tower = new T.Group();

    let base = new T.Mesh(
      new T.CylinderGeometry(1.1, 1.3, 0.6, 16),
      new T.MeshStandardMaterial({
        color: "#444444",
        metalness: 0.3,
        roughness: 0.8
      })
    );
    base.position.y = 0.3;
    tower.add(base);

    let column = new T.Mesh(
      new T.CylinderGeometry(0.25, 0.3, 6, 16),
      new T.MeshStandardMaterial({
        color: "#aaaaaa",
        metalness: 0.6,
        roughness: 0.3
      })
    );
    column.position.y = 3.3;
    tower.add(column);

    let ring = new T.Group();
    ring.position.y = 1.5;
    tower.add(ring);

    let ringMesh = new T.Mesh(
      new T.TorusGeometry(1.1, 0.08, 12, 36),
      new T.MeshStandardMaterial({
        color: "#9b59b6",
        metalness: 0.4,
        roughness: 0.5,
        emissive: "#7d3c98",
        emissiveIntensity: 0.2
      })
    );
    ring.add(ringMesh);

    // glowing pods
    let podMat = new T.MeshStandardMaterial({
      color: "#e74c3c",
      metalness: 0.2,
      roughness: 0.6,
      emissive: "#b83a2f",
      emissiveIntensity: 0.25
    });

    let pods = 8;
    for (let i = 0; i < pods; i++) {
      let pod = new T.Mesh(new T.BoxGeometry(0.25, 0.2, 0.4), podMat);
      pod.position.set(1.1, 0, 0);
      pod.rotateY((2 * i * Math.PI) / pods);
      ring.add(pod);
    }

    super(`RocketTower-${rocketObCtr++}`, tower);
    this.whole_ob = tower;
    this.ring = ring;
    this.time = 0;

    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    tower.scale.set(scale, scale, scale);
  }
  /**
   * @param {*} delta
   * @param {*} timeOfDay
   */
  stepWorld(delta, timeOfDay) {
    this.time += 0.003 * delta;
    this.ring.rotation.y += 0.006 * delta;
    this.ring.position.y = 1.2 + 2.2 * (0.5 + 0.5 * Math.sin(this.time));
  }
}

let decorObCtr = 0;
/**
 * @typedef EasterDecorProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrEasterDecor extends GrObject {
  /**
   * @param {EasterDecorProperties} params
   */
  constructor(params = {}) {
    let decor = new T.Group();

    // light arch
    let arch = new T.Group();
    decor.add(arch);
    let postMat = new T.MeshStandardMaterial({
      color: "#666666",
      metalness: 0.4,
      roughness: 0.5
    });
    let postGeom = new T.CylinderGeometry(0.06, 0.06, 2.2, 10);
    let leftPost = new T.Mesh(postGeom, postMat);
    let rightPost = new T.Mesh(postGeom, postMat);
    leftPost.position.set(-1.4, 1.1, 0);
    rightPost.position.set(1.4, 1.1, 0);
    arch.add(leftPost);
    arch.add(rightPost);

    let bulbGeom = new T.SphereGeometry(0.08, 8, 8);
    let bulbMat = new T.MeshStandardMaterial({
      color: "#ffeaa7",
      emissive: "#ffeaa7",
      emissiveIntensity: 0.6,
      metalness: 0.1,
      roughness: 0.4
    });
    let bulbs = [];
    let count = 10;
    for (let i = 0; i < count; i++) {
      let bulb = new T.Mesh(bulbGeom, bulbMat);
      let t = i / (count - 1);
      let x = -1.4 + 2.8 * t;
      let y = 2.1 - 0.5 * Math.sin(Math.PI * t);
      bulb.position.set(x, y, 0);
      arch.add(bulb);
      bulbs.push(bulb);
    }

    // eggs around the base
    let eggGeom = new T.SphereGeometry(0.16, 10, 8);
    let eggMats = [
      new T.MeshStandardMaterial({ color: "#f7b2d9", roughness: 0.6 }),
      new T.MeshStandardMaterial({ color: "#b2f7d9", roughness: 0.6 }),
      new T.MeshStandardMaterial({ color: "#b2d9f7", roughness: 0.6 })
    ];
    let eggPositions = [
      [-1.1, 0.2, 0.7],
      [1.1, 0.2, -0.7],
      [0.0, 0.2, -1.0],
      [-0.2, 0.2, 1.0],
      [0.6, 0.2, 0.9]
    ];
    for (let i = 0; i < eggPositions.length; i++) {
      let egg = new T.Mesh(eggGeom, eggMats[i % eggMats.length]);
      egg.scale.y = 1.3;
      egg.position.set(
        eggPositions[i][0],
        eggPositions[i][1],
        eggPositions[i][2]
      );
      decor.add(egg);
    }

    // pastel bunting flags
    let flagGeom = new T.ConeGeometry(0.12, 0.22, 3);
    let flagColors = ["#f7c1e3", "#c1f7e3", "#c1d5f7"];
    for (let i = 0; i < 8; i++) {
      let flag = new T.Mesh(
        flagGeom,
        new T.MeshStandardMaterial({ color: flagColors[i % flagColors.length] })
      );
      let t = i / 7;
      let x = -1.2 + 2.4 * t;
      let y = 1.7 - 0.35 * Math.sin(Math.PI * t);
      flag.position.set(x, y, 0.05);
      flag.rotateX(Math.PI);
      arch.add(flag);
    }

    super(`EasterDecor-${decorObCtr++}`, decor);
    this.whole_ob = decor;
    this.bulbs = bulbs;
    this.time = 0;

    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    decor.scale.set(scale, scale, scale);
  }
  /**
   * @param {*} delta
   * @param {*} timeOfDay
   */
  stepWorld(delta, timeOfDay) {
    this.time += 0.004 * delta;
    let glow = 0.4 + 0.2 * Math.sin(this.time);
    for (let bulb of this.bulbs) {
      bulb.material.emissiveIntensity = glow;
    }
  }
}

