import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './style.css';
const integrationJson = require('./d3data.json');

/**
 * D3 COMPONENT
 */

/**
 * @description
 * D3 SVG DOM，Topology.react.js dispatch
 * Primarily used for initialization (e.g. Selector, SVG, project, layout).
 *
 * @class D3Component
 * @param {object} props - ex. {identifier, projectName, data, width, height, projectPath...}.
 * @author Samuel Hsin
 * @since 2019/04/17
 *
 * @example <caption> Example </caption>
 * import D3Component from '&/@chttl/topology/src/topology/D3Component';
 *
 * //projectName，Tree/Force/NetworkTemplate1
 *
 * const vis = new D3Component(refElement.current, { identifier: 'canvas_id', projectName, data, width, height }));
 * //update
 * vis.update(props);
 * //quit
 * vis.quit();
 *
 */
import Selector from './util/Selector.js';
import Minimap from './util/Minimap.js';
import get from 'lodash/get';
import set from 'lodash/set';
import invoke from 'lodash/invoke';
import assign from 'lodash/assign';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import cloneDeep from 'lodash/cloneDeep';

const d3 = Object.assign({}, require('d3-selection'), require('d3-zoom'));

class D3Component {
  props;
  state;

  constructor(containerEl, props) {
    this.props = props || {};
    this.defaultProps(props);

    this.state = {
      defaultNodeZIndex: 7,
      defaultLinkZIndex: 5,
      defaultGroupZIndex: 3
    };
    this.init(containerEl);
  }

  defaultProps(props) {
    const setting = (key, defaultValue) => {
      set(this.props, key, props[key] || defaultValue);
    };
    setting('projectPath', './project');
    setting('mainGroupStyleClass', 'svg-main-group');
    setting('backgroundColor', '#eee');
    setting('initZoomScale', 1);
    setting('initNodeAdditionalDistance', 0);
    setting('enableCanvasSelectEvent', true);
    setting('enableGroup', true);
    setting('enableNodeLabel', true);
    setting('enableGroupLabel', true);
    setting('enableToolTip', false);
    setting('enableLinkLabel', true);
    setting('enableLineArrow', true);
    setting('enableMinimap', true);
    setting('minimapScale', 0.2);
  }

