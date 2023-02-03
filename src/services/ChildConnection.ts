import { ServerConnection } from "message-event-channel";
import { defaultOptions } from "../constants/Connection";
import { ParentConnection } from "./ParentConnection";

type EventResolve = (result?: any) => any;
type EventReject = (result: any) => any;

type On = {
  on: (event: string, cb: (payload: any) => Promise<any>) => On;
};

export class ChildConnection {
  private childConnection: ServerConnection;

  constructor(private parentConnectionService: ParentConnection) {}

  connect(frame: HTMLIFrameElement, options = {}) {
    this.childConnection = new ServerConnection(frame, {
      ...defaultOptions,
      ...options,
    });

    return this.childConnection;
  }

  on<Payload = any>(event: string, cb: (payload: Payload) => Promise<any>): On {
    this.childConnection.on(
      event,
      async (payload: Payload, resolve: EventResolve, reject: EventReject) => {
        try {
          const resolveValue = await cb(payload);

          if (resolve) {
            resolve(resolveValue);
          }
        } catch (err) {
          reject(err);
        }
      }
    );

    return this;
  }

  forwardEvents(events: Array<string>) {
    for (let event of events) {
      this.on(event, async (payload: any) => {
        const result = await this.parentConnectionService.request(
          event,
          payload
        );
        return result;
      });
    }
  }
}
