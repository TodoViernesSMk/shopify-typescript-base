export class Resource<RequestType = any, ResponseType = any> {
  private request: Request;

  constructor(
    public options: Resource.Options,
  ) {
    const requestInit = Object.assign({
      method: "POST",
      mode: "cors",
      cache: "default",
    }, this.options);

    this.request = new Request(this.options.path, requestInit);
  }

  public handler(payload?: RequestType, options?: Resource.Options): Promise<Resource.HttpResponse> {
    const requestInit = Object.assign({}, { body: JSON.stringify(payload) }, options);
    if(payload) {
      requestInit.headers = {
        ...requestInit.headers,
        "Content-Type": "application/json"
      }
    }
    return fetch(this.request, requestInit)
      .then(async response => {
        try {
          if(response.ok) {
            return { response: response, data: await response.json() }
          } else {
            throw { response: response, data: await response.json() }
          }
        } catch(error) {
          console.error(error)
          if(response.ok) {
            return { response: response, error: error, data: undefined }
          } else {
            throw { response: response, error: error, data: undefined }
          }
        }
      });
  }
}

export namespace Resource {
  export type Method = "GET"|"POST";
  export type Path = string;
  export interface Options extends RequestInit {
    method?: Resource.Method,
    path: Resource.Path,
  }
  export interface HttpResponse {
    response: Response;
    data: any;
  }
}

export const resource = {
  database: {
    find: {
      log: new Resource<{between: Date[]}>({
        path: "/api/database/find/log"
      })
    }
  },
  shopify: new Resource<{}>({
    path: "/api/shopify"
  })
}


resource.shopify.handler()
  .then(response => {
    console.log(response)
  })