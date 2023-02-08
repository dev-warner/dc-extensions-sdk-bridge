import * as jsonpath from "jsonpath";

export class Schema {
  constructor(private fieldPath: string) {}

  extractSchema(schema: any) {
    // Get the child schema out of the given schema by following the JSON path.
    const path = jsonpath.parse(this.fieldPath);

    let root = schema;

    for (let item of path) {
      if (item.expression) {
        switch (item.expression.type) {
          case "root":
            schema = root;
            break;
          case "identifier":
          case "numeric_literal":
            if (schema.type === "object") {
              schema = schema.properties[item.expression.value];
            } else if (schema.type === "array") {
              schema = schema.items;
            }
            break;
        }
      }
    }

    return schema;
  }
}