  init(containerEl) {
    const {
      identifier,
      projectPath,
      projectName,
      projectClass,
      mainGroupStyleClass,
      enableViewbox,
      width,
      height,
      backgroundColor,
      initZoomScale,
      enableCanvasSelectEvent,
      enableMinimap,
      minimapScale
    } = this.props;

    const state = this.state;
    const initPosition = [width / 2, height / 2];

    /**
     * Initiate project & layout
     */
    const project = (state.project = this.initProject(projectPath, projectName, projectClass));
    const { layout } = project.state;

    /**
     * Initiate selector
     * @type {Selector}
     */
    const selector = (state.selector = new Selector({ ...this.props, layout }));

    /**
     * Initiate SVG
     * @type {Selection<BaseType, unknown, HTMLElement, any>}
     */
    const svg = (state.svg = d3.select(containerEl).append('svg'));

    /**
     * Canvas selected/unselected
     */
    if (enableCanvasSelectEvent) {
      selector.bindEvent('canvas', svg, {
        selected: () => {
          console.log('canvas was selected...');
        },
        unselected: () => {
          console.log('canvas was unselected...');
        }
      });
    }

    /**
     * SVG size
     */
    const svgWidth = width;
    const svgHeight = height;

    /**
     * Viewbox & viewport adjustment
     */
    if (enableViewbox) {
      // viewbox
      const viewBox = [0, 0, width, height].join(' ');
      svg.attr('viewBox', viewBox).attr('preserveAspectRatio', 'xMinYMin meet');
    } else {
      // viewport
      svg.attr('width', svgWidth).attr('height', svgHeight);
    }

    /**
     * SVG ID
     */
    svg.attr('id', identifier);

    const outerWrapper = svg
    .append('g')
    .attr('class', 'wrapper outer')
    .attr('transform', 'translate(0, 0)');

    /**
     * Initiate background
     * @type {string | this}
     */
    state.background = outerWrapper
    .append('rect')
    .attr('class', 'background')
    .attr('fill', backgroundColor)
    .attr('x', '0')
    .attr('y', '0')
    .attr('width', width)
    .attr('height', height);

    /**
     * Initiate zoomer
     * It's important to translate position into initPosition for node-link locations.
     * @type {Selection<BaseType>}
     */
    const innerWrapper = svg
    .append('g')
    .attr('class', 'wrapper inner zoomer')
    .style('transform-origin', '0 0')
    // init zoomer position
    .attr('transform', `translate(${initPosition[0]},${initPosition[1]}) scale(${layout.getZoomScale()})`);

    /**
     * Initiate inner wrapper background
     */
    innerWrapper
    .append('rect')
    .attr('class', 'background')
    .attr('fill', '#fff')
    .attr('opacity', 0)
    .attr('x', -initPosition[0])
    .attr('y', -initPosition[1])
    .attr('width', width)
    .attr('height', height);

    /**
     * Initiate main group
     * @type {Selection<BaseType>}
     */
    const mainGroup = innerWrapper
    .append('g')
    .classed(mainGroupStyleClass, true)
    .style('transform-origin', '0 0')
    .attr('transform', `translate(0,0) scale(${layout.getScale()})`);

    /**
     * Initiate main group background
     */
    mainGroup
    .append('rect')
    .attr('class', 'background')
    .attr('fill', '#fff')
    .attr('opacity', 0)
    .attr('x', -initPosition[0])
    .attr('y', -initPosition[1])
    .attr('width', width)
    .attr('height', height);

    /**
     * Initiate Minimap
     * @type {Minimap}
     */
    const minimap = (state.minimap = new Minimap({
      enableMinimap,
      base: svg,
      host: svg,
      target: mainGroup,
      layout,
      initZoomScale,
      minimapScale,
      scale: layout.getZoomScale(),
      x: width - (width * minimapScale) / 2 - 5,
      y: height - (height * minimapScale) / 2 - 5,
      svgWidth,
      svgHeight,
      width,
      height
    }));

    /**
     * Initiate zoom event
     */
    const zoom = layout.initZoom(innerWrapper, [mainGroup], minimap, [width, height]);

    innerWrapper.call(zoom);
    layout.specialZoom(innerWrapper);

    if (initZoomScale !== layout.getZoomScale()) {
      layout.changeCanvasZoom(d3.zoomIdentity.translate(0, 0).scale(initZoomScale), 0, true);
    }

    // append stratum layer for z-index
    for (let i = 0; i <= 10; i++) {
      mainGroup.append('svg:desc').attr('class', `zIndex-${i}-stratum`);
    }

    state.mainGroup = mainGroup;

    /**
     * Initiate custom event
     */
    svg.node().addEventListener(
      'updateTopology',
      () => {
        this.update(this.props);
      },
      true
    );

    svg.node().addEventListener(
      'unselectAll',
      () => {
        this.unselectAll();
      },
      true
    );

    /**
     * Initiate Minimap
     */
    if (enableMinimap) {
      // init clip-path
      innerWrapper.attr('clip-path', 'url(#wrapperClipPath_forMinimap)');
      /** ADD SHAPE **/
      minimap.render();
    }

    /**
     * Initiate Data processor
     * Data processor instance is not stored in project instance.
     */
    this.state.dataprocessor = invoke(project, 'getDataProcessor', { ...this.props, project, mainGroup, selector });

    invoke(project, 'initiated');

    this.update(this.props);
  }

  initProject(projectPath, projectName, projectClass) {
    const ProjectClass = projectClass || require(`${projectPath}/${projectName}.js`).default;
    return new ProjectClass(this.props);
  }

  updateState() {
    const { data } = this.props;
    const state = this.state;
    const nodesStickyValues = ['isExpand'];

    // update nodes and links state
    set(state, 'nodes', this.updateStateFromProps('nodes', state.nodes, get(data, 'nodes'), nodesStickyValues));
    set(state, 'links', this.updateStateFromProps('links', state.links, get(data, 'links'), []));

    // link from & to into source & target
    this.linkSourceAndTarget(state.nodes, state.links);
  }

  update(newProps) {
    console.log('updating topology...');
    const { background } = this.state;

    // merge properties(keep default value)
    assign(this.props, newProps);

    const { backgroundColor, enableMinimap } = this.props;

    this.updateState();

    const { nodes, links, minimap, dataprocessor } = this.state;

    // update background
    background.attr('fill', backgroundColor);

    // process(add/update/remove) nodes, links, groups...
    dataprocessor.process(nodes, links);

    // update minimap
    if (enableMinimap) {
      minimap.refresh();
    }
  }

  unselectAll() {
    const { selector } = this.state;
    selector.unselectAll();
  }

  quit() {
    const { svg, project } = this.state;
    invoke(project, 'quit');

    // remove custom event
    svg.node().removeEventListener('updateTopology');
    svg.node().removeEventListener('unselectAll');
  }

