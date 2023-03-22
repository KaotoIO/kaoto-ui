import { debeziumMongoDBStep } from '../stubs';
import { sortParameters } from './sort-parameters';

describe('sortParameters', () => {
  it('should move all the required parameters to the top and sort them alphabetically', () => {
    const step = sortParameters(debeziumMongoDBStep);
    const idList = step.parameters
      ?.map((parameter) => parameter.id)
      .slice(0, step.required?.length);

    expect(idList).toMatchObject(['mongodbName', 'mongodbPassword', 'name']);
  });

  it('should alphabetically sort the rest of parameters', () => {
    const step = sortParameters(debeziumMongoDBStep);
    const idList = step.parameters
    ?.map((parameter) => parameter.id)
    .slice(step.required?.length);

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
