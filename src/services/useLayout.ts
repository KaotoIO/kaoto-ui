import { stratify, tree } from 'd3-hierarchy';
import { timer } from 'd3-timer';
import { useEffect, useRef } from 'react';
import { Edge, Node, useReactFlow, useStore } from 'reactflow';

const layout = tree()
  .nodeSize([200, 150])
  .separation(() => 1);
const options = { duration: 300 };

function layoutNodes(nodes: Node[], edges: Edge[]) {
  const hierarchy = stratify()
    .id((d: any) => d.id)
    .parentId((d: any) => edges.find((e: Edge) => e.target === d.id)?.source)(nodes);

  const root = layout(hierarchy);

  return root.descendants().map((d: any) => ({ ...d.data, position: { x: d.x, y: d.y } }));
}

const nodesLengthSelector = (state: any) => state.nodeInternals.size;

function useLayout() {
  const initial = useRef(true);
  const nodesLength = useStore(nodesLengthSelector);
  const { getNodes, getNode, setNodes, setEdges, getEdges } = useReactFlow();

  useEffect(() => {
    const nodes = getNodes();
    const edges = getEdges();

    console.table(nodes);

    const targetNodes = layoutNodes(nodes, edges);

    const transitions = targetNodes.map((node) => {
      return {
        id: node.id,
        from: getNode(node.id)?.position || node.position,
        to: node.position,
        node,
      };
    });

    const t = timer((elapsed) => {
      const s = elapsed / options.duration;

      const currNodes = transitions.map(({ node, from, to }) => {
        return {
          id: node.id,
          position: node.data.added
            ? {
                x: to.x,
                y: to.y,
              }
            : {
                x: from.x + (to.x - from.x) * s,
                y: from.y + (to.y - from.y) * s,
              },
          data: { ...node.data, added: false },
          type: node.type,
        };
      });

      setNodes(currNodes);

      if (elapsed > options.duration) {
        const finalNodes = transitions.map(({ node, to }) => {
          return {
            id: node.id,
            position: {
              x: to.x,
              y: to.y,
            },
            data: { ...node.data, added: false },
            type: node.type,
          };
        });

        setNodes(finalNodes);

        t.stop();

        initial.current = false;
      }
    });

    return () => {
      t.stop();
    };
  }, [nodesLength, getEdges, getNodes, getNode, setNodes, setEdges]);
}

export default useLayout;
