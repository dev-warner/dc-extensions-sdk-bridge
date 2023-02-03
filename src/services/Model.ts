import { Context } from "./Context";
import { CONTENT_EDITOR_FORM, FIELD } from "../constants/Events";
import { ParentConnection } from "./ParentConnection";

export class Model {
  model: any;

  constructor(
    private parentConnectionService: ParentConnection,
    private contextService: Context
  ) {}

  has() {
    return Boolean(this.model);
  }

  get() {
    return { ...(this.model || {}) };
  }

  async fetch() {
    const model = await this.parentConnectionService.request(
      this.contextService.isEditor()
        ? CONTENT_EDITOR_FORM.CONTENT_EDITOR_FORM_GET
        : FIELD.MODEL_GET
    );

    this.model = model;

    return this.get();
  }

  async set(model: any) {
    this.model = model;

    await this.parentConnectionService.request(
      this.contextService.isEditor()
        ? CONTENT_EDITOR_FORM.CONTENT_EDITOR_FORM_SET
        : FIELD.MODEL_SET,
      this.get()
    );
  }
}
