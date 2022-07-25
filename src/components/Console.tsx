import { fetchDeploymentLogs, useDeploymentStore, useSettingsStore } from '../api';
import { IExpanded } from '../pages/Dashboard';
import {
  Button,
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
  expanded: IExpanded;
  handleCloseConsole: () => void;
}

const Console = (props: IConsole) => {
  const { deployment } = useDeploymentStore();
  const [logs, setLogs] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [itemCount, setItemCount] = useState(1);
  const [currentItemCount, setCurrentItemCount] = useState(0);
  const [renderData, setRenderData] = useState('');
  const { settings } = useSettingsStore();
  const [buffer, setBuffer] = useState<string[]>([]);
  const [linesBehind, setLinesBehind] = useState(0);
  const logViewerRef = useRef<{ scrollToBottom: () => void }>();

  useEffect(() => {
    setLinesBehind(0);
    setBuffer([]);
    setItemCount(1);
    setCurrentItemCount(0);

    fetchDeploymentLogs(settings.name, settings.namespace, 50)
      .then((body: ReadableStream | unknown) => {
        // @ts-ignore
        const reader = body.pipeThrough(new TextDecoderStream()).getReader();
        return new ReadableStream({
          async start(controller) {
            return pump();
            function pump() {
              return reader.read().then(({ done, value }: { done: boolean; value: string }) => {
                setLogs((currentArray) => [...currentArray, value]);
                setItemCount((itemCount) => itemCount + 1);

                // When no more data needs to be consumed, close the stream
                if (done) {
                  controller.close();
                  return;
                }
                // Enqueue the next data chunk into our target stream
                controller.enqueue(value);
                return pump();
              });
            }
          },
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }, [settings, deployment]);

  useEffect(() => {
    if (itemCount > logs.length) {
      setBuffer(logs.slice(0, itemCount));
    }
  }, [itemCount]);

  useEffect(() => {
    if (!isPaused && buffer.length > 0) {
      // if it's NOT paused, and there is a buffer.
      // `currentItemCount` = length of the buffer
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
    const file = new Blob(logs, { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${settings.name}-log.txt`;
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
    <>
      <LogViewer
        data={renderData}
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
    </>
  );
};

export { Console };
