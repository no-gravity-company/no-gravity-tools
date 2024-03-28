export interface CreateFileData {
  basePath: string;
  fileName?: string;
  component: ComponentData;
  templateGenerator?:
    | ((name: string, type: string) => string)
    | ((name: string) => string)
    | (() => string);
}

interface ComponentData {
  name: string;
  type: string;
}
