import { Context } from "./Context";
import { CONTENT_EDITOR_FORM, FIELD } from "../constants/Events";
import { ParentConnection } from "./ParentConnection";

export class Validation {
  constructor(
    private parentConnectionService: ParentConnection,
    private contextService: Context
  ) {}

  async isValid(payload: any) {
    return await this.parentConnectionService.request(
      this.contextService.isEditor()
        ? CONTENT_EDITOR_FORM.CONTENT_EDITOR_FORM_IS_VALID
        : FIELD.MODEL_IS_VALID,
      payload
    );
  }

  async validate(payload: any) {}
}