  resize(width, height) {
    const { svg } = this.state;
    console.log('resizing topology...');

    // setting size
    this.props.width = width;
    this.props.height = height;
    svg.attr('width', width).attr('height', height);
  }

  updateStateFromProps(key, stateData, propsData, stickyValues) {
    if (propsData) {
      if (!stateData) {
        stateData = cloneDeep(propsData);
      } else {
        const temp = [];

        propsData.forEach(p => {
          const s = stateData.find(s => s.id === p.id);
          if (s) {
            // --->update from props, --->remove from props
            const refP = stickyValues ? omit(p, stickyValues) : p;
            // merge
            merge(s, refP);
            // @ts-ignore
            temp.push(s);
          } else {
            // --->add from props
            // clone
            // @ts-ignore
            temp.push(cloneDeep(p));
          }
        });

        stateData = temp;
      }
    }
    return stateData;
  }

  linkSourceAndTarget(nodes, links) {
    const nodeMap = {};

    if (nodes) {
      nodes.forEach(n => {
        if (n && n.id) {
          nodeMap[n.id] = n;
        }
      });
    }

    if (links) {
      links.forEach(l => {
        l.source = nodeMap[l.from] || {};
        l.target = nodeMap[l.to] || {};
      });
    }
  }
}


/**
 * TOPOLOGY
 */
Topology.propTypes = {
  identifier: PropTypes.string,
  mode: PropTypes.oneOf(['2d', '3d']),
  projectPath: PropTypes.string,
  projectName: PropTypes.string,
  projectClass: PropTypes.func,
  data: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
  configs: PropTypes.object,
  nodeType: PropTypes.object,
  linkType: PropTypes.object,
  status: PropTypes.object,
  view: PropTypes.object,
  toolbar: PropTypes.object,
  enableGroup: PropTypes.bool,
};

Topology.defaultProps = {
  identifier: 'unknown',
  mode: '2d',
  projectPath: './project',
  projectName: 'Integration',
  projectClass: undefined,
  data: undefined,
  width: 300,
  height: 300
};

