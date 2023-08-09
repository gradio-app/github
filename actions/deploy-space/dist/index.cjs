"use strict";
const require$$4$2 = require("path");
const promises = require("fs/promises");
const fetch = require("node-fetch");
const node_buffer = require("node:buffer");
const recursive_read_dir = require("recursive-readdir");
const require$$1 = require("os");
const require$$0 = require("fs");
const crypto = require("crypto");
const require$$2$2 = require("http");
const require$$3$1 = require("https");
require("net");
const require$$1$1 = require("tls");
const require$$4$1 = require("events");
const require$$5 = require("assert");
const require$$6 = require("util");
const require$$3$2 = require("stream");
const require$$7 = require("url");
const require$$8 = require("perf_hooks");
const require$$1$2 = require("zlib");
const hub = require("@huggingface/hub");
const k = require("kleur");
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = fetch.Headers;
  globalThis.Request = fetch.Request;
  globalThis.Response = fetch.Response;
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace(n) {
  if (n.__esModule)
    return n;
  var f = n.default;
  if (typeof f == "function") {
    var a = function a2() {
      if (this instanceof a2) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else
    a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach(function(k2) {
    var d = Object.getOwnPropertyDescriptor(n, k2);
    Object.defineProperty(a, k2, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k2];
      }
    });
  });
  return a;
}
var core$4 = {};
var command = {};
var utils$3 = {};
Object.defineProperty(utils$3, "__esModule", { value: true });
utils$3.toCommandProperties = utils$3.toCommandValue = void 0;
function toCommandValue(input) {
  if (input === null || input === void 0) {
    return "";
  } else if (typeof input === "string" || input instanceof String) {
    return input;
  }
  return JSON.stringify(input);
}
utils$3.toCommandValue = toCommandValue;
function toCommandProperties(annotationProperties) {
  if (!Object.keys(annotationProperties).length) {
    return {};
  }
  return {
    title: annotationProperties.title,
    file: annotationProperties.file,
    line: annotationProperties.startLine,
    endLine: annotationProperties.endLine,
    col: annotationProperties.startColumn,
    endColumn: annotationProperties.endColumn
  };
}
utils$3.toCommandProperties = toCommandProperties;
var __createBinding$a = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  Object.defineProperty(o, k22, { enumerable: true, get: function() {
    return m[k2];
  } });
} : function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  o[k22] = m[k2];
});
var __setModuleDefault$a = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$a = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k2 in mod)
      if (k2 !== "default" && Object.hasOwnProperty.call(mod, k2))
        __createBinding$a(result, mod, k2);
  }
  __setModuleDefault$a(result, mod);
  return result;
};
Object.defineProperty(command, "__esModule", { value: true });
command.issue = command.issueCommand = void 0;
const os$1 = __importStar$a(require$$1);
const utils_1$7 = utils$3;
function issueCommand(command2, properties, message) {
  const cmd = new Command(command2, properties, message);
  process.stdout.write(cmd.toString() + os$1.EOL);
}
command.issueCommand = issueCommand;
function issue(name, message = "") {
  issueCommand(name, {}, message);
}
command.issue = issue;
const CMD_STRING = "::";
class Command {
  constructor(command2, properties, message) {
    if (!command2) {
      command2 = "missing.command";
    }
    this.command = command2;
    this.properties = properties;
    this.message = message;
  }
  toString() {
    let cmdStr = CMD_STRING + this.command;
    if (this.properties && Object.keys(this.properties).length > 0) {
      cmdStr += " ";
      let first = true;
      for (const key in this.properties) {
        if (this.properties.hasOwnProperty(key)) {
          const val = this.properties[key];
          if (val) {
            if (first) {
              first = false;
            } else {
              cmdStr += ",";
            }
            cmdStr += `${key}=${escapeProperty(val)}`;
          }
        }
      }
    }
    cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
    return cmdStr;
  }
}
function escapeData(s) {
  return utils_1$7.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}
function escapeProperty(s) {
  return utils_1$7.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/:/g, "%3A").replace(/,/g, "%2C");
}
var fileCommand = {};
const rnds8Pool = new Uint8Array(256);
let poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    crypto.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
const REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
function validate(uuid) {
  return typeof uuid === "string" && REGEX.test(uuid);
}
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).substr(1));
}
function stringify(arr, offset = 0) {
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  if (!validate(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
let _nodeId;
let _clockseq;
let _lastMSecs = 0;
let _lastNSecs = 0;
function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng)();
    if (node == null) {
      node = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }
    if (clockseq == null) {
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
    }
  }
  let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
  if (dt < 0 && options.clockseq === void 0) {
    clockseq = clockseq + 1 & 16383;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
    nsecs = 0;
  }
  if (nsecs >= 1e4) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  msecs += 122192928e5;
  const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  b[i++] = tl >>> 24 & 255;
  b[i++] = tl >>> 16 & 255;
  b[i++] = tl >>> 8 & 255;
  b[i++] = tl & 255;
  const tmh = msecs / 4294967296 * 1e4 & 268435455;
  b[i++] = tmh >>> 8 & 255;
  b[i++] = tmh & 255;
  b[i++] = tmh >>> 24 & 15 | 16;
  b[i++] = tmh >>> 16 & 255;
  b[i++] = clockseq >>> 8 | 128;
  b[i++] = clockseq & 255;
  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || stringify(b);
}
function parse$1(uuid) {
  if (!validate(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  const arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
const DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const URL$1 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
function v35(name, version2, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse$1(namespace);
    }
    if (namespace.length !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version2;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return stringify(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL$1;
  return generateUUID;
}
function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return crypto.createHash("md5").update(bytes).digest();
}
const v3 = v35("v3", 48, md5);
const v3$1 = v3;
function v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return stringify(rnds);
}
function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return crypto.createHash("sha1").update(bytes).digest();
}
const v5 = v35("v5", 80, sha1);
const v5$1 = v5;
const nil = "00000000-0000-0000-0000-000000000000";
function version(uuid) {
  if (!validate(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.substr(14, 1), 16);
}
const esmNode = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NIL: nil,
  parse: parse$1,
  stringify,
  v1,
  v3: v3$1,
  v4,
  v5: v5$1,
  validate,
  version
}, Symbol.toStringTag, { value: "Module" }));
const require$$2$1 = /* @__PURE__ */ getAugmentedNamespace(esmNode);
var __createBinding$9 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  Object.defineProperty(o, k22, { enumerable: true, get: function() {
    return m[k2];
  } });
} : function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  o[k22] = m[k2];
});
var __setModuleDefault$9 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$9 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k2 in mod)
      if (k2 !== "default" && Object.hasOwnProperty.call(mod, k2))
        __createBinding$9(result, mod, k2);
  }
  __setModuleDefault$9(result, mod);
  return result;
};
Object.defineProperty(fileCommand, "__esModule", { value: true });
fileCommand.prepareKeyValueMessage = fileCommand.issueFileCommand = void 0;
const fs$5 = __importStar$9(require$$0);
const os = __importStar$9(require$$1);
const uuid_1 = require$$2$1;
const utils_1$6 = utils$3;
function issueFileCommand(command2, message) {
  const filePath = process.env[`GITHUB_${command2}`];
  if (!filePath) {
    throw new Error(`Unable to find environment variable for file command ${command2}`);
  }
  if (!fs$5.existsSync(filePath)) {
    throw new Error(`Missing file at path: ${filePath}`);
  }
  fs$5.appendFileSync(filePath, `${utils_1$6.toCommandValue(message)}${os.EOL}`, {
    encoding: "utf8"
  });
}
fileCommand.issueFileCommand = issueFileCommand;
function prepareKeyValueMessage(key, value) {
  const delimiter = `ghadelimiter_${uuid_1.v4()}`;
  const convertedValue = utils_1$6.toCommandValue(value);
  if (key.includes(delimiter)) {
    throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
  }
  if (convertedValue.includes(delimiter)) {
    throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
  }
  return `${key}<<${delimiter}${os.EOL}${convertedValue}${os.EOL}${delimiter}`;
}
fileCommand.prepareKeyValueMessage = prepareKeyValueMessage;
var oidcUtils = {};
var lib = {};
var proxy = {};
Object.defineProperty(proxy, "__esModule", { value: true });
proxy.checkBypass = proxy.getProxyUrl = void 0;
function getProxyUrl(reqUrl) {
  const usingSsl = reqUrl.protocol === "https:";
  if (checkBypass(reqUrl)) {
    return void 0;
  }
  const proxyVar = (() => {
    if (usingSsl) {
      return process.env["https_proxy"] || process.env["HTTPS_PROXY"];
    } else {
      return process.env["http_proxy"] || process.env["HTTP_PROXY"];
    }
  })();
  if (proxyVar) {
    return new URL(proxyVar);
  } else {
    return void 0;
  }
}
proxy.getProxyUrl = getProxyUrl;
function checkBypass(reqUrl) {
  if (!reqUrl.hostname) {
    return false;
  }
  const noProxy = process.env["no_proxy"] || process.env["NO_PROXY"] || "";
  if (!noProxy) {
    return false;
  }
  let reqPort;
  if (reqUrl.port) {
    reqPort = Number(reqUrl.port);
  } else if (reqUrl.protocol === "http:") {
    reqPort = 80;
  } else if (reqUrl.protocol === "https:") {
    reqPort = 443;
  }
  const upperReqHosts = [reqUrl.hostname.toUpperCase()];
  if (typeof reqPort === "number") {
    upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
  }
  for (const upperNoProxyItem of noProxy.split(",").map((x) => x.trim().toUpperCase()).filter((x) => x)) {
    if (upperReqHosts.some((x) => x === upperNoProxyItem)) {
      return true;
    }
  }
  return false;
}
proxy.checkBypass = checkBypass;
var tunnel$1 = {};
var tls = require$$1$1;
var http = require$$2$2;
var https = require$$3$1;
var events = require$$4$1;
var util = require$$6;
tunnel$1.httpOverHttp = httpOverHttp;
tunnel$1.httpsOverHttp = httpsOverHttp;
tunnel$1.httpOverHttps = httpOverHttps;
tunnel$1.httpsOverHttps = httpsOverHttps;
function httpOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  return agent;
}
function httpsOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}
function httpOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  return agent;
}
function httpsOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}
function TunnelingAgent(options) {
  var self2 = this;
  self2.options = options || {};
  self2.proxyOptions = self2.options.proxy || {};
  self2.maxSockets = self2.options.maxSockets || http.Agent.defaultMaxSockets;
  self2.requests = [];
  self2.sockets = [];
  self2.on("free", function onFree(socket, host, port, localAddress) {
    var options2 = toOptions(host, port, localAddress);
    for (var i = 0, len = self2.requests.length; i < len; ++i) {
      var pending = self2.requests[i];
      if (pending.host === options2.host && pending.port === options2.port) {
        self2.requests.splice(i, 1);
        pending.request.onSocket(socket);
        return;
      }
    }
    socket.destroy();
    self2.removeSocket(socket);
  });
}
util.inherits(TunnelingAgent, events.EventEmitter);
TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
  var self2 = this;
  var options = mergeOptions({ request: req }, self2.options, toOptions(host, port, localAddress));
  if (self2.sockets.length >= this.maxSockets) {
    self2.requests.push(options);
    return;
  }
  self2.createSocket(options, function(socket) {
    socket.on("free", onFree);
    socket.on("close", onCloseOrRemove);
    socket.on("agentRemove", onCloseOrRemove);
    req.onSocket(socket);
    function onFree() {
      self2.emit("free", socket, options);
    }
    function onCloseOrRemove(err) {
      self2.removeSocket(socket);
      socket.removeListener("free", onFree);
      socket.removeListener("close", onCloseOrRemove);
      socket.removeListener("agentRemove", onCloseOrRemove);
    }
  });
};
TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  var self2 = this;
  var placeholder = {};
  self2.sockets.push(placeholder);
  var connectOptions = mergeOptions({}, self2.proxyOptions, {
    method: "CONNECT",
    path: options.host + ":" + options.port,
    agent: false,
    headers: {
      host: options.host + ":" + options.port
    }
  });
  if (options.localAddress) {
    connectOptions.localAddress = options.localAddress;
  }
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers["Proxy-Authorization"] = "Basic " + new Buffer(connectOptions.proxyAuth).toString("base64");
  }
  debug("making CONNECT request");
  var connectReq = self2.request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false;
  connectReq.once("response", onResponse);
  connectReq.once("upgrade", onUpgrade);
  connectReq.once("connect", onConnect);
  connectReq.once("error", onError);
  connectReq.end();
  function onResponse(res) {
    res.upgrade = true;
  }
  function onUpgrade(res, socket, head) {
    process.nextTick(function() {
      onConnect(res, socket, head);
    });
  }
  function onConnect(res, socket, head) {
    connectReq.removeAllListeners();
    socket.removeAllListeners();
    if (res.statusCode !== 200) {
      debug(
        "tunneling socket could not be established, statusCode=%d",
        res.statusCode
      );
      socket.destroy();
      var error = new Error("tunneling socket could not be established, statusCode=" + res.statusCode);
      error.code = "ECONNRESET";
      options.request.emit("error", error);
      self2.removeSocket(placeholder);
      return;
    }
    if (head.length > 0) {
      debug("got illegal response body from proxy");
      socket.destroy();
      var error = new Error("got illegal response body from proxy");
      error.code = "ECONNRESET";
      options.request.emit("error", error);
      self2.removeSocket(placeholder);
      return;
    }
    debug("tunneling connection has established");
    self2.sockets[self2.sockets.indexOf(placeholder)] = socket;
    return cb(socket);
  }
  function onError(cause) {
    connectReq.removeAllListeners();
    debug(
      "tunneling socket could not be established, cause=%s\n",
      cause.message,
      cause.stack
    );
    var error = new Error("tunneling socket could not be established, cause=" + cause.message);
    error.code = "ECONNRESET";
    options.request.emit("error", error);
    self2.removeSocket(placeholder);
  }
};
TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  var pos = this.sockets.indexOf(socket);
  if (pos === -1) {
    return;
  }
  this.sockets.splice(pos, 1);
  var pending = this.requests.shift();
  if (pending) {
    this.createSocket(pending, function(socket2) {
      pending.request.onSocket(socket2);
    });
  }
};
function createSecureSocket(options, cb) {
  var self2 = this;
  TunnelingAgent.prototype.createSocket.call(self2, options, function(socket) {
    var hostHeader = options.request.getHeader("host");
    var tlsOptions = mergeOptions({}, self2.options, {
      socket,
      servername: hostHeader ? hostHeader.replace(/:.*$/, "") : options.host
    });
    var secureSocket = tls.connect(0, tlsOptions);
    self2.sockets[self2.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}
function toOptions(host, port, localAddress) {
  if (typeof host === "string") {
    return {
      host,
      port,
      localAddress
    };
  }
  return host;
}
function mergeOptions(target) {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var overrides = arguments[i];
    if (typeof overrides === "object") {
      var keys = Object.keys(overrides);
      for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
        var k2 = keys[j];
        if (overrides[k2] !== void 0) {
          target[k2] = overrides[k2];
        }
      }
    }
  }
  return target;
}
var debug;
if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
  debug = function() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === "string") {
      args[0] = "TUNNEL: " + args[0];
    } else {
      args.unshift("TUNNEL:");
    }
    console.error.apply(console, args);
  };
} else {
  debug = function() {
  };
}
tunnel$1.debug = debug;
var tunnel = tunnel$1;
(function(exports2) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k2, k22) {
    if (k22 === void 0)
      k22 = k2;
    Object.defineProperty(o, k22, { enumerable: true, get: function() {
      return m[k2];
    } });
  } : function(o, m, k2, k22) {
    if (k22 === void 0)
      k22 = k2;
    o[k22] = m[k2];
  });
  var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k2 in mod)
        if (k2 !== "default" && Object.hasOwnProperty.call(mod, k2))
          __createBinding2(result, mod, k2);
    }
    __setModuleDefault2(result, mod);
    return result;
  };
  var __awaiter2 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.HttpClient = exports2.isHttps = exports2.HttpClientResponse = exports2.HttpClientError = exports2.getProxyUrl = exports2.MediaTypes = exports2.Headers = exports2.HttpCodes = void 0;
  const http2 = __importStar2(require$$2$2);
  const https2 = __importStar2(require$$3$1);
  const pm = __importStar2(proxy);
  const tunnel$12 = __importStar2(tunnel);
  var HttpCodes;
  (function(HttpCodes2) {
    HttpCodes2[HttpCodes2["OK"] = 200] = "OK";
    HttpCodes2[HttpCodes2["MultipleChoices"] = 300] = "MultipleChoices";
    HttpCodes2[HttpCodes2["MovedPermanently"] = 301] = "MovedPermanently";
    HttpCodes2[HttpCodes2["ResourceMoved"] = 302] = "ResourceMoved";
    HttpCodes2[HttpCodes2["SeeOther"] = 303] = "SeeOther";
    HttpCodes2[HttpCodes2["NotModified"] = 304] = "NotModified";
    HttpCodes2[HttpCodes2["UseProxy"] = 305] = "UseProxy";
    HttpCodes2[HttpCodes2["SwitchProxy"] = 306] = "SwitchProxy";
    HttpCodes2[HttpCodes2["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    HttpCodes2[HttpCodes2["PermanentRedirect"] = 308] = "PermanentRedirect";
    HttpCodes2[HttpCodes2["BadRequest"] = 400] = "BadRequest";
    HttpCodes2[HttpCodes2["Unauthorized"] = 401] = "Unauthorized";
    HttpCodes2[HttpCodes2["PaymentRequired"] = 402] = "PaymentRequired";
    HttpCodes2[HttpCodes2["Forbidden"] = 403] = "Forbidden";
    HttpCodes2[HttpCodes2["NotFound"] = 404] = "NotFound";
    HttpCodes2[HttpCodes2["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpCodes2[HttpCodes2["NotAcceptable"] = 406] = "NotAcceptable";
    HttpCodes2[HttpCodes2["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    HttpCodes2[HttpCodes2["RequestTimeout"] = 408] = "RequestTimeout";
    HttpCodes2[HttpCodes2["Conflict"] = 409] = "Conflict";
    HttpCodes2[HttpCodes2["Gone"] = 410] = "Gone";
    HttpCodes2[HttpCodes2["TooManyRequests"] = 429] = "TooManyRequests";
    HttpCodes2[HttpCodes2["InternalServerError"] = 500] = "InternalServerError";
    HttpCodes2[HttpCodes2["NotImplemented"] = 501] = "NotImplemented";
    HttpCodes2[HttpCodes2["BadGateway"] = 502] = "BadGateway";
    HttpCodes2[HttpCodes2["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpCodes2[HttpCodes2["GatewayTimeout"] = 504] = "GatewayTimeout";
  })(HttpCodes = exports2.HttpCodes || (exports2.HttpCodes = {}));
  var Headers;
  (function(Headers2) {
    Headers2["Accept"] = "accept";
    Headers2["ContentType"] = "content-type";
  })(Headers = exports2.Headers || (exports2.Headers = {}));
  var MediaTypes;
  (function(MediaTypes2) {
    MediaTypes2["ApplicationJson"] = "application/json";
  })(MediaTypes = exports2.MediaTypes || (exports2.MediaTypes = {}));
  function getProxyUrl2(serverUrl) {
    const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
    return proxyUrl ? proxyUrl.href : "";
  }
  exports2.getProxyUrl = getProxyUrl2;
  const HttpRedirectCodes = [
    HttpCodes.MovedPermanently,
    HttpCodes.ResourceMoved,
    HttpCodes.SeeOther,
    HttpCodes.TemporaryRedirect,
    HttpCodes.PermanentRedirect
  ];
  const HttpResponseRetryCodes = [
    HttpCodes.BadGateway,
    HttpCodes.ServiceUnavailable,
    HttpCodes.GatewayTimeout
  ];
  const RetryableHttpVerbs = ["OPTIONS", "GET", "DELETE", "HEAD"];
  const ExponentialBackoffCeiling = 10;
  const ExponentialBackoffTimeSlice = 5;
  class HttpClientError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.name = "HttpClientError";
      this.statusCode = statusCode;
      Object.setPrototypeOf(this, HttpClientError.prototype);
    }
  }
  exports2.HttpClientError = HttpClientError;
  class HttpClientResponse {
    constructor(message) {
      this.message = message;
    }
    readBody() {
      return __awaiter2(this, void 0, void 0, function* () {
        return new Promise((resolve) => __awaiter2(this, void 0, void 0, function* () {
          let output = Buffer.alloc(0);
          this.message.on("data", (chunk) => {
            output = Buffer.concat([output, chunk]);
          });
          this.message.on("end", () => {
            resolve(output.toString());
          });
        }));
      });
    }
  }
  exports2.HttpClientResponse = HttpClientResponse;
  function isHttps(requestUrl) {
    const parsedUrl = new URL(requestUrl);
    return parsedUrl.protocol === "https:";
  }
  exports2.isHttps = isHttps;
  class HttpClient {
    constructor(userAgent2, handlers, requestOptions) {
      this._ignoreSslError = false;
      this._allowRedirects = true;
      this._allowRedirectDowngrade = false;
      this._maxRedirects = 50;
      this._allowRetries = false;
      this._maxRetries = 1;
      this._keepAlive = false;
      this._disposed = false;
      this.userAgent = userAgent2;
      this.handlers = handlers || [];
      this.requestOptions = requestOptions;
      if (requestOptions) {
        if (requestOptions.ignoreSslError != null) {
          this._ignoreSslError = requestOptions.ignoreSslError;
        }
        this._socketTimeout = requestOptions.socketTimeout;
        if (requestOptions.allowRedirects != null) {
          this._allowRedirects = requestOptions.allowRedirects;
        }
        if (requestOptions.allowRedirectDowngrade != null) {
          this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
        }
        if (requestOptions.maxRedirects != null) {
          this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
        }
        if (requestOptions.keepAlive != null) {
          this._keepAlive = requestOptions.keepAlive;
        }
        if (requestOptions.allowRetries != null) {
          this._allowRetries = requestOptions.allowRetries;
        }
        if (requestOptions.maxRetries != null) {
          this._maxRetries = requestOptions.maxRetries;
        }
      }
    }
    options(requestUrl, additionalHeaders) {
      return __awaiter2(this, void 0, void 0, function* () {
        return this.request("OPTIONS", requestUrl, null, additionalHeaders || {});
      });
    }
    get(requestUrl, additionalHeaders) {
      return __awaiter2(this, void 0, void 0, function* () {
        return this.request("GET", requestUrl, null, additionalHeaders || {});
      });
    }
    del(requestUrl, additionalHeaders) {
      return __awaiter2(this, void 0, void 0, function* () {
        return this.request("DELETE", requestUrl, null, additionalHeaders || {});
      });
    }
    post(requestUrl, data, additionalHeaders) {
      return __awaiter2(this, void 0, void 0, function* () {
        return this.request("POST", requestUrl, data, additionalHeaders || {});
      });
    }
    patch(requestUrl, data, additionalHeaders) {
      return __awaiter2(this, void 0, void 0, function* () {
        return this.request("PATCH", requestUrl, data, additionalHeaders || {});
      });
    }
    put(requestUrl, data, additionalHeaders) {
      return __awaiter2(this, void 0, void 0, function* () {
        return this.request("PUT", requestUrl, data, additionalHeaders || {});
      });
    }
    head(requestUrl, additionalHeaders) {
      return __awaiter2(this, void 0, void 0, function* () {
        return this.request("HEAD", requestUrl, null, additionalHeaders || {});
      });
    }
    sendStream(verb, requestUrl, stream2, additionalHeaders) {
      return __awaiter2(this, void 0, void 0, function* () {
        return this.request(verb, requestUrl, stream2, additionalHeaders);
      });
    }
    /**
     * Gets a typed object from an endpoint
     * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
     */
    getJson(requestUrl, additionalHeaders = {}) {
      return __awaiter2(this, void 0, void 0, function* () {
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        const res = yield this.get(requestUrl, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      });
    }
    postJson(requestUrl, obj, additionalHeaders = {}) {
      return __awaiter2(this, void 0, void 0, function* () {
        const data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        const res = yield this.post(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      });
    }
    putJson(requestUrl, obj, additionalHeaders = {}) {
      return __awaiter2(this, void 0, void 0, function* () {
        const data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        const res = yield this.put(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      });
    }
    patchJson(requestUrl, obj, additionalHeaders = {}) {
      return __awaiter2(this, void 0, void 0, function* () {
        const data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        const res = yield this.patch(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      });
    }
    /**
     * Makes a raw http request.
     * All other methods such as get, post, patch, and request ultimately call this.
     * Prefer get, del, post and patch
     */
    request(verb, requestUrl, data, headers) {
      return __awaiter2(this, void 0, void 0, function* () {
        if (this._disposed) {
          throw new Error("Client has already been disposed.");
        }
        const parsedUrl = new URL(requestUrl);
        let info = this._prepareRequest(verb, parsedUrl, headers);
        const maxTries = this._allowRetries && RetryableHttpVerbs.includes(verb) ? this._maxRetries + 1 : 1;
        let numTries = 0;
        let response;
        do {
          response = yield this.requestRaw(info, data);
          if (response && response.message && response.message.statusCode === HttpCodes.Unauthorized) {
            let authenticationHandler;
            for (const handler of this.handlers) {
              if (handler.canHandleAuthentication(response)) {
                authenticationHandler = handler;
                break;
              }
            }
            if (authenticationHandler) {
              return authenticationHandler.handleAuthentication(this, info, data);
            } else {
              return response;
            }
          }
          let redirectsRemaining = this._maxRedirects;
          while (response.message.statusCode && HttpRedirectCodes.includes(response.message.statusCode) && this._allowRedirects && redirectsRemaining > 0) {
            const redirectUrl = response.message.headers["location"];
            if (!redirectUrl) {
              break;
            }
            const parsedRedirectUrl = new URL(redirectUrl);
            if (parsedUrl.protocol === "https:" && parsedUrl.protocol !== parsedRedirectUrl.protocol && !this._allowRedirectDowngrade) {
              throw new Error("Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.");
            }
            yield response.readBody();
            if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
              for (const header in headers) {
                if (header.toLowerCase() === "authorization") {
                  delete headers[header];
                }
              }
            }
            info = this._prepareRequest(verb, parsedRedirectUrl, headers);
            response = yield this.requestRaw(info, data);
            redirectsRemaining--;
          }
          if (!response.message.statusCode || !HttpResponseRetryCodes.includes(response.message.statusCode)) {
            return response;
          }
          numTries += 1;
          if (numTries < maxTries) {
            yield response.readBody();
            yield this._performExponentialBackoff(numTries);
          }
        } while (numTries < maxTries);
        return response;
      });
    }
    /**
     * Needs to be called if keepAlive is set to true in request options.
     */
    dispose() {
      if (this._agent) {
        this._agent.destroy();
      }
      this._disposed = true;
    }
    /**
     * Raw request.
     * @param info
     * @param data
     */
    requestRaw(info, data) {
      return __awaiter2(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
          function callbackForResult(err, res) {
            if (err) {
              reject(err);
            } else if (!res) {
              reject(new Error("Unknown error"));
            } else {
              resolve(res);
            }
          }
          this.requestRawWithCallback(info, data, callbackForResult);
        });
      });
    }
    /**
     * Raw request with callback.
     * @param info
     * @param data
     * @param onResult
     */
    requestRawWithCallback(info, data, onResult) {
      if (typeof data === "string") {
        if (!info.options.headers) {
          info.options.headers = {};
        }
        info.options.headers["Content-Length"] = Buffer.byteLength(data, "utf8");
      }
      let callbackCalled = false;
      function handleResult(err, res) {
        if (!callbackCalled) {
          callbackCalled = true;
          onResult(err, res);
        }
      }
      const req = info.httpModule.request(info.options, (msg) => {
        const res = new HttpClientResponse(msg);
        handleResult(void 0, res);
      });
      let socket;
      req.on("socket", (sock) => {
        socket = sock;
      });
      req.setTimeout(this._socketTimeout || 3 * 6e4, () => {
        if (socket) {
          socket.end();
        }
        handleResult(new Error(`Request timeout: ${info.options.path}`));
      });
      req.on("error", function(err) {
        handleResult(err);
      });
      if (data && typeof data === "string") {
        req.write(data, "utf8");
      }
      if (data && typeof data !== "string") {
        data.on("close", function() {
          req.end();
        });
        data.pipe(req);
      } else {
        req.end();
      }
    }
    /**
     * Gets an http agent. This function is useful when you need an http agent that handles
     * routing through a proxy server - depending upon the url and proxy environment variables.
     * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
     */
    getAgent(serverUrl) {
      const parsedUrl = new URL(serverUrl);
      return this._getAgent(parsedUrl);
    }
    _prepareRequest(method, requestUrl, headers) {
      const info = {};
      info.parsedUrl = requestUrl;
      const usingSsl = info.parsedUrl.protocol === "https:";
      info.httpModule = usingSsl ? https2 : http2;
      const defaultPort = usingSsl ? 443 : 80;
      info.options = {};
      info.options.host = info.parsedUrl.hostname;
      info.options.port = info.parsedUrl.port ? parseInt(info.parsedUrl.port) : defaultPort;
      info.options.path = (info.parsedUrl.pathname || "") + (info.parsedUrl.search || "");
      info.options.method = method;
      info.options.headers = this._mergeHeaders(headers);
      if (this.userAgent != null) {
        info.options.headers["user-agent"] = this.userAgent;
      }
      info.options.agent = this._getAgent(info.parsedUrl);
      if (this.handlers) {
        for (const handler of this.handlers) {
          handler.prepareRequest(info.options);
        }
      }
      return info;
    }
    _mergeHeaders(headers) {
      if (this.requestOptions && this.requestOptions.headers) {
        return Object.assign({}, lowercaseKeys2(this.requestOptions.headers), lowercaseKeys2(headers || {}));
      }
      return lowercaseKeys2(headers || {});
    }
    _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
      let clientHeader;
      if (this.requestOptions && this.requestOptions.headers) {
        clientHeader = lowercaseKeys2(this.requestOptions.headers)[header];
      }
      return additionalHeaders[header] || clientHeader || _default;
    }
    _getAgent(parsedUrl) {
      let agent;
      const proxyUrl = pm.getProxyUrl(parsedUrl);
      const useProxy = proxyUrl && proxyUrl.hostname;
      if (this._keepAlive && useProxy) {
        agent = this._proxyAgent;
      }
      if (this._keepAlive && !useProxy) {
        agent = this._agent;
      }
      if (agent) {
        return agent;
      }
      const usingSsl = parsedUrl.protocol === "https:";
      let maxSockets = 100;
      if (this.requestOptions) {
        maxSockets = this.requestOptions.maxSockets || http2.globalAgent.maxSockets;
      }
      if (proxyUrl && proxyUrl.hostname) {
        const agentOptions = {
          maxSockets,
          keepAlive: this._keepAlive,
          proxy: Object.assign(Object.assign({}, (proxyUrl.username || proxyUrl.password) && {
            proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
          }), { host: proxyUrl.hostname, port: proxyUrl.port })
        };
        let tunnelAgent;
        const overHttps = proxyUrl.protocol === "https:";
        if (usingSsl) {
          tunnelAgent = overHttps ? tunnel$12.httpsOverHttps : tunnel$12.httpsOverHttp;
        } else {
          tunnelAgent = overHttps ? tunnel$12.httpOverHttps : tunnel$12.httpOverHttp;
        }
        agent = tunnelAgent(agentOptions);
        this._proxyAgent = agent;
      }
      if (this._keepAlive && !agent) {
        const options = { keepAlive: this._keepAlive, maxSockets };
        agent = usingSsl ? new https2.Agent(options) : new http2.Agent(options);
        this._agent = agent;
      }
      if (!agent) {
        agent = usingSsl ? https2.globalAgent : http2.globalAgent;
      }
      if (usingSsl && this._ignoreSslError) {
        agent.options = Object.assign(agent.options || {}, {
          rejectUnauthorized: false
        });
      }
      return agent;
    }
    _performExponentialBackoff(retryNumber) {
      return __awaiter2(this, void 0, void 0, function* () {
        retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
        const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
        return new Promise((resolve) => setTimeout(() => resolve(), ms));
      });
    }
    _processResponse(res, options) {
      return __awaiter2(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter2(this, void 0, void 0, function* () {
          const statusCode = res.message.statusCode || 0;
          const response = {
            statusCode,
            result: null,
            headers: {}
          };
          if (statusCode === HttpCodes.NotFound) {
            resolve(response);
          }
          function dateTimeDeserializer(key, value) {
            if (typeof value === "string") {
              const a = new Date(value);
              if (!isNaN(a.valueOf())) {
                return a;
              }
            }
            return value;
          }
          let obj;
          let contents;
          try {
            contents = yield res.readBody();
            if (contents && contents.length > 0) {
              if (options && options.deserializeDates) {
                obj = JSON.parse(contents, dateTimeDeserializer);
              } else {
                obj = JSON.parse(contents);
              }
              response.result = obj;
            }
            response.headers = res.message.headers;
          } catch (err) {
          }
          if (statusCode > 299) {
            let msg;
            if (obj && obj.message) {
              msg = obj.message;
            } else if (contents && contents.length > 0) {
              msg = contents;
            } else {
              msg = `Failed request: (${statusCode})`;
            }
            const err = new HttpClientError(msg, statusCode);
            err.result = response.result;
            reject(err);
          } else {
            resolve(response);
          }
        }));
      });
    }
  }
  exports2.HttpClient = HttpClient;
  const lowercaseKeys2 = (obj) => Object.keys(obj).reduce((c, k2) => (c[k2.toLowerCase()] = obj[k2], c), {});
})(lib);
var auth$1 = {};
var __awaiter$6 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
Object.defineProperty(auth$1, "__esModule", { value: true });
auth$1.PersonalAccessTokenCredentialHandler = auth$1.BearerCredentialHandler = auth$1.BasicCredentialHandler = void 0;
class BasicCredentialHandler {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }
  prepareRequest(options) {
    if (!options.headers) {
      throw Error("The request has no headers");
    }
    options.headers["Authorization"] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString("base64")}`;
  }
  // This handler cannot handle 401
  canHandleAuthentication() {
    return false;
  }
  handleAuthentication() {
    return __awaiter$6(this, void 0, void 0, function* () {
      throw new Error("not implemented");
    });
  }
}
auth$1.BasicCredentialHandler = BasicCredentialHandler;
class BearerCredentialHandler {
  constructor(token) {
    this.token = token;
  }
  // currently implements pre-authorization
  // TODO: support preAuth = false where it hooks on 401
  prepareRequest(options) {
    if (!options.headers) {
      throw Error("The request has no headers");
    }
    options.headers["Authorization"] = `Bearer ${this.token}`;
  }
  // This handler cannot handle 401
  canHandleAuthentication() {
    return false;
  }
  handleAuthentication() {
    return __awaiter$6(this, void 0, void 0, function* () {
      throw new Error("not implemented");
    });
  }
}
auth$1.BearerCredentialHandler = BearerCredentialHandler;
class PersonalAccessTokenCredentialHandler {
  constructor(token) {
    this.token = token;
  }
  // currently implements pre-authorization
  // TODO: support preAuth = false where it hooks on 401
  prepareRequest(options) {
    if (!options.headers) {
      throw Error("The request has no headers");
    }
    options.headers["Authorization"] = `Basic ${Buffer.from(`PAT:${this.token}`).toString("base64")}`;
  }
  // This handler cannot handle 401
  canHandleAuthentication() {
    return false;
  }
  handleAuthentication() {
    return __awaiter$6(this, void 0, void 0, function* () {
      throw new Error("not implemented");
    });
  }
}
auth$1.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;
var hasRequiredOidcUtils;
function requireOidcUtils() {
  if (hasRequiredOidcUtils)
    return oidcUtils;
  hasRequiredOidcUtils = 1;
  var __awaiter2 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(oidcUtils, "__esModule", { value: true });
  oidcUtils.OidcClient = void 0;
  const http_client_12 = lib;
  const auth_12 = auth$1;
  const core_12 = requireCore();
  class OidcClient {
    static createHttpClient(allowRetry = true, maxRetry = 10) {
      const requestOptions = {
        allowRetries: allowRetry,
        maxRetries: maxRetry
      };
      return new http_client_12.HttpClient("actions/oidc-client", [new auth_12.BearerCredentialHandler(OidcClient.getRequestToken())], requestOptions);
    }
    static getRequestToken() {
      const token = process.env["ACTIONS_ID_TOKEN_REQUEST_TOKEN"];
      if (!token) {
        throw new Error("Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable");
      }
      return token;
    }
    static getIDTokenUrl() {
      const runtimeUrl = process.env["ACTIONS_ID_TOKEN_REQUEST_URL"];
      if (!runtimeUrl) {
        throw new Error("Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable");
      }
      return runtimeUrl;
    }
    static getCall(id_token_url) {
      var _a;
      return __awaiter2(this, void 0, void 0, function* () {
        const httpclient = OidcClient.createHttpClient();
        const res = yield httpclient.getJson(id_token_url).catch((error) => {
          throw new Error(`Failed to get ID Token. 
 
        Error Code : ${error.statusCode}
 
        Error Message: ${error.result.message}`);
        });
        const id_token = (_a = res.result) === null || _a === void 0 ? void 0 : _a.value;
        if (!id_token) {
          throw new Error("Response json body do not have ID Token field");
        }
        return id_token;
      });
    }
    static getIDToken(audience) {
      return __awaiter2(this, void 0, void 0, function* () {
        try {
          let id_token_url = OidcClient.getIDTokenUrl();
          if (audience) {
            const encodedAudience = encodeURIComponent(audience);
            id_token_url = `${id_token_url}&audience=${encodedAudience}`;
          }
          core_12.debug(`ID token url is ${id_token_url}`);
          const id_token = yield OidcClient.getCall(id_token_url);
          core_12.setSecret(id_token);
          return id_token;
        } catch (error) {
          throw new Error(`Error message: ${error.message}`);
        }
      });
    }
  }
  oidcUtils.OidcClient = OidcClient;
  return oidcUtils;
}
var summary = {};
var hasRequiredSummary;
function requireSummary() {
  if (hasRequiredSummary)
    return summary;
  hasRequiredSummary = 1;
  (function(exports2) {
    var __awaiter2 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.summary = exports2.markdownSummary = exports2.SUMMARY_DOCS_URL = exports2.SUMMARY_ENV_VAR = void 0;
    const os_12 = require$$1;
    const fs_12 = require$$0;
    const { access, appendFile, writeFile } = fs_12.promises;
    exports2.SUMMARY_ENV_VAR = "GITHUB_STEP_SUMMARY";
    exports2.SUMMARY_DOCS_URL = "https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary";
    class Summary {
      constructor() {
        this._buffer = "";
      }
      /**
       * Finds the summary file path from the environment, rejects if env var is not found or file does not exist
       * Also checks r/w permissions.
       *
       * @returns step summary file path
       */
      filePath() {
        return __awaiter2(this, void 0, void 0, function* () {
          if (this._filePath) {
            return this._filePath;
          }
          const pathFromEnv = process.env[exports2.SUMMARY_ENV_VAR];
          if (!pathFromEnv) {
            throw new Error(`Unable to find environment variable for $${exports2.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
          }
          try {
            yield access(pathFromEnv, fs_12.constants.R_OK | fs_12.constants.W_OK);
          } catch (_a) {
            throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`);
          }
          this._filePath = pathFromEnv;
          return this._filePath;
        });
      }
      /**
       * Wraps content in an HTML tag, adding any HTML attributes
       *
       * @param {string} tag HTML tag to wrap
       * @param {string | null} content content within the tag
       * @param {[attribute: string]: string} attrs key-value list of HTML attributes to add
       *
       * @returns {string} content wrapped in HTML element
       */
      wrap(tag, content, attrs = {}) {
        const htmlAttrs = Object.entries(attrs).map(([key, value]) => ` ${key}="${value}"`).join("");
        if (!content) {
          return `<${tag}${htmlAttrs}>`;
        }
        return `<${tag}${htmlAttrs}>${content}</${tag}>`;
      }
      /**
       * Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
       *
       * @param {SummaryWriteOptions} [options] (optional) options for write operation
       *
       * @returns {Promise<Summary>} summary instance
       */
      write(options) {
        return __awaiter2(this, void 0, void 0, function* () {
          const overwrite = !!(options === null || options === void 0 ? void 0 : options.overwrite);
          const filePath = yield this.filePath();
          const writeFunc = overwrite ? writeFile : appendFile;
          yield writeFunc(filePath, this._buffer, { encoding: "utf8" });
          return this.emptyBuffer();
        });
      }
      /**
       * Clears the summary buffer and wipes the summary file
       *
       * @returns {Summary} summary instance
       */
      clear() {
        return __awaiter2(this, void 0, void 0, function* () {
          return this.emptyBuffer().write({ overwrite: true });
        });
      }
      /**
       * Returns the current summary buffer as a string
       *
       * @returns {string} string of summary buffer
       */
      stringify() {
        return this._buffer;
      }
      /**
       * If the summary buffer is empty
       *
       * @returns {boolen} true if the buffer is empty
       */
      isEmptyBuffer() {
        return this._buffer.length === 0;
      }
      /**
       * Resets the summary buffer without writing to summary file
       *
       * @returns {Summary} summary instance
       */
      emptyBuffer() {
        this._buffer = "";
        return this;
      }
      /**
       * Adds raw text to the summary buffer
       *
       * @param {string} text content to add
       * @param {boolean} [addEOL=false] (optional) append an EOL to the raw text (default: false)
       *
       * @returns {Summary} summary instance
       */
      addRaw(text, addEOL = false) {
        this._buffer += text;
        return addEOL ? this.addEOL() : this;
      }
      /**
       * Adds the operating system-specific end-of-line marker to the buffer
       *
       * @returns {Summary} summary instance
       */
      addEOL() {
        return this.addRaw(os_12.EOL);
      }
      /**
       * Adds an HTML codeblock to the summary buffer
       *
       * @param {string} code content to render within fenced code block
       * @param {string} lang (optional) language to syntax highlight code
       *
       * @returns {Summary} summary instance
       */
      addCodeBlock(code, lang) {
        const attrs = Object.assign({}, lang && { lang });
        const element = this.wrap("pre", this.wrap("code", code), attrs);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML list to the summary buffer
       *
       * @param {string[]} items list of items to render
       * @param {boolean} [ordered=false] (optional) if the rendered list should be ordered or not (default: false)
       *
       * @returns {Summary} summary instance
       */
      addList(items, ordered = false) {
        const tag = ordered ? "ol" : "ul";
        const listItems = items.map((item) => this.wrap("li", item)).join("");
        const element = this.wrap(tag, listItems);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML table to the summary buffer
       *
       * @param {SummaryTableCell[]} rows table rows
       *
       * @returns {Summary} summary instance
       */
      addTable(rows) {
        const tableBody = rows.map((row) => {
          const cells = row.map((cell) => {
            if (typeof cell === "string") {
              return this.wrap("td", cell);
            }
            const { header, data, colspan, rowspan } = cell;
            const tag = header ? "th" : "td";
            const attrs = Object.assign(Object.assign({}, colspan && { colspan }), rowspan && { rowspan });
            return this.wrap(tag, data, attrs);
          }).join("");
          return this.wrap("tr", cells);
        }).join("");
        const element = this.wrap("table", tableBody);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds a collapsable HTML details element to the summary buffer
       *
       * @param {string} label text for the closed state
       * @param {string} content collapsable content
       *
       * @returns {Summary} summary instance
       */
      addDetails(label, content) {
        const element = this.wrap("details", this.wrap("summary", label) + content);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML image tag to the summary buffer
       *
       * @param {string} src path to the image you to embed
       * @param {string} alt text description of the image
       * @param {SummaryImageOptions} options (optional) addition image attributes
       *
       * @returns {Summary} summary instance
       */
      addImage(src, alt, options) {
        const { width, height } = options || {};
        const attrs = Object.assign(Object.assign({}, width && { width }), height && { height });
        const element = this.wrap("img", null, Object.assign({ src, alt }, attrs));
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML section heading element
       *
       * @param {string} text heading text
       * @param {number | string} [level=1] (optional) the heading level, default: 1
       *
       * @returns {Summary} summary instance
       */
      addHeading(text, level) {
        const tag = `h${level}`;
        const allowedTag = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag) ? tag : "h1";
        const element = this.wrap(allowedTag, text);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML thematic break (<hr>) to the summary buffer
       *
       * @returns {Summary} summary instance
       */
      addSeparator() {
        const element = this.wrap("hr", null);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML line break (<br>) to the summary buffer
       *
       * @returns {Summary} summary instance
       */
      addBreak() {
        const element = this.wrap("br", null);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML blockquote to the summary buffer
       *
       * @param {string} text quote text
       * @param {string} cite (optional) citation url
       *
       * @returns {Summary} summary instance
       */
      addQuote(text, cite) {
        const attrs = Object.assign({}, cite && { cite });
        const element = this.wrap("blockquote", text, attrs);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML anchor tag to the summary buffer
       *
       * @param {string} text link text/content
       * @param {string} href hyperlink
       *
       * @returns {Summary} summary instance
       */
      addLink(text, href) {
        const element = this.wrap("a", text, { href });
        return this.addRaw(element).addEOL();
      }
    }
    const _summary = new Summary();
    exports2.markdownSummary = _summary;
    exports2.summary = _summary;
  })(summary);
  return summary;
}
var pathUtils = {};
var hasRequiredPathUtils;
function requirePathUtils() {
  if (hasRequiredPathUtils)
    return pathUtils;
  hasRequiredPathUtils = 1;
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k2, k22) {
    if (k22 === void 0)
      k22 = k2;
    Object.defineProperty(o, k22, { enumerable: true, get: function() {
      return m[k2];
    } });
  } : function(o, m, k2, k22) {
    if (k22 === void 0)
      k22 = k2;
    o[k22] = m[k2];
  });
  var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k2 in mod)
        if (k2 !== "default" && Object.hasOwnProperty.call(mod, k2))
          __createBinding2(result, mod, k2);
    }
    __setModuleDefault2(result, mod);
    return result;
  };
  Object.defineProperty(pathUtils, "__esModule", { value: true });
  pathUtils.toPlatformPath = pathUtils.toWin32Path = pathUtils.toPosixPath = void 0;
  const path2 = __importStar2(require$$4$2);
  function toPosixPath(pth) {
    return pth.replace(/[\\]/g, "/");
  }
  pathUtils.toPosixPath = toPosixPath;
  function toWin32Path(pth) {
    return pth.replace(/[/]/g, "\\");
  }
  pathUtils.toWin32Path = toWin32Path;
  function toPlatformPath(pth) {
    return pth.replace(/[/\\]/g, path2.sep);
  }
  pathUtils.toPlatformPath = toPlatformPath;
  return pathUtils;
}
var hasRequiredCore;
function requireCore() {
  if (hasRequiredCore)
    return core$4;
  hasRequiredCore = 1;
  (function(exports2) {
    var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k2, k22) {
      if (k22 === void 0)
        k22 = k2;
      Object.defineProperty(o, k22, { enumerable: true, get: function() {
        return m[k2];
      } });
    } : function(o, m, k2, k22) {
      if (k22 === void 0)
        k22 = k2;
      o[k22] = m[k2];
    });
    var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k2 in mod)
          if (k2 !== "default" && Object.hasOwnProperty.call(mod, k2))
            __createBinding2(result, mod, k2);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __awaiter2 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getIDToken = exports2.getState = exports2.saveState = exports2.group = exports2.endGroup = exports2.startGroup = exports2.info = exports2.notice = exports2.warning = exports2.error = exports2.debug = exports2.isDebug = exports2.setFailed = exports2.setCommandEcho = exports2.setOutput = exports2.getBooleanInput = exports2.getMultilineInput = exports2.getInput = exports2.addPath = exports2.setSecret = exports2.exportVariable = exports2.ExitCode = void 0;
    const command_1 = command;
    const file_command_1 = fileCommand;
    const utils_12 = utils$3;
    const os2 = __importStar2(require$$1);
    const path2 = __importStar2(require$$4$2);
    const oidc_utils_1 = requireOidcUtils();
    var ExitCode;
    (function(ExitCode2) {
      ExitCode2[ExitCode2["Success"] = 0] = "Success";
      ExitCode2[ExitCode2["Failure"] = 1] = "Failure";
    })(ExitCode = exports2.ExitCode || (exports2.ExitCode = {}));
    function exportVariable(name, val) {
      const convertedVal = utils_12.toCommandValue(val);
      process.env[name] = convertedVal;
      const filePath = process.env["GITHUB_ENV"] || "";
      if (filePath) {
        return file_command_1.issueFileCommand("ENV", file_command_1.prepareKeyValueMessage(name, val));
      }
      command_1.issueCommand("set-env", { name }, convertedVal);
    }
    exports2.exportVariable = exportVariable;
    function setSecret(secret) {
      command_1.issueCommand("add-mask", {}, secret);
    }
    exports2.setSecret = setSecret;
    function addPath(inputPath) {
      const filePath = process.env["GITHUB_PATH"] || "";
      if (filePath) {
        file_command_1.issueFileCommand("PATH", inputPath);
      } else {
        command_1.issueCommand("add-path", {}, inputPath);
      }
      process.env["PATH"] = `${inputPath}${path2.delimiter}${process.env["PATH"]}`;
    }
    exports2.addPath = addPath;
    function getInput(name, options) {
      const val = process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] || "";
      if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
      }
      if (options && options.trimWhitespace === false) {
        return val;
      }
      return val.trim();
    }
    exports2.getInput = getInput;
    function getMultilineInput(name, options) {
      const inputs = getInput(name, options).split("\n").filter((x) => x !== "");
      if (options && options.trimWhitespace === false) {
        return inputs;
      }
      return inputs.map((input) => input.trim());
    }
    exports2.getMultilineInput = getMultilineInput;
    function getBooleanInput(name, options) {
      const trueValue = ["true", "True", "TRUE"];
      const falseValue = ["false", "False", "FALSE"];
      const val = getInput(name, options);
      if (trueValue.includes(val))
        return true;
      if (falseValue.includes(val))
        return false;
      throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}
Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
    }
    exports2.getBooleanInput = getBooleanInput;
    function setOutput(name, value) {
      const filePath = process.env["GITHUB_OUTPUT"] || "";
      if (filePath) {
        return file_command_1.issueFileCommand("OUTPUT", file_command_1.prepareKeyValueMessage(name, value));
      }
      process.stdout.write(os2.EOL);
      command_1.issueCommand("set-output", { name }, utils_12.toCommandValue(value));
    }
    exports2.setOutput = setOutput;
    function setCommandEcho(enabled) {
      command_1.issue("echo", enabled ? "on" : "off");
    }
    exports2.setCommandEcho = setCommandEcho;
    function setFailed(message) {
      process.exitCode = ExitCode.Failure;
      error(message);
    }
    exports2.setFailed = setFailed;
    function isDebug() {
      return process.env["RUNNER_DEBUG"] === "1";
    }
    exports2.isDebug = isDebug;
    function debug2(message) {
      command_1.issueCommand("debug", {}, message);
    }
    exports2.debug = debug2;
    function error(message, properties = {}) {
      command_1.issueCommand("error", utils_12.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    exports2.error = error;
    function warning(message, properties = {}) {
      command_1.issueCommand("warning", utils_12.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    exports2.warning = warning;
    function notice(message, properties = {}) {
      command_1.issueCommand("notice", utils_12.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    exports2.notice = notice;
    function info(message) {
      process.stdout.write(message + os2.EOL);
    }
    exports2.info = info;
    function startGroup(name) {
      command_1.issue("group", name);
    }
    exports2.startGroup = startGroup;
    function endGroup() {
      command_1.issue("endgroup");
    }
    exports2.endGroup = endGroup;
    function group(name, fn) {
      return __awaiter2(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
          result = yield fn();
        } finally {
          endGroup();
        }
        return result;
      });
    }
    exports2.group = group;
    function saveState(name, value) {
      const filePath = process.env["GITHUB_STATE"] || "";
      if (filePath) {
        return file_command_1.issueFileCommand("STATE", file_command_1.prepareKeyValueMessage(name, value));
      }
      command_1.issueCommand("save-state", { name }, utils_12.toCommandValue(value));
    }
    exports2.saveState = saveState;
    function getState(name) {
      return process.env[`STATE_${name}`] || "";
    }
    exports2.getState = getState;
    function getIDToken(aud) {
      return __awaiter2(this, void 0, void 0, function* () {
        return yield oidc_utils_1.OidcClient.getIDToken(aud);
      });
    }
    exports2.getIDToken = getIDToken;
    var summary_1 = requireSummary();
    Object.defineProperty(exports2, "summary", { enumerable: true, get: function() {
      return summary_1.summary;
    } });
    var summary_2 = requireSummary();
    Object.defineProperty(exports2, "markdownSummary", { enumerable: true, get: function() {
      return summary_2.markdownSummary;
    } });
    var path_utils_1 = requirePathUtils();
    Object.defineProperty(exports2, "toPosixPath", { enumerable: true, get: function() {
      return path_utils_1.toPosixPath;
    } });
    Object.defineProperty(exports2, "toWin32Path", { enumerable: true, get: function() {
      return path_utils_1.toWin32Path;
    } });
    Object.defineProperty(exports2, "toPlatformPath", { enumerable: true, get: function() {
      return path_utils_1.toPlatformPath;
    } });
  })(core$4);
  return core$4;
}
var coreExports = requireCore();
var github = {};
var context$1 = {};
Object.defineProperty(context$1, "__esModule", { value: true });
context$1.Context = void 0;
const fs_1$1 = require$$0;
const os_1 = require$$1;
let Context$1 = class Context {
  /**
   * Hydrate the context from the environment
   */
  constructor() {
    var _a, _b, _c;
    this.payload = {};
    if (process.env.GITHUB_EVENT_PATH) {
      if (fs_1$1.existsSync(process.env.GITHUB_EVENT_PATH)) {
        this.payload = JSON.parse(fs_1$1.readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" }));
      } else {
        const path2 = process.env.GITHUB_EVENT_PATH;
        process.stdout.write(`GITHUB_EVENT_PATH ${path2} does not exist${os_1.EOL}`);
      }
    }
    this.eventName = process.env.GITHUB_EVENT_NAME;
    this.sha = process.env.GITHUB_SHA;
    this.ref = process.env.GITHUB_REF;
    this.workflow = process.env.GITHUB_WORKFLOW;
    this.action = process.env.GITHUB_ACTION;
    this.actor = process.env.GITHUB_ACTOR;
    this.job = process.env.GITHUB_JOB;
    this.runNumber = parseInt(process.env.GITHUB_RUN_NUMBER, 10);
    this.runId = parseInt(process.env.GITHUB_RUN_ID, 10);
    this.apiUrl = (_a = process.env.GITHUB_API_URL) !== null && _a !== void 0 ? _a : `https://api.github.com`;
    this.serverUrl = (_b = process.env.GITHUB_SERVER_URL) !== null && _b !== void 0 ? _b : `https://github.com`;
    this.graphqlUrl = (_c = process.env.GITHUB_GRAPHQL_URL) !== null && _c !== void 0 ? _c : `https://api.github.com/graphql`;
  }
  get issue() {
    const payload = this.payload;
    return Object.assign(Object.assign({}, this.repo), { number: (payload.issue || payload.pull_request || payload).number });
  }
  get repo() {
    if (process.env.GITHUB_REPOSITORY) {
      const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
      return { owner, repo };
    }
    if (this.payload.repository) {
      return {
        owner: this.payload.repository.owner.login,
        repo: this.payload.repository.name
      };
    }
    throw new Error("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");
  }
};
context$1.Context = Context$1;
var utils$2 = {};
var utils$1 = {};
var __createBinding$8 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  Object.defineProperty(o, k22, { enumerable: true, get: function() {
    return m[k2];
  } });
} : function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  o[k22] = m[k2];
});
var __setModuleDefault$8 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$8 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k2 in mod)
      if (k2 !== "default" && Object.hasOwnProperty.call(mod, k2))
        __createBinding$8(result, mod, k2);
  }
  __setModuleDefault$8(result, mod);
  return result;
};
Object.defineProperty(utils$1, "__esModule", { value: true });
utils$1.getApiBaseUrl = utils$1.getProxyAgent = utils$1.getAuthString = void 0;
const httpClient = __importStar$8(lib);
function getAuthString(token, options) {
  if (!token && !options.auth) {
    throw new Error("Parameter token or opts.auth is required");
  } else if (token && options.auth) {
    throw new Error("Parameters token and opts.auth may not both be specified");
  }
  return typeof options.auth === "string" ? options.auth : `token ${token}`;
}
utils$1.getAuthString = getAuthString;
function getProxyAgent(destinationUrl) {
  const hc = new httpClient.HttpClient();
  return hc.getAgent(destinationUrl);
}
utils$1.getProxyAgent = getProxyAgent;
function getApiBaseUrl() {
  return process.env["GITHUB_API_URL"] || "https://api.github.com";
}
utils$1.getApiBaseUrl = getApiBaseUrl;
function getUserAgent() {
  if (typeof navigator === "object" && "userAgent" in navigator) {
    return navigator.userAgent;
  }
  if (typeof process === "object" && "version" in process) {
    return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
  }
  return "<environment undetectable>";
}
var beforeAfterHook = { exports: {} };
var register_1 = register$1;
function register$1(state, name, method, options) {
  if (typeof method !== "function") {
    throw new Error("method for before hook must be a function");
  }
  if (!options) {
    options = {};
  }
  if (Array.isArray(name)) {
    return name.reverse().reduce(function(callback, name2) {
      return register$1.bind(null, state, name2, callback, options);
    }, method)();
  }
  return Promise.resolve().then(function() {
    if (!state.registry[name]) {
      return method(options);
    }
    return state.registry[name].reduce(function(method2, registered) {
      return registered.hook.bind(null, method2, options);
    }, method)();
  });
}
var add = addHook$1;
function addHook$1(state, kind, name, hook2) {
  var orig = hook2;
  if (!state.registry[name]) {
    state.registry[name] = [];
  }
  if (kind === "before") {
    hook2 = function(method, options) {
      return Promise.resolve().then(orig.bind(null, options)).then(method.bind(null, options));
    };
  }
  if (kind === "after") {
    hook2 = function(method, options) {
      var result;
      return Promise.resolve().then(method.bind(null, options)).then(function(result_) {
        result = result_;
        return orig(result, options);
      }).then(function() {
        return result;
      });
    };
  }
  if (kind === "error") {
    hook2 = function(method, options) {
      return Promise.resolve().then(method.bind(null, options)).catch(function(error) {
        return orig(error, options);
      });
    };
  }
  state.registry[name].push({
    hook: hook2,
    orig
  });
}
var remove = removeHook$1;
function removeHook$1(state, name, method) {
  if (!state.registry[name]) {
    return;
  }
  var index = state.registry[name].map(function(registered) {
    return registered.orig;
  }).indexOf(method);
  if (index === -1) {
    return;
  }
  state.registry[name].splice(index, 1);
}
var register = register_1;
var addHook = add;
var removeHook = remove;
var bind = Function.bind;
var bindable = bind.bind(bind);
function bindApi(hook2, state, name) {
  var removeHookRef = bindable(removeHook, null).apply(
    null,
    name ? [state, name] : [state]
  );
  hook2.api = { remove: removeHookRef };
  hook2.remove = removeHookRef;
  ["before", "error", "after", "wrap"].forEach(function(kind) {
    var args = name ? [state, kind, name] : [state, kind];
    hook2[kind] = hook2.api[kind] = bindable(addHook, null).apply(null, args);
  });
}
function HookSingular() {
  var singularHookName = "h";
  var singularHookState = {
    registry: {}
  };
  var singularHook = register.bind(null, singularHookState, singularHookName);
  bindApi(singularHook, singularHookState, singularHookName);
  return singularHook;
}
function HookCollection() {
  var state = {
    registry: {}
  };
  var hook2 = register.bind(null, state);
  bindApi(hook2, state);
  return hook2;
}
var collectionHookDeprecationMessageDisplayed = false;
function Hook() {
  if (!collectionHookDeprecationMessageDisplayed) {
    console.warn(
      '[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4'
    );
    collectionHookDeprecationMessageDisplayed = true;
  }
  return HookCollection();
}
Hook.Singular = HookSingular.bind();
Hook.Collection = HookCollection.bind();
beforeAfterHook.exports = Hook;
beforeAfterHook.exports.Hook = Hook;
beforeAfterHook.exports.Singular = Hook.Singular;
var Collection = beforeAfterHook.exports.Collection = Hook.Collection;
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */
function isObject(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}
function isPlainObject(o) {
  var ctor, prot;
  if (isObject(o) === false)
    return false;
  ctor = o.constructor;
  if (ctor === void 0)
    return true;
  prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (prot.hasOwnProperty("isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function lowercaseKeys(object) {
  if (!object) {
    return {};
  }
  return Object.keys(object).reduce((newObj, key) => {
    newObj[key.toLowerCase()] = object[key];
    return newObj;
  }, {});
}
function mergeDeep(defaults2, options) {
  const result = Object.assign({}, defaults2);
  Object.keys(options).forEach((key) => {
    if (isPlainObject(options[key])) {
      if (!(key in defaults2))
        Object.assign(result, { [key]: options[key] });
      else
        result[key] = mergeDeep(defaults2[key], options[key]);
    } else {
      Object.assign(result, { [key]: options[key] });
    }
  });
  return result;
}
function removeUndefinedProperties(obj) {
  for (const key in obj) {
    if (obj[key] === void 0) {
      delete obj[key];
    }
  }
  return obj;
}
function merge(defaults2, route, options) {
  if (typeof route === "string") {
    let [method, url] = route.split(" ");
    options = Object.assign(url ? { method, url } : { url: method }, options);
  } else {
    options = Object.assign({}, route);
  }
  options.headers = lowercaseKeys(options.headers);
  removeUndefinedProperties(options);
  removeUndefinedProperties(options.headers);
  const mergedOptions = mergeDeep(defaults2 || {}, options);
  if (defaults2 && defaults2.mediaType.previews.length) {
    mergedOptions.mediaType.previews = defaults2.mediaType.previews.filter((preview) => !mergedOptions.mediaType.previews.includes(preview)).concat(mergedOptions.mediaType.previews);
  }
  mergedOptions.mediaType.previews = mergedOptions.mediaType.previews.map((preview) => preview.replace(/-preview/, ""));
  return mergedOptions;
}
function addQueryParameters(url, parameters) {
  const separator = /\?/.test(url) ? "&" : "?";
  const names = Object.keys(parameters);
  if (names.length === 0) {
    return url;
  }
  return url + separator + names.map((name) => {
    if (name === "q") {
      return "q=" + parameters.q.split("+").map(encodeURIComponent).join("+");
    }
    return `${name}=${encodeURIComponent(parameters[name])}`;
  }).join("&");
}
const urlVariableRegex = /\{[^}]+\}/g;
function removeNonChars(variableName) {
  return variableName.replace(/^\W+|\W+$/g, "").split(/,/);
}
function extractUrlVariableNames(url) {
  const matches = url.match(urlVariableRegex);
  if (!matches) {
    return [];
  }
  return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
}
function omit(object, keysToOmit) {
  return Object.keys(object).filter((option) => !keysToOmit.includes(option)).reduce((obj, key) => {
    obj[key] = object[key];
    return obj;
  }, {});
}
function encodeReserved(str) {
  return str.split(/(%[0-9A-Fa-f]{2})/g).map(function(part) {
    if (!/%[0-9A-Fa-f]/.test(part)) {
      part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
    }
    return part;
  }).join("");
}
function encodeUnreserved(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return "%" + c.charCodeAt(0).toString(16).toUpperCase();
  });
}
function encodeValue(operator, value, key) {
  value = operator === "+" || operator === "#" ? encodeReserved(value) : encodeUnreserved(value);
  if (key) {
    return encodeUnreserved(key) + "=" + value;
  } else {
    return value;
  }
}
function isDefined(value) {
  return value !== void 0 && value !== null;
}
function isKeyOperator(operator) {
  return operator === ";" || operator === "&" || operator === "?";
}
function getValues(context2, operator, key, modifier) {
  var value = context2[key], result = [];
  if (isDefined(value) && value !== "") {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      value = value.toString();
      if (modifier && modifier !== "*") {
        value = value.substring(0, parseInt(modifier, 10));
      }
      result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
    } else {
      if (modifier === "*") {
        if (Array.isArray(value)) {
          value.filter(isDefined).forEach(function(value2) {
            result.push(encodeValue(operator, value2, isKeyOperator(operator) ? key : ""));
          });
        } else {
          Object.keys(value).forEach(function(k2) {
            if (isDefined(value[k2])) {
              result.push(encodeValue(operator, value[k2], k2));
            }
          });
        }
      } else {
        const tmp2 = [];
        if (Array.isArray(value)) {
          value.filter(isDefined).forEach(function(value2) {
            tmp2.push(encodeValue(operator, value2));
          });
        } else {
          Object.keys(value).forEach(function(k2) {
            if (isDefined(value[k2])) {
              tmp2.push(encodeUnreserved(k2));
              tmp2.push(encodeValue(operator, value[k2].toString()));
            }
          });
        }
        if (isKeyOperator(operator)) {
          result.push(encodeUnreserved(key) + "=" + tmp2.join(","));
        } else if (tmp2.length !== 0) {
          result.push(tmp2.join(","));
        }
      }
    }
  } else {
    if (operator === ";") {
      if (isDefined(value)) {
        result.push(encodeUnreserved(key));
      }
    } else if (value === "" && (operator === "&" || operator === "?")) {
      result.push(encodeUnreserved(key) + "=");
    } else if (value === "") {
      result.push("");
    }
  }
  return result;
}
function parseUrl(template) {
  return {
    expand: expand.bind(null, template)
  };
}
function expand(template, context2) {
  var operators = ["+", "#", ".", "/", ";", "?", "&"];
  return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function(_, expression, literal) {
    if (expression) {
      let operator = "";
      const values = [];
      if (operators.indexOf(expression.charAt(0)) !== -1) {
        operator = expression.charAt(0);
        expression = expression.substr(1);
      }
      expression.split(/,/g).forEach(function(variable) {
        var tmp2 = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
        values.push(getValues(context2, operator, tmp2[1], tmp2[2] || tmp2[3]));
      });
      if (operator && operator !== "+") {
        var separator = ",";
        if (operator === "?") {
          separator = "&";
        } else if (operator !== "#") {
          separator = operator;
        }
        return (values.length !== 0 ? operator : "") + values.join(separator);
      } else {
        return values.join(",");
      }
    } else {
      return encodeReserved(literal);
    }
  });
}
function parse(options) {
  let method = options.method.toUpperCase();
  let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
  let headers = Object.assign({}, options.headers);
  let body;
  let parameters = omit(options, [
    "method",
    "baseUrl",
    "url",
    "headers",
    "request",
    "mediaType"
  ]);
  const urlVariableNames = extractUrlVariableNames(url);
  url = parseUrl(url).expand(parameters);
  if (!/^http/.test(url)) {
    url = options.baseUrl + url;
  }
  const omittedParameters = Object.keys(options).filter((option) => urlVariableNames.includes(option)).concat("baseUrl");
  const remainingParameters = omit(parameters, omittedParameters);
  const isBinaryRequest = /application\/octet-stream/i.test(headers.accept);
  if (!isBinaryRequest) {
    if (options.mediaType.format) {
      headers.accept = headers.accept.split(/,/).map((preview) => preview.replace(/application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/, `application/vnd$1$2.${options.mediaType.format}`)).join(",");
    }
    if (options.mediaType.previews.length) {
      const previewsFromAcceptHeader = headers.accept.match(/[\w-]+(?=-preview)/g) || [];
      headers.accept = previewsFromAcceptHeader.concat(options.mediaType.previews).map((preview) => {
        const format = options.mediaType.format ? `.${options.mediaType.format}` : "+json";
        return `application/vnd.github.${preview}-preview${format}`;
      }).join(",");
    }
  }
  if (["GET", "HEAD"].includes(method)) {
    url = addQueryParameters(url, remainingParameters);
  } else {
    if ("data" in remainingParameters) {
      body = remainingParameters.data;
    } else {
      if (Object.keys(remainingParameters).length) {
        body = remainingParameters;
      } else {
        headers["content-length"] = 0;
      }
    }
  }
  if (!headers["content-type"] && typeof body !== "undefined") {
    headers["content-type"] = "application/json; charset=utf-8";
  }
  if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
    body = "";
  }
  return Object.assign({ method, url, headers }, typeof body !== "undefined" ? { body } : null, options.request ? { request: options.request } : null);
}
function endpointWithDefaults(defaults2, route, options) {
  return parse(merge(defaults2, route, options));
}
function withDefaults$2(oldDefaults, newDefaults) {
  const DEFAULTS2 = merge(oldDefaults, newDefaults);
  const endpoint2 = endpointWithDefaults.bind(null, DEFAULTS2);
  return Object.assign(endpoint2, {
    DEFAULTS: DEFAULTS2,
    defaults: withDefaults$2.bind(null, DEFAULTS2),
    merge: merge.bind(null, DEFAULTS2),
    parse
  });
}
const VERSION$5 = "6.0.12";
const userAgent = `octokit-endpoint.js/${VERSION$5} ${getUserAgent()}`;
const DEFAULTS = {
  method: "GET",
  baseUrl: "https://api.github.com",
  headers: {
    accept: "application/vnd.github.v3+json",
    "user-agent": userAgent
  },
  mediaType: {
    format: "",
    previews: []
  }
};
const endpoint = withDefaults$2(null, DEFAULTS);
class Deprecation extends Error {
  constructor(message) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = "Deprecation";
  }
}
var once$2 = { exports: {} };
var wrappy_1 = wrappy$1;
function wrappy$1(fn, cb) {
  if (fn && cb)
    return wrappy$1(fn)(cb);
  if (typeof fn !== "function")
    throw new TypeError("need wrapper function");
  Object.keys(fn).forEach(function(k2) {
    wrapper[k2] = fn[k2];
  });
  return wrapper;
  function wrapper() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    var ret = fn.apply(this, args);
    var cb2 = args[args.length - 1];
    if (typeof ret === "function" && ret !== cb2) {
      Object.keys(cb2).forEach(function(k2) {
        ret[k2] = cb2[k2];
      });
    }
    return ret;
  }
}
var wrappy = wrappy_1;
once$2.exports = wrappy(once);
once$2.exports.strict = wrappy(onceStrict);
once.proto = once(function() {
  Object.defineProperty(Function.prototype, "once", {
    value: function() {
      return once(this);
    },
    configurable: true
  });
  Object.defineProperty(Function.prototype, "onceStrict", {
    value: function() {
      return onceStrict(this);
    },
    configurable: true
  });
});
function once(fn) {
  var f = function() {
    if (f.called)
      return f.value;
    f.called = true;
    return f.value = fn.apply(this, arguments);
  };
  f.called = false;
  return f;
}
function onceStrict(fn) {
  var f = function() {
    if (f.called)
      throw new Error(f.onceError);
    f.called = true;
    return f.value = fn.apply(this, arguments);
  };
  var name = fn.name || "Function wrapped with `once`";
  f.onceError = name + " shouldn't be called more than once";
  f.called = false;
  return f;
}
var onceExports = once$2.exports;
const once$1 = /* @__PURE__ */ getDefaultExportFromCjs(onceExports);
const logOnceCode = once$1((deprecation) => console.warn(deprecation));
const logOnceHeaders = once$1((deprecation) => console.warn(deprecation));
class RequestError extends Error {
  constructor(message, statusCode, options) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = "HttpError";
    this.status = statusCode;
    let headers;
    if ("headers" in options && typeof options.headers !== "undefined") {
      headers = options.headers;
    }
    if ("response" in options) {
      this.response = options.response;
      headers = options.response.headers;
    }
    const requestCopy = Object.assign({}, options.request);
    if (options.request.headers.authorization) {
      requestCopy.headers = Object.assign({}, options.request.headers, {
        authorization: options.request.headers.authorization.replace(/ .*$/, " [REDACTED]")
      });
    }
    requestCopy.url = requestCopy.url.replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]").replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
    this.request = requestCopy;
    Object.defineProperty(this, "code", {
      get() {
        logOnceCode(new Deprecation("[@octokit/request-error] `error.code` is deprecated, use `error.status`."));
        return statusCode;
      }
    });
    Object.defineProperty(this, "headers", {
      get() {
        logOnceHeaders(new Deprecation("[@octokit/request-error] `error.headers` is deprecated, use `error.response.headers`."));
        return headers || {};
      }
    });
  }
}
const VERSION$4 = "5.6.3";
function getBufferResponse(response) {
  return response.arrayBuffer();
}
function fetchWrapper(requestOptions) {
  const log = requestOptions.request && requestOptions.request.log ? requestOptions.request.log : console;
  if (isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body)) {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }
  let headers = {};
  let status;
  let url;
  const fetch$1 = requestOptions.request && requestOptions.request.fetch || fetch;
  return fetch$1(requestOptions.url, Object.assign(
    {
      method: requestOptions.method,
      body: requestOptions.body,
      headers: requestOptions.headers,
      redirect: requestOptions.redirect
    },
    // `requestOptions.request.agent` type is incompatible
    // see https://github.com/octokit/types.ts/pull/264
    requestOptions.request
  )).then(async (response) => {
    url = response.url;
    status = response.status;
    for (const keyAndValue of response.headers) {
      headers[keyAndValue[0]] = keyAndValue[1];
    }
    if ("deprecation" in headers) {
      const matches = headers.link && headers.link.match(/<([^>]+)>; rel="deprecation"/);
      const deprecationLink = matches && matches.pop();
      log.warn(`[@octokit/request] "${requestOptions.method} ${requestOptions.url}" is deprecated. It is scheduled to be removed on ${headers.sunset}${deprecationLink ? `. See ${deprecationLink}` : ""}`);
    }
    if (status === 204 || status === 205) {
      return;
    }
    if (requestOptions.method === "HEAD") {
      if (status < 400) {
        return;
      }
      throw new RequestError(response.statusText, status, {
        response: {
          url,
          status,
          headers,
          data: void 0
        },
        request: requestOptions
      });
    }
    if (status === 304) {
      throw new RequestError("Not modified", status, {
        response: {
          url,
          status,
          headers,
          data: await getResponseData(response)
        },
        request: requestOptions
      });
    }
    if (status >= 400) {
      const data = await getResponseData(response);
      const error = new RequestError(toErrorMessage(data), status, {
        response: {
          url,
          status,
          headers,
          data
        },
        request: requestOptions
      });
      throw error;
    }
    return getResponseData(response);
  }).then((data) => {
    return {
      status,
      url,
      headers,
      data
    };
  }).catch((error) => {
    if (error instanceof RequestError)
      throw error;
    throw new RequestError(error.message, 500, {
      request: requestOptions
    });
  });
}
async function getResponseData(response) {
  const contentType = response.headers.get("content-type");
  if (/application\/json/.test(contentType)) {
    return response.json();
  }
  if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
    return response.text();
  }
  return getBufferResponse(response);
}
function toErrorMessage(data) {
  if (typeof data === "string")
    return data;
  if ("message" in data) {
    if (Array.isArray(data.errors)) {
      return `${data.message}: ${data.errors.map(JSON.stringify).join(", ")}`;
    }
    return data.message;
  }
  return `Unknown error: ${JSON.stringify(data)}`;
}
function withDefaults$1(oldEndpoint, newDefaults) {
  const endpoint2 = oldEndpoint.defaults(newDefaults);
  const newApi = function(route, parameters) {
    const endpointOptions = endpoint2.merge(route, parameters);
    if (!endpointOptions.request || !endpointOptions.request.hook) {
      return fetchWrapper(endpoint2.parse(endpointOptions));
    }
    const request2 = (route2, parameters2) => {
      return fetchWrapper(endpoint2.parse(endpoint2.merge(route2, parameters2)));
    };
    Object.assign(request2, {
      endpoint: endpoint2,
      defaults: withDefaults$1.bind(null, endpoint2)
    });
    return endpointOptions.request.hook(request2, endpointOptions);
  };
  return Object.assign(newApi, {
    endpoint: endpoint2,
    defaults: withDefaults$1.bind(null, endpoint2)
  });
}
const request = withDefaults$1(endpoint, {
  headers: {
    "user-agent": `octokit-request.js/${VERSION$4} ${getUserAgent()}`
  }
});
const VERSION$3 = "4.8.0";
function _buildMessageForResponseErrors(data) {
  return `Request failed due to following response errors:
` + data.errors.map((e) => ` - ${e.message}`).join("\n");
}
class GraphqlResponseError extends Error {
  constructor(request2, headers, response) {
    super(_buildMessageForResponseErrors(response));
    this.request = request2;
    this.headers = headers;
    this.response = response;
    this.name = "GraphqlResponseError";
    this.errors = response.errors;
    this.data = response.data;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
const NON_VARIABLE_OPTIONS = [
  "method",
  "baseUrl",
  "url",
  "headers",
  "request",
  "query",
  "mediaType"
];
const FORBIDDEN_VARIABLE_OPTIONS = ["query", "method", "url"];
const GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
function graphql(request2, query, options) {
  if (options) {
    if (typeof query === "string" && "query" in options) {
      return Promise.reject(new Error(`[@octokit/graphql] "query" cannot be used as variable name`));
    }
    for (const key in options) {
      if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key))
        continue;
      return Promise.reject(new Error(`[@octokit/graphql] "${key}" cannot be used as variable name`));
    }
  }
  const parsedOptions = typeof query === "string" ? Object.assign({ query }, options) : query;
  const requestOptions = Object.keys(parsedOptions).reduce((result, key) => {
    if (NON_VARIABLE_OPTIONS.includes(key)) {
      result[key] = parsedOptions[key];
      return result;
    }
    if (!result.variables) {
      result.variables = {};
    }
    result.variables[key] = parsedOptions[key];
    return result;
  }, {});
  const baseUrl = parsedOptions.baseUrl || request2.endpoint.DEFAULTS.baseUrl;
  if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) {
    requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, "/api/graphql");
  }
  return request2(requestOptions).then((response) => {
    if (response.data.errors) {
      const headers = {};
      for (const key of Object.keys(response.headers)) {
        headers[key] = response.headers[key];
      }
      throw new GraphqlResponseError(requestOptions, headers, response.data);
    }
    return response.data.data;
  });
}
function withDefaults(request$1, newDefaults) {
  const newRequest = request$1.defaults(newDefaults);
  const newApi = (query, options) => {
    return graphql(newRequest, query, options);
  };
  return Object.assign(newApi, {
    defaults: withDefaults.bind(null, newRequest),
    endpoint: request.endpoint
  });
}
withDefaults(request, {
  headers: {
    "user-agent": `octokit-graphql.js/${VERSION$3} ${getUserAgent()}`
  },
  method: "POST",
  url: "/graphql"
});
function withCustomRequest(customRequest) {
  return withDefaults(customRequest, {
    method: "POST",
    url: "/graphql"
  });
}
const REGEX_IS_INSTALLATION_LEGACY = /^v1\./;
const REGEX_IS_INSTALLATION = /^ghs_/;
const REGEX_IS_USER_TO_SERVER = /^ghu_/;
async function auth(token) {
  const isApp = token.split(/\./).length === 3;
  const isInstallation = REGEX_IS_INSTALLATION_LEGACY.test(token) || REGEX_IS_INSTALLATION.test(token);
  const isUserToServer = REGEX_IS_USER_TO_SERVER.test(token);
  const tokenType = isApp ? "app" : isInstallation ? "installation" : isUserToServer ? "user-to-server" : "oauth";
  return {
    type: "token",
    token,
    tokenType
  };
}
function withAuthorizationPrefix(token) {
  if (token.split(/\./).length === 3) {
    return `bearer ${token}`;
  }
  return `token ${token}`;
}
async function hook(token, request2, route, parameters) {
  const endpoint2 = request2.endpoint.merge(route, parameters);
  endpoint2.headers.authorization = withAuthorizationPrefix(token);
  return request2(endpoint2);
}
const createTokenAuth = function createTokenAuth2(token) {
  if (!token) {
    throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
  }
  if (typeof token !== "string") {
    throw new Error("[@octokit/auth-token] Token passed to createTokenAuth is not a string");
  }
  token = token.replace(/^(token|bearer) +/i, "");
  return Object.assign(auth.bind(null, token), {
    hook: hook.bind(null, token)
  });
};
const VERSION$2 = "3.6.0";
class Octokit {
  constructor(options = {}) {
    const hook2 = new Collection();
    const requestDefaults = {
      baseUrl: request.endpoint.DEFAULTS.baseUrl,
      headers: {},
      request: Object.assign({}, options.request, {
        // @ts-ignore internal usage only, no need to type
        hook: hook2.bind(null, "request")
      }),
      mediaType: {
        previews: [],
        format: ""
      }
    };
    requestDefaults.headers["user-agent"] = [
      options.userAgent,
      `octokit-core.js/${VERSION$2} ${getUserAgent()}`
    ].filter(Boolean).join(" ");
    if (options.baseUrl) {
      requestDefaults.baseUrl = options.baseUrl;
    }
    if (options.previews) {
      requestDefaults.mediaType.previews = options.previews;
    }
    if (options.timeZone) {
      requestDefaults.headers["time-zone"] = options.timeZone;
    }
    this.request = request.defaults(requestDefaults);
    this.graphql = withCustomRequest(this.request).defaults(requestDefaults);
    this.log = Object.assign({
      debug: () => {
      },
      info: () => {
      },
      warn: console.warn.bind(console),
      error: console.error.bind(console)
    }, options.log);
    this.hook = hook2;
    if (!options.authStrategy) {
      if (!options.auth) {
        this.auth = async () => ({
          type: "unauthenticated"
        });
      } else {
        const auth2 = createTokenAuth(options.auth);
        hook2.wrap("request", auth2.hook);
        this.auth = auth2;
      }
    } else {
      const { authStrategy, ...otherOptions } = options;
      const auth2 = authStrategy(Object.assign({
        request: this.request,
        log: this.log,
        // we pass the current octokit instance as well as its constructor options
        // to allow for authentication strategies that return a new octokit instance
        // that shares the same internal state as the current one. The original
        // requirement for this was the "event-octokit" authentication strategy
        // of https://github.com/probot/octokit-auth-probot.
        octokit: this,
        octokitOptions: otherOptions
      }, options.auth));
      hook2.wrap("request", auth2.hook);
      this.auth = auth2;
    }
    const classConstructor = this.constructor;
    classConstructor.plugins.forEach((plugin) => {
      Object.assign(this, plugin(this, options));
    });
  }
  static defaults(defaults2) {
    const OctokitWithDefaults = class extends this {
      constructor(...args) {
        const options = args[0] || {};
        if (typeof defaults2 === "function") {
          super(defaults2(options));
          return;
        }
        super(Object.assign({}, defaults2, options, options.userAgent && defaults2.userAgent ? {
          userAgent: `${options.userAgent} ${defaults2.userAgent}`
        } : null));
      }
    };
    return OctokitWithDefaults;
  }
  /**
   * Attach a plugin (or many) to your Octokit instance.
   *
   * @example
   * const API = Octokit.plugin(plugin1, plugin2, plugin3, ...)
   */
  static plugin(...newPlugins) {
    var _a;
    const currentPlugins = this.plugins;
    const NewOctokit = (_a = class extends this {
    }, _a.plugins = currentPlugins.concat(newPlugins.filter((plugin) => !currentPlugins.includes(plugin))), _a);
    return NewOctokit;
  }
}
Octokit.VERSION = VERSION$2;
Octokit.plugins = [];
const distWeb$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Octokit
}, Symbol.toStringTag, { value: "Module" }));
const require$$2 = /* @__PURE__ */ getAugmentedNamespace(distWeb$2);
const Endpoints = {
  actions: {
    addCustomLabelsToSelfHostedRunnerForOrg: [
      "POST /orgs/{org}/actions/runners/{runner_id}/labels"
    ],
    addCustomLabelsToSelfHostedRunnerForRepo: [
      "POST /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"
    ],
    addSelectedRepoToOrgSecret: [
      "PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"
    ],
    approveWorkflowRun: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve"
    ],
    cancelWorkflowRun: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel"
    ],
    createOrUpdateEnvironmentSecret: [
      "PUT /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}"
    ],
    createOrUpdateOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}"],
    createOrUpdateRepoSecret: [
      "PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}"
    ],
    createRegistrationTokenForOrg: [
      "POST /orgs/{org}/actions/runners/registration-token"
    ],
    createRegistrationTokenForRepo: [
      "POST /repos/{owner}/{repo}/actions/runners/registration-token"
    ],
    createRemoveTokenForOrg: ["POST /orgs/{org}/actions/runners/remove-token"],
    createRemoveTokenForRepo: [
      "POST /repos/{owner}/{repo}/actions/runners/remove-token"
    ],
    createWorkflowDispatch: [
      "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"
    ],
    deleteActionsCacheById: [
      "DELETE /repos/{owner}/{repo}/actions/caches/{cache_id}"
    ],
    deleteActionsCacheByKey: [
      "DELETE /repos/{owner}/{repo}/actions/caches{?key,ref}"
    ],
    deleteArtifact: [
      "DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"
    ],
    deleteEnvironmentSecret: [
      "DELETE /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}"
    ],
    deleteOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}"],
    deleteRepoSecret: [
      "DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}"
    ],
    deleteSelfHostedRunnerFromOrg: [
      "DELETE /orgs/{org}/actions/runners/{runner_id}"
    ],
    deleteSelfHostedRunnerFromRepo: [
      "DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}"
    ],
    deleteWorkflowRun: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}"],
    deleteWorkflowRunLogs: [
      "DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs"
    ],
    disableSelectedRepositoryGithubActionsOrganization: [
      "DELETE /orgs/{org}/actions/permissions/repositories/{repository_id}"
    ],
    disableWorkflow: [
      "PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable"
    ],
    downloadArtifact: [
      "GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}"
    ],
    downloadJobLogsForWorkflowRun: [
      "GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs"
    ],
    downloadWorkflowRunAttemptLogs: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/logs"
    ],
    downloadWorkflowRunLogs: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs"
    ],
    enableSelectedRepositoryGithubActionsOrganization: [
      "PUT /orgs/{org}/actions/permissions/repositories/{repository_id}"
    ],
    enableWorkflow: [
      "PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable"
    ],
    getActionsCacheList: ["GET /repos/{owner}/{repo}/actions/caches"],
    getActionsCacheUsage: ["GET /repos/{owner}/{repo}/actions/cache/usage"],
    getActionsCacheUsageByRepoForOrg: [
      "GET /orgs/{org}/actions/cache/usage-by-repository"
    ],
    getActionsCacheUsageForEnterprise: [
      "GET /enterprises/{enterprise}/actions/cache/usage"
    ],
    getActionsCacheUsageForOrg: ["GET /orgs/{org}/actions/cache/usage"],
    getAllowedActionsOrganization: [
      "GET /orgs/{org}/actions/permissions/selected-actions"
    ],
    getAllowedActionsRepository: [
      "GET /repos/{owner}/{repo}/actions/permissions/selected-actions"
    ],
    getArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
    getEnvironmentPublicKey: [
      "GET /repositories/{repository_id}/environments/{environment_name}/secrets/public-key"
    ],
    getEnvironmentSecret: [
      "GET /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}"
    ],
    getGithubActionsDefaultWorkflowPermissionsEnterprise: [
      "GET /enterprises/{enterprise}/actions/permissions/workflow"
    ],
    getGithubActionsDefaultWorkflowPermissionsOrganization: [
      "GET /orgs/{org}/actions/permissions/workflow"
    ],
    getGithubActionsDefaultWorkflowPermissionsRepository: [
      "GET /repos/{owner}/{repo}/actions/permissions/workflow"
    ],
    getGithubActionsPermissionsOrganization: [
      "GET /orgs/{org}/actions/permissions"
    ],
    getGithubActionsPermissionsRepository: [
      "GET /repos/{owner}/{repo}/actions/permissions"
    ],
    getJobForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}"],
    getOrgPublicKey: ["GET /orgs/{org}/actions/secrets/public-key"],
    getOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}"],
    getPendingDeploymentsForRun: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"
    ],
    getRepoPermissions: [
      "GET /repos/{owner}/{repo}/actions/permissions",
      {},
      { renamed: ["actions", "getGithubActionsPermissionsRepository"] }
    ],
    getRepoPublicKey: ["GET /repos/{owner}/{repo}/actions/secrets/public-key"],
    getRepoSecret: ["GET /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
    getReviewsForRun: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals"
    ],
    getSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}"],
    getSelfHostedRunnerForRepo: [
      "GET /repos/{owner}/{repo}/actions/runners/{runner_id}"
    ],
    getWorkflow: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}"],
    getWorkflowAccessToRepository: [
      "GET /repos/{owner}/{repo}/actions/permissions/access"
    ],
    getWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}"],
    getWorkflowRunAttempt: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}"
    ],
    getWorkflowRunUsage: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing"
    ],
    getWorkflowUsage: [
      "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing"
    ],
    listArtifactsForRepo: ["GET /repos/{owner}/{repo}/actions/artifacts"],
    listEnvironmentSecrets: [
      "GET /repositories/{repository_id}/environments/{environment_name}/secrets"
    ],
    listJobsForWorkflowRun: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"
    ],
    listJobsForWorkflowRunAttempt: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs"
    ],
    listLabelsForSelfHostedRunnerForOrg: [
      "GET /orgs/{org}/actions/runners/{runner_id}/labels"
    ],
    listLabelsForSelfHostedRunnerForRepo: [
      "GET /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"
    ],
    listOrgSecrets: ["GET /orgs/{org}/actions/secrets"],
    listRepoSecrets: ["GET /repos/{owner}/{repo}/actions/secrets"],
    listRepoWorkflows: ["GET /repos/{owner}/{repo}/actions/workflows"],
    listRunnerApplicationsForOrg: ["GET /orgs/{org}/actions/runners/downloads"],
    listRunnerApplicationsForRepo: [
      "GET /repos/{owner}/{repo}/actions/runners/downloads"
    ],
    listSelectedReposForOrgSecret: [
      "GET /orgs/{org}/actions/secrets/{secret_name}/repositories"
    ],
    listSelectedRepositoriesEnabledGithubActionsOrganization: [
      "GET /orgs/{org}/actions/permissions/repositories"
    ],
    listSelfHostedRunnersForOrg: ["GET /orgs/{org}/actions/runners"],
    listSelfHostedRunnersForRepo: ["GET /repos/{owner}/{repo}/actions/runners"],
    listWorkflowRunArtifacts: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"
    ],
    listWorkflowRuns: [
      "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"
    ],
    listWorkflowRunsForRepo: ["GET /repos/{owner}/{repo}/actions/runs"],
    reRunJobForWorkflowRun: [
      "POST /repos/{owner}/{repo}/actions/jobs/{job_id}/rerun"
    ],
    reRunWorkflow: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun"],
    reRunWorkflowFailedJobs: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun-failed-jobs"
    ],
    removeAllCustomLabelsFromSelfHostedRunnerForOrg: [
      "DELETE /orgs/{org}/actions/runners/{runner_id}/labels"
    ],
    removeAllCustomLabelsFromSelfHostedRunnerForRepo: [
      "DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"
    ],
    removeCustomLabelFromSelfHostedRunnerForOrg: [
      "DELETE /orgs/{org}/actions/runners/{runner_id}/labels/{name}"
    ],
    removeCustomLabelFromSelfHostedRunnerForRepo: [
      "DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels/{name}"
    ],
    removeSelectedRepoFromOrgSecret: [
      "DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"
    ],
    reviewPendingDeploymentsForRun: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"
    ],
    setAllowedActionsOrganization: [
      "PUT /orgs/{org}/actions/permissions/selected-actions"
    ],
    setAllowedActionsRepository: [
      "PUT /repos/{owner}/{repo}/actions/permissions/selected-actions"
    ],
    setCustomLabelsForSelfHostedRunnerForOrg: [
      "PUT /orgs/{org}/actions/runners/{runner_id}/labels"
    ],
    setCustomLabelsForSelfHostedRunnerForRepo: [
      "PUT /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"
    ],
    setGithubActionsDefaultWorkflowPermissionsEnterprise: [
      "PUT /enterprises/{enterprise}/actions/permissions/workflow"
    ],
    setGithubActionsDefaultWorkflowPermissionsOrganization: [
      "PUT /orgs/{org}/actions/permissions/workflow"
    ],
    setGithubActionsDefaultWorkflowPermissionsRepository: [
      "PUT /repos/{owner}/{repo}/actions/permissions/workflow"
    ],
    setGithubActionsPermissionsOrganization: [
      "PUT /orgs/{org}/actions/permissions"
    ],
    setGithubActionsPermissionsRepository: [
      "PUT /repos/{owner}/{repo}/actions/permissions"
    ],
    setSelectedReposForOrgSecret: [
      "PUT /orgs/{org}/actions/secrets/{secret_name}/repositories"
    ],
    setSelectedRepositoriesEnabledGithubActionsOrganization: [
      "PUT /orgs/{org}/actions/permissions/repositories"
    ],
    setWorkflowAccessToRepository: [
      "PUT /repos/{owner}/{repo}/actions/permissions/access"
    ]
  },
  activity: {
    checkRepoIsStarredByAuthenticatedUser: ["GET /user/starred/{owner}/{repo}"],
    deleteRepoSubscription: ["DELETE /repos/{owner}/{repo}/subscription"],
    deleteThreadSubscription: [
      "DELETE /notifications/threads/{thread_id}/subscription"
    ],
    getFeeds: ["GET /feeds"],
    getRepoSubscription: ["GET /repos/{owner}/{repo}/subscription"],
    getThread: ["GET /notifications/threads/{thread_id}"],
    getThreadSubscriptionForAuthenticatedUser: [
      "GET /notifications/threads/{thread_id}/subscription"
    ],
    listEventsForAuthenticatedUser: ["GET /users/{username}/events"],
    listNotificationsForAuthenticatedUser: ["GET /notifications"],
    listOrgEventsForAuthenticatedUser: [
      "GET /users/{username}/events/orgs/{org}"
    ],
    listPublicEvents: ["GET /events"],
    listPublicEventsForRepoNetwork: ["GET /networks/{owner}/{repo}/events"],
    listPublicEventsForUser: ["GET /users/{username}/events/public"],
    listPublicOrgEvents: ["GET /orgs/{org}/events"],
    listReceivedEventsForUser: ["GET /users/{username}/received_events"],
    listReceivedPublicEventsForUser: [
      "GET /users/{username}/received_events/public"
    ],
    listRepoEvents: ["GET /repos/{owner}/{repo}/events"],
    listRepoNotificationsForAuthenticatedUser: [
      "GET /repos/{owner}/{repo}/notifications"
    ],
    listReposStarredByAuthenticatedUser: ["GET /user/starred"],
    listReposStarredByUser: ["GET /users/{username}/starred"],
    listReposWatchedByUser: ["GET /users/{username}/subscriptions"],
    listStargazersForRepo: ["GET /repos/{owner}/{repo}/stargazers"],
    listWatchedReposForAuthenticatedUser: ["GET /user/subscriptions"],
    listWatchersForRepo: ["GET /repos/{owner}/{repo}/subscribers"],
    markNotificationsAsRead: ["PUT /notifications"],
    markRepoNotificationsAsRead: ["PUT /repos/{owner}/{repo}/notifications"],
    markThreadAsRead: ["PATCH /notifications/threads/{thread_id}"],
    setRepoSubscription: ["PUT /repos/{owner}/{repo}/subscription"],
    setThreadSubscription: [
      "PUT /notifications/threads/{thread_id}/subscription"
    ],
    starRepoForAuthenticatedUser: ["PUT /user/starred/{owner}/{repo}"],
    unstarRepoForAuthenticatedUser: ["DELETE /user/starred/{owner}/{repo}"]
  },
  apps: {
    addRepoToInstallation: [
      "PUT /user/installations/{installation_id}/repositories/{repository_id}",
      {},
      { renamed: ["apps", "addRepoToInstallationForAuthenticatedUser"] }
    ],
    addRepoToInstallationForAuthenticatedUser: [
      "PUT /user/installations/{installation_id}/repositories/{repository_id}"
    ],
    checkToken: ["POST /applications/{client_id}/token"],
    createFromManifest: ["POST /app-manifests/{code}/conversions"],
    createInstallationAccessToken: [
      "POST /app/installations/{installation_id}/access_tokens"
    ],
    deleteAuthorization: ["DELETE /applications/{client_id}/grant"],
    deleteInstallation: ["DELETE /app/installations/{installation_id}"],
    deleteToken: ["DELETE /applications/{client_id}/token"],
    getAuthenticated: ["GET /app"],
    getBySlug: ["GET /apps/{app_slug}"],
    getInstallation: ["GET /app/installations/{installation_id}"],
    getOrgInstallation: ["GET /orgs/{org}/installation"],
    getRepoInstallation: ["GET /repos/{owner}/{repo}/installation"],
    getSubscriptionPlanForAccount: [
      "GET /marketplace_listing/accounts/{account_id}"
    ],
    getSubscriptionPlanForAccountStubbed: [
      "GET /marketplace_listing/stubbed/accounts/{account_id}"
    ],
    getUserInstallation: ["GET /users/{username}/installation"],
    getWebhookConfigForApp: ["GET /app/hook/config"],
    getWebhookDelivery: ["GET /app/hook/deliveries/{delivery_id}"],
    listAccountsForPlan: ["GET /marketplace_listing/plans/{plan_id}/accounts"],
    listAccountsForPlanStubbed: [
      "GET /marketplace_listing/stubbed/plans/{plan_id}/accounts"
    ],
    listInstallationReposForAuthenticatedUser: [
      "GET /user/installations/{installation_id}/repositories"
    ],
    listInstallations: ["GET /app/installations"],
    listInstallationsForAuthenticatedUser: ["GET /user/installations"],
    listPlans: ["GET /marketplace_listing/plans"],
    listPlansStubbed: ["GET /marketplace_listing/stubbed/plans"],
    listReposAccessibleToInstallation: ["GET /installation/repositories"],
    listSubscriptionsForAuthenticatedUser: ["GET /user/marketplace_purchases"],
    listSubscriptionsForAuthenticatedUserStubbed: [
      "GET /user/marketplace_purchases/stubbed"
    ],
    listWebhookDeliveries: ["GET /app/hook/deliveries"],
    redeliverWebhookDelivery: [
      "POST /app/hook/deliveries/{delivery_id}/attempts"
    ],
    removeRepoFromInstallation: [
      "DELETE /user/installations/{installation_id}/repositories/{repository_id}",
      {},
      { renamed: ["apps", "removeRepoFromInstallationForAuthenticatedUser"] }
    ],
    removeRepoFromInstallationForAuthenticatedUser: [
      "DELETE /user/installations/{installation_id}/repositories/{repository_id}"
    ],
    resetToken: ["PATCH /applications/{client_id}/token"],
    revokeInstallationAccessToken: ["DELETE /installation/token"],
    scopeToken: ["POST /applications/{client_id}/token/scoped"],
    suspendInstallation: ["PUT /app/installations/{installation_id}/suspended"],
    unsuspendInstallation: [
      "DELETE /app/installations/{installation_id}/suspended"
    ],
    updateWebhookConfigForApp: ["PATCH /app/hook/config"]
  },
  billing: {
    getGithubActionsBillingOrg: ["GET /orgs/{org}/settings/billing/actions"],
    getGithubActionsBillingUser: [
      "GET /users/{username}/settings/billing/actions"
    ],
    getGithubAdvancedSecurityBillingGhe: [
      "GET /enterprises/{enterprise}/settings/billing/advanced-security"
    ],
    getGithubAdvancedSecurityBillingOrg: [
      "GET /orgs/{org}/settings/billing/advanced-security"
    ],
    getGithubPackagesBillingOrg: ["GET /orgs/{org}/settings/billing/packages"],
    getGithubPackagesBillingUser: [
      "GET /users/{username}/settings/billing/packages"
    ],
    getSharedStorageBillingOrg: [
      "GET /orgs/{org}/settings/billing/shared-storage"
    ],
    getSharedStorageBillingUser: [
      "GET /users/{username}/settings/billing/shared-storage"
    ]
  },
  checks: {
    create: ["POST /repos/{owner}/{repo}/check-runs"],
    createSuite: ["POST /repos/{owner}/{repo}/check-suites"],
    get: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}"],
    getSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}"],
    listAnnotations: [
      "GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations"
    ],
    listForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-runs"],
    listForSuite: [
      "GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs"
    ],
    listSuitesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-suites"],
    rerequestRun: [
      "POST /repos/{owner}/{repo}/check-runs/{check_run_id}/rerequest"
    ],
    rerequestSuite: [
      "POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest"
    ],
    setSuitesPreferences: [
      "PATCH /repos/{owner}/{repo}/check-suites/preferences"
    ],
    update: ["PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}"]
  },
  codeScanning: {
    deleteAnalysis: [
      "DELETE /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}{?confirm_delete}"
    ],
    getAlert: [
      "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}",
      {},
      { renamedParameters: { alert_id: "alert_number" } }
    ],
    getAnalysis: [
      "GET /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}"
    ],
    getSarif: ["GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}"],
    listAlertInstances: [
      "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances"
    ],
    listAlertsForOrg: ["GET /orgs/{org}/code-scanning/alerts"],
    listAlertsForRepo: ["GET /repos/{owner}/{repo}/code-scanning/alerts"],
    listAlertsInstances: [
      "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",
      {},
      { renamed: ["codeScanning", "listAlertInstances"] }
    ],
    listRecentAnalyses: ["GET /repos/{owner}/{repo}/code-scanning/analyses"],
    updateAlert: [
      "PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}"
    ],
    uploadSarif: ["POST /repos/{owner}/{repo}/code-scanning/sarifs"]
  },
  codesOfConduct: {
    getAllCodesOfConduct: ["GET /codes_of_conduct"],
    getConductCode: ["GET /codes_of_conduct/{key}"]
  },
  codespaces: {
    addRepositoryForSecretForAuthenticatedUser: [
      "PUT /user/codespaces/secrets/{secret_name}/repositories/{repository_id}"
    ],
    codespaceMachinesForAuthenticatedUser: [
      "GET /user/codespaces/{codespace_name}/machines"
    ],
    createForAuthenticatedUser: ["POST /user/codespaces"],
    createOrUpdateRepoSecret: [
      "PUT /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"
    ],
    createOrUpdateSecretForAuthenticatedUser: [
      "PUT /user/codespaces/secrets/{secret_name}"
    ],
    createWithPrForAuthenticatedUser: [
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/codespaces"
    ],
    createWithRepoForAuthenticatedUser: [
      "POST /repos/{owner}/{repo}/codespaces"
    ],
    deleteForAuthenticatedUser: ["DELETE /user/codespaces/{codespace_name}"],
    deleteFromOrganization: [
      "DELETE /orgs/{org}/members/{username}/codespaces/{codespace_name}"
    ],
    deleteRepoSecret: [
      "DELETE /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"
    ],
    deleteSecretForAuthenticatedUser: [
      "DELETE /user/codespaces/secrets/{secret_name}"
    ],
    exportForAuthenticatedUser: [
      "POST /user/codespaces/{codespace_name}/exports"
    ],
    getExportDetailsForAuthenticatedUser: [
      "GET /user/codespaces/{codespace_name}/exports/{export_id}"
    ],
    getForAuthenticatedUser: ["GET /user/codespaces/{codespace_name}"],
    getPublicKeyForAuthenticatedUser: [
      "GET /user/codespaces/secrets/public-key"
    ],
    getRepoPublicKey: [
      "GET /repos/{owner}/{repo}/codespaces/secrets/public-key"
    ],
    getRepoSecret: [
      "GET /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"
    ],
    getSecretForAuthenticatedUser: [
      "GET /user/codespaces/secrets/{secret_name}"
    ],
    listDevcontainersInRepositoryForAuthenticatedUser: [
      "GET /repos/{owner}/{repo}/codespaces/devcontainers"
    ],
    listForAuthenticatedUser: ["GET /user/codespaces"],
    listInOrganization: [
      "GET /orgs/{org}/codespaces",
      {},
      { renamedParameters: { org_id: "org" } }
    ],
    listInRepositoryForAuthenticatedUser: [
      "GET /repos/{owner}/{repo}/codespaces"
    ],
    listRepoSecrets: ["GET /repos/{owner}/{repo}/codespaces/secrets"],
    listRepositoriesForSecretForAuthenticatedUser: [
      "GET /user/codespaces/secrets/{secret_name}/repositories"
    ],
    listSecretsForAuthenticatedUser: ["GET /user/codespaces/secrets"],
    removeRepositoryForSecretForAuthenticatedUser: [
      "DELETE /user/codespaces/secrets/{secret_name}/repositories/{repository_id}"
    ],
    repoMachinesForAuthenticatedUser: [
      "GET /repos/{owner}/{repo}/codespaces/machines"
    ],
    setRepositoriesForSecretForAuthenticatedUser: [
      "PUT /user/codespaces/secrets/{secret_name}/repositories"
    ],
    startForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/start"],
    stopForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/stop"],
    stopInOrganization: [
      "POST /orgs/{org}/members/{username}/codespaces/{codespace_name}/stop"
    ],
    updateForAuthenticatedUser: ["PATCH /user/codespaces/{codespace_name}"]
  },
  dependabot: {
    addSelectedRepoToOrgSecret: [
      "PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}"
    ],
    createOrUpdateOrgSecret: [
      "PUT /orgs/{org}/dependabot/secrets/{secret_name}"
    ],
    createOrUpdateRepoSecret: [
      "PUT /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"
    ],
    deleteOrgSecret: ["DELETE /orgs/{org}/dependabot/secrets/{secret_name}"],
    deleteRepoSecret: [
      "DELETE /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"
    ],
    getOrgPublicKey: ["GET /orgs/{org}/dependabot/secrets/public-key"],
    getOrgSecret: ["GET /orgs/{org}/dependabot/secrets/{secret_name}"],
    getRepoPublicKey: [
      "GET /repos/{owner}/{repo}/dependabot/secrets/public-key"
    ],
    getRepoSecret: [
      "GET /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"
    ],
    listOrgSecrets: ["GET /orgs/{org}/dependabot/secrets"],
    listRepoSecrets: ["GET /repos/{owner}/{repo}/dependabot/secrets"],
    listSelectedReposForOrgSecret: [
      "GET /orgs/{org}/dependabot/secrets/{secret_name}/repositories"
    ],
    removeSelectedRepoFromOrgSecret: [
      "DELETE /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}"
    ],
    setSelectedReposForOrgSecret: [
      "PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories"
    ]
  },
  dependencyGraph: {
    createRepositorySnapshot: [
      "POST /repos/{owner}/{repo}/dependency-graph/snapshots"
    ],
    diffRange: [
      "GET /repos/{owner}/{repo}/dependency-graph/compare/{basehead}"
    ]
  },
  emojis: { get: ["GET /emojis"] },
  enterpriseAdmin: {
    addCustomLabelsToSelfHostedRunnerForEnterprise: [
      "POST /enterprises/{enterprise}/actions/runners/{runner_id}/labels"
    ],
    disableSelectedOrganizationGithubActionsEnterprise: [
      "DELETE /enterprises/{enterprise}/actions/permissions/organizations/{org_id}"
    ],
    enableSelectedOrganizationGithubActionsEnterprise: [
      "PUT /enterprises/{enterprise}/actions/permissions/organizations/{org_id}"
    ],
    getAllowedActionsEnterprise: [
      "GET /enterprises/{enterprise}/actions/permissions/selected-actions"
    ],
    getGithubActionsPermissionsEnterprise: [
      "GET /enterprises/{enterprise}/actions/permissions"
    ],
    getServerStatistics: [
      "GET /enterprise-installation/{enterprise_or_org}/server-statistics"
    ],
    listLabelsForSelfHostedRunnerForEnterprise: [
      "GET /enterprises/{enterprise}/actions/runners/{runner_id}/labels"
    ],
    listSelectedOrganizationsEnabledGithubActionsEnterprise: [
      "GET /enterprises/{enterprise}/actions/permissions/organizations"
    ],
    removeAllCustomLabelsFromSelfHostedRunnerForEnterprise: [
      "DELETE /enterprises/{enterprise}/actions/runners/{runner_id}/labels"
    ],
    removeCustomLabelFromSelfHostedRunnerForEnterprise: [
      "DELETE /enterprises/{enterprise}/actions/runners/{runner_id}/labels/{name}"
    ],
    setAllowedActionsEnterprise: [
      "PUT /enterprises/{enterprise}/actions/permissions/selected-actions"
    ],
    setCustomLabelsForSelfHostedRunnerForEnterprise: [
      "PUT /enterprises/{enterprise}/actions/runners/{runner_id}/labels"
    ],
    setGithubActionsPermissionsEnterprise: [
      "PUT /enterprises/{enterprise}/actions/permissions"
    ],
    setSelectedOrganizationsEnabledGithubActionsEnterprise: [
      "PUT /enterprises/{enterprise}/actions/permissions/organizations"
    ]
  },
  gists: {
    checkIsStarred: ["GET /gists/{gist_id}/star"],
    create: ["POST /gists"],
    createComment: ["POST /gists/{gist_id}/comments"],
    delete: ["DELETE /gists/{gist_id}"],
    deleteComment: ["DELETE /gists/{gist_id}/comments/{comment_id}"],
    fork: ["POST /gists/{gist_id}/forks"],
    get: ["GET /gists/{gist_id}"],
    getComment: ["GET /gists/{gist_id}/comments/{comment_id}"],
    getRevision: ["GET /gists/{gist_id}/{sha}"],
    list: ["GET /gists"],
    listComments: ["GET /gists/{gist_id}/comments"],
    listCommits: ["GET /gists/{gist_id}/commits"],
    listForUser: ["GET /users/{username}/gists"],
    listForks: ["GET /gists/{gist_id}/forks"],
    listPublic: ["GET /gists/public"],
    listStarred: ["GET /gists/starred"],
    star: ["PUT /gists/{gist_id}/star"],
    unstar: ["DELETE /gists/{gist_id}/star"],
    update: ["PATCH /gists/{gist_id}"],
    updateComment: ["PATCH /gists/{gist_id}/comments/{comment_id}"]
  },
  git: {
    createBlob: ["POST /repos/{owner}/{repo}/git/blobs"],
    createCommit: ["POST /repos/{owner}/{repo}/git/commits"],
    createRef: ["POST /repos/{owner}/{repo}/git/refs"],
    createTag: ["POST /repos/{owner}/{repo}/git/tags"],
    createTree: ["POST /repos/{owner}/{repo}/git/trees"],
    deleteRef: ["DELETE /repos/{owner}/{repo}/git/refs/{ref}"],
    getBlob: ["GET /repos/{owner}/{repo}/git/blobs/{file_sha}"],
    getCommit: ["GET /repos/{owner}/{repo}/git/commits/{commit_sha}"],
    getRef: ["GET /repos/{owner}/{repo}/git/ref/{ref}"],
    getTag: ["GET /repos/{owner}/{repo}/git/tags/{tag_sha}"],
    getTree: ["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"],
    listMatchingRefs: ["GET /repos/{owner}/{repo}/git/matching-refs/{ref}"],
    updateRef: ["PATCH /repos/{owner}/{repo}/git/refs/{ref}"]
  },
  gitignore: {
    getAllTemplates: ["GET /gitignore/templates"],
    getTemplate: ["GET /gitignore/templates/{name}"]
  },
  interactions: {
    getRestrictionsForAuthenticatedUser: ["GET /user/interaction-limits"],
    getRestrictionsForOrg: ["GET /orgs/{org}/interaction-limits"],
    getRestrictionsForRepo: ["GET /repos/{owner}/{repo}/interaction-limits"],
    getRestrictionsForYourPublicRepos: [
      "GET /user/interaction-limits",
      {},
      { renamed: ["interactions", "getRestrictionsForAuthenticatedUser"] }
    ],
    removeRestrictionsForAuthenticatedUser: ["DELETE /user/interaction-limits"],
    removeRestrictionsForOrg: ["DELETE /orgs/{org}/interaction-limits"],
    removeRestrictionsForRepo: [
      "DELETE /repos/{owner}/{repo}/interaction-limits"
    ],
    removeRestrictionsForYourPublicRepos: [
      "DELETE /user/interaction-limits",
      {},
      { renamed: ["interactions", "removeRestrictionsForAuthenticatedUser"] }
    ],
    setRestrictionsForAuthenticatedUser: ["PUT /user/interaction-limits"],
    setRestrictionsForOrg: ["PUT /orgs/{org}/interaction-limits"],
    setRestrictionsForRepo: ["PUT /repos/{owner}/{repo}/interaction-limits"],
    setRestrictionsForYourPublicRepos: [
      "PUT /user/interaction-limits",
      {},
      { renamed: ["interactions", "setRestrictionsForAuthenticatedUser"] }
    ]
  },
  issues: {
    addAssignees: [
      "POST /repos/{owner}/{repo}/issues/{issue_number}/assignees"
    ],
    addLabels: ["POST /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    checkUserCanBeAssigned: ["GET /repos/{owner}/{repo}/assignees/{assignee}"],
    create: ["POST /repos/{owner}/{repo}/issues"],
    createComment: [
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments"
    ],
    createLabel: ["POST /repos/{owner}/{repo}/labels"],
    createMilestone: ["POST /repos/{owner}/{repo}/milestones"],
    deleteComment: [
      "DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}"
    ],
    deleteLabel: ["DELETE /repos/{owner}/{repo}/labels/{name}"],
    deleteMilestone: [
      "DELETE /repos/{owner}/{repo}/milestones/{milestone_number}"
    ],
    get: ["GET /repos/{owner}/{repo}/issues/{issue_number}"],
    getComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    getEvent: ["GET /repos/{owner}/{repo}/issues/events/{event_id}"],
    getLabel: ["GET /repos/{owner}/{repo}/labels/{name}"],
    getMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}"],
    list: ["GET /issues"],
    listAssignees: ["GET /repos/{owner}/{repo}/assignees"],
    listComments: ["GET /repos/{owner}/{repo}/issues/{issue_number}/comments"],
    listCommentsForRepo: ["GET /repos/{owner}/{repo}/issues/comments"],
    listEvents: ["GET /repos/{owner}/{repo}/issues/{issue_number}/events"],
    listEventsForRepo: ["GET /repos/{owner}/{repo}/issues/events"],
    listEventsForTimeline: [
      "GET /repos/{owner}/{repo}/issues/{issue_number}/timeline"
    ],
    listForAuthenticatedUser: ["GET /user/issues"],
    listForOrg: ["GET /orgs/{org}/issues"],
    listForRepo: ["GET /repos/{owner}/{repo}/issues"],
    listLabelsForMilestone: [
      "GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels"
    ],
    listLabelsForRepo: ["GET /repos/{owner}/{repo}/labels"],
    listLabelsOnIssue: [
      "GET /repos/{owner}/{repo}/issues/{issue_number}/labels"
    ],
    listMilestones: ["GET /repos/{owner}/{repo}/milestones"],
    lock: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/lock"],
    removeAllLabels: [
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels"
    ],
    removeAssignees: [
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees"
    ],
    removeLabel: [
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}"
    ],
    setLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    unlock: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock"],
    update: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}"],
    updateComment: ["PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    updateLabel: ["PATCH /repos/{owner}/{repo}/labels/{name}"],
    updateMilestone: [
      "PATCH /repos/{owner}/{repo}/milestones/{milestone_number}"
    ]
  },
  licenses: {
    get: ["GET /licenses/{license}"],
    getAllCommonlyUsed: ["GET /licenses"],
    getForRepo: ["GET /repos/{owner}/{repo}/license"]
  },
  markdown: {
    render: ["POST /markdown"],
    renderRaw: [
      "POST /markdown/raw",
      { headers: { "content-type": "text/plain; charset=utf-8" } }
    ]
  },
  meta: {
    get: ["GET /meta"],
    getOctocat: ["GET /octocat"],
    getZen: ["GET /zen"],
    root: ["GET /"]
  },
  migrations: {
    cancelImport: ["DELETE /repos/{owner}/{repo}/import"],
    deleteArchiveForAuthenticatedUser: [
      "DELETE /user/migrations/{migration_id}/archive"
    ],
    deleteArchiveForOrg: [
      "DELETE /orgs/{org}/migrations/{migration_id}/archive"
    ],
    downloadArchiveForOrg: [
      "GET /orgs/{org}/migrations/{migration_id}/archive"
    ],
    getArchiveForAuthenticatedUser: [
      "GET /user/migrations/{migration_id}/archive"
    ],
    getCommitAuthors: ["GET /repos/{owner}/{repo}/import/authors"],
    getImportStatus: ["GET /repos/{owner}/{repo}/import"],
    getLargeFiles: ["GET /repos/{owner}/{repo}/import/large_files"],
    getStatusForAuthenticatedUser: ["GET /user/migrations/{migration_id}"],
    getStatusForOrg: ["GET /orgs/{org}/migrations/{migration_id}"],
    listForAuthenticatedUser: ["GET /user/migrations"],
    listForOrg: ["GET /orgs/{org}/migrations"],
    listReposForAuthenticatedUser: [
      "GET /user/migrations/{migration_id}/repositories"
    ],
    listReposForOrg: ["GET /orgs/{org}/migrations/{migration_id}/repositories"],
    listReposForUser: [
      "GET /user/migrations/{migration_id}/repositories",
      {},
      { renamed: ["migrations", "listReposForAuthenticatedUser"] }
    ],
    mapCommitAuthor: ["PATCH /repos/{owner}/{repo}/import/authors/{author_id}"],
    setLfsPreference: ["PATCH /repos/{owner}/{repo}/import/lfs"],
    startForAuthenticatedUser: ["POST /user/migrations"],
    startForOrg: ["POST /orgs/{org}/migrations"],
    startImport: ["PUT /repos/{owner}/{repo}/import"],
    unlockRepoForAuthenticatedUser: [
      "DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock"
    ],
    unlockRepoForOrg: [
      "DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock"
    ],
    updateImport: ["PATCH /repos/{owner}/{repo}/import"]
  },
  orgs: {
    blockUser: ["PUT /orgs/{org}/blocks/{username}"],
    cancelInvitation: ["DELETE /orgs/{org}/invitations/{invitation_id}"],
    checkBlockedUser: ["GET /orgs/{org}/blocks/{username}"],
    checkMembershipForUser: ["GET /orgs/{org}/members/{username}"],
    checkPublicMembershipForUser: ["GET /orgs/{org}/public_members/{username}"],
    convertMemberToOutsideCollaborator: [
      "PUT /orgs/{org}/outside_collaborators/{username}"
    ],
    createInvitation: ["POST /orgs/{org}/invitations"],
    createWebhook: ["POST /orgs/{org}/hooks"],
    deleteWebhook: ["DELETE /orgs/{org}/hooks/{hook_id}"],
    get: ["GET /orgs/{org}"],
    getMembershipForAuthenticatedUser: ["GET /user/memberships/orgs/{org}"],
    getMembershipForUser: ["GET /orgs/{org}/memberships/{username}"],
    getWebhook: ["GET /orgs/{org}/hooks/{hook_id}"],
    getWebhookConfigForOrg: ["GET /orgs/{org}/hooks/{hook_id}/config"],
    getWebhookDelivery: [
      "GET /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}"
    ],
    list: ["GET /organizations"],
    listAppInstallations: ["GET /orgs/{org}/installations"],
    listBlockedUsers: ["GET /orgs/{org}/blocks"],
    listCustomRoles: ["GET /organizations/{organization_id}/custom_roles"],
    listFailedInvitations: ["GET /orgs/{org}/failed_invitations"],
    listForAuthenticatedUser: ["GET /user/orgs"],
    listForUser: ["GET /users/{username}/orgs"],
    listInvitationTeams: ["GET /orgs/{org}/invitations/{invitation_id}/teams"],
    listMembers: ["GET /orgs/{org}/members"],
    listMembershipsForAuthenticatedUser: ["GET /user/memberships/orgs"],
    listOutsideCollaborators: ["GET /orgs/{org}/outside_collaborators"],
    listPendingInvitations: ["GET /orgs/{org}/invitations"],
    listPublicMembers: ["GET /orgs/{org}/public_members"],
    listWebhookDeliveries: ["GET /orgs/{org}/hooks/{hook_id}/deliveries"],
    listWebhooks: ["GET /orgs/{org}/hooks"],
    pingWebhook: ["POST /orgs/{org}/hooks/{hook_id}/pings"],
    redeliverWebhookDelivery: [
      "POST /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"
    ],
    removeMember: ["DELETE /orgs/{org}/members/{username}"],
    removeMembershipForUser: ["DELETE /orgs/{org}/memberships/{username}"],
    removeOutsideCollaborator: [
      "DELETE /orgs/{org}/outside_collaborators/{username}"
    ],
    removePublicMembershipForAuthenticatedUser: [
      "DELETE /orgs/{org}/public_members/{username}"
    ],
    setMembershipForUser: ["PUT /orgs/{org}/memberships/{username}"],
    setPublicMembershipForAuthenticatedUser: [
      "PUT /orgs/{org}/public_members/{username}"
    ],
    unblockUser: ["DELETE /orgs/{org}/blocks/{username}"],
    update: ["PATCH /orgs/{org}"],
    updateMembershipForAuthenticatedUser: [
      "PATCH /user/memberships/orgs/{org}"
    ],
    updateWebhook: ["PATCH /orgs/{org}/hooks/{hook_id}"],
    updateWebhookConfigForOrg: ["PATCH /orgs/{org}/hooks/{hook_id}/config"]
  },
  packages: {
    deletePackageForAuthenticatedUser: [
      "DELETE /user/packages/{package_type}/{package_name}"
    ],
    deletePackageForOrg: [
      "DELETE /orgs/{org}/packages/{package_type}/{package_name}"
    ],
    deletePackageForUser: [
      "DELETE /users/{username}/packages/{package_type}/{package_name}"
    ],
    deletePackageVersionForAuthenticatedUser: [
      "DELETE /user/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    deletePackageVersionForOrg: [
      "DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    deletePackageVersionForUser: [
      "DELETE /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    getAllPackageVersionsForAPackageOwnedByAnOrg: [
      "GET /orgs/{org}/packages/{package_type}/{package_name}/versions",
      {},
      { renamed: ["packages", "getAllPackageVersionsForPackageOwnedByOrg"] }
    ],
    getAllPackageVersionsForAPackageOwnedByTheAuthenticatedUser: [
      "GET /user/packages/{package_type}/{package_name}/versions",
      {},
      {
        renamed: [
          "packages",
          "getAllPackageVersionsForPackageOwnedByAuthenticatedUser"
        ]
      }
    ],
    getAllPackageVersionsForPackageOwnedByAuthenticatedUser: [
      "GET /user/packages/{package_type}/{package_name}/versions"
    ],
    getAllPackageVersionsForPackageOwnedByOrg: [
      "GET /orgs/{org}/packages/{package_type}/{package_name}/versions"
    ],
    getAllPackageVersionsForPackageOwnedByUser: [
      "GET /users/{username}/packages/{package_type}/{package_name}/versions"
    ],
    getPackageForAuthenticatedUser: [
      "GET /user/packages/{package_type}/{package_name}"
    ],
    getPackageForOrganization: [
      "GET /orgs/{org}/packages/{package_type}/{package_name}"
    ],
    getPackageForUser: [
      "GET /users/{username}/packages/{package_type}/{package_name}"
    ],
    getPackageVersionForAuthenticatedUser: [
      "GET /user/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    getPackageVersionForOrganization: [
      "GET /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    getPackageVersionForUser: [
      "GET /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    listPackagesForAuthenticatedUser: ["GET /user/packages"],
    listPackagesForOrganization: ["GET /orgs/{org}/packages"],
    listPackagesForUser: ["GET /users/{username}/packages"],
    restorePackageForAuthenticatedUser: [
      "POST /user/packages/{package_type}/{package_name}/restore{?token}"
    ],
    restorePackageForOrg: [
      "POST /orgs/{org}/packages/{package_type}/{package_name}/restore{?token}"
    ],
    restorePackageForUser: [
      "POST /users/{username}/packages/{package_type}/{package_name}/restore{?token}"
    ],
    restorePackageVersionForAuthenticatedUser: [
      "POST /user/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"
    ],
    restorePackageVersionForOrg: [
      "POST /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"
    ],
    restorePackageVersionForUser: [
      "POST /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"
    ]
  },
  projects: {
    addCollaborator: ["PUT /projects/{project_id}/collaborators/{username}"],
    createCard: ["POST /projects/columns/{column_id}/cards"],
    createColumn: ["POST /projects/{project_id}/columns"],
    createForAuthenticatedUser: ["POST /user/projects"],
    createForOrg: ["POST /orgs/{org}/projects"],
    createForRepo: ["POST /repos/{owner}/{repo}/projects"],
    delete: ["DELETE /projects/{project_id}"],
    deleteCard: ["DELETE /projects/columns/cards/{card_id}"],
    deleteColumn: ["DELETE /projects/columns/{column_id}"],
    get: ["GET /projects/{project_id}"],
    getCard: ["GET /projects/columns/cards/{card_id}"],
    getColumn: ["GET /projects/columns/{column_id}"],
    getPermissionForUser: [
      "GET /projects/{project_id}/collaborators/{username}/permission"
    ],
    listCards: ["GET /projects/columns/{column_id}/cards"],
    listCollaborators: ["GET /projects/{project_id}/collaborators"],
    listColumns: ["GET /projects/{project_id}/columns"],
    listForOrg: ["GET /orgs/{org}/projects"],
    listForRepo: ["GET /repos/{owner}/{repo}/projects"],
    listForUser: ["GET /users/{username}/projects"],
    moveCard: ["POST /projects/columns/cards/{card_id}/moves"],
    moveColumn: ["POST /projects/columns/{column_id}/moves"],
    removeCollaborator: [
      "DELETE /projects/{project_id}/collaborators/{username}"
    ],
    update: ["PATCH /projects/{project_id}"],
    updateCard: ["PATCH /projects/columns/cards/{card_id}"],
    updateColumn: ["PATCH /projects/columns/{column_id}"]
  },
  pulls: {
    checkIfMerged: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
    create: ["POST /repos/{owner}/{repo}/pulls"],
    createReplyForReviewComment: [
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies"
    ],
    createReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
    createReviewComment: [
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments"
    ],
    deletePendingReview: [
      "DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"
    ],
    deleteReviewComment: [
      "DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}"
    ],
    dismissReview: [
      "PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals"
    ],
    get: ["GET /repos/{owner}/{repo}/pulls/{pull_number}"],
    getReview: [
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"
    ],
    getReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
    list: ["GET /repos/{owner}/{repo}/pulls"],
    listCommentsForReview: [
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments"
    ],
    listCommits: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"],
    listFiles: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"],
    listRequestedReviewers: [
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"
    ],
    listReviewComments: [
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments"
    ],
    listReviewCommentsForRepo: ["GET /repos/{owner}/{repo}/pulls/comments"],
    listReviews: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
    merge: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
    removeRequestedReviewers: [
      "DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"
    ],
    requestReviewers: [
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"
    ],
    submitReview: [
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events"
    ],
    update: ["PATCH /repos/{owner}/{repo}/pulls/{pull_number}"],
    updateBranch: [
      "PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch"
    ],
    updateReview: [
      "PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"
    ],
    updateReviewComment: [
      "PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}"
    ]
  },
  rateLimit: { get: ["GET /rate_limit"] },
  reactions: {
    createForCommitComment: [
      "POST /repos/{owner}/{repo}/comments/{comment_id}/reactions"
    ],
    createForIssue: [
      "POST /repos/{owner}/{repo}/issues/{issue_number}/reactions"
    ],
    createForIssueComment: [
      "POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"
    ],
    createForPullRequestReviewComment: [
      "POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions"
    ],
    createForRelease: [
      "POST /repos/{owner}/{repo}/releases/{release_id}/reactions"
    ],
    createForTeamDiscussionCommentInOrg: [
      "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions"
    ],
    createForTeamDiscussionInOrg: [
      "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions"
    ],
    deleteForCommitComment: [
      "DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}"
    ],
    deleteForIssue: [
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}"
    ],
    deleteForIssueComment: [
      "DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}"
    ],
    deleteForPullRequestComment: [
      "DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}"
    ],
    deleteForRelease: [
      "DELETE /repos/{owner}/{repo}/releases/{release_id}/reactions/{reaction_id}"
    ],
    deleteForTeamDiscussion: [
      "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}"
    ],
    deleteForTeamDiscussionComment: [
      "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}"
    ],
    listForCommitComment: [
      "GET /repos/{owner}/{repo}/comments/{comment_id}/reactions"
    ],
    listForIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/reactions"],
    listForIssueComment: [
      "GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"
    ],
    listForPullRequestReviewComment: [
      "GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions"
    ],
    listForRelease: [
      "GET /repos/{owner}/{repo}/releases/{release_id}/reactions"
    ],
    listForTeamDiscussionCommentInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions"
    ],
    listForTeamDiscussionInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions"
    ]
  },
  repos: {
    acceptInvitation: [
      "PATCH /user/repository_invitations/{invitation_id}",
      {},
      { renamed: ["repos", "acceptInvitationForAuthenticatedUser"] }
    ],
    acceptInvitationForAuthenticatedUser: [
      "PATCH /user/repository_invitations/{invitation_id}"
    ],
    addAppAccessRestrictions: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
      {},
      { mapToData: "apps" }
    ],
    addCollaborator: ["PUT /repos/{owner}/{repo}/collaborators/{username}"],
    addStatusCheckContexts: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
      {},
      { mapToData: "contexts" }
    ],
    addTeamAccessRestrictions: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
      {},
      { mapToData: "teams" }
    ],
    addUserAccessRestrictions: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
      {},
      { mapToData: "users" }
    ],
    checkCollaborator: ["GET /repos/{owner}/{repo}/collaborators/{username}"],
    checkVulnerabilityAlerts: [
      "GET /repos/{owner}/{repo}/vulnerability-alerts"
    ],
    codeownersErrors: ["GET /repos/{owner}/{repo}/codeowners/errors"],
    compareCommits: ["GET /repos/{owner}/{repo}/compare/{base}...{head}"],
    compareCommitsWithBasehead: [
      "GET /repos/{owner}/{repo}/compare/{basehead}"
    ],
    createAutolink: ["POST /repos/{owner}/{repo}/autolinks"],
    createCommitComment: [
      "POST /repos/{owner}/{repo}/commits/{commit_sha}/comments"
    ],
    createCommitSignatureProtection: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"
    ],
    createCommitStatus: ["POST /repos/{owner}/{repo}/statuses/{sha}"],
    createDeployKey: ["POST /repos/{owner}/{repo}/keys"],
    createDeployment: ["POST /repos/{owner}/{repo}/deployments"],
    createDeploymentStatus: [
      "POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"
    ],
    createDispatchEvent: ["POST /repos/{owner}/{repo}/dispatches"],
    createForAuthenticatedUser: ["POST /user/repos"],
    createFork: ["POST /repos/{owner}/{repo}/forks"],
    createInOrg: ["POST /orgs/{org}/repos"],
    createOrUpdateEnvironment: [
      "PUT /repos/{owner}/{repo}/environments/{environment_name}"
    ],
    createOrUpdateFileContents: ["PUT /repos/{owner}/{repo}/contents/{path}"],
    createPagesSite: ["POST /repos/{owner}/{repo}/pages"],
    createRelease: ["POST /repos/{owner}/{repo}/releases"],
    createTagProtection: ["POST /repos/{owner}/{repo}/tags/protection"],
    createUsingTemplate: [
      "POST /repos/{template_owner}/{template_repo}/generate"
    ],
    createWebhook: ["POST /repos/{owner}/{repo}/hooks"],
    declineInvitation: [
      "DELETE /user/repository_invitations/{invitation_id}",
      {},
      { renamed: ["repos", "declineInvitationForAuthenticatedUser"] }
    ],
    declineInvitationForAuthenticatedUser: [
      "DELETE /user/repository_invitations/{invitation_id}"
    ],
    delete: ["DELETE /repos/{owner}/{repo}"],
    deleteAccessRestrictions: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"
    ],
    deleteAdminBranchProtection: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"
    ],
    deleteAnEnvironment: [
      "DELETE /repos/{owner}/{repo}/environments/{environment_name}"
    ],
    deleteAutolink: ["DELETE /repos/{owner}/{repo}/autolinks/{autolink_id}"],
    deleteBranchProtection: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection"
    ],
    deleteCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}"],
    deleteCommitSignatureProtection: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"
    ],
    deleteDeployKey: ["DELETE /repos/{owner}/{repo}/keys/{key_id}"],
    deleteDeployment: [
      "DELETE /repos/{owner}/{repo}/deployments/{deployment_id}"
    ],
    deleteFile: ["DELETE /repos/{owner}/{repo}/contents/{path}"],
    deleteInvitation: [
      "DELETE /repos/{owner}/{repo}/invitations/{invitation_id}"
    ],
    deletePagesSite: ["DELETE /repos/{owner}/{repo}/pages"],
    deletePullRequestReviewProtection: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"
    ],
    deleteRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}"],
    deleteReleaseAsset: [
      "DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}"
    ],
    deleteTagProtection: [
      "DELETE /repos/{owner}/{repo}/tags/protection/{tag_protection_id}"
    ],
    deleteWebhook: ["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"],
    disableAutomatedSecurityFixes: [
      "DELETE /repos/{owner}/{repo}/automated-security-fixes"
    ],
    disableLfsForRepo: ["DELETE /repos/{owner}/{repo}/lfs"],
    disableVulnerabilityAlerts: [
      "DELETE /repos/{owner}/{repo}/vulnerability-alerts"
    ],
    downloadArchive: [
      "GET /repos/{owner}/{repo}/zipball/{ref}",
      {},
      { renamed: ["repos", "downloadZipballArchive"] }
    ],
    downloadTarballArchive: ["GET /repos/{owner}/{repo}/tarball/{ref}"],
    downloadZipballArchive: ["GET /repos/{owner}/{repo}/zipball/{ref}"],
    enableAutomatedSecurityFixes: [
      "PUT /repos/{owner}/{repo}/automated-security-fixes"
    ],
    enableLfsForRepo: ["PUT /repos/{owner}/{repo}/lfs"],
    enableVulnerabilityAlerts: [
      "PUT /repos/{owner}/{repo}/vulnerability-alerts"
    ],
    generateReleaseNotes: [
      "POST /repos/{owner}/{repo}/releases/generate-notes"
    ],
    get: ["GET /repos/{owner}/{repo}"],
    getAccessRestrictions: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"
    ],
    getAdminBranchProtection: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"
    ],
    getAllEnvironments: ["GET /repos/{owner}/{repo}/environments"],
    getAllStatusCheckContexts: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts"
    ],
    getAllTopics: ["GET /repos/{owner}/{repo}/topics"],
    getAppsWithAccessToProtectedBranch: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps"
    ],
    getAutolink: ["GET /repos/{owner}/{repo}/autolinks/{autolink_id}"],
    getBranch: ["GET /repos/{owner}/{repo}/branches/{branch}"],
    getBranchProtection: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection"
    ],
    getClones: ["GET /repos/{owner}/{repo}/traffic/clones"],
    getCodeFrequencyStats: ["GET /repos/{owner}/{repo}/stats/code_frequency"],
    getCollaboratorPermissionLevel: [
      "GET /repos/{owner}/{repo}/collaborators/{username}/permission"
    ],
    getCombinedStatusForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/status"],
    getCommit: ["GET /repos/{owner}/{repo}/commits/{ref}"],
    getCommitActivityStats: ["GET /repos/{owner}/{repo}/stats/commit_activity"],
    getCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}"],
    getCommitSignatureProtection: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"
    ],
    getCommunityProfileMetrics: ["GET /repos/{owner}/{repo}/community/profile"],
    getContent: ["GET /repos/{owner}/{repo}/contents/{path}"],
    getContributorsStats: ["GET /repos/{owner}/{repo}/stats/contributors"],
    getDeployKey: ["GET /repos/{owner}/{repo}/keys/{key_id}"],
    getDeployment: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}"],
    getDeploymentStatus: [
      "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}"
    ],
    getEnvironment: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}"
    ],
    getLatestPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/latest"],
    getLatestRelease: ["GET /repos/{owner}/{repo}/releases/latest"],
    getPages: ["GET /repos/{owner}/{repo}/pages"],
    getPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/{build_id}"],
    getPagesHealthCheck: ["GET /repos/{owner}/{repo}/pages/health"],
    getParticipationStats: ["GET /repos/{owner}/{repo}/stats/participation"],
    getPullRequestReviewProtection: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"
    ],
    getPunchCardStats: ["GET /repos/{owner}/{repo}/stats/punch_card"],
    getReadme: ["GET /repos/{owner}/{repo}/readme"],
    getReadmeInDirectory: ["GET /repos/{owner}/{repo}/readme/{dir}"],
    getRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}"],
    getReleaseAsset: ["GET /repos/{owner}/{repo}/releases/assets/{asset_id}"],
    getReleaseByTag: ["GET /repos/{owner}/{repo}/releases/tags/{tag}"],
    getStatusChecksProtection: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"
    ],
    getTeamsWithAccessToProtectedBranch: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams"
    ],
    getTopPaths: ["GET /repos/{owner}/{repo}/traffic/popular/paths"],
    getTopReferrers: ["GET /repos/{owner}/{repo}/traffic/popular/referrers"],
    getUsersWithAccessToProtectedBranch: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users"
    ],
    getViews: ["GET /repos/{owner}/{repo}/traffic/views"],
    getWebhook: ["GET /repos/{owner}/{repo}/hooks/{hook_id}"],
    getWebhookConfigForRepo: [
      "GET /repos/{owner}/{repo}/hooks/{hook_id}/config"
    ],
    getWebhookDelivery: [
      "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}"
    ],
    listAutolinks: ["GET /repos/{owner}/{repo}/autolinks"],
    listBranches: ["GET /repos/{owner}/{repo}/branches"],
    listBranchesForHeadCommit: [
      "GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head"
    ],
    listCollaborators: ["GET /repos/{owner}/{repo}/collaborators"],
    listCommentsForCommit: [
      "GET /repos/{owner}/{repo}/commits/{commit_sha}/comments"
    ],
    listCommitCommentsForRepo: ["GET /repos/{owner}/{repo}/comments"],
    listCommitStatusesForRef: [
      "GET /repos/{owner}/{repo}/commits/{ref}/statuses"
    ],
    listCommits: ["GET /repos/{owner}/{repo}/commits"],
    listContributors: ["GET /repos/{owner}/{repo}/contributors"],
    listDeployKeys: ["GET /repos/{owner}/{repo}/keys"],
    listDeploymentStatuses: [
      "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"
    ],
    listDeployments: ["GET /repos/{owner}/{repo}/deployments"],
    listForAuthenticatedUser: ["GET /user/repos"],
    listForOrg: ["GET /orgs/{org}/repos"],
    listForUser: ["GET /users/{username}/repos"],
    listForks: ["GET /repos/{owner}/{repo}/forks"],
    listInvitations: ["GET /repos/{owner}/{repo}/invitations"],
    listInvitationsForAuthenticatedUser: ["GET /user/repository_invitations"],
    listLanguages: ["GET /repos/{owner}/{repo}/languages"],
    listPagesBuilds: ["GET /repos/{owner}/{repo}/pages/builds"],
    listPublic: ["GET /repositories"],
    listPullRequestsAssociatedWithCommit: [
      "GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls"
    ],
    listReleaseAssets: [
      "GET /repos/{owner}/{repo}/releases/{release_id}/assets"
    ],
    listReleases: ["GET /repos/{owner}/{repo}/releases"],
    listTagProtection: ["GET /repos/{owner}/{repo}/tags/protection"],
    listTags: ["GET /repos/{owner}/{repo}/tags"],
    listTeams: ["GET /repos/{owner}/{repo}/teams"],
    listWebhookDeliveries: [
      "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries"
    ],
    listWebhooks: ["GET /repos/{owner}/{repo}/hooks"],
    merge: ["POST /repos/{owner}/{repo}/merges"],
    mergeUpstream: ["POST /repos/{owner}/{repo}/merge-upstream"],
    pingWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"],
    redeliverWebhookDelivery: [
      "POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"
    ],
    removeAppAccessRestrictions: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
      {},
      { mapToData: "apps" }
    ],
    removeCollaborator: [
      "DELETE /repos/{owner}/{repo}/collaborators/{username}"
    ],
    removeStatusCheckContexts: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
      {},
      { mapToData: "contexts" }
    ],
    removeStatusCheckProtection: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"
    ],
    removeTeamAccessRestrictions: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
      {},
      { mapToData: "teams" }
    ],
    removeUserAccessRestrictions: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
      {},
      { mapToData: "users" }
    ],
    renameBranch: ["POST /repos/{owner}/{repo}/branches/{branch}/rename"],
    replaceAllTopics: ["PUT /repos/{owner}/{repo}/topics"],
    requestPagesBuild: ["POST /repos/{owner}/{repo}/pages/builds"],
    setAdminBranchProtection: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"
    ],
    setAppAccessRestrictions: [
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
      {},
      { mapToData: "apps" }
    ],
    setStatusCheckContexts: [
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
      {},
      { mapToData: "contexts" }
    ],
    setTeamAccessRestrictions: [
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
      {},
      { mapToData: "teams" }
    ],
    setUserAccessRestrictions: [
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
      {},
      { mapToData: "users" }
    ],
    testPushWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests"],
    transfer: ["POST /repos/{owner}/{repo}/transfer"],
    update: ["PATCH /repos/{owner}/{repo}"],
    updateBranchProtection: [
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection"
    ],
    updateCommitComment: ["PATCH /repos/{owner}/{repo}/comments/{comment_id}"],
    updateInformationAboutPagesSite: ["PUT /repos/{owner}/{repo}/pages"],
    updateInvitation: [
      "PATCH /repos/{owner}/{repo}/invitations/{invitation_id}"
    ],
    updatePullRequestReviewProtection: [
      "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"
    ],
    updateRelease: ["PATCH /repos/{owner}/{repo}/releases/{release_id}"],
    updateReleaseAsset: [
      "PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}"
    ],
    updateStatusCheckPotection: [
      "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
      {},
      { renamed: ["repos", "updateStatusCheckProtection"] }
    ],
    updateStatusCheckProtection: [
      "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"
    ],
    updateWebhook: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}"],
    updateWebhookConfigForRepo: [
      "PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config"
    ],
    uploadReleaseAsset: [
      "POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}",
      { baseUrl: "https://uploads.github.com" }
    ]
  },
  search: {
    code: ["GET /search/code"],
    commits: ["GET /search/commits"],
    issuesAndPullRequests: ["GET /search/issues"],
    labels: ["GET /search/labels"],
    repos: ["GET /search/repositories"],
    topics: ["GET /search/topics"],
    users: ["GET /search/users"]
  },
  secretScanning: {
    getAlert: [
      "GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"
    ],
    listAlertsForEnterprise: [
      "GET /enterprises/{enterprise}/secret-scanning/alerts"
    ],
    listAlertsForOrg: ["GET /orgs/{org}/secret-scanning/alerts"],
    listAlertsForRepo: ["GET /repos/{owner}/{repo}/secret-scanning/alerts"],
    listLocationsForAlert: [
      "GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/locations"
    ],
    updateAlert: [
      "PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"
    ]
  },
  teams: {
    addOrUpdateMembershipForUserInOrg: [
      "PUT /orgs/{org}/teams/{team_slug}/memberships/{username}"
    ],
    addOrUpdateProjectPermissionsInOrg: [
      "PUT /orgs/{org}/teams/{team_slug}/projects/{project_id}"
    ],
    addOrUpdateRepoPermissionsInOrg: [
      "PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"
    ],
    checkPermissionsForProjectInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/projects/{project_id}"
    ],
    checkPermissionsForRepoInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"
    ],
    create: ["POST /orgs/{org}/teams"],
    createDiscussionCommentInOrg: [
      "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"
    ],
    createDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions"],
    deleteDiscussionCommentInOrg: [
      "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"
    ],
    deleteDiscussionInOrg: [
      "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"
    ],
    deleteInOrg: ["DELETE /orgs/{org}/teams/{team_slug}"],
    getByName: ["GET /orgs/{org}/teams/{team_slug}"],
    getDiscussionCommentInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"
    ],
    getDiscussionInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"
    ],
    getMembershipForUserInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/memberships/{username}"
    ],
    list: ["GET /orgs/{org}/teams"],
    listChildInOrg: ["GET /orgs/{org}/teams/{team_slug}/teams"],
    listDiscussionCommentsInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"
    ],
    listDiscussionsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions"],
    listForAuthenticatedUser: ["GET /user/teams"],
    listMembersInOrg: ["GET /orgs/{org}/teams/{team_slug}/members"],
    listPendingInvitationsInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/invitations"
    ],
    listProjectsInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects"],
    listReposInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos"],
    removeMembershipForUserInOrg: [
      "DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}"
    ],
    removeProjectInOrg: [
      "DELETE /orgs/{org}/teams/{team_slug}/projects/{project_id}"
    ],
    removeRepoInOrg: [
      "DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"
    ],
    updateDiscussionCommentInOrg: [
      "PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"
    ],
    updateDiscussionInOrg: [
      "PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"
    ],
    updateInOrg: ["PATCH /orgs/{org}/teams/{team_slug}"]
  },
  users: {
    addEmailForAuthenticated: [
      "POST /user/emails",
      {},
      { renamed: ["users", "addEmailForAuthenticatedUser"] }
    ],
    addEmailForAuthenticatedUser: ["POST /user/emails"],
    block: ["PUT /user/blocks/{username}"],
    checkBlocked: ["GET /user/blocks/{username}"],
    checkFollowingForUser: ["GET /users/{username}/following/{target_user}"],
    checkPersonIsFollowedByAuthenticated: ["GET /user/following/{username}"],
    createGpgKeyForAuthenticated: [
      "POST /user/gpg_keys",
      {},
      { renamed: ["users", "createGpgKeyForAuthenticatedUser"] }
    ],
    createGpgKeyForAuthenticatedUser: ["POST /user/gpg_keys"],
    createPublicSshKeyForAuthenticated: [
      "POST /user/keys",
      {},
      { renamed: ["users", "createPublicSshKeyForAuthenticatedUser"] }
    ],
    createPublicSshKeyForAuthenticatedUser: ["POST /user/keys"],
    deleteEmailForAuthenticated: [
      "DELETE /user/emails",
      {},
      { renamed: ["users", "deleteEmailForAuthenticatedUser"] }
    ],
    deleteEmailForAuthenticatedUser: ["DELETE /user/emails"],
    deleteGpgKeyForAuthenticated: [
      "DELETE /user/gpg_keys/{gpg_key_id}",
      {},
      { renamed: ["users", "deleteGpgKeyForAuthenticatedUser"] }
    ],
    deleteGpgKeyForAuthenticatedUser: ["DELETE /user/gpg_keys/{gpg_key_id}"],
    deletePublicSshKeyForAuthenticated: [
      "DELETE /user/keys/{key_id}",
      {},
      { renamed: ["users", "deletePublicSshKeyForAuthenticatedUser"] }
    ],
    deletePublicSshKeyForAuthenticatedUser: ["DELETE /user/keys/{key_id}"],
    follow: ["PUT /user/following/{username}"],
    getAuthenticated: ["GET /user"],
    getByUsername: ["GET /users/{username}"],
    getContextForUser: ["GET /users/{username}/hovercard"],
    getGpgKeyForAuthenticated: [
      "GET /user/gpg_keys/{gpg_key_id}",
      {},
      { renamed: ["users", "getGpgKeyForAuthenticatedUser"] }
    ],
    getGpgKeyForAuthenticatedUser: ["GET /user/gpg_keys/{gpg_key_id}"],
    getPublicSshKeyForAuthenticated: [
      "GET /user/keys/{key_id}",
      {},
      { renamed: ["users", "getPublicSshKeyForAuthenticatedUser"] }
    ],
    getPublicSshKeyForAuthenticatedUser: ["GET /user/keys/{key_id}"],
    list: ["GET /users"],
    listBlockedByAuthenticated: [
      "GET /user/blocks",
      {},
      { renamed: ["users", "listBlockedByAuthenticatedUser"] }
    ],
    listBlockedByAuthenticatedUser: ["GET /user/blocks"],
    listEmailsForAuthenticated: [
      "GET /user/emails",
      {},
      { renamed: ["users", "listEmailsForAuthenticatedUser"] }
    ],
    listEmailsForAuthenticatedUser: ["GET /user/emails"],
    listFollowedByAuthenticated: [
      "GET /user/following",
      {},
      { renamed: ["users", "listFollowedByAuthenticatedUser"] }
    ],
    listFollowedByAuthenticatedUser: ["GET /user/following"],
    listFollowersForAuthenticatedUser: ["GET /user/followers"],
    listFollowersForUser: ["GET /users/{username}/followers"],
    listFollowingForUser: ["GET /users/{username}/following"],
    listGpgKeysForAuthenticated: [
      "GET /user/gpg_keys",
      {},
      { renamed: ["users", "listGpgKeysForAuthenticatedUser"] }
    ],
    listGpgKeysForAuthenticatedUser: ["GET /user/gpg_keys"],
    listGpgKeysForUser: ["GET /users/{username}/gpg_keys"],
    listPublicEmailsForAuthenticated: [
      "GET /user/public_emails",
      {},
      { renamed: ["users", "listPublicEmailsForAuthenticatedUser"] }
    ],
    listPublicEmailsForAuthenticatedUser: ["GET /user/public_emails"],
    listPublicKeysForUser: ["GET /users/{username}/keys"],
    listPublicSshKeysForAuthenticated: [
      "GET /user/keys",
      {},
      { renamed: ["users", "listPublicSshKeysForAuthenticatedUser"] }
    ],
    listPublicSshKeysForAuthenticatedUser: ["GET /user/keys"],
    setPrimaryEmailVisibilityForAuthenticated: [
      "PATCH /user/email/visibility",
      {},
      { renamed: ["users", "setPrimaryEmailVisibilityForAuthenticatedUser"] }
    ],
    setPrimaryEmailVisibilityForAuthenticatedUser: [
      "PATCH /user/email/visibility"
    ],
    unblock: ["DELETE /user/blocks/{username}"],
    unfollow: ["DELETE /user/following/{username}"],
    updateAuthenticated: ["PATCH /user"]
  }
};
const VERSION$1 = "5.16.2";
function endpointsToMethods(octokit, endpointsMap) {
  const newMethods = {};
  for (const [scope, endpoints] of Object.entries(endpointsMap)) {
    for (const [methodName, endpoint2] of Object.entries(endpoints)) {
      const [route, defaults2, decorations] = endpoint2;
      const [method, url] = route.split(/ /);
      const endpointDefaults = Object.assign({ method, url }, defaults2);
      if (!newMethods[scope]) {
        newMethods[scope] = {};
      }
      const scopeMethods = newMethods[scope];
      if (decorations) {
        scopeMethods[methodName] = decorate(octokit, scope, methodName, endpointDefaults, decorations);
        continue;
      }
      scopeMethods[methodName] = octokit.request.defaults(endpointDefaults);
    }
  }
  return newMethods;
}
function decorate(octokit, scope, methodName, defaults2, decorations) {
  const requestWithDefaults = octokit.request.defaults(defaults2);
  function withDecorations(...args) {
    let options = requestWithDefaults.endpoint.merge(...args);
    if (decorations.mapToData) {
      options = Object.assign({}, options, {
        data: options[decorations.mapToData],
        [decorations.mapToData]: void 0
      });
      return requestWithDefaults(options);
    }
    if (decorations.renamed) {
      const [newScope, newMethodName] = decorations.renamed;
      octokit.log.warn(`octokit.${scope}.${methodName}() has been renamed to octokit.${newScope}.${newMethodName}()`);
    }
    if (decorations.deprecated) {
      octokit.log.warn(decorations.deprecated);
    }
    if (decorations.renamedParameters) {
      const options2 = requestWithDefaults.endpoint.merge(...args);
      for (const [name, alias] of Object.entries(decorations.renamedParameters)) {
        if (name in options2) {
          octokit.log.warn(`"${name}" parameter is deprecated for "octokit.${scope}.${methodName}()". Use "${alias}" instead`);
          if (!(alias in options2)) {
            options2[alias] = options2[name];
          }
          delete options2[name];
        }
      }
      return requestWithDefaults(options2);
    }
    return requestWithDefaults(...args);
  }
  return Object.assign(withDecorations, requestWithDefaults);
}
function restEndpointMethods(octokit) {
  const api = endpointsToMethods(octokit, Endpoints);
  return {
    rest: api
  };
}
restEndpointMethods.VERSION = VERSION$1;
function legacyRestEndpointMethods(octokit) {
  const api = endpointsToMethods(octokit, Endpoints);
  return {
    ...api,
    rest: api
  };
}
legacyRestEndpointMethods.VERSION = VERSION$1;
const distWeb$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  legacyRestEndpointMethods,
  restEndpointMethods
}, Symbol.toStringTag, { value: "Module" }));
const require$$3 = /* @__PURE__ */ getAugmentedNamespace(distWeb$1);
const VERSION = "2.21.3";
function normalizePaginatedListResponse(response) {
  if (!response.data) {
    return {
      ...response,
      data: []
    };
  }
  const responseNeedsNormalization = "total_count" in response.data && !("url" in response.data);
  if (!responseNeedsNormalization)
    return response;
  const incompleteResults = response.data.incomplete_results;
  const repositorySelection = response.data.repository_selection;
  const totalCount = response.data.total_count;
  delete response.data.incomplete_results;
  delete response.data.repository_selection;
  delete response.data.total_count;
  const namespaceKey = Object.keys(response.data)[0];
  const data = response.data[namespaceKey];
  response.data = data;
  if (typeof incompleteResults !== "undefined") {
    response.data.incomplete_results = incompleteResults;
  }
  if (typeof repositorySelection !== "undefined") {
    response.data.repository_selection = repositorySelection;
  }
  response.data.total_count = totalCount;
  return response;
}
function iterator(octokit, route, parameters) {
  const options = typeof route === "function" ? route.endpoint(parameters) : octokit.request.endpoint(route, parameters);
  const requestMethod = typeof route === "function" ? route : octokit.request;
  const method = options.method;
  const headers = options.headers;
  let url = options.url;
  return {
    [Symbol.asyncIterator]: () => ({
      async next() {
        if (!url)
          return { done: true };
        try {
          const response = await requestMethod({ method, url, headers });
          const normalizedResponse = normalizePaginatedListResponse(response);
          url = ((normalizedResponse.headers.link || "").match(/<([^>]+)>;\s*rel="next"/) || [])[1];
          return { value: normalizedResponse };
        } catch (error) {
          if (error.status !== 409)
            throw error;
          url = "";
          return {
            value: {
              status: 200,
              headers: {},
              data: []
            }
          };
        }
      }
    })
  };
}
function paginate(octokit, route, parameters, mapFn) {
  if (typeof parameters === "function") {
    mapFn = parameters;
    parameters = void 0;
  }
  return gather(octokit, [], iterator(octokit, route, parameters)[Symbol.asyncIterator](), mapFn);
}
function gather(octokit, results, iterator2, mapFn) {
  return iterator2.next().then((result) => {
    if (result.done) {
      return results;
    }
    let earlyExit = false;
    function done() {
      earlyExit = true;
    }
    results = results.concat(mapFn ? mapFn(result.value, done) : result.value.data);
    if (earlyExit) {
      return results;
    }
    return gather(octokit, results, iterator2, mapFn);
  });
}
const composePaginateRest = Object.assign(paginate, {
  iterator
});
const paginatingEndpoints = [
  "GET /app/hook/deliveries",
  "GET /app/installations",
  "GET /applications/grants",
  "GET /authorizations",
  "GET /enterprises/{enterprise}/actions/permissions/organizations",
  "GET /enterprises/{enterprise}/actions/runner-groups",
  "GET /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/organizations",
  "GET /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/runners",
  "GET /enterprises/{enterprise}/actions/runners",
  "GET /enterprises/{enterprise}/audit-log",
  "GET /enterprises/{enterprise}/secret-scanning/alerts",
  "GET /enterprises/{enterprise}/settings/billing/advanced-security",
  "GET /events",
  "GET /gists",
  "GET /gists/public",
  "GET /gists/starred",
  "GET /gists/{gist_id}/comments",
  "GET /gists/{gist_id}/commits",
  "GET /gists/{gist_id}/forks",
  "GET /installation/repositories",
  "GET /issues",
  "GET /licenses",
  "GET /marketplace_listing/plans",
  "GET /marketplace_listing/plans/{plan_id}/accounts",
  "GET /marketplace_listing/stubbed/plans",
  "GET /marketplace_listing/stubbed/plans/{plan_id}/accounts",
  "GET /networks/{owner}/{repo}/events",
  "GET /notifications",
  "GET /organizations",
  "GET /orgs/{org}/actions/cache/usage-by-repository",
  "GET /orgs/{org}/actions/permissions/repositories",
  "GET /orgs/{org}/actions/runner-groups",
  "GET /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories",
  "GET /orgs/{org}/actions/runner-groups/{runner_group_id}/runners",
  "GET /orgs/{org}/actions/runners",
  "GET /orgs/{org}/actions/secrets",
  "GET /orgs/{org}/actions/secrets/{secret_name}/repositories",
  "GET /orgs/{org}/audit-log",
  "GET /orgs/{org}/blocks",
  "GET /orgs/{org}/code-scanning/alerts",
  "GET /orgs/{org}/codespaces",
  "GET /orgs/{org}/credential-authorizations",
  "GET /orgs/{org}/dependabot/secrets",
  "GET /orgs/{org}/dependabot/secrets/{secret_name}/repositories",
  "GET /orgs/{org}/events",
  "GET /orgs/{org}/external-groups",
  "GET /orgs/{org}/failed_invitations",
  "GET /orgs/{org}/hooks",
  "GET /orgs/{org}/hooks/{hook_id}/deliveries",
  "GET /orgs/{org}/installations",
  "GET /orgs/{org}/invitations",
  "GET /orgs/{org}/invitations/{invitation_id}/teams",
  "GET /orgs/{org}/issues",
  "GET /orgs/{org}/members",
  "GET /orgs/{org}/migrations",
  "GET /orgs/{org}/migrations/{migration_id}/repositories",
  "GET /orgs/{org}/outside_collaborators",
  "GET /orgs/{org}/packages",
  "GET /orgs/{org}/packages/{package_type}/{package_name}/versions",
  "GET /orgs/{org}/projects",
  "GET /orgs/{org}/public_members",
  "GET /orgs/{org}/repos",
  "GET /orgs/{org}/secret-scanning/alerts",
  "GET /orgs/{org}/settings/billing/advanced-security",
  "GET /orgs/{org}/team-sync/groups",
  "GET /orgs/{org}/teams",
  "GET /orgs/{org}/teams/{team_slug}/discussions",
  "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments",
  "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions",
  "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions",
  "GET /orgs/{org}/teams/{team_slug}/invitations",
  "GET /orgs/{org}/teams/{team_slug}/members",
  "GET /orgs/{org}/teams/{team_slug}/projects",
  "GET /orgs/{org}/teams/{team_slug}/repos",
  "GET /orgs/{org}/teams/{team_slug}/teams",
  "GET /projects/columns/{column_id}/cards",
  "GET /projects/{project_id}/collaborators",
  "GET /projects/{project_id}/columns",
  "GET /repos/{owner}/{repo}/actions/artifacts",
  "GET /repos/{owner}/{repo}/actions/caches",
  "GET /repos/{owner}/{repo}/actions/runners",
  "GET /repos/{owner}/{repo}/actions/runs",
  "GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts",
  "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs",
  "GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs",
  "GET /repos/{owner}/{repo}/actions/secrets",
  "GET /repos/{owner}/{repo}/actions/workflows",
  "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs",
  "GET /repos/{owner}/{repo}/assignees",
  "GET /repos/{owner}/{repo}/branches",
  "GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations",
  "GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs",
  "GET /repos/{owner}/{repo}/code-scanning/alerts",
  "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",
  "GET /repos/{owner}/{repo}/code-scanning/analyses",
  "GET /repos/{owner}/{repo}/codespaces",
  "GET /repos/{owner}/{repo}/codespaces/devcontainers",
  "GET /repos/{owner}/{repo}/codespaces/secrets",
  "GET /repos/{owner}/{repo}/collaborators",
  "GET /repos/{owner}/{repo}/comments",
  "GET /repos/{owner}/{repo}/comments/{comment_id}/reactions",
  "GET /repos/{owner}/{repo}/commits",
  "GET /repos/{owner}/{repo}/commits/{commit_sha}/comments",
  "GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls",
  "GET /repos/{owner}/{repo}/commits/{ref}/check-runs",
  "GET /repos/{owner}/{repo}/commits/{ref}/check-suites",
  "GET /repos/{owner}/{repo}/commits/{ref}/status",
  "GET /repos/{owner}/{repo}/commits/{ref}/statuses",
  "GET /repos/{owner}/{repo}/contributors",
  "GET /repos/{owner}/{repo}/dependabot/secrets",
  "GET /repos/{owner}/{repo}/deployments",
  "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses",
  "GET /repos/{owner}/{repo}/environments",
  "GET /repos/{owner}/{repo}/events",
  "GET /repos/{owner}/{repo}/forks",
  "GET /repos/{owner}/{repo}/git/matching-refs/{ref}",
  "GET /repos/{owner}/{repo}/hooks",
  "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries",
  "GET /repos/{owner}/{repo}/invitations",
  "GET /repos/{owner}/{repo}/issues",
  "GET /repos/{owner}/{repo}/issues/comments",
  "GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions",
  "GET /repos/{owner}/{repo}/issues/events",
  "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
  "GET /repos/{owner}/{repo}/issues/{issue_number}/events",
  "GET /repos/{owner}/{repo}/issues/{issue_number}/labels",
  "GET /repos/{owner}/{repo}/issues/{issue_number}/reactions",
  "GET /repos/{owner}/{repo}/issues/{issue_number}/timeline",
  "GET /repos/{owner}/{repo}/keys",
  "GET /repos/{owner}/{repo}/labels",
  "GET /repos/{owner}/{repo}/milestones",
  "GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels",
  "GET /repos/{owner}/{repo}/notifications",
  "GET /repos/{owner}/{repo}/pages/builds",
  "GET /repos/{owner}/{repo}/projects",
  "GET /repos/{owner}/{repo}/pulls",
  "GET /repos/{owner}/{repo}/pulls/comments",
  "GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions",
  "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments",
  "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
  "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
  "GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers",
  "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
  "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments",
  "GET /repos/{owner}/{repo}/releases",
  "GET /repos/{owner}/{repo}/releases/{release_id}/assets",
  "GET /repos/{owner}/{repo}/releases/{release_id}/reactions",
  "GET /repos/{owner}/{repo}/secret-scanning/alerts",
  "GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/locations",
  "GET /repos/{owner}/{repo}/stargazers",
  "GET /repos/{owner}/{repo}/subscribers",
  "GET /repos/{owner}/{repo}/tags",
  "GET /repos/{owner}/{repo}/teams",
  "GET /repos/{owner}/{repo}/topics",
  "GET /repositories",
  "GET /repositories/{repository_id}/environments/{environment_name}/secrets",
  "GET /search/code",
  "GET /search/commits",
  "GET /search/issues",
  "GET /search/labels",
  "GET /search/repositories",
  "GET /search/topics",
  "GET /search/users",
  "GET /teams/{team_id}/discussions",
  "GET /teams/{team_id}/discussions/{discussion_number}/comments",
  "GET /teams/{team_id}/discussions/{discussion_number}/comments/{comment_number}/reactions",
  "GET /teams/{team_id}/discussions/{discussion_number}/reactions",
  "GET /teams/{team_id}/invitations",
  "GET /teams/{team_id}/members",
  "GET /teams/{team_id}/projects",
  "GET /teams/{team_id}/repos",
  "GET /teams/{team_id}/teams",
  "GET /user/blocks",
  "GET /user/codespaces",
  "GET /user/codespaces/secrets",
  "GET /user/emails",
  "GET /user/followers",
  "GET /user/following",
  "GET /user/gpg_keys",
  "GET /user/installations",
  "GET /user/installations/{installation_id}/repositories",
  "GET /user/issues",
  "GET /user/keys",
  "GET /user/marketplace_purchases",
  "GET /user/marketplace_purchases/stubbed",
  "GET /user/memberships/orgs",
  "GET /user/migrations",
  "GET /user/migrations/{migration_id}/repositories",
  "GET /user/orgs",
  "GET /user/packages",
  "GET /user/packages/{package_type}/{package_name}/versions",
  "GET /user/public_emails",
  "GET /user/repos",
  "GET /user/repository_invitations",
  "GET /user/starred",
  "GET /user/subscriptions",
  "GET /user/teams",
  "GET /users",
  "GET /users/{username}/events",
  "GET /users/{username}/events/orgs/{org}",
  "GET /users/{username}/events/public",
  "GET /users/{username}/followers",
  "GET /users/{username}/following",
  "GET /users/{username}/gists",
  "GET /users/{username}/gpg_keys",
  "GET /users/{username}/keys",
  "GET /users/{username}/orgs",
  "GET /users/{username}/packages",
  "GET /users/{username}/projects",
  "GET /users/{username}/received_events",
  "GET /users/{username}/received_events/public",
  "GET /users/{username}/repos",
  "GET /users/{username}/starred",
  "GET /users/{username}/subscriptions"
];
function isPaginatingEndpoint(arg) {
  if (typeof arg === "string") {
    return paginatingEndpoints.includes(arg);
  } else {
    return false;
  }
}
function paginateRest(octokit) {
  return {
    paginate: Object.assign(paginate.bind(null, octokit), {
      iterator: iterator.bind(null, octokit)
    })
  };
}
paginateRest.VERSION = VERSION;
const distWeb = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  composePaginateRest,
  isPaginatingEndpoint,
  paginateRest,
  paginatingEndpoints
}, Symbol.toStringTag, { value: "Module" }));
const require$$4 = /* @__PURE__ */ getAugmentedNamespace(distWeb);
(function(exports2) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k2, k22) {
    if (k22 === void 0)
      k22 = k2;
    Object.defineProperty(o, k22, { enumerable: true, get: function() {
      return m[k2];
    } });
  } : function(o, m, k2, k22) {
    if (k22 === void 0)
      k22 = k2;
    o[k22] = m[k2];
  });
  var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k2 in mod)
        if (k2 !== "default" && Object.hasOwnProperty.call(mod, k2))
          __createBinding2(result, mod, k2);
    }
    __setModuleDefault2(result, mod);
    return result;
  };
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.getOctokitOptions = exports2.GitHub = exports2.defaults = exports2.context = void 0;
  const Context3 = __importStar2(context$1);
  const Utils = __importStar2(utils$1);
  const core_12 = require$$2;
  const plugin_rest_endpoint_methods_1 = require$$3;
  const plugin_paginate_rest_1 = require$$4;
  exports2.context = new Context3.Context();
  const baseUrl = Utils.getApiBaseUrl();
  exports2.defaults = {
    baseUrl,
    request: {
      agent: Utils.getProxyAgent(baseUrl)
    }
  };
  exports2.GitHub = core_12.Octokit.plugin(plugin_rest_endpoint_methods_1.restEndpointMethods, plugin_paginate_rest_1.paginateRest).defaults(exports2.defaults);
  function getOctokitOptions(token, options) {
    const opts = Object.assign({}, options || {});
    const auth2 = Utils.getAuthString(token, opts);
    if (auth2) {
      opts.auth = auth2;
    }
    return opts;
  }
  exports2.getOctokitOptions = getOctokitOptions;
})(utils$2);
var __createBinding$7 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  Object.defineProperty(o, k22, { enumerable: true, get: function() {
    return m[k2];
  } });
} : function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  o[k22] = m[k2];
});
var __setModuleDefault$7 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$7 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k2 in mod)
      if (k2 !== "default" && Object.hasOwnProperty.call(mod, k2))
        __createBinding$7(result, mod, k2);
  }
  __setModuleDefault$7(result, mod);
  return result;
};
Object.defineProperty(github, "__esModule", { value: true });
var getOctokit_1 = github.getOctokit = context = github.context = void 0;
const Context2 = __importStar$7(context$1);
const utils_1$5 = utils$2;
var context = github.context = new Context2.Context();
function getOctokit(token, options, ...additionalPlugins) {
  const GitHubWithPlugins = utils_1$5.GitHub.plugin(...additionalPlugins);
  return new GitHubWithPlugins(utils_1$5.getOctokitOptions(token, options));
}
getOctokit_1 = github.getOctokit = getOctokit;
var artifactClient$1 = {};
var artifactClient = {};
var uploadSpecification = {};
var pathAndArtifactNameValidation = {};
Object.defineProperty(pathAndArtifactNameValidation, "__esModule", { value: true });
pathAndArtifactNameValidation.checkArtifactFilePath = pathAndArtifactNameValidation.checkArtifactName = void 0;
const core_1$3 = requireCore();
const invalidArtifactFilePathCharacters = /* @__PURE__ */ new Map([
  ['"', ' Double quote "'],
  [":", " Colon :"],
  ["<", " Less than <"],
  [">", " Greater than >"],
  ["|", " Vertical bar |"],
  ["*", " Asterisk *"],
  ["?", " Question mark ?"],
  ["\r", " Carriage return \\r"],
  ["\n", " Line feed \\n"]
]);
const invalidArtifactNameCharacters = new Map([
  ...invalidArtifactFilePathCharacters,
  ["\\", " Backslash \\"],
  ["/", " Forward slash /"]
]);
function checkArtifactName(name) {
  if (!name) {
    throw new Error(`Artifact name: ${name}, is incorrectly provided`);
  }
  for (const [invalidCharacterKey, errorMessageForCharacter] of invalidArtifactNameCharacters) {
    if (name.includes(invalidCharacterKey)) {
      throw new Error(`Artifact name is not valid: ${name}. Contains the following character: ${errorMessageForCharacter}
          
Invalid characters include: ${Array.from(invalidArtifactNameCharacters.values()).toString()}
          
These characters are not allowed in the artifact name due to limitations with certain file systems such as NTFS. To maintain file system agnostic behavior, these characters are intentionally not allowed to prevent potential problems with downloads on different file systems.`);
    }
  }
  core_1$3.info(`Artifact name is valid!`);
}
pathAndArtifactNameValidation.checkArtifactName = checkArtifactName;
function checkArtifactFilePath(path2) {
  if (!path2) {
    throw new Error(`Artifact path: ${path2}, is incorrectly provided`);
  }
  for (const [invalidCharacterKey, errorMessageForCharacter] of invalidArtifactFilePathCharacters) {
    if (path2.includes(invalidCharacterKey)) {
      throw new Error(`Artifact path is not valid: ${path2}. Contains the following character: ${errorMessageForCharacter}
          
Invalid characters include: ${Array.from(invalidArtifactFilePathCharacters.values()).toString()}
          
The following characters are not allowed in files that are uploaded due to limitations with certain file systems such as NTFS. To maintain file system agnostic behavior, these characters are intentionally not allowed to prevent potential problems with downloads on different file systems.
          `);
    }
  }
}
pathAndArtifactNameValidation.checkArtifactFilePath = checkArtifactFilePath;
var __createBinding$6 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  Object.defineProperty(o, k22, { enumerable: true, get: function() {
    return m[k2];
  } });
} : function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  o[k22] = m[k2];
});
var __setModuleDefault$6 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$6 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k2 in mod)
      if (k2 !== "default" && Object.hasOwnProperty.call(mod, k2))
        __createBinding$6(result, mod, k2);
  }
  __setModuleDefault$6(result, mod);
  return result;
};
Object.defineProperty(uploadSpecification, "__esModule", { value: true });
uploadSpecification.getUploadSpecification = void 0;
const fs$4 = __importStar$6(require$$0);
const core_1$2 = requireCore();
const path_1$1 = require$$4$2;
const path_and_artifact_name_validation_1$1 = pathAndArtifactNameValidation;
function getUploadSpecification(artifactName, rootDirectory, artifactFiles) {
  const specifications = [];
  if (!fs$4.existsSync(rootDirectory)) {
    throw new Error(`Provided rootDirectory ${rootDirectory} does not exist`);
  }
  if (!fs$4.lstatSync(rootDirectory).isDirectory()) {
    throw new Error(`Provided rootDirectory ${rootDirectory} is not a valid directory`);
  }
  rootDirectory = path_1$1.normalize(rootDirectory);
  rootDirectory = path_1$1.resolve(rootDirectory);
  for (let file of artifactFiles) {
    if (!fs$4.existsSync(file)) {
      throw new Error(`File ${file} does not exist`);
    }
    if (!fs$4.lstatSync(file).isDirectory()) {
      file = path_1$1.normalize(file);
      file = path_1$1.resolve(file);
      if (!file.startsWith(rootDirectory)) {
        throw new Error(`The rootDirectory: ${rootDirectory} is not a parent directory of the file: ${file}`);
      }
      const uploadPath = file.replace(rootDirectory, "");
      path_and_artifact_name_validation_1$1.checkArtifactFilePath(uploadPath);
      specifications.push({
        absoluteFilePath: file,
        uploadFilePath: path_1$1.join(artifactName, uploadPath)
      });
    } else {
      core_1$2.debug(`Removing ${file} from rawSearchResults because it is a directory`);
    }
  }
  return specifications;
}
uploadSpecification.getUploadSpecification = getUploadSpecification;
var uploadHttpClient = {};
var tmpPromise = { exports: {} };
var tmp$1 = { exports: {} };
var old = {};
var hasRequiredOld;
function requireOld() {
  if (hasRequiredOld)
    return old;
  hasRequiredOld = 1;
  var pathModule = require$$4$2;
  var isWindows2 = process.platform === "win32";
  var fs2 = require$$0;
  var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);
  function rethrow() {
    var callback;
    if (DEBUG) {
      var backtrace = new Error();
      callback = debugCallback;
    } else
      callback = missingCallback;
    return callback;
    function debugCallback(err) {
      if (err) {
        backtrace.message = err.message;
        err = backtrace;
        missingCallback(err);
      }
    }
    function missingCallback(err) {
      if (err) {
        if (process.throwDeprecation)
          throw err;
        else if (!process.noDeprecation) {
          var msg = "fs: missing callback " + (err.stack || err.message);
          if (process.traceDeprecation)
            console.trace(msg);
          else
            console.error(msg);
        }
      }
    }
  }
  function maybeCallback(cb) {
    return typeof cb === "function" ? cb : rethrow();
  }
  pathModule.normalize;
  if (isWindows2) {
    var nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
  } else {
    var nextPartRe = /(.*?)(?:[\/]+|$)/g;
  }
  if (isWindows2) {
    var splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
  } else {
    var splitRootRe = /^[\/]*/;
  }
  old.realpathSync = function realpathSync(p, cache) {
    p = pathModule.resolve(p);
    if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
      return cache[p];
    }
    var original = p, seenLinks = {}, knownHard = {};
    var pos;
    var current;
    var base;
    var previous;
    start();
    function start() {
      var m = splitRootRe.exec(p);
      pos = m[0].length;
      current = m[0];
      base = m[0];
      previous = "";
      if (isWindows2 && !knownHard[base]) {
        fs2.lstatSync(base);
        knownHard[base] = true;
      }
    }
    while (pos < p.length) {
      nextPartRe.lastIndex = pos;
      var result = nextPartRe.exec(p);
      previous = current;
      current += result[0];
      base = previous + result[1];
      pos = nextPartRe.lastIndex;
      if (knownHard[base] || cache && cache[base] === base) {
        continue;
      }
      var resolvedLink;
      if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
        resolvedLink = cache[base];
      } else {
        var stat2 = fs2.lstatSync(base);
        if (!stat2.isSymbolicLink()) {
          knownHard[base] = true;
          if (cache)
            cache[base] = base;
          continue;
        }
        var linkTarget = null;
        if (!isWindows2) {
          var id = stat2.dev.toString(32) + ":" + stat2.ino.toString(32);
          if (seenLinks.hasOwnProperty(id)) {
            linkTarget = seenLinks[id];
          }
        }
        if (linkTarget === null) {
          fs2.statSync(base);
          linkTarget = fs2.readlinkSync(base);
        }
        resolvedLink = pathModule.resolve(previous, linkTarget);
        if (cache)
          cache[base] = resolvedLink;
        if (!isWindows2)
          seenLinks[id] = linkTarget;
      }
      p = pathModule.resolve(resolvedLink, p.slice(pos));
      start();
    }
    if (cache)
      cache[original] = p;
    return p;
  };
  old.realpath = function realpath(p, cache, cb) {
    if (typeof cb !== "function") {
      cb = maybeCallback(cache);
      cache = null;
    }
    p = pathModule.resolve(p);
    if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
      return process.nextTick(cb.bind(null, null, cache[p]));
    }
    var original = p, seenLinks = {}, knownHard = {};
    var pos;
    var current;
    var base;
    var previous;
    start();
    function start() {
      var m = splitRootRe.exec(p);
      pos = m[0].length;
      current = m[0];
      base = m[0];
      previous = "";
      if (isWindows2 && !knownHard[base]) {
        fs2.lstat(base, function(err) {
          if (err)
            return cb(err);
          knownHard[base] = true;
          LOOP();
        });
      } else {
        process.nextTick(LOOP);
      }
    }
    function LOOP() {
      if (pos >= p.length) {
        if (cache)
          cache[original] = p;
        return cb(null, p);
      }
      nextPartRe.lastIndex = pos;
      var result = nextPartRe.exec(p);
      previous = current;
      current += result[0];
      base = previous + result[1];
      pos = nextPartRe.lastIndex;
      if (knownHard[base] || cache && cache[base] === base) {
        return process.nextTick(LOOP);
      }
      if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
        return gotResolvedLink(cache[base]);
      }
      return fs2.lstat(base, gotStat);
    }
    function gotStat(err, stat2) {
      if (err)
        return cb(err);
      if (!stat2.isSymbolicLink()) {
        knownHard[base] = true;
        if (cache)
          cache[base] = base;
        return process.nextTick(LOOP);
      }
      if (!isWindows2) {
        var id = stat2.dev.toString(32) + ":" + stat2.ino.toString(32);
        if (seenLinks.hasOwnProperty(id)) {
          return gotTarget(null, seenLinks[id], base);
        }
      }
      fs2.stat(base, function(err2) {
        if (err2)
          return cb(err2);
        fs2.readlink(base, function(err3, target) {
          if (!isWindows2)
            seenLinks[id] = target;
          gotTarget(err3, target);
        });
      });
    }
    function gotTarget(err, target, base2) {
      if (err)
        return cb(err);
      var resolvedLink = pathModule.resolve(previous, target);
      if (cache)
        cache[base2] = resolvedLink;
      gotResolvedLink(resolvedLink);
    }
    function gotResolvedLink(resolvedLink) {
      p = pathModule.resolve(resolvedLink, p.slice(pos));
      start();
    }
  };
  return old;
}
var fs_realpath;
var hasRequiredFs_realpath;
function requireFs_realpath() {
  if (hasRequiredFs_realpath)
    return fs_realpath;
  hasRequiredFs_realpath = 1;
  fs_realpath = realpath;
  realpath.realpath = realpath;
  realpath.sync = realpathSync;
  realpath.realpathSync = realpathSync;
  realpath.monkeypatch = monkeypatch;
  realpath.unmonkeypatch = unmonkeypatch;
  var fs2 = require$$0;
  var origRealpath = fs2.realpath;
  var origRealpathSync = fs2.realpathSync;
  var version2 = process.version;
  var ok = /^v[0-5]\./.test(version2);
  var old2 = requireOld();
  function newError(er) {
    return er && er.syscall === "realpath" && (er.code === "ELOOP" || er.code === "ENOMEM" || er.code === "ENAMETOOLONG");
  }
  function realpath(p, cache, cb) {
    if (ok) {
      return origRealpath(p, cache, cb);
    }
    if (typeof cache === "function") {
      cb = cache;
      cache = null;
    }
    origRealpath(p, cache, function(er, result) {
      if (newError(er)) {
        old2.realpath(p, cache, cb);
      } else {
        cb(er, result);
      }
    });
  }
  function realpathSync(p, cache) {
    if (ok) {
      return origRealpathSync(p, cache);
    }
    try {
      return origRealpathSync(p, cache);
    } catch (er) {
      if (newError(er)) {
        return old2.realpathSync(p, cache);
      } else {
        throw er;
      }
    }
  }
  function monkeypatch() {
    fs2.realpath = realpath;
    fs2.realpathSync = realpathSync;
  }
  function unmonkeypatch() {
    fs2.realpath = origRealpath;
    fs2.realpathSync = origRealpathSync;
  }
  return fs_realpath;
}
var concatMap;
var hasRequiredConcatMap;
function requireConcatMap() {
  if (hasRequiredConcatMap)
    return concatMap;
  hasRequiredConcatMap = 1;
  concatMap = function(xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
      var x = fn(xs[i], i);
      if (isArray(x))
        res.push.apply(res, x);
      else
        res.push(x);
    }
    return res;
  };
  var isArray = Array.isArray || function(xs) {
    return Object.prototype.toString.call(xs) === "[object Array]";
  };
  return concatMap;
}
var balancedMatch;
var hasRequiredBalancedMatch;
function requireBalancedMatch() {
  if (hasRequiredBalancedMatch)
    return balancedMatch;
  hasRequiredBalancedMatch = 1;
  balancedMatch = balanced;
  function balanced(a, b, str) {
    if (a instanceof RegExp)
      a = maybeMatch(a, str);
    if (b instanceof RegExp)
      b = maybeMatch(b, str);
    var r = range(a, b, str);
    return r && {
      start: r[0],
      end: r[1],
      pre: str.slice(0, r[0]),
      body: str.slice(r[0] + a.length, r[1]),
      post: str.slice(r[1] + b.length)
    };
  }
  function maybeMatch(reg, str) {
    var m = str.match(reg);
    return m ? m[0] : null;
  }
  balanced.range = range;
  function range(a, b, str) {
    var begs, beg, left, right, result;
    var ai = str.indexOf(a);
    var bi = str.indexOf(b, ai + 1);
    var i = ai;
    if (ai >= 0 && bi > 0) {
      if (a === b) {
        return [ai, bi];
      }
      begs = [];
      left = str.length;
      while (i >= 0 && !result) {
        if (i == ai) {
          begs.push(i);
          ai = str.indexOf(a, i + 1);
        } else if (begs.length == 1) {
          result = [begs.pop(), bi];
        } else {
          beg = begs.pop();
          if (beg < left) {
            left = beg;
            right = bi;
          }
          bi = str.indexOf(b, i + 1);
        }
        i = ai < bi && ai >= 0 ? ai : bi;
      }
      if (begs.length) {
        result = [left, right];
      }
    }
    return result;
  }
  return balancedMatch;
}
var braceExpansion;
var hasRequiredBraceExpansion;
function requireBraceExpansion() {
  if (hasRequiredBraceExpansion)
    return braceExpansion;
  hasRequiredBraceExpansion = 1;
  var concatMap2 = requireConcatMap();
  var balanced = requireBalancedMatch();
  braceExpansion = expandTop;
  var escSlash = "\0SLASH" + Math.random() + "\0";
  var escOpen = "\0OPEN" + Math.random() + "\0";
  var escClose = "\0CLOSE" + Math.random() + "\0";
  var escComma = "\0COMMA" + Math.random() + "\0";
  var escPeriod = "\0PERIOD" + Math.random() + "\0";
  function numeric(str) {
    return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
  }
  function escapeBraces(str) {
    return str.split("\\\\").join(escSlash).split("\\{").join(escOpen).split("\\}").join(escClose).split("\\,").join(escComma).split("\\.").join(escPeriod);
  }
  function unescapeBraces(str) {
    return str.split(escSlash).join("\\").split(escOpen).join("{").split(escClose).join("}").split(escComma).join(",").split(escPeriod).join(".");
  }
  function parseCommaParts(str) {
    if (!str)
      return [""];
    var parts = [];
    var m = balanced("{", "}", str);
    if (!m)
      return str.split(",");
    var pre = m.pre;
    var body = m.body;
    var post = m.post;
    var p = pre.split(",");
    p[p.length - 1] += "{" + body + "}";
    var postParts = parseCommaParts(post);
    if (post.length) {
      p[p.length - 1] += postParts.shift();
      p.push.apply(p, postParts);
    }
    parts.push.apply(parts, p);
    return parts;
  }
  function expandTop(str) {
    if (!str)
      return [];
    if (str.substr(0, 2) === "{}") {
      str = "\\{\\}" + str.substr(2);
    }
    return expand2(escapeBraces(str), true).map(unescapeBraces);
  }
  function embrace(str) {
    return "{" + str + "}";
  }
  function isPadded(el) {
    return /^-?0\d/.test(el);
  }
  function lte(i, y) {
    return i <= y;
  }
  function gte(i, y) {
    return i >= y;
  }
  function expand2(str, isTop) {
    var expansions = [];
    var m = balanced("{", "}", str);
    if (!m || /\$$/.test(m.pre))
      return [str];
    var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
    var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
    var isSequence = isNumericSequence || isAlphaSequence;
    var isOptions = m.body.indexOf(",") >= 0;
    if (!isSequence && !isOptions) {
      if (m.post.match(/,.*\}/)) {
        str = m.pre + "{" + m.body + escClose + m.post;
        return expand2(str);
      }
      return [str];
    }
    var n;
    if (isSequence) {
      n = m.body.split(/\.\./);
    } else {
      n = parseCommaParts(m.body);
      if (n.length === 1) {
        n = expand2(n[0], false).map(embrace);
        if (n.length === 1) {
          var post = m.post.length ? expand2(m.post, false) : [""];
          return post.map(function(p) {
            return m.pre + n[0] + p;
          });
        }
      }
    }
    var pre = m.pre;
    var post = m.post.length ? expand2(m.post, false) : [""];
    var N;
    if (isSequence) {
      var x = numeric(n[0]);
      var y = numeric(n[1]);
      var width = Math.max(n[0].length, n[1].length);
      var incr = n.length == 3 ? Math.abs(numeric(n[2])) : 1;
      var test = lte;
      var reverse = y < x;
      if (reverse) {
        incr *= -1;
        test = gte;
      }
      var pad = n.some(isPadded);
      N = [];
      for (var i = x; test(i, y); i += incr) {
        var c;
        if (isAlphaSequence) {
          c = String.fromCharCode(i);
          if (c === "\\")
            c = "";
        } else {
          c = String(i);
          if (pad) {
            var need = width - c.length;
            if (need > 0) {
              var z = new Array(need + 1).join("0");
              if (i < 0)
                c = "-" + z + c.slice(1);
              else
                c = z + c;
            }
          }
        }
        N.push(c);
      }
    } else {
      N = concatMap2(n, function(el) {
        return expand2(el, false);
      });
    }
    for (var j = 0; j < N.length; j++) {
      for (var k2 = 0; k2 < post.length; k2++) {
        var expansion = pre + N[j] + post[k2];
        if (!isTop || isSequence || expansion)
          expansions.push(expansion);
      }
    }
    return expansions;
  }
  return braceExpansion;
}
var minimatch_1;
var hasRequiredMinimatch;
function requireMinimatch() {
  if (hasRequiredMinimatch)
    return minimatch_1;
  hasRequiredMinimatch = 1;
  minimatch_1 = minimatch;
  minimatch.Minimatch = Minimatch;
  var path2 = function() {
    try {
      return require("path");
    } catch (e) {
    }
  }() || {
    sep: "/"
  };
  minimatch.sep = path2.sep;
  var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {};
  var expand2 = requireBraceExpansion();
  var plTypes = {
    "!": { open: "(?:(?!(?:", close: "))[^/]*?)" },
    "?": { open: "(?:", close: ")?" },
    "+": { open: "(?:", close: ")+" },
    "*": { open: "(?:", close: ")*" },
    "@": { open: "(?:", close: ")" }
  };
  var qmark = "[^/]";
  var star = qmark + "*?";
  var twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
  var twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
  var reSpecials = charSet("().*{}+?[]^$\\!");
  function charSet(s) {
    return s.split("").reduce(function(set, c) {
      set[c] = true;
      return set;
    }, {});
  }
  var slashSplit = /\/+/;
  minimatch.filter = filter;
  function filter(pattern, options) {
    options = options || {};
    return function(p, i, list) {
      return minimatch(p, pattern, options);
    };
  }
  function ext(a, b) {
    b = b || {};
    var t = {};
    Object.keys(a).forEach(function(k2) {
      t[k2] = a[k2];
    });
    Object.keys(b).forEach(function(k2) {
      t[k2] = b[k2];
    });
    return t;
  }
  minimatch.defaults = function(def) {
    if (!def || typeof def !== "object" || !Object.keys(def).length) {
      return minimatch;
    }
    var orig = minimatch;
    var m = function minimatch2(p, pattern, options) {
      return orig(p, pattern, ext(def, options));
    };
    m.Minimatch = function Minimatch2(pattern, options) {
      return new orig.Minimatch(pattern, ext(def, options));
    };
    m.Minimatch.defaults = function defaults2(options) {
      return orig.defaults(ext(def, options)).Minimatch;
    };
    m.filter = function filter2(pattern, options) {
      return orig.filter(pattern, ext(def, options));
    };
    m.defaults = function defaults2(options) {
      return orig.defaults(ext(def, options));
    };
    m.makeRe = function makeRe2(pattern, options) {
      return orig.makeRe(pattern, ext(def, options));
    };
    m.braceExpand = function braceExpand2(pattern, options) {
      return orig.braceExpand(pattern, ext(def, options));
    };
    m.match = function(list, pattern, options) {
      return orig.match(list, pattern, ext(def, options));
    };
    return m;
  };
  Minimatch.defaults = function(def) {
    return minimatch.defaults(def).Minimatch;
  };
  function minimatch(p, pattern, options) {
    assertValidPattern(pattern);
    if (!options)
      options = {};
    if (!options.nocomment && pattern.charAt(0) === "#") {
      return false;
    }
    return new Minimatch(pattern, options).match(p);
  }
  function Minimatch(pattern, options) {
    if (!(this instanceof Minimatch)) {
      return new Minimatch(pattern, options);
    }
    assertValidPattern(pattern);
    if (!options)
      options = {};
    pattern = pattern.trim();
    if (!options.allowWindowsEscape && path2.sep !== "/") {
      pattern = pattern.split(path2.sep).join("/");
    }
    this.options = options;
    this.set = [];
    this.pattern = pattern;
    this.regexp = null;
    this.negate = false;
    this.comment = false;
    this.empty = false;
    this.partial = !!options.partial;
    this.make();
  }
  Minimatch.prototype.debug = function() {
  };
  Minimatch.prototype.make = make;
  function make() {
    var pattern = this.pattern;
    var options = this.options;
    if (!options.nocomment && pattern.charAt(0) === "#") {
      this.comment = true;
      return;
    }
    if (!pattern) {
      this.empty = true;
      return;
    }
    this.parseNegate();
    var set = this.globSet = this.braceExpand();
    if (options.debug)
      this.debug = function debug2() {
        console.error.apply(console, arguments);
      };
    this.debug(this.pattern, set);
    set = this.globParts = set.map(function(s) {
      return s.split(slashSplit);
    });
    this.debug(this.pattern, set);
    set = set.map(function(s, si, set2) {
      return s.map(this.parse, this);
    }, this);
    this.debug(this.pattern, set);
    set = set.filter(function(s) {
      return s.indexOf(false) === -1;
    });
    this.debug(this.pattern, set);
    this.set = set;
  }
  Minimatch.prototype.parseNegate = parseNegate;
  function parseNegate() {
    var pattern = this.pattern;
    var negate = false;
    var options = this.options;
    var negateOffset = 0;
    if (options.nonegate)
      return;
    for (var i = 0, l = pattern.length; i < l && pattern.charAt(i) === "!"; i++) {
      negate = !negate;
      negateOffset++;
    }
    if (negateOffset)
      this.pattern = pattern.substr(negateOffset);
    this.negate = negate;
  }
  minimatch.braceExpand = function(pattern, options) {
    return braceExpand(pattern, options);
  };
  Minimatch.prototype.braceExpand = braceExpand;
  function braceExpand(pattern, options) {
    if (!options) {
      if (this instanceof Minimatch) {
        options = this.options;
      } else {
        options = {};
      }
    }
    pattern = typeof pattern === "undefined" ? this.pattern : pattern;
    assertValidPattern(pattern);
    if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
      return [pattern];
    }
    return expand2(pattern);
  }
  var MAX_PATTERN_LENGTH = 1024 * 64;
  var assertValidPattern = function(pattern) {
    if (typeof pattern !== "string") {
      throw new TypeError("invalid pattern");
    }
    if (pattern.length > MAX_PATTERN_LENGTH) {
      throw new TypeError("pattern is too long");
    }
  };
  Minimatch.prototype.parse = parse2;
  var SUBPARSE = {};
  function parse2(pattern, isSub) {
    assertValidPattern(pattern);
    var options = this.options;
    if (pattern === "**") {
      if (!options.noglobstar)
        return GLOBSTAR;
      else
        pattern = "*";
    }
    if (pattern === "")
      return "";
    var re = "";
    var hasMagic = !!options.nocase;
    var escaping = false;
    var patternListStack = [];
    var negativeLists = [];
    var stateChar;
    var inClass = false;
    var reClassStart = -1;
    var classStart = -1;
    var patternStart = pattern.charAt(0) === "." ? "" : options.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)";
    var self2 = this;
    function clearStateChar() {
      if (stateChar) {
        switch (stateChar) {
          case "*":
            re += star;
            hasMagic = true;
            break;
          case "?":
            re += qmark;
            hasMagic = true;
            break;
          default:
            re += "\\" + stateChar;
            break;
        }
        self2.debug("clearStateChar %j %j", stateChar, re);
        stateChar = false;
      }
    }
    for (var i = 0, len = pattern.length, c; i < len && (c = pattern.charAt(i)); i++) {
      this.debug("%s	%s %s %j", pattern, i, re, c);
      if (escaping && reSpecials[c]) {
        re += "\\" + c;
        escaping = false;
        continue;
      }
      switch (c) {
        case "/": {
          return false;
        }
        case "\\":
          clearStateChar();
          escaping = true;
          continue;
        case "?":
        case "*":
        case "+":
        case "@":
        case "!":
          this.debug("%s	%s %s %j <-- stateChar", pattern, i, re, c);
          if (inClass) {
            this.debug("  in class");
            if (c === "!" && i === classStart + 1)
              c = "^";
            re += c;
            continue;
          }
          self2.debug("call clearStateChar %j", stateChar);
          clearStateChar();
          stateChar = c;
          if (options.noext)
            clearStateChar();
          continue;
        case "(":
          if (inClass) {
            re += "(";
            continue;
          }
          if (!stateChar) {
            re += "\\(";
            continue;
          }
          patternListStack.push({
            type: stateChar,
            start: i - 1,
            reStart: re.length,
            open: plTypes[stateChar].open,
            close: plTypes[stateChar].close
          });
          re += stateChar === "!" ? "(?:(?!(?:" : "(?:";
          this.debug("plType %j %j", stateChar, re);
          stateChar = false;
          continue;
        case ")":
          if (inClass || !patternListStack.length) {
            re += "\\)";
            continue;
          }
          clearStateChar();
          hasMagic = true;
          var pl = patternListStack.pop();
          re += pl.close;
          if (pl.type === "!") {
            negativeLists.push(pl);
          }
          pl.reEnd = re.length;
          continue;
        case "|":
          if (inClass || !patternListStack.length || escaping) {
            re += "\\|";
            escaping = false;
            continue;
          }
          clearStateChar();
          re += "|";
          continue;
        case "[":
          clearStateChar();
          if (inClass) {
            re += "\\" + c;
            continue;
          }
          inClass = true;
          classStart = i;
          reClassStart = re.length;
          re += c;
          continue;
        case "]":
          if (i === classStart + 1 || !inClass) {
            re += "\\" + c;
            escaping = false;
            continue;
          }
          var cs = pattern.substring(classStart + 1, i);
          try {
            RegExp("[" + cs + "]");
          } catch (er) {
            var sp = this.parse(cs, SUBPARSE);
            re = re.substr(0, reClassStart) + "\\[" + sp[0] + "\\]";
            hasMagic = hasMagic || sp[1];
            inClass = false;
            continue;
          }
          hasMagic = true;
          inClass = false;
          re += c;
          continue;
        default:
          clearStateChar();
          if (escaping) {
            escaping = false;
          } else if (reSpecials[c] && !(c === "^" && inClass)) {
            re += "\\";
          }
          re += c;
      }
    }
    if (inClass) {
      cs = pattern.substr(classStart + 1);
      sp = this.parse(cs, SUBPARSE);
      re = re.substr(0, reClassStart) + "\\[" + sp[0];
      hasMagic = hasMagic || sp[1];
    }
    for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
      var tail = re.slice(pl.reStart + pl.open.length);
      this.debug("setting tail", re, pl);
      tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function(_, $1, $2) {
        if (!$2) {
          $2 = "\\";
        }
        return $1 + $1 + $2 + "|";
      });
      this.debug("tail=%j\n   %s", tail, tail, pl, re);
      var t = pl.type === "*" ? star : pl.type === "?" ? qmark : "\\" + pl.type;
      hasMagic = true;
      re = re.slice(0, pl.reStart) + t + "\\(" + tail;
    }
    clearStateChar();
    if (escaping) {
      re += "\\\\";
    }
    var addPatternStart = false;
    switch (re.charAt(0)) {
      case "[":
      case ".":
      case "(":
        addPatternStart = true;
    }
    for (var n = negativeLists.length - 1; n > -1; n--) {
      var nl = negativeLists[n];
      var nlBefore = re.slice(0, nl.reStart);
      var nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
      var nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
      var nlAfter = re.slice(nl.reEnd);
      nlLast += nlAfter;
      var openParensBefore = nlBefore.split("(").length - 1;
      var cleanAfter = nlAfter;
      for (i = 0; i < openParensBefore; i++) {
        cleanAfter = cleanAfter.replace(/\)[+*?]?/, "");
      }
      nlAfter = cleanAfter;
      var dollar = "";
      if (nlAfter === "" && isSub !== SUBPARSE) {
        dollar = "$";
      }
      var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
      re = newRe;
    }
    if (re !== "" && hasMagic) {
      re = "(?=.)" + re;
    }
    if (addPatternStart) {
      re = patternStart + re;
    }
    if (isSub === SUBPARSE) {
      return [re, hasMagic];
    }
    if (!hasMagic) {
      return globUnescape(pattern);
    }
    var flags = options.nocase ? "i" : "";
    try {
      var regExp = new RegExp("^" + re + "$", flags);
    } catch (er) {
      return new RegExp("$.");
    }
    regExp._glob = pattern;
    regExp._src = re;
    return regExp;
  }
  minimatch.makeRe = function(pattern, options) {
    return new Minimatch(pattern, options || {}).makeRe();
  };
  Minimatch.prototype.makeRe = makeRe;
  function makeRe() {
    if (this.regexp || this.regexp === false)
      return this.regexp;
    var set = this.set;
    if (!set.length) {
      this.regexp = false;
      return this.regexp;
    }
    var options = this.options;
    var twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
    var flags = options.nocase ? "i" : "";
    var re = set.map(function(pattern) {
      return pattern.map(function(p) {
        return p === GLOBSTAR ? twoStar : typeof p === "string" ? regExpEscape(p) : p._src;
      }).join("\\/");
    }).join("|");
    re = "^(?:" + re + ")$";
    if (this.negate)
      re = "^(?!" + re + ").*$";
    try {
      this.regexp = new RegExp(re, flags);
    } catch (ex) {
      this.regexp = false;
    }
    return this.regexp;
  }
  minimatch.match = function(list, pattern, options) {
    options = options || {};
    var mm = new Minimatch(pattern, options);
    list = list.filter(function(f) {
      return mm.match(f);
    });
    if (mm.options.nonull && !list.length) {
      list.push(pattern);
    }
    return list;
  };
  Minimatch.prototype.match = function match(f, partial) {
    if (typeof partial === "undefined")
      partial = this.partial;
    this.debug("match", f, this.pattern);
    if (this.comment)
      return false;
    if (this.empty)
      return f === "";
    if (f === "/" && partial)
      return true;
    var options = this.options;
    if (path2.sep !== "/") {
      f = f.split(path2.sep).join("/");
    }
    f = f.split(slashSplit);
    this.debug(this.pattern, "split", f);
    var set = this.set;
    this.debug(this.pattern, "set", set);
    var filename;
    var i;
    for (i = f.length - 1; i >= 0; i--) {
      filename = f[i];
      if (filename)
        break;
    }
    for (i = 0; i < set.length; i++) {
      var pattern = set[i];
      var file = f;
      if (options.matchBase && pattern.length === 1) {
        file = [filename];
      }
      var hit = this.matchOne(file, pattern, partial);
      if (hit) {
        if (options.flipNegate)
          return true;
        return !this.negate;
      }
    }
    if (options.flipNegate)
      return false;
    return this.negate;
  };
  Minimatch.prototype.matchOne = function(file, pattern, partial) {
    var options = this.options;
    this.debug(
      "matchOne",
      { "this": this, file, pattern }
    );
    this.debug("matchOne", file.length, pattern.length);
    for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
      this.debug("matchOne loop");
      var p = pattern[pi];
      var f = file[fi];
      this.debug(pattern, p, f);
      if (p === false)
        return false;
      if (p === GLOBSTAR) {
        this.debug("GLOBSTAR", [pattern, p, f]);
        var fr = fi;
        var pr = pi + 1;
        if (pr === pl) {
          this.debug("** at the end");
          for (; fi < fl; fi++) {
            if (file[fi] === "." || file[fi] === ".." || !options.dot && file[fi].charAt(0) === ".")
              return false;
          }
          return true;
        }
        while (fr < fl) {
          var swallowee = file[fr];
          this.debug("\nglobstar while", file, fr, pattern, pr, swallowee);
          if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
            this.debug("globstar found match!", fr, fl, swallowee);
            return true;
          } else {
            if (swallowee === "." || swallowee === ".." || !options.dot && swallowee.charAt(0) === ".") {
              this.debug("dot detected!", file, fr, pattern, pr);
              break;
            }
            this.debug("globstar swallow a segment, and continue");
            fr++;
          }
        }
        if (partial) {
          this.debug("\n>>> no match, partial?", file, fr, pattern, pr);
          if (fr === fl)
            return true;
        }
        return false;
      }
      var hit;
      if (typeof p === "string") {
        hit = f === p;
        this.debug("string match", p, f, hit);
      } else {
        hit = f.match(p);
        this.debug("pattern match", p, f, hit);
      }
      if (!hit)
        return false;
    }
    if (fi === fl && pi === pl) {
      return true;
    } else if (fi === fl) {
      return partial;
    } else if (pi === pl) {
      return fi === fl - 1 && file[fi] === "";
    }
    throw new Error("wtf?");
  };
  function globUnescape(s) {
    return s.replace(/\\(.)/g, "$1");
  }
  function regExpEscape(s) {
    return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
  return minimatch_1;
}
var inherits = { exports: {} };
var inherits_browser = { exports: {} };
var hasRequiredInherits_browser;
function requireInherits_browser() {
  if (hasRequiredInherits_browser)
    return inherits_browser.exports;
  hasRequiredInherits_browser = 1;
  if (typeof Object.create === "function") {
    inherits_browser.exports = function inherits2(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }
    };
  } else {
    inherits_browser.exports = function inherits2(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {
        };
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      }
    };
  }
  return inherits_browser.exports;
}
var hasRequiredInherits;
function requireInherits() {
  if (hasRequiredInherits)
    return inherits.exports;
  hasRequiredInherits = 1;
  try {
    var util2 = require("util");
    if (typeof util2.inherits !== "function")
      throw "";
    inherits.exports = util2.inherits;
  } catch (e) {
    inherits.exports = requireInherits_browser();
  }
  return inherits.exports;
}
var pathIsAbsolute = { exports: {} };
var hasRequiredPathIsAbsolute;
function requirePathIsAbsolute() {
  if (hasRequiredPathIsAbsolute)
    return pathIsAbsolute.exports;
  hasRequiredPathIsAbsolute = 1;
  function posix(path2) {
    return path2.charAt(0) === "/";
  }
  function win32(path2) {
    var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
    var result = splitDeviceRe.exec(path2);
    var device = result[1] || "";
    var isUnc = Boolean(device && device.charAt(1) !== ":");
    return Boolean(result[2] || isUnc);
  }
  pathIsAbsolute.exports = process.platform === "win32" ? win32 : posix;
  pathIsAbsolute.exports.posix = posix;
  pathIsAbsolute.exports.win32 = win32;
  return pathIsAbsolute.exports;
}
var common = {};
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon)
    return common;
  hasRequiredCommon = 1;
  common.setopts = setopts;
  common.ownProp = ownProp;
  common.makeAbs = makeAbs;
  common.finish = finish;
  common.mark = mark;
  common.isIgnored = isIgnored;
  common.childrenIgnored = childrenIgnored;
  function ownProp(obj, field) {
    return Object.prototype.hasOwnProperty.call(obj, field);
  }
  var fs2 = require$$0;
  var path2 = require$$4$2;
  var minimatch = requireMinimatch();
  var isAbsolute = requirePathIsAbsolute();
  var Minimatch = minimatch.Minimatch;
  function alphasort(a, b) {
    return a.localeCompare(b, "en");
  }
  function setupIgnores(self2, options) {
    self2.ignore = options.ignore || [];
    if (!Array.isArray(self2.ignore))
      self2.ignore = [self2.ignore];
    if (self2.ignore.length) {
      self2.ignore = self2.ignore.map(ignoreMap);
    }
  }
  function ignoreMap(pattern) {
    var gmatcher = null;
    if (pattern.slice(-3) === "/**") {
      var gpattern = pattern.replace(/(\/\*\*)+$/, "");
      gmatcher = new Minimatch(gpattern, { dot: true });
    }
    return {
      matcher: new Minimatch(pattern, { dot: true }),
      gmatcher
    };
  }
  function setopts(self2, pattern, options) {
    if (!options)
      options = {};
    if (options.matchBase && -1 === pattern.indexOf("/")) {
      if (options.noglobstar) {
        throw new Error("base matching requires globstar");
      }
      pattern = "**/" + pattern;
    }
    self2.silent = !!options.silent;
    self2.pattern = pattern;
    self2.strict = options.strict !== false;
    self2.realpath = !!options.realpath;
    self2.realpathCache = options.realpathCache || /* @__PURE__ */ Object.create(null);
    self2.follow = !!options.follow;
    self2.dot = !!options.dot;
    self2.mark = !!options.mark;
    self2.nodir = !!options.nodir;
    if (self2.nodir)
      self2.mark = true;
    self2.sync = !!options.sync;
    self2.nounique = !!options.nounique;
    self2.nonull = !!options.nonull;
    self2.nosort = !!options.nosort;
    self2.nocase = !!options.nocase;
    self2.stat = !!options.stat;
    self2.noprocess = !!options.noprocess;
    self2.absolute = !!options.absolute;
    self2.fs = options.fs || fs2;
    self2.maxLength = options.maxLength || Infinity;
    self2.cache = options.cache || /* @__PURE__ */ Object.create(null);
    self2.statCache = options.statCache || /* @__PURE__ */ Object.create(null);
    self2.symlinks = options.symlinks || /* @__PURE__ */ Object.create(null);
    setupIgnores(self2, options);
    self2.changedCwd = false;
    var cwd = process.cwd();
    if (!ownProp(options, "cwd"))
      self2.cwd = cwd;
    else {
      self2.cwd = path2.resolve(options.cwd);
      self2.changedCwd = self2.cwd !== cwd;
    }
    self2.root = options.root || path2.resolve(self2.cwd, "/");
    self2.root = path2.resolve(self2.root);
    if (process.platform === "win32")
      self2.root = self2.root.replace(/\\/g, "/");
    self2.cwdAbs = isAbsolute(self2.cwd) ? self2.cwd : makeAbs(self2, self2.cwd);
    if (process.platform === "win32")
      self2.cwdAbs = self2.cwdAbs.replace(/\\/g, "/");
    self2.nomount = !!options.nomount;
    options.nonegate = true;
    options.nocomment = true;
    options.allowWindowsEscape = false;
    self2.minimatch = new Minimatch(pattern, options);
    self2.options = self2.minimatch.options;
  }
  function finish(self2) {
    var nou = self2.nounique;
    var all = nou ? [] : /* @__PURE__ */ Object.create(null);
    for (var i = 0, l = self2.matches.length; i < l; i++) {
      var matches = self2.matches[i];
      if (!matches || Object.keys(matches).length === 0) {
        if (self2.nonull) {
          var literal = self2.minimatch.globSet[i];
          if (nou)
            all.push(literal);
          else
            all[literal] = true;
        }
      } else {
        var m = Object.keys(matches);
        if (nou)
          all.push.apply(all, m);
        else
          m.forEach(function(m2) {
            all[m2] = true;
          });
      }
    }
    if (!nou)
      all = Object.keys(all);
    if (!self2.nosort)
      all = all.sort(alphasort);
    if (self2.mark) {
      for (var i = 0; i < all.length; i++) {
        all[i] = self2._mark(all[i]);
      }
      if (self2.nodir) {
        all = all.filter(function(e) {
          var notDir = !/\/$/.test(e);
          var c = self2.cache[e] || self2.cache[makeAbs(self2, e)];
          if (notDir && c)
            notDir = c !== "DIR" && !Array.isArray(c);
          return notDir;
        });
      }
    }
    if (self2.ignore.length)
      all = all.filter(function(m2) {
        return !isIgnored(self2, m2);
      });
    self2.found = all;
  }
  function mark(self2, p) {
    var abs = makeAbs(self2, p);
    var c = self2.cache[abs];
    var m = p;
    if (c) {
      var isDir = c === "DIR" || Array.isArray(c);
      var slash = p.slice(-1) === "/";
      if (isDir && !slash)
        m += "/";
      else if (!isDir && slash)
        m = m.slice(0, -1);
      if (m !== p) {
        var mabs = makeAbs(self2, m);
        self2.statCache[mabs] = self2.statCache[abs];
        self2.cache[mabs] = self2.cache[abs];
      }
    }
    return m;
  }
  function makeAbs(self2, f) {
    var abs = f;
    if (f.charAt(0) === "/") {
      abs = path2.join(self2.root, f);
    } else if (isAbsolute(f) || f === "") {
      abs = f;
    } else if (self2.changedCwd) {
      abs = path2.resolve(self2.cwd, f);
    } else {
      abs = path2.resolve(f);
    }
    if (process.platform === "win32")
      abs = abs.replace(/\\/g, "/");
    return abs;
  }
  function isIgnored(self2, path3) {
    if (!self2.ignore.length)
      return false;
    return self2.ignore.some(function(item) {
      return item.matcher.match(path3) || !!(item.gmatcher && item.gmatcher.match(path3));
    });
  }
  function childrenIgnored(self2, path3) {
    if (!self2.ignore.length)
      return false;
    return self2.ignore.some(function(item) {
      return !!(item.gmatcher && item.gmatcher.match(path3));
    });
  }
  return common;
}
var sync;
var hasRequiredSync;
function requireSync() {
  if (hasRequiredSync)
    return sync;
  hasRequiredSync = 1;
  sync = globSync;
  globSync.GlobSync = GlobSync;
  var rp = requireFs_realpath();
  var minimatch = requireMinimatch();
  minimatch.Minimatch;
  requireGlob().Glob;
  var path2 = require$$4$2;
  var assert2 = require$$5;
  var isAbsolute = requirePathIsAbsolute();
  var common2 = requireCommon();
  var setopts = common2.setopts;
  var ownProp = common2.ownProp;
  var childrenIgnored = common2.childrenIgnored;
  var isIgnored = common2.isIgnored;
  function globSync(pattern, options) {
    if (typeof options === "function" || arguments.length === 3)
      throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
    return new GlobSync(pattern, options).found;
  }
  function GlobSync(pattern, options) {
    if (!pattern)
      throw new Error("must provide pattern");
    if (typeof options === "function" || arguments.length === 3)
      throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
    if (!(this instanceof GlobSync))
      return new GlobSync(pattern, options);
    setopts(this, pattern, options);
    if (this.noprocess)
      return this;
    var n = this.minimatch.set.length;
    this.matches = new Array(n);
    for (var i = 0; i < n; i++) {
      this._process(this.minimatch.set[i], i, false);
    }
    this._finish();
  }
  GlobSync.prototype._finish = function() {
    assert2.ok(this instanceof GlobSync);
    if (this.realpath) {
      var self2 = this;
      this.matches.forEach(function(matchset, index) {
        var set = self2.matches[index] = /* @__PURE__ */ Object.create(null);
        for (var p in matchset) {
          try {
            p = self2._makeAbs(p);
            var real = rp.realpathSync(p, self2.realpathCache);
            set[real] = true;
          } catch (er) {
            if (er.syscall === "stat")
              set[self2._makeAbs(p)] = true;
            else
              throw er;
          }
        }
      });
    }
    common2.finish(this);
  };
  GlobSync.prototype._process = function(pattern, index, inGlobStar) {
    assert2.ok(this instanceof GlobSync);
    var n = 0;
    while (typeof pattern[n] === "string") {
      n++;
    }
    var prefix;
    switch (n) {
      case pattern.length:
        this._processSimple(pattern.join("/"), index);
        return;
      case 0:
        prefix = null;
        break;
      default:
        prefix = pattern.slice(0, n).join("/");
        break;
    }
    var remain = pattern.slice(n);
    var read;
    if (prefix === null)
      read = ".";
    else if (isAbsolute(prefix) || isAbsolute(pattern.map(function(p) {
      return typeof p === "string" ? p : "[*]";
    }).join("/"))) {
      if (!prefix || !isAbsolute(prefix))
        prefix = "/" + prefix;
      read = prefix;
    } else
      read = prefix;
    var abs = this._makeAbs(read);
    if (childrenIgnored(this, read))
      return;
    var isGlobStar = remain[0] === minimatch.GLOBSTAR;
    if (isGlobStar)
      this._processGlobStar(prefix, read, abs, remain, index, inGlobStar);
    else
      this._processReaddir(prefix, read, abs, remain, index, inGlobStar);
  };
  GlobSync.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar) {
    var entries = this._readdir(abs, inGlobStar);
    if (!entries)
      return;
    var pn = remain[0];
    var negate = !!this.minimatch.negate;
    var rawGlob = pn._glob;
    var dotOk = this.dot || rawGlob.charAt(0) === ".";
    var matchedEntries = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.charAt(0) !== "." || dotOk) {
        var m;
        if (negate && !prefix) {
          m = !e.match(pn);
        } else {
          m = e.match(pn);
        }
        if (m)
          matchedEntries.push(e);
      }
    }
    var len = matchedEntries.length;
    if (len === 0)
      return;
    if (remain.length === 1 && !this.mark && !this.stat) {
      if (!this.matches[index])
        this.matches[index] = /* @__PURE__ */ Object.create(null);
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        if (prefix) {
          if (prefix.slice(-1) !== "/")
            e = prefix + "/" + e;
          else
            e = prefix + e;
        }
        if (e.charAt(0) === "/" && !this.nomount) {
          e = path2.join(this.root, e);
        }
        this._emitMatch(index, e);
      }
      return;
    }
    remain.shift();
    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      var newPattern;
      if (prefix)
        newPattern = [prefix, e];
      else
        newPattern = [e];
      this._process(newPattern.concat(remain), index, inGlobStar);
    }
  };
  GlobSync.prototype._emitMatch = function(index, e) {
    if (isIgnored(this, e))
      return;
    var abs = this._makeAbs(e);
    if (this.mark)
      e = this._mark(e);
    if (this.absolute) {
      e = abs;
    }
    if (this.matches[index][e])
      return;
    if (this.nodir) {
      var c = this.cache[abs];
      if (c === "DIR" || Array.isArray(c))
        return;
    }
    this.matches[index][e] = true;
    if (this.stat)
      this._stat(e);
  };
  GlobSync.prototype._readdirInGlobStar = function(abs) {
    if (this.follow)
      return this._readdir(abs, false);
    var entries;
    var lstat;
    try {
      lstat = this.fs.lstatSync(abs);
    } catch (er) {
      if (er.code === "ENOENT") {
        return null;
      }
    }
    var isSym = lstat && lstat.isSymbolicLink();
    this.symlinks[abs] = isSym;
    if (!isSym && lstat && !lstat.isDirectory())
      this.cache[abs] = "FILE";
    else
      entries = this._readdir(abs, false);
    return entries;
  };
  GlobSync.prototype._readdir = function(abs, inGlobStar) {
    if (inGlobStar && !ownProp(this.symlinks, abs))
      return this._readdirInGlobStar(abs);
    if (ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (!c || c === "FILE")
        return null;
      if (Array.isArray(c))
        return c;
    }
    try {
      return this._readdirEntries(abs, this.fs.readdirSync(abs));
    } catch (er) {
      this._readdirError(abs, er);
      return null;
    }
  };
  GlobSync.prototype._readdirEntries = function(abs, entries) {
    if (!this.mark && !this.stat) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (abs === "/")
          e = abs + e;
        else
          e = abs + "/" + e;
        this.cache[e] = true;
      }
    }
    this.cache[abs] = entries;
    return entries;
  };
  GlobSync.prototype._readdirError = function(f, er) {
    switch (er.code) {
      case "ENOTSUP":
      case "ENOTDIR":
        var abs = this._makeAbs(f);
        this.cache[abs] = "FILE";
        if (abs === this.cwdAbs) {
          var error = new Error(er.code + " invalid cwd " + this.cwd);
          error.path = this.cwd;
          error.code = er.code;
          throw error;
        }
        break;
      case "ENOENT":
      case "ELOOP":
      case "ENAMETOOLONG":
      case "UNKNOWN":
        this.cache[this._makeAbs(f)] = false;
        break;
      default:
        this.cache[this._makeAbs(f)] = false;
        if (this.strict)
          throw er;
        if (!this.silent)
          console.error("glob error", er);
        break;
    }
  };
  GlobSync.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar) {
    var entries = this._readdir(abs, inGlobStar);
    if (!entries)
      return;
    var remainWithoutGlobStar = remain.slice(1);
    var gspref = prefix ? [prefix] : [];
    var noGlobStar = gspref.concat(remainWithoutGlobStar);
    this._process(noGlobStar, index, false);
    var len = entries.length;
    var isSym = this.symlinks[abs];
    if (isSym && inGlobStar)
      return;
    for (var i = 0; i < len; i++) {
      var e = entries[i];
      if (e.charAt(0) === "." && !this.dot)
        continue;
      var instead = gspref.concat(entries[i], remainWithoutGlobStar);
      this._process(instead, index, true);
      var below = gspref.concat(entries[i], remain);
      this._process(below, index, true);
    }
  };
  GlobSync.prototype._processSimple = function(prefix, index) {
    var exists = this._stat(prefix);
    if (!this.matches[index])
      this.matches[index] = /* @__PURE__ */ Object.create(null);
    if (!exists)
      return;
    if (prefix && isAbsolute(prefix) && !this.nomount) {
      var trail = /[\/\\]$/.test(prefix);
      if (prefix.charAt(0) === "/") {
        prefix = path2.join(this.root, prefix);
      } else {
        prefix = path2.resolve(this.root, prefix);
        if (trail)
          prefix += "/";
      }
    }
    if (process.platform === "win32")
      prefix = prefix.replace(/\\/g, "/");
    this._emitMatch(index, prefix);
  };
  GlobSync.prototype._stat = function(f) {
    var abs = this._makeAbs(f);
    var needDir = f.slice(-1) === "/";
    if (f.length > this.maxLength)
      return false;
    if (!this.stat && ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (Array.isArray(c))
        c = "DIR";
      if (!needDir || c === "DIR")
        return c;
      if (needDir && c === "FILE")
        return false;
    }
    var stat2 = this.statCache[abs];
    if (!stat2) {
      var lstat;
      try {
        lstat = this.fs.lstatSync(abs);
      } catch (er) {
        if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
          this.statCache[abs] = false;
          return false;
        }
      }
      if (lstat && lstat.isSymbolicLink()) {
        try {
          stat2 = this.fs.statSync(abs);
        } catch (er) {
          stat2 = lstat;
        }
      } else {
        stat2 = lstat;
      }
    }
    this.statCache[abs] = stat2;
    var c = true;
    if (stat2)
      c = stat2.isDirectory() ? "DIR" : "FILE";
    this.cache[abs] = this.cache[abs] || c;
    if (needDir && c === "FILE")
      return false;
    return c;
  };
  GlobSync.prototype._mark = function(p) {
    return common2.mark(this, p);
  };
  GlobSync.prototype._makeAbs = function(f) {
    return common2.makeAbs(this, f);
  };
  return sync;
}
var inflight_1;
var hasRequiredInflight;
function requireInflight() {
  if (hasRequiredInflight)
    return inflight_1;
  hasRequiredInflight = 1;
  var wrappy2 = wrappy_1;
  var reqs = /* @__PURE__ */ Object.create(null);
  var once2 = onceExports;
  inflight_1 = wrappy2(inflight);
  function inflight(key, cb) {
    if (reqs[key]) {
      reqs[key].push(cb);
      return null;
    } else {
      reqs[key] = [cb];
      return makeres(key);
    }
  }
  function makeres(key) {
    return once2(function RES() {
      var cbs = reqs[key];
      var len = cbs.length;
      var args = slice(arguments);
      try {
        for (var i = 0; i < len; i++) {
          cbs[i].apply(null, args);
        }
      } finally {
        if (cbs.length > len) {
          cbs.splice(0, len);
          process.nextTick(function() {
            RES.apply(null, args);
          });
        } else {
          delete reqs[key];
        }
      }
    });
  }
  function slice(args) {
    var length = args.length;
    var array = [];
    for (var i = 0; i < length; i++)
      array[i] = args[i];
    return array;
  }
  return inflight_1;
}
var glob_1;
var hasRequiredGlob;
function requireGlob() {
  if (hasRequiredGlob)
    return glob_1;
  hasRequiredGlob = 1;
  glob_1 = glob2;
  var rp = requireFs_realpath();
  var minimatch = requireMinimatch();
  minimatch.Minimatch;
  var inherits2 = requireInherits();
  var EE = require$$4$1.EventEmitter;
  var path2 = require$$4$2;
  var assert2 = require$$5;
  var isAbsolute = requirePathIsAbsolute();
  var globSync = requireSync();
  var common2 = requireCommon();
  var setopts = common2.setopts;
  var ownProp = common2.ownProp;
  var inflight = requireInflight();
  var childrenIgnored = common2.childrenIgnored;
  var isIgnored = common2.isIgnored;
  var once2 = onceExports;
  function glob2(pattern, options, cb) {
    if (typeof options === "function")
      cb = options, options = {};
    if (!options)
      options = {};
    if (options.sync) {
      if (cb)
        throw new TypeError("callback provided to sync glob");
      return globSync(pattern, options);
    }
    return new Glob(pattern, options, cb);
  }
  glob2.sync = globSync;
  var GlobSync = glob2.GlobSync = globSync.GlobSync;
  glob2.glob = glob2;
  function extend(origin, add2) {
    if (add2 === null || typeof add2 !== "object") {
      return origin;
    }
    var keys = Object.keys(add2);
    var i = keys.length;
    while (i--) {
      origin[keys[i]] = add2[keys[i]];
    }
    return origin;
  }
  glob2.hasMagic = function(pattern, options_) {
    var options = extend({}, options_);
    options.noprocess = true;
    var g = new Glob(pattern, options);
    var set = g.minimatch.set;
    if (!pattern)
      return false;
    if (set.length > 1)
      return true;
    for (var j = 0; j < set[0].length; j++) {
      if (typeof set[0][j] !== "string")
        return true;
    }
    return false;
  };
  glob2.Glob = Glob;
  inherits2(Glob, EE);
  function Glob(pattern, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = null;
    }
    if (options && options.sync) {
      if (cb)
        throw new TypeError("callback provided to sync glob");
      return new GlobSync(pattern, options);
    }
    if (!(this instanceof Glob))
      return new Glob(pattern, options, cb);
    setopts(this, pattern, options);
    this._didRealPath = false;
    var n = this.minimatch.set.length;
    this.matches = new Array(n);
    if (typeof cb === "function") {
      cb = once2(cb);
      this.on("error", cb);
      this.on("end", function(matches) {
        cb(null, matches);
      });
    }
    var self2 = this;
    this._processing = 0;
    this._emitQueue = [];
    this._processQueue = [];
    this.paused = false;
    if (this.noprocess)
      return this;
    if (n === 0)
      return done();
    var sync2 = true;
    for (var i = 0; i < n; i++) {
      this._process(this.minimatch.set[i], i, false, done);
    }
    sync2 = false;
    function done() {
      --self2._processing;
      if (self2._processing <= 0) {
        if (sync2) {
          process.nextTick(function() {
            self2._finish();
          });
        } else {
          self2._finish();
        }
      }
    }
  }
  Glob.prototype._finish = function() {
    assert2(this instanceof Glob);
    if (this.aborted)
      return;
    if (this.realpath && !this._didRealpath)
      return this._realpath();
    common2.finish(this);
    this.emit("end", this.found);
  };
  Glob.prototype._realpath = function() {
    if (this._didRealpath)
      return;
    this._didRealpath = true;
    var n = this.matches.length;
    if (n === 0)
      return this._finish();
    var self2 = this;
    for (var i = 0; i < this.matches.length; i++)
      this._realpathSet(i, next);
    function next() {
      if (--n === 0)
        self2._finish();
    }
  };
  Glob.prototype._realpathSet = function(index, cb) {
    var matchset = this.matches[index];
    if (!matchset)
      return cb();
    var found = Object.keys(matchset);
    var self2 = this;
    var n = found.length;
    if (n === 0)
      return cb();
    var set = this.matches[index] = /* @__PURE__ */ Object.create(null);
    found.forEach(function(p, i) {
      p = self2._makeAbs(p);
      rp.realpath(p, self2.realpathCache, function(er, real) {
        if (!er)
          set[real] = true;
        else if (er.syscall === "stat")
          set[p] = true;
        else
          self2.emit("error", er);
        if (--n === 0) {
          self2.matches[index] = set;
          cb();
        }
      });
    });
  };
  Glob.prototype._mark = function(p) {
    return common2.mark(this, p);
  };
  Glob.prototype._makeAbs = function(f) {
    return common2.makeAbs(this, f);
  };
  Glob.prototype.abort = function() {
    this.aborted = true;
    this.emit("abort");
  };
  Glob.prototype.pause = function() {
    if (!this.paused) {
      this.paused = true;
      this.emit("pause");
    }
  };
  Glob.prototype.resume = function() {
    if (this.paused) {
      this.emit("resume");
      this.paused = false;
      if (this._emitQueue.length) {
        var eq = this._emitQueue.slice(0);
        this._emitQueue.length = 0;
        for (var i = 0; i < eq.length; i++) {
          var e = eq[i];
          this._emitMatch(e[0], e[1]);
        }
      }
      if (this._processQueue.length) {
        var pq = this._processQueue.slice(0);
        this._processQueue.length = 0;
        for (var i = 0; i < pq.length; i++) {
          var p = pq[i];
          this._processing--;
          this._process(p[0], p[1], p[2], p[3]);
        }
      }
    }
  };
  Glob.prototype._process = function(pattern, index, inGlobStar, cb) {
    assert2(this instanceof Glob);
    assert2(typeof cb === "function");
    if (this.aborted)
      return;
    this._processing++;
    if (this.paused) {
      this._processQueue.push([pattern, index, inGlobStar, cb]);
      return;
    }
    var n = 0;
    while (typeof pattern[n] === "string") {
      n++;
    }
    var prefix;
    switch (n) {
      case pattern.length:
        this._processSimple(pattern.join("/"), index, cb);
        return;
      case 0:
        prefix = null;
        break;
      default:
        prefix = pattern.slice(0, n).join("/");
        break;
    }
    var remain = pattern.slice(n);
    var read;
    if (prefix === null)
      read = ".";
    else if (isAbsolute(prefix) || isAbsolute(pattern.map(function(p) {
      return typeof p === "string" ? p : "[*]";
    }).join("/"))) {
      if (!prefix || !isAbsolute(prefix))
        prefix = "/" + prefix;
      read = prefix;
    } else
      read = prefix;
    var abs = this._makeAbs(read);
    if (childrenIgnored(this, read))
      return cb();
    var isGlobStar = remain[0] === minimatch.GLOBSTAR;
    if (isGlobStar)
      this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);
    else
      this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
  };
  Glob.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar, cb) {
    var self2 = this;
    this._readdir(abs, inGlobStar, function(er, entries) {
      return self2._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
    });
  };
  Glob.prototype._processReaddir2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
    if (!entries)
      return cb();
    var pn = remain[0];
    var negate = !!this.minimatch.negate;
    var rawGlob = pn._glob;
    var dotOk = this.dot || rawGlob.charAt(0) === ".";
    var matchedEntries = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.charAt(0) !== "." || dotOk) {
        var m;
        if (negate && !prefix) {
          m = !e.match(pn);
        } else {
          m = e.match(pn);
        }
        if (m)
          matchedEntries.push(e);
      }
    }
    var len = matchedEntries.length;
    if (len === 0)
      return cb();
    if (remain.length === 1 && !this.mark && !this.stat) {
      if (!this.matches[index])
        this.matches[index] = /* @__PURE__ */ Object.create(null);
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        if (prefix) {
          if (prefix !== "/")
            e = prefix + "/" + e;
          else
            e = prefix + e;
        }
        if (e.charAt(0) === "/" && !this.nomount) {
          e = path2.join(this.root, e);
        }
        this._emitMatch(index, e);
      }
      return cb();
    }
    remain.shift();
    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      if (prefix) {
        if (prefix !== "/")
          e = prefix + "/" + e;
        else
          e = prefix + e;
      }
      this._process([e].concat(remain), index, inGlobStar, cb);
    }
    cb();
  };
  Glob.prototype._emitMatch = function(index, e) {
    if (this.aborted)
      return;
    if (isIgnored(this, e))
      return;
    if (this.paused) {
      this._emitQueue.push([index, e]);
      return;
    }
    var abs = isAbsolute(e) ? e : this._makeAbs(e);
    if (this.mark)
      e = this._mark(e);
    if (this.absolute)
      e = abs;
    if (this.matches[index][e])
      return;
    if (this.nodir) {
      var c = this.cache[abs];
      if (c === "DIR" || Array.isArray(c))
        return;
    }
    this.matches[index][e] = true;
    var st = this.statCache[abs];
    if (st)
      this.emit("stat", e, st);
    this.emit("match", e);
  };
  Glob.prototype._readdirInGlobStar = function(abs, cb) {
    if (this.aborted)
      return;
    if (this.follow)
      return this._readdir(abs, false, cb);
    var lstatkey = "lstat\0" + abs;
    var self2 = this;
    var lstatcb = inflight(lstatkey, lstatcb_);
    if (lstatcb)
      self2.fs.lstat(abs, lstatcb);
    function lstatcb_(er, lstat) {
      if (er && er.code === "ENOENT")
        return cb();
      var isSym = lstat && lstat.isSymbolicLink();
      self2.symlinks[abs] = isSym;
      if (!isSym && lstat && !lstat.isDirectory()) {
        self2.cache[abs] = "FILE";
        cb();
      } else
        self2._readdir(abs, false, cb);
    }
  };
  Glob.prototype._readdir = function(abs, inGlobStar, cb) {
    if (this.aborted)
      return;
    cb = inflight("readdir\0" + abs + "\0" + inGlobStar, cb);
    if (!cb)
      return;
    if (inGlobStar && !ownProp(this.symlinks, abs))
      return this._readdirInGlobStar(abs, cb);
    if (ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (!c || c === "FILE")
        return cb();
      if (Array.isArray(c))
        return cb(null, c);
    }
    var self2 = this;
    self2.fs.readdir(abs, readdirCb(this, abs, cb));
  };
  function readdirCb(self2, abs, cb) {
    return function(er, entries) {
      if (er)
        self2._readdirError(abs, er, cb);
      else
        self2._readdirEntries(abs, entries, cb);
    };
  }
  Glob.prototype._readdirEntries = function(abs, entries, cb) {
    if (this.aborted)
      return;
    if (!this.mark && !this.stat) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (abs === "/")
          e = abs + e;
        else
          e = abs + "/" + e;
        this.cache[e] = true;
      }
    }
    this.cache[abs] = entries;
    return cb(null, entries);
  };
  Glob.prototype._readdirError = function(f, er, cb) {
    if (this.aborted)
      return;
    switch (er.code) {
      case "ENOTSUP":
      case "ENOTDIR":
        var abs = this._makeAbs(f);
        this.cache[abs] = "FILE";
        if (abs === this.cwdAbs) {
          var error = new Error(er.code + " invalid cwd " + this.cwd);
          error.path = this.cwd;
          error.code = er.code;
          this.emit("error", error);
          this.abort();
        }
        break;
      case "ENOENT":
      case "ELOOP":
      case "ENAMETOOLONG":
      case "UNKNOWN":
        this.cache[this._makeAbs(f)] = false;
        break;
      default:
        this.cache[this._makeAbs(f)] = false;
        if (this.strict) {
          this.emit("error", er);
          this.abort();
        }
        if (!this.silent)
          console.error("glob error", er);
        break;
    }
    return cb();
  };
  Glob.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar, cb) {
    var self2 = this;
    this._readdir(abs, inGlobStar, function(er, entries) {
      self2._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
    });
  };
  Glob.prototype._processGlobStar2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
    if (!entries)
      return cb();
    var remainWithoutGlobStar = remain.slice(1);
    var gspref = prefix ? [prefix] : [];
    var noGlobStar = gspref.concat(remainWithoutGlobStar);
    this._process(noGlobStar, index, false, cb);
    var isSym = this.symlinks[abs];
    var len = entries.length;
    if (isSym && inGlobStar)
      return cb();
    for (var i = 0; i < len; i++) {
      var e = entries[i];
      if (e.charAt(0) === "." && !this.dot)
        continue;
      var instead = gspref.concat(entries[i], remainWithoutGlobStar);
      this._process(instead, index, true, cb);
      var below = gspref.concat(entries[i], remain);
      this._process(below, index, true, cb);
    }
    cb();
  };
  Glob.prototype._processSimple = function(prefix, index, cb) {
    var self2 = this;
    this._stat(prefix, function(er, exists) {
      self2._processSimple2(prefix, index, er, exists, cb);
    });
  };
  Glob.prototype._processSimple2 = function(prefix, index, er, exists, cb) {
    if (!this.matches[index])
      this.matches[index] = /* @__PURE__ */ Object.create(null);
    if (!exists)
      return cb();
    if (prefix && isAbsolute(prefix) && !this.nomount) {
      var trail = /[\/\\]$/.test(prefix);
      if (prefix.charAt(0) === "/") {
        prefix = path2.join(this.root, prefix);
      } else {
        prefix = path2.resolve(this.root, prefix);
        if (trail)
          prefix += "/";
      }
    }
    if (process.platform === "win32")
      prefix = prefix.replace(/\\/g, "/");
    this._emitMatch(index, prefix);
    cb();
  };
  Glob.prototype._stat = function(f, cb) {
    var abs = this._makeAbs(f);
    var needDir = f.slice(-1) === "/";
    if (f.length > this.maxLength)
      return cb();
    if (!this.stat && ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (Array.isArray(c))
        c = "DIR";
      if (!needDir || c === "DIR")
        return cb(null, c);
      if (needDir && c === "FILE")
        return cb();
    }
    var stat2 = this.statCache[abs];
    if (stat2 !== void 0) {
      if (stat2 === false)
        return cb(null, stat2);
      else {
        var type = stat2.isDirectory() ? "DIR" : "FILE";
        if (needDir && type === "FILE")
          return cb();
        else
          return cb(null, type, stat2);
      }
    }
    var self2 = this;
    var statcb = inflight("stat\0" + abs, lstatcb_);
    if (statcb)
      self2.fs.lstat(abs, statcb);
    function lstatcb_(er, lstat) {
      if (lstat && lstat.isSymbolicLink()) {
        return self2.fs.stat(abs, function(er2, stat3) {
          if (er2)
            self2._stat2(f, abs, null, lstat, cb);
          else
            self2._stat2(f, abs, er2, stat3, cb);
        });
      } else {
        self2._stat2(f, abs, er, lstat, cb);
      }
    }
  };
  Glob.prototype._stat2 = function(f, abs, er, stat2, cb) {
    if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
      this.statCache[abs] = false;
      return cb();
    }
    var needDir = f.slice(-1) === "/";
    this.statCache[abs] = stat2;
    if (abs.slice(-1) === "/" && stat2 && !stat2.isDirectory())
      return cb(null, false, stat2);
    var c = true;
    if (stat2)
      c = stat2.isDirectory() ? "DIR" : "FILE";
    this.cache[abs] = this.cache[abs] || c;
    if (needDir && c === "FILE")
      return cb();
    return cb(null, c, stat2);
  };
  return glob_1;
}
const assert = require$$5;
const path$1 = require$$4$2;
const fs$3 = require$$0;
let glob = void 0;
try {
  glob = requireGlob();
} catch (_err) {
}
const defaultGlobOpts = {
  nosort: true,
  silent: true
};
let timeout = 0;
const isWindows = process.platform === "win32";
const defaults = (options) => {
  const methods = [
    "unlink",
    "chmod",
    "stat",
    "lstat",
    "rmdir",
    "readdir"
  ];
  methods.forEach((m) => {
    options[m] = options[m] || fs$3[m];
    m = m + "Sync";
    options[m] = options[m] || fs$3[m];
  });
  options.maxBusyTries = options.maxBusyTries || 3;
  options.emfileWait = options.emfileWait || 1e3;
  if (options.glob === false) {
    options.disableGlob = true;
  }
  if (options.disableGlob !== true && glob === void 0) {
    throw Error("glob dependency not found, set `options.disableGlob = true` if intentional");
  }
  options.disableGlob = options.disableGlob || false;
  options.glob = options.glob || defaultGlobOpts;
};
const rimraf = (p, options, cb) => {
  if (typeof options === "function") {
    cb = options;
    options = {};
  }
  assert(p, "rimraf: missing path");
  assert.equal(typeof p, "string", "rimraf: path should be a string");
  assert.equal(typeof cb, "function", "rimraf: callback function required");
  assert(options, "rimraf: invalid options argument provided");
  assert.equal(typeof options, "object", "rimraf: options should be object");
  defaults(options);
  let busyTries = 0;
  let errState = null;
  let n = 0;
  const next = (er) => {
    errState = errState || er;
    if (--n === 0)
      cb(errState);
  };
  const afterGlob = (er, results) => {
    if (er)
      return cb(er);
    n = results.length;
    if (n === 0)
      return cb();
    results.forEach((p2) => {
      const CB = (er2) => {
        if (er2) {
          if ((er2.code === "EBUSY" || er2.code === "ENOTEMPTY" || er2.code === "EPERM") && busyTries < options.maxBusyTries) {
            busyTries++;
            return setTimeout(() => rimraf_(p2, options, CB), busyTries * 100);
          }
          if (er2.code === "EMFILE" && timeout < options.emfileWait) {
            return setTimeout(() => rimraf_(p2, options, CB), timeout++);
          }
          if (er2.code === "ENOENT")
            er2 = null;
        }
        timeout = 0;
        next(er2);
      };
      rimraf_(p2, options, CB);
    });
  };
  if (options.disableGlob || !glob.hasMagic(p))
    return afterGlob(null, [p]);
  options.lstat(p, (er, stat2) => {
    if (!er)
      return afterGlob(null, [p]);
    glob(p, options.glob, afterGlob);
  });
};
const rimraf_ = (p, options, cb) => {
  assert(p);
  assert(options);
  assert(typeof cb === "function");
  options.lstat(p, (er, st) => {
    if (er && er.code === "ENOENT")
      return cb(null);
    if (er && er.code === "EPERM" && isWindows)
      fixWinEPERM(p, options, er, cb);
    if (st && st.isDirectory())
      return rmdir(p, options, er, cb);
    options.unlink(p, (er2) => {
      if (er2) {
        if (er2.code === "ENOENT")
          return cb(null);
        if (er2.code === "EPERM")
          return isWindows ? fixWinEPERM(p, options, er2, cb) : rmdir(p, options, er2, cb);
        if (er2.code === "EISDIR")
          return rmdir(p, options, er2, cb);
      }
      return cb(er2);
    });
  });
};
const fixWinEPERM = (p, options, er, cb) => {
  assert(p);
  assert(options);
  assert(typeof cb === "function");
  options.chmod(p, 438, (er2) => {
    if (er2)
      cb(er2.code === "ENOENT" ? null : er);
    else
      options.stat(p, (er3, stats) => {
        if (er3)
          cb(er3.code === "ENOENT" ? null : er);
        else if (stats.isDirectory())
          rmdir(p, options, er, cb);
        else
          options.unlink(p, cb);
      });
  });
};
const fixWinEPERMSync = (p, options, er) => {
  assert(p);
  assert(options);
  try {
    options.chmodSync(p, 438);
  } catch (er2) {
    if (er2.code === "ENOENT")
      return;
    else
      throw er;
  }
  let stats;
  try {
    stats = options.statSync(p);
  } catch (er3) {
    if (er3.code === "ENOENT")
      return;
    else
      throw er;
  }
  if (stats.isDirectory())
    rmdirSync(p, options, er);
  else
    options.unlinkSync(p);
};
const rmdir = (p, options, originalEr, cb) => {
  assert(p);
  assert(options);
  assert(typeof cb === "function");
  options.rmdir(p, (er) => {
    if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM"))
      rmkids(p, options, cb);
    else if (er && er.code === "ENOTDIR")
      cb(originalEr);
    else
      cb(er);
  });
};
const rmkids = (p, options, cb) => {
  assert(p);
  assert(options);
  assert(typeof cb === "function");
  options.readdir(p, (er, files) => {
    if (er)
      return cb(er);
    let n = files.length;
    if (n === 0)
      return options.rmdir(p, cb);
    let errState;
    files.forEach((f) => {
      rimraf(path$1.join(p, f), options, (er2) => {
        if (errState)
          return;
        if (er2)
          return cb(errState = er2);
        if (--n === 0)
          options.rmdir(p, cb);
      });
    });
  });
};
const rimrafSync = (p, options) => {
  options = options || {};
  defaults(options);
  assert(p, "rimraf: missing path");
  assert.equal(typeof p, "string", "rimraf: path should be a string");
  assert(options, "rimraf: missing options");
  assert.equal(typeof options, "object", "rimraf: options should be object");
  let results;
  if (options.disableGlob || !glob.hasMagic(p)) {
    results = [p];
  } else {
    try {
      options.lstatSync(p);
      results = [p];
    } catch (er) {
      results = glob.sync(p, options.glob);
    }
  }
  if (!results.length)
    return;
  for (let i = 0; i < results.length; i++) {
    const p2 = results[i];
    let st;
    try {
      st = options.lstatSync(p2);
    } catch (er) {
      if (er.code === "ENOENT")
        return;
      if (er.code === "EPERM" && isWindows)
        fixWinEPERMSync(p2, options, er);
    }
    try {
      if (st && st.isDirectory())
        rmdirSync(p2, options, null);
      else
        options.unlinkSync(p2);
    } catch (er) {
      if (er.code === "ENOENT")
        return;
      if (er.code === "EPERM")
        return isWindows ? fixWinEPERMSync(p2, options, er) : rmdirSync(p2, options, er);
      if (er.code !== "EISDIR")
        throw er;
      rmdirSync(p2, options, er);
    }
  }
};
const rmdirSync = (p, options, originalEr) => {
  assert(p);
  assert(options);
  try {
    options.rmdirSync(p);
  } catch (er) {
    if (er.code === "ENOENT")
      return;
    if (er.code === "ENOTDIR")
      throw originalEr;
    if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")
      rmkidsSync(p, options);
  }
};
const rmkidsSync = (p, options) => {
  assert(p);
  assert(options);
  options.readdirSync(p).forEach((f) => rimrafSync(path$1.join(p, f), options));
  const retries = isWindows ? 100 : 1;
  let i = 0;
  do {
    let threw = true;
    try {
      const ret = options.rmdirSync(p, options);
      threw = false;
      return ret;
    } finally {
      if (++i < retries && threw)
        continue;
    }
  } while (true);
};
var rimraf_1 = rimraf;
rimraf.sync = rimrafSync;
/*!
 * Tmp
 *
 * Copyright (c) 2011-2017 KARASZI Istvan <github@spam.raszi.hu>
 *
 * MIT Licensed
 */
(function(module2) {
  const fs2 = require$$0;
  const os2 = require$$1;
  const path2 = require$$4$2;
  const crypto$1 = crypto;
  const _c = { fs: fs2.constants, os: os2.constants };
  const rimraf2 = rimraf_1;
  const RANDOM_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", TEMPLATE_PATTERN = /XXXXXX/, DEFAULT_TRIES = 3, CREATE_FLAGS = (_c.O_CREAT || _c.fs.O_CREAT) | (_c.O_EXCL || _c.fs.O_EXCL) | (_c.O_RDWR || _c.fs.O_RDWR), IS_WIN32 = os2.platform() === "win32", EBADF = _c.EBADF || _c.os.errno.EBADF, ENOENT = _c.ENOENT || _c.os.errno.ENOENT, DIR_MODE = 448, FILE_MODE = 384, EXIT = "exit", _removeObjects = [], FN_RMDIR_SYNC = fs2.rmdirSync.bind(fs2), FN_RIMRAF_SYNC = rimraf2.sync;
  let _gracefulCleanup = false;
  function tmpName(options, callback) {
    const args = _parseArguments(options, callback), opts = args[0], cb = args[1];
    try {
      _assertAndSanitizeOptions(opts);
    } catch (err) {
      return cb(err);
    }
    let tries = opts.tries;
    (function _getUniqueName() {
      try {
        const name = _generateTmpName(opts);
        fs2.stat(name, function(err) {
          if (!err) {
            if (tries-- > 0)
              return _getUniqueName();
            return cb(new Error("Could not get a unique tmp filename, max tries reached " + name));
          }
          cb(null, name);
        });
      } catch (err) {
        cb(err);
      }
    })();
  }
  function tmpNameSync(options) {
    const args = _parseArguments(options), opts = args[0];
    _assertAndSanitizeOptions(opts);
    let tries = opts.tries;
    do {
      const name = _generateTmpName(opts);
      try {
        fs2.statSync(name);
      } catch (e) {
        return name;
      }
    } while (tries-- > 0);
    throw new Error("Could not get a unique tmp filename, max tries reached");
  }
  function file(options, callback) {
    const args = _parseArguments(options, callback), opts = args[0], cb = args[1];
    tmpName(opts, function _tmpNameCreated(err, name) {
      if (err)
        return cb(err);
      fs2.open(name, CREATE_FLAGS, opts.mode || FILE_MODE, function _fileCreated(err2, fd) {
        if (err2)
          return cb(err2);
        if (opts.discardDescriptor) {
          return fs2.close(fd, function _discardCallback(possibleErr) {
            return cb(possibleErr, name, void 0, _prepareTmpFileRemoveCallback(name, -1, opts, false));
          });
        } else {
          const discardOrDetachDescriptor = opts.discardDescriptor || opts.detachDescriptor;
          cb(null, name, fd, _prepareTmpFileRemoveCallback(name, discardOrDetachDescriptor ? -1 : fd, opts, false));
        }
      });
    });
  }
  function fileSync(options) {
    const args = _parseArguments(options), opts = args[0];
    const discardOrDetachDescriptor = opts.discardDescriptor || opts.detachDescriptor;
    const name = tmpNameSync(opts);
    var fd = fs2.openSync(name, CREATE_FLAGS, opts.mode || FILE_MODE);
    if (opts.discardDescriptor) {
      fs2.closeSync(fd);
      fd = void 0;
    }
    return {
      name,
      fd,
      removeCallback: _prepareTmpFileRemoveCallback(name, discardOrDetachDescriptor ? -1 : fd, opts, true)
    };
  }
  function dir(options, callback) {
    const args = _parseArguments(options, callback), opts = args[0], cb = args[1];
    tmpName(opts, function _tmpNameCreated(err, name) {
      if (err)
        return cb(err);
      fs2.mkdir(name, opts.mode || DIR_MODE, function _dirCreated(err2) {
        if (err2)
          return cb(err2);
        cb(null, name, _prepareTmpDirRemoveCallback(name, opts, false));
      });
    });
  }
  function dirSync(options) {
    const args = _parseArguments(options), opts = args[0];
    const name = tmpNameSync(opts);
    fs2.mkdirSync(name, opts.mode || DIR_MODE);
    return {
      name,
      removeCallback: _prepareTmpDirRemoveCallback(name, opts, true)
    };
  }
  function _removeFileAsync(fdPath, next) {
    const _handler = function(err) {
      if (err && !_isENOENT(err)) {
        return next(err);
      }
      next();
    };
    if (0 <= fdPath[0])
      fs2.close(fdPath[0], function() {
        fs2.unlink(fdPath[1], _handler);
      });
    else
      fs2.unlink(fdPath[1], _handler);
  }
  function _removeFileSync(fdPath) {
    let rethrownException = null;
    try {
      if (0 <= fdPath[0])
        fs2.closeSync(fdPath[0]);
    } catch (e) {
      if (!_isEBADF(e) && !_isENOENT(e))
        throw e;
    } finally {
      try {
        fs2.unlinkSync(fdPath[1]);
      } catch (e) {
        if (!_isENOENT(e))
          rethrownException = e;
      }
    }
    if (rethrownException !== null) {
      throw rethrownException;
    }
  }
  function _prepareTmpFileRemoveCallback(name, fd, opts, sync2) {
    const removeCallbackSync = _prepareRemoveCallback(_removeFileSync, [fd, name], sync2);
    const removeCallback = _prepareRemoveCallback(_removeFileAsync, [fd, name], sync2, removeCallbackSync);
    if (!opts.keep)
      _removeObjects.unshift(removeCallbackSync);
    return sync2 ? removeCallbackSync : removeCallback;
  }
  function _prepareTmpDirRemoveCallback(name, opts, sync2) {
    const removeFunction = opts.unsafeCleanup ? rimraf2 : fs2.rmdir.bind(fs2);
    const removeFunctionSync = opts.unsafeCleanup ? FN_RIMRAF_SYNC : FN_RMDIR_SYNC;
    const removeCallbackSync = _prepareRemoveCallback(removeFunctionSync, name, sync2);
    const removeCallback = _prepareRemoveCallback(removeFunction, name, sync2, removeCallbackSync);
    if (!opts.keep)
      _removeObjects.unshift(removeCallbackSync);
    return sync2 ? removeCallbackSync : removeCallback;
  }
  function _prepareRemoveCallback(removeFunction, fileOrDirName, sync2, cleanupCallbackSync) {
    let called = false;
    return function _cleanupCallback(next) {
      if (!called) {
        const toRemove = cleanupCallbackSync || _cleanupCallback;
        const index = _removeObjects.indexOf(toRemove);
        if (index >= 0)
          _removeObjects.splice(index, 1);
        called = true;
        if (sync2 || removeFunction === FN_RMDIR_SYNC || removeFunction === FN_RIMRAF_SYNC) {
          return removeFunction(fileOrDirName);
        } else {
          return removeFunction(fileOrDirName, next || function() {
          });
        }
      }
    };
  }
  function _garbageCollector() {
    if (!_gracefulCleanup)
      return;
    while (_removeObjects.length) {
      try {
        _removeObjects[0]();
      } catch (e) {
      }
    }
  }
  function _randomChars(howMany) {
    let value = [], rnd = null;
    try {
      rnd = crypto$1.randomBytes(howMany);
    } catch (e) {
      rnd = crypto$1.pseudoRandomBytes(howMany);
    }
    for (var i = 0; i < howMany; i++) {
      value.push(RANDOM_CHARS[rnd[i] % RANDOM_CHARS.length]);
    }
    return value.join("");
  }
  function _isBlank(s) {
    return s === null || _isUndefined(s) || !s.trim();
  }
  function _isUndefined(obj) {
    return typeof obj === "undefined";
  }
  function _parseArguments(options, callback) {
    if (typeof options === "function") {
      return [{}, options];
    }
    if (_isUndefined(options)) {
      return [{}, callback];
    }
    const actualOptions = {};
    for (const key of Object.getOwnPropertyNames(options)) {
      actualOptions[key] = options[key];
    }
    return [actualOptions, callback];
  }
  function _generateTmpName(opts) {
    const tmpDir = opts.tmpdir;
    if (!_isUndefined(opts.name))
      return path2.join(tmpDir, opts.dir, opts.name);
    if (!_isUndefined(opts.template))
      return path2.join(tmpDir, opts.dir, opts.template).replace(TEMPLATE_PATTERN, _randomChars(6));
    const name = [
      opts.prefix ? opts.prefix : "tmp",
      "-",
      process.pid,
      "-",
      _randomChars(12),
      opts.postfix ? "-" + opts.postfix : ""
    ].join("");
    return path2.join(tmpDir, opts.dir, name);
  }
  function _assertAndSanitizeOptions(options) {
    options.tmpdir = _getTmpDir(options);
    const tmpDir = options.tmpdir;
    if (!_isUndefined(options.name))
      _assertIsRelative(options.name, "name", tmpDir);
    if (!_isUndefined(options.dir))
      _assertIsRelative(options.dir, "dir", tmpDir);
    if (!_isUndefined(options.template)) {
      _assertIsRelative(options.template, "template", tmpDir);
      if (!options.template.match(TEMPLATE_PATTERN))
        throw new Error(`Invalid template, found "${options.template}".`);
    }
    if (!_isUndefined(options.tries) && isNaN(options.tries) || options.tries < 0)
      throw new Error(`Invalid tries, found "${options.tries}".`);
    options.tries = _isUndefined(options.name) ? options.tries || DEFAULT_TRIES : 1;
    options.keep = !!options.keep;
    options.detachDescriptor = !!options.detachDescriptor;
    options.discardDescriptor = !!options.discardDescriptor;
    options.unsafeCleanup = !!options.unsafeCleanup;
    options.dir = _isUndefined(options.dir) ? "" : path2.relative(tmpDir, _resolvePath(options.dir, tmpDir));
    options.template = _isUndefined(options.template) ? void 0 : path2.relative(tmpDir, _resolvePath(options.template, tmpDir));
    options.template = _isBlank(options.template) ? void 0 : path2.relative(options.dir, options.template);
    options.name = _isUndefined(options.name) ? void 0 : _sanitizeName(options.name);
    options.prefix = _isUndefined(options.prefix) ? "" : options.prefix;
    options.postfix = _isUndefined(options.postfix) ? "" : options.postfix;
  }
  function _resolvePath(name, tmpDir) {
    const sanitizedName = _sanitizeName(name);
    if (sanitizedName.startsWith(tmpDir)) {
      return path2.resolve(sanitizedName);
    } else {
      return path2.resolve(path2.join(tmpDir, sanitizedName));
    }
  }
  function _sanitizeName(name) {
    if (_isBlank(name)) {
      return name;
    }
    return name.replace(/["']/g, "");
  }
  function _assertIsRelative(name, option, tmpDir) {
    if (option === "name") {
      if (path2.isAbsolute(name))
        throw new Error(`${option} option must not contain an absolute path, found "${name}".`);
      let basename = path2.basename(name);
      if (basename === ".." || basename === "." || basename !== name)
        throw new Error(`${option} option must not contain a path, found "${name}".`);
    } else {
      if (path2.isAbsolute(name) && !name.startsWith(tmpDir)) {
        throw new Error(`${option} option must be relative to "${tmpDir}", found "${name}".`);
      }
      let resolvedPath = _resolvePath(name, tmpDir);
      if (!resolvedPath.startsWith(tmpDir))
        throw new Error(`${option} option must be relative to "${tmpDir}", found "${resolvedPath}".`);
    }
  }
  function _isEBADF(error) {
    return _isExpectedError(error, -EBADF, "EBADF");
  }
  function _isENOENT(error) {
    return _isExpectedError(error, -ENOENT, "ENOENT");
  }
  function _isExpectedError(error, errno, code) {
    return IS_WIN32 ? error.code === code : error.code === code && error.errno === errno;
  }
  function setGracefulCleanup() {
    _gracefulCleanup = true;
  }
  function _getTmpDir(options) {
    return path2.resolve(_sanitizeName(options && options.tmpdir || os2.tmpdir()));
  }
  process.addListener(EXIT, _garbageCollector);
  Object.defineProperty(module2.exports, "tmpdir", {
    enumerable: true,
    configurable: false,
    get: function() {
      return _getTmpDir();
    }
  });
  module2.exports.dir = dir;
  module2.exports.dirSync = dirSync;
  module2.exports.file = file;
  module2.exports.fileSync = fileSync;
  module2.exports.tmpName = tmpName;
  module2.exports.tmpNameSync = tmpNameSync;
  module2.exports.setGracefulCleanup = setGracefulCleanup;
})(tmp$1);
var tmpExports = tmp$1.exports;
(function(module2) {
  const { promisify } = require$$6;
  const tmp2 = tmpExports;
  module2.exports.fileSync = tmp2.fileSync;
  const fileWithOptions = promisify(
    (options, cb) => tmp2.file(
      options,
      (err, path2, fd, cleanup) => err ? cb(err) : cb(void 0, { path: path2, fd, cleanup: promisify(cleanup) })
    )
  );
  module2.exports.file = async (options) => fileWithOptions(options);
  module2.exports.withFile = async function withFile(fn, options) {
    const { path: path2, fd, cleanup } = await module2.exports.file(options);
    try {
      return await fn({ path: path2, fd });
    } finally {
      await cleanup();
    }
  };
  module2.exports.dirSync = tmp2.dirSync;
  const dirWithOptions = promisify(
    (options, cb) => tmp2.dir(
      options,
      (err, path2, cleanup) => err ? cb(err) : cb(void 0, { path: path2, cleanup: promisify(cleanup) })
    )
  );
  module2.exports.dir = async (options) => dirWithOptions(options);
  module2.exports.withDir = async function withDir(fn, options) {
    const { path: path2, cleanup } = await module2.exports.dir(options);
    try {
      return await fn({ path: path2 });
    } finally {
      await cleanup();
    }
  };
  module2.exports.tmpNameSync = tmp2.tmpNameSync;
  module2.exports.tmpName = promisify(tmp2.tmpName);
  module2.exports.tmpdir = tmp2.tmpdir;
  module2.exports.setGracefulCleanup = tmp2.setGracefulCleanup;
})(tmpPromise);
var tmpPromiseExports = tmpPromise.exports;
var utils = {};
var configVariables = {};
Object.defineProperty(configVariables, "__esModule", { value: true });
configVariables.getRetentionDays = configVariables.getWorkSpaceDirectory = configVariables.getWorkFlowRunId = configVariables.getRuntimeUrl = configVariables.getRuntimeToken = configVariables.getDownloadFileConcurrency = configVariables.getInitialRetryIntervalInMilliseconds = configVariables.getRetryMultiplier = configVariables.getRetryLimit = configVariables.getUploadChunkSize = configVariables.getUploadFileConcurrency = void 0;
function getUploadFileConcurrency() {
  return 2;
}
configVariables.getUploadFileConcurrency = getUploadFileConcurrency;
function getUploadChunkSize() {
  return 8 * 1024 * 1024;
}
configVariables.getUploadChunkSize = getUploadChunkSize;
function getRetryLimit() {
  return 5;
}
configVariables.getRetryLimit = getRetryLimit;
function getRetryMultiplier() {
  return 1.5;
}
configVariables.getRetryMultiplier = getRetryMultiplier;
function getInitialRetryIntervalInMilliseconds() {
  return 3e3;
}
configVariables.getInitialRetryIntervalInMilliseconds = getInitialRetryIntervalInMilliseconds;
function getDownloadFileConcurrency() {
  return 2;
}
configVariables.getDownloadFileConcurrency = getDownloadFileConcurrency;
function getRuntimeToken() {
  const token = process.env["ACTIONS_RUNTIME_TOKEN"];
  if (!token) {
    throw new Error("Unable to get ACTIONS_RUNTIME_TOKEN env variable");
  }
  return token;
}
configVariables.getRuntimeToken = getRuntimeToken;
function getRuntimeUrl() {
  const runtimeUrl = process.env["ACTIONS_RUNTIME_URL"];
  if (!runtimeUrl) {
    throw new Error("Unable to get ACTIONS_RUNTIME_URL env variable");
  }
  return runtimeUrl;
}
configVariables.getRuntimeUrl = getRuntimeUrl;
function getWorkFlowRunId() {
  const workFlowRunId = process.env["GITHUB_RUN_ID"];
  if (!workFlowRunId) {
    throw new Error("Unable to get GITHUB_RUN_ID env variable");
  }
  return workFlowRunId;
}
configVariables.getWorkFlowRunId = getWorkFlowRunId;
function getWorkSpaceDirectory() {
  const workspaceDirectory = process.env["GITHUB_WORKSPACE"];
  if (!workspaceDirectory) {
    throw new Error("Unable to get GITHUB_WORKSPACE env variable");
  }
  return workspaceDirectory;
}
configVariables.getWorkSpaceDirectory = getWorkSpaceDirectory;
function getRetentionDays() {
  return process.env["GITHUB_RETENTION_DAYS"];
}
configVariables.getRetentionDays = getRetentionDays;
var crc64 = {};
Object.defineProperty(crc64, "__esModule", { value: true });
const PREGEN_POLY_TABLE = [
  BigInt("0x0000000000000000"),
  BigInt("0x7F6EF0C830358979"),
  BigInt("0xFEDDE190606B12F2"),
  BigInt("0x81B31158505E9B8B"),
  BigInt("0xC962E5739841B68F"),
  BigInt("0xB60C15BBA8743FF6"),
  BigInt("0x37BF04E3F82AA47D"),
  BigInt("0x48D1F42BC81F2D04"),
  BigInt("0xA61CECB46814FE75"),
  BigInt("0xD9721C7C5821770C"),
  BigInt("0x58C10D24087FEC87"),
  BigInt("0x27AFFDEC384A65FE"),
  BigInt("0x6F7E09C7F05548FA"),
  BigInt("0x1010F90FC060C183"),
  BigInt("0x91A3E857903E5A08"),
  BigInt("0xEECD189FA00BD371"),
  BigInt("0x78E0FF3B88BE6F81"),
  BigInt("0x078E0FF3B88BE6F8"),
  BigInt("0x863D1EABE8D57D73"),
  BigInt("0xF953EE63D8E0F40A"),
  BigInt("0xB1821A4810FFD90E"),
  BigInt("0xCEECEA8020CA5077"),
  BigInt("0x4F5FFBD87094CBFC"),
  BigInt("0x30310B1040A14285"),
  BigInt("0xDEFC138FE0AA91F4"),
  BigInt("0xA192E347D09F188D"),
  BigInt("0x2021F21F80C18306"),
  BigInt("0x5F4F02D7B0F40A7F"),
  BigInt("0x179EF6FC78EB277B"),
  BigInt("0x68F0063448DEAE02"),
  BigInt("0xE943176C18803589"),
  BigInt("0x962DE7A428B5BCF0"),
  BigInt("0xF1C1FE77117CDF02"),
  BigInt("0x8EAF0EBF2149567B"),
  BigInt("0x0F1C1FE77117CDF0"),
  BigInt("0x7072EF2F41224489"),
  BigInt("0x38A31B04893D698D"),
  BigInt("0x47CDEBCCB908E0F4"),
  BigInt("0xC67EFA94E9567B7F"),
  BigInt("0xB9100A5CD963F206"),
  BigInt("0x57DD12C379682177"),
  BigInt("0x28B3E20B495DA80E"),
  BigInt("0xA900F35319033385"),
  BigInt("0xD66E039B2936BAFC"),
  BigInt("0x9EBFF7B0E12997F8"),
  BigInt("0xE1D10778D11C1E81"),
  BigInt("0x606216208142850A"),
  BigInt("0x1F0CE6E8B1770C73"),
  BigInt("0x8921014C99C2B083"),
  BigInt("0xF64FF184A9F739FA"),
  BigInt("0x77FCE0DCF9A9A271"),
  BigInt("0x08921014C99C2B08"),
  BigInt("0x4043E43F0183060C"),
  BigInt("0x3F2D14F731B68F75"),
  BigInt("0xBE9E05AF61E814FE"),
  BigInt("0xC1F0F56751DD9D87"),
  BigInt("0x2F3DEDF8F1D64EF6"),
  BigInt("0x50531D30C1E3C78F"),
  BigInt("0xD1E00C6891BD5C04"),
  BigInt("0xAE8EFCA0A188D57D"),
  BigInt("0xE65F088B6997F879"),
  BigInt("0x9931F84359A27100"),
  BigInt("0x1882E91B09FCEA8B"),
  BigInt("0x67EC19D339C963F2"),
  BigInt("0xD75ADABD7A6E2D6F"),
  BigInt("0xA8342A754A5BA416"),
  BigInt("0x29873B2D1A053F9D"),
  BigInt("0x56E9CBE52A30B6E4"),
  BigInt("0x1E383FCEE22F9BE0"),
  BigInt("0x6156CF06D21A1299"),
  BigInt("0xE0E5DE5E82448912"),
  BigInt("0x9F8B2E96B271006B"),
  BigInt("0x71463609127AD31A"),
  BigInt("0x0E28C6C1224F5A63"),
  BigInt("0x8F9BD7997211C1E8"),
  BigInt("0xF0F5275142244891"),
  BigInt("0xB824D37A8A3B6595"),
  BigInt("0xC74A23B2BA0EECEC"),
  BigInt("0x46F932EAEA507767"),
  BigInt("0x3997C222DA65FE1E"),
  BigInt("0xAFBA2586F2D042EE"),
  BigInt("0xD0D4D54EC2E5CB97"),
  BigInt("0x5167C41692BB501C"),
  BigInt("0x2E0934DEA28ED965"),
  BigInt("0x66D8C0F56A91F461"),
  BigInt("0x19B6303D5AA47D18"),
  BigInt("0x980521650AFAE693"),
  BigInt("0xE76BD1AD3ACF6FEA"),
  BigInt("0x09A6C9329AC4BC9B"),
  BigInt("0x76C839FAAAF135E2"),
  BigInt("0xF77B28A2FAAFAE69"),
  BigInt("0x8815D86ACA9A2710"),
  BigInt("0xC0C42C4102850A14"),
  BigInt("0xBFAADC8932B0836D"),
  BigInt("0x3E19CDD162EE18E6"),
  BigInt("0x41773D1952DB919F"),
  BigInt("0x269B24CA6B12F26D"),
  BigInt("0x59F5D4025B277B14"),
  BigInt("0xD846C55A0B79E09F"),
  BigInt("0xA72835923B4C69E6"),
  BigInt("0xEFF9C1B9F35344E2"),
  BigInt("0x90973171C366CD9B"),
  BigInt("0x1124202993385610"),
  BigInt("0x6E4AD0E1A30DDF69"),
  BigInt("0x8087C87E03060C18"),
  BigInt("0xFFE938B633338561"),
  BigInt("0x7E5A29EE636D1EEA"),
  BigInt("0x0134D92653589793"),
  BigInt("0x49E52D0D9B47BA97"),
  BigInt("0x368BDDC5AB7233EE"),
  BigInt("0xB738CC9DFB2CA865"),
  BigInt("0xC8563C55CB19211C"),
  BigInt("0x5E7BDBF1E3AC9DEC"),
  BigInt("0x21152B39D3991495"),
  BigInt("0xA0A63A6183C78F1E"),
  BigInt("0xDFC8CAA9B3F20667"),
  BigInt("0x97193E827BED2B63"),
  BigInt("0xE877CE4A4BD8A21A"),
  BigInt("0x69C4DF121B863991"),
  BigInt("0x16AA2FDA2BB3B0E8"),
  BigInt("0xF86737458BB86399"),
  BigInt("0x8709C78DBB8DEAE0"),
  BigInt("0x06BAD6D5EBD3716B"),
  BigInt("0x79D4261DDBE6F812"),
  BigInt("0x3105D23613F9D516"),
  BigInt("0x4E6B22FE23CC5C6F"),
  BigInt("0xCFD833A67392C7E4"),
  BigInt("0xB0B6C36E43A74E9D"),
  BigInt("0x9A6C9329AC4BC9B5"),
  BigInt("0xE50263E19C7E40CC"),
  BigInt("0x64B172B9CC20DB47"),
  BigInt("0x1BDF8271FC15523E"),
  BigInt("0x530E765A340A7F3A"),
  BigInt("0x2C608692043FF643"),
  BigInt("0xADD397CA54616DC8"),
  BigInt("0xD2BD67026454E4B1"),
  BigInt("0x3C707F9DC45F37C0"),
  BigInt("0x431E8F55F46ABEB9"),
  BigInt("0xC2AD9E0DA4342532"),
  BigInt("0xBDC36EC59401AC4B"),
  BigInt("0xF5129AEE5C1E814F"),
  BigInt("0x8A7C6A266C2B0836"),
  BigInt("0x0BCF7B7E3C7593BD"),
  BigInt("0x74A18BB60C401AC4"),
  BigInt("0xE28C6C1224F5A634"),
  BigInt("0x9DE29CDA14C02F4D"),
  BigInt("0x1C518D82449EB4C6"),
  BigInt("0x633F7D4A74AB3DBF"),
  BigInt("0x2BEE8961BCB410BB"),
  BigInt("0x548079A98C8199C2"),
  BigInt("0xD53368F1DCDF0249"),
  BigInt("0xAA5D9839ECEA8B30"),
  BigInt("0x449080A64CE15841"),
  BigInt("0x3BFE706E7CD4D138"),
  BigInt("0xBA4D61362C8A4AB3"),
  BigInt("0xC52391FE1CBFC3CA"),
  BigInt("0x8DF265D5D4A0EECE"),
  BigInt("0xF29C951DE49567B7"),
  BigInt("0x732F8445B4CBFC3C"),
  BigInt("0x0C41748D84FE7545"),
  BigInt("0x6BAD6D5EBD3716B7"),
  BigInt("0x14C39D968D029FCE"),
  BigInt("0x95708CCEDD5C0445"),
  BigInt("0xEA1E7C06ED698D3C"),
  BigInt("0xA2CF882D2576A038"),
  BigInt("0xDDA178E515432941"),
  BigInt("0x5C1269BD451DB2CA"),
  BigInt("0x237C997575283BB3"),
  BigInt("0xCDB181EAD523E8C2"),
  BigInt("0xB2DF7122E51661BB"),
  BigInt("0x336C607AB548FA30"),
  BigInt("0x4C0290B2857D7349"),
  BigInt("0x04D364994D625E4D"),
  BigInt("0x7BBD94517D57D734"),
  BigInt("0xFA0E85092D094CBF"),
  BigInt("0x856075C11D3CC5C6"),
  BigInt("0x134D926535897936"),
  BigInt("0x6C2362AD05BCF04F"),
  BigInt("0xED9073F555E26BC4"),
  BigInt("0x92FE833D65D7E2BD"),
  BigInt("0xDA2F7716ADC8CFB9"),
  BigInt("0xA54187DE9DFD46C0"),
  BigInt("0x24F29686CDA3DD4B"),
  BigInt("0x5B9C664EFD965432"),
  BigInt("0xB5517ED15D9D8743"),
  BigInt("0xCA3F8E196DA80E3A"),
  BigInt("0x4B8C9F413DF695B1"),
  BigInt("0x34E26F890DC31CC8"),
  BigInt("0x7C339BA2C5DC31CC"),
  BigInt("0x035D6B6AF5E9B8B5"),
  BigInt("0x82EE7A32A5B7233E"),
  BigInt("0xFD808AFA9582AA47"),
  BigInt("0x4D364994D625E4DA"),
  BigInt("0x3258B95CE6106DA3"),
  BigInt("0xB3EBA804B64EF628"),
  BigInt("0xCC8558CC867B7F51"),
  BigInt("0x8454ACE74E645255"),
  BigInt("0xFB3A5C2F7E51DB2C"),
  BigInt("0x7A894D772E0F40A7"),
  BigInt("0x05E7BDBF1E3AC9DE"),
  BigInt("0xEB2AA520BE311AAF"),
  BigInt("0x944455E88E0493D6"),
  BigInt("0x15F744B0DE5A085D"),
  BigInt("0x6A99B478EE6F8124"),
  BigInt("0x224840532670AC20"),
  BigInt("0x5D26B09B16452559"),
  BigInt("0xDC95A1C3461BBED2"),
  BigInt("0xA3FB510B762E37AB"),
  BigInt("0x35D6B6AF5E9B8B5B"),
  BigInt("0x4AB846676EAE0222"),
  BigInt("0xCB0B573F3EF099A9"),
  BigInt("0xB465A7F70EC510D0"),
  BigInt("0xFCB453DCC6DA3DD4"),
  BigInt("0x83DAA314F6EFB4AD"),
  BigInt("0x0269B24CA6B12F26"),
  BigInt("0x7D0742849684A65F"),
  BigInt("0x93CA5A1B368F752E"),
  BigInt("0xECA4AAD306BAFC57"),
  BigInt("0x6D17BB8B56E467DC"),
  BigInt("0x12794B4366D1EEA5"),
  BigInt("0x5AA8BF68AECEC3A1"),
  BigInt("0x25C64FA09EFB4AD8"),
  BigInt("0xA4755EF8CEA5D153"),
  BigInt("0xDB1BAE30FE90582A"),
  BigInt("0xBCF7B7E3C7593BD8"),
  BigInt("0xC399472BF76CB2A1"),
  BigInt("0x422A5673A732292A"),
  BigInt("0x3D44A6BB9707A053"),
  BigInt("0x759552905F188D57"),
  BigInt("0x0AFBA2586F2D042E"),
  BigInt("0x8B48B3003F739FA5"),
  BigInt("0xF42643C80F4616DC"),
  BigInt("0x1AEB5B57AF4DC5AD"),
  BigInt("0x6585AB9F9F784CD4"),
  BigInt("0xE436BAC7CF26D75F"),
  BigInt("0x9B584A0FFF135E26"),
  BigInt("0xD389BE24370C7322"),
  BigInt("0xACE74EEC0739FA5B"),
  BigInt("0x2D545FB4576761D0"),
  BigInt("0x523AAF7C6752E8A9"),
  BigInt("0xC41748D84FE75459"),
  BigInt("0xBB79B8107FD2DD20"),
  BigInt("0x3ACAA9482F8C46AB"),
  BigInt("0x45A459801FB9CFD2"),
  BigInt("0x0D75ADABD7A6E2D6"),
  BigInt("0x721B5D63E7936BAF"),
  BigInt("0xF3A84C3BB7CDF024"),
  BigInt("0x8CC6BCF387F8795D"),
  BigInt("0x620BA46C27F3AA2C"),
  BigInt("0x1D6554A417C62355"),
  BigInt("0x9CD645FC4798B8DE"),
  BigInt("0xE3B8B53477AD31A7"),
  BigInt("0xAB69411FBFB21CA3"),
  BigInt("0xD407B1D78F8795DA"),
  BigInt("0x55B4A08FDFD90E51"),
  BigInt("0x2ADA5047EFEC8728")
];
class CRC64 {
  constructor() {
    this._crc = BigInt(0);
  }
  update(data) {
    const buffer = typeof data === "string" ? Buffer.from(data) : data;
    let crc = CRC64.flip64Bits(this._crc);
    for (const dataByte of buffer) {
      const crcByte = Number(crc & BigInt(255));
      crc = PREGEN_POLY_TABLE[crcByte ^ dataByte] ^ crc >> BigInt(8);
    }
    this._crc = CRC64.flip64Bits(crc);
  }
  digest(encoding) {
    switch (encoding) {
      case "hex":
        return this._crc.toString(16).toUpperCase();
      case "base64":
        return this.toBuffer().toString("base64");
      default:
        return this.toBuffer();
    }
  }
  toBuffer() {
    return Buffer.from([0, 8, 16, 24, 32, 40, 48, 56].map((s) => Number(this._crc >> BigInt(s) & BigInt(255))));
  }
  static flip64Bits(n) {
    return (BigInt(1) << BigInt(64)) - BigInt(1) - n;
  }
}
crc64.default = CRC64;
var __awaiter$5 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(utils, "__esModule", { value: true });
utils.digestForStream = utils.sleep = utils.getProperRetention = utils.rmFile = utils.getFileSize = utils.createEmptyFilesForArtifact = utils.createDirectoriesForArtifact = utils.displayHttpDiagnostics = utils.getArtifactUrl = utils.createHttpClient = utils.getUploadHeaders = utils.getDownloadHeaders = utils.getContentRange = utils.tryGetRetryAfterValueTimeInMilliseconds = utils.isThrottledStatusCode = utils.isRetryableStatusCode = utils.isForbiddenStatusCode = utils.isSuccessStatusCode = utils.getApiVersion = utils.parseEnvNumber = utils.getExponentialRetryTimeInMilliseconds = void 0;
const crypto_1 = __importDefault(crypto);
const fs_1 = require$$0;
const core_1$1 = requireCore();
const http_client_1$1 = lib;
const auth_1 = auth$1;
const config_variables_1$4 = configVariables;
const crc64_1 = __importDefault(crc64);
function getExponentialRetryTimeInMilliseconds(retryCount) {
  if (retryCount < 0) {
    throw new Error("RetryCount should not be negative");
  } else if (retryCount === 0) {
    return config_variables_1$4.getInitialRetryIntervalInMilliseconds();
  }
  const minTime = config_variables_1$4.getInitialRetryIntervalInMilliseconds() * config_variables_1$4.getRetryMultiplier() * retryCount;
  const maxTime = minTime * config_variables_1$4.getRetryMultiplier();
  return Math.trunc(Math.random() * (maxTime - minTime) + minTime);
}
utils.getExponentialRetryTimeInMilliseconds = getExponentialRetryTimeInMilliseconds;
function parseEnvNumber(key) {
  const value = Number(process.env[key]);
  if (Number.isNaN(value) || value < 0) {
    return void 0;
  }
  return value;
}
utils.parseEnvNumber = parseEnvNumber;
function getApiVersion() {
  return "6.0-preview";
}
utils.getApiVersion = getApiVersion;
function isSuccessStatusCode(statusCode) {
  if (!statusCode) {
    return false;
  }
  return statusCode >= 200 && statusCode < 300;
}
utils.isSuccessStatusCode = isSuccessStatusCode;
function isForbiddenStatusCode(statusCode) {
  if (!statusCode) {
    return false;
  }
  return statusCode === http_client_1$1.HttpCodes.Forbidden;
}
utils.isForbiddenStatusCode = isForbiddenStatusCode;
function isRetryableStatusCode(statusCode) {
  if (!statusCode) {
    return false;
  }
  const retryableStatusCodes = [
    http_client_1$1.HttpCodes.BadGateway,
    http_client_1$1.HttpCodes.GatewayTimeout,
    http_client_1$1.HttpCodes.InternalServerError,
    http_client_1$1.HttpCodes.ServiceUnavailable,
    http_client_1$1.HttpCodes.TooManyRequests,
    413
    // Payload Too Large
  ];
  return retryableStatusCodes.includes(statusCode);
}
utils.isRetryableStatusCode = isRetryableStatusCode;
function isThrottledStatusCode(statusCode) {
  if (!statusCode) {
    return false;
  }
  return statusCode === http_client_1$1.HttpCodes.TooManyRequests;
}
utils.isThrottledStatusCode = isThrottledStatusCode;
function tryGetRetryAfterValueTimeInMilliseconds(headers) {
  if (headers["retry-after"]) {
    const retryTime = Number(headers["retry-after"]);
    if (!isNaN(retryTime)) {
      core_1$1.info(`Retry-After header is present with a value of ${retryTime}`);
      return retryTime * 1e3;
    }
    core_1$1.info(`Returned retry-after header value: ${retryTime} is non-numeric and cannot be used`);
    return void 0;
  }
  core_1$1.info(`No retry-after header was found. Dumping all headers for diagnostic purposes`);
  console.log(headers);
  return void 0;
}
utils.tryGetRetryAfterValueTimeInMilliseconds = tryGetRetryAfterValueTimeInMilliseconds;
function getContentRange(start, end, total) {
  return `bytes ${start}-${end}/${total}`;
}
utils.getContentRange = getContentRange;
function getDownloadHeaders(contentType, isKeepAlive, acceptGzip) {
  const requestOptions = {};
  if (contentType) {
    requestOptions["Content-Type"] = contentType;
  }
  if (isKeepAlive) {
    requestOptions["Connection"] = "Keep-Alive";
    requestOptions["Keep-Alive"] = "10";
  }
  if (acceptGzip) {
    requestOptions["Accept-Encoding"] = "gzip";
    requestOptions["Accept"] = `application/octet-stream;api-version=${getApiVersion()}`;
  } else {
    requestOptions["Accept"] = `application/json;api-version=${getApiVersion()}`;
  }
  return requestOptions;
}
utils.getDownloadHeaders = getDownloadHeaders;
function getUploadHeaders(contentType, isKeepAlive, isGzip, uncompressedLength, contentLength, contentRange, digest) {
  const requestOptions = {};
  requestOptions["Accept"] = `application/json;api-version=${getApiVersion()}`;
  if (contentType) {
    requestOptions["Content-Type"] = contentType;
  }
  if (isKeepAlive) {
    requestOptions["Connection"] = "Keep-Alive";
    requestOptions["Keep-Alive"] = "10";
  }
  if (isGzip) {
    requestOptions["Content-Encoding"] = "gzip";
    requestOptions["x-tfs-filelength"] = uncompressedLength;
  }
  if (contentLength) {
    requestOptions["Content-Length"] = contentLength;
  }
  if (contentRange) {
    requestOptions["Content-Range"] = contentRange;
  }
  if (digest) {
    requestOptions["x-actions-results-crc64"] = digest.crc64;
    requestOptions["x-actions-results-md5"] = digest.md5;
  }
  return requestOptions;
}
utils.getUploadHeaders = getUploadHeaders;
function createHttpClient(userAgent2) {
  return new http_client_1$1.HttpClient(userAgent2, [
    new auth_1.BearerCredentialHandler(config_variables_1$4.getRuntimeToken())
  ]);
}
utils.createHttpClient = createHttpClient;
function getArtifactUrl() {
  const artifactUrl = `${config_variables_1$4.getRuntimeUrl()}_apis/pipelines/workflows/${config_variables_1$4.getWorkFlowRunId()}/artifacts?api-version=${getApiVersion()}`;
  core_1$1.debug(`Artifact Url: ${artifactUrl}`);
  return artifactUrl;
}
utils.getArtifactUrl = getArtifactUrl;
function displayHttpDiagnostics(response) {
  core_1$1.info(`##### Begin Diagnostic HTTP information #####
Status Code: ${response.message.statusCode}
Status Message: ${response.message.statusMessage}
Header Information: ${JSON.stringify(response.message.headers, void 0, 2)}
###### End Diagnostic HTTP information ######`);
}
utils.displayHttpDiagnostics = displayHttpDiagnostics;
function createDirectoriesForArtifact(directories) {
  return __awaiter$5(this, void 0, void 0, function* () {
    for (const directory of directories) {
      yield fs_1.promises.mkdir(directory, {
        recursive: true
      });
    }
  });
}
utils.createDirectoriesForArtifact = createDirectoriesForArtifact;
function createEmptyFilesForArtifact(emptyFilesToCreate) {
  return __awaiter$5(this, void 0, void 0, function* () {
    for (const filePath of emptyFilesToCreate) {
      yield (yield fs_1.promises.open(filePath, "w")).close();
    }
  });
}
utils.createEmptyFilesForArtifact = createEmptyFilesForArtifact;
function getFileSize(filePath) {
  return __awaiter$5(this, void 0, void 0, function* () {
    const stats = yield fs_1.promises.stat(filePath);
    core_1$1.debug(`${filePath} size:(${stats.size}) blksize:(${stats.blksize}) blocks:(${stats.blocks})`);
    return stats.size;
  });
}
utils.getFileSize = getFileSize;
function rmFile(filePath) {
  return __awaiter$5(this, void 0, void 0, function* () {
    yield fs_1.promises.unlink(filePath);
  });
}
utils.rmFile = rmFile;
function getProperRetention(retentionInput, retentionSetting) {
  if (retentionInput < 0) {
    throw new Error("Invalid retention, minimum value is 1.");
  }
  let retention = retentionInput;
  if (retentionSetting) {
    const maxRetention = parseInt(retentionSetting);
    if (!isNaN(maxRetention) && maxRetention < retention) {
      core_1$1.warning(`Retention days is greater than the max value allowed by the repository setting, reduce retention to ${maxRetention} days`);
      retention = maxRetention;
    }
  }
  return retention;
}
utils.getProperRetention = getProperRetention;
function sleep(milliseconds) {
  return __awaiter$5(this, void 0, void 0, function* () {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  });
}
utils.sleep = sleep;
function digestForStream(stream2) {
  return __awaiter$5(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
      const crc642 = new crc64_1.default();
      const md52 = crypto_1.default.createHash("md5");
      stream2.on("data", (data) => {
        crc642.update(data);
        md52.update(data);
      }).on("end", () => resolve({
        crc64: crc642.digest("base64"),
        md5: md52.digest("base64")
      })).on("error", reject);
    });
  });
}
utils.digestForStream = digestForStream;
var statusReporter = {};
Object.defineProperty(statusReporter, "__esModule", { value: true });
statusReporter.StatusReporter = void 0;
const core_1 = requireCore();
class StatusReporter {
  constructor(displayFrequencyInMilliseconds) {
    this.totalNumberOfFilesToProcess = 0;
    this.processedCount = 0;
    this.largeFiles = /* @__PURE__ */ new Map();
    this.totalFileStatus = void 0;
    this.displayFrequencyInMilliseconds = displayFrequencyInMilliseconds;
  }
  setTotalNumberOfFilesToProcess(fileTotal) {
    this.totalNumberOfFilesToProcess = fileTotal;
    this.processedCount = 0;
  }
  start() {
    this.totalFileStatus = setInterval(() => {
      const percentage = this.formatPercentage(this.processedCount, this.totalNumberOfFilesToProcess);
      core_1.info(`Total file count: ${this.totalNumberOfFilesToProcess} ---- Processed file #${this.processedCount} (${percentage.slice(0, percentage.indexOf(".") + 2)}%)`);
    }, this.displayFrequencyInMilliseconds);
  }
  // if there is a large file that is being uploaded in chunks, this is used to display extra information about the status of the upload
  updateLargeFileStatus(fileName, chunkStartIndex, chunkEndIndex, totalUploadFileSize) {
    const percentage = this.formatPercentage(chunkEndIndex, totalUploadFileSize);
    core_1.info(`Uploaded ${fileName} (${percentage.slice(0, percentage.indexOf(".") + 2)}%) bytes ${chunkStartIndex}:${chunkEndIndex}`);
  }
  stop() {
    if (this.totalFileStatus) {
      clearInterval(this.totalFileStatus);
    }
  }
  incrementProcessedCount() {
    this.processedCount++;
  }
  formatPercentage(numerator, denominator) {
    return (numerator / denominator * 100).toFixed(4).toString();
  }
}
statusReporter.StatusReporter = StatusReporter;
var httpManager = {};
Object.defineProperty(httpManager, "__esModule", { value: true });
httpManager.HttpManager = void 0;
const utils_1$4 = utils;
class HttpManager {
  constructor(clientCount, userAgent2) {
    if (clientCount < 1) {
      throw new Error("There must be at least one client");
    }
    this.userAgent = userAgent2;
    this.clients = new Array(clientCount).fill(utils_1$4.createHttpClient(userAgent2));
  }
  getClient(index) {
    return this.clients[index];
  }
  // client disposal is necessary if a keep-alive connection is used to properly close the connection
  // for more information see: https://github.com/actions/http-client/blob/04e5ad73cd3fd1f5610a32116b0759eddf6570d2/index.ts#L292
  disposeAndReplaceClient(index) {
    this.clients[index].dispose();
    this.clients[index] = utils_1$4.createHttpClient(this.userAgent);
  }
  disposeAndReplaceAllClients() {
    for (const [index] of this.clients.entries()) {
      this.disposeAndReplaceClient(index);
    }
  }
}
httpManager.HttpManager = HttpManager;
var uploadGzip = {};
var __createBinding$5 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  Object.defineProperty(o, k22, { enumerable: true, get: function() {
    return m[k2];
  } });
} : function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  o[k22] = m[k2];
});
var __setModuleDefault$5 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$5 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k2 in mod)
      if (k2 !== "default" && Object.hasOwnProperty.call(mod, k2))
        __createBinding$5(result, mod, k2);
  }
  __setModuleDefault$5(result, mod);
  return result;
};
var __awaiter$4 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __asyncValues = commonjsGlobal && commonjsGlobal.__asyncValues || function(o) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i);
  function verb(n) {
    i[n] = o[n] && function(v) {
      return new Promise(function(resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function(v2) {
      resolve({ value: v2, done: d });
    }, reject);
  }
};
Object.defineProperty(uploadGzip, "__esModule", { value: true });
uploadGzip.createGZipFileInBuffer = uploadGzip.createGZipFileOnDisk = void 0;
const fs$2 = __importStar$5(require$$0);
const zlib$1 = __importStar$5(require$$1$2);
const util_1$1 = require$$6;
const stat$1 = util_1$1.promisify(fs$2.stat);
const gzipExemptFileExtensions = [
  ".gzip",
  ".zip",
  ".tar.lz",
  ".tar.gz",
  ".tar.bz2",
  ".7z"
];
function createGZipFileOnDisk(originalFilePath, tempFilePath) {
  return __awaiter$4(this, void 0, void 0, function* () {
    for (const gzipExemptExtension of gzipExemptFileExtensions) {
      if (originalFilePath.endsWith(gzipExemptExtension)) {
        return Number.MAX_SAFE_INTEGER;
      }
    }
    return new Promise((resolve, reject) => {
      const inputStream = fs$2.createReadStream(originalFilePath);
      const gzip = zlib$1.createGzip();
      const outputStream = fs$2.createWriteStream(tempFilePath);
      inputStream.pipe(gzip).pipe(outputStream);
      outputStream.on("finish", () => __awaiter$4(this, void 0, void 0, function* () {
        const size = (yield stat$1(tempFilePath)).size;
        resolve(size);
      }));
      outputStream.on("error", (error) => {
        console.log(error);
      });
    });
  });
}
uploadGzip.createGZipFileOnDisk = createGZipFileOnDisk;
function createGZipFileInBuffer(originalFilePath) {
  return __awaiter$4(this, void 0, void 0, function* () {
    return new Promise((resolve) => __awaiter$4(this, void 0, void 0, function* () {
      var e_1, _a;
      const inputStream = fs$2.createReadStream(originalFilePath);
      const gzip = zlib$1.createGzip();
      inputStream.pipe(gzip);
      const chunks = [];
      try {
        for (var gzip_1 = __asyncValues(gzip), gzip_1_1; gzip_1_1 = yield gzip_1.next(), !gzip_1_1.done; ) {
          const chunk = gzip_1_1.value;
          chunks.push(chunk);
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (gzip_1_1 && !gzip_1_1.done && (_a = gzip_1.return))
            yield _a.call(gzip_1);
        } finally {
          if (e_1)
            throw e_1.error;
        }
      }
      resolve(Buffer.concat(chunks));
    }));
  });
}
uploadGzip.createGZipFileInBuffer = createGZipFileInBuffer;
var requestUtils = {};
var __createBinding$4 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  Object.defineProperty(o, k22, { enumerable: true, get: function() {
    return m[k2];
  } });
} : function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  o[k22] = m[k2];
});
var __setModuleDefault$4 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$4 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k2 in mod)
      if (k2 !== "default" && Object.hasOwnProperty.call(mod, k2))
        __createBinding$4(result, mod, k2);
  }
  __setModuleDefault$4(result, mod);
  return result;
};
var __awaiter$3 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
Object.defineProperty(requestUtils, "__esModule", { value: true });
requestUtils.retryHttpClientRequest = requestUtils.retry = void 0;
const utils_1$3 = utils;
const core$3 = __importStar$4(requireCore());
const config_variables_1$3 = configVariables;
function retry(name, operation, customErrorMessages, maxAttempts) {
  return __awaiter$3(this, void 0, void 0, function* () {
    let response = void 0;
    let statusCode = void 0;
    let isRetryable = false;
    let errorMessage = "";
    let customErrorInformation = void 0;
    let attempt = 1;
    while (attempt <= maxAttempts) {
      try {
        response = yield operation();
        statusCode = response.message.statusCode;
        if (utils_1$3.isSuccessStatusCode(statusCode)) {
          return response;
        }
        if (statusCode) {
          customErrorInformation = customErrorMessages.get(statusCode);
        }
        isRetryable = utils_1$3.isRetryableStatusCode(statusCode);
        errorMessage = `Artifact service responded with ${statusCode}`;
      } catch (error) {
        isRetryable = true;
        errorMessage = error.message;
      }
      if (!isRetryable) {
        core$3.info(`${name} - Error is not retryable`);
        if (response) {
          utils_1$3.displayHttpDiagnostics(response);
        }
        break;
      }
      core$3.info(`${name} - Attempt ${attempt} of ${maxAttempts} failed with error: ${errorMessage}`);
      yield utils_1$3.sleep(utils_1$3.getExponentialRetryTimeInMilliseconds(attempt));
      attempt++;
    }
    if (response) {
      utils_1$3.displayHttpDiagnostics(response);
    }
    if (customErrorInformation) {
      throw Error(`${name} failed: ${customErrorInformation}`);
    }
    throw Error(`${name} failed: ${errorMessage}`);
  });
}
requestUtils.retry = retry;
function retryHttpClientRequest(name, method, customErrorMessages = /* @__PURE__ */ new Map(), maxAttempts = config_variables_1$3.getRetryLimit()) {
  return __awaiter$3(this, void 0, void 0, function* () {
    return yield retry(name, method, customErrorMessages, maxAttempts);
  });
}
requestUtils.retryHttpClientRequest = retryHttpClientRequest;
var __createBinding$3 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  Object.defineProperty(o, k22, { enumerable: true, get: function() {
    return m[k2];
  } });
} : function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  o[k22] = m[k2];
});
var __setModuleDefault$3 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$3 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k2 in mod)
      if (k2 !== "default" && Object.hasOwnProperty.call(mod, k2))
        __createBinding$3(result, mod, k2);
  }
  __setModuleDefault$3(result, mod);
  return result;
};
var __awaiter$2 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
Object.defineProperty(uploadHttpClient, "__esModule", { value: true });
uploadHttpClient.UploadHttpClient = void 0;
const fs$1 = __importStar$3(require$$0);
const core$2 = __importStar$3(requireCore());
const tmp = __importStar$3(tmpPromiseExports);
const stream = __importStar$3(require$$3$2);
const utils_1$2 = utils;
const config_variables_1$2 = configVariables;
const util_1 = require$$6;
const url_1$1 = require$$7;
const perf_hooks_1$1 = require$$8;
const status_reporter_1$1 = statusReporter;
const http_client_1 = lib;
const http_manager_1$1 = httpManager;
const upload_gzip_1 = uploadGzip;
const requestUtils_1$1 = requestUtils;
const stat = util_1.promisify(fs$1.stat);
class UploadHttpClient {
  constructor() {
    this.uploadHttpManager = new http_manager_1$1.HttpManager(config_variables_1$2.getUploadFileConcurrency(), "@actions/artifact-upload");
    this.statusReporter = new status_reporter_1$1.StatusReporter(1e4);
  }
  /**
   * Creates a file container for the new artifact in the remote blob storage/file service
   * @param {string} artifactName Name of the artifact being created
   * @returns The response from the Artifact Service if the file container was successfully created
   */
  createArtifactInFileContainer(artifactName, options) {
    return __awaiter$2(this, void 0, void 0, function* () {
      const parameters = {
        Type: "actions_storage",
        Name: artifactName
      };
      if (options && options.retentionDays) {
        const maxRetentionStr = config_variables_1$2.getRetentionDays();
        parameters.RetentionDays = utils_1$2.getProperRetention(options.retentionDays, maxRetentionStr);
      }
      const data = JSON.stringify(parameters, null, 2);
      const artifactUrl = utils_1$2.getArtifactUrl();
      const client = this.uploadHttpManager.getClient(0);
      const headers = utils_1$2.getUploadHeaders("application/json", false);
      const customErrorMessages = /* @__PURE__ */ new Map([
        [
          http_client_1.HttpCodes.Forbidden,
          "Artifact storage quota has been hit. Unable to upload any new artifacts"
        ],
        [
          http_client_1.HttpCodes.BadRequest,
          `The artifact name ${artifactName} is not valid. Request URL ${artifactUrl}`
        ]
      ]);
      const response = yield requestUtils_1$1.retryHttpClientRequest("Create Artifact Container", () => __awaiter$2(this, void 0, void 0, function* () {
        return client.post(artifactUrl, data, headers);
      }), customErrorMessages);
      const body = yield response.readBody();
      return JSON.parse(body);
    });
  }
  /**
   * Concurrently upload all of the files in chunks
   * @param {string} uploadUrl Base Url for the artifact that was created
   * @param {SearchResult[]} filesToUpload A list of information about the files being uploaded
   * @returns The size of all the files uploaded in bytes
   */
  uploadArtifactToFileContainer(uploadUrl, filesToUpload, options) {
    return __awaiter$2(this, void 0, void 0, function* () {
      const FILE_CONCURRENCY = config_variables_1$2.getUploadFileConcurrency();
      const MAX_CHUNK_SIZE = config_variables_1$2.getUploadChunkSize();
      core$2.debug(`File Concurrency: ${FILE_CONCURRENCY}, and Chunk Size: ${MAX_CHUNK_SIZE}`);
      const parameters = [];
      let continueOnError = true;
      if (options) {
        if (options.continueOnError === false) {
          continueOnError = false;
        }
      }
      for (const file of filesToUpload) {
        const resourceUrl = new url_1$1.URL(uploadUrl);
        resourceUrl.searchParams.append("itemPath", file.uploadFilePath);
        parameters.push({
          file: file.absoluteFilePath,
          resourceUrl: resourceUrl.toString(),
          maxChunkSize: MAX_CHUNK_SIZE,
          continueOnError
        });
      }
      const parallelUploads = [...new Array(FILE_CONCURRENCY).keys()];
      const failedItemsToReport = [];
      let currentFile = 0;
      let completedFiles = 0;
      let uploadFileSize = 0;
      let totalFileSize = 0;
      let abortPendingFileUploads = false;
      this.statusReporter.setTotalNumberOfFilesToProcess(filesToUpload.length);
      this.statusReporter.start();
      yield Promise.all(parallelUploads.map((index) => __awaiter$2(this, void 0, void 0, function* () {
        while (currentFile < filesToUpload.length) {
          const currentFileParameters = parameters[currentFile];
          currentFile += 1;
          if (abortPendingFileUploads) {
            failedItemsToReport.push(currentFileParameters.file);
            continue;
          }
          const startTime = perf_hooks_1$1.performance.now();
          const uploadFileResult = yield this.uploadFileAsync(index, currentFileParameters);
          if (core$2.isDebug()) {
            core$2.debug(`File: ${++completedFiles}/${filesToUpload.length}. ${currentFileParameters.file} took ${(perf_hooks_1$1.performance.now() - startTime).toFixed(3)} milliseconds to finish upload`);
          }
          uploadFileSize += uploadFileResult.successfulUploadSize;
          totalFileSize += uploadFileResult.totalSize;
          if (uploadFileResult.isSuccess === false) {
            failedItemsToReport.push(currentFileParameters.file);
            if (!continueOnError) {
              core$2.error(`aborting artifact upload`);
              abortPendingFileUploads = true;
            }
          }
          this.statusReporter.incrementProcessedCount();
        }
      })));
      this.statusReporter.stop();
      this.uploadHttpManager.disposeAndReplaceAllClients();
      core$2.info(`Total size of all the files uploaded is ${uploadFileSize} bytes`);
      return {
        uploadSize: uploadFileSize,
        totalSize: totalFileSize,
        failedItems: failedItemsToReport
      };
    });
  }
  /**
   * Asynchronously uploads a file. The file is compressed and uploaded using GZip if it is determined to save space.
   * If the upload file is bigger than the max chunk size it will be uploaded via multiple calls
   * @param {number} httpClientIndex The index of the httpClient that is being used to make all of the calls
   * @param {UploadFileParameters} parameters Information about the file that needs to be uploaded
   * @returns The size of the file that was uploaded in bytes along with any failed uploads
   */
  uploadFileAsync(httpClientIndex, parameters) {
    return __awaiter$2(this, void 0, void 0, function* () {
      const fileStat = yield stat(parameters.file);
      const totalFileSize = fileStat.size;
      const isFIFO = fileStat.isFIFO();
      let offset = 0;
      let isUploadSuccessful = true;
      let failedChunkSizes = 0;
      let uploadFileSize = 0;
      let isGzip = true;
      if (!isFIFO && totalFileSize < 65536) {
        core$2.debug(`${parameters.file} is less than 64k in size. Creating a gzip file in-memory to potentially reduce the upload size`);
        const buffer = yield upload_gzip_1.createGZipFileInBuffer(parameters.file);
        let openUploadStream;
        if (totalFileSize < buffer.byteLength) {
          core$2.debug(`The gzip file created for ${parameters.file} did not help with reducing the size of the file. The original file will be uploaded as-is`);
          openUploadStream = () => fs$1.createReadStream(parameters.file);
          isGzip = false;
          uploadFileSize = totalFileSize;
        } else {
          core$2.debug(`A gzip file created for ${parameters.file} helped with reducing the size of the original file. The file will be uploaded using gzip.`);
          openUploadStream = () => {
            const passThrough = new stream.PassThrough();
            passThrough.end(buffer);
            return passThrough;
          };
          uploadFileSize = buffer.byteLength;
        }
        const result = yield this.uploadChunk(httpClientIndex, parameters.resourceUrl, openUploadStream, 0, uploadFileSize - 1, uploadFileSize, isGzip, totalFileSize);
        if (!result) {
          isUploadSuccessful = false;
          failedChunkSizes += uploadFileSize;
          core$2.warning(`Aborting upload for ${parameters.file} due to failure`);
        }
        return {
          isSuccess: isUploadSuccessful,
          successfulUploadSize: uploadFileSize - failedChunkSizes,
          totalSize: totalFileSize
        };
      } else {
        const tempFile = yield tmp.file();
        core$2.debug(`${parameters.file} is greater than 64k in size. Creating a gzip file on-disk ${tempFile.path} to potentially reduce the upload size`);
        uploadFileSize = yield upload_gzip_1.createGZipFileOnDisk(parameters.file, tempFile.path);
        let uploadFilePath = tempFile.path;
        if (!isFIFO && totalFileSize < uploadFileSize) {
          core$2.debug(`The gzip file created for ${parameters.file} did not help with reducing the size of the file. The original file will be uploaded as-is`);
          uploadFileSize = totalFileSize;
          uploadFilePath = parameters.file;
          isGzip = false;
        } else {
          core$2.debug(`The gzip file created for ${parameters.file} is smaller than the original file. The file will be uploaded using gzip.`);
        }
        let abortFileUpload = false;
        while (offset < uploadFileSize) {
          const chunkSize = Math.min(uploadFileSize - offset, parameters.maxChunkSize);
          const startChunkIndex = offset;
          const endChunkIndex = offset + chunkSize - 1;
          offset += parameters.maxChunkSize;
          if (abortFileUpload) {
            failedChunkSizes += chunkSize;
            continue;
          }
          const result = yield this.uploadChunk(httpClientIndex, parameters.resourceUrl, () => fs$1.createReadStream(uploadFilePath, {
            start: startChunkIndex,
            end: endChunkIndex,
            autoClose: false
          }), startChunkIndex, endChunkIndex, uploadFileSize, isGzip, totalFileSize);
          if (!result) {
            isUploadSuccessful = false;
            failedChunkSizes += chunkSize;
            core$2.warning(`Aborting upload for ${parameters.file} due to failure`);
            abortFileUpload = true;
          } else {
            if (uploadFileSize > 8388608) {
              this.statusReporter.updateLargeFileStatus(parameters.file, startChunkIndex, endChunkIndex, uploadFileSize);
            }
          }
        }
        core$2.debug(`deleting temporary gzip file ${tempFile.path}`);
        yield tempFile.cleanup();
        return {
          isSuccess: isUploadSuccessful,
          successfulUploadSize: uploadFileSize - failedChunkSizes,
          totalSize: totalFileSize
        };
      }
    });
  }
  /**
   * Uploads a chunk of an individual file to the specified resourceUrl. If the upload fails and the status code
   * indicates a retryable status, we try to upload the chunk as well
   * @param {number} httpClientIndex The index of the httpClient being used to make all the necessary calls
   * @param {string} resourceUrl Url of the resource that the chunk will be uploaded to
   * @param {NodeJS.ReadableStream} openStream Stream of the file that will be uploaded
   * @param {number} start Starting byte index of file that the chunk belongs to
   * @param {number} end Ending byte index of file that the chunk belongs to
   * @param {number} uploadFileSize Total size of the file in bytes that is being uploaded
   * @param {boolean} isGzip Denotes if we are uploading a Gzip compressed stream
   * @param {number} totalFileSize Original total size of the file that is being uploaded
   * @returns if the chunk was successfully uploaded
   */
  uploadChunk(httpClientIndex, resourceUrl, openStream, start, end, uploadFileSize, isGzip, totalFileSize) {
    return __awaiter$2(this, void 0, void 0, function* () {
      const digest = yield utils_1$2.digestForStream(openStream());
      const headers = utils_1$2.getUploadHeaders("application/octet-stream", true, isGzip, totalFileSize, end - start + 1, utils_1$2.getContentRange(start, end, uploadFileSize), digest);
      const uploadChunkRequest = () => __awaiter$2(this, void 0, void 0, function* () {
        const client = this.uploadHttpManager.getClient(httpClientIndex);
        return yield client.sendStream("PUT", resourceUrl, openStream(), headers);
      });
      let retryCount = 0;
      const retryLimit = config_variables_1$2.getRetryLimit();
      const incrementAndCheckRetryLimit = (response) => {
        retryCount++;
        if (retryCount > retryLimit) {
          if (response) {
            utils_1$2.displayHttpDiagnostics(response);
          }
          core$2.info(`Retry limit has been reached for chunk at offset ${start} to ${resourceUrl}`);
          return true;
        }
        return false;
      };
      const backOff = (retryAfterValue) => __awaiter$2(this, void 0, void 0, function* () {
        this.uploadHttpManager.disposeAndReplaceClient(httpClientIndex);
        if (retryAfterValue) {
          core$2.info(`Backoff due to too many requests, retry #${retryCount}. Waiting for ${retryAfterValue} milliseconds before continuing the upload`);
          yield utils_1$2.sleep(retryAfterValue);
        } else {
          const backoffTime = utils_1$2.getExponentialRetryTimeInMilliseconds(retryCount);
          core$2.info(`Exponential backoff for retry #${retryCount}. Waiting for ${backoffTime} milliseconds before continuing the upload at offset ${start}`);
          yield utils_1$2.sleep(backoffTime);
        }
        core$2.info(`Finished backoff for retry #${retryCount}, continuing with upload`);
        return;
      });
      while (retryCount <= retryLimit) {
        let response;
        try {
          response = yield uploadChunkRequest();
        } catch (error) {
          core$2.info(`An error has been caught http-client index ${httpClientIndex}, retrying the upload`);
          console.log(error);
          if (incrementAndCheckRetryLimit()) {
            return false;
          }
          yield backOff();
          continue;
        }
        yield response.readBody();
        if (utils_1$2.isSuccessStatusCode(response.message.statusCode)) {
          return true;
        } else if (utils_1$2.isRetryableStatusCode(response.message.statusCode)) {
          core$2.info(`A ${response.message.statusCode} status code has been received, will attempt to retry the upload`);
          if (incrementAndCheckRetryLimit(response)) {
            return false;
          }
          utils_1$2.isThrottledStatusCode(response.message.statusCode) ? yield backOff(utils_1$2.tryGetRetryAfterValueTimeInMilliseconds(response.message.headers)) : yield backOff();
        } else {
          core$2.error(`Unexpected response. Unable to upload chunk to ${resourceUrl}`);
          utils_1$2.displayHttpDiagnostics(response);
          return false;
        }
      }
      return false;
    });
  }
  /**
   * Updates the size of the artifact from -1 which was initially set when the container was first created for the artifact.
   * Updating the size indicates that we are done uploading all the contents of the artifact
   */
  patchArtifactSize(size, artifactName) {
    return __awaiter$2(this, void 0, void 0, function* () {
      const resourceUrl = new url_1$1.URL(utils_1$2.getArtifactUrl());
      resourceUrl.searchParams.append("artifactName", artifactName);
      const parameters = { Size: size };
      const data = JSON.stringify(parameters, null, 2);
      core$2.debug(`URL is ${resourceUrl.toString()}`);
      const client = this.uploadHttpManager.getClient(0);
      const headers = utils_1$2.getUploadHeaders("application/json", false);
      const customErrorMessages = /* @__PURE__ */ new Map([
        [
          http_client_1.HttpCodes.NotFound,
          `An Artifact with the name ${artifactName} was not found`
        ]
      ]);
      const response = yield requestUtils_1$1.retryHttpClientRequest("Finalize artifact upload", () => __awaiter$2(this, void 0, void 0, function* () {
        return client.patch(resourceUrl.toString(), data, headers);
      }), customErrorMessages);
      yield response.readBody();
      core$2.debug(`Artifact ${artifactName} has been successfully uploaded, total size in bytes: ${size}`);
    });
  }
}
uploadHttpClient.UploadHttpClient = UploadHttpClient;
var downloadHttpClient = {};
var __createBinding$2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  Object.defineProperty(o, k22, { enumerable: true, get: function() {
    return m[k2];
  } });
} : function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  o[k22] = m[k2];
});
var __setModuleDefault$2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k2 in mod)
      if (k2 !== "default" && Object.hasOwnProperty.call(mod, k2))
        __createBinding$2(result, mod, k2);
  }
  __setModuleDefault$2(result, mod);
  return result;
};
var __awaiter$1 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
Object.defineProperty(downloadHttpClient, "__esModule", { value: true });
downloadHttpClient.DownloadHttpClient = void 0;
const fs = __importStar$2(require$$0);
const core$1 = __importStar$2(requireCore());
const zlib = __importStar$2(require$$1$2);
const utils_1$1 = utils;
const url_1 = require$$7;
const status_reporter_1 = statusReporter;
const perf_hooks_1 = require$$8;
const http_manager_1 = httpManager;
const config_variables_1$1 = configVariables;
const requestUtils_1 = requestUtils;
class DownloadHttpClient {
  constructor() {
    this.downloadHttpManager = new http_manager_1.HttpManager(config_variables_1$1.getDownloadFileConcurrency(), "@actions/artifact-download");
    this.statusReporter = new status_reporter_1.StatusReporter(1e3);
  }
  /**
   * Gets a list of all artifacts that are in a specific container
   */
  listArtifacts() {
    return __awaiter$1(this, void 0, void 0, function* () {
      const artifactUrl = utils_1$1.getArtifactUrl();
      const client = this.downloadHttpManager.getClient(0);
      const headers = utils_1$1.getDownloadHeaders("application/json");
      const response = yield requestUtils_1.retryHttpClientRequest("List Artifacts", () => __awaiter$1(this, void 0, void 0, function* () {
        return client.get(artifactUrl, headers);
      }));
      const body = yield response.readBody();
      return JSON.parse(body);
    });
  }
  /**
   * Fetches a set of container items that describe the contents of an artifact
   * @param artifactName the name of the artifact
   * @param containerUrl the artifact container URL for the run
   */
  getContainerItems(artifactName, containerUrl) {
    return __awaiter$1(this, void 0, void 0, function* () {
      const resourceUrl = new url_1.URL(containerUrl);
      resourceUrl.searchParams.append("itemPath", artifactName);
      const client = this.downloadHttpManager.getClient(0);
      const headers = utils_1$1.getDownloadHeaders("application/json");
      const response = yield requestUtils_1.retryHttpClientRequest("Get Container Items", () => __awaiter$1(this, void 0, void 0, function* () {
        return client.get(resourceUrl.toString(), headers);
      }));
      const body = yield response.readBody();
      return JSON.parse(body);
    });
  }
  /**
   * Concurrently downloads all the files that are part of an artifact
   * @param downloadItems information about what items to download and where to save them
   */
  downloadSingleArtifact(downloadItems) {
    return __awaiter$1(this, void 0, void 0, function* () {
      const DOWNLOAD_CONCURRENCY = config_variables_1$1.getDownloadFileConcurrency();
      core$1.debug(`Download file concurrency is set to ${DOWNLOAD_CONCURRENCY}`);
      const parallelDownloads = [...new Array(DOWNLOAD_CONCURRENCY).keys()];
      let currentFile = 0;
      let downloadedFiles = 0;
      core$1.info(`Total number of files that will be downloaded: ${downloadItems.length}`);
      this.statusReporter.setTotalNumberOfFilesToProcess(downloadItems.length);
      this.statusReporter.start();
      yield Promise.all(parallelDownloads.map((index) => __awaiter$1(this, void 0, void 0, function* () {
        while (currentFile < downloadItems.length) {
          const currentFileToDownload = downloadItems[currentFile];
          currentFile += 1;
          const startTime = perf_hooks_1.performance.now();
          yield this.downloadIndividualFile(index, currentFileToDownload.sourceLocation, currentFileToDownload.targetPath);
          if (core$1.isDebug()) {
            core$1.debug(`File: ${++downloadedFiles}/${downloadItems.length}. ${currentFileToDownload.targetPath} took ${(perf_hooks_1.performance.now() - startTime).toFixed(3)} milliseconds to finish downloading`);
          }
          this.statusReporter.incrementProcessedCount();
        }
      }))).catch((error) => {
        throw new Error(`Unable to download the artifact: ${error}`);
      }).finally(() => {
        this.statusReporter.stop();
        this.downloadHttpManager.disposeAndReplaceAllClients();
      });
    });
  }
  /**
   * Downloads an individual file
   * @param httpClientIndex the index of the http client that is used to make all of the calls
   * @param artifactLocation origin location where a file will be downloaded from
   * @param downloadPath destination location for the file being downloaded
   */
  downloadIndividualFile(httpClientIndex, artifactLocation, downloadPath) {
    return __awaiter$1(this, void 0, void 0, function* () {
      let retryCount = 0;
      const retryLimit = config_variables_1$1.getRetryLimit();
      let destinationStream = fs.createWriteStream(downloadPath);
      const headers = utils_1$1.getDownloadHeaders("application/json", true, true);
      const makeDownloadRequest = () => __awaiter$1(this, void 0, void 0, function* () {
        const client = this.downloadHttpManager.getClient(httpClientIndex);
        return yield client.get(artifactLocation, headers);
      });
      const isGzip = (incomingHeaders) => {
        return "content-encoding" in incomingHeaders && incomingHeaders["content-encoding"] === "gzip";
      };
      const backOff = (retryAfterValue) => __awaiter$1(this, void 0, void 0, function* () {
        retryCount++;
        if (retryCount > retryLimit) {
          return Promise.reject(new Error(`Retry limit has been reached. Unable to download ${artifactLocation}`));
        } else {
          this.downloadHttpManager.disposeAndReplaceClient(httpClientIndex);
          if (retryAfterValue) {
            core$1.info(`Backoff due to too many requests, retry #${retryCount}. Waiting for ${retryAfterValue} milliseconds before continuing the download`);
            yield utils_1$1.sleep(retryAfterValue);
          } else {
            const backoffTime = utils_1$1.getExponentialRetryTimeInMilliseconds(retryCount);
            core$1.info(`Exponential backoff for retry #${retryCount}. Waiting for ${backoffTime} milliseconds before continuing the download`);
            yield utils_1$1.sleep(backoffTime);
          }
          core$1.info(`Finished backoff for retry #${retryCount}, continuing with download`);
        }
      });
      const isAllBytesReceived = (expected, received) => {
        if (!expected || !received || process.env["ACTIONS_ARTIFACT_SKIP_DOWNLOAD_VALIDATION"]) {
          core$1.info("Skipping download validation.");
          return true;
        }
        return parseInt(expected) === received;
      };
      const resetDestinationStream = (fileDownloadPath) => __awaiter$1(this, void 0, void 0, function* () {
        destinationStream.close();
        yield new Promise((resolve) => {
          destinationStream.on("close", resolve);
          if (destinationStream.writableFinished) {
            resolve();
          }
        });
        yield utils_1$1.rmFile(fileDownloadPath);
        destinationStream = fs.createWriteStream(fileDownloadPath);
      });
      while (retryCount <= retryLimit) {
        let response;
        try {
          response = yield makeDownloadRequest();
        } catch (error) {
          core$1.info("An error occurred while attempting to download a file");
          console.log(error);
          yield backOff();
          continue;
        }
        let forceRetry = false;
        if (utils_1$1.isSuccessStatusCode(response.message.statusCode)) {
          try {
            const isGzipped = isGzip(response.message.headers);
            yield this.pipeResponseToFile(response, destinationStream, isGzipped);
            if (isGzipped || isAllBytesReceived(response.message.headers["content-length"], yield utils_1$1.getFileSize(downloadPath))) {
              return;
            } else {
              forceRetry = true;
            }
          } catch (error) {
            forceRetry = true;
          }
        }
        if (forceRetry || utils_1$1.isRetryableStatusCode(response.message.statusCode)) {
          core$1.info(`A ${response.message.statusCode} response code has been received while attempting to download an artifact`);
          resetDestinationStream(downloadPath);
          utils_1$1.isThrottledStatusCode(response.message.statusCode) ? yield backOff(utils_1$1.tryGetRetryAfterValueTimeInMilliseconds(response.message.headers)) : yield backOff();
        } else {
          utils_1$1.displayHttpDiagnostics(response);
          return Promise.reject(new Error(`Unexpected http ${response.message.statusCode} during download for ${artifactLocation}`));
        }
      }
    });
  }
  /**
   * Pipes the response from downloading an individual file to the appropriate destination stream while decoding gzip content if necessary
   * @param response the http response received when downloading a file
   * @param destinationStream the stream where the file should be written to
   * @param isGzip a boolean denoting if the content is compressed using gzip and if we need to decode it
   */
  pipeResponseToFile(response, destinationStream, isGzip) {
    return __awaiter$1(this, void 0, void 0, function* () {
      yield new Promise((resolve, reject) => {
        if (isGzip) {
          const gunzip = zlib.createGunzip();
          response.message.on("error", (error) => {
            core$1.error(`An error occurred while attempting to read the response stream`);
            gunzip.close();
            destinationStream.close();
            reject(error);
          }).pipe(gunzip).on("error", (error) => {
            core$1.error(`An error occurred while attempting to decompress the response stream`);
            destinationStream.close();
            reject(error);
          }).pipe(destinationStream).on("close", () => {
            resolve();
          }).on("error", (error) => {
            core$1.error(`An error occurred while writing a downloaded file to ${destinationStream.path}`);
            reject(error);
          });
        } else {
          response.message.on("error", (error) => {
            core$1.error(`An error occurred while attempting to read the response stream`);
            destinationStream.close();
            reject(error);
          }).pipe(destinationStream).on("close", () => {
            resolve();
          }).on("error", (error) => {
            core$1.error(`An error occurred while writing a downloaded file to ${destinationStream.path}`);
            reject(error);
          });
        }
      });
      return;
    });
  }
}
downloadHttpClient.DownloadHttpClient = DownloadHttpClient;
var downloadSpecification = {};
var __createBinding$1 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  Object.defineProperty(o, k22, { enumerable: true, get: function() {
    return m[k2];
  } });
} : function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  o[k22] = m[k2];
});
var __setModuleDefault$1 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$1 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k2 in mod)
      if (k2 !== "default" && Object.hasOwnProperty.call(mod, k2))
        __createBinding$1(result, mod, k2);
  }
  __setModuleDefault$1(result, mod);
  return result;
};
Object.defineProperty(downloadSpecification, "__esModule", { value: true });
downloadSpecification.getDownloadSpecification = void 0;
const path = __importStar$1(require$$4$2);
function getDownloadSpecification(artifactName, artifactEntries, downloadPath, includeRootDirectory) {
  const directories = /* @__PURE__ */ new Set();
  const specifications = {
    rootDownloadLocation: includeRootDirectory ? path.join(downloadPath, artifactName) : downloadPath,
    directoryStructure: [],
    emptyFilesToCreate: [],
    filesToDownload: []
  };
  for (const entry of artifactEntries) {
    if (entry.path.startsWith(`${artifactName}/`) || entry.path.startsWith(`${artifactName}\\`)) {
      const normalizedPathEntry = path.normalize(entry.path);
      const filePath = path.join(downloadPath, includeRootDirectory ? normalizedPathEntry : normalizedPathEntry.replace(artifactName, ""));
      if (entry.itemType === "file") {
        directories.add(path.dirname(filePath));
        if (entry.fileLength === 0) {
          specifications.emptyFilesToCreate.push(filePath);
        } else {
          specifications.filesToDownload.push({
            sourceLocation: entry.contentLocation,
            targetPath: filePath
          });
        }
      }
    }
  }
  specifications.directoryStructure = Array.from(directories);
  return specifications;
}
downloadSpecification.getDownloadSpecification = getDownloadSpecification;
var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  Object.defineProperty(o, k22, { enumerable: true, get: function() {
    return m[k2];
  } });
} : function(o, m, k2, k22) {
  if (k22 === void 0)
    k22 = k2;
  o[k22] = m[k2];
});
var __setModuleDefault = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k2 in mod)
      if (k2 !== "default" && Object.hasOwnProperty.call(mod, k2))
        __createBinding(result, mod, k2);
  }
  __setModuleDefault(result, mod);
  return result;
};
var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
Object.defineProperty(artifactClient, "__esModule", { value: true });
artifactClient.DefaultArtifactClient = void 0;
const core = __importStar(requireCore());
const upload_specification_1 = uploadSpecification;
const upload_http_client_1 = uploadHttpClient;
const utils_1 = utils;
const path_and_artifact_name_validation_1 = pathAndArtifactNameValidation;
const download_http_client_1 = downloadHttpClient;
const download_specification_1 = downloadSpecification;
const config_variables_1 = configVariables;
const path_1 = require$$4$2;
class DefaultArtifactClient {
  /**
   * Constructs a DefaultArtifactClient
   */
  static create() {
    return new DefaultArtifactClient();
  }
  /**
   * Uploads an artifact
   */
  uploadArtifact(name, files, rootDirectory, options) {
    return __awaiter(this, void 0, void 0, function* () {
      core.info(`Starting artifact upload
For more detailed logs during the artifact upload process, enable step-debugging: https://docs.github.com/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging#enabling-step-debug-logging`);
      path_and_artifact_name_validation_1.checkArtifactName(name);
      const uploadSpecification2 = upload_specification_1.getUploadSpecification(name, rootDirectory, files);
      const uploadResponse = {
        artifactName: name,
        artifactItems: [],
        size: 0,
        failedItems: []
      };
      const uploadHttpClient2 = new upload_http_client_1.UploadHttpClient();
      if (uploadSpecification2.length === 0) {
        core.warning(`No files found that can be uploaded`);
      } else {
        const response = yield uploadHttpClient2.createArtifactInFileContainer(name, options);
        if (!response.fileContainerResourceUrl) {
          core.debug(response.toString());
          throw new Error("No URL provided by the Artifact Service to upload an artifact to");
        }
        core.debug(`Upload Resource URL: ${response.fileContainerResourceUrl}`);
        core.info(`Container for artifact "${name}" successfully created. Starting upload of file(s)`);
        const uploadResult = yield uploadHttpClient2.uploadArtifactToFileContainer(response.fileContainerResourceUrl, uploadSpecification2, options);
        core.info(`File upload process has finished. Finalizing the artifact upload`);
        yield uploadHttpClient2.patchArtifactSize(uploadResult.totalSize, name);
        if (uploadResult.failedItems.length > 0) {
          core.info(`Upload finished. There were ${uploadResult.failedItems.length} items that failed to upload`);
        } else {
          core.info(`Artifact has been finalized. All files have been successfully uploaded!`);
        }
        core.info(`
The raw size of all the files that were specified for upload is ${uploadResult.totalSize} bytes
The size of all the files that were uploaded is ${uploadResult.uploadSize} bytes. This takes into account any gzip compression used to reduce the upload size, time and storage

Note: The size of downloaded zips can differ significantly from the reported size. For more information see: https://github.com/actions/upload-artifact#zipped-artifact-downloads \r
`);
        uploadResponse.artifactItems = uploadSpecification2.map((item) => item.absoluteFilePath);
        uploadResponse.size = uploadResult.uploadSize;
        uploadResponse.failedItems = uploadResult.failedItems;
      }
      return uploadResponse;
    });
  }
  downloadArtifact(name, path2, options) {
    return __awaiter(this, void 0, void 0, function* () {
      const downloadHttpClient2 = new download_http_client_1.DownloadHttpClient();
      const artifacts = yield downloadHttpClient2.listArtifacts();
      if (artifacts.count === 0) {
        throw new Error(`Unable to find any artifacts for the associated workflow`);
      }
      const artifactToDownload = artifacts.value.find((artifact) => {
        return artifact.name === name;
      });
      if (!artifactToDownload) {
        throw new Error(`Unable to find an artifact with the name: ${name}`);
      }
      const items = yield downloadHttpClient2.getContainerItems(artifactToDownload.name, artifactToDownload.fileContainerResourceUrl);
      if (!path2) {
        path2 = config_variables_1.getWorkSpaceDirectory();
      }
      path2 = path_1.normalize(path2);
      path2 = path_1.resolve(path2);
      const downloadSpecification2 = download_specification_1.getDownloadSpecification(name, items.value, path2, (options === null || options === void 0 ? void 0 : options.createArtifactFolder) || false);
      if (downloadSpecification2.filesToDownload.length === 0) {
        core.info(`No downloadable files were found for the artifact: ${artifactToDownload.name}`);
      } else {
        yield utils_1.createDirectoriesForArtifact(downloadSpecification2.directoryStructure);
        core.info("Directory structure has been setup for the artifact");
        yield utils_1.createEmptyFilesForArtifact(downloadSpecification2.emptyFilesToCreate);
        yield downloadHttpClient2.downloadSingleArtifact(downloadSpecification2.filesToDownload);
      }
      return {
        artifactName: name,
        downloadPath: downloadSpecification2.rootDownloadLocation
      };
    });
  }
  downloadAllArtifacts(path2) {
    return __awaiter(this, void 0, void 0, function* () {
      const downloadHttpClient2 = new download_http_client_1.DownloadHttpClient();
      const response = [];
      const artifacts = yield downloadHttpClient2.listArtifacts();
      if (artifacts.count === 0) {
        core.info("Unable to find any artifacts for the associated workflow");
        return response;
      }
      if (!path2) {
        path2 = config_variables_1.getWorkSpaceDirectory();
      }
      path2 = path_1.normalize(path2);
      path2 = path_1.resolve(path2);
      let downloadedArtifacts = 0;
      while (downloadedArtifacts < artifacts.count) {
        const currentArtifactToDownload = artifacts.value[downloadedArtifacts];
        downloadedArtifacts += 1;
        core.info(`starting download of artifact ${currentArtifactToDownload.name} : ${downloadedArtifacts}/${artifacts.count}`);
        const items = yield downloadHttpClient2.getContainerItems(currentArtifactToDownload.name, currentArtifactToDownload.fileContainerResourceUrl);
        const downloadSpecification2 = download_specification_1.getDownloadSpecification(currentArtifactToDownload.name, items.value, path2, true);
        if (downloadSpecification2.filesToDownload.length === 0) {
          core.info(`No downloadable files were found for any artifact ${currentArtifactToDownload.name}`);
        } else {
          yield utils_1.createDirectoriesForArtifact(downloadSpecification2.directoryStructure);
          yield utils_1.createEmptyFilesForArtifact(downloadSpecification2.emptyFilesToCreate);
          yield downloadHttpClient2.downloadSingleArtifact(downloadSpecification2.filesToDownload);
        }
        response.push({
          artifactName: currentArtifactToDownload.name,
          downloadPath: downloadSpecification2.rootDownloadLocation
        });
      }
      return response;
    });
  }
}
artifactClient.DefaultArtifactClient = DefaultArtifactClient;
Object.defineProperty(artifactClient$1, "__esModule", { value: true });
var create_1 = artifactClient$1.create = void 0;
const artifact_client_1 = artifactClient;
function create() {
  return artifact_client_1.DefaultArtifactClient.create();
}
create_1 = artifactClient$1.create = create;
async function run() {
  const {
    hf_token,
    user_name,
    space_name,
    space_type,
    is_artifact,
    path: path2,
    comment,
    gh_token
  } = handle_inputs();
  const cwd = process.env.GITHUB_WORKSPACE;
  let _path = require$$4$2.join(cwd, path2);
  if (is_artifact) {
    const artifact_client = create_1();
    await artifact_client.downloadArtifact(path2, path2);
  }
  const files = await recursive_read_dir(_path);
  const file_data = await Promise.all(
    files.map(read_files(_path))
  );
  const repo = {
    name: `${user_name}/${space_name}`,
    type: "space"
  };
  const credentials = {
    accessToken: hf_token
  };
  const x = k.cyan(user_name);
  const y = k.cyan(space_name);
  const formatted_repo = x + k.dim("/") + y;
  try {
    coreExports.info(`Trying to create ${formatted_repo}.`);
    await hub.createRepo({ repo, credentials });
  } catch (e) {
    if (e.statusCode === 409) {
      coreExports.info(`${formatted_repo} already exists. Skipping.`);
    } else {
      coreExports.setFailed(`Could not create ${formatted_repo}.
${e.data.message}`);
    }
  }
  const readme = make_readme({ title: space_name, sdk: space_type });
  file_data.push(["README.md", Buffer.from(readme)]);
  coreExports.info(
    `Committing ${file_data.length} file${file_data.length === 1 ? "" : "s"} to ${formatted_repo}.`
  );
  try {
    await hub.commit({
      repo,
      credentials,
      title: "Upload space from github action",
      //@ts-ignore
      operations: file_data.map(([filename, data]) => ({
        operation: "addOrUpdate",
        path: filename,
        content: new node_buffer.Blob([data], {})
      }))
    });
  } catch (e) {
    console.log(e);
    coreExports.setFailed(`Commit failed.
${e.message}`);
  }
  try {
    create_comment(gh_token, comment, repo.name);
  } catch (e) {
  }
  coreExports.info("Space successfully updated.");
}
function read_files(path2) {
  return function(file) {
    return new Promise((res, rej) => {
      promises.readFile(file).then((data) => res([file.replace(`${path2}/`, ""), data]));
    });
  };
}
function handle_inputs() {
  const _hf_token = coreExports.getInput("hf_token", {
    required: true,
    trimWhitespace: true
  });
  let hf_token;
  if (_hf_token.startsWith("hf_")) {
    hf_token = _hf_token;
  } else {
    coreExports.setFailed("Not a valid Hugging face token. Must start with 'hf_'.");
    throw new Error();
  }
  const user_name = coreExports.getInput("user_name", {
    required: true,
    trimWhitespace: true
  });
  const space_name = coreExports.getInput("space_name", {
    required: true,
    trimWhitespace: true
  });
  const space_type = coreExports.getInput("space_type", { trimWhitespace: true });
  const path2 = coreExports.getInput("path", { required: true, trimWhitespace: true });
  const is_artifact = coreExports.getBooleanInput("is_artifact", {
    trimWhitespace: true
  });
  let _space_type;
  if (!["static", "gradio"].includes(space_type)) {
    coreExports.setFailed(
      `'${space_type}' is not a supported space type. Only 'gradio' and 'static' are supported.`
    );
    throw new Error();
  } else {
    _space_type = space_type;
  }
  const comment = coreExports.getBooleanInput("comment", { required: true });
  const gh_token = coreExports.getInput("gh_token") || "";
  return {
    hf_token,
    user_name,
    space_name,
    space_type: _space_type,
    is_artifact,
    path: path2,
    gh_token,
    comment
  };
}
run();
function make_readme({
  title,
  sdk,
  version: version2,
  app_file = "app.py"
}) {
  let content = `title: ${title} 
emoji: 💩
colorFrom: indigo
colorTo: indigo
sdk: ${sdk}
pinned: false
`;
  if (sdk === "gradio") {
    content += `app_file: ${app_file}`;
    if (version2) {
      content += `sdk_version: ${version2}`;
    }
  }
  return `---
${content}
---
`;
}
async function create_comment(gh_token, comment, repo) {
  var _a;
  if (!comment || comment && !gh_token) {
    return;
  }
  const pr_number = (_a = context.payload.pull_request) == null ? void 0 : _a.number;
  if (!pr_number)
    return;
  const comment_tag_pattern = `<!-- gradio-app/deploy-space -->`;
  const message = `Preview space has been deployed to https://huggingface.co/spaces/${repo}`;
  const body = `${message}
${comment_tag_pattern}`;
  const octokit = getOctokit_1(gh_token);
  let _comment;
  for await (const { data: comments } of octokit.paginate.iterator(
    octokit.rest.issues.listComments,
    {
      ...context.repo,
      issue_number: pr_number
    }
  )) {
    _comment = comments.find(
      (comment2) => {
        var _a2;
        return (_a2 = comment2 == null ? void 0 : comment2.body) == null ? void 0 : _a2.includes(comment_tag_pattern);
      }
    );
    if (comment)
      break;
  }
  if (_comment) {
    await octokit.rest.issues.updateComment({
      ...context.repo,
      comment_id: _comment.id,
      body
    });
  } else {
    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pr_number,
      body
    });
  }
}
