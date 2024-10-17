import Store from "jfs";

const path = "./core/storage/data";
const prettyDB = new Store(path, { pretty: true });

const read = (key: string | number) => {
  if (typeof key == "number") key = key.toString();
  try {
    const data = prettyDB.getSync(key);
    const cloned = JSON.parse(JSON.stringify(data));
    if (Object.keys(cloned).length > 0 || Array.isArray(cloned)) {
      return cloned;
    } else {
      return null;
    }
  } catch (error) {
    console.log("read file error:", error);
    return null;
  }
};

const write = (key: string | number, data: any) => {
  if (typeof key == "number") key = key.toString();

  try {
    prettyDB.saveSync(key, data);
    return true;
  } catch (error) {
    return false;
  }
};
export { read, write };
