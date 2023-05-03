import { VisualizationStepViews } from './VisualizationStepViews';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Step Views/VisualizationStepViews',
  component: VisualizationStepViews,
  args: {
    isPanelExpanded: true,
    step: {
      id: 'servlet',
      integrationId: 'Camel Route-1',
      name: 'servlet',
      type: 'START',
      description:
        'The Servlet component provides HTTP based endpoints for consuming HTTP requests that arrive at a HTTP endpoint that is bound to a published Servlet.',
      group: 'Servlet',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4IiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTEyIDUxMjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPHBhdGggZD0iTTQ0OCwwSDY0QzQ2LjMyOCwwLDMyLDE0LjMxMywzMiwzMnY0NDhjMCwxNy42ODgsMTQuMzI4LDMyLDMyLDMyaDM4NGMxNy42ODgsMCwzMi0xNC4zMTIsMzItMzJWMzINCgkJQzQ4MCwxNC4zMTMsNDY1LjY4OCwwLDQ0OCwweiBNNjQsNDgwVjEyOGg4MHY2NEg5NnYxNmg0OHY0OEg5NnYxNmg0OHY0OEg5NnYxNmg0OHY0OEg5NnYxNmg0OHY4MEg2NHogTTQ0OCw0ODBIMTYwdi04MGgyNTZ2LTE2DQoJCUgxNjB2LTQ4aDI1NnYtMTZIMTYwdi00OGgyNTZ2LTE2SDE2MHYtNDhoMjU2di0xNkgxNjB2LTY0aDI4OFY0ODB6Ii8+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==',
      kind: 'Camel-Connector',
      parameters: [
        {
          defaultValue: '',
          description: 'The context-path to use.',
          id: 'contextPath',
          nullable: false,
          path: true,
          title: 'contextPath',
          type: 'string',
        },
        {
          defaultValue: true,
          description:
            'If this option is false the Servlet will disable the HTTP streaming and set the content-length header on the response.',
          id: 'chunked',
          nullable: true,
          path: false,
          title: 'chunked',
          type: 'boolean',
        },
        {
          defaultValue: false,
          description:
            'Determines whether or not the raw input stream from Servlet is cached or not (Camel will read the stream into a in memory/overflow to file, Stream caching) cache. By default Camel will cache the Servlet input stream to support reading it multiple times to ensure it Camel can retrieve all data from the stream. However you can set this option to true when you for example need to access the raw stream, such as streaming it directly to a file or other persistent store. DefaultHttpBinding will copy the request input stream into a stream cache and put it into message body if this option is false to support reading the stream multiple times. If you use Servlet to bridge/proxy an endpoint then consider enabling this option to improve performance, in case you do not need to read the message payload multiple times. The http producer will by default cache the response body stream. If setting this option to true, then the producers will not cache the response body stream but use the response stream as-is as the message body.',
          id: 'disableStreamCache',
          nullable: true,
          path: false,
          title: 'disableStreamCache',
          type: 'boolean',
        },
        {
          defaultValue: false,
          description: 'Configure the consumer to work in async mode.',
          id: 'async',
          nullable: true,
          path: false,
          title: 'async',
          type: 'boolean',
        },
        {
          defaultValue: 'HeaderFilterStrategy',
          description:
            'To use a custom org.apache.camel.spi.HeaderFilterStrategy to filter header to and from Camel message.',
          id: 'headerFilterStrategy',
          nullable: true,
          path: false,
          title: 'headerFilterStrategy',
          type: 'string',
        },
        {
          defaultValue: '',
          description:
            'Used to only allow consuming if the HttpMethod matches, such as GET/POST/PUT etc. Multiple methods can be specified separated by comma.',
          id: 'httpMethodRestrict',
          nullable: true,
          path: false,
          title: 'httpMethodRestrict',
          type: 'string',
        },
      ],
      minBranches: 1,
      maxBranches: -1,
      UUID: 'servlet-0-92441813284',
      required: ['contextPath'],
      title: 'Servlet',
    },
  },
  argTypes: { onClosePanelClick: { action: 'clicked' }, saveConfig: { action: 'triggered' } },
} as ComponentMeta<typeof VisualizationStepViews>;

const Template: ComponentStory<typeof VisualizationStepViews> = (args) => {
  return <VisualizationStepViews {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
