// @ts-ignore
import capabilitiesGet from './http/capabilities.get.json';
import { rest } from 'msw';

export const handlers = [
  rest.get('http://localhost:8081/v1/capabilities', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(capabilitiesGet));
  }),

  rest.get('http://localhost:8081/v1/capabilities/namespace', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        namespace: 'default',
      })
    );
  }),
];
