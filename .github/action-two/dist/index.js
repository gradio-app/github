import { createRequire as __WEBPACK_EXTERNAL_createRequire } from "module";
/******/ var __webpack_modules__ = ({

/***/ 113:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("crypto");

/***/ }),

/***/ 781:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("stream");

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __nccwpck_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	var threw = true;
/******/ 	try {
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 		threw = false;
/******/ 	} finally {
/******/ 		if(threw) delete __webpack_module_cache__[moduleId];
/******/ 	}
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/******/ // expose the modules object (__webpack_modules__)
/******/ __nccwpck_require__.m = __webpack_modules__;
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/create fake namespace object */
/******/ (() => {
/******/ 	var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 	var leafPrototypes;
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 16: return value when it's Promise-like
/******/ 	// mode & 8|1: behave like require
/******/ 	__nccwpck_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = this(value);
/******/ 		if(mode & 8) return value;
/******/ 		if(typeof value === 'object' && value) {
/******/ 			if((mode & 4) && value.__esModule) return value;
/******/ 			if((mode & 16) && typeof value.then === 'function') return value;
/******/ 		}
/******/ 		var ns = Object.create(null);
/******/ 		__nccwpck_require__.r(ns);
/******/ 		var def = {};
/******/ 		leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 		for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 			Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 		}
/******/ 		def['default'] = () => (value);
/******/ 		__nccwpck_require__.d(ns, def);
/******/ 		return ns;
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__nccwpck_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/ensure chunk */
/******/ (() => {
/******/ 	__nccwpck_require__.f = {};
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__nccwpck_require__.e = (chunkId) => {
/******/ 		return Promise.all(Object.keys(__nccwpck_require__.f).reduce((promises, key) => {
/******/ 			__nccwpck_require__.f[key](chunkId, promises);
/******/ 			return promises;
/******/ 		}, []));
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/get javascript chunk filename */
/******/ (() => {
/******/ 	// This function allow to reference async chunks
/******/ 	__nccwpck_require__.u = (chunkId) => {
/******/ 		// return url for filenames based on template
/******/ 		return "" + chunkId + ".index.js";
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__nccwpck_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/******/ /* webpack/runtime/import chunk loading */
/******/ (() => {
/******/ 	// no baseURI
/******/ 	
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		179: 0
/******/ 	};
/******/ 	
/******/ 	var installChunk = (data) => {
/******/ 		var {ids, modules, runtime} = data;
/******/ 		// add "modules" to the modules object,
/******/ 		// then flag all "ids" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0;
/******/ 		for(moduleId in modules) {
/******/ 			if(__nccwpck_require__.o(modules, moduleId)) {
/******/ 				__nccwpck_require__.m[moduleId] = modules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(runtime) runtime(__nccwpck_require__);
/******/ 		for(;i < ids.length; i++) {
/******/ 			chunkId = ids[i];
/******/ 			if(__nccwpck_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				installedChunks[chunkId][0]();
/******/ 			}
/******/ 			installedChunks[ids[i]] = 0;
/******/ 		}
/******/ 	
/******/ 	}
/******/ 	
/******/ 	__nccwpck_require__.f.j = (chunkId, promises) => {
/******/ 			// import() chunk loading for javascript
/******/ 			var installedChunkData = __nccwpck_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 			if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 	
/******/ 				// a Promise means "currently loading".
/******/ 				if(installedChunkData) {
/******/ 					promises.push(installedChunkData[1]);
/******/ 				} else {
/******/ 					if(true) { // all chunks have JS
/******/ 						// setup Promise in chunk cache
/******/ 						var promise = import("./" + __nccwpck_require__.u(chunkId)).then(installChunk, (e) => {
/******/ 							if(installedChunks[chunkId] !== 0) installedChunks[chunkId] = undefined;
/******/ 							throw e;
/******/ 						});
/******/ 						var promise = Promise.race([promise, new Promise((resolve) => (installedChunkData = installedChunks[chunkId] = [resolve]))])
/******/ 						promises.push(installedChunkData[1] = promise);
/******/ 					} else installedChunks[chunkId] = 0;
/******/ 				}
/******/ 			}
/******/ 	};
/******/ 	
/******/ 	// no external install chunk
/******/ 	
/******/ 	// no on chunks loaded
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {

;// CONCATENATED MODULE: ../../node_modules/.pnpm/@huggingface+hub@0.1.3/node_modules/@huggingface/hub/dist/index.mjs
// src/consts.ts
var HUB_URL = process.env.NODE_ENV === "test" ? "https://hub-ci.huggingface.co" : "https://huggingface.co";

// src/error.ts
async function createApiError(response, opts) {
  const error = new ApiError(response.url, response.status, response.headers.get("X-Request-Id") ?? opts?.requestId);
  error.message = `Api error with status ${error.statusCode}.${opts?.message ? ` ${opts.message}.` : ""} Request ID: ${error.requestId}, url: ${error.url}`;
  if (response.headers.get("Content-Type")?.startsWith("application/json")) {
    const json = await response.json();
    error.message = json.error || json.message || error.message;
    error.data = json;
  } else {
    error.data = { message: await response.text() };
  }
  throw error;
}
var ApiError = class extends Error {
  statusCode;
  url;
  requestId;
  data;
  constructor(url, statusCode, requestId, message) {
    super(message);
    this.statusCode = statusCode;
    this.requestId = requestId;
    this.url = url;
  }
};

// src/utils/range.ts
function range(n, b) {
  return b ? Array(b - n).fill(0).map((_, i) => n + i) : Array(n).fill(0).map((_, i) => i);
}

// src/utils/chunk.ts
function chunk(arr, chunkSize) {
  if (isNaN(chunkSize) || chunkSize < 1) {
    throw new RangeError("Invalid chunk size: " + chunkSize);
  }
  if (!arr.length) {
    return [];
  }
  if (arr.length <= chunkSize) {
    return [arr];
  }
  return range(Math.ceil(arr.length / chunkSize)).map((i) => {
    return arr.slice(i * chunkSize, (i + 1) * chunkSize);
  });
}

// src/utils/base64FromBytes.ts
function base64FromBytes(arr) {
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin = [];
    arr.forEach((byte) => {
      bin.push(String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}

// src/utils/hexFromBytes.ts
function hexFromBytes(arr) {
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(arr).toString("hex");
  } else {
    const bin = [];
    arr.forEach((byte) => {
      bin.push(byte.toString(16).padStart(2, "0"));
    });
    return bin.join("");
  }
}

// src/utils/promisesQueueStreaming.ts
async function promisesQueueStreaming(factories, concurrency) {
  const executing = [];
  for await (const factory of factories) {
    const e = factory().then(() => {
      executing.splice(executing.indexOf(e), 1);
    });
    executing.push(e);
    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
}

// src/utils/promisesQueue.ts
async function promisesQueue(factories, concurrency) {
  const promises = [];
  const executing = [];
  for (const factory of factories) {
    const p = factory();
    promises.push(p);
    const e = p.then(() => {
      executing.splice(executing.indexOf(e), 1);
    });
    executing.push(e);
    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }
  return Promise.all(promises);
}

// src/utils/sha256.ts
async function sha256(buffer) {
  if (buffer.size < 1e7 && globalThis.crypto?.subtle) {
    return hexFromBytes(
      new Uint8Array(
        await globalThis.crypto.subtle.digest("SHA-256", buffer instanceof Blob ? await buffer.arrayBuffer() : buffer)
      )
    );
  }
  if (typeof __filename === void 0) {
    if (!wasmModule) {
      wasmModule = await __nccwpck_require__.e(/* import() */ 882).then(__nccwpck_require__.t.bind(__nccwpck_require__, 882, 19));
    }
    const sha2562 = await wasmModule.createSHA256();
    sha2562.init();
    const reader = buffer.stream().getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      sha2562.update(value);
    }
    return sha2562.digest("hex");
  }
  if (!cryptoModule) {
    cryptoModule = await __nccwpck_require__.e(/* import() */ 491).then(__nccwpck_require__.bind(__nccwpck_require__, 491));
  }
  return cryptoModule.sha256Node(buffer);
}
var cryptoModule;
var wasmModule;

// src/utils/parseLinkHeader.ts
function parseLinkHeader(header) {
  const regex = /<(https?:[/][/][^>]+)>;\s+rel="([^"]+)"/g;
  return Object.fromEntries([...header.matchAll(regex)].map(([, url, rel]) => [rel, url]));
}

// src/lib/commit.ts
var CONCURRENT_SHAS = 5;
var CONCURRENT_LFS_UPLOADS = 5;
var MULTIPART_PARALLEL_UPLOAD = 5;
function isFileOperation(op) {
  return op.operation === "addOrUpdate";
}
async function* commitIter(params) {
  yield "preuploading";
  const lfsShas = /* @__PURE__ */ new Map();
  const gitAttributes = params.operations.find((op) => isFileOperation(op) && op.path === ".gitattributes")?.content;
  for (const operations of chunk(params.operations.filter(isFileOperation), 100)) {
    const payload = {
      gitAttributes: gitAttributes && await gitAttributes.text(),
      files: await Promise.all(
        operations.map(async (operation) => ({
          path: operation.path,
          size: operation.content.size,
          sample: base64FromBytes(new Uint8Array(await operation.content.slice(0, 512).arrayBuffer()))
        }))
      )
    };
    const res2 = await fetch(
      `${params.hubUrl ?? HUB_URL}/api/${params.repo.type}s/${params.repo.name}/preupload/${encodeURIComponent(
        params.branch ?? "main"
      )}` + (params.isPullRequest ? "?create_pr=1" : ""),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${params.credentials.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );
    if (!res2.ok) {
      throw await createApiError(res2);
    }
    const json2 = await res2.json();
    for (const file of json2.files) {
      if (file.uploadMode === "lfs") {
        lfsShas.set(file.path, null);
      }
    }
  }
  yield "uploading to LFS";
  for (const operations of chunk(
    params.operations.filter(isFileOperation).filter((op) => lfsShas.has(op.path)),
    100
  )) {
    yield `hashing ${operations.length} files`;
    const shas = await promisesQueue(
      operations.map((op) => async () => {
        const sha = await sha256(op.content);
        lfsShas.set(op.path, sha);
        return sha;
      }),
      CONCURRENT_SHAS
    );
    const payload = {
      operation: "upload",
      // multipart is a custom protocol for HF
      transfers: ["basic", "multipart"],
      hash_algo: "sha_256",
      ref: {
        name: params.branch ?? "main"
      },
      objects: operations.map((op, i) => ({
        oid: shas[i],
        size: op.content.size
      }))
    };
    const res2 = await fetch(
      `${params.hubUrl ?? HUB_URL}/${params.repo.type === "model" ? "" : params.repo.type + "s/"}${params.repo.name}.git/info/lfs/objects/batch`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${params.credentials.accessToken}`,
          Accept: "application/vnd.git-lfs+json",
          "Content-Type": "application/vnd.git-lfs+json"
        },
        body: JSON.stringify(payload)
      }
    );
    if (!res2.ok) {
      throw await createApiError(res2);
    }
    const json2 = await res2.json();
    const batchRequestId = res2.headers.get("X-Request-Id");
    const shaToOperation = new Map(operations.map((op, i) => [shas[i], op]));
    await promisesQueueStreaming(
      json2.objects.map((obj) => async () => {
        const op = shaToOperation.get(obj.oid);
        if (obj.error) {
          const errorMessage = `Error while doing LFS batch call for ${operations[shas.indexOf(obj.oid)].path}: ${obj.error.message} - Request ID: ${batchRequestId}`;
          throw new ApiError(res2.url, obj.error.code, batchRequestId, errorMessage);
        }
        if (!obj.actions?.upload) {
          return;
        }
        const content = op.content;
        const header = obj.actions.upload.header;
        if (header?.chunk_size) {
          const chunkSize = parseInt(header.chunk_size);
          const completionUrl = obj.actions.upload.href;
          const parts = Object.keys(header).filter((key) => /^[0-9]+$/.test(key));
          if (parts.length !== Math.ceil(content.length / chunkSize)) {
            throw new Error("Invalid server response to upload large LFS file, wrong number of parts");
          }
          const completeReq = {
            oid: obj.oid,
            parts: parts.map((part) => ({
              partNumber: +part,
              etag: ""
            }))
          };
          await promisesQueue(
            parts.map((part) => async () => {
              const index = parseInt(part) - 1;
              const res4 = await fetch(header[part], {
                method: "PUT",
                body: content.slice(index * chunkSize, (index + 1) * chunkSize)
              });
              if (!res4.ok) {
                throw await createApiError(res4, {
                  requestId: batchRequestId,
                  message: `Error while uploading part ${part} of ${operations[shas.indexOf(obj.oid)].path} to LFS storage`
                });
              }
              const eTag = res4.headers.get("ETag");
              if (!eTag) {
                throw new Error("Cannot get ETag of part during multipart upload");
              }
              completeReq.parts[Number(part) - 1].etag = eTag;
            }),
            MULTIPART_PARALLEL_UPLOAD
          );
          const res3 = await fetch(completionUrl, {
            method: "POST",
            body: JSON.stringify(completeReq),
            headers: {
              Accept: "application/vnd.git-lfs+json",
              "Content-Type": "application/vnd.git-lfs+json"
            }
          });
          if (!res3.ok) {
            throw await createApiError(res3, {
              requestId: batchRequestId,
              message: `Error completing multipart upload of ${operations[shas.indexOf(obj.oid)].path} to LFS storage`
            });
          }
        } else {
          const res3 = await fetch(obj.actions.upload.href, {
            method: "PUT",
            headers: {
              "X-Request-Id": batchRequestId
            },
            body: content
          });
          if (!res3.ok) {
            throw await createApiError(res3, {
              requestId: batchRequestId,
              message: `Error while uploading ${operations[shas.indexOf(obj.oid)].path} to LFS storage`
            });
          }
        }
      }),
      CONCURRENT_LFS_UPLOADS
    );
  }
  yield "committing";
  const res = await fetch(
    `${params.hubUrl ?? HUB_URL}/api/${params.repo.type}s/${params.repo.name}/commit/${encodeURIComponent(
      params.branch ?? "main"
    )}` + (params.isPullRequest ? "?create_pr=1" : ""),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.credentials.accessToken}`,
        "Content-Type": "application/x-ndjson"
      },
      body: [
        {
          key: "header",
          value: {
            summary: params.title,
            description: params.description,
            parentCommit: params.parentCommit
          }
        },
        ...await Promise.all(
          params.operations.map(
            (operation) => isFileOperation(operation) && lfsShas.has(operation.path) ? {
              key: "lfsFile",
              value: {
                path: operation.path,
                algo: "sha256",
                size: operation.content.length,
                oid: lfsShas.get(operation.path)
              }
            } : convertOperationToNdJson(operation)
          )
        )
      ].map((x) => JSON.stringify(x)).join("\n")
    }
  );
  if (!res.ok) {
    throw await createApiError(res);
  }
  const json = await res.json();
  return {
    pullRequestUrl: json.pullRequestUrl,
    commit: {
      oid: json.commitOid,
      url: json.commitUrl
    },
    hookOutput: json.hookOutput
  };
}
async function commit(params) {
  const iterator = commitIter(params);
  let res = await iterator.next();
  while (!res.done) {
    res = await iterator.next();
  }
  return res.value;
}
async function convertOperationToNdJson(operation) {
  switch (operation.operation) {
    case "addOrUpdate": {
      return {
        key: "file",
        value: {
          content: base64FromBytes(new Uint8Array(await operation.content.arrayBuffer())),
          path: operation.path,
          encoding: "base64"
        }
      };
    }
    case "delete": {
      return {
        key: "deletedFile",
        value: {
          path: operation.path
        }
      };
    }
    default:
      throw new TypeError("Unknown operation: " + operation.operation);
  }
}

// src/lib/delete-repo.ts
async function deleteRepo(params) {
  const [namespace, repoName] = params.repo.name.split("/");
  const res = await fetch(`${params.hubUrl ?? HUB_URL}/api/repos/delete`, {
    method: "DELETE",
    body: JSON.stringify({
      name: repoName,
      organization: namespace,
      type: params.repo.type
    }),
    headers: {
      Authorization: `Bearer ${params.credentials.accessToken}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) {
    throw await createApiError(res);
  }
}

// src/lib/create-repo.ts
async function createRepo(params) {
  const [namespace, repoName] = params.repo.name.split("/");
  const res = await fetch(`${params.hubUrl ?? HUB_URL}/api/repos/create`, {
    method: "POST",
    body: JSON.stringify({
      name: repoName,
      private: params.private,
      organization: namespace,
      license: params.license,
      ...params.repo.type === "space" ? {
        type: "space",
        sdk: "static"
      } : {
        type: params.repo.type
      },
      files: params.files ? await Promise.all(
        params.files.map(async (file) => ({
          encoding: "base64",
          path: file.path,
          content: base64FromBytes(
            new Uint8Array(file.content instanceof Blob ? await file.content.arrayBuffer() : file.content)
          )
        }))
      ) : void 0
    }),
    headers: {
      Authorization: `Bearer ${params.credentials.accessToken}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) {
    throw await createApiError(res);
  }
}

// src/lib/download-file.ts
async function downloadFile(params) {
  const url = `${params.hubUrl ?? HUB_URL}/${params.repo.type === "model" ? "" : `${params.repo.type}s/`}${params.repo.name}/${params.raw ? "raw" : "resolve"}/${encodeURIComponent(params.revision ?? "main")}/${params.path}`;
  let resp = await fetch(url, {
    headers: params.credentials ? {
      Authorization: `Bearer ${params.credentials.accessToken}`
    } : {}
  });
  let redirects = 0;
  while (resp.status >= 300 && resp.status < 400) {
    if (++redirects >= 20) {
      throw new Error("Too many redirects");
    }
    const newUrl = resp.headers.get("Location");
    const useCredentials = new URL(newUrl).host === new URL(url).host;
    resp = await fetch(newUrl, {
      headers: useCredentials && params.credentials ? {
        Authorization: `Bearer ${params.credentials.accessToken}`
      } : {}
    });
  }
  if (resp.status === 404 && resp.headers.get("X-Error-Code") === "EntryNotFound") {
    return null;
  } else if (!resp.ok) {
    throw await createApiError(resp);
  }
  return resp;
}

// src/lib/file-download-info.ts
async function fileDownloadInfo(params) {
  const url = `${params.hubUrl ?? HUB_URL}/${params.repo.type === "model" ? "" : `${params.repo.type}s/`}${params.repo.name}/${params.raw ? "raw" : "resolve"}/${encodeURIComponent(params.revision ?? "main")}/${params.path}` + (params.noContentDisposition ? "?noContentDisposition=1" : "");
  let resp = await fetch(url, {
    method: "HEAD",
    headers: params.credentials ? {
      Authorization: `Bearer ${params.credentials.accessToken}`
    } : {},
    redirect: "manual"
  });
  let redirects = 0;
  while (resp.status >= 300 && resp.status < 400 && new URL(resp.headers.get("Location")).host === new URL(url).host) {
    if (++redirects >= 20) {
      throw new Error("Too many redirects");
    }
    resp = await fetch(url, {
      method: "HEAD",
      headers: params.credentials ? {
        Authorization: `Bearer ${params.credentials.accessToken}`
      } : {},
      redirect: "manual"
    });
  }
  if (resp.status === 404 && resp.headers.get("X-Error-Code") === "EntryNotFound") {
    return null;
  }
  let isLfs = false;
  if (resp.status >= 300 && resp.status < 400) {
    if (resp.headers.has("X-Linked-Size")) {
      isLfs = true;
    } else {
      throw new Error("Invalid response from server: redirect to external server should have X-Linked-Size header");
    }
  } else if (!resp.ok) {
    throw await createApiError(resp);
  }
  return {
    etag: isLfs ? resp.headers.get("X-Linked-ETag") : resp.headers.get("ETag"),
    size: isLfs ? parseInt(resp.headers.get("X-Linked-Size")) : parseInt(resp.headers.get("Content-Length")),
    downloadLink: isLfs ? resp.headers.get("Location") : null
  };
}

// src/lib/list-files.ts
async function* listFiles(params) {
  let url = `${params.hubUrl || HUB_URL}/api/${params.repo.type}s/${params.repo.name}/tree/${params.revision || "main"}${params.path ? "/" + params.path : ""}${params.recursive ? "?recursive=true" : ""}`;
  while (url) {
    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        ...params.credentials ? { Authorization: `Bearer ${params.credentials.accessToken}` } : void 0
      }
    });
    if (!res.ok) {
      throw createApiError(res);
    }
    const items = await res.json();
    for (const item of items) {
      yield item;
    }
    const linkHeader = res.headers.get("Link");
    url = linkHeader ? parseLinkHeader(linkHeader).next : void 0;
  }
}


;// CONCATENATED MODULE: ./index.ts

const src = `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width" />
		<title>My static Space</title>
		<link rel="stylesheet" href="style.css" />
	</head>
	<body>
		<div class="card">
			<h1>Hello from @huggingface/hub!</h1>
		</div>
	</body>
</html>`;
async function run() {
    const repo = {
        name: 'pngwn/test-repo',
        type: 'space',
    };
    const credentials = {
        accessToken: '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',
    };
    try {
        const res = await createRepo({ repo, credentials });
    }
    catch (e) {
        console.log(e);
    }
    // console.log(res)
    await commit({
        repo,
        credentials,
        title: 'Add model file',
        operations: [
            {
                operation: 'addOrUpdate',
                path: 'index.html',
                content: new Blob([src]), // Can work with native File in browsers
            },
        ],
    });
    // const r2 = res.json()
}
console.log('hello');
run();

})();

