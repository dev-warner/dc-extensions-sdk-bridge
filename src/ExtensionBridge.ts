import { ClientConnection } from "message-event-channel";

import {
  FORM,
  FIELD,
  FRAME,
  CONTEXT,
  MEDIA_LINK,
  CONTENT_LINK,
  CONTENT_ITEM,
  CONTENT_REFERENCE,
  HTTP_CLIENT,
} from "./constants/Events";

import { Model } from "./services/Model";
import { Field } from "./services/Field";
import { Frame } from "./services/Frame";
import { Schema } from "./services/Schema";
import { Context } from "./services/Context";
import { Validation } from "./services/Validation";
import { ChildConnection } from "./services/ChildConnection";
import { ParentConnection } from "./services/ParentConnection";

export interface BridgeOptions {
  /** Parent connection, presumably owned by a parent dc-extensions-sdk. */
  parentConnection?: ClientConnection;

  /** Initial field value provided by the parent. If not present, fetches the field from the parent instead. */
  field?: any;
}

export class ExtensionBridge {
  private modelService: Model;
  private fieldService: Field;
  private frameService: Frame;
  private schemaService: Schema;
  private contextService: Context;
  private validationService: Validation;
  private childConnectionService: ChildConnection;
  private parentConnectionService: ParentConnection;

  constructor(fieldPath: string, options: BridgeOptions = {}) {
    this.parentConnectionService = new ParentConnection(
      options.parentConnection
    );

    this.childConnectionService = new ChildConnection(
      this.parentConnectionService
    );

    this.schemaService = new Schema(fieldPath);

    this.contextService = new Context(
      this.parentConnectionService,
      this.schemaService
    );

    this.modelService = new Model(
      this.parentConnectionService,
      this.contextService
    );

    this.fieldService = new Field(this.modelService, fieldPath, options.field);

    this.validationService = new Validation(
      this.parentConnectionService,
      this.contextService
    );
  }

  async init(frame: HTMLIFrameElement, options = {}) {
    this.frameService = new Frame(frame);

    await this.parentConnectionService.connect();
    await this.contextService.setInitalContext();
    await this.fieldService.setInitialValue();
    await this.childConnectionService.connect(
      this.frameService.getFrame(),
      options
    );

    this.childConnectionService.forwardEvents([
      CONTENT_ITEM.GET,
      FORM.READ_ONLY,
      FORM.GET_FORM_MODEL,
      MEDIA_LINK.IMAGE_GET,
      MEDIA_LINK.VIDEO_GET,
      CONTENT_LINK.CONTENT_GET,
      CONTENT_REFERENCE.CONTENT_REF_GET,
      HTTP_CLIENT.REQUEST,
    ]);

    this.childConnectionService
      .on(CONTEXT.GET, () => this.contextService.getContext())
      .on(FIELD.MODEL_GET, () => this.fieldService.currentField())
      .on(FIELD.MODEL_RESET, () => this.fieldService.reset())
      .on(FIELD.MODEL_SET, (payload: any) => this.fieldService.set(payload))
      .on(FIELD.MODEL_IS_VALID, (payload: any) =>
        this.validationService.isValid(payload)
      )
      .on(FIELD.MODEL_VALIDATE, (payload: any) =>
        this.validationService.validate(payload)
      )
      .on(FIELD.SCHEMA_GET, (payload: any) =>
        this.contextService.getSchemaFromContext(payload)
      )
      .on(FRAME.HEIGHT_GET, () => this.frameService.getHeight())
      .on(FRAME.HEIGHT_SET, (height: number) =>
        this.frameService.setHeight(height)
      );
  }
}
