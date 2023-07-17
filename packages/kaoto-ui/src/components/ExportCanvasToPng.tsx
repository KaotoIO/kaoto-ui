import { DropdownItem } from '@patternfly/react-core';
import { toPng } from 'html-to-image';
import { useCallback } from 'react';

/** Taken from https://reactflow.dev/docs/examples/misc/download-image/ */
const downloadImage = (dataUrl: string, fileName: string) => {
  const a = document.createElement('a');

  a.setAttribute('download', `${fileName}.png`);
  a.setAttribute('href', dataUrl);
  a.click();
};

interface IExportCanvasToPng {
  fileName: string;
  onClick: () => void;
}

export const ExportCanvasToPng = ({ fileName, onClick }: IExportCanvasToPng) => {
  const scheduleExport = useCallback(() => {
    onClick();

    const reactFlowNode = document.querySelector<HTMLElement>('.react-flow');
    if (reactFlowNode === null) return;

    toPng(reactFlowNode, {
      filter: (node) => {
        /** Filter ReactFlow minimap and controls */
        return (
          !node?.classList?.contains('react-flow__minimap') &&
          !node?.classList?.contains('react-flow__controls')
        );
      },
    }).then((dataUrl) => {
      downloadImage(dataUrl, fileName);
    });
  }, [onClick, fileName]);

  return (
    <DropdownItem
      data-testid="kaotoToolbar-kebab__export"
      component="button"
      onClick={scheduleExport}
    >
      Export canvas to PNG
    </DropdownItem>
  );
};
