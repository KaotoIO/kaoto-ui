/*
 * Copyright 2022 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The API for a typical Step Extension
 * The following are methods that are exposed to a step extension.
 */
export interface IStepExtensionApi {
  fetchCatalogSteps: () => void;
  fetchDeployments: () => void;
  fetchDsls: () => void;
  fetchIntegrations: ({ format }: { format?: string }) => void;
  notifyKaoto: (title: string, body?: string, variant?: string) => void;
  startDeployment: () => void;
  stopDeployment: () => void;
}
