import { Schema } from "./Schema";
import { ContentFieldContextObject } from "../models/ContentFieldContextObject";
import { ParentConnection } from "./ParentConnection";
import { CONTEXT, FIELD } from "../constants/Events";

export class Context {
  #isEditor: boolean;
  #fieldContext: any;

  constructor(
    private parentConnectionService: ParentConnection,
    private schemaService: Schema
  ) {}

  async setInitalContext() {
    if (!this.hasContext()) {
      const context = await this.parentConnectionService.request(
        CONTEXT.GET,
        null,
        {
          timeout: false,
        }
      );

      this.createContext(context);
    }
  }

  isEditor(): boolean {
    return this.#isEditor;
  }

  hasContext() {
    return Boolean(this.#fieldContext);
  }

  getContext() {
    return this.#fieldContext;
  }

  createContext(context: ContentFieldContextObject): ContentFieldContextObject {
    this.#isEditor = context.category === "CONTENT_EDITOR";

    const schema = this.schemaService.extractSchema(
      this.#isEditor ? (context as any).schema : context.fieldSchema
    );

    this.#fieldContext = {
      ...context,
      fieldSchema: schema,
      params: {
        ...context.params,
        instance: {
          ...context.params.instance,
          ...schema["ui:extension"]?.params,
        },
      },
      category: "CONTENT_FIELD",
    };

    return this.#fieldContext;
  }

  async getSchemaFromContext(payload: any) {
    if (this.isEditor()) {
      const context = this.getContext();

      return context.fieldSchema;
    } else {
      const result = await this.parentConnectionService.request(
        FIELD.SCHEMA_GET,
        payload
      );
      return this.schemaService.extractSchema(result);
    }
  }
}
