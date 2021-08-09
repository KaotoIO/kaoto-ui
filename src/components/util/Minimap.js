// https://gist.github.com/billdwhite/496a140e7ab26cef02635449b3563e54
// http://billdwhite.com/wordpress/2017/09/12/d3-v4-zooming-understanding-zoombehavior-in-the-pan-and-zoom-minimap/
import d3TopoUtil from './d3TopoUtil';
import set from 'lodash/set';
import invoke from 'lodash/invoke';
import { event as d3Event } from 'd3-selection'; // https://github.com/d3/d3/issues/2814
// look up https://github.com/d3/d3/blob/master/index.js
const d3 = Object.assign({}, require('d3-selection'), require('d3-zoom'), require('d3-transition'));
const fontAwesomeClass = 'FontAwesome';
export default class Minimap {
  props;
  state;
  constructor(props) {
    console.log('initializing minimap...');
    this.props = props || {};
    // default value
    this.defaultProps(props);
    this.state = {};
    if (this.props.enableMinimap) {
      this.init();
    }
  }
  defaultProps(props) {
    const setting = (key, defaultValue) => {
      set(this.props, key, props[key] || defaultValue);
    };
    const minimapScale = 0.25;
    setting('initZoomScale', 1);
    setting('minimapScale', minimapScale); // based on host scale size
    setting('maxZoomScale', 5 / minimapScale / 10); // 5 is host layout's maxZoomScale
    setting('minZoomScale', 0.5 / minimapScale / 10); // 0.25 is host layout's maxZoomScale
    setting('initVisible', false);
  }

  init() {
    // initialize the minimap, passing needed references
    const { props, state } = this;
    const { base, layout, width, height, initZoomScale, initVisible, minimapScale, maxZoomScale, minZoomScale } = props;
    // init defs
    this.initDefs();
    // init container
    const container = (state.container = base.append('g').attr('class', 'minimap'));
    // init zoom
    const zoom = (state.zoom = d3.zoom().scaleExtent([minZoomScale, maxZoomScale]));
    // init node
    state.node = container.node();

    // init background
    container
    .append('rect')
    .attr('x', -width / 2)
    .attr('y', -height / 2)
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'background')
    .attr('fill', '#d8d8d8')
    .attr('stroke-width', 3)
    .attr('stroke', '#999');
    // init frame
    const frame = (state.frame = container.append('g').attr('class', 'frame'));
    // .style('transform-origin', '-50% -50%'));
    frame
    .append('rect')
    .attr('class', 'background')
    .attr('x', -width / 2)
    .attr('y', -height / 2)
    .attr('width', width)
    .attr('height', height)
    .attr('filter', 'url(#minimapDropShadow_forMinimap)');

    // init close button
    const invisibleToolWidth = 10;
    const invisibleToolHeight = 10;
    const toolbar = base.append('g').attr('class', 'minimap-toolbar');
    // ---- add tool ----//
    const invisibleTool = toolbar.append('g').attr('class', 'invisible-tool');
    // tooltip
    invisibleTool.append('title').text('invisible');
    invisibleTool
    .append('text')
    .attr('width', invisibleToolWidth)
    .attr('height', invisibleToolHeight)
    .attr('x', width - width * minimapScale)
    .attr('y', height - height * minimapScale + invisibleToolHeight)
    .style('pointer-events', 'all')
    .style('cursor', 'pointer')
    .style('font', `bold ${16}px "${fontAwesomeClass}"`)
    .style('fill', '#555')
    .text('\uf070')
    .on('click', () => {
      console.log('clicking invisible button');
      this.setVisible(false);
      invoke(d3Event, 'stopPropagation');
      invoke(d3Event, 'preventDefault');
    });

