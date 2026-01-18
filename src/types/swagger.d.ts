declare module 'swagger-jsdoc' {
  import { OpenAPIV3 } from 'openapi-types';
  
  interface Options {
    definition: OpenAPIV3.Document;
    apis: string[];
  }
  
  function swaggerJsdoc(options: Options): OpenAPIV3.Document;
  
  export = swaggerJsdoc;
}

declare module 'swagger-ui-express' {
  import { RequestHandler } from 'express';
  
  export const serve: RequestHandler[];
  export function setup(
    swaggerDoc: any,
    options?: any
  ): RequestHandler;
}
