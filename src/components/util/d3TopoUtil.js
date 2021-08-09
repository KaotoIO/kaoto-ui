import get from 'lodash/get';
import parseSvgTransform from './svgTransformParser';
const d3 = Object.assign({}, require('d3-selection'), require('d3-scale'), require('d3-shape'));

const d3TopoUtil = {
  replaceIconByBrowser: function(nodeType) {
    if (nodeType && !this.isChromeAgent()) {
      for (const key in nodeType) {
        if (Object.prototype.hasOwnProperty.call(nodeType, key)) {
          const nodeTypeValues = nodeType[key];
          if (nodeTypeValues['icon'] && nodeTypeValues['icon'].indexOf('svg') >= 0 && nodeTypeValues['iconOfPng']) {
            nodeTypeValues['icon'] = nodeTypeValues['iconOfPng'];
          }
        }
      }
    }
  },

  isPanAction: function(mouseDownPosition, mouseUpPosition) {
    if (mouseDownPosition && mouseUpPosition) {
      if (this.diff(mouseUpPosition.x, mouseDownPosition.x) > 5 || this.diff(mouseUpPosition.y, mouseDownPosition.y) > 5) {
        return true;
      }
    }
    return false;
  },

  isIEAgent: function() {
    if (this.isIEAgentValue !== undefined) {
      return this.isIEAgentValue;
    }
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf('Trident') !== -1 || userAgent.indexOf('MSIE ') !== -1 || !!document.documentMode) {
      this.isIEAgentValue = true;
      return true;
    } else {
      this.isIEAgentValue = false;
      return false;
    }
  },

  isOperaAgent: function() {
    if (this.isOperaAgentValue !== undefined) {
      return this.isOperaAgentValue;
    }
    if (!!window.opera || window.navigator.userAgent.indexOf(' OPR/') >= 0) {
      this.isOperaAgentValue = true;
      return true;
    } else {
      this.isOperaAgentValue = false;
      return false;
    }
  },

  isChromeAgent: function() {
    if (this.isChromeAgentValue !== undefined) {
      return this.isChromeAgentValue;
    }
    if (!!window.chrome && !this.isOperaAgent()) {
      this.isChromeAgentValue = true;
      return true;
    } else {
      this.isChromeAgentValue = false;
      return false;
    }
  },

  isNumber: function(n) {
    let result = false;
    try {
      result = !isNaN(parseFloat(n)) && isFinite(n);
    } catch (e) {
      result = false;
    }
    return result;
  },

  diff: function(a, b) {
    return Math.abs(a - b);
  },

  distance: function(x1, y1, x2, y2) {
    if (!x2) x2 = 0;
    if (!y2) y2 = 0;
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  },

  getValueFromObject(obj, key, defaultValue) {
    if (obj) {
      const value = get(obj, key, defaultValue);
      if (value !== undefined && value !== null && !isNaN(value) && value !== Infinity && value !== -Infinity) {
        return value;
      } else {
        return defaultValue;
      }
    } else {
      return defaultValue;
    }
  },

  checkNumber(value, defaultValue) {
    if (this.isNumber(value)) {
      return value;
    } else {
      return defaultValue;
    }
  },

  findObjectInArray(array, item) {
    let iteratorIndex = -1;
    if (array && array.forEach) {
      array.forEach(function(temp, i) {
        if ((item.oid !== undefined && item.oid === temp.oid) || (item.id !== undefined && item.id === temp.id)) {
          iteratorIndex = i;
        }
      }, item);
    }
    return iteratorIndex;
  },

  getSizeInt(value, defaultValue) {
    let sizeInt;
    try {
      sizeInt = value ? parseInt(value.replace('px', '')) : defaultValue;
    } catch (e) {
      sizeInt = defaultValue;
    }
    return sizeInt;
  },

  // normal line position
  getLinkPathPosition({
                        data,
                        lineType,
                        lineIndex = 0,
                        lineNumber = 1,
                        curveFunc,
                        getControlPoints = () => {
                          return [];
                        },
                        reversed = false,
                        bias,
                        lineInfo
                      }) {
    let result;
    // https://www.dashingd3js.com/svg-paths-and-d3js
    bias = bias || { source: { x: 0, y: 0 }, target: { x: 0, y: 0 } };
    const defaultInterpolateTypes = {
      linear: d3.curveLinear,
      basis: d3.curveBasis,
      cardinal: d3.curveCardinal,
      bundle: d3.curveBundle,
      monotone: d3.curveMonotoneX
    };
    if (!curveFunc) {
      curveFunc = lineType && defaultInterpolateTypes[lineType] ? defaultInterpolateTypes[lineType] : defaultInterpolateTypes['linear'];
    }
    switch (lineType) {
      case 'arc':
        if (lineInfo) {
          // https://www.oxxostudio.tw/articles/201406/svg-05-path-2.html
          const startIndex = lineNumber % 2 !== 0 ? lineIndex + 1 : lineIndex; // odd or even number
          const lineNumberQuotient = parseInt(lineNumber / 2);
          const isOdd = startIndex % 2 !== 0;
          const sweepFlag = isOdd ? 1 : 0;
          const quotient = parseInt(startIndex / 2) + ((1 * lineNumber) % 2 !== 0 ? 0 : 1); // odd line number start from 0
          const sourceWithBias = { x: data.source.x + lineInfo.bias.source.x, y: data.source.y + lineInfo.bias.source.y };
          const targetWithBias = { x: data.target.x + lineInfo.bias.target.x, y: data.target.y + lineInfo.bias.target.y };
          const hypotenuse = this.distance(sourceWithBias.x, sourceWithBias.y, targetWithBias.x, targetWithBias.y);
          const oppositeWithYAxis = this.distance(0, targetWithBias.y, targetWithBias.x, targetWithBias.y);
          const angleWithYAxis = this.getAngleOfRightTriangle(hypotenuse, oppositeWithYAxis);
          let rx;
          let ry;
          if (angleWithYAxis <= 30) {
            rx = lineInfo.rx * quotient;
            ry = lineInfo.ry;
          } else if (angleWithYAxis <= 75) {
            rx = lineInfo.rx * (quotient > 0 ? lineNumberQuotient / 10 + 1 / quotient : 0);
            ry = lineInfo.ry * (quotient > 0 ? lineNumberQuotient / 10 + 1.5 / quotient : 0);
          } else {
            rx = lineInfo.rx;
            ry = lineInfo.ry * quotient;
          }
          const p = this.getNormPosition(data, bias);
          result = 'M' + p.source.x + ',' + p.source.y + ` A${rx} ${ry}, 0 0 ${sweepFlag} ` + p.target.x + ',' + p.target.y;
        }
        break;
      case 'diagonal':
        if (data) {
          const p = this.getNormPosition(data, bias);
          result = `M ${p.source.x} ${p.source.y}
          C ${(p.source.x + p.target.x) / 2} ${p.source.y},
            ${(p.source.x + p.target.x) / 2} ${p.target.y},
            ${p.target.x} ${p.target.y}`;
        }
        break;
      case 'polyPathLine':
        if (data) {
          const p = this.getNormPosition(data, bias);
          result = 'M' + p.source.x + ',' + p.source.y + 'V' + (3 * p.source.y + 4 * p.target.y) / 7 + 'H' + p.target.x + 'V' + p.target.y;
        }
        break;
      default:
        if (data) {
          const line = this.genLine(bias).curve(curveFunc);
          let pointArray = [data.source, ...getControlPoints(data.source, data.target), data.target];
          pointArray = reversed ? pointArray.reverse() : pointArray;
          result = line(pointArray);
        }
    }
    return result;
  },

  getNormPosition(data, bias) {
    const norm = this.getNorm(data.source, data.target);
    const sourceX = data.source.x + bias.source.x * norm.x;
    const sourceY = data.source.y + bias.source.y * norm.y;
    const targetX = data.target.x + bias.target.x * norm.x;
    const targetY = data.target.y + bias.target.y * norm.y;
    return { source: { x: sourceX, y: sourceY }, target: { x: targetX, y: targetY } };
  },

  getNorm(source, target) {
    // 參考http://bl.ocks.org/rkirsling/5001347
    if (source !== undefined && target !== undefined) {
      const deltaX = target.x - source.x;
      const deltaY = target.y - source.y;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const normX = deltaX / dist;
      const normY = deltaY / dist;
      return { x: normX, y: normY };
    } else {
      return { x: 1, y: 1 };
    }
  },

  genLine(bias) {
    return d3
    .line()
    .x((d, index, array) => {
      const source = array[0];
      const target = array[array.length - 1];
      const norm = this.getNorm(source, target);
      let b = 0;
      if (index === 0) {
        b = bias.source.x;
      } else if (index === array.length - 1) {
        b = bias.target.x;
      }
      return d && this.isNumber(d.x) ? d.x + b * norm.x : b * norm.x || 0;
    })
    .y((d, index, array) => {
      const source = array[0];
      const target = array[array.length - 1];
      const norm = this.getNorm(source, target);
      let b = 0;
      if (index === 0) {
        b = bias.source.y;
      } else if (index === array.length - 1) {
        b = bias.target.y;
      }
      return d && this.isNumber(d.y) ? d.y + b * norm.y : b * norm.y || 0;
    });
  },

  getTranslateFromTransform(string) {
    const position = typeof string === 'string' ? string.indexOf('translate(') + 10 : -1;
    return position > -1
      ? string
      .substring(position, string.indexOf(')', position))
      .split(',')
      .map(t => Number(t))
      : [0, 0];
  },

  getScaleFromTransform(string) {
    const transform = string ? parseSvgTransform(string) : {};
    return get(transform, 'scale.sx', 1);
  },

  getParsedSvgTransform(string) {
    return string ? parseSvgTransform(string) : {};
  },

  getAngleOfRightTriangle(hypotenuse, opposite) {
    const sinOfAngleX = opposite / hypotenuse; // 0.5
    return (Math.asin(sinOfAngleX) * 180) / Math.PI;
  },

  distanceNodePosition({ node, additionalDistance, isExpand, incremental = 'v' }) {
    let result = false;

    if (isExpand && (node.addX !== undefined || node.addY !== undefined)) {
      return result;
    }
    if (additionalDistance !== undefined && additionalDistance !== 0) {
      // const quadrant = this.getQuadrant(node.x, node.y);
      let distanceFactorX = 1;
      let distanceFactorY = 1;

      if (incremental === 'v') {
        // vertical incremental
        distanceFactorY = Math.log2(this.distance(0, 0, 0, node.y) / 100);
      } else if (incremental === 'h') {
        // horizontal incremental
        distanceFactorX = Math.log2(this.distance(0, 0, node.x, 0) / 100);
      }
      let newX = node.x;
      let newY = node.y;
      const factor = isExpand ? 1 : -1;
      if (node.x !== 0) {
        additionalDistance *= distanceFactorX > 1 ? distanceFactorX : 1;
        const addX = node.x > 0 ? additionalDistance * factor : -additionalDistance * factor;
        newX += addX;
        node.addX = addX;
      }
      if (node.y !== 0) {
        additionalDistance *= distanceFactorY > 1 ? distanceFactorY : 1;
        const addY = node.y > 0 ? additionalDistance * factor : -additionalDistance * factor;
        newY += addY;
        node.addY = addY;
      }
      // setting new position
      node.x = newX;
      node.y = newY;
      result = true;
    }

    return result;
  }
};

export default d3TopoUtil;
