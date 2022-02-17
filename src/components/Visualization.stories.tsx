import { StepsAndViewsProvider } from '../api';
import steps from '../data/steps';
import views from '../data/views';
import { AlertProvider, Visualization } from './index';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Visualization',
  component: Visualization,
  decorators: [
    (Story, context) => {
      return (
        <AlertProvider>
          <StepsAndViewsProvider initialState={context.args.initialState}>
            <Story />
          </StepsAndViewsProvider>
        </AlertProvider>
      );
    },
  ],
} as ComponentMeta<typeof Visualization>;

const Template: ComponentStory<typeof Visualization> = (args) => {
  return (
    <>
      <h1>Visualization</h1>
      <br />
      {<Visualization {...args} />}
    </>
  );
};

export const EmptyState = Template.bind({});
EmptyState.args = {
  initialState: {
    steps: [],
    views: [],
  },
  toggleCatalog: () => {},
};

export const Integration = Template.bind({});
Integration.args = {
  initialState: {
    steps: steps,
    views: views,
  },
  toggleCatalog: () => {},
};

export const WithoutStartStep = Template.bind({});
WithoutStartStep.args = {
  initialState: {
    steps: [
      {
        id: 'is-tombstone-filter-action',
        name: 'is-tombstone-filter-action',
        type: 'MIDDLE',
        description: 'Filter based on the presence of body or not',
        group: 'Actions',
        icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmlld0JveD0iMCAtMjU2IDE3OTIgMTc5MiIKICAgaWQ9InN2ZzMwMjUiCiAgIHZlcnNpb249IjEuMSIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC40OC4zLjEgcjk4ODYiCiAgIHdpZHRoPSIxMDAlIgogICBoZWlnaHQ9IjEwMCUiCiAgIHNvZGlwb2RpOmRvY25hbWU9ImNvZ19mb250X2F3ZXNvbWUuc3ZnIj4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGEzMDM1Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZGVmcwogICAgIGlkPSJkZWZzMzAzMyIgLz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEiCiAgICAgb2JqZWN0dG9sZXJhbmNlPSIxMCIKICAgICBncmlkdG9sZXJhbmNlPSIxMCIKICAgICBndWlkZXRvbGVyYW5jZT0iMTAiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAiCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjY0MCIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSI0ODAiCiAgICAgaWQ9Im5hbWVkdmlldzMwMzEiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlua3NjYXBlOnpvb209IjAuMTMxNjk2NDMiCiAgICAgaW5rc2NhcGU6Y3g9Ijg5NiIKICAgICBpbmtzY2FwZTpjeT0iODk2IgogICAgIGlua3NjYXBlOndpbmRvdy14PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIyNSIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIwIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzMwMjUiIC8+CiAgPGcKICAgICB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwtMSwxMjEuNDkxNTMsMTI4NS40MjM3KSIKICAgICBpZD0iZzMwMjciPgogICAgPHBhdGgKICAgICAgIGQ9Im0gMTAyNCw2NDAgcSAwLDEwNiAtNzUsMTgxIC03NSw3NSAtMTgxLDc1IC0xMDYsMCAtMTgxLC03NSAtNzUsLTc1IC03NSwtMTgxIDAsLTEwNiA3NSwtMTgxIDc1LC03NSAxODEsLTc1IDEwNiwwIDE4MSw3NSA3NSw3NSA3NSwxODEgeiBtIDUxMiwxMDkgViA1MjcgcSAwLC0xMiAtOCwtMjMgLTgsLTExIC0yMCwtMTMgbCAtMTg1LC0yOCBxIC0xOSwtNTQgLTM5LC05MSAzNSwtNTAgMTA3LC0xMzggMTAsLTEyIDEwLC0yNSAwLC0xMyAtOSwtMjMgLTI3LC0zNyAtOTksLTEwOCAtNzIsLTcxIC05NCwtNzEgLTEyLDAgLTI2LDkgbCAtMTM4LDEwOCBxIC00NCwtMjMgLTkxLC0zOCAtMTYsLTEzNiAtMjksLTE4NiAtNywtMjggLTM2LC0yOCBIIDY1NyBxIC0xNCwwIC0yNC41LDguNSBRIDYyMiwtMTExIDYyMSwtOTggTCA1OTMsODYgcSAtNDksMTYgLTkwLDM3IEwgMzYyLDE2IFEgMzUyLDcgMzM3LDcgMzIzLDcgMzEyLDE4IDE4NiwxMzIgMTQ3LDE4NiBxIC03LDEwIC03LDIzIDAsMTIgOCwyMyAxNSwyMSA1MSw2Ni41IDM2LDQ1LjUgNTQsNzAuNSAtMjcsNTAgLTQxLDk5IEwgMjksNDk1IFEgMTYsNDk3IDgsNTA3LjUgMCw1MTggMCw1MzEgdiAyMjIgcSAwLDEyIDgsMjMgOCwxMSAxOSwxMyBsIDE4NiwyOCBxIDE0LDQ2IDM5LDkyIC00MCw1NyAtMTA3LDEzOCAtMTAsMTIgLTEwLDI0IDAsMTAgOSwyMyAyNiwzNiA5OC41LDEwNy41IDcyLjUsNzEuNSA5NC41LDcxLjUgMTMsMCAyNiwtMTAgbCAxMzgsLTEwNyBxIDQ0LDIzIDkxLDM4IDE2LDEzNiAyOSwxODYgNywyOCAzNiwyOCBoIDIyMiBxIDE0LDAgMjQuNSwtOC41IFEgOTE0LDEzOTEgOTE1LDEzNzggbCAyOCwtMTg0IHEgNDksLTE2IDkwLC0zNyBsIDE0MiwxMDcgcSA5LDkgMjQsOSAxMywwIDI1LC0xMCAxMjksLTExOSAxNjUsLTE3MCA3LC04IDcsLTIyIDAsLTEyIC04LC0yMyAtMTUsLTIxIC01MSwtNjYuNSAtMzYsLTQ1LjUgLTU0LC03MC41IDI2LC01MCA0MSwtOTggbCAxODMsLTI4IHEgMTMsLTIgMjEsLTEyLjUgOCwtMTAuNSA4LC0yMy41IHoiCiAgICAgICBpZD0icGF0aDMwMjkiCiAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgc3R5bGU9ImZpbGw6Y3VycmVudENvbG9yIiAvPgogIDwvZz4KPC9zdmc+Cg==',
        kind: 'Kamelet',
        parameters: [],
        title: 'Is Tombstone Filter Action',
      },
      {
        id: 'aws-kinesis-firehose-sink',
        name: 'aws-kinesis-firehose-sink',
        type: 'END',
        description: 'Send message to an AWS Kinesis Firehose Stream',
        group: 'AWS Kinesis Firehose',
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgODUgODUiIGZpbGw9IiNmZmYiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjx1c2UgeGxpbms6aHJlZj0iI0EiIHg9IjIuNSIgeT0iMi41Ii8+PHN5bWJvbCBpZD0iQSIgb3ZlcmZsb3c9InZpc2libGUiPjxnIHN0cm9rZT0ibm9uZSI+PHBhdGggZD0iTTEzLjc2NiAzLjEyaDUyLjQ2OGMzLjY1MSAwIDcuMTUyIDEuMzYzIDkuNzM0IDMuNzg4UzgwIDEyLjYyNCA4MCAxNi4wNTR2MjEuNjk4Yy0yLjcxNy0xLjMxOS04LjY2NC0yLjcyMy0xNy40NjQtMi43MjMtMy4zNy0uMDEzLTYuNzM3LjIyNC0xMC4wNjguNzA5LTUuOTMyLjkyMi05LjA1NyAyLjUxLTkuMDU3IDMuNDg5djM2Ljg3M2MwIC42MS44OTEgMS40MTggMi41ODEgMi4yMTJIMTMuNzY2QzYuMTYzIDc4LjMxMyAwIDcyLjUyMiAwIDY1LjM3OVYxNi4wNTRDMCA4LjkxMSA2LjE2MyAzLjEyIDEzLjc2NiAzLjEyeiIgZmlsbD0iIzlkNTAyNSIvPjxwYXRoIGQ9Ik0xMy43NjYgMGg1Mi40NjhjMy42NTEgMCA3LjE1MiAxLjM2MyA5LjczNCAzLjc4OFM4MCA5LjUwNCA4MCAxMi45MzR2MjEuNjdjLTIuNzE3LTEuMzE5LTguNjY0LTIuNzIzLTE3LjQ2NC0yLjcyM2E2Ny45NCA2Ny45NCAwIDAgMC0xMC4wNjguNzA5Yy01LjkzMi45MjItOS4wNTcgMi41MS05LjA1NyAzLjQ4OXYzNi44MTZjMCAuNjEuODkxIDEuNDE4IDIuNTgxIDIuMjEySDEzLjc2NmMtMy42NTEgMC03LjE1Mi0xLjM2My05LjczNC0zLjc4OFMwIDY1LjYwNCAwIDYyLjE3NHYtNDkuMjRDMCA1Ljc5MSA2LjE2MyAwIDEzLjc2NiAweiIgZmlsbD0iI2Y1ODUzNCIvPjxwYXRoIGQ9Ik02My45MjQgNDEuODA4YTU3LjAzIDU3LjAzIDAgMCAwLTguNDUzLjU5NiAyNi40NCAyNi40NCAwIDAgMS03LjU0Ny0uNjI0djMuNTQ2YzAgLjgyMyAyLjY0MSAyLjE1NiA3LjU0NyAyLjkwN2E1NC40NyA1NC40NyAwIDAgMCA4LjQ1My41OTZDNzQuMzM5IDQ4LjgyOCA4MCA0Ni41MTcgODAgNDUuMzI2VjQxLjc4em0tMTYuMzc3IDEwLjQxdjI0LjI1MWMwIDEuMjIgNC41MjggMy41MTcgMTUuMzIxIDMuNTE3YTUxLjY4IDUxLjY4IDAgMCAwIDEzLjI2OC0xLjQxOGMyLjE0My0uNjUyIDMuNjY4LTEuNDE4IDMuODM0LTEuOTQzVjUyLjUxNmMtMy4xNCAxLjgyOS05LjYxNSAyLjgzNi0xNi4wNDUgMi44MzZoLTIuNjcxbC0xLjYzLS4yN2gtLjgxNWwtMS4yNjgtLjA5OS0uNjc5LS4wOTktMS4zNTgtLjE3YTIyLjQ5IDIyLjQ5IDAgMCAxLTcuOTU1LTIuNDk2eiIgZmlsbD0iIzlkNTAyNSIvPjxwYXRoIGQ9Ik02My45MjQgMzguMjc3YTU3LjAxIDU3LjAxIDAgMCAwLTguNDUzLjU5NmMtNC45ODEuNzgtNy41NDcgMi4xMTMtNy41NDcgMi45MjJzMi42NDEgMi4xNTYgNy41NDcgMi45MDdhNTQuNDYgNTQuNDYgMCAwIDAgOC40NTMuNTk2Qzc0LjMzOSA0NS4yOTggODAgNDIuOTg2IDgwIDQxLjc5NXMtNS42Ni0zLjUxNy0xNi4wNzYtMy41MTd6TTQ3LjU0NyA0OC42NzN2MjQuMjIzYzAgMS4yMzQgNC41MjggMy41MDMgMTUuMjc1IDMuNTAzYTUxLjY4IDUxLjY4IDAgMCAwIDEzLjI2OC0xLjQxOGMyLjE0My0uNjUyIDMuNjY4LTEuNDE4IDMuODM0LTEuOTQzdi0yNC4xMWMtMy4xNCAxLjgzLTkuNjE1IDIuODM2LTE2LjA0NSAyLjgzNmgtMi42NzJsLTEuNTg1LS4yMjdoLS44MTVsLTEuMjY4LS4wOTktLjY3OS0uMDk5LTEuMzU4LS4xN2EyMi40OSAyMi40OSAwIDAgMS03Ljk1NS0yLjQ5NnoiIGZpbGw9IiNmNTg1MzQiLz48cGF0aCBkPSJNMTMuNzY2IDc1LjE2NWgzMi4xOTZ2My4xMkgxMy43NjZDNi4xNjMgNzguMjg1IDAgNzIuNDk0IDAgNjUuMzUxdi0zLjEyYzAgNy4xNDMgNi4xNjMgMTIuOTM0IDEzLjc2NiAxMi45MzR6IiBmaWxsPSIjOWQ1MDI1Ii8+PHBhdGggZD0iTTY1LjE3NyAxNi4xNjhMNTMuMTAyIDQuODIydjUuNjczSDM0LjI0OVYzMC4zNWgxOC44MjN2Mi4xODRsNC4yNTYtLjQ0TDY5LjcyIDIwLjQyMnptLTU3LjU2OS0uMDAxdjE0LjE4MmgyMC44M1YxMC40NTJINy42MDh2NS43MTV6bTUuODExIDMzLjUxMnYxNC4xODJoMjAuODNWNDMuOTY0aC0yMC44M3Y1LjcxNXoiLz48L2c+PC9zeW1ib2w+PC9zdmc+',
        kind: 'Kamelet',
        parameters: [
          {
            defaultValue: '',
            description: 'The name of the stream we want to send to data to',
            id: 'streamName',
            label: 'streamName',
            path: false,
            type: 'string',
          },
          {
            defaultValue: '',
            description: 'The access key obtained from AWS',
            id: 'accessKey',
            label: 'accessKey',
            path: false,
            type: 'string',
          },
          {
            defaultValue: '',
            description: 'The secret key obtained from AWS',
            id: 'secretKey',
            label: 'secretKey',
            path: false,
            type: 'string',
          },
          {
            defaultValue: '',
            description: 'The AWS region to connect to',
            id: 'region',
            label: 'region',
            path: false,
            type: 'string',
          },
        ],
        title: 'AWS Kinesis Firehose Sink',
      },
    ],
    views: [
      {
        id: 'detail-step',
        name: 'Detail View',
        type: 'step',
      },
      {
        id: 'detail-step',
        name: 'Detail View',
        type: 'step',
      },
    ],
  },
  toggleCatalog: () => {},
};
