import { ServerConnection } from "message-event-channel";
import { defaultOptions } from "../constants/Connection";
import { ParentConnection } from "./ParentConnection";

type EventResolve = (result?: any) => any;
type EventReject = (result: any) => any;

type MessageRequest = (
  payload: any,
  resolve: EventResolve,
  reject?: EventReject
) => Promise<any>;

type On = {
  on: (event: string, cb: MessageRequest) => On;
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

  on(event: string, cb: MessageRequest): On {
    this.childConnection.on(event, cb);

    return this;
  }

  forwardEvents(events: Array<string>) {
    for (let event of events) {
      this.on(event, async (payload: any, resolve, reject) => {
        try {
          const result = await this.parentConnectionService.request(
            event,
            payload
          );
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }
  }
}
