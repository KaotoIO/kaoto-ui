export default 'apiVersion: camel.apache.org/v1alpha1\n' +
'kind: KameletBinding\n' +
'metadata:\n' +
'  name: Updated integration\n' +
'spec:\n' +
'  sink:\n' +
'    properties:\n' +
'      null: The Password\n' +
'    ref:\n' +
'      apiVersion: camel.apache.org/v1alpha1\n' +
'      kind: Kamelet\n' +
'      name: kafka-sink\n' +
'  source:\n' +
'    properties:\n' +
'      null: your own\n' +
'    ref:\n' +
'      apiVersion: camel.apache.org/v1alpha1\n' +
'      kind: Kamelet\n' +
'      name: twitter-search-source\n' +
'  steps:\n' +
'    -\n' +
'      ref:\n' +
'        kind: Kamelet\n' +
'        apiVersion: camel.apache.org/v1alpha1\n' +
'        name: pdf-action\n' +
'    -\n' +
'      ref:\n' +
'        kind: Kamelet\n' +
'        apiVersion: camel.apache.org/v1alpha1\n' +
'        name: caffeine-action';
