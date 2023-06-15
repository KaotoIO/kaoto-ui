import { RequestService } from './requestService';

describe('RequestService', () => {
  let fetchSpy: jest.SpyInstance;
  const url = 'http://localhost:8080';

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(async () => {
      return {
        ok: true,
        json: async () => {
          return { message: 'hello' };
        },
      } as Response;
    });

    RequestService.setApiURL(url);
  });

  afterEach(() => {
    RequestService.setApiURL('');
    jest.clearAllMocks();
  });

  it('should allow setting the API URL', () => {
    expect(RequestService.getApiURL()).toEqual(url);
  });

  it('should allow consumers to make a GET request', async () => {
    RequestService.get({ endpoint: '/capabilities' });

    expect(fetchSpy).toHaveBeenCalledWith(
      `${url}/capabilities`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('should allow consumers to make a POST request', async () => {
    RequestService.post({ endpoint: '/capabilities' });

    expect(fetchSpy).toHaveBeenCalledWith(
      `${url}/capabilities`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('should allow consumers to make a PATCH request', async () => {
    RequestService.patch({ endpoint: '/capabilities' });

    expect(fetchSpy).toHaveBeenCalledWith(
      `${url}/capabilities`,
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('should allow consumers to make a DELETE request', async () => {
    RequestService.delete({ endpoint: '/capabilities' });

    expect(fetchSpy).toHaveBeenCalledWith(
      `${url}/capabilities`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