function Topology(props) {
  const refElement = useRef(null);
  const { identifier, mode, data, width, height } = props;
  // Declare a new state variable
  const [vis, setVis] = useState(undefined);
  const [message, setMessage] = useState('');

  // init
  useEffect(() => {
    if (mode === '2d') {
      // @ts-ignore
      setVis(new D3Component(refElement.current, { ...props, identifier: `canvas_${identifier}` }));
    } else if (mode === '3d') {
      setMessage('Not Support 3D');
    }
  }, [mode]);

  // update
  useEffect(() => {
    if (vis) {
      console.log('receiving new data..');
      // @ts-ignore
      vis.update(props);
    }
  }, [data]);

  // quit
  useEffect(() => {
    if (vis) {
      return () => {
        // @ts-ignore
        vis.quit();
      };
    }
    return;
  }, []);

  // resize
  useEffect(() => {
    if (vis) {
      // @ts-ignore
      vis.resize(width, height);
    }
  }, [width, height]);

  return (
    <div id={identifier} ref={refElement} className="topology" style={{ width: '100%', height: '100%' }}>
      <span>{message}</span>
    </div>
  );
}
const VizD3 = () => {
  const [width, setWidth] = useState(window.innerWidth - 20 || 0);
  const [height, setHeight] = useState(window.innerHeight - 20 || 0);
  const [data, setData] = useState(undefined);
  const projectName = 'Integration';

  interface INodes {
    id: string,
    name: string,
    groupIds: any[],
    category:string,
    status: string,
    groupable: boolean
  }

  let newLinks = [];
  let newNodes: INodes[] = [];
  let dataMapperContainerId;
  let dataMapperInputContainerId;
  let dataMapperOutputContainerId;
  // @ts-ignore

  function handleDataMapperMapping(mapping, mappingIdx) {
    // @ts-ignore
    /**
     * Individual mappings from the data mapper step
     **/
    newNodes.push({
      id: 'map-input-' + mappingIdx,
      name: mapping.inputField[0].name,
      groupIds: [dataMapperInputContainerId],
      category: 'example',
      status: 'update',
      groupable: true
    });

    // @ts-ignore
    newNodes.push({
      id: 'map-output-' + mappingIdx,
      name: mapping.outputField[0].name,
      groupIds: [dataMapperOutputContainerId],
      category: 'example',
      status: 'update',
      groupable: true
    });
  }

  function handleDataMapperFieldContainers(idx) {
    /**
     * Displays the input fields
     */
    const containerForInput = {
      id: dataMapperInputContainerId,
      name: 'Input Fields',
      category: 'fields',
      groupIds: [dataMapperContainerId],
      groupable: true,
      expandable: true,
      isExpand: false,
      collapsible: true
    };

    /**
     * Displays the output fields
     */
    const containerForOutput = {
      id: dataMapperOutputContainerId,
      name: 'Output Fields',
      category: 'fields',
      groupIds: [dataMapperContainerId],
      groupable: true,
      isExpand: false,
      expandable: true,
      collapsible: true
    };

    // @ts-ignore
    newNodes.push(containerForInput, containerForOutput);
  }

  function handleDataMapperContainer(idx) {
    /**
     * Create container for sub-groups
     */
    const container = {
      id: dataMapperContainerId,
      name: 'Mappings',
      category: 'container',
      views: ['setting', 'colorTag-01'],
      isGroup: true,
      isExpand: false,
      expandable: true,
      collapsible: true
    };

    // @ts-ignore
    newNodes.push(container);
  }

  function handleDataMapper(step, idx) {
    const mappings = JSON.parse(step.configuredProperties.atlasmapping).AtlasMapping.mappings.mapping;

    const newStep = {
      id: idx,
      name: step.name || step.connection.connector.name || null,
      category: 'mapper',
      views: ['number'],
      status: 'error',
      objNumber: mappings.length,
      isGroup: true,
      isExpand: true,
      expandable: true,
      collapsible: true
    };

    // @ts-ignore
    newNodes.push(newStep);

    dataMapperContainerId = 'mapper-container-' + idx;
    dataMapperInputContainerId = 'mapper-input-container-' + idx;
    dataMapperOutputContainerId = 'mapper-output-container-' + idx;

    handleDataMapperContainer(idx);
    handleDataMapperFieldContainers(idx);

    /**
     * Handle links for data mapper step
     */

    // From inline node of data mapper to Mappings container
    // @ts-ignore
    newLinks.push({ id: 'l-container-' + idx, from: idx, to: dataMapperContainerId });

    // From inline Data Mapper node of data mapper to Input fields, when Mappings container is expanded
    // @ts-ignore
    newLinks.push({ id: 'l-input-fields-' + idx, from: idx, to: dataMapperInputContainerId });

    // From inline Data Mapper node of data mapper to Output fields, when Mappings container is expanded
    // @ts-ignore
    newLinks.push({ id: 'l-output-fields-' + idx, from: idx, to: dataMapperOutputContainerId });

    mappings.forEach((mapping, mappingIdx) => {
      handleDataMapperMapping(mapping, mappingIdx);
    });
  }



  useEffect(() => {
    let id;
    let temp = data;

    function syndesisHelper(originalJson) {
      /**
       * TODO: Replace with Interface + TS
       * Iterate over each step
       */
      const steps = originalJson.flows ? originalJson.flows[0].steps : [];

      const statusList = ['published', 'unpublished', 'error', 'pending', 'deleting'];

      steps.forEach((step, idx) => {
        id = idx.toString();
        const randomIndex = Math.floor(Math.random() * statusList.length);

        /**
         * Handle data mapper step separately
         */
        if(step.stepKind === 'mapper') {
          handleDataMapper(step, id);
        } else {
          const newStep = {
            id: id,
            name: step.name || step.connection.connector.name,
            status: id === 1 ? 'pending' : statusList[randomIndex],
            category: step.stepKind
          };

          // @ts-ignore
          newNodes.push(newStep);
        }

        /**
         * Handle links
         */
        if (id !== 0) { // @ts-ignore
          newLinks.push({ id: 'l-prev-node' + id, from: id - 1, to: id })}
      });

      // @ts-ignore
      setData({nodes: newNodes, links: newLinks});
    }

    if (projectName === 'Integration') {
      syndesisHelper(integrationJson);
      //temp = integrationJson;
      //setData(temp);
    } else {
      // @ts-ignore
      temp = integrationJson;
      setData(temp);
    }
  }, [integrationJson]);

  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setWidth(window.innerWidth - 20 || 0);
        setHeight(window.innerHeight - 20 || 0);
      }, 300);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // @ts-ignore
  return (
    <>
      <h1>D3</h1>
      <div className='App'>
        <Topology identifier='topology' mode='2d' projectName={projectName} data={data} width={width} height={height} enableGroup />
      </div>
    </>
  );
}

export { VizD3 };
