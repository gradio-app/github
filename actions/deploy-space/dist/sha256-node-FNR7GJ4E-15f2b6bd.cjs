"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const Stream = require("stream");
const crypto = require("crypto");
async function sha256Node(buffer) {
  const sha256Stream = crypto.createHash("sha256");
  const transform256 = (buffer instanceof Blob ? Stream.Readable.fromWeb(buffer.stream()) : Stream.Readable.from(Buffer.from(buffer))).pipe(sha256Stream).setEncoding("hex");
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
exports.sha256Node = sha256Node;
