import { ERRORS_INIT } from "../constants/Errors";
import { defaultOptions } from "../constants/Connection";
import {
  ClientConnection,
  MC_EVENTS,
  RequestOptions,
} from "message-event-channel";

export class ParentConnection {
  context: any;

  constructor(private parentConnection: ClientConnection) {}

  async connect() {
    if (this.parentConnection) {
      return;
    }

    return this.connectWithoutParentConnection();
  }

  connectWithoutParentConnection() {
    const parentConnection = new ClientConnection(defaultOptions);

    return new Promise<void>((resolve, reject) => {
      parentConnection.init();
      parentConnection.on(MC_EVENTS.CONNECTED, async () => {
        this.parentConnection = parentConnection;

        resolve();
      });

      parentConnection.on(MC_EVENTS.CONNECTION_TIMEOUT, () => {
        reject(new Error(ERRORS_INIT.CONNECTION_TIMEOUT));
      });
    });
  }

  request<ResolveValue = any>(
    event: string,
    payload?: any,
    options?: RequestOptions
  ) {
    return this.parentConnection.request<ResolveValue>(event, payload, options);
  }
}
