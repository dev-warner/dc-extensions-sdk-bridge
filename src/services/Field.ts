import * as jsonpath from "jsonpath";
import { Model } from "./Model";

export class Field {
  private initialValue: any;

  constructor(
    private modelService: Model,
    private fieldPath: string,
    private field: any
  ) {}

  async setInitialValue() {
    let model;

    try {
      model = await this.modelService.fetch();
    } catch (err) {}

    if (!this.has()) {
      const fieldValue = this.get(model);

      this.field = fieldValue;
      this.initialValue = fieldValue;
    } else {
      this.initialValue = this.field;
    }
  }

  currentField() {
    return this.field;
  }

  has() {
    return Boolean(this.field);
  }

  async set(field: any) {
    this.field = field;

    let updatedModel = { ...this.modelService.get() };

    jsonpath.value(updatedModel, this.fieldPath, field);

    await this.modelService.set(updatedModel);

    return field;
  }

  get(model: any) {
    return jsonpath.query(model, this.fieldPath)[0];
  }

  async reset() {
    await this.set(this.initialValue);
  }
}
