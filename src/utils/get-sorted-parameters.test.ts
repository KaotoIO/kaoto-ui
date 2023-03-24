import { debeziumMongoDBStep } from '../stubs';
import { getSortedParameters } from './get-sorted-parameters';

describe('sortParameters', () => {
  it('should move all the required parameters to the top and sort them alphabetically', () => {
    const sortedParameters = getSortedParameters(debeziumMongoDBStep);
    const idList = sortedParameters.slice(0, debeziumMongoDBStep.required?.length);

    expect(idList).toMatchObject(['mongodbName', 'mongodbPassword', 'name']);
  });

  it('should alphabetically sort the rest of parameters', () => {
    const sortedParameters = getSortedParameters(debeziumMongoDBStep);
    const idList = sortedParameters.slice(debeziumMongoDBStep.required?.length);

    expect(idList).toMatchObject([
      'additionalProperties',
      'bridgeErrorHandler',
      'captureMode',
      'collectionExcludeList',
      'collectionIncludeList',
      'connectBackoffInitialDelayMs',
      'connectBackoffMaxDelayMs',
      'connectMaxAttempts',
      'converters',
      'cursorMaxAwaitTimeMs',
      'databaseExcludeList',
      'databaseHistoryFileFilename',
      'databaseIncludeList',
      'eventProcessingFailureHandlingMode',
      'exceptionHandler',
      'exchangePattern',
      'fieldExcludeList',
      'fieldRenames',
      'heartbeatIntervalMs',
      'heartbeatTopicsPrefix',
      'internalKeyConverter',
      'internalValueConverter',
      'maxBatchSize',
      'maxQueueSize',
      'maxQueueSizeInBytes',
      'mongodbAuthsource',
      'mongodbConnectTimeoutMs',
      'mongodbHosts',
      'mongodbMembersAutoDiscover',
      'mongodbPollIntervalMs',
      'mongodbServerSelectionTimeoutMs',
      'mongodbSocketTimeoutMs',
      'mongodbSslEnabled',
      'mongodbSslInvalidHostnameAllowed',
      'mongodbUser',
      'offsetCommitPolicy',
      'offsetCommitTimeoutMs',
      'offsetFlushIntervalMs',
      'offsetStorage',
      'offsetStorageFileName',
      'offsetStoragePartitions',
      'offsetStorageReplicationFactor',
      'offsetStorageTopic',
      'pollIntervalMs',
      'provideTransactionMetadata',
      'queryFetchSize',
      'retriableRestartConnectorWaitMs',
      'sanitizeFieldNames',
      'schemaNameAdjustmentMode',
      'signalDataCollection',
      'skippedOperations',
      'snapshotCollectionFilterOverrides',
      'snapshotDelayMs',
      'snapshotFetchSize',
      'snapshotIncludeCollectionList',
      'snapshotMaxThreads',
      'snapshotMode',
      'sourceStructVersion',
      'step-id-kaoto',
      'tombstonesOnDelete',
      'transactionTopic',
    ]);
  });
});
