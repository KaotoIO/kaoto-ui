import d3TopoUtil from '../util/d3TopoUtil';
import { event as d3Event } from 'd3-selection'; // https://github.com/d3/d3/issues/2814
import get from 'lodash/get';
import invoke from 'lodash/invoke';
const d3 = Object.assign({}, require('d3-selection'), require('d3-transition'));
export default class Selector {
  props;
  state;
  constructor(props) {
    console.log('initializing selector...');
    this.props = props || {};
    this.state = { mode: 'single', selectedTargetInfo: [] };
    this.init();
  }

  init() {
    const { enableToolTip } = this.props;
    // Define the div for the tooltip
    if (enableToolTip) {
      const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'topology-tooltip')
      .style('opacity', 0)
      .style('display', 'none');
      this.state.tooltip = tooltip;
    }
  }
  getEvent(...args) {
    let e = d3Event;
    const dom = get(args, [2, get(args, [1])]);
    if (!e && dom) {
      const bbox = dom.getBBox();
      const x = bbox.width / 2;
      const y = bbox.height / 2;
      // fake event object
      e = { currentTarget: dom, clientX: x, clientY: y, x, y };
    }
    return e;
  }

  bindEvent(targetType, target, callbacks) {
    target
    .on('pointerover', (...args) => {
      const e = this.getEvent(...args);
      this.trigger(callbacks, 'pointerOver', { targetType, target, e: d3Event });
      this.hoverIn(e, targetType, target);
    })
    .on('pointerdown', (...args) => {
      const e = this.getEvent(...args);
      this.trigger(callbacks, 'pointerDown', { targetType, target, e });
      this.pressDown(e, targetType, target, callbacks);
    })
    .on('mouseover', (...args) => {
      const e = this.getEvent(...args);
      this.trigger(callbacks, 'mouseOver', { targetType, target, e });
    })
    .on('mousedown', (...args) => {
      const e = this.getEvent(...args);
      this.trigger(callbacks, 'mouseDown', { targetType, target, e });
      this.pressDown(e, targetType, target, callbacks);
    })
    .on('pointermove', (...args) => {
      this.trigger(callbacks, 'pointerMove', { targetType, target, e: this.getEvent(...args) });
    })
    .on('pointerup', (...args) => {
      const e = this.getEvent(...args);
      this.trigger(callbacks, 'pointerUp', { targetType, target, e });
      this.pressUp(e, targetType, target, callbacks);
    })
    .on('mouseup', (...args) => {
      const e = this.getEvent(...args);
      this.trigger(callbacks, 'mouseUp', { targetType, target, e });
      this.pressUp(e, targetType, target, callbacks);
    })
    .on('mouseout', (...args) => {
      const e = this.getEvent(...args);
      this.trigger(callbacks, 'mouseOut', { targetType, target, e });
    })
    .on('pointerout', (...args) => {
      const e = this.getEvent(...args);
      this.trigger(callbacks, 'pointerOut', { targetType, target, e: this.getEvent(...args) });
      this.hoverOut(e, targetType, target);
    })
    .on('click', (...args) => {
      const e = this.getEvent(...args);
      invoke(e, 'stopPropagation');
      this.trigger(callbacks, 'click', { targetType, target, e });
    })
    .on('dblclick', (...args) => {
      this.trigger(callbacks, 'dblclick', { targetType, target, e: this.getEvent(...args) });
    });
  }
  pressDown(e, targetType, target) {
    invoke(e, 'stopPropagation');
    const { layout } = this.props;
    // 當點擊的對象是toolbar的按鈕時，不視為是選取節點的動作
    if (e && !layout.skipPointerDownEvent(e)) {
      const state = this.state;
      state.pointDownTarget = target;
      state.mouseDownPosition = { x: e.clientX, y: e.clientY };
    }
  }

  hoverIn(e, targetType, target) {
    this.onHoverStyle(target, true);
    if (targetType === 'node' && target) {
      const message = get(target.data(), [0, 'tooltip']);
      if (message) {
        this.triggerTooltip(message, true);
      }
    }
  }

  hoverOut(e, targetType, target) {
    this.onHoverStyle(target, false);
    if (targetType === 'node') {
      this.triggerTooltip('', false);
    }
  }

  pressUp(e, targetType, target, callbacks) {
    invoke(e, 'stopPropagation');
    const state = this.state;
    if (state.pointDownTarget === target) {
      if (!d3TopoUtil.isPanAction(state.mouseDownPosition, { x: e.clientX, y: e.clientY })) {
        // select event;
        this.onSelectStyle(target, true);
        this.trigger(callbacks, 'selected', { targetType, target, e });
        if (state.selectedTargetInfo.length > 0) {
          if (state.mode === 'single') {
            if (!this.isTargetSelected(target)) {
              state.selectedTargetInfo.forEach(i => {
                const { type, obj, cbs } = i;
                this.onSelectStyle(obj, false);
                this.trigger(cbs, 'unselected', { type, obj, e });
              });
              state.selectedTargetInfo = [];
            } else {
              // select again
              this.resetTempVars();
              return;
            }
          }
        }
        state.selectedTargetInfo.push({ type: targetType, obj: target, cbs: callbacks });
      }
    }
    this.resetTempVars();
  }
  unselectAll() {
    const state = this.state;
    if (state.selectedTargetInfo.length > 0) {
      if (state.mode === 'single') {
        state.selectedTargetInfo.forEach(i => {
          const { type, obj, cbs } = i;
          this.onSelectStyle(obj, false);
          this.trigger(cbs, 'unselected', { type, obj });
        });
        state.selectedTargetInfo = [];
        // select again
        this.resetTempVars();

      }
    }
  }
  isTargetSelected(target) {
    return (
      this.state.selectedTargetInfo.findIndex(i => {
        return i.obj === target;
      }) !== -1
    );
  }
  triggerTooltip(message, visible) {
    const { tooltip } = this.state;
    if (tooltip) {
      if (visible) {
        tooltip
        .transition()
        .duration(200)
        .style('opacity', 0.9)
        .style('display', 'block');
        tooltip
        .html(message)
        .style('position', 'absolute')
        .style('left', d3Event.pageX + 'px')
        .style('top', d3Event.pageY - 28 + 'px');
      } else {
        const { tooltip } = this.state;
        if (tooltip.style('display') !== 'none') {
          tooltip
          .transition()
          .duration(500)
          .style('opacity', 0)
          .style('display', 'none');
        }
      }
    }
  }

  resetTempVars() {
    delete this.state.pointDownTarget;
  }
  trigger(callbacks, eventType, eventInfo) {
    const { layout, enableMinimap } = this.props;
    if (enableMinimap && ['selected', 'unselected'].indexOf(eventType) !== -1) {
      layout.state.minimap.refresh();
    }
    invoke(callbacks, eventType, eventInfo);
  }
  onSelectStyle(dom, selected) {
    dom.classed('selected', selected);
    dom.classed('hovered', false);
  }
  onHoverStyle(dom, isHovering) {
    dom.classed('hovered', isHovering);
  }
}
