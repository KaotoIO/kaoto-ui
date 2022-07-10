import { data } from '../data/log';
import { IExpanded } from '../pages/Dashboard';
import {
  Badge,
  Button,
  Select,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
  Tooltip,
} from '@patternfly/react-core';
import {
  CloseIcon,
  DownloadIcon,
  EllipsisVIcon,
  OutlinedPlayCircleIcon,
  PauseIcon,
  PlayIcon,
} from '@patternfly/react-icons';
import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';
import { Fragment, useEffect, useRef, useState } from 'react';

interface IConsole {
  // CRD, or string, of deployment
  deployment?: string;
  expanded: IExpanded;
  handleCloseConsole: () => void;
}

const Console = (props: IConsole) => {
  const dataSources = {
    'container-1': { type: 'C', id: 'data1' },
    'container-2': { type: 'D', id: 'data2' },
    'container-3': { type: 'E', id: 'data3' },
  };
  const [isPaused, setIsPaused] = useState(false);
  const [itemCount, setItemCount] = useState(1);
  const [currentItemCount, setCurrentItemCount] = useState(0);
  const [renderData, setRenderData] = useState('');
  const [selectedDataSource, setSelectedDataSource] = useState('container-1');
  const [selectDataSourceOpen, setSelectDataSourceOpen] = useState(false);
  const [timer, setTimer] = useState<string | number | undefined>();
  const [selectedData, setSelectedData] = useState(
    data[dataSources[selectedDataSource].id].split('\n')
  );
  const [buffer, setBuffer] = useState([]);
  const [linesBehind, setLinesBehind] = useState(0);
  const logViewerRef = useRef();

  useEffect(() => {
    setTimer(
      window.setInterval(() => {
        setItemCount((itemCount) => itemCount + 1);
      }, 500)
    );
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (itemCount > selectedData.length) {
      window.clearInterval(timer);
    } else {
      setBuffer(selectedData.slice(0, itemCount));
    }
  }, [itemCount]);

  useEffect(() => {
    if (!isPaused && buffer.length > 0) {
      setCurrentItemCount(buffer.length);
      setRenderData(buffer.join('\n'));
      if (logViewerRef && logViewerRef.current) {
        logViewerRef.current.scrollToBottom();
      }
    } else if (buffer.length !== currentItemCount) {
      setLinesBehind(buffer.length - currentItemCount);
    } else {
      setLinesBehind(0);
    }
  }, [isPaused, buffer]);

  const onDownloadClick = () => {
    const element = document.createElement('a');
    const dataToDownload = [data[dataSources[selectedDataSource].id]];
    const file = new Blob(dataToDownload, { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedDataSource}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const onScroll = ({ scrollOffsetToBottom, scrollUpdateWasRequested }: any) => {
    if (!scrollUpdateWasRequested) {
      if (scrollOffsetToBottom > 0) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    }
  };

  const selectDataSourceMenu = Object.entries(dataSources).map(([value, { type }]) => (
    <SelectOption
      key={value}
      value={value}
      isSelected={selectedDataSource === value}
      isChecked={selectedDataSource === value}
    >
      <Badge key={value}>{type}</Badge>
      {` ${value}`}
    </SelectOption>
  ));

  const selectDataSourcePlaceholder = (
    <Fragment>
      <Badge>{dataSources[selectedDataSource].type}</Badge>
      {` ${selectedDataSource}`}
    </Fragment>
  );

  const ControlButton = () => {
    return (
      <Button
        variant={isPaused ? 'plain' : 'link'}
        onClick={() => {
          setIsPaused(!isPaused);
        }}
      >
        {isPaused ? <PlayIcon /> : <PauseIcon />}
        {isPaused ? ` Resume Log` : ` Pause Log`}
      </Button>
    );
  };

  const leftAlignedToolbarGroup = (
    <Fragment>
      <ToolbarToggleGroup toggleIcon={<EllipsisVIcon />} breakpoint="md">
        <ToolbarItem variant="search-filter">
          <Select
            onToggle={(isOpen) => setSelectDataSourceOpen(isOpen)}
            onSelect={(_event, selection) => {
              setSelectDataSourceOpen(false);
              setSelectedDataSource(selection);
              setSelectedData(data[dataSources[selection].id].split('\n'));
              setLinesBehind(0);
              setBuffer([]);
              setItemCount(1);
              setCurrentItemCount(0);
            }}
            selections={selectedDataSource}
            isOpen={selectDataSourceOpen}
            placeholderText={selectDataSourcePlaceholder}
          >
            {selectDataSourceMenu}
          </Select>
        </ToolbarItem>
        <ToolbarItem variant="search-filter">
          <LogViewerSearch
            onFocus={() => setIsPaused(true)}
            placeholder="Search"
            minSearchChars={1}
          />
        </ToolbarItem>
      </ToolbarToggleGroup>
      <ToolbarItem>
        <ControlButton />
      </ToolbarItem>
    </Fragment>
  );

  const rightAlignedToolbarGroup = (
    <Fragment>
      <ToolbarGroup variant="icon-button-group">
        <ToolbarItem>
          <Tooltip position="top" content={<div>Download</div>}>
            <Button onClick={onDownloadClick} variant="plain" aria-label="Download current logs">
              <DownloadIcon />
            </Button>
          </Tooltip>
        </ToolbarItem>
        <ToolbarItem>
          <Button onClick={props.handleCloseConsole} variant="plain" aria-label="Close log viewer">
            <CloseIcon />
          </Button>
        </ToolbarItem>
      </ToolbarGroup>
    </Fragment>
  );

  const FooterButton = () => {
    const handleClick = () => {
      setIsPaused(false);
    };

    return (
      <Button onClick={handleClick} isBlock>
        <OutlinedPlayCircleIcon />
        resume {linesBehind === 0 ? null : `and show ${linesBehind} lines`}
      </Button>
    );
  };

  return (
    <LogViewer
      data={renderData}
      // id="complex-toolbar-demo"
      scrollToRow={currentItemCount}
      innerRef={logViewerRef}
      height={400}
      toolbar={
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup alignment={{ default: 'alignLeft' }}>
              {leftAlignedToolbarGroup}
            </ToolbarGroup>
            <ToolbarGroup alignment={{ default: 'alignRight' }}>
              {rightAlignedToolbarGroup}
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      }
      overScanCount={10}
      footer={isPaused && <FooterButton />}
      onScroll={onScroll}
    />
  );
};

export { Console };
