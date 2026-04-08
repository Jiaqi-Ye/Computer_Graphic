// @ts-check

/**
 * CS559 3D World Framework Code
 *
 * Simple, automatic UI from an object with properly declared parameters
 * 
 * @module AutoUI 
 * */

// we need to have the BaseClass definition
import { GrObject } from "./GrObject.js";
import { GrWorld } from "./GrWorld.js";
// we need to import the module to get its typedefs for the type checker
import * as InputHelpers from "../CS559/inputHelpers.js";
import { GUI } from 'https://unpkg.com/three@0.180.0/examples/jsm/libs/lil-gui.module.min.js';

/**
 * AutoUI options for world-scoped UI assembly.
 *
 * World-level defaults come from `GrWorld.setAutoUIOptions(...)`.
 * Per-object overrides can be supplied here when constructing `AutoUI`.
 *
 * @typedef AutoUIOptions
 * @property {GrWorld} [world] - world that owns UI policy and shared GUI root
 * @property {number} [width=300] - panel width
 * @property {InputHelpers.WhereSpec} [where] - explicit container (overrides world default)
 * @property {number} [widthdiv=1] - panel width subdivision
 * @property {boolean} [adjusted=false] - adjust label widths for sliders
 * @property {boolean} [useLilGUI=true] - true for lil-gui controls, false for div/slider controls
 * @property {string} [labelDisplay="inline-block"] - CSS display style for slider labels in div mode
 * @property {"where"|"floating"|"canvas-overlay"} [guiPlacement="canvas-overlay"] - lil-gui placement strategy
 */

/**
 * Migration notes for Spring 2026:
 *
 * 1. `AutoUI` now uses an options object as its second parameter.
 * 2. Global page-level panel and global `#gui` behavior were removed.
 * 3. UI placement should come from the world (`options.world`) and optionally `options.where`.
 * 4. `display` is replaced by explicit mode options: `useLilGUI` and `labelDisplay`.
 * 5. UI is created eagerly at construction time. This allows controls for
 *    objects that are part of a hierarchy even if they are not directly
 *    installed with `world.add(obj)`.
 *
 * Typical conversion:
 *
 * Old:
 * `new AutoUI(obj, 200, div, 1, false, "inline")`
 *
 * New:
 * `new AutoUI(obj, { world, width: 200, where: div, widthdiv: 1, adjusted: false, useLilGUI: false, labelDisplay: "inline" })`
 */

export class AutoUI {
  /**
   * Create a UI panel for a GrObject
   *
   * UI layout defaults are world-scoped. The object declares its parameters,
   * while the world controls overall panel placement and style.
   *
   * This does place the panel into the DOM (onto the web page)
   * using `insertElement` in the CS559 helper library. The place
   * it is placed is controlled the `where` parameter. By default,
   * it is taken from the world's AutoUI options.
   *
   * @param {GrObject} object
   * @param {AutoUIOptions} [options]
   */
  constructor(object, options = {}) {
    this.object = object;
    /** @type {Array<any>|undefined} */
    this.controllers = undefined;
    /** @type {Array<Object>} */
    this.pendingSetOps = [];
    this.built = false;

    const world = options.world;
    const worldOpts = world ? world.getAutoUIOptions() : {};
    this.options = Object.assign(
      {
        width: 300,
        where: undefined,
        widthdiv: 1,
        adjusted: false,
        useLilGUI: true,
        labelDisplay: "inline-block",
        guiPlacement: "canvas-overlay"
      },
      worldOpts,
      options
    );

    this.build();
  }

