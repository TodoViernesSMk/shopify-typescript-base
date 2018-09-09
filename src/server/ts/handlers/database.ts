import { LogSchema } from "../../../shared/ts/shcema";
import { Handler } from "./";

export const FindLogRoute: Handler<DatabaseFindLogRequest, DatabaseFindLogResponse> = async (context) => {

  const items: LogSchema[] = [
    { id: "0", type: "warning", source: "server", message: "Foo bad", data: {}, ts: new Date('2018-08-11').getTime() },
    { id: "1", type: "info", source: "server", message: "Foo ok", data: {}, ts: new Date('2018-08-11').getTime() },
    { id: "2", type: "success", source: "server", message: "Foo good", data: {}, ts: new Date('2018-08-08').getTime() },
    { id: "3", type: "info", source: "server", message: "Foo ok", data: {}, ts: new Date('2018-08-11').getTime() },
  ]

  return {
    ...context,
    code: 200,
    response: {
      items: items
    },
  };
}

export interface DatabaseFindLogRequest extends Handler.Request {
  foo: string;
}
export interface DatabaseFindLogResponse extends Handler.Response {
  items: LogSchema[];
}
