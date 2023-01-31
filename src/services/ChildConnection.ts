import { ServerConnection } from "message-event-channel";
import { defaultOptions } from "../constants/Connection";
import { ParentConnection } from "./ParentConnection";

type EventResolve = (result?: any) => any;
type EventReject = (result: any) => any;

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

  on(
    event: string,
    callback: (payload: any) => Promise<any>
  ): ServerConnection {
    return this.childConnection.on(
      event,
      async (payload: any, resolve: EventResolve, reject: EventReject) => {
        try {
          const resolveValue = await callback(payload);

          resolve(resolveValue);
        } catch (e) {
          reject(e);
        }
      }
    );
  }

  forwardEvents(events: Array<string>) {
    for (let event of events) {
      this.on(event, (payload: any) =>
        this.parentConnectionService.request(event, payload)
      );
    }
  }
}
