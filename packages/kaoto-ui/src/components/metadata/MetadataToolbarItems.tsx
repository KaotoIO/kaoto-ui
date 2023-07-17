import { useFlowsVisibility } from '../../hooks/flows-visibility.hook';
import { MetadataEditorModal } from './MetadataEditorModal';
import { fetchMetadataSchema } from '@kaoto/api';
import { useSettingsStore } from '@kaoto/store';
import { Button, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { useEffect, useState } from 'react';

/**
 * Toolbar items for metadata. Retrieve schema for each metadata through {@link fetchMetadataSchema}
 * and create toolbar entries for each metadata. Each toolbar entries are the links to the {@link MetadataEditorModal}
 * of corresponding metadata.
 * @constructor
 */
export function MetadataToolbarItems() {
  const dsl = useSettingsStore((state) => state.settings.dsl.name);
  const [metadataSchemaMap, setMetadataSchemaMap] = useState<{ [key: string]: any }>({});
  const [expanded, setExpanded] = useState({} as { [key: string]: boolean });
  const visibleFlowsInformation = useFlowsVisibility();

  useEffect(() => {
    fetchMetadataSchema(dsl).then((schema) => {
      setMetadataSchemaMap(schema);
      Object.keys(schema).forEach((name) => (expanded[name] = false));
      setExpanded({ ...expanded });
    });
  }, [dsl]);

  function handleSetExpanded(name: string, expand: boolean) {
    Object.keys(expanded).forEach((key) => (expanded[key] = false));
    expanded[name] = expand;
    setExpanded({ ...expanded });
  }

  function toggleExpanded(name: string) {
    handleSetExpanded(name, !expanded[name]);
  }

  function renderMetadataToolbarItems() {
    if (
      visibleFlowsInformation.isCanvasEmpty ||
      !metadataSchemaMap ||
      Object.keys(metadataSchemaMap).length === 0
    ) {
      return [];
    }

    return [
      ...Object.entries(metadataSchemaMap).map(([metadataName, metadataSchema]) => {
        return (
          <ToolbarItem key={'toolbar-metadata-' + metadataName}>
            <Tooltip content={<div>{metadataSchema.description}</div>} position="bottom">
              <Button
                variant="link"
                isActive={expanded[metadataName]}
                data-testid={'toolbar-metadata-' + metadataName + '-btn'}
                onClick={() => toggleExpanded(metadataName)}
              >
                {metadataSchema.title}
              </Button>
            </Tooltip>
            <MetadataEditorModal
              name={metadataName}
              schema={metadataSchema}
              handleCloseModal={() => handleSetExpanded(metadataName, false)}
              isModalOpen={expanded[metadataName]}
            />
          </ToolbarItem>
        );
      }),
      <ToolbarItem key="toolbar-metadata-separator" variant="separator" />,
    ];
  }

  return <>{renderMetadataToolbarItems()}</>;
}
