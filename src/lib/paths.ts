import path from "node:path";

export const rootDirectory = process.cwd();
export const buttonsDirectory = path.join(rootDirectory, "public", "88x31");
export const siteDataFile = path.join(rootDirectory, "data", "site.json");
export const pfpsDirectory = path.join(rootDirectory, "public", "pfps");
export const visitorsFile = path.join(rootDirectory, "visitors.json");
