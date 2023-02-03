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
    return Boolean(this.contentItemModel);
  }

  get() {
    return { ...this.contentItemModel };
  }

  get contentItemModel() {
    return this.model;
  }

  set contentItemModel(model) {
    this.model = { ...model };
  }

  async fetch() {
    const model = await this.parentConnectionService.request(
      this.contextService.isEditor()
        ? CONTENT_EDITOR_FORM.CONTENT_EDITOR_FORM_GET
        : FIELD.MODEL_GET
    );

    this.contentItemModel = { ...model };

    return { ...this.contentItemModel };
  }

  async set(model: any) {
    this.contentItemModel = model;

    await this.parentConnectionService.request(
      this.contextService.isEditor()
        ? CONTENT_EDITOR_FORM.CONTENT_EDITOR_FORM_SET
        : FIELD.MODEL_SET,
      { ...this.contentItemModel }
    );
  }
}