  build() {
    if (this.built) return;
    const self = this;
    const width = this.options.width;
    let where = this.options.where;
    const widthdiv = this.options.widthdiv;
    const adjusted = this.options.adjusted;
    const useLilGUI = this.options.useLilGUI;
    const labelDisplay = this.options.labelDisplay;
    const guiPlacement = this.options.guiPlacement;

    if (!where && this.options.world) {
      where = this.options.world.renderer?.domElement?.parentElement || document.body;
    }
    if (!where) {
      where = document.body;
    }

    if (!useLilGUI) {
      // Create the sliders using the CS559 inputHelpers
      this.div = InputHelpers.makeBoxDiv({ width: width, flex: widthdiv > 1 }, where);
      InputHelpers.makeHead(this.object.name, this.div, { tight: true });
      if (widthdiv > 1) InputHelpers.makeFlexBreak(this.div);

      this.sliders = this.object.params.map(function (param) {
        const slider = new InputHelpers.LabelSlider(param.name, {
          where: self.div,
          width: (width / widthdiv) - 20,
          min: param.min,
          max: param.max,
          step: param.step ?? ((param.max - param.min) / 30),
          initial: param.initial,
          id: self.object.name + "-" + param.name,
          adjusted: adjusted,
          display: labelDisplay,
        });
        return slider;
      });

      this.sliders.forEach(function (sl) {
        sl.oninput = function () {
          self.update();
        };
      });

      this.update();
    }
    else {
      // Create/reuse the GUI using lil-gui, scoped by world when available.
      const attachGUI = (guiInstance) => {
        if (guiPlacement === "floating") {
          return;
        }

        if (guiPlacement === "canvas-overlay" && this.options.world) {
          const canvas = this.options.world.renderer?.domElement;
          let overlayParent = canvas?.parentElement || where;

          // If the canvas is directly under body (or no suitable parent),
          // create a local wrapper so overlay anchoring is canvas-relative.
          if (!overlayParent || overlayParent === document.body) {
            const wrapper = document.createElement("div");
            wrapper.style.position = "relative";
            wrapper.style.display = "inline-block";
            if (canvas && canvas.parentElement) {
              canvas.parentElement.insertBefore(wrapper, canvas);
              wrapper.appendChild(canvas);
            } else {
              InputHelpers.insertElement(wrapper, where || document.body);
            }
            overlayParent = wrapper;
          }

          InputHelpers.insertElement(guiInstance.domElement, overlayParent);

          const parentEl = /** @type {HTMLElement} */ (overlayParent);
          const parentStyle = window.getComputedStyle(parentEl).position;
          if (parentStyle === "static") {
            parentEl.style.position = "relative";
          }
          guiInstance.domElement.style.position = "absolute";
          guiInstance.domElement.style.top = "0";
          guiInstance.domElement.style.right = "0";
          guiInstance.domElement.style.zIndex = "10";
          return;
        }

        InputHelpers.insertElement(guiInstance.domElement, where);
      };

      let gui;
      if (this.options.world) {
        if (!this.options.world.autoUIGUI) {
          const autoPlace = guiPlacement === "floating";
          if (adjusted) gui = new GUI({ title: "AutoUI", autoPlace });
          else gui = new GUI({ width: width / widthdiv, title: "AutoUI", autoPlace });
          attachGUI(gui);
          this.options.world.autoUIGUI = gui;
        } else {
          gui = this.options.world.autoUIGUI;
        }
      }
      else {
        const autoPlace = guiPlacement === "floating";
        if (adjusted) gui = new GUI({ title: "AutoUI", autoPlace });
        else gui = new GUI({ width: width / widthdiv, title: "AutoUI", autoPlace });
        attachGUI(gui);
      }

      const folder = gui.addFolder(this.object.name);
      const controllers = [];
      this.object.params.forEach(function (param) {
        if (self.object.values) self.object.values[param.name] = param.initial;
        else self.object.values = { [param.name]: param.initial };
        const controller = folder.add(self.object.values, param.name, param.min, param.max, param.step || Math.max((param.max - param.min) / 30, Number.EPSILON));
        controllers.push(controller);
        controller.onChange(function () {
          self.object.update(controllers.map(c => c.getValue()));
        });
      });
      // Apply initial parameter values once so object state matches controller defaults.
      this.object.update(controllers.map(c => c.getValue()));
      folder.close();
      this.gui = gui;
      this.folder = folder;
      this.controllers = controllers;
    }

    this.built = true;
    this.pendingSetOps.forEach(([param, value]) => this.set(param, value));
    this.pendingSetOps = [];
  }

  update() {
    if (!this.built) return;
    if (!this.sliders) {
      this.object.update(this.controllers.map(c => c.getValue()));
    }
    else {
      const vals = this.sliders.map(sl => Number(sl.value()));
      this.object.update(vals);
    }
  }

  /**
   *
   * @param {number | string} param
   * @param {number} value
   */
  set(param, value) {
    if (!this.built) {
      this.pendingSetOps.push([param, value]);
      return;
    }
    if (!this.sliders) {
      let vals = this.controllers.map(c => c.getValue());
      if (typeof param === "string") {
        for (let i = 0; i < this.object.params.length; i++) {
          if (param == this.object.params[i].name) {
            vals[i] = Number(value);
            this.controllers[i].setValue(Number(value));
          }
        }
      }
      else {
        vals[param] = Number(value);
        this.controllers[param].setValue(Number(value));
      }
      this.object.update(vals);
    }
    else if (typeof param === "string") {
      for (let i = 0; i < this.object.params.length; i++) {
        if (param == this.object.params[i].name) {
          this.sliders[i].set(Number(value));
          return;
        }
      }
      throw `Bad parameter ${param} to set`;
    } else {
      this.sliders[param].set(Number(value));
    }
  }
}
