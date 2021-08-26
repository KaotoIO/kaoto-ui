export default 'apiVersion: camel.apache.org/v1alpha1\n' +
'kind: KameletBinding\n' +
'metadata:\n' +
'  name: twitter-search-source-binding\n' +
'spec:\n' +
'  source:\n' +
'    ref:\n' +
'      kind: Kamelet\n' +
'      apiVersion: camel.apache.org/v1alpha1\n' +
'      name: twitter-search-source\n' +
'    properties:\n' +
'      keywords: "Apache Camel"\n' +
'      apiKey: "your own"\n' +
'      apiKeySecret: "your own"\n' +
'      accessToken: "your own"\n' +
'      accessTokenSecret: "your own"\n' +
'  sink:\n' +
'    ref:\n' +
'      kind: Kamelet\n' +
'      apiVersion: camel.apache.org/v1alpha1\n' +
'      name: kafka-sink\n' +
'    properties:\n' +
'      brokers: "The Brokers"\n' +
'      password: "The Password"\n' +
'      topic: "The Topic Names"\n' +
'      username: "The Username"\n';
