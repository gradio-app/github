export const id = 491;
export const ids = [491];
export const modules = {

/***/ 6491:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "sha256Node": () => (/* binding */ sha256Node)
/* harmony export */ });
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2781);
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6113);
// src/utils/sha256-node.ts


async function sha256Node(buffer) {
  const sha256Stream = (0,crypto__WEBPACK_IMPORTED_MODULE_1__.createHash)("sha256");
  const transform256 = (buffer instanceof Blob ? stream__WEBPACK_IMPORTED_MODULE_0__.Readable.fromWeb(buffer.stream()) : stream__WEBPACK_IMPORTED_MODULE_0__.Readable.from(Buffer.from(buffer))).pipe(sha256Stream).setEncoding("hex");
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



/***/ })

};
