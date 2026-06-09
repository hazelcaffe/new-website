import path from "node:path";

export const rootDirectory = process.cwd();
export const buttonsDirectory = path.join(rootDirectory, "88x31");
export const visitorsFile = path.join(rootDirectory, "visitors.json");
