import { ComponentStory, ComponentMeta } from '@storybook/react';

import { VizReactFlow } from '../components/VizReactFlow';

export default {
  title: 'Visualization/React Flow',
  component: VizReactFlow,
} as ComponentMeta<typeof VizReactFlow>;

const steps = [
  {
    "apiVersion": "camel.apache.org/v1alpha1",
    "description": "Allows to get all tweets on particular keywords from Twitter.\n\nIt requires tokens that can be obtained by creating an application \nin the Twitter developer portal: https://developer.twitter.com/.",
    "group": "Twitter",
    "icon": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjI1NnB4IiBoZWlnaHQ9IjIwOXB4IiB2aWV3Qm94PSIwIDAgMjU2IDIwOSIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCI+CiAgICA8Zz4KICAgICAgICA8cGF0aCBkPSJNMjU2LDI1LjQ1MDAyNTkgQzI0Ni41ODA4NDEsMjkuNjI3MjY3MiAyMzYuNDU4NDUxLDMyLjQ1MDQ4NjggMjI1LjgzNDE1NiwzMy43MjAyMzMzIEMyMzYuNjc4NTAzLDI3LjIxOTgwNTMgMjQ1LjAwNTgzLDE2LjkyNjk5MjkgMjQ4LjkyNzQzNyw0LjY2MzA3Njg1IEMyMzguNzc5NzY1LDEwLjY4MTI2MzMgMjI3LjUzOTMyNSwxNS4wNTIzMzc2IDIxNS41NzU5OSwxNy40MDgyOTggQzIwNS45OTQ4MzUsNy4yMDA2OTcxIDE5Mi4zNDUwNiwwLjgyMiAxNzcuMjM5MTk3LDAuODIyIEMxNDguMjMyNjA1LDAuODIyIDEyNC43MTYwNzYsMjQuMzM3NTkzMSAxMjQuNzE2MDc2LDUzLjM0MjMxMTYgQzEyNC43MTYwNzYsNTcuNDU4Njg3NSAxMjUuMTgxNDYyLDYxLjQ2NzM3ODQgMTI2LjA3NjY1Miw2NS4zMTEyNjQ0IEM4Mi40MjU4Mzg1LDYzLjEyMTA0NTMgNDMuNzI1NzI1Miw0Mi4yMTE0MjkgMTcuODIxMzk4LDEwLjQzNTkyODggQzEzLjMwMDUwMTEsMTguMTkyOTkzOCAxMC43MTA0NDMsMjcuMjE1MTIzNCAxMC43MTA0NDMsMzYuODQwMjg4OSBDMTAuNzEwNDQzLDU1LjA2MTUyNiAxOS45ODM1MjU0LDcxLjEzNzQ5MDcgMzQuMDc2MjEzNSw4MC41NTU3MTM3IEMyNS40NjYwOTYxLDgwLjI4MzIyMzkgMTcuMzY4MTg0Niw3Ny45MjA3MDg4IDEwLjI4NjI1NzcsNzMuOTg2OTI5MiBDMTAuMjgyNTEyMiw3NC4yMDYwNDQ4IDEwLjI4MjUxMjIsNzQuNDI2MDk2NyAxMC4yODI1MTIyLDc0LjY0NzA4NSBDMTAuMjgyNTEyMiwxMDAuMDk0NDUzIDI4LjM4NjcwMDMsMTIxLjMyMjQ0MyA1Mi40MTM1NjMsMTI2LjE0NjczIEM0OC4wMDU5Njk1LDEyNy4zNDcxODQgNDMuMzY2MTUwOSwxMjcuOTg4NjEyIDM4LjU3NTU3MzQsMTI3Ljk4ODYxMiBDMzUuMTkxNDU1NCwxMjcuOTg4NjEyIDMxLjkwMDk3NjYsMTI3LjY1OTkzOCAyOC42OTQ3NzMsMTI3LjA0NjYwMiBDMzUuMzc3Nzk3MywxNDcuOTEzMTQ1IDU0Ljc3NDIwNTMsMTYzLjA5NzY2NSA3Ny43NTY5OTE4LDE2My41MjE4NSBDNTkuNzgyMDI1NywxNzcuNjA3OTgzIDM3LjEzNTQwMzYsMTg2LjAwNDYwNCAxMi41Mjg5MTQ3LDE4Ni4wMDQ2MDQgQzguMjg5ODcxNjEsMTg2LjAwNDYwNCA0LjEwODg4NDc0LDE4NS43NTY0NiAwLDE4NS4yNzE0MDkgQzIzLjI0MzEwMzMsMjAwLjE3MzEzOSA1MC44NTA3MjYxLDIwOC44Njc1MzIgODAuNTEwOTE4NSwyMDguODY3NTMyIEMxNzcuMTE2NTI5LDIwOC44Njc1MzIgMjI5Ljk0Mzk3NywxMjguODM2OTgyIDIyOS45NDM5NzcsNTkuNDMyNjAwMiBDMjI5Ljk0Mzk3Nyw1Ny4xNTUyOTY4IDIyOS44OTM0MTIsNTQuODkwMTY2NCAyMjkuNzkyMjgyLDUyLjYzODE0NTQgQzI0MC4wNTMyNTcsNDUuMjMzMTYzNSAyNDguOTU4MzM4LDM1Ljk4MjU1NDUgMjU2LDI1LjQ1MDAyNTkiIGZpbGw9IiM1NWFjZWUiPjwvcGF0aD4KICAgIDwvZz4KPC9zdmc+",
    "id": "twitter-search-source",
    "kameletType": "source",
    "kind": "Kamelet",
    "name": "twitter-search-source",
    "parameters": [
      {
        "default": "",
        "description": "The keywords to use in the Twitter search (Supports Twitter standard operators)",
        "id": "Keywords",
        "label": "Keywords",
        "type": "string",
        "value": "Apache Camel"
      },
      {
        "default": "",
        "description": "The API Key from the Twitter application in the developer portal",
        "id": "API Key",
        "label": "API Key",
        "type": "string"
      },
      {
        "default": "",
        "description": "The API Key Secret from the Twitter application in the developer portal",
        "id": "API Key Secret",
        "label": "API Key Secret",
        "type": "string"
      },
      {
        "default": "",
        "description": "The Access Token from the Twitter application in the developer portal",
        "id": "Access Token",
        "label": "Access Token",
        "type": "string"
      },
      {
        "default": "",
        "description": "The Access Token Secret from the Twitter application in the developer portal",
        "id": "Access Token Secret",
        "label": "Access Token Secret",
        "type": "string"
      }
    ],
    "subType": "KAMELET",
    "title": "Twitter Search Source",
    "type": "CONNECTOR"
  },
  {
    "apiVersion": "camel.apache.org/v1alpha1",
    "description": "Send data to Kafka topics.\n\nThe Kamelet is able to understand the following headers to be set:\n\n- `key` / `ce-key`: as message key\n\n- `partition-key` / `ce-partition-key`: as message partition key\n\nBoth the headers are optional.",
    "group": "Kafka",
    "icon": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCA1MDAgNTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MDAgNTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8ZyBpZD0iWE1MSURfMV8iPg0KCTxwYXRoIGlkPSJYTUxJRF85XyIgZD0iTTMxNC44LDI2OS43Yy0xNC4yLDAtMjcsNi4zLTM1LjcsMTYuMkwyNTYuOCwyNzBjMi40LTYuNSwzLjctMTMuNiwzLjctMjAuOWMwLTcuMi0xLjMtMTQuMS0zLjYtMjAuNg0KCQlsMjIuMy0xNS43YzguNyw5LjksMjEuNCwxNi4xLDM1LjYsMTYuMWMyNi4yLDAsNDcuNi0yMS4zLDQ3LjYtNDcuNnMtMjEuMy00Ny42LTQ3LjYtNDcuNnMtNDcuNiwyMS4zLTQ3LjYsNDcuNg0KCQljMCw0LjcsMC43LDkuMiwyLDEzLjVsLTIyLjMsMTUuN2MtOS4zLTExLjYtMjIuOC0xOS42LTM4LjEtMjIuMXYtMjYuOWMyMS42LTQuNSwzNy44LTIzLjcsMzcuOC00Ni42YzAtMjYuMi0yMS4zLTQ3LjYtNDcuNi00Ny42DQoJCWMtMjYuMiwwLTQ3LjYsMjEuMy00Ny42LDQ3LjZjMCwyMi42LDE1LjgsNDEuNSwzNi45LDQ2LjN2MjcuM2MtMjguOCw1LjEtNTAuOCwzMC4yLTUwLjgsNjAuNWMwLDMwLjQsMjIuMiw1NS43LDUxLjIsNjAuNXYyOC44DQoJCWMtMjEuMyw0LjctMzcuNCwyMy43LTM3LjQsNDYuNGMwLDI2LjIsMjEuMyw0Ny42LDQ3LjYsNDcuNmMyNi4yLDAsNDcuNi0yMS4zLDQ3LjYtNDcuNmMwLTIyLjctMTYtNDEuOC0zNy40LTQ2LjR2LTI4LjgNCgkJYzE1LTIuNSwyOC4yLTEwLjQsMzcuNC0yMS44bDIyLjUsMTUuOWMtMS4yLDQuMy0xLjksOC43LTEuOSwxMy40YzAsMjYuMiwyMS4zLDQ3LjYsNDcuNiw0Ny42czQ3LjYtMjEuMyw0Ny42LTQ3LjYNCgkJQzM2Mi40LDI5MSwzNDEuMSwyNjkuNywzMTQuOCwyNjkuN3ogTTMxNC44LDE1OC40YzEyLjcsMCwyMy4xLDEwLjQsMjMuMSwyMy4xYzAsMTIuNy0xMC4zLDIzLjEtMjMuMSwyMy4xcy0yMy4xLTEwLjQtMjMuMS0yMy4xDQoJCUMyOTEuOCwxNjguOCwzMDIuMSwxNTguNCwzMTQuOCwxNTguNHogTTE3NiwxMTUuMWMwLTEyLjcsMTAuMy0yMy4xLDIzLjEtMjMuMWMxMi43LDAsMjMuMSwxMC40LDIzLjEsMjMuMQ0KCQljMCwxMi43LTEwLjMsMjMuMS0yMy4xLDIzLjFDMTg2LjMsMTM4LjIsMTc2LDEyNy44LDE3NiwxMTUuMXogTTIyMi4xLDM4NC45YzAsMTIuNy0xMC4zLDIzLjEtMjMuMSwyMy4xDQoJCWMtMTIuNywwLTIzLjEtMTAuNC0yMy4xLTIzLjFjMC0xMi43LDEwLjMtMjMuMSwyMy4xLTIzLjFDMjExLjgsMzYxLjgsMjIyLjEsMzcyLjIsMjIyLjEsMzg0Ljl6IE0xOTkuMSwyODEuMw0KCQljLTE3LjcsMC0zMi4yLTE0LjQtMzIuMi0zMi4yYzAtMTcuNywxNC40LTMyLjIsMzIuMi0zMi4yYzE3LjcsMCwzMi4yLDE0LjQsMzIuMiwzMi4yQzIzMS4yLDI2Ni45LDIxNi44LDI4MS4zLDE5OS4xLDI4MS4zeg0KCQkgTTMxNC44LDM0MC4zYy0xMi43LDAtMjMuMS0xMC40LTIzLjEtMjMuMWMwLTEyLjcsMTAuMy0yMy4xLDIzLjEtMjMuMXMyMy4xLDEwLjQsMjMuMSwyMy4xQzMzNy45LDMzMCwzMjcuNSwzNDAuMywzMTQuOCwzNDAuM3oiLz4NCjwvZz4NCjwvc3ZnPg0K",
    "id": "kafka-sink",
    "kameletType": "sink",
    "kind": "Kamelet",
    "name": "kafka-sink",
    "parameters": [
      {
        "default": "",
        "description": "Comma separated list of Kafka topic names",
        "id": "Topic Names",
        "label": "Topic Names",
        "type": "string"
      },
      {
        "default": "",
        "description": "Comma separated list of Kafka Broker URLs",
        "id": "Brokers",
        "label": "Brokers",
        "type": "string",
        "value": "The Brokers"
      },
      {
        "default": "SASL_SSL",
        "description": "Protocol used to communicate with brokers. SASL_PLAINTEXT, PLAINTEXT, SASL_SSL and SSL are supported",
        "id": "Security Protocol",
        "label": "Security Protocol",
        "type": "string"
      },
      {
        "default": "PLAIN",
        "description": "The Simple Authentication and Security Layer (SASL) Mechanism used.",
        "id": "SASL Mechanism",
        "label": "SASL Mechanism",
        "type": "string"
      },
      {
        "default": "",
        "description": "Username to authenticate to Kafka",
        "id": "Username",
        "label": "Username",
        "type": "string",
        "value": "The Username"
      },
      {
        "default": "",
        "description": "Password to authenticate to kafka",
        "id": "Password",
        "label": "Password",
        "type": "string",
        "value": "The Password"
      }
    ],
    "subType": "KAMELET",
    "title": "Kafka Sink",
    "type": "CONNECTOR"
  }
];

const Template: ComponentStory<typeof VizReactFlow> = (args) => {
  return (
    <>
      <h1>React Flow</h1>
      <div style={{width: '50%', height: '500px'}}>
        <VizReactFlow steps={steps} />
      </div>
    </>
  )
};

export const Primary = Template.bind({});
//Primary.args = {};

