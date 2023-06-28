import { capabilitiesStub, rawCapabilitiesStub } from '../stubs';
import stepsDefault from '../stubs/steps/steps.default';
import {
  fetchBackendVersion,
  fetchCapabilities,
  fetchCatalogSteps,
  fetchCompatibleDSLs,
  fetchDefaultNamespace,
  fetchDeployment,
  fetchDeployments,
} from './apiService';
import { RequestService } from './requestService';
import { IDsl } from '@kaoto/types';

describe('apiService', () => {
  describe('fetchBackendVersion', () => {
    it('should return the backend version', async () => {
      jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
        text: async () => '1.0.0',
      } as unknown as Response);

      const version = await fetchBackendVersion();
      expect(version).toEqual('1.0.0');
    });

    it('should bubble up exceptions', async () => {
      expect.assertions(1);
      jest.spyOn(RequestService, 'get').mockRejectedValueOnce('Wrong URL');

      await expect(fetchBackendVersion()).rejects.toThrowError(
        'Unable to fetch Backend version Wrong URL',
      );
    });
  });

  describe('fetchCapabilities', () => {
    it('should return a list of capabilities', async () => {
      jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
        json: async () => ({ dsls: rawCapabilitiesStub }),
      } as unknown as Response);

      const capabilities = await fetchCapabilities();
      expect(capabilities).toEqual(expect.any(Array));
      expect(capabilities.length).toBe(4);
    });

    it('should use the default namespace if not specified', async () => {
      const getSpy = jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
        json: async () => ({ dsls: rawCapabilitiesStub }),
      } as unknown as Response);

      const capabilities = await fetchCapabilities();
      expect(capabilities).toEqual(expect.any(Array));
      expect(getSpy).toHaveBeenCalledWith({
        endpoint: '/v1/capabilities',
        contentType: 'application/json',
        queryParams: {
          namespace: 'default',
        },
      });
    });

    it('should use the provided namespace', async () => {
      const getSpy = jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
        json: async () => ({ dsls: rawCapabilitiesStub }),
      } as unknown as Response);

      const capabilities = await fetchCapabilities('hidden-namespace');
      expect(capabilities).toEqual(expect.any(Array));
      expect(getSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: {
            namespace: 'hidden-namespace',
          },
        }),
      );
    });

    it('should map the raw list of capabilities to IDsl', async () => {
      jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
        json: async () => ({ dsls: rawCapabilitiesStub }),
      } as unknown as Response);

      const capabilities = await fetchCapabilities();

      expect.assertions(capabilities.length);

      capabilities.forEach((capability) => {
        expect(capability).toBeInstanceOf(IDsl);
      });
    });

    it('should bubble up exceptions', async () => {
      expect.assertions(1);
      jest.spyOn(RequestService, 'get').mockRejectedValueOnce('Wrong URL');

      await expect(fetchCapabilities()).rejects.toThrowError(
        'Unable to fetch Capabilities Wrong URL',
      );
    });

    it.each([undefined, { dsls: undefined }, { dsls: [] }])(
      'should throw an exception if the payload is not correct (%s)',
      async (errorValue) => {
        expect.assertions(1);
        jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
          json: async () => errorValue,
        } as unknown as Response);

        await expect(fetchCapabilities()).rejects.toThrowError(
          'Unable to fetch Capabilities Error: Invalid response from capabilities endpoint',
        );
      },
    );
  });

  describe('fetchDefaultNamespace', () => {
    it('should return the default namespace', async () => {
      jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
        json: async () => ({ namespace: 'default' }),
      } as unknown as Response);

      const payload = await fetchDefaultNamespace();
      expect(payload).toEqual({ namespace: 'default' });
    });

    it('should not throw but return the error message', async () => {
      expect.assertions(1);
      jest.spyOn(RequestService, 'get').mockRejectedValueOnce('Wrong URL');

      await expect(fetchDefaultNamespace()).resolves.toEqual('Wrong URL');
    });
  });

  describe('fetchCatalogSteps', () => {
    it('should return the catalog steps', async () => {
      jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
        json: async () => capabilitiesStub,
      } as unknown as Response);

      const payload = await fetchCatalogSteps();
      expect(payload).toEqual(expect.any(Array));
    });

    it('should delete previousStep and followingStep query parameters if they contains a falsy value', async () => {
      const getSpy = jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
        json: async () => stepsDefault,
      } as unknown as Response);

      await fetchCatalogSteps({ previousStep: '', followingStep: '' });
      expect(getSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          cache: undefined,
          endpoint: '/v1/steps',
        }),
      );
    });

    it('should use the default namespace if not specified', async () => {
      const getSpy = jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
        json: async () => stepsDefault,
      } as unknown as Response);

      await fetchCatalogSteps();
      expect(getSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          cache: undefined,
          endpoint: '/v1/steps',
          queryParams: {
            namespace: 'default',
          },
        }),
      );
    });

    it('should use the provided namespace', async () => {
      const getSpy = jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
        json: async () => stepsDefault,
      } as unknown as Response);

      await fetchCatalogSteps({ namespace: 'hidden-namespace' });
      expect(getSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          cache: undefined,
          endpoint: '/v1/steps',
          queryParams: {
            namespace: 'hidden-namespace',
          },
        }),
      );
    });

    it('should not throw but return the error message', async () => {
      expect.assertions(1);
      jest.spyOn(RequestService, 'get').mockRejectedValueOnce('Wrong URL');

      await expect(fetchCatalogSteps()).resolves.toEqual('Wrong URL');
    });
  });

  describe('fetchCompatibleDSLs', () => {
    it('should use the default namespace if not specified', async () => {
      const postSpy = jest.spyOn(RequestService, 'post').mockResolvedValueOnce({
        json: async () => capabilitiesStub,
      } as unknown as Response);

      await fetchCompatibleDSLs({ steps: [] });
      expect(postSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/v1/integrations/dsls',
          contentType: 'application/json',
          body: [],
          queryParams: {
            namespace: 'default',
          },
        }),
      );
    });

    it('should use the provided namespace', async () => {
      const postSpy = jest.spyOn(RequestService, 'post').mockResolvedValueOnce({
        json: async () => capabilitiesStub,
      } as unknown as Response);

      await fetchCompatibleDSLs({ namespace: 'hidden-namespace', steps: [] });
      expect(postSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/v1/integrations/dsls',
          contentType: 'application/json',
          body: [],
          queryParams: {
            namespace: 'hidden-namespace',
          },
        }),
      );
    });

    it('should not throw but return the error message', async () => {
      expect.assertions(1);
      jest.spyOn(RequestService, 'post').mockRejectedValueOnce('Wrong URL');

      await expect(fetchCompatibleDSLs({ steps: [] })).resolves.toEqual('Wrong URL');
    });
  });

  describe('fetchDeployment', () => {
    it('should use the default namespace if not specified', async () => {
      const getSpy = jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
        text: async () => 'default deployment',
      } as unknown as Response);

      await fetchDeployment('myDeployment');
      expect(getSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/v1/deployment/myDeployment',
          contentType: 'application/json',
          queryParams: {
            namespace: 'default',
          },
        }),
      );
    });

    it('should use the provided namespace', async () => {
      const getSpy = jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
        text: async () => 'default deployment',
      } as unknown as Response);

      await fetchDeployment('myDeployment', 'hidden-namespace');
      expect(getSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/v1/deployment/myDeployment',
          contentType: 'application/json',
          queryParams: {
            namespace: 'hidden-namespace',
          },
        }),
      );
    });

    it('should not throw but return the error message', async () => {
      expect.assertions(1);
      jest.spyOn(RequestService, 'get').mockRejectedValueOnce('Wrong URL');

      await expect(fetchDeployment('myDeployment')).resolves.toEqual('Wrong URL');
    });
  });

  describe('fetchDeploymentss', () => {
    it('should use the default namespace if not specified', async () => {
      const getSpy = jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
        json: async () => 'default deployment',
      } as unknown as Response);

      await fetchDeployments();
      expect(getSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/v1/deployments',
          contentType: 'application/json',
          cache: undefined,
          queryParams: {
            namespace: 'default',
          },
        }),
      );
    });

    it('should use the provided namespace', async () => {
      const getSpy = jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
        json: async () => 'default deployment',
      } as unknown as Response);

      await fetchDeployments(undefined, 'hidden-namespace');
      expect(getSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/v1/deployments',
          contentType: 'application/json',
          cache: undefined,
          queryParams: {
            namespace: 'hidden-namespace',
          },
        }),
      );
    });

    it('should use the provided cache mechanism', async () => {
      const getSpy = jest.spyOn(RequestService, 'get').mockResolvedValueOnce({
        json: async () => 'default deployment',
      } as unknown as Response);

      await fetchDeployments('force-cache', 'hidden-namespace');
      expect(getSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/v1/deployments',
          contentType: 'application/json',
          cache: 'force-cache',
          queryParams: {
            namespace: 'hidden-namespace',
          },
        }),
      );
    });

    it('should not throw but return the error message', async () => {
      expect.assertions(1);
      jest.spyOn(RequestService, 'get').mockRejectedValueOnce('Wrong URL');

      await expect(fetchDeployments()).resolves.toEqual('Wrong URL');
    });
  });
});