    const zoomHandler = () => {
      frame.attr('transform', d3Event.transform);
      // here we filter out the emitting of events that originated outside of the normal ZoomBehavior; this prevents an infinite loop
      // between the innerWrapper and the minimap
      if (d3Event.sourceEvent instanceof MouseEvent || d3Event.sourceEvent instanceof TouchEvent || d3Event.sourceEvent instanceof WheelEvent) {
        // invert the outgoing transform and apply it to the innerWrapper
        const transform = d3Event.transform;
        const newScale = initZoomScale / transform.k;
        // const delta = Math.abs(newScale - initZoomScale); //避免1與0.99999一直無法等於的情況，採用差距來比對
        this.setVisible(true);
        // ordering matters here! you have to scale() before you translate()
        const modifiedTransform = d3.zoomIdentity.scale(newScale).translate(-transform.x, -transform.y);
        layout.changeCanvasZoom(modifiedTransform, 0);
      }
      this.updateMinimapZoomExtents();
    };
    zoom.on('zoom', zoomHandler);
    container.call(zoom);
    this.updateMinimapZoomExtents();
    this.setVisible(initVisible);
  }

  refresh() {
    this.render();
  }

  render() {
    const { base, target, x, y, minimapScale, width, height } = this.props;
    const { node, frame, container } = this.state;
    if (!container) {
      return;
    }
    // update the placement of the minimap
    container.attr('transform', 'translate(' + x + ',' + y + ') scale(' + minimapScale + ')');
    // update the visualization being shown by the minimap in case its appearance has changed
    const targetNode = target.node().cloneNode(true);
    targetNode.removeAttribute('id');
    base.selectAll('.minimap .panCanvas').remove(); // remove
    base.selectAll('.minimap .colnemap').remove(); // remove
    node.appendChild(targetNode); // minimap node is the container's node
    d3.select(targetNode)
    .attr('transform', 'translate(0,0)')
    .classed('colnemap', true)
    .classed('svg-main-group', false);
    // keep the minimap's viewport (frame) sized to match the current visualization viewport dimensions
    frame
    .select('.focusScope')
    .attr('stroke-width', 1)
    .attr('stroke', 'black')
    .attr('opacity', 0.2)
    .attr('width', width)
    .attr('height', height);
    frame.node().parentNode.appendChild(frame.node());
    d3.select('.minimap .toolbar').raise();
  }

  // call by host
  update(hostTransform) {
    const { initZoomScale } = this.props;
    const { zoom, frame, container } = this.state;
    if (!frame) {
      return;
    }
    const newScale = initZoomScale / hostTransform.k;
    // const delta = Math.abs(newScale - initZoomScale); //避免1與0.99999一直無法等於的情況，採用差距來比對
    this.setVisible(true);
    // invert the incoming zoomTransform; ordering matters here! you have to scale() before you translate()
    const modifiedTransform = d3.zoomIdentity.scale(newScale).translate(-hostTransform.x, -hostTransform.y);
    container
    .transition()
    .duration(0)
    .call(zoom.transform, modifiedTransform)
    .on('end', () => {
      // call this.zoom.transform which will reuse the handleZoom method below
      zoom.transform(frame, modifiedTransform);
      // update the new transform onto the minimapCanvas which is where the zoomBehavior stores it
      // since it was the call target during initialization
      this.updateMinimapZoomExtents();
    });
  }

  updateCanvasZoom() {
    const { svgLayout } = this.props;
    const { frame } = this.state;
    const scale = d3TopoUtil.getScaleFromTransform(frame.attr('transform'));
    svgLayout.changeZoomScale(scale, 0);
  }

  updateMinimapZoomExtents() {
    const { target, width, height } = this.props;
    const { container, zoom } = this.state;
    const scale = d3TopoUtil.getScaleFromTransform(container.attr('transform'));
    const targetWidth = Number(target.attr('width')) || 0;
    const targetHeight = Number(target.attr('height')) || 0;
    const viewportWidth = width;
    const viewportHeight = height;
    zoom.translateExtent([[-viewportWidth / scale, -viewportHeight / scale], [viewportWidth / scale + targetWidth, viewportHeight / scale + targetHeight]]);
  }

  setVisible(visible) {
    d3.select('g.minimap-toolbar').style('opacity', () => {
      return visible ? 1 : 0;
    });
    d3.select('g.minimap').style('opacity', () => {
      return visible ? 1 : 0;
    });
  }

  initDefs() {
    const { base: svg, width, height } = this.props;
    let svgDefs = svg.select(`defs`);
    if (!svgDefs.node()) {
      svgDefs = svg.append('defs');
    }
    const initPosition = [width / 2, height / 2]; // center
    svgDefs
    .append('clipPath')
    .attr('id', 'wrapperClipPath_forMinimap')
    .attr('class', 'wrapper clipPath')
    .append('rect')
    .attr('class', 'background')
    .attr('x', -initPosition[0])
    .attr('y', -initPosition[1])
    .attr('width', width)
    .attr('height', height);
    svgDefs
    .append('clipPath')
    .attr('id', 'minimapClipPath_forMinimap')
    .attr('class', 'minimap clipPath')
    .attr('width', width)
    .attr('height', height)
    .append('rect')
    .attr('class', 'background')
    .attr('width', width)
    .attr('height', height);

    const filter = svgDefs
    .append('svg:filter')
    .attr('id', 'minimapDropShadow_forMinimap')
    .attr('x', '-20%')
    .attr('y', '-20%')
    .attr('width', '150%')
    .attr('height', '150%');
    filter
    .append('svg:feOffset')
    .attr('result', 'offOut')
    .attr('in', 'SourceGraphic')
    .attr('dx', '1')
    .attr('dy', '1');
    filter
    .append('svg:feColorMatrix')
    .attr('result', 'matrixOut')
    .attr('in', 'offOut')
    .attr('type', 'matrix')
    .attr('values', '0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.5 0');
    filter
    .append('svg:feGaussianBlur')
    .attr('result', 'blurOut')
    .attr('in', 'matrixOut')
    .attr('stdDeviation', '10');
    filter
    .append('svg:feBlend')
    .attr('in', 'SourceGraphic')
    .attr('in2', 'blurOut')
    .attr('mode', 'normal');

    const minimapRadialFill = svgDefs
    .append('radialGradient')
    .attr('id', 'minimapGradient_forMinimap')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('cx', '500')
    .attr('cy', '500')
    .attr('r', '400')
    .attr('fx', '500')
    .attr('fy', '500');
    minimapRadialFill
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', 'yellow');
    minimapRadialFill
    .append('stop')
    .attr('offset', '40%')
    .attr('stop-color', 'yellow');
    minimapRadialFill
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', 'yellow');
  }

  // ============================================================
  // Accessors
  // ============================================================
}
