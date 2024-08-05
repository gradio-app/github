import { Readable } from "stream";
import { createHash } from "crypto";
async function sha256Node(buffer) {
  const sha256Stream = createHash("sha256");
  const transform256 = (buffer instanceof Blob ? Readable.fromWeb(buffer.stream()) : Readable.from(Buffer.from(buffer))).pipe(sha256Stream).setEncoding("hex");
  return promisifyRs(transform256);
}
var promisifyRs = (rs) => {
  return new Promise((resolve, reject) => {
    let out = "";
    rs.on("data", (chunk) => {
      out += chunk;
    });
    rs.on("error", (err) => {
      reject(err);
    });
    rs.on("end", () => {
      resolve(out);
    });
  });
};
export {
  sha256Node
};
