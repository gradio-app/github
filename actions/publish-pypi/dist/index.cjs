"use strict";
const require$$0 = require("os");
const require$$0$1 = require("fs");
const crypto = require("crypto");
const require$$0$3 = require("path");
const require$$2$1 = require("http");
const require$$3 = require("https");
require("net");
const require$$1$1 = require("tls");
const require$$4 = require("events");
const require$$5 = require("assert");
const require$$0$2 = require("util");
const require$$0$4 = require("string_decoder");
const require$$1$2 = require("child_process");
const require$$6 = require("timers");
const require$$0$5 = require("constants");
const require$$0$6 = require("stream");
const undici = require("undici");
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
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
var core$1 = {};
var command = {};
var utils$5 = {};
Object.defineProperty(utils$5, "__esModule", { value: true });
utils$5.toCommandProperties = utils$5.toCommandValue = void 0;
function toCommandValue(input) {
  if (input === null || input === void 0) {
    return "";
  } else if (typeof input === "string" || input instanceof String) {
    return input;
  }
  return JSON.stringify(input);
}
utils$5.toCommandValue = toCommandValue;
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
utils$5.toCommandProperties = toCommandProperties;
var __createBinding$4 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  Object.defineProperty(o, k2, { enumerable: true, get: function() {
    return m[k];
  } });
} : function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  o[k2] = m[k];
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
    for (var k in mod)
      if (k !== "default" && Object.hasOwnProperty.call(mod, k))
        __createBinding$4(result, mod, k);
  }
  __setModuleDefault$4(result, mod);
  return result;
};
Object.defineProperty(command, "__esModule", { value: true });
command.issue = command.issueCommand = void 0;
const os$3 = __importStar$4(require$$0);
const utils_1$1 = utils$5;
function issueCommand(command2, properties, message) {
  const cmd = new Command(command2, properties, message);
  process.stdout.write(cmd.toString() + os$3.EOL);
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
  return utils_1$1.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}
function escapeProperty(s) {
  return utils_1$1.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/:/g, "%3A").replace(/,/g, "%2C");
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
function stringify$3(arr, offset = 0) {
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
  return buf || stringify$3(b);
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
function stringToBytes(str2) {
  str2 = unescape(encodeURIComponent(str2));
  const bytes = [];
  for (let i = 0; i < str2.length; ++i) {
    bytes.push(str2.charCodeAt(i));
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
    return stringify$3(bytes);
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
  return stringify$3(rnds);
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
  stringify: stringify$3,
  v1,
  v3: v3$1,
  v4,
  v5: v5$1,
  validate,
  version
}, Symbol.toStringTag, { value: "Module" }));
const require$$2 = /* @__PURE__ */ getAugmentedNamespace(esmNode);
var __createBinding$3 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  Object.defineProperty(o, k2, { enumerable: true, get: function() {
    return m[k];
  } });
} : function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  o[k2] = m[k];
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
    for (var k in mod)
      if (k !== "default" && Object.hasOwnProperty.call(mod, k))
        __createBinding$3(result, mod, k);
  }
  __setModuleDefault$3(result, mod);
  return result;
};
Object.defineProperty(fileCommand, "__esModule", { value: true });
fileCommand.prepareKeyValueMessage = fileCommand.issueFileCommand = void 0;
const fs$r = __importStar$3(require$$0$1);
const os$2 = __importStar$3(require$$0);
const uuid_1 = require$$2;
const utils_1 = utils$5;
function issueFileCommand(command2, message) {
  const filePath = process.env[`GITHUB_${command2}`];
  if (!filePath) {
    throw new Error(`Unable to find environment variable for file command ${command2}`);
  }
  if (!fs$r.existsSync(filePath)) {
    throw new Error(`Missing file at path: ${filePath}`);
  }
  fs$r.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os$2.EOL}`, {
    encoding: "utf8"
  });
}
fileCommand.issueFileCommand = issueFileCommand;
function prepareKeyValueMessage(key, value) {
  const delimiter = `ghadelimiter_${uuid_1.v4()}`;
  const convertedValue = utils_1.toCommandValue(value);
  if (key.includes(delimiter)) {
    throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
  }
  if (convertedValue.includes(delimiter)) {
    throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
  }
  return `${key}<<${delimiter}${os$2.EOL}${convertedValue}${os$2.EOL}${delimiter}`;
}
fileCommand.prepareKeyValueMessage = prepareKeyValueMessage;
var oidcUtils = {};
var lib$1 = {};
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
var http = require$$2$1;
var https = require$$3;
var events$1 = require$$4;
var util$1 = require$$0$2;
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
util$1.inherits(TunnelingAgent, events$1.EventEmitter);
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
  debug$1("making CONNECT request");
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
      debug$1(
        "tunneling socket could not be established, statusCode=%d",
        res.statusCode
      );
      socket.destroy();
      var error2 = new Error("tunneling socket could not be established, statusCode=" + res.statusCode);
      error2.code = "ECONNRESET";
      options.request.emit("error", error2);
      self2.removeSocket(placeholder);
      return;
    }
    if (head.length > 0) {
      debug$1("got illegal response body from proxy");
      socket.destroy();
      var error2 = new Error("got illegal response body from proxy");
      error2.code = "ECONNRESET";
      options.request.emit("error", error2);
      self2.removeSocket(placeholder);
      return;
    }
    debug$1("tunneling connection has established");
    self2.sockets[self2.sockets.indexOf(placeholder)] = socket;
    return cb(socket);
  }
  function onError(cause) {
    connectReq.removeAllListeners();
    debug$1(
      "tunneling socket could not be established, cause=%s\n",
      cause.message,
      cause.stack
    );
    var error2 = new Error("tunneling socket could not be established, cause=" + cause.message);
    error2.code = "ECONNRESET";
    options.request.emit("error", error2);
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
        var k = keys[j];
        if (overrides[k] !== void 0) {
          target[k] = overrides[k];
        }
      }
    }
  }
  return target;
}
var debug$1;
if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
  debug$1 = function() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === "string") {
      args[0] = "TUNNEL: " + args[0];
    } else {
      args.unshift("TUNNEL:");
    }
    console.error.apply(console, args);
  };
} else {
  debug$1 = function() {
  };
}
tunnel$1.debug = debug$1;
var tunnel = tunnel$1;
(function(exports2) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() {
      return m[k];
    } });
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
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
      for (var k in mod)
        if (k !== "default" && Object.hasOwnProperty.call(mod, k))
          __createBinding2(result, mod, k);
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
  const http2 = __importStar2(require$$2$1);
  const https2 = __importStar2(require$$3);
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
          let output2 = Buffer.alloc(0);
          this.message.on("data", (chunk) => {
            output2 = Buffer.concat([output2, chunk]);
          });
          this.message.on("end", () => {
            resolve(output2.toString());
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
    constructor(userAgent, handlers, requestOptions) {
      this._ignoreSslError = false;
      this._allowRedirects = true;
      this._allowRedirectDowngrade = false;
      this._maxRedirects = 50;
      this._allowRetries = false;
      this._maxRetries = 1;
      this._keepAlive = false;
      this._disposed = false;
      this.userAgent = userAgent;
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
        return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers || {}));
      }
      return lowercaseKeys(headers || {});
    }
    _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
      let clientHeader;
      if (this.requestOptions && this.requestOptions.headers) {
        clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
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
  const lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => (c[k.toLowerCase()] = obj[k], c), {});
})(lib$1);
var auth = {};
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
Object.defineProperty(auth, "__esModule", { value: true });
auth.PersonalAccessTokenCredentialHandler = auth.BearerCredentialHandler = auth.BasicCredentialHandler = void 0;
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
    return __awaiter$3(this, void 0, void 0, function* () {
      throw new Error("not implemented");
    });
  }
}
auth.BasicCredentialHandler = BasicCredentialHandler;
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
    return __awaiter$3(this, void 0, void 0, function* () {
      throw new Error("not implemented");
    });
  }
}
auth.BearerCredentialHandler = BearerCredentialHandler;
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
    return __awaiter$3(this, void 0, void 0, function* () {
      throw new Error("not implemented");
    });
  }
}
auth.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;
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
  const http_client_1 = lib$1;
  const auth_1 = auth;
  const core_1 = requireCore$1();
  class OidcClient {
    static createHttpClient(allowRetry = true, maxRetry = 10) {
      const requestOptions = {
        allowRetries: allowRetry,
        maxRetries: maxRetry
      };
      return new http_client_1.HttpClient("actions/oidc-client", [new auth_1.BearerCredentialHandler(OidcClient.getRequestToken())], requestOptions);
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
        const res = yield httpclient.getJson(id_token_url).catch((error2) => {
          throw new Error(`Failed to get ID Token. 
 
        Error Code : ${error2.statusCode}
 
        Error Message: ${error2.result.message}`);
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
          core_1.debug(`ID token url is ${id_token_url}`);
          const id_token = yield OidcClient.getCall(id_token_url);
          core_1.setSecret(id_token);
          return id_token;
        } catch (error2) {
          throw new Error(`Error message: ${error2.message}`);
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
    const os_1 = require$$0;
    const fs_1 = require$$0$1;
    const { access, appendFile, writeFile: writeFile2 } = fs_1.promises;
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
            yield access(pathFromEnv, fs_1.constants.R_OK | fs_1.constants.W_OK);
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
          const writeFunc = overwrite ? writeFile2 : appendFile;
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
        return this.addRaw(os_1.EOL);
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
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() {
      return m[k];
    } });
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
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
      for (var k in mod)
        if (k !== "default" && Object.hasOwnProperty.call(mod, k))
          __createBinding2(result, mod, k);
    }
    __setModuleDefault2(result, mod);
    return result;
  };
  Object.defineProperty(pathUtils, "__esModule", { value: true });
  pathUtils.toPlatformPath = pathUtils.toWin32Path = pathUtils.toPosixPath = void 0;
  const path2 = __importStar2(require$$0$3);
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
var hasRequiredCore$1;
function requireCore$1() {
  if (hasRequiredCore$1)
    return core$1;
  hasRequiredCore$1 = 1;
  (function(exports2) {
    var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
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
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
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
    const utils_12 = utils$5;
    const os2 = __importStar2(require$$0);
    const path2 = __importStar2(require$$0$3);
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
      error2(message);
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
    function error2(message, properties = {}) {
      command_1.issueCommand("error", utils_12.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    exports2.error = error2;
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
  })(core$1);
  return core$1;
}
var coreExports = requireCore$1();
var exec$2 = {};
var toolrunner = {};
var io$1 = {};
var ioUtil$2 = {};
(function(exports2) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() {
      return m[k];
    } });
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
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
      for (var k in mod)
        if (k !== "default" && Object.hasOwnProperty.call(mod, k))
          __createBinding2(result, mod, k);
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
  var _a;
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.getCmdPath = exports2.tryGetExecutablePath = exports2.isRooted = exports2.isDirectory = exports2.exists = exports2.IS_WINDOWS = exports2.unlink = exports2.symlink = exports2.stat = exports2.rmdir = exports2.rename = exports2.readlink = exports2.readdir = exports2.mkdir = exports2.lstat = exports2.copyFile = exports2.chmod = void 0;
  const fs2 = __importStar2(require$$0$1);
  const path2 = __importStar2(require$$0$3);
  _a = fs2.promises, exports2.chmod = _a.chmod, exports2.copyFile = _a.copyFile, exports2.lstat = _a.lstat, exports2.mkdir = _a.mkdir, exports2.readdir = _a.readdir, exports2.readlink = _a.readlink, exports2.rename = _a.rename, exports2.rmdir = _a.rmdir, exports2.stat = _a.stat, exports2.symlink = _a.symlink, exports2.unlink = _a.unlink;
  exports2.IS_WINDOWS = process.platform === "win32";
  function exists(fsPath) {
    return __awaiter2(this, void 0, void 0, function* () {
      try {
        yield exports2.stat(fsPath);
      } catch (err) {
        if (err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return true;
    });
  }
  exports2.exists = exists;
  function isDirectory(fsPath, useStat = false) {
    return __awaiter2(this, void 0, void 0, function* () {
      const stats = useStat ? yield exports2.stat(fsPath) : yield exports2.lstat(fsPath);
      return stats.isDirectory();
    });
  }
  exports2.isDirectory = isDirectory;
  function isRooted(p) {
    p = normalizeSeparators(p);
    if (!p) {
      throw new Error('isRooted() parameter "p" cannot be empty');
    }
    if (exports2.IS_WINDOWS) {
      return p.startsWith("\\") || /^[A-Z]:/i.test(p);
    }
    return p.startsWith("/");
  }
  exports2.isRooted = isRooted;
  function tryGetExecutablePath(filePath, extensions) {
    return __awaiter2(this, void 0, void 0, function* () {
      let stats = void 0;
      try {
        stats = yield exports2.stat(filePath);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
        }
      }
      if (stats && stats.isFile()) {
        if (exports2.IS_WINDOWS) {
          const upperExt = path2.extname(filePath).toUpperCase();
          if (extensions.some((validExt) => validExt.toUpperCase() === upperExt)) {
            return filePath;
          }
        } else {
          if (isUnixExecutable(stats)) {
            return filePath;
          }
        }
      }
      const originalFilePath = filePath;
      for (const extension of extensions) {
        filePath = originalFilePath + extension;
        stats = void 0;
        try {
          stats = yield exports2.stat(filePath);
        } catch (err) {
          if (err.code !== "ENOENT") {
            console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
          }
        }
        if (stats && stats.isFile()) {
          if (exports2.IS_WINDOWS) {
            try {
              const directory = path2.dirname(filePath);
              const upperName = path2.basename(filePath).toUpperCase();
              for (const actualName of yield exports2.readdir(directory)) {
                if (upperName === actualName.toUpperCase()) {
                  filePath = path2.join(directory, actualName);
                  break;
                }
              }
            } catch (err) {
              console.log(`Unexpected error attempting to determine the actual case of the file '${filePath}': ${err}`);
            }
            return filePath;
          } else {
            if (isUnixExecutable(stats)) {
              return filePath;
            }
          }
        }
      }
      return "";
    });
  }
  exports2.tryGetExecutablePath = tryGetExecutablePath;
  function normalizeSeparators(p) {
    p = p || "";
    if (exports2.IS_WINDOWS) {
      p = p.replace(/\//g, "\\");
      return p.replace(/\\\\+/g, "\\");
    }
    return p.replace(/\/\/+/g, "/");
  }
  function isUnixExecutable(stats) {
    return (stats.mode & 1) > 0 || (stats.mode & 8) > 0 && stats.gid === process.getgid() || (stats.mode & 64) > 0 && stats.uid === process.getuid();
  }
  function getCmdPath() {
    var _a2;
    return (_a2 = process.env["COMSPEC"]) !== null && _a2 !== void 0 ? _a2 : `cmd.exe`;
  }
  exports2.getCmdPath = getCmdPath;
})(ioUtil$2);
var __createBinding$2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  Object.defineProperty(o, k2, { enumerable: true, get: function() {
    return m[k];
  } });
} : function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  o[k2] = m[k];
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
    for (var k in mod)
      if (k !== "default" && Object.hasOwnProperty.call(mod, k))
        __createBinding$2(result, mod, k);
  }
  __setModuleDefault$2(result, mod);
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
Object.defineProperty(io$1, "__esModule", { value: true });
io$1.findInPath = io$1.which = io$1.mkdirP = io$1.rmRF = io$1.mv = io$1.cp = void 0;
const assert_1 = require$$5;
const childProcess = __importStar$2(require$$1$2);
const path$l = __importStar$2(require$$0$3);
const util_1 = require$$0$2;
const ioUtil$1 = __importStar$2(ioUtil$2);
const exec$1 = util_1.promisify(childProcess.exec);
const execFile = util_1.promisify(childProcess.execFile);
function cp(source, dest, options = {}) {
  return __awaiter$2(this, void 0, void 0, function* () {
    const { force, recursive, copySourceDirectory } = readCopyOptions(options);
    const destStat = (yield ioUtil$1.exists(dest)) ? yield ioUtil$1.stat(dest) : null;
    if (destStat && destStat.isFile() && !force) {
      return;
    }
    const newDest = destStat && destStat.isDirectory() && copySourceDirectory ? path$l.join(dest, path$l.basename(source)) : dest;
    if (!(yield ioUtil$1.exists(source))) {
      throw new Error(`no such file or directory: ${source}`);
    }
    const sourceStat = yield ioUtil$1.stat(source);
    if (sourceStat.isDirectory()) {
      if (!recursive) {
        throw new Error(`Failed to copy. ${source} is a directory, but tried to copy without recursive flag.`);
      } else {
        yield cpDirRecursive(source, newDest, 0, force);
      }
    } else {
      if (path$l.relative(source, newDest) === "") {
        throw new Error(`'${newDest}' and '${source}' are the same file`);
      }
      yield copyFile$2(source, newDest, force);
    }
  });
}
io$1.cp = cp;
function mv(source, dest, options = {}) {
  return __awaiter$2(this, void 0, void 0, function* () {
    if (yield ioUtil$1.exists(dest)) {
      let destExists = true;
      if (yield ioUtil$1.isDirectory(dest)) {
        dest = path$l.join(dest, path$l.basename(source));
        destExists = yield ioUtil$1.exists(dest);
      }
      if (destExists) {
        if (options.force == null || options.force) {
          yield rmRF(dest);
        } else {
          throw new Error("Destination already exists");
        }
      }
    }
    yield mkdirP(path$l.dirname(dest));
    yield ioUtil$1.rename(source, dest);
  });
}
io$1.mv = mv;
function rmRF(inputPath) {
  return __awaiter$2(this, void 0, void 0, function* () {
    if (ioUtil$1.IS_WINDOWS) {
      if (/[*"<>|]/.test(inputPath)) {
        throw new Error('File path must not contain `*`, `"`, `<`, `>` or `|` on Windows');
      }
      try {
        const cmdPath = ioUtil$1.getCmdPath();
        if (yield ioUtil$1.isDirectory(inputPath, true)) {
          yield exec$1(`${cmdPath} /s /c "rd /s /q "%inputPath%""`, {
            env: { inputPath }
          });
        } else {
          yield exec$1(`${cmdPath} /s /c "del /f /a "%inputPath%""`, {
            env: { inputPath }
          });
        }
      } catch (err) {
        if (err.code !== "ENOENT")
          throw err;
      }
      try {
        yield ioUtil$1.unlink(inputPath);
      } catch (err) {
        if (err.code !== "ENOENT")
          throw err;
      }
    } else {
      let isDir = false;
      try {
        isDir = yield ioUtil$1.isDirectory(inputPath);
      } catch (err) {
        if (err.code !== "ENOENT")
          throw err;
        return;
      }
      if (isDir) {
        yield execFile(`rm`, [`-rf`, `${inputPath}`]);
      } else {
        yield ioUtil$1.unlink(inputPath);
      }
    }
  });
}
io$1.rmRF = rmRF;
function mkdirP(fsPath) {
  return __awaiter$2(this, void 0, void 0, function* () {
    assert_1.ok(fsPath, "a path argument must be provided");
    yield ioUtil$1.mkdir(fsPath, { recursive: true });
  });
}
io$1.mkdirP = mkdirP;
function which(tool, check) {
  return __awaiter$2(this, void 0, void 0, function* () {
    if (!tool) {
      throw new Error("parameter 'tool' is required");
    }
    if (check) {
      const result = yield which(tool, false);
      if (!result) {
        if (ioUtil$1.IS_WINDOWS) {
          throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also verify the file has a valid extension for an executable file.`);
        } else {
          throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also check the file mode to verify the file is executable.`);
        }
      }
      return result;
    }
    const matches = yield findInPath(tool);
    if (matches && matches.length > 0) {
      return matches[0];
    }
    return "";
  });
}
io$1.which = which;
function findInPath(tool) {
  return __awaiter$2(this, void 0, void 0, function* () {
    if (!tool) {
      throw new Error("parameter 'tool' is required");
    }
    const extensions = [];
    if (ioUtil$1.IS_WINDOWS && process.env["PATHEXT"]) {
      for (const extension of process.env["PATHEXT"].split(path$l.delimiter)) {
        if (extension) {
          extensions.push(extension);
        }
      }
    }
    if (ioUtil$1.isRooted(tool)) {
      const filePath = yield ioUtil$1.tryGetExecutablePath(tool, extensions);
      if (filePath) {
        return [filePath];
      }
      return [];
    }
    if (tool.includes(path$l.sep)) {
      return [];
    }
    const directories = [];
    if (process.env.PATH) {
      for (const p of process.env.PATH.split(path$l.delimiter)) {
        if (p) {
          directories.push(p);
        }
      }
    }
    const matches = [];
    for (const directory of directories) {
      const filePath = yield ioUtil$1.tryGetExecutablePath(path$l.join(directory, tool), extensions);
      if (filePath) {
        matches.push(filePath);
      }
    }
    return matches;
  });
}
io$1.findInPath = findInPath;
function readCopyOptions(options) {
  const force = options.force == null ? true : options.force;
  const recursive = Boolean(options.recursive);
  const copySourceDirectory = options.copySourceDirectory == null ? true : Boolean(options.copySourceDirectory);
  return { force, recursive, copySourceDirectory };
}
function cpDirRecursive(sourceDir, destDir, currentDepth, force) {
  return __awaiter$2(this, void 0, void 0, function* () {
    if (currentDepth >= 255)
      return;
    currentDepth++;
    yield mkdirP(destDir);
    const files2 = yield ioUtil$1.readdir(sourceDir);
    for (const fileName of files2) {
      const srcFile = `${sourceDir}/${fileName}`;
      const destFile = `${destDir}/${fileName}`;
      const srcFileStat = yield ioUtil$1.lstat(srcFile);
      if (srcFileStat.isDirectory()) {
        yield cpDirRecursive(srcFile, destFile, currentDepth, force);
      } else {
        yield copyFile$2(srcFile, destFile, force);
      }
    }
    yield ioUtil$1.chmod(destDir, (yield ioUtil$1.stat(sourceDir)).mode);
  });
}
function copyFile$2(srcFile, destFile, force) {
  return __awaiter$2(this, void 0, void 0, function* () {
    if ((yield ioUtil$1.lstat(srcFile)).isSymbolicLink()) {
      try {
        yield ioUtil$1.lstat(destFile);
        yield ioUtil$1.unlink(destFile);
      } catch (e) {
        if (e.code === "EPERM") {
          yield ioUtil$1.chmod(destFile, "0666");
          yield ioUtil$1.unlink(destFile);
        }
      }
      const symlinkFull = yield ioUtil$1.readlink(srcFile);
      yield ioUtil$1.symlink(symlinkFull, destFile, ioUtil$1.IS_WINDOWS ? "junction" : null);
    } else if (!(yield ioUtil$1.exists(destFile)) || force) {
      yield ioUtil$1.copyFile(srcFile, destFile);
    }
  });
}
var __createBinding$1 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  Object.defineProperty(o, k2, { enumerable: true, get: function() {
    return m[k];
  } });
} : function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  o[k2] = m[k];
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
    for (var k in mod)
      if (k !== "default" && Object.hasOwnProperty.call(mod, k))
        __createBinding$1(result, mod, k);
  }
  __setModuleDefault$1(result, mod);
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
Object.defineProperty(toolrunner, "__esModule", { value: true });
toolrunner.argStringToArray = toolrunner.ToolRunner = void 0;
const os$1 = __importStar$1(require$$0);
const events = __importStar$1(require$$4);
const child = __importStar$1(require$$1$2);
const path$k = __importStar$1(require$$0$3);
const io = __importStar$1(io$1);
const ioUtil = __importStar$1(ioUtil$2);
const timers_1 = require$$6;
const IS_WINDOWS = process.platform === "win32";
class ToolRunner extends events.EventEmitter {
  constructor(toolPath, args, options) {
    super();
    if (!toolPath) {
      throw new Error("Parameter 'toolPath' cannot be null or empty.");
    }
    this.toolPath = toolPath;
    this.args = args || [];
    this.options = options || {};
  }
  _debug(message) {
    if (this.options.listeners && this.options.listeners.debug) {
      this.options.listeners.debug(message);
    }
  }
  _getCommandString(options, noPrefix) {
    const toolPath = this._getSpawnFileName();
    const args = this._getSpawnArgs(options);
    let cmd = noPrefix ? "" : "[command]";
    if (IS_WINDOWS) {
      if (this._isCmdFile()) {
        cmd += toolPath;
        for (const a of args) {
          cmd += ` ${a}`;
        }
      } else if (options.windowsVerbatimArguments) {
        cmd += `"${toolPath}"`;
        for (const a of args) {
          cmd += ` ${a}`;
        }
      } else {
        cmd += this._windowsQuoteCmdArg(toolPath);
        for (const a of args) {
          cmd += ` ${this._windowsQuoteCmdArg(a)}`;
        }
      }
    } else {
      cmd += toolPath;
      for (const a of args) {
        cmd += ` ${a}`;
      }
    }
    return cmd;
  }
  _processLineBuffer(data, strBuffer, onLine) {
    try {
      let s = strBuffer + data.toString();
      let n = s.indexOf(os$1.EOL);
      while (n > -1) {
        const line = s.substring(0, n);
        onLine(line);
        s = s.substring(n + os$1.EOL.length);
        n = s.indexOf(os$1.EOL);
      }
      return s;
    } catch (err) {
      this._debug(`error processing line. Failed with error ${err}`);
      return "";
    }
  }
  _getSpawnFileName() {
    if (IS_WINDOWS) {
      if (this._isCmdFile()) {
        return process.env["COMSPEC"] || "cmd.exe";
      }
    }
    return this.toolPath;
  }
  _getSpawnArgs(options) {
    if (IS_WINDOWS) {
      if (this._isCmdFile()) {
        let argline = `/D /S /C "${this._windowsQuoteCmdArg(this.toolPath)}`;
        for (const a of this.args) {
          argline += " ";
          argline += options.windowsVerbatimArguments ? a : this._windowsQuoteCmdArg(a);
        }
        argline += '"';
        return [argline];
      }
    }
    return this.args;
  }
  _endsWith(str2, end) {
    return str2.endsWith(end);
  }
  _isCmdFile() {
    const upperToolPath = this.toolPath.toUpperCase();
    return this._endsWith(upperToolPath, ".CMD") || this._endsWith(upperToolPath, ".BAT");
  }
  _windowsQuoteCmdArg(arg) {
    if (!this._isCmdFile()) {
      return this._uvQuoteCmdArg(arg);
    }
    if (!arg) {
      return '""';
    }
    const cmdSpecialChars = [
      " ",
      "	",
      "&",
      "(",
      ")",
      "[",
      "]",
      "{",
      "}",
      "^",
      "=",
      ";",
      "!",
      "'",
      "+",
      ",",
      "`",
      "~",
      "|",
      "<",
      ">",
      '"'
    ];
    let needsQuotes = false;
    for (const char of arg) {
      if (cmdSpecialChars.some((x) => x === char)) {
        needsQuotes = true;
        break;
      }
    }
    if (!needsQuotes) {
      return arg;
    }
    let reverse = '"';
    let quoteHit = true;
    for (let i = arg.length; i > 0; i--) {
      reverse += arg[i - 1];
      if (quoteHit && arg[i - 1] === "\\") {
        reverse += "\\";
      } else if (arg[i - 1] === '"') {
        quoteHit = true;
        reverse += '"';
      } else {
        quoteHit = false;
      }
    }
    reverse += '"';
    return reverse.split("").reverse().join("");
  }
  _uvQuoteCmdArg(arg) {
    if (!arg) {
      return '""';
    }
    if (!arg.includes(" ") && !arg.includes("	") && !arg.includes('"')) {
      return arg;
    }
    if (!arg.includes('"') && !arg.includes("\\")) {
      return `"${arg}"`;
    }
    let reverse = '"';
    let quoteHit = true;
    for (let i = arg.length; i > 0; i--) {
      reverse += arg[i - 1];
      if (quoteHit && arg[i - 1] === "\\") {
        reverse += "\\";
      } else if (arg[i - 1] === '"') {
        quoteHit = true;
        reverse += "\\";
      } else {
        quoteHit = false;
      }
    }
    reverse += '"';
    return reverse.split("").reverse().join("");
  }
  _cloneExecOptions(options) {
    options = options || {};
    const result = {
      cwd: options.cwd || process.cwd(),
      env: options.env || process.env,
      silent: options.silent || false,
      windowsVerbatimArguments: options.windowsVerbatimArguments || false,
      failOnStdErr: options.failOnStdErr || false,
      ignoreReturnCode: options.ignoreReturnCode || false,
      delay: options.delay || 1e4
    };
    result.outStream = options.outStream || process.stdout;
    result.errStream = options.errStream || process.stderr;
    return result;
  }
  _getSpawnOptions(options, toolPath) {
    options = options || {};
    const result = {};
    result.cwd = options.cwd;
    result.env = options.env;
    result["windowsVerbatimArguments"] = options.windowsVerbatimArguments || this._isCmdFile();
    if (options.windowsVerbatimArguments) {
      result.argv0 = `"${toolPath}"`;
    }
    return result;
  }
  /**
   * Exec a tool.
   * Output will be streamed to the live console.
   * Returns promise with return code
   *
   * @param     tool     path to tool to exec
   * @param     options  optional exec options.  See ExecOptions
   * @returns   number
   */
  exec() {
    return __awaiter$1(this, void 0, void 0, function* () {
      if (!ioUtil.isRooted(this.toolPath) && (this.toolPath.includes("/") || IS_WINDOWS && this.toolPath.includes("\\"))) {
        this.toolPath = path$k.resolve(process.cwd(), this.options.cwd || process.cwd(), this.toolPath);
      }
      this.toolPath = yield io.which(this.toolPath, true);
      return new Promise((resolve, reject) => __awaiter$1(this, void 0, void 0, function* () {
        this._debug(`exec tool: ${this.toolPath}`);
        this._debug("arguments:");
        for (const arg of this.args) {
          this._debug(`   ${arg}`);
        }
        const optionsNonNull = this._cloneExecOptions(this.options);
        if (!optionsNonNull.silent && optionsNonNull.outStream) {
          optionsNonNull.outStream.write(this._getCommandString(optionsNonNull) + os$1.EOL);
        }
        const state = new ExecState(optionsNonNull, this.toolPath);
        state.on("debug", (message) => {
          this._debug(message);
        });
        if (this.options.cwd && !(yield ioUtil.exists(this.options.cwd))) {
          return reject(new Error(`The cwd: ${this.options.cwd} does not exist!`));
        }
        const fileName = this._getSpawnFileName();
        const cp2 = child.spawn(fileName, this._getSpawnArgs(optionsNonNull), this._getSpawnOptions(this.options, fileName));
        let stdbuffer = "";
        if (cp2.stdout) {
          cp2.stdout.on("data", (data) => {
            if (this.options.listeners && this.options.listeners.stdout) {
              this.options.listeners.stdout(data);
            }
            if (!optionsNonNull.silent && optionsNonNull.outStream) {
              optionsNonNull.outStream.write(data);
            }
            stdbuffer = this._processLineBuffer(data, stdbuffer, (line) => {
              if (this.options.listeners && this.options.listeners.stdline) {
                this.options.listeners.stdline(line);
              }
            });
          });
        }
        let errbuffer = "";
        if (cp2.stderr) {
          cp2.stderr.on("data", (data) => {
            state.processStderr = true;
            if (this.options.listeners && this.options.listeners.stderr) {
              this.options.listeners.stderr(data);
            }
            if (!optionsNonNull.silent && optionsNonNull.errStream && optionsNonNull.outStream) {
              const s = optionsNonNull.failOnStdErr ? optionsNonNull.errStream : optionsNonNull.outStream;
              s.write(data);
            }
            errbuffer = this._processLineBuffer(data, errbuffer, (line) => {
              if (this.options.listeners && this.options.listeners.errline) {
                this.options.listeners.errline(line);
              }
            });
          });
        }
        cp2.on("error", (err) => {
          state.processError = err.message;
          state.processExited = true;
          state.processClosed = true;
          state.CheckComplete();
        });
        cp2.on("exit", (code) => {
          state.processExitCode = code;
          state.processExited = true;
          this._debug(`Exit code ${code} received from tool '${this.toolPath}'`);
          state.CheckComplete();
        });
        cp2.on("close", (code) => {
          state.processExitCode = code;
          state.processExited = true;
          state.processClosed = true;
          this._debug(`STDIO streams have closed for tool '${this.toolPath}'`);
          state.CheckComplete();
        });
        state.on("done", (error2, exitCode) => {
          if (stdbuffer.length > 0) {
            this.emit("stdline", stdbuffer);
          }
          if (errbuffer.length > 0) {
            this.emit("errline", errbuffer);
          }
          cp2.removeAllListeners();
          if (error2) {
            reject(error2);
          } else {
            resolve(exitCode);
          }
        });
        if (this.options.input) {
          if (!cp2.stdin) {
            throw new Error("child process missing stdin");
          }
          cp2.stdin.end(this.options.input);
        }
      }));
    });
  }
}
toolrunner.ToolRunner = ToolRunner;
function argStringToArray(argString) {
  const args = [];
  let inQuotes = false;
  let escaped = false;
  let arg = "";
  function append(c) {
    if (escaped && c !== '"') {
      arg += "\\";
    }
    arg += c;
    escaped = false;
  }
  for (let i = 0; i < argString.length; i++) {
    const c = argString.charAt(i);
    if (c === '"') {
      if (!escaped) {
        inQuotes = !inQuotes;
      } else {
        append(c);
      }
      continue;
    }
    if (c === "\\" && escaped) {
      append(c);
      continue;
    }
    if (c === "\\" && inQuotes) {
      escaped = true;
      continue;
    }
    if (c === " " && !inQuotes) {
      if (arg.length > 0) {
        args.push(arg);
        arg = "";
      }
      continue;
    }
    append(c);
  }
  if (arg.length > 0) {
    args.push(arg.trim());
  }
  return args;
}
toolrunner.argStringToArray = argStringToArray;
class ExecState extends events.EventEmitter {
  constructor(options, toolPath) {
    super();
    this.processClosed = false;
    this.processError = "";
    this.processExitCode = 0;
    this.processExited = false;
    this.processStderr = false;
    this.delay = 1e4;
    this.done = false;
    this.timeout = null;
    if (!toolPath) {
      throw new Error("toolPath must not be empty");
    }
    this.options = options;
    this.toolPath = toolPath;
    if (options.delay) {
      this.delay = options.delay;
    }
  }
  CheckComplete() {
    if (this.done) {
      return;
    }
    if (this.processClosed) {
      this._setResult();
    } else if (this.processExited) {
      this.timeout = timers_1.setTimeout(ExecState.HandleTimeout, this.delay, this);
    }
  }
  _debug(message) {
    this.emit("debug", message);
  }
  _setResult() {
    let error2;
    if (this.processExited) {
      if (this.processError) {
        error2 = new Error(`There was an error when attempting to execute the process '${this.toolPath}'. This may indicate the process failed to start. Error: ${this.processError}`);
      } else if (this.processExitCode !== 0 && !this.options.ignoreReturnCode) {
        error2 = new Error(`The process '${this.toolPath}' failed with exit code ${this.processExitCode}`);
      } else if (this.processStderr && this.options.failOnStdErr) {
        error2 = new Error(`The process '${this.toolPath}' failed because one or more lines were written to the STDERR stream`);
      }
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.done = true;
    this.emit("done", error2, this.processExitCode);
  }
  static HandleTimeout(state) {
    if (state.done) {
      return;
    }
    if (!state.processClosed && state.processExited) {
      const message = `The STDIO streams did not close within ${state.delay / 1e3} seconds of the exit event from process '${state.toolPath}'. This may indicate a child process inherited the STDIO streams and has not yet exited.`;
      state._debug(message);
    }
    state._setResult();
  }
}
var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  Object.defineProperty(o, k2, { enumerable: true, get: function() {
    return m[k];
  } });
} : function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  o[k2] = m[k];
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
    for (var k in mod)
      if (k !== "default" && Object.hasOwnProperty.call(mod, k))
        __createBinding(result, mod, k);
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
Object.defineProperty(exec$2, "__esModule", { value: true });
exec$2.getExecOutput = exec_2 = exec$2.exec = void 0;
const string_decoder_1 = require$$0$4;
const tr = __importStar(toolrunner);
function exec(commandLine, args, options) {
  return __awaiter(this, void 0, void 0, function* () {
    const commandArgs = tr.argStringToArray(commandLine);
    if (commandArgs.length === 0) {
      throw new Error(`Parameter 'commandLine' cannot be null or empty.`);
    }
    const toolPath = commandArgs[0];
    args = commandArgs.slice(1).concat(args || []);
    const runner = new tr.ToolRunner(toolPath, args, options);
    return runner.exec();
  });
}
var exec_2 = exec$2.exec = exec;
function getExecOutput(commandLine, args, options) {
  var _a, _b;
  return __awaiter(this, void 0, void 0, function* () {
    let stdout = "";
    let stderr = "";
    const stdoutDecoder = new string_decoder_1.StringDecoder("utf8");
    const stderrDecoder = new string_decoder_1.StringDecoder("utf8");
    const originalStdoutListener = (_a = options === null || options === void 0 ? void 0 : options.listeners) === null || _a === void 0 ? void 0 : _a.stdout;
    const originalStdErrListener = (_b = options === null || options === void 0 ? void 0 : options.listeners) === null || _b === void 0 ? void 0 : _b.stderr;
    const stdErrListener = (data) => {
      stderr += stderrDecoder.write(data);
      if (originalStdErrListener) {
        originalStdErrListener(data);
      }
    };
    const stdOutListener = (data) => {
      stdout += stdoutDecoder.write(data);
      if (originalStdoutListener) {
        originalStdoutListener(data);
      }
    };
    const listeners = Object.assign(Object.assign({}, options === null || options === void 0 ? void 0 : options.listeners), { stdout: stdOutListener, stderr: stdErrListener });
    const exitCode = yield exec(commandLine, args, Object.assign(Object.assign({}, options), { listeners }));
    stdout += stdoutDecoder.end();
    stderr += stderrDecoder.end();
    return {
      exitCode,
      stdout,
      stderr
    };
  });
}
exec$2.getExecOutput = getExecOutput;
var manypkgGetPackages_cjs = { exports: {} };
var manypkgGetPackages_cjs_prod = {};
var findUp$1 = { exports: {} };
var locatePath = { exports: {} };
var pLocate$2 = { exports: {} };
var pLimit$2 = { exports: {} };
var pTry$2 = { exports: {} };
const pTry$1 = (fn, ...arguments_) => new Promise((resolve) => {
  resolve(fn(...arguments_));
});
pTry$2.exports = pTry$1;
pTry$2.exports.default = pTry$1;
var pTryExports = pTry$2.exports;
const pTry = pTryExports;
const pLimit$1 = (concurrency) => {
  if (!((Number.isInteger(concurrency) || concurrency === Infinity) && concurrency > 0)) {
    return Promise.reject(new TypeError("Expected `concurrency` to be a number from 1 and up"));
  }
  const queue2 = [];
  let activeCount = 0;
  const next = () => {
    activeCount--;
    if (queue2.length > 0) {
      queue2.shift()();
    }
  };
  const run2 = (fn, resolve, ...args) => {
    activeCount++;
    const result = pTry(fn, ...args);
    resolve(result);
    result.then(next, next);
  };
  const enqueue2 = (fn, resolve, ...args) => {
    if (activeCount < concurrency) {
      run2(fn, resolve, ...args);
    } else {
      queue2.push(run2.bind(null, fn, resolve, ...args));
    }
  };
  const generator = (fn, ...args) => new Promise((resolve) => enqueue2(fn, resolve, ...args));
  Object.defineProperties(generator, {
    activeCount: {
      get: () => activeCount
    },
    pendingCount: {
      get: () => queue2.length
    },
    clearQueue: {
      value: () => {
        queue2.length = 0;
      }
    }
  });
  return generator;
};
pLimit$2.exports = pLimit$1;
pLimit$2.exports.default = pLimit$1;
var pLimitExports = pLimit$2.exports;
const pLimit = pLimitExports;
class EndError extends Error {
  constructor(value) {
    super();
    this.value = value;
  }
}
const testElement = async (element, tester) => tester(await element);
const finder = async (element) => {
  const values = await Promise.all(element);
  if (values[1] === true) {
    throw new EndError(values[0]);
  }
  return false;
};
const pLocate$1 = async (iterable, tester, options) => {
  options = {
    concurrency: Infinity,
    preserveOrder: true,
    ...options
  };
  const limit = pLimit(options.concurrency);
  const items = [...iterable].map((element) => [element, limit(testElement, element, tester)]);
  const checkLimit = pLimit(options.preserveOrder ? 1 : Infinity);
  try {
    await Promise.all(items.map((element) => checkLimit(finder, element)));
  } catch (error2) {
    if (error2 instanceof EndError) {
      return error2.value;
    }
    throw error2;
  }
};
pLocate$2.exports = pLocate$1;
pLocate$2.exports.default = pLocate$1;
var pLocateExports = pLocate$2.exports;
const path$j = require$$0$3;
const fs$q = require$$0$1;
const { promisify: promisify$1 } = require$$0$2;
const pLocate = pLocateExports;
const fsStat = promisify$1(fs$q.stat);
const fsLStat = promisify$1(fs$q.lstat);
const typeMappings = {
  directory: "isDirectory",
  file: "isFile"
};
function checkType({ type: type2 }) {
  if (type2 in typeMappings) {
    return;
  }
  throw new Error(`Invalid type specified: ${type2}`);
}
const matchType = (type2, stat2) => type2 === void 0 || stat2[typeMappings[type2]]();
locatePath.exports = async (paths, options) => {
  options = {
    cwd: process.cwd(),
    type: "file",
    allowSymlinks: true,
    ...options
  };
  checkType(options);
  const statFn = options.allowSymlinks ? fsStat : fsLStat;
  return pLocate(paths, async (path_) => {
    try {
      const stat2 = await statFn(path$j.resolve(options.cwd, path_));
      return matchType(options.type, stat2);
    } catch (_) {
      return false;
    }
  }, options);
};
locatePath.exports.sync = (paths, options) => {
  options = {
    cwd: process.cwd(),
    allowSymlinks: true,
    type: "file",
    ...options
  };
  checkType(options);
  const statFn = options.allowSymlinks ? fs$q.statSync : fs$q.lstatSync;
  for (const path_ of paths) {
    try {
      const stat2 = statFn(path$j.resolve(options.cwd, path_));
      if (matchType(options.type, stat2)) {
        return path_;
      }
    } catch (_) {
    }
  }
};
var locatePathExports = locatePath.exports;
var pathExists$9 = { exports: {} };
const fs$p = require$$0$1;
const { promisify } = require$$0$2;
const pAccess = promisify(fs$p.access);
pathExists$9.exports = async (path2) => {
  try {
    await pAccess(path2);
    return true;
  } catch (_) {
    return false;
  }
};
pathExists$9.exports.sync = (path2) => {
  try {
    fs$p.accessSync(path2);
    return true;
  } catch (_) {
    return false;
  }
};
var pathExistsExports = pathExists$9.exports;
(function(module2) {
  const path2 = require$$0$3;
  const locatePath2 = locatePathExports;
  const pathExists2 = pathExistsExports;
  const stop = Symbol("findUp.stop");
  module2.exports = async (name, options = {}) => {
    let directory = path2.resolve(options.cwd || "");
    const { root } = path2.parse(directory);
    const paths = [].concat(name);
    const runMatcher = async (locateOptions) => {
      if (typeof name !== "function") {
        return locatePath2(paths, locateOptions);
      }
      const foundPath = await name(locateOptions.cwd);
      if (typeof foundPath === "string") {
        return locatePath2([foundPath], locateOptions);
      }
      return foundPath;
    };
    while (true) {
      const foundPath = await runMatcher({ ...options, cwd: directory });
      if (foundPath === stop) {
        return;
      }
      if (foundPath) {
        return path2.resolve(directory, foundPath);
      }
      if (directory === root) {
        return;
      }
      directory = path2.dirname(directory);
    }
  };
  module2.exports.sync = (name, options = {}) => {
    let directory = path2.resolve(options.cwd || "");
    const { root } = path2.parse(directory);
    const paths = [].concat(name);
    const runMatcher = (locateOptions) => {
      if (typeof name !== "function") {
        return locatePath2.sync(paths, locateOptions);
      }
      const foundPath = name(locateOptions.cwd);
      if (typeof foundPath === "string") {
        return locatePath2.sync([foundPath], locateOptions);
      }
      return foundPath;
    };
    while (true) {
      const foundPath = runMatcher({ ...options, cwd: directory });
      if (foundPath === stop) {
        return;
      }
      if (foundPath) {
        return path2.resolve(directory, foundPath);
      }
      if (directory === root) {
        return;
      }
      directory = path2.dirname(directory);
    }
  };
  module2.exports.exists = pathExists2;
  module2.exports.sync.exists = pathExists2.sync;
  module2.exports.stop = stop;
})(findUp$1);
var findUpExports = findUp$1.exports;
const findUp = /* @__PURE__ */ getDefaultExportFromCjs(findUpExports);
var lib = { exports: {} };
var fs$o = {};
var universalify = {};
universalify.fromCallback = function(fn) {
  return Object.defineProperty(function() {
    if (typeof arguments[arguments.length - 1] === "function")
      fn.apply(this, arguments);
    else {
      return new Promise((resolve, reject) => {
        arguments[arguments.length] = (err, res) => {
          if (err)
            return reject(err);
          resolve(res);
        };
        arguments.length++;
        fn.apply(this, arguments);
      });
    }
  }, "name", { value: fn.name });
};
universalify.fromPromise = function(fn) {
  return Object.defineProperty(function() {
    const cb = arguments[arguments.length - 1];
    if (typeof cb !== "function")
      return fn.apply(this, arguments);
    else
      fn.apply(this, arguments).then((r) => cb(null, r), cb);
  }, "name", { value: fn.name });
};
var constants$3 = require$$0$5;
var origCwd = process.cwd;
var cwd = null;
var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  if (!cwd)
    cwd = origCwd.call(process);
  return cwd;
};
try {
  process.cwd();
} catch (er) {
}
if (typeof process.chdir === "function") {
  var chdir = process.chdir;
  process.chdir = function(d) {
    cwd = null;
    chdir.call(process, d);
  };
  if (Object.setPrototypeOf)
    Object.setPrototypeOf(process.chdir, chdir);
}
var polyfills$1 = patch$1;
function patch$1(fs2) {
  if (constants$3.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs2);
  }
  if (!fs2.lutimes) {
    patchLutimes(fs2);
  }
  fs2.chown = chownFix(fs2.chown);
  fs2.fchown = chownFix(fs2.fchown);
  fs2.lchown = chownFix(fs2.lchown);
  fs2.chmod = chmodFix(fs2.chmod);
  fs2.fchmod = chmodFix(fs2.fchmod);
  fs2.lchmod = chmodFix(fs2.lchmod);
  fs2.chownSync = chownFixSync(fs2.chownSync);
  fs2.fchownSync = chownFixSync(fs2.fchownSync);
  fs2.lchownSync = chownFixSync(fs2.lchownSync);
  fs2.chmodSync = chmodFixSync(fs2.chmodSync);
  fs2.fchmodSync = chmodFixSync(fs2.fchmodSync);
  fs2.lchmodSync = chmodFixSync(fs2.lchmodSync);
  fs2.stat = statFix(fs2.stat);
  fs2.fstat = statFix(fs2.fstat);
  fs2.lstat = statFix(fs2.lstat);
  fs2.statSync = statFixSync(fs2.statSync);
  fs2.fstatSync = statFixSync(fs2.fstatSync);
  fs2.lstatSync = statFixSync(fs2.lstatSync);
  if (fs2.chmod && !fs2.lchmod) {
    fs2.lchmod = function(path2, mode, cb) {
      if (cb)
        process.nextTick(cb);
    };
    fs2.lchmodSync = function() {
    };
  }
  if (fs2.chown && !fs2.lchown) {
    fs2.lchown = function(path2, uid, gid, cb) {
      if (cb)
        process.nextTick(cb);
    };
    fs2.lchownSync = function() {
    };
  }
  if (platform === "win32") {
    fs2.rename = typeof fs2.rename !== "function" ? fs2.rename : function(fs$rename) {
      function rename2(from, to, cb) {
        var start = Date.now();
        var backoff = 0;
        fs$rename(from, to, function CB(er) {
          if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 6e4) {
            setTimeout(function() {
              fs2.stat(to, function(stater, st) {
                if (stater && stater.code === "ENOENT")
                  fs$rename(from, to, CB);
                else
                  cb(er);
              });
            }, backoff);
            if (backoff < 100)
              backoff += 10;
            return;
          }
          if (cb)
            cb(er);
        });
      }
      if (Object.setPrototypeOf)
        Object.setPrototypeOf(rename2, fs$rename);
      return rename2;
    }(fs2.rename);
  }
  fs2.read = typeof fs2.read !== "function" ? fs2.read : function(fs$read) {
    function read(fd, buffer2, offset, length, position, callback_) {
      var callback;
      if (callback_ && typeof callback_ === "function") {
        var eagCounter = 0;
        callback = function(er, _, __) {
          if (er && er.code === "EAGAIN" && eagCounter < 10) {
            eagCounter++;
            return fs$read.call(fs2, fd, buffer2, offset, length, position, callback);
          }
          callback_.apply(this, arguments);
        };
      }
      return fs$read.call(fs2, fd, buffer2, offset, length, position, callback);
    }
    if (Object.setPrototypeOf)
      Object.setPrototypeOf(read, fs$read);
    return read;
  }(fs2.read);
  fs2.readSync = typeof fs2.readSync !== "function" ? fs2.readSync : function(fs$readSync) {
    return function(fd, buffer2, offset, length, position) {
      var eagCounter = 0;
      while (true) {
        try {
          return fs$readSync.call(fs2, fd, buffer2, offset, length, position);
        } catch (er) {
          if (er.code === "EAGAIN" && eagCounter < 10) {
            eagCounter++;
            continue;
          }
          throw er;
        }
      }
    };
  }(fs2.readSync);
  function patchLchmod(fs3) {
    fs3.lchmod = function(path2, mode, callback) {
      fs3.open(
        path2,
        constants$3.O_WRONLY | constants$3.O_SYMLINK,
        mode,
        function(err, fd) {
          if (err) {
            if (callback)
              callback(err);
            return;
          }
          fs3.fchmod(fd, mode, function(err2) {
            fs3.close(fd, function(err22) {
              if (callback)
                callback(err2 || err22);
            });
          });
        }
      );
    };
    fs3.lchmodSync = function(path2, mode) {
      var fd = fs3.openSync(path2, constants$3.O_WRONLY | constants$3.O_SYMLINK, mode);
      var threw = true;
      var ret;
      try {
        ret = fs3.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs3.closeSync(fd);
          } catch (er) {
          }
        } else {
          fs3.closeSync(fd);
        }
      }
      return ret;
    };
  }
  function patchLutimes(fs3) {
    if (constants$3.hasOwnProperty("O_SYMLINK") && fs3.futimes) {
      fs3.lutimes = function(path2, at, mt, cb) {
        fs3.open(path2, constants$3.O_SYMLINK, function(er, fd) {
          if (er) {
            if (cb)
              cb(er);
            return;
          }
          fs3.futimes(fd, at, mt, function(er2) {
            fs3.close(fd, function(er22) {
              if (cb)
                cb(er2 || er22);
            });
          });
        });
      };
      fs3.lutimesSync = function(path2, at, mt) {
        var fd = fs3.openSync(path2, constants$3.O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs3.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs3.closeSync(fd);
            } catch (er) {
            }
          } else {
            fs3.closeSync(fd);
          }
        }
        return ret;
      };
    } else if (fs3.futimes) {
      fs3.lutimes = function(_a, _b, _c, cb) {
        if (cb)
          process.nextTick(cb);
      };
      fs3.lutimesSync = function() {
      };
    }
  }
  function chmodFix(orig) {
    if (!orig)
      return orig;
    return function(target, mode, cb) {
      return orig.call(fs2, target, mode, function(er) {
        if (chownErOk(er))
          er = null;
        if (cb)
          cb.apply(this, arguments);
      });
    };
  }
  function chmodFixSync(orig) {
    if (!orig)
      return orig;
    return function(target, mode) {
      try {
        return orig.call(fs2, target, mode);
      } catch (er) {
        if (!chownErOk(er))
          throw er;
      }
    };
  }
  function chownFix(orig) {
    if (!orig)
      return orig;
    return function(target, uid, gid, cb) {
      return orig.call(fs2, target, uid, gid, function(er) {
        if (chownErOk(er))
          er = null;
        if (cb)
          cb.apply(this, arguments);
      });
    };
  }
  function chownFixSync(orig) {
    if (!orig)
      return orig;
    return function(target, uid, gid) {
      try {
        return orig.call(fs2, target, uid, gid);
      } catch (er) {
        if (!chownErOk(er))
          throw er;
      }
    };
  }
  function statFix(orig) {
    if (!orig)
      return orig;
    return function(target, options, cb) {
      if (typeof options === "function") {
        cb = options;
        options = null;
      }
      function callback(er, stats) {
        if (stats) {
          if (stats.uid < 0)
            stats.uid += 4294967296;
          if (stats.gid < 0)
            stats.gid += 4294967296;
        }
        if (cb)
          cb.apply(this, arguments);
      }
      return options ? orig.call(fs2, target, options, callback) : orig.call(fs2, target, callback);
    };
  }
  function statFixSync(orig) {
    if (!orig)
      return orig;
    return function(target, options) {
      var stats = options ? orig.call(fs2, target, options) : orig.call(fs2, target);
      if (stats) {
        if (stats.uid < 0)
          stats.uid += 4294967296;
        if (stats.gid < 0)
          stats.gid += 4294967296;
      }
      return stats;
    };
  }
  function chownErOk(er) {
    if (!er)
      return true;
    if (er.code === "ENOSYS")
      return true;
    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true;
    }
    return false;
  }
}
var Stream = require$$0$6.Stream;
var legacyStreams = legacy$1;
function legacy$1(fs2) {
  return {
    ReadStream,
    WriteStream
  };
  function ReadStream(path2, options) {
    if (!(this instanceof ReadStream))
      return new ReadStream(path2, options);
    Stream.call(this);
    var self2 = this;
    this.path = path2;
    this.fd = null;
    this.readable = true;
    this.paused = false;
    this.flags = "r";
    this.mode = 438;
    this.bufferSize = 64 * 1024;
    options = options || {};
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }
    if (this.encoding)
      this.setEncoding(this.encoding);
    if (this.start !== void 0) {
      if ("number" !== typeof this.start) {
        throw TypeError("start must be a Number");
      }
      if (this.end === void 0) {
        this.end = Infinity;
      } else if ("number" !== typeof this.end) {
        throw TypeError("end must be a Number");
      }
      if (this.start > this.end) {
        throw new Error("start must be <= end");
      }
      this.pos = this.start;
    }
    if (this.fd !== null) {
      process.nextTick(function() {
        self2._read();
      });
      return;
    }
    fs2.open(this.path, this.flags, this.mode, function(err, fd) {
      if (err) {
        self2.emit("error", err);
        self2.readable = false;
        return;
      }
      self2.fd = fd;
      self2.emit("open", fd);
      self2._read();
    });
  }
  function WriteStream(path2, options) {
    if (!(this instanceof WriteStream))
      return new WriteStream(path2, options);
    Stream.call(this);
    this.path = path2;
    this.fd = null;
    this.writable = true;
    this.flags = "w";
    this.encoding = "binary";
    this.mode = 438;
    this.bytesWritten = 0;
    options = options || {};
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }
    if (this.start !== void 0) {
      if ("number" !== typeof this.start) {
        throw TypeError("start must be a Number");
      }
      if (this.start < 0) {
        throw new Error("start must be >= zero");
      }
      this.pos = this.start;
    }
    this.busy = false;
    this._queue = [];
    if (this.fd === null) {
      this._open = fs2.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, void 0]);
      this.flush();
    }
  }
}
var clone_1 = clone$1;
var getPrototypeOf = Object.getPrototypeOf || function(obj) {
  return obj.__proto__;
};
function clone$1(obj) {
  if (obj === null || typeof obj !== "object")
    return obj;
  if (obj instanceof Object)
    var copy2 = { __proto__: getPrototypeOf(obj) };
  else
    var copy2 = /* @__PURE__ */ Object.create(null);
  Object.getOwnPropertyNames(obj).forEach(function(key) {
    Object.defineProperty(copy2, key, Object.getOwnPropertyDescriptor(obj, key));
  });
  return copy2;
}
var fs$n = require$$0$1;
var polyfills = polyfills$1;
var legacy = legacyStreams;
var clone = clone_1;
var util = require$$0$2;
var gracefulQueue;
var previousSymbol;
if (typeof Symbol === "function" && typeof Symbol.for === "function") {
  gracefulQueue = Symbol.for("graceful-fs.queue");
  previousSymbol = Symbol.for("graceful-fs.previous");
} else {
  gracefulQueue = "___graceful-fs.queue";
  previousSymbol = "___graceful-fs.previous";
}
function noop() {
}
function publishQueue(context, queue2) {
  Object.defineProperty(context, gracefulQueue, {
    get: function() {
      return queue2;
    }
  });
}
var debug = noop;
if (util.debuglog)
  debug = util.debuglog("gfs4");
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
  debug = function() {
    var m = util.format.apply(util, arguments);
    m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
    console.error(m);
  };
if (!fs$n[gracefulQueue]) {
  var queue$1 = commonjsGlobal[gracefulQueue] || [];
  publishQueue(fs$n, queue$1);
  fs$n.close = function(fs$close) {
    function close(fd, cb) {
      return fs$close.call(fs$n, fd, function(err) {
        if (!err) {
          resetQueue();
        }
        if (typeof cb === "function")
          cb.apply(this, arguments);
      });
    }
    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    });
    return close;
  }(fs$n.close);
  fs$n.closeSync = function(fs$closeSync) {
    function closeSync(fd) {
      fs$closeSync.apply(fs$n, arguments);
      resetQueue();
    }
    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    });
    return closeSync;
  }(fs$n.closeSync);
  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
    process.on("exit", function() {
      debug(fs$n[gracefulQueue]);
      require$$5.equal(fs$n[gracefulQueue].length, 0);
    });
  }
}
if (!commonjsGlobal[gracefulQueue]) {
  publishQueue(commonjsGlobal, fs$n[gracefulQueue]);
}
var gracefulFs = patch(clone(fs$n));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs$n.__patched) {
  gracefulFs = patch(fs$n);
  fs$n.__patched = true;
}
function patch(fs2) {
  polyfills(fs2);
  fs2.gracefulify = patch;
  fs2.createReadStream = createReadStream;
  fs2.createWriteStream = createWriteStream;
  var fs$readFile = fs2.readFile;
  fs2.readFile = readFile2;
  function readFile2(path2, options, cb) {
    if (typeof options === "function")
      cb = options, options = null;
    return go$readFile(path2, options, cb);
    function go$readFile(path3, options2, cb2, startTime) {
      return fs$readFile(path3, options2, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$readFile, [path3, options2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$writeFile = fs2.writeFile;
  fs2.writeFile = writeFile2;
  function writeFile2(path2, data, options, cb) {
    if (typeof options === "function")
      cb = options, options = null;
    return go$writeFile(path2, data, options, cb);
    function go$writeFile(path3, data2, options2, cb2, startTime) {
      return fs$writeFile(path3, data2, options2, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$writeFile, [path3, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$appendFile = fs2.appendFile;
  if (fs$appendFile)
    fs2.appendFile = appendFile;
  function appendFile(path2, data, options, cb) {
    if (typeof options === "function")
      cb = options, options = null;
    return go$appendFile(path2, data, options, cb);
    function go$appendFile(path3, data2, options2, cb2, startTime) {
      return fs$appendFile(path3, data2, options2, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$appendFile, [path3, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$copyFile = fs2.copyFile;
  if (fs$copyFile)
    fs2.copyFile = copyFile2;
  function copyFile2(src, dest, flags, cb) {
    if (typeof flags === "function") {
      cb = flags;
      flags = 0;
    }
    return go$copyFile(src, dest, flags, cb);
    function go$copyFile(src2, dest2, flags2, cb2, startTime) {
      return fs$copyFile(src2, dest2, flags2, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$readdir = fs2.readdir;
  fs2.readdir = readdir;
  var noReaddirOptionVersions = /^v[0-5]\./;
  function readdir(path2, options, cb) {
    if (typeof options === "function")
      cb = options, options = null;
    var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir2(path3, options2, cb2, startTime) {
      return fs$readdir(path3, fs$readdirCallback(
        path3,
        options2,
        cb2,
        startTime
      ));
    } : function go$readdir2(path3, options2, cb2, startTime) {
      return fs$readdir(path3, options2, fs$readdirCallback(
        path3,
        options2,
        cb2,
        startTime
      ));
    };
    return go$readdir(path2, options, cb);
    function fs$readdirCallback(path3, options2, cb2, startTime) {
      return function(err, files2) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([
            go$readdir,
            [path3, options2, cb2],
            err,
            startTime || Date.now(),
            Date.now()
          ]);
        else {
          if (files2 && files2.sort)
            files2.sort();
          if (typeof cb2 === "function")
            cb2.call(this, err, files2);
        }
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var legStreams = legacy(fs2);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }
  var fs$ReadStream = fs2.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStream$open;
  }
  var fs$WriteStream = fs2.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStream$open;
  }
  Object.defineProperty(fs2, "ReadStream", {
    get: function() {
      return ReadStream;
    },
    set: function(val) {
      ReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(fs2, "WriteStream", {
    get: function() {
      return WriteStream;
    },
    set: function(val) {
      WriteStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileReadStream = ReadStream;
  Object.defineProperty(fs2, "FileReadStream", {
    get: function() {
      return FileReadStream;
    },
    set: function(val) {
      FileReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileWriteStream = WriteStream;
  Object.defineProperty(fs2, "FileWriteStream", {
    get: function() {
      return FileWriteStream;
    },
    set: function(val) {
      FileWriteStream = val;
    },
    enumerable: true,
    configurable: true
  });
  function ReadStream(path2, options) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this;
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
  }
  function ReadStream$open() {
    var that = this;
    open(that.path, that.flags, that.mode, function(err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy();
        that.emit("error", err);
      } else {
        that.fd = fd;
        that.emit("open", fd);
        that.read();
      }
    });
  }
  function WriteStream(path2, options) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this;
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
  }
  function WriteStream$open() {
    var that = this;
    open(that.path, that.flags, that.mode, function(err, fd) {
      if (err) {
        that.destroy();
        that.emit("error", err);
      } else {
        that.fd = fd;
        that.emit("open", fd);
      }
    });
  }
  function createReadStream(path2, options) {
    return new fs2.ReadStream(path2, options);
  }
  function createWriteStream(path2, options) {
    return new fs2.WriteStream(path2, options);
  }
  var fs$open = fs2.open;
  fs2.open = open;
  function open(path2, flags, mode, cb) {
    if (typeof mode === "function")
      cb = mode, mode = null;
    return go$open(path2, flags, mode, cb);
    function go$open(path3, flags2, mode2, cb2, startTime) {
      return fs$open(path3, flags2, mode2, function(err, fd) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$open, [path3, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  return fs2;
}
function enqueue(elem) {
  debug("ENQUEUE", elem[0].name, elem[1]);
  fs$n[gracefulQueue].push(elem);
  retry();
}
var retryTimer;
function resetQueue() {
  var now = Date.now();
  for (var i = 0; i < fs$n[gracefulQueue].length; ++i) {
    if (fs$n[gracefulQueue][i].length > 2) {
      fs$n[gracefulQueue][i][3] = now;
      fs$n[gracefulQueue][i][4] = now;
    }
  }
  retry();
}
function retry() {
  clearTimeout(retryTimer);
  retryTimer = void 0;
  if (fs$n[gracefulQueue].length === 0)
    return;
  var elem = fs$n[gracefulQueue].shift();
  var fn = elem[0];
  var args = elem[1];
  var err = elem[2];
  var startTime = elem[3];
  var lastTime = elem[4];
  if (startTime === void 0) {
    debug("RETRY", fn.name, args);
    fn.apply(null, args);
  } else if (Date.now() - startTime >= 6e4) {
    debug("TIMEOUT", fn.name, args);
    var cb = args.pop();
    if (typeof cb === "function")
      cb.call(null, err);
  } else {
    var sinceAttempt = Date.now() - lastTime;
    var sinceStart = Math.max(lastTime - startTime, 1);
    var desiredDelay = Math.min(sinceStart * 1.2, 100);
    if (sinceAttempt >= desiredDelay) {
      debug("RETRY", fn.name, args);
      fn.apply(null, args.concat([startTime]));
    } else {
      fs$n[gracefulQueue].push(elem);
    }
  }
  if (retryTimer === void 0) {
    retryTimer = setTimeout(retry, 0);
  }
}
(function(exports2) {
  const u2 = universalify.fromCallback;
  const fs2 = gracefulFs;
  const api = [
    "access",
    "appendFile",
    "chmod",
    "chown",
    "close",
    "copyFile",
    "fchmod",
    "fchown",
    "fdatasync",
    "fstat",
    "fsync",
    "ftruncate",
    "futimes",
    "lchown",
    "lchmod",
    "link",
    "lstat",
    "mkdir",
    "mkdtemp",
    "open",
    "readFile",
    "readdir",
    "readlink",
    "realpath",
    "rename",
    "rmdir",
    "stat",
    "symlink",
    "truncate",
    "unlink",
    "utimes",
    "writeFile"
  ].filter((key) => {
    return typeof fs2[key] === "function";
  });
  Object.keys(fs2).forEach((key) => {
    if (key === "promises") {
      return;
    }
    exports2[key] = fs2[key];
  });
  api.forEach((method) => {
    exports2[method] = u2(fs2[method]);
  });
  exports2.exists = function(filename, callback) {
    if (typeof callback === "function") {
      return fs2.exists(filename, callback);
    }
    return new Promise((resolve) => {
      return fs2.exists(filename, resolve);
    });
  };
  exports2.read = function(fd, buffer2, offset, length, position, callback) {
    if (typeof callback === "function") {
      return fs2.read(fd, buffer2, offset, length, position, callback);
    }
    return new Promise((resolve, reject) => {
      fs2.read(fd, buffer2, offset, length, position, (err, bytesRead, buffer3) => {
        if (err)
          return reject(err);
        resolve({ bytesRead, buffer: buffer3 });
      });
    });
  };
  exports2.write = function(fd, buffer2, ...args) {
    if (typeof args[args.length - 1] === "function") {
      return fs2.write(fd, buffer2, ...args);
    }
    return new Promise((resolve, reject) => {
      fs2.write(fd, buffer2, ...args, (err, bytesWritten, buffer3) => {
        if (err)
          return reject(err);
        resolve({ bytesWritten, buffer: buffer3 });
      });
    });
  };
  if (typeof fs2.realpath.native === "function") {
    exports2.realpath.native = u2(fs2.realpath.native);
  }
})(fs$o);
const path$i = require$$0$3;
function getRootPath(p) {
  p = path$i.normalize(path$i.resolve(p)).split(path$i.sep);
  if (p.length > 0)
    return p[0];
  return null;
}
const INVALID_PATH_CHARS = /[<>:"|?*]/;
function invalidWin32Path$2(p) {
  const rp = getRootPath(p);
  p = p.replace(rp, "");
  return INVALID_PATH_CHARS.test(p);
}
var win32 = {
  getRootPath,
  invalidWin32Path: invalidWin32Path$2
};
const fs$m = gracefulFs;
const path$h = require$$0$3;
const invalidWin32Path$1 = win32.invalidWin32Path;
const o777$1 = parseInt("0777", 8);
function mkdirs$2(p, opts, callback, made) {
  if (typeof opts === "function") {
    callback = opts;
    opts = {};
  } else if (!opts || typeof opts !== "object") {
    opts = { mode: opts };
  }
  if (process.platform === "win32" && invalidWin32Path$1(p)) {
    const errInval = new Error(p + " contains invalid WIN32 path characters.");
    errInval.code = "EINVAL";
    return callback(errInval);
  }
  let mode = opts.mode;
  const xfs = opts.fs || fs$m;
  if (mode === void 0) {
    mode = o777$1 & ~process.umask();
  }
  if (!made)
    made = null;
  callback = callback || function() {
  };
  p = path$h.resolve(p);
  xfs.mkdir(p, mode, (er) => {
    if (!er) {
      made = made || p;
      return callback(null, made);
    }
    switch (er.code) {
      case "ENOENT":
        if (path$h.dirname(p) === p)
          return callback(er);
        mkdirs$2(path$h.dirname(p), opts, (er2, made2) => {
          if (er2)
            callback(er2, made2);
          else
            mkdirs$2(p, opts, callback, made2);
        });
        break;
      default:
        xfs.stat(p, (er2, stat2) => {
          if (er2 || !stat2.isDirectory())
            callback(er, made);
          else
            callback(null, made);
        });
        break;
    }
  });
}
var mkdirs_1$1 = mkdirs$2;
const fs$l = gracefulFs;
const path$g = require$$0$3;
const invalidWin32Path = win32.invalidWin32Path;
const o777 = parseInt("0777", 8);
function mkdirsSync$2(p, opts, made) {
  if (!opts || typeof opts !== "object") {
    opts = { mode: opts };
  }
  let mode = opts.mode;
  const xfs = opts.fs || fs$l;
  if (process.platform === "win32" && invalidWin32Path(p)) {
    const errInval = new Error(p + " contains invalid WIN32 path characters.");
    errInval.code = "EINVAL";
    throw errInval;
  }
  if (mode === void 0) {
    mode = o777 & ~process.umask();
  }
  if (!made)
    made = null;
  p = path$g.resolve(p);
  try {
    xfs.mkdirSync(p, mode);
    made = made || p;
  } catch (err0) {
    if (err0.code === "ENOENT") {
      if (path$g.dirname(p) === p)
        throw err0;
      made = mkdirsSync$2(path$g.dirname(p), opts, made);
      mkdirsSync$2(p, opts, made);
    } else {
      let stat2;
      try {
        stat2 = xfs.statSync(p);
      } catch (err1) {
        throw err0;
      }
      if (!stat2.isDirectory())
        throw err0;
    }
  }
  return made;
}
var mkdirsSync_1 = mkdirsSync$2;
const u$b = universalify.fromCallback;
const mkdirs$1 = u$b(mkdirs_1$1);
const mkdirsSync$1 = mkdirsSync_1;
var mkdirs_1 = {
  mkdirs: mkdirs$1,
  mkdirsSync: mkdirsSync$1,
  // alias
  mkdirp: mkdirs$1,
  mkdirpSync: mkdirsSync$1,
  ensureDir: mkdirs$1,
  ensureDirSync: mkdirsSync$1
};
const fs$k = gracefulFs;
const os = require$$0;
const path$f = require$$0$3;
function hasMillisResSync() {
  let tmpfile = path$f.join("millis-test-sync" + Date.now().toString() + Math.random().toString().slice(2));
  tmpfile = path$f.join(os.tmpdir(), tmpfile);
  const d = /* @__PURE__ */ new Date(1435410243862);
  fs$k.writeFileSync(tmpfile, "https://github.com/jprichardson/node-fs-extra/pull/141");
  const fd = fs$k.openSync(tmpfile, "r+");
  fs$k.futimesSync(fd, d, d);
  fs$k.closeSync(fd);
  return fs$k.statSync(tmpfile).mtime > 1435410243e3;
}
function hasMillisRes(callback) {
  let tmpfile = path$f.join("millis-test" + Date.now().toString() + Math.random().toString().slice(2));
  tmpfile = path$f.join(os.tmpdir(), tmpfile);
  const d = /* @__PURE__ */ new Date(1435410243862);
  fs$k.writeFile(tmpfile, "https://github.com/jprichardson/node-fs-extra/pull/141", (err) => {
    if (err)
      return callback(err);
    fs$k.open(tmpfile, "r+", (err2, fd) => {
      if (err2)
        return callback(err2);
      fs$k.futimes(fd, d, d, (err3) => {
        if (err3)
          return callback(err3);
        fs$k.close(fd, (err4) => {
          if (err4)
            return callback(err4);
          fs$k.stat(tmpfile, (err5, stats) => {
            if (err5)
              return callback(err5);
            callback(null, stats.mtime > 1435410243e3);
          });
        });
      });
    });
  });
}
function timeRemoveMillis(timestamp2) {
  if (typeof timestamp2 === "number") {
    return Math.floor(timestamp2 / 1e3) * 1e3;
  } else if (timestamp2 instanceof Date) {
    return new Date(Math.floor(timestamp2.getTime() / 1e3) * 1e3);
  } else {
    throw new Error("fs-extra: timeRemoveMillis() unknown parameter type");
  }
}
function utimesMillis(path2, atime, mtime, callback) {
  fs$k.open(path2, "r+", (err, fd) => {
    if (err)
      return callback(err);
    fs$k.futimes(fd, atime, mtime, (futimesErr) => {
      fs$k.close(fd, (closeErr) => {
        if (callback)
          callback(futimesErr || closeErr);
      });
    });
  });
}
function utimesMillisSync(path2, atime, mtime) {
  const fd = fs$k.openSync(path2, "r+");
  fs$k.futimesSync(fd, atime, mtime);
  return fs$k.closeSync(fd);
}
var utimes$1 = {
  hasMillisRes,
  hasMillisResSync,
  timeRemoveMillis,
  utimesMillis,
  utimesMillisSync
};
const fs$j = gracefulFs;
const path$e = require$$0$3;
const NODE_VERSION_MAJOR_WITH_BIGINT = 10;
const NODE_VERSION_MINOR_WITH_BIGINT = 5;
const NODE_VERSION_PATCH_WITH_BIGINT = 0;
const nodeVersion = process.versions.node.split(".");
const nodeVersionMajor = Number.parseInt(nodeVersion[0], 10);
const nodeVersionMinor = Number.parseInt(nodeVersion[1], 10);
const nodeVersionPatch = Number.parseInt(nodeVersion[2], 10);
function nodeSupportsBigInt() {
  if (nodeVersionMajor > NODE_VERSION_MAJOR_WITH_BIGINT) {
    return true;
  } else if (nodeVersionMajor === NODE_VERSION_MAJOR_WITH_BIGINT) {
    if (nodeVersionMinor > NODE_VERSION_MINOR_WITH_BIGINT) {
      return true;
    } else if (nodeVersionMinor === NODE_VERSION_MINOR_WITH_BIGINT) {
      if (nodeVersionPatch >= NODE_VERSION_PATCH_WITH_BIGINT) {
        return true;
      }
    }
  }
  return false;
}
function getStats$2(src, dest, cb) {
  if (nodeSupportsBigInt()) {
    fs$j.stat(src, { bigint: true }, (err, srcStat) => {
      if (err)
        return cb(err);
      fs$j.stat(dest, { bigint: true }, (err2, destStat) => {
        if (err2) {
          if (err2.code === "ENOENT")
            return cb(null, { srcStat, destStat: null });
          return cb(err2);
        }
        return cb(null, { srcStat, destStat });
      });
    });
  } else {
    fs$j.stat(src, (err, srcStat) => {
      if (err)
        return cb(err);
      fs$j.stat(dest, (err2, destStat) => {
        if (err2) {
          if (err2.code === "ENOENT")
            return cb(null, { srcStat, destStat: null });
          return cb(err2);
        }
        return cb(null, { srcStat, destStat });
      });
    });
  }
}
function getStatsSync(src, dest) {
  let srcStat, destStat;
  if (nodeSupportsBigInt()) {
    srcStat = fs$j.statSync(src, { bigint: true });
  } else {
    srcStat = fs$j.statSync(src);
  }
  try {
    if (nodeSupportsBigInt()) {
      destStat = fs$j.statSync(dest, { bigint: true });
    } else {
      destStat = fs$j.statSync(dest);
    }
  } catch (err) {
    if (err.code === "ENOENT")
      return { srcStat, destStat: null };
    throw err;
  }
  return { srcStat, destStat };
}
function checkPaths(src, dest, funcName, cb) {
  getStats$2(src, dest, (err, stats) => {
    if (err)
      return cb(err);
    const { srcStat, destStat } = stats;
    if (destStat && destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
      return cb(new Error("Source and destination must not be the same."));
    }
    if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
      return cb(new Error(errMsg(src, dest, funcName)));
    }
    return cb(null, { srcStat, destStat });
  });
}
function checkPathsSync(src, dest, funcName) {
  const { srcStat, destStat } = getStatsSync(src, dest);
  if (destStat && destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
    throw new Error("Source and destination must not be the same.");
  }
  if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
    throw new Error(errMsg(src, dest, funcName));
  }
  return { srcStat, destStat };
}
function checkParentPaths(src, srcStat, dest, funcName, cb) {
  const srcParent = path$e.resolve(path$e.dirname(src));
  const destParent = path$e.resolve(path$e.dirname(dest));
  if (destParent === srcParent || destParent === path$e.parse(destParent).root)
    return cb();
  if (nodeSupportsBigInt()) {
    fs$j.stat(destParent, { bigint: true }, (err, destStat) => {
      if (err) {
        if (err.code === "ENOENT")
          return cb();
        return cb(err);
      }
      if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
        return cb(new Error(errMsg(src, dest, funcName)));
      }
      return checkParentPaths(src, srcStat, destParent, funcName, cb);
    });
  } else {
    fs$j.stat(destParent, (err, destStat) => {
      if (err) {
        if (err.code === "ENOENT")
          return cb();
        return cb(err);
      }
      if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
        return cb(new Error(errMsg(src, dest, funcName)));
      }
      return checkParentPaths(src, srcStat, destParent, funcName, cb);
    });
  }
}
function checkParentPathsSync(src, srcStat, dest, funcName) {
  const srcParent = path$e.resolve(path$e.dirname(src));
  const destParent = path$e.resolve(path$e.dirname(dest));
  if (destParent === srcParent || destParent === path$e.parse(destParent).root)
    return;
  let destStat;
  try {
    if (nodeSupportsBigInt()) {
      destStat = fs$j.statSync(destParent, { bigint: true });
    } else {
      destStat = fs$j.statSync(destParent);
    }
  } catch (err) {
    if (err.code === "ENOENT")
      return;
    throw err;
  }
  if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
    throw new Error(errMsg(src, dest, funcName));
  }
  return checkParentPathsSync(src, srcStat, destParent, funcName);
}
function isSrcSubdir(src, dest) {
  const srcArr = path$e.resolve(src).split(path$e.sep).filter((i) => i);
  const destArr = path$e.resolve(dest).split(path$e.sep).filter((i) => i);
  return srcArr.reduce((acc, cur, i) => acc && destArr[i] === cur, true);
}
function errMsg(src, dest, funcName) {
  return `Cannot ${funcName} '${src}' to a subdirectory of itself, '${dest}'.`;
}
var stat$4 = {
  checkPaths,
  checkPathsSync,
  checkParentPaths,
  checkParentPathsSync,
  isSrcSubdir
};
var buffer;
var hasRequiredBuffer;
function requireBuffer() {
  if (hasRequiredBuffer)
    return buffer;
  hasRequiredBuffer = 1;
  buffer = function(size) {
    if (typeof Buffer.allocUnsafe === "function") {
      try {
        return Buffer.allocUnsafe(size);
      } catch (e) {
        return new Buffer(size);
      }
    }
    return new Buffer(size);
  };
  return buffer;
}
const fs$i = gracefulFs;
const path$d = require$$0$3;
const mkdirpSync$1 = mkdirs_1.mkdirsSync;
const utimesSync = utimes$1.utimesMillisSync;
const stat$3 = stat$4;
function copySync$2(src, dest, opts) {
  if (typeof opts === "function") {
    opts = { filter: opts };
  }
  opts = opts || {};
  opts.clobber = "clobber" in opts ? !!opts.clobber : true;
  opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
  if (opts.preserveTimestamps && process.arch === "ia32") {
    console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;

    see https://github.com/jprichardson/node-fs-extra/issues/269`);
  }
  const { srcStat, destStat } = stat$3.checkPathsSync(src, dest, "copy");
  stat$3.checkParentPathsSync(src, srcStat, dest, "copy");
  return handleFilterAndCopy(destStat, src, dest, opts);
}
function handleFilterAndCopy(destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest))
    return;
  const destParent = path$d.dirname(dest);
  if (!fs$i.existsSync(destParent))
    mkdirpSync$1(destParent);
  return startCopy$1(destStat, src, dest, opts);
}
function startCopy$1(destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest))
    return;
  return getStats$1(destStat, src, dest, opts);
}
function getStats$1(destStat, src, dest, opts) {
  const statSync = opts.dereference ? fs$i.statSync : fs$i.lstatSync;
  const srcStat = statSync(src);
  if (srcStat.isDirectory())
    return onDir$1(srcStat, destStat, src, dest, opts);
  else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice())
    return onFile$1(srcStat, destStat, src, dest, opts);
  else if (srcStat.isSymbolicLink())
    return onLink$1(destStat, src, dest, opts);
}
function onFile$1(srcStat, destStat, src, dest, opts) {
  if (!destStat)
    return copyFile$1(srcStat, src, dest, opts);
  return mayCopyFile$1(srcStat, src, dest, opts);
}
function mayCopyFile$1(srcStat, src, dest, opts) {
  if (opts.overwrite) {
    fs$i.unlinkSync(dest);
    return copyFile$1(srcStat, src, dest, opts);
  } else if (opts.errorOnExist) {
    throw new Error(`'${dest}' already exists`);
  }
}
function copyFile$1(srcStat, src, dest, opts) {
  if (typeof fs$i.copyFileSync === "function") {
    fs$i.copyFileSync(src, dest);
    fs$i.chmodSync(dest, srcStat.mode);
    if (opts.preserveTimestamps) {
      return utimesSync(dest, srcStat.atime, srcStat.mtime);
    }
    return;
  }
  return copyFileFallback$1(srcStat, src, dest, opts);
}
function copyFileFallback$1(srcStat, src, dest, opts) {
  const BUF_LENGTH = 64 * 1024;
  const _buff = requireBuffer()(BUF_LENGTH);
  const fdr = fs$i.openSync(src, "r");
  const fdw = fs$i.openSync(dest, "w", srcStat.mode);
  let pos = 0;
  while (pos < srcStat.size) {
    const bytesRead = fs$i.readSync(fdr, _buff, 0, BUF_LENGTH, pos);
    fs$i.writeSync(fdw, _buff, 0, bytesRead);
    pos += bytesRead;
  }
  if (opts.preserveTimestamps)
    fs$i.futimesSync(fdw, srcStat.atime, srcStat.mtime);
  fs$i.closeSync(fdr);
  fs$i.closeSync(fdw);
}
function onDir$1(srcStat, destStat, src, dest, opts) {
  if (!destStat)
    return mkDirAndCopy$1(srcStat, src, dest, opts);
  if (destStat && !destStat.isDirectory()) {
    throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
  }
  return copyDir$1(src, dest, opts);
}
function mkDirAndCopy$1(srcStat, src, dest, opts) {
  fs$i.mkdirSync(dest);
  copyDir$1(src, dest, opts);
  return fs$i.chmodSync(dest, srcStat.mode);
}
function copyDir$1(src, dest, opts) {
  fs$i.readdirSync(src).forEach((item) => copyDirItem$1(item, src, dest, opts));
}
function copyDirItem$1(item, src, dest, opts) {
  const srcItem = path$d.join(src, item);
  const destItem = path$d.join(dest, item);
  const { destStat } = stat$3.checkPathsSync(srcItem, destItem, "copy");
  return startCopy$1(destStat, srcItem, destItem, opts);
}
function onLink$1(destStat, src, dest, opts) {
  let resolvedSrc = fs$i.readlinkSync(src);
  if (opts.dereference) {
    resolvedSrc = path$d.resolve(process.cwd(), resolvedSrc);
  }
  if (!destStat) {
    return fs$i.symlinkSync(resolvedSrc, dest);
  } else {
    let resolvedDest;
    try {
      resolvedDest = fs$i.readlinkSync(dest);
    } catch (err) {
      if (err.code === "EINVAL" || err.code === "UNKNOWN")
        return fs$i.symlinkSync(resolvedSrc, dest);
      throw err;
    }
    if (opts.dereference) {
      resolvedDest = path$d.resolve(process.cwd(), resolvedDest);
    }
    if (stat$3.isSrcSubdir(resolvedSrc, resolvedDest)) {
      throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`);
    }
    if (fs$i.statSync(dest).isDirectory() && stat$3.isSrcSubdir(resolvedDest, resolvedSrc)) {
      throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`);
    }
    return copyLink$1(resolvedSrc, dest);
  }
}
function copyLink$1(resolvedSrc, dest) {
  fs$i.unlinkSync(dest);
  return fs$i.symlinkSync(resolvedSrc, dest);
}
var copySync_1 = copySync$2;
var copySync$1 = {
  copySync: copySync_1
};
const u$a = universalify.fromPromise;
const fs$h = fs$o;
function pathExists$8(path2) {
  return fs$h.access(path2).then(() => true).catch(() => false);
}
var pathExists_1 = {
  pathExists: u$a(pathExists$8),
  pathExistsSync: fs$h.existsSync
};
const fs$g = gracefulFs;
const path$c = require$$0$3;
const mkdirp$1 = mkdirs_1.mkdirs;
const pathExists$7 = pathExists_1.pathExists;
const utimes = utimes$1.utimesMillis;
const stat$2 = stat$4;
function copy$2(src, dest, opts, cb) {
  if (typeof opts === "function" && !cb) {
    cb = opts;
    opts = {};
  } else if (typeof opts === "function") {
    opts = { filter: opts };
  }
  cb = cb || function() {
  };
  opts = opts || {};
  opts.clobber = "clobber" in opts ? !!opts.clobber : true;
  opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
  if (opts.preserveTimestamps && process.arch === "ia32") {
    console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;

    see https://github.com/jprichardson/node-fs-extra/issues/269`);
  }
  stat$2.checkPaths(src, dest, "copy", (err, stats) => {
    if (err)
      return cb(err);
    const { srcStat, destStat } = stats;
    stat$2.checkParentPaths(src, srcStat, dest, "copy", (err2) => {
      if (err2)
        return cb(err2);
      if (opts.filter)
        return handleFilter(checkParentDir, destStat, src, dest, opts, cb);
      return checkParentDir(destStat, src, dest, opts, cb);
    });
  });
}
function checkParentDir(destStat, src, dest, opts, cb) {
  const destParent = path$c.dirname(dest);
  pathExists$7(destParent, (err, dirExists) => {
    if (err)
      return cb(err);
    if (dirExists)
      return startCopy(destStat, src, dest, opts, cb);
    mkdirp$1(destParent, (err2) => {
      if (err2)
        return cb(err2);
      return startCopy(destStat, src, dest, opts, cb);
    });
  });
}
function handleFilter(onInclude, destStat, src, dest, opts, cb) {
  Promise.resolve(opts.filter(src, dest)).then((include) => {
    if (include)
      return onInclude(destStat, src, dest, opts, cb);
    return cb();
  }, (error2) => cb(error2));
}
function startCopy(destStat, src, dest, opts, cb) {
  if (opts.filter)
    return handleFilter(getStats, destStat, src, dest, opts, cb);
  return getStats(destStat, src, dest, opts, cb);
}
function getStats(destStat, src, dest, opts, cb) {
  const stat2 = opts.dereference ? fs$g.stat : fs$g.lstat;
  stat2(src, (err, srcStat) => {
    if (err)
      return cb(err);
    if (srcStat.isDirectory())
      return onDir(srcStat, destStat, src, dest, opts, cb);
    else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice())
      return onFile(srcStat, destStat, src, dest, opts, cb);
    else if (srcStat.isSymbolicLink())
      return onLink(destStat, src, dest, opts, cb);
  });
}
function onFile(srcStat, destStat, src, dest, opts, cb) {
  if (!destStat)
    return copyFile(srcStat, src, dest, opts, cb);
  return mayCopyFile(srcStat, src, dest, opts, cb);
}
function mayCopyFile(srcStat, src, dest, opts, cb) {
  if (opts.overwrite) {
    fs$g.unlink(dest, (err) => {
      if (err)
        return cb(err);
      return copyFile(srcStat, src, dest, opts, cb);
    });
  } else if (opts.errorOnExist) {
    return cb(new Error(`'${dest}' already exists`));
  } else
    return cb();
}
function copyFile(srcStat, src, dest, opts, cb) {
  if (typeof fs$g.copyFile === "function") {
    return fs$g.copyFile(src, dest, (err) => {
      if (err)
        return cb(err);
      return setDestModeAndTimestamps(srcStat, dest, opts, cb);
    });
  }
  return copyFileFallback(srcStat, src, dest, opts, cb);
}
function copyFileFallback(srcStat, src, dest, opts, cb) {
  const rs = fs$g.createReadStream(src);
  rs.on("error", (err) => cb(err)).once("open", () => {
    const ws = fs$g.createWriteStream(dest, { mode: srcStat.mode });
    ws.on("error", (err) => cb(err)).on("open", () => rs.pipe(ws)).once("close", () => setDestModeAndTimestamps(srcStat, dest, opts, cb));
  });
}
function setDestModeAndTimestamps(srcStat, dest, opts, cb) {
  fs$g.chmod(dest, srcStat.mode, (err) => {
    if (err)
      return cb(err);
    if (opts.preserveTimestamps) {
      return utimes(dest, srcStat.atime, srcStat.mtime, cb);
    }
    return cb();
  });
}
function onDir(srcStat, destStat, src, dest, opts, cb) {
  if (!destStat)
    return mkDirAndCopy(srcStat, src, dest, opts, cb);
  if (destStat && !destStat.isDirectory()) {
    return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`));
  }
  return copyDir(src, dest, opts, cb);
}
function mkDirAndCopy(srcStat, src, dest, opts, cb) {
  fs$g.mkdir(dest, (err) => {
    if (err)
      return cb(err);
    copyDir(src, dest, opts, (err2) => {
      if (err2)
        return cb(err2);
      return fs$g.chmod(dest, srcStat.mode, cb);
    });
  });
}
function copyDir(src, dest, opts, cb) {
  fs$g.readdir(src, (err, items) => {
    if (err)
      return cb(err);
    return copyDirItems(items, src, dest, opts, cb);
  });
}
function copyDirItems(items, src, dest, opts, cb) {
  const item = items.pop();
  if (!item)
    return cb();
  return copyDirItem(items, item, src, dest, opts, cb);
}
function copyDirItem(items, item, src, dest, opts, cb) {
  const srcItem = path$c.join(src, item);
  const destItem = path$c.join(dest, item);
  stat$2.checkPaths(srcItem, destItem, "copy", (err, stats) => {
    if (err)
      return cb(err);
    const { destStat } = stats;
    startCopy(destStat, srcItem, destItem, opts, (err2) => {
      if (err2)
        return cb(err2);
      return copyDirItems(items, src, dest, opts, cb);
    });
  });
}
function onLink(destStat, src, dest, opts, cb) {
  fs$g.readlink(src, (err, resolvedSrc) => {
    if (err)
      return cb(err);
    if (opts.dereference) {
      resolvedSrc = path$c.resolve(process.cwd(), resolvedSrc);
    }
    if (!destStat) {
      return fs$g.symlink(resolvedSrc, dest, cb);
    } else {
      fs$g.readlink(dest, (err2, resolvedDest) => {
        if (err2) {
          if (err2.code === "EINVAL" || err2.code === "UNKNOWN")
            return fs$g.symlink(resolvedSrc, dest, cb);
          return cb(err2);
        }
        if (opts.dereference) {
          resolvedDest = path$c.resolve(process.cwd(), resolvedDest);
        }
        if (stat$2.isSrcSubdir(resolvedSrc, resolvedDest)) {
          return cb(new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`));
        }
        if (destStat.isDirectory() && stat$2.isSrcSubdir(resolvedDest, resolvedSrc)) {
          return cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`));
        }
        return copyLink(resolvedSrc, dest, cb);
      });
    }
  });
}
function copyLink(resolvedSrc, dest, cb) {
  fs$g.unlink(dest, (err) => {
    if (err)
      return cb(err);
    return fs$g.symlink(resolvedSrc, dest, cb);
  });
}
var copy_1 = copy$2;
const u$9 = universalify.fromCallback;
var copy$1 = {
  copy: u$9(copy_1)
};
const fs$f = gracefulFs;
const path$b = require$$0$3;
const assert = require$$5;
const isWindows = process.platform === "win32";
function defaults(options) {
  const methods = [
    "unlink",
    "chmod",
    "stat",
    "lstat",
    "rmdir",
    "readdir"
  ];
  methods.forEach((m) => {
    options[m] = options[m] || fs$f[m];
    m = m + "Sync";
    options[m] = options[m] || fs$f[m];
  });
  options.maxBusyTries = options.maxBusyTries || 3;
}
function rimraf$1(p, options, cb) {
  let busyTries = 0;
  if (typeof options === "function") {
    cb = options;
    options = {};
  }
  assert(p, "rimraf: missing path");
  assert.strictEqual(typeof p, "string", "rimraf: path should be a string");
  assert.strictEqual(typeof cb, "function", "rimraf: callback function required");
  assert(options, "rimraf: invalid options argument provided");
  assert.strictEqual(typeof options, "object", "rimraf: options should be object");
  defaults(options);
  rimraf_(p, options, function CB(er) {
    if (er) {
      if ((er.code === "EBUSY" || er.code === "ENOTEMPTY" || er.code === "EPERM") && busyTries < options.maxBusyTries) {
        busyTries++;
        const time = busyTries * 100;
        return setTimeout(() => rimraf_(p, options, CB), time);
      }
      if (er.code === "ENOENT")
        er = null;
    }
    cb(er);
  });
}
function rimraf_(p, options, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === "function");
  options.lstat(p, (er, st) => {
    if (er && er.code === "ENOENT") {
      return cb(null);
    }
    if (er && er.code === "EPERM" && isWindows) {
      return fixWinEPERM(p, options, er, cb);
    }
    if (st && st.isDirectory()) {
      return rmdir(p, options, er, cb);
    }
    options.unlink(p, (er2) => {
      if (er2) {
        if (er2.code === "ENOENT") {
          return cb(null);
        }
        if (er2.code === "EPERM") {
          return isWindows ? fixWinEPERM(p, options, er2, cb) : rmdir(p, options, er2, cb);
        }
        if (er2.code === "EISDIR") {
          return rmdir(p, options, er2, cb);
        }
      }
      return cb(er2);
    });
  });
}
function fixWinEPERM(p, options, er, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === "function");
  if (er) {
    assert(er instanceof Error);
  }
  options.chmod(p, 438, (er2) => {
    if (er2) {
      cb(er2.code === "ENOENT" ? null : er);
    } else {
      options.stat(p, (er3, stats) => {
        if (er3) {
          cb(er3.code === "ENOENT" ? null : er);
        } else if (stats.isDirectory()) {
          rmdir(p, options, er, cb);
        } else {
          options.unlink(p, cb);
        }
      });
    }
  });
}
function fixWinEPERMSync(p, options, er) {
  let stats;
  assert(p);
  assert(options);
  if (er) {
    assert(er instanceof Error);
  }
  try {
    options.chmodSync(p, 438);
  } catch (er2) {
    if (er2.code === "ENOENT") {
      return;
    } else {
      throw er;
    }
  }
  try {
    stats = options.statSync(p);
  } catch (er3) {
    if (er3.code === "ENOENT") {
      return;
    } else {
      throw er;
    }
  }
  if (stats.isDirectory()) {
    rmdirSync(p, options, er);
  } else {
    options.unlinkSync(p);
  }
}
function rmdir(p, options, originalEr, cb) {
  assert(p);
  assert(options);
  if (originalEr) {
    assert(originalEr instanceof Error);
  }
  assert(typeof cb === "function");
  options.rmdir(p, (er) => {
    if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")) {
      rmkids(p, options, cb);
    } else if (er && er.code === "ENOTDIR") {
      cb(originalEr);
    } else {
      cb(er);
    }
  });
}
function rmkids(p, options, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === "function");
  options.readdir(p, (er, files2) => {
    if (er)
      return cb(er);
    let n = files2.length;
    let errState;
    if (n === 0)
      return options.rmdir(p, cb);
    files2.forEach((f) => {
      rimraf$1(path$b.join(p, f), options, (er2) => {
        if (errState) {
          return;
        }
        if (er2)
          return cb(errState = er2);
        if (--n === 0) {
          options.rmdir(p, cb);
        }
      });
    });
  });
}
function rimrafSync(p, options) {
  let st;
  options = options || {};
  defaults(options);
  assert(p, "rimraf: missing path");
  assert.strictEqual(typeof p, "string", "rimraf: path should be a string");
  assert(options, "rimraf: missing options");
  assert.strictEqual(typeof options, "object", "rimraf: options should be object");
  try {
    st = options.lstatSync(p);
  } catch (er) {
    if (er.code === "ENOENT") {
      return;
    }
    if (er.code === "EPERM" && isWindows) {
      fixWinEPERMSync(p, options, er);
    }
  }
  try {
    if (st && st.isDirectory()) {
      rmdirSync(p, options, null);
    } else {
      options.unlinkSync(p);
    }
  } catch (er) {
    if (er.code === "ENOENT") {
      return;
    } else if (er.code === "EPERM") {
      return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er);
    } else if (er.code !== "EISDIR") {
      throw er;
    }
    rmdirSync(p, options, er);
  }
}
function rmdirSync(p, options, originalEr) {
  assert(p);
  assert(options);
  if (originalEr) {
    assert(originalEr instanceof Error);
  }
  try {
    options.rmdirSync(p);
  } catch (er) {
    if (er.code === "ENOTDIR") {
      throw originalEr;
    } else if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM") {
      rmkidsSync(p, options);
    } else if (er.code !== "ENOENT") {
      throw er;
    }
  }
}
function rmkidsSync(p, options) {
  assert(p);
  assert(options);
  options.readdirSync(p).forEach((f) => rimrafSync(path$b.join(p, f), options));
  if (isWindows) {
    const startTime = Date.now();
    do {
      try {
        const ret = options.rmdirSync(p, options);
        return ret;
      } catch (er) {
      }
    } while (Date.now() - startTime < 500);
  } else {
    const ret = options.rmdirSync(p, options);
    return ret;
  }
}
var rimraf_1 = rimraf$1;
rimraf$1.sync = rimrafSync;
const u$8 = universalify.fromCallback;
const rimraf = rimraf_1;
var remove$2 = {
  remove: u$8(rimraf),
  removeSync: rimraf.sync
};
const u$7 = universalify.fromCallback;
const fs$e = gracefulFs;
const path$a = require$$0$3;
const mkdir$5 = mkdirs_1;
const remove$1 = remove$2;
const emptyDir = u$7(function emptyDir2(dir, callback) {
  callback = callback || function() {
  };
  fs$e.readdir(dir, (err, items) => {
    if (err)
      return mkdir$5.mkdirs(dir, callback);
    items = items.map((item) => path$a.join(dir, item));
    deleteItem();
    function deleteItem() {
      const item = items.pop();
      if (!item)
        return callback();
      remove$1.remove(item, (err2) => {
        if (err2)
          return callback(err2);
        deleteItem();
      });
    }
  });
});
function emptyDirSync(dir) {
  let items;
  try {
    items = fs$e.readdirSync(dir);
  } catch (err) {
    return mkdir$5.mkdirsSync(dir);
  }
  items.forEach((item) => {
    item = path$a.join(dir, item);
    remove$1.removeSync(item);
  });
}
var empty = {
  emptyDirSync,
  emptydirSync: emptyDirSync,
  emptyDir,
  emptydir: emptyDir
};
const u$6 = universalify.fromCallback;
const path$9 = require$$0$3;
const fs$d = gracefulFs;
const mkdir$4 = mkdirs_1;
const pathExists$6 = pathExists_1.pathExists;
function createFile(file2, callback) {
  function makeFile() {
    fs$d.writeFile(file2, "", (err) => {
      if (err)
        return callback(err);
      callback();
    });
  }
  fs$d.stat(file2, (err, stats) => {
    if (!err && stats.isFile())
      return callback();
    const dir = path$9.dirname(file2);
    pathExists$6(dir, (err2, dirExists) => {
      if (err2)
        return callback(err2);
      if (dirExists)
        return makeFile();
      mkdir$4.mkdirs(dir, (err3) => {
        if (err3)
          return callback(err3);
        makeFile();
      });
    });
  });
}
function createFileSync(file2) {
  let stats;
  try {
    stats = fs$d.statSync(file2);
  } catch (e) {
  }
  if (stats && stats.isFile())
    return;
  const dir = path$9.dirname(file2);
  if (!fs$d.existsSync(dir)) {
    mkdir$4.mkdirsSync(dir);
  }
  fs$d.writeFileSync(file2, "");
}
var file$1 = {
  createFile: u$6(createFile),
  createFileSync
};
const u$5 = universalify.fromCallback;
const path$8 = require$$0$3;
const fs$c = gracefulFs;
const mkdir$3 = mkdirs_1;
const pathExists$5 = pathExists_1.pathExists;
function createLink(srcpath, dstpath, callback) {
  function makeLink(srcpath2, dstpath2) {
    fs$c.link(srcpath2, dstpath2, (err) => {
      if (err)
        return callback(err);
      callback(null);
    });
  }
  pathExists$5(dstpath, (err, destinationExists) => {
    if (err)
      return callback(err);
    if (destinationExists)
      return callback(null);
    fs$c.lstat(srcpath, (err2) => {
      if (err2) {
        err2.message = err2.message.replace("lstat", "ensureLink");
        return callback(err2);
      }
      const dir = path$8.dirname(dstpath);
      pathExists$5(dir, (err3, dirExists) => {
        if (err3)
          return callback(err3);
        if (dirExists)
          return makeLink(srcpath, dstpath);
        mkdir$3.mkdirs(dir, (err4) => {
          if (err4)
            return callback(err4);
          makeLink(srcpath, dstpath);
        });
      });
    });
  });
}
function createLinkSync(srcpath, dstpath) {
  const destinationExists = fs$c.existsSync(dstpath);
  if (destinationExists)
    return void 0;
  try {
    fs$c.lstatSync(srcpath);
  } catch (err) {
    err.message = err.message.replace("lstat", "ensureLink");
    throw err;
  }
  const dir = path$8.dirname(dstpath);
  const dirExists = fs$c.existsSync(dir);
  if (dirExists)
    return fs$c.linkSync(srcpath, dstpath);
  mkdir$3.mkdirsSync(dir);
  return fs$c.linkSync(srcpath, dstpath);
}
var link$1 = {
  createLink: u$5(createLink),
  createLinkSync
};
const path$7 = require$$0$3;
const fs$b = gracefulFs;
const pathExists$4 = pathExists_1.pathExists;
function symlinkPaths$1(srcpath, dstpath, callback) {
  if (path$7.isAbsolute(srcpath)) {
    return fs$b.lstat(srcpath, (err) => {
      if (err) {
        err.message = err.message.replace("lstat", "ensureSymlink");
        return callback(err);
      }
      return callback(null, {
        "toCwd": srcpath,
        "toDst": srcpath
      });
    });
  } else {
    const dstdir = path$7.dirname(dstpath);
    const relativeToDst = path$7.join(dstdir, srcpath);
    return pathExists$4(relativeToDst, (err, exists) => {
      if (err)
        return callback(err);
      if (exists) {
        return callback(null, {
          "toCwd": relativeToDst,
          "toDst": srcpath
        });
      } else {
        return fs$b.lstat(srcpath, (err2) => {
          if (err2) {
            err2.message = err2.message.replace("lstat", "ensureSymlink");
            return callback(err2);
          }
          return callback(null, {
            "toCwd": srcpath,
            "toDst": path$7.relative(dstdir, srcpath)
          });
        });
      }
    });
  }
}
function symlinkPathsSync$1(srcpath, dstpath) {
  let exists;
  if (path$7.isAbsolute(srcpath)) {
    exists = fs$b.existsSync(srcpath);
    if (!exists)
      throw new Error("absolute srcpath does not exist");
    return {
      "toCwd": srcpath,
      "toDst": srcpath
    };
  } else {
    const dstdir = path$7.dirname(dstpath);
    const relativeToDst = path$7.join(dstdir, srcpath);
    exists = fs$b.existsSync(relativeToDst);
    if (exists) {
      return {
        "toCwd": relativeToDst,
        "toDst": srcpath
      };
    } else {
      exists = fs$b.existsSync(srcpath);
      if (!exists)
        throw new Error("relative srcpath does not exist");
      return {
        "toCwd": srcpath,
        "toDst": path$7.relative(dstdir, srcpath)
      };
    }
  }
}
var symlinkPaths_1 = {
  symlinkPaths: symlinkPaths$1,
  symlinkPathsSync: symlinkPathsSync$1
};
const fs$a = gracefulFs;
function symlinkType$1(srcpath, type2, callback) {
  callback = typeof type2 === "function" ? type2 : callback;
  type2 = typeof type2 === "function" ? false : type2;
  if (type2)
    return callback(null, type2);
  fs$a.lstat(srcpath, (err, stats) => {
    if (err)
      return callback(null, "file");
    type2 = stats && stats.isDirectory() ? "dir" : "file";
    callback(null, type2);
  });
}
function symlinkTypeSync$1(srcpath, type2) {
  let stats;
  if (type2)
    return type2;
  try {
    stats = fs$a.lstatSync(srcpath);
  } catch (e) {
    return "file";
  }
  return stats && stats.isDirectory() ? "dir" : "file";
}
var symlinkType_1 = {
  symlinkType: symlinkType$1,
  symlinkTypeSync: symlinkTypeSync$1
};
const u$4 = universalify.fromCallback;
const path$6 = require$$0$3;
const fs$9 = gracefulFs;
const _mkdirs = mkdirs_1;
const mkdirs = _mkdirs.mkdirs;
const mkdirsSync = _mkdirs.mkdirsSync;
const _symlinkPaths = symlinkPaths_1;
const symlinkPaths = _symlinkPaths.symlinkPaths;
const symlinkPathsSync = _symlinkPaths.symlinkPathsSync;
const _symlinkType = symlinkType_1;
const symlinkType = _symlinkType.symlinkType;
const symlinkTypeSync = _symlinkType.symlinkTypeSync;
const pathExists$3 = pathExists_1.pathExists;
function createSymlink(srcpath, dstpath, type2, callback) {
  callback = typeof type2 === "function" ? type2 : callback;
  type2 = typeof type2 === "function" ? false : type2;
  pathExists$3(dstpath, (err, destinationExists) => {
    if (err)
      return callback(err);
    if (destinationExists)
      return callback(null);
    symlinkPaths(srcpath, dstpath, (err2, relative) => {
      if (err2)
        return callback(err2);
      srcpath = relative.toDst;
      symlinkType(relative.toCwd, type2, (err3, type3) => {
        if (err3)
          return callback(err3);
        const dir = path$6.dirname(dstpath);
        pathExists$3(dir, (err4, dirExists) => {
          if (err4)
            return callback(err4);
          if (dirExists)
            return fs$9.symlink(srcpath, dstpath, type3, callback);
          mkdirs(dir, (err5) => {
            if (err5)
              return callback(err5);
            fs$9.symlink(srcpath, dstpath, type3, callback);
          });
        });
      });
    });
  });
}
function createSymlinkSync(srcpath, dstpath, type2) {
  const destinationExists = fs$9.existsSync(dstpath);
  if (destinationExists)
    return void 0;
  const relative = symlinkPathsSync(srcpath, dstpath);
  srcpath = relative.toDst;
  type2 = symlinkTypeSync(relative.toCwd, type2);
  const dir = path$6.dirname(dstpath);
  const exists = fs$9.existsSync(dir);
  if (exists)
    return fs$9.symlinkSync(srcpath, dstpath, type2);
  mkdirsSync(dir);
  return fs$9.symlinkSync(srcpath, dstpath, type2);
}
var symlink$1 = {
  createSymlink: u$4(createSymlink),
  createSymlinkSync
};
const file = file$1;
const link = link$1;
const symlink = symlink$1;
var ensure = {
  // file
  createFile: file.createFile,
  createFileSync: file.createFileSync,
  ensureFile: file.createFile,
  ensureFileSync: file.createFileSync,
  // link
  createLink: link.createLink,
  createLinkSync: link.createLinkSync,
  ensureLink: link.createLink,
  ensureLinkSync: link.createLinkSync,
  // symlink
  createSymlink: symlink.createSymlink,
  createSymlinkSync: symlink.createSymlinkSync,
  ensureSymlink: symlink.createSymlink,
  ensureSymlinkSync: symlink.createSymlinkSync
};
var _fs;
try {
  _fs = gracefulFs;
} catch (_) {
  _fs = require$$0$1;
}
function readFile(file2, options, callback) {
  if (callback == null) {
    callback = options;
    options = {};
  }
  if (typeof options === "string") {
    options = { encoding: options };
  }
  options = options || {};
  var fs2 = options.fs || _fs;
  var shouldThrow = true;
  if ("throws" in options) {
    shouldThrow = options.throws;
  }
  fs2.readFile(file2, options, function(err, data) {
    if (err)
      return callback(err);
    data = stripBom$1(data);
    var obj;
    try {
      obj = JSON.parse(data, options ? options.reviver : null);
    } catch (err2) {
      if (shouldThrow) {
        err2.message = file2 + ": " + err2.message;
        return callback(err2);
      } else {
        return callback(null, null);
      }
    }
    callback(null, obj);
  });
}
function readFileSync(file2, options) {
  options = options || {};
  if (typeof options === "string") {
    options = { encoding: options };
  }
  var fs2 = options.fs || _fs;
  var shouldThrow = true;
  if ("throws" in options) {
    shouldThrow = options.throws;
  }
  try {
    var content = fs2.readFileSync(file2, options);
    content = stripBom$1(content);
    return JSON.parse(content, options.reviver);
  } catch (err) {
    if (shouldThrow) {
      err.message = file2 + ": " + err.message;
      throw err;
    } else {
      return null;
    }
  }
}
function stringify$2(obj, options) {
  var spaces;
  var EOL = "\n";
  if (typeof options === "object" && options !== null) {
    if (options.spaces) {
      spaces = options.spaces;
    }
    if (options.EOL) {
      EOL = options.EOL;
    }
  }
  var str2 = JSON.stringify(obj, options ? options.replacer : null, spaces);
  return str2.replace(/\n/g, EOL) + EOL;
}
function writeFile(file2, obj, options, callback) {
  if (callback == null) {
    callback = options;
    options = {};
  }
  options = options || {};
  var fs2 = options.fs || _fs;
  var str2 = "";
  try {
    str2 = stringify$2(obj, options);
  } catch (err) {
    if (callback)
      callback(err, null);
    return;
  }
  fs2.writeFile(file2, str2, options, callback);
}
function writeFileSync(file2, obj, options) {
  options = options || {};
  var fs2 = options.fs || _fs;
  var str2 = stringify$2(obj, options);
  return fs2.writeFileSync(file2, str2, options);
}
function stripBom$1(content) {
  if (Buffer.isBuffer(content))
    content = content.toString("utf8");
  content = content.replace(/^\uFEFF/, "");
  return content;
}
var jsonfile$1 = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync
};
var jsonfile_1 = jsonfile$1;
const u$3 = universalify.fromCallback;
const jsonFile$3 = jsonfile_1;
var jsonfile = {
  // jsonfile exports
  readJson: u$3(jsonFile$3.readFile),
  readJsonSync: jsonFile$3.readFileSync,
  writeJson: u$3(jsonFile$3.writeFile),
  writeJsonSync: jsonFile$3.writeFileSync
};
const path$5 = require$$0$3;
const mkdir$2 = mkdirs_1;
const pathExists$2 = pathExists_1.pathExists;
const jsonFile$2 = jsonfile;
function outputJson(file2, data, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  const dir = path$5.dirname(file2);
  pathExists$2(dir, (err, itDoes) => {
    if (err)
      return callback(err);
    if (itDoes)
      return jsonFile$2.writeJson(file2, data, options, callback);
    mkdir$2.mkdirs(dir, (err2) => {
      if (err2)
        return callback(err2);
      jsonFile$2.writeJson(file2, data, options, callback);
    });
  });
}
var outputJson_1 = outputJson;
const fs$8 = gracefulFs;
const path$4 = require$$0$3;
const mkdir$1 = mkdirs_1;
const jsonFile$1 = jsonfile;
function outputJsonSync(file2, data, options) {
  const dir = path$4.dirname(file2);
  if (!fs$8.existsSync(dir)) {
    mkdir$1.mkdirsSync(dir);
  }
  jsonFile$1.writeJsonSync(file2, data, options);
}
var outputJsonSync_1 = outputJsonSync;
const u$2 = universalify.fromCallback;
const jsonFile = jsonfile;
jsonFile.outputJson = u$2(outputJson_1);
jsonFile.outputJsonSync = outputJsonSync_1;
jsonFile.outputJSON = jsonFile.outputJson;
jsonFile.outputJSONSync = jsonFile.outputJsonSync;
jsonFile.writeJSON = jsonFile.writeJson;
jsonFile.writeJSONSync = jsonFile.writeJsonSync;
jsonFile.readJSON = jsonFile.readJson;
jsonFile.readJSONSync = jsonFile.readJsonSync;
var json$1 = jsonFile;
const fs$7 = gracefulFs;
const path$3 = require$$0$3;
const copySync = copySync$1.copySync;
const removeSync = remove$2.removeSync;
const mkdirpSync = mkdirs_1.mkdirpSync;
const stat$1 = stat$4;
function moveSync$1(src, dest, opts) {
  opts = opts || {};
  const overwrite = opts.overwrite || opts.clobber || false;
  const { srcStat } = stat$1.checkPathsSync(src, dest, "move");
  stat$1.checkParentPathsSync(src, srcStat, dest, "move");
  mkdirpSync(path$3.dirname(dest));
  return doRename$1(src, dest, overwrite);
}
function doRename$1(src, dest, overwrite) {
  if (overwrite) {
    removeSync(dest);
    return rename$1(src, dest, overwrite);
  }
  if (fs$7.existsSync(dest))
    throw new Error("dest already exists.");
  return rename$1(src, dest, overwrite);
}
function rename$1(src, dest, overwrite) {
  try {
    fs$7.renameSync(src, dest);
  } catch (err) {
    if (err.code !== "EXDEV")
      throw err;
    return moveAcrossDevice$1(src, dest, overwrite);
  }
}
function moveAcrossDevice$1(src, dest, overwrite) {
  const opts = {
    overwrite,
    errorOnExist: true
  };
  copySync(src, dest, opts);
  return removeSync(src);
}
var moveSync_1 = moveSync$1;
var moveSync = {
  moveSync: moveSync_1
};
const fs$6 = gracefulFs;
const path$2 = require$$0$3;
const copy = copy$1.copy;
const remove = remove$2.remove;
const mkdirp = mkdirs_1.mkdirp;
const pathExists$1 = pathExists_1.pathExists;
const stat = stat$4;
function move$1(src, dest, opts, cb) {
  if (typeof opts === "function") {
    cb = opts;
    opts = {};
  }
  const overwrite = opts.overwrite || opts.clobber || false;
  stat.checkPaths(src, dest, "move", (err, stats) => {
    if (err)
      return cb(err);
    const { srcStat } = stats;
    stat.checkParentPaths(src, srcStat, dest, "move", (err2) => {
      if (err2)
        return cb(err2);
      mkdirp(path$2.dirname(dest), (err3) => {
        if (err3)
          return cb(err3);
        return doRename(src, dest, overwrite, cb);
      });
    });
  });
}
function doRename(src, dest, overwrite, cb) {
  if (overwrite) {
    return remove(dest, (err) => {
      if (err)
        return cb(err);
      return rename(src, dest, overwrite, cb);
    });
  }
  pathExists$1(dest, (err, destExists) => {
    if (err)
      return cb(err);
    if (destExists)
      return cb(new Error("dest already exists."));
    return rename(src, dest, overwrite, cb);
  });
}
function rename(src, dest, overwrite, cb) {
  fs$6.rename(src, dest, (err) => {
    if (!err)
      return cb();
    if (err.code !== "EXDEV")
      return cb(err);
    return moveAcrossDevice(src, dest, overwrite, cb);
  });
}
function moveAcrossDevice(src, dest, overwrite, cb) {
  const opts = {
    overwrite,
    errorOnExist: true
  };
  copy(src, dest, opts, (err) => {
    if (err)
      return cb(err);
    return remove(src, cb);
  });
}
var move_1 = move$1;
const u$1 = universalify.fromCallback;
var move = {
  move: u$1(move_1)
};
const u = universalify.fromCallback;
const fs$5 = gracefulFs;
const path$1 = require$$0$3;
const mkdir = mkdirs_1;
const pathExists = pathExists_1.pathExists;
function outputFile(file2, data, encoding, callback) {
  if (typeof encoding === "function") {
    callback = encoding;
    encoding = "utf8";
  }
  const dir = path$1.dirname(file2);
  pathExists(dir, (err, itDoes) => {
    if (err)
      return callback(err);
    if (itDoes)
      return fs$5.writeFile(file2, data, encoding, callback);
    mkdir.mkdirs(dir, (err2) => {
      if (err2)
        return callback(err2);
      fs$5.writeFile(file2, data, encoding, callback);
    });
  });
}
function outputFileSync(file2, ...args) {
  const dir = path$1.dirname(file2);
  if (fs$5.existsSync(dir)) {
    return fs$5.writeFileSync(file2, ...args);
  }
  mkdir.mkdirsSync(dir);
  fs$5.writeFileSync(file2, ...args);
}
var output = {
  outputFile: u(outputFile),
  outputFileSync
};
(function(module2) {
  module2.exports = Object.assign(
    {},
    // Export promiseified graceful-fs:
    fs$o,
    // Export extra methods:
    copySync$1,
    copy$1,
    empty,
    ensure,
    json$1,
    mkdirs_1,
    moveSync,
    move,
    output,
    pathExists_1,
    remove$2
  );
  const fs2 = require$$0$1;
  if (Object.getOwnPropertyDescriptor(fs2, "promises")) {
    Object.defineProperty(module2.exports, "promises", {
      get() {
        return fs2.promises;
      }
    });
  }
})(lib);
var libExports = lib.exports;
const fs$4 = /* @__PURE__ */ getDefaultExportFromCjs(libExports);
var manypkgTools_cjs = { exports: {} };
var manypkgTools_cjs_prod = {};
var globby = { exports: {} };
var arrayUnion;
var hasRequiredArrayUnion;
function requireArrayUnion() {
  if (hasRequiredArrayUnion)
    return arrayUnion;
  hasRequiredArrayUnion = 1;
  arrayUnion = (...arguments_) => {
    return [...new Set([].concat(...arguments_))];
  };
  return arrayUnion;
}
var merge2_1;
var hasRequiredMerge2;
function requireMerge2() {
  if (hasRequiredMerge2)
    return merge2_1;
  hasRequiredMerge2 = 1;
  const Stream2 = require$$0$6;
  const PassThrough = Stream2.PassThrough;
  const slice = Array.prototype.slice;
  merge2_1 = merge2;
  function merge2() {
    const streamsQueue = [];
    const args = slice.call(arguments);
    let merging = false;
    let options = args[args.length - 1];
    if (options && !Array.isArray(options) && options.pipe == null) {
      args.pop();
    } else {
      options = {};
    }
    const doEnd = options.end !== false;
    const doPipeError = options.pipeError === true;
    if (options.objectMode == null) {
      options.objectMode = true;
    }
    if (options.highWaterMark == null) {
      options.highWaterMark = 64 * 1024;
    }
    const mergedStream = PassThrough(options);
    function addStream() {
      for (let i = 0, len = arguments.length; i < len; i++) {
        streamsQueue.push(pauseStreams(arguments[i], options));
      }
      mergeStream();
      return this;
    }
    function mergeStream() {
      if (merging) {
        return;
      }
      merging = true;
      let streams = streamsQueue.shift();
      if (!streams) {
        process.nextTick(endStream);
        return;
      }
      if (!Array.isArray(streams)) {
        streams = [streams];
      }
      let pipesCount = streams.length + 1;
      function next() {
        if (--pipesCount > 0) {
          return;
        }
        merging = false;
        mergeStream();
      }
      function pipe(stream2) {
        function onend() {
          stream2.removeListener("merge2UnpipeEnd", onend);
          stream2.removeListener("end", onend);
          if (doPipeError) {
            stream2.removeListener("error", onerror);
          }
          next();
        }
        function onerror(err) {
          mergedStream.emit("error", err);
        }
        if (stream2._readableState.endEmitted) {
          return next();
        }
        stream2.on("merge2UnpipeEnd", onend);
        stream2.on("end", onend);
        if (doPipeError) {
          stream2.on("error", onerror);
        }
        stream2.pipe(mergedStream, { end: false });
        stream2.resume();
      }
      for (let i = 0; i < streams.length; i++) {
        pipe(streams[i]);
      }
      next();
    }
    function endStream() {
      merging = false;
      mergedStream.emit("queueDrain");
      if (doEnd) {
        mergedStream.end();
      }
    }
    mergedStream.setMaxListeners(0);
    mergedStream.add = addStream;
    mergedStream.on("unpipe", function(stream2) {
      stream2.emit("merge2UnpipeEnd");
    });
    if (args.length) {
      addStream.apply(null, args);
    }
    return mergedStream;
  }
  function pauseStreams(streams, options) {
    if (!Array.isArray(streams)) {
      if (!streams._readableState && streams.pipe) {
        streams = streams.pipe(PassThrough(options));
      }
      if (!streams._readableState || !streams.pause || !streams.pipe) {
        throw new Error("Only readable stream can be merged.");
      }
      streams.pause();
    } else {
      for (let i = 0, len = streams.length; i < len; i++) {
        streams[i] = pauseStreams(streams[i], options);
      }
    }
    return streams;
  }
  return merge2_1;
}
var tasks = {};
var utils$4 = {};
var array = {};
var hasRequiredArray;
function requireArray() {
  if (hasRequiredArray)
    return array;
  hasRequiredArray = 1;
  Object.defineProperty(array, "__esModule", { value: true });
  array.splitWhen = array.flatten = void 0;
  function flatten(items) {
    return items.reduce((collection, item) => [].concat(collection, item), []);
  }
  array.flatten = flatten;
  function splitWhen(items, predicate) {
    const result = [[]];
    let groupIndex = 0;
    for (const item of items) {
      if (predicate(item)) {
        groupIndex++;
        result[groupIndex] = [];
      } else {
        result[groupIndex].push(item);
      }
    }
    return result;
  }
  array.splitWhen = splitWhen;
  return array;
}
var errno = {};
var hasRequiredErrno;
function requireErrno() {
  if (hasRequiredErrno)
    return errno;
  hasRequiredErrno = 1;
  Object.defineProperty(errno, "__esModule", { value: true });
  errno.isEnoentCodeError = void 0;
  function isEnoentCodeError(error2) {
    return error2.code === "ENOENT";
  }
  errno.isEnoentCodeError = isEnoentCodeError;
  return errno;
}
var fs$3 = {};
var hasRequiredFs$3;
function requireFs$3() {
  if (hasRequiredFs$3)
    return fs$3;
  hasRequiredFs$3 = 1;
  Object.defineProperty(fs$3, "__esModule", { value: true });
  fs$3.createDirentFromStats = void 0;
  class DirentFromStats {
    constructor(name, stats) {
      this.name = name;
      this.isBlockDevice = stats.isBlockDevice.bind(stats);
      this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
      this.isDirectory = stats.isDirectory.bind(stats);
      this.isFIFO = stats.isFIFO.bind(stats);
      this.isFile = stats.isFile.bind(stats);
      this.isSocket = stats.isSocket.bind(stats);
      this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
    }
  }
  function createDirentFromStats(name, stats) {
    return new DirentFromStats(name, stats);
  }
  fs$3.createDirentFromStats = createDirentFromStats;
  return fs$3;
}
var path = {};
var hasRequiredPath;
function requirePath() {
  if (hasRequiredPath)
    return path;
  hasRequiredPath = 1;
  Object.defineProperty(path, "__esModule", { value: true });
  path.convertPosixPathToPattern = path.convertWindowsPathToPattern = path.convertPathToPattern = path.escapePosixPath = path.escapeWindowsPath = path.escape = path.removeLeadingDotSegment = path.makeAbsolute = path.unixify = void 0;
  const os2 = require$$0;
  const path$12 = require$$0$3;
  const IS_WINDOWS_PLATFORM = os2.platform() === "win32";
  const LEADING_DOT_SEGMENT_CHARACTERS_COUNT = 2;
  const POSIX_UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([()*?[\]{|}]|^!|[!+@](?=\()|\\(?![!()*+?@[\]{|}]))/g;
  const WINDOWS_UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([(){}]|^!|[!+@](?=\())/g;
  const DOS_DEVICE_PATH_RE = /^\\\\([.?])/;
  const WINDOWS_BACKSLASHES_RE = /\\(?![!()+@{}])/g;
  function unixify(filepath) {
    return filepath.replace(/\\/g, "/");
  }
  path.unixify = unixify;
  function makeAbsolute(cwd2, filepath) {
    return path$12.resolve(cwd2, filepath);
  }
  path.makeAbsolute = makeAbsolute;
  function removeLeadingDotSegment(entry2) {
    if (entry2.charAt(0) === ".") {
      const secondCharactery = entry2.charAt(1);
      if (secondCharactery === "/" || secondCharactery === "\\") {
        return entry2.slice(LEADING_DOT_SEGMENT_CHARACTERS_COUNT);
      }
    }
    return entry2;
  }
  path.removeLeadingDotSegment = removeLeadingDotSegment;
  path.escape = IS_WINDOWS_PLATFORM ? escapeWindowsPath : escapePosixPath;
  function escapeWindowsPath(pattern2) {
    return pattern2.replace(WINDOWS_UNESCAPED_GLOB_SYMBOLS_RE, "\\$2");
  }
  path.escapeWindowsPath = escapeWindowsPath;
  function escapePosixPath(pattern2) {
    return pattern2.replace(POSIX_UNESCAPED_GLOB_SYMBOLS_RE, "\\$2");
  }
  path.escapePosixPath = escapePosixPath;
  path.convertPathToPattern = IS_WINDOWS_PLATFORM ? convertWindowsPathToPattern : convertPosixPathToPattern;
  function convertWindowsPathToPattern(filepath) {
    return escapeWindowsPath(filepath).replace(DOS_DEVICE_PATH_RE, "//$1").replace(WINDOWS_BACKSLASHES_RE, "/");
  }
  path.convertWindowsPathToPattern = convertWindowsPathToPattern;
  function convertPosixPathToPattern(filepath) {
    return escapePosixPath(filepath);
  }
  path.convertPosixPathToPattern = convertPosixPathToPattern;
  return path;
}
var pattern = {};
/*!
 * is-extglob <https://github.com/jonschlinkert/is-extglob>
 *
 * Copyright (c) 2014-2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */
var isExtglob;
var hasRequiredIsExtglob;
function requireIsExtglob() {
  if (hasRequiredIsExtglob)
    return isExtglob;
  hasRequiredIsExtglob = 1;
  isExtglob = function isExtglob2(str2) {
    if (typeof str2 !== "string" || str2 === "") {
      return false;
    }
    var match;
    while (match = /(\\).|([@?!+*]\(.*\))/g.exec(str2)) {
      if (match[2])
        return true;
      str2 = str2.slice(match.index + match[0].length);
    }
    return false;
  };
  return isExtglob;
}
/*!
 * is-glob <https://github.com/jonschlinkert/is-glob>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */
var isGlob;
var hasRequiredIsGlob;
function requireIsGlob() {
  if (hasRequiredIsGlob)
    return isGlob;
  hasRequiredIsGlob = 1;
  var isExtglob2 = requireIsExtglob();
  var chars = { "{": "}", "(": ")", "[": "]" };
  var strictCheck = function(str2) {
    if (str2[0] === "!") {
      return true;
    }
    var index = 0;
    var pipeIndex = -2;
    var closeSquareIndex = -2;
    var closeCurlyIndex = -2;
    var closeParenIndex = -2;
    var backSlashIndex = -2;
    while (index < str2.length) {
      if (str2[index] === "*") {
        return true;
      }
      if (str2[index + 1] === "?" && /[\].+)]/.test(str2[index])) {
        return true;
      }
      if (closeSquareIndex !== -1 && str2[index] === "[" && str2[index + 1] !== "]") {
        if (closeSquareIndex < index) {
          closeSquareIndex = str2.indexOf("]", index);
        }
        if (closeSquareIndex > index) {
          if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
            return true;
          }
          backSlashIndex = str2.indexOf("\\", index);
          if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
            return true;
          }
        }
      }
      if (closeCurlyIndex !== -1 && str2[index] === "{" && str2[index + 1] !== "}") {
        closeCurlyIndex = str2.indexOf("}", index);
        if (closeCurlyIndex > index) {
          backSlashIndex = str2.indexOf("\\", index);
          if (backSlashIndex === -1 || backSlashIndex > closeCurlyIndex) {
            return true;
          }
        }
      }
      if (closeParenIndex !== -1 && str2[index] === "(" && str2[index + 1] === "?" && /[:!=]/.test(str2[index + 2]) && str2[index + 3] !== ")") {
        closeParenIndex = str2.indexOf(")", index);
        if (closeParenIndex > index) {
          backSlashIndex = str2.indexOf("\\", index);
          if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
            return true;
          }
        }
      }
      if (pipeIndex !== -1 && str2[index] === "(" && str2[index + 1] !== "|") {
        if (pipeIndex < index) {
          pipeIndex = str2.indexOf("|", index);
        }
        if (pipeIndex !== -1 && str2[pipeIndex + 1] !== ")") {
          closeParenIndex = str2.indexOf(")", pipeIndex);
          if (closeParenIndex > pipeIndex) {
            backSlashIndex = str2.indexOf("\\", pipeIndex);
            if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
              return true;
            }
          }
        }
      }
      if (str2[index] === "\\") {
        var open = str2[index + 1];
        index += 2;
        var close = chars[open];
        if (close) {
          var n = str2.indexOf(close, index);
          if (n !== -1) {
            index = n + 1;
          }
        }
        if (str2[index] === "!") {
          return true;
        }
      } else {
        index++;
      }
    }
    return false;
  };
  var relaxedCheck = function(str2) {
    if (str2[0] === "!") {
      return true;
    }
    var index = 0;
    while (index < str2.length) {
      if (/[*?{}()[\]]/.test(str2[index])) {
        return true;
      }
      if (str2[index] === "\\") {
        var open = str2[index + 1];
        index += 2;
        var close = chars[open];
        if (close) {
          var n = str2.indexOf(close, index);
          if (n !== -1) {
            index = n + 1;
          }
        }
        if (str2[index] === "!") {
          return true;
        }
      } else {
        index++;
      }
    }
    return false;
  };
  isGlob = function isGlob2(str2, options) {
    if (typeof str2 !== "string" || str2 === "") {
      return false;
    }
    if (isExtglob2(str2)) {
      return true;
    }
    var check = strictCheck;
    if (options && options.strict === false) {
      check = relaxedCheck;
    }
    return check(str2);
  };
  return isGlob;
}
var globParent;
var hasRequiredGlobParent;
function requireGlobParent() {
  if (hasRequiredGlobParent)
    return globParent;
  hasRequiredGlobParent = 1;
  var isGlob2 = requireIsGlob();
  var pathPosixDirname = require$$0$3.posix.dirname;
  var isWin32 = require$$0.platform() === "win32";
  var slash2 = "/";
  var backslash = /\\/g;
  var enclosure = /[\{\[].*[\}\]]$/;
  var globby2 = /(^|[^\\])([\{\[]|\([^\)]+$)/;
  var escaped = /\\([\!\*\?\|\[\]\(\)\{\}])/g;
  globParent = function globParent2(str2, opts) {
    var options = Object.assign({ flipBackslashes: true }, opts);
    if (options.flipBackslashes && isWin32 && str2.indexOf(slash2) < 0) {
      str2 = str2.replace(backslash, slash2);
    }
    if (enclosure.test(str2)) {
      str2 += slash2;
    }
    str2 += "a";
    do {
      str2 = pathPosixDirname(str2);
    } while (isGlob2(str2) || globby2.test(str2));
    return str2.replace(escaped, "$1");
  };
  return globParent;
}
var utils$3 = {};
var hasRequiredUtils$4;
function requireUtils$4() {
  if (hasRequiredUtils$4)
    return utils$3;
  hasRequiredUtils$4 = 1;
  (function(exports2) {
    exports2.isInteger = (num) => {
      if (typeof num === "number") {
        return Number.isInteger(num);
      }
      if (typeof num === "string" && num.trim() !== "") {
        return Number.isInteger(Number(num));
      }
      return false;
    };
    exports2.find = (node, type2) => node.nodes.find((node2) => node2.type === type2);
    exports2.exceedsLimit = (min, max, step = 1, limit) => {
      if (limit === false)
        return false;
      if (!exports2.isInteger(min) || !exports2.isInteger(max))
        return false;
      return (Number(max) - Number(min)) / Number(step) >= limit;
    };
    exports2.escapeNode = (block, n = 0, type2) => {
      let node = block.nodes[n];
      if (!node)
        return;
      if (type2 && node.type === type2 || node.type === "open" || node.type === "close") {
        if (node.escaped !== true) {
          node.value = "\\" + node.value;
          node.escaped = true;
        }
      }
    };
    exports2.encloseBrace = (node) => {
      if (node.type !== "brace")
        return false;
      if (node.commas >> 0 + node.ranges >> 0 === 0) {
        node.invalid = true;
        return true;
      }
      return false;
    };
    exports2.isInvalidBrace = (block) => {
      if (block.type !== "brace")
        return false;
      if (block.invalid === true || block.dollar)
        return true;
      if (block.commas >> 0 + block.ranges >> 0 === 0) {
        block.invalid = true;
        return true;
      }
      if (block.open !== true || block.close !== true) {
        block.invalid = true;
        return true;
      }
      return false;
    };
    exports2.isOpenOrClose = (node) => {
      if (node.type === "open" || node.type === "close") {
        return true;
      }
      return node.open === true || node.close === true;
    };
    exports2.reduce = (nodes) => nodes.reduce((acc, node) => {
      if (node.type === "text")
        acc.push(node.value);
      if (node.type === "range")
        node.type = "text";
      return acc;
    }, []);
    exports2.flatten = (...args) => {
      const result = [];
      const flat = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          let ele = arr[i];
          Array.isArray(ele) ? flat(ele) : ele !== void 0 && result.push(ele);
        }
        return result;
      };
      flat(args);
      return result;
    };
  })(utils$3);
  return utils$3;
}
var stringify$1;
var hasRequiredStringify$1;
function requireStringify$1() {
  if (hasRequiredStringify$1)
    return stringify$1;
  hasRequiredStringify$1 = 1;
  const utils2 = requireUtils$4();
  stringify$1 = (ast, options = {}) => {
    let stringify2 = (node, parent = {}) => {
      let invalidBlock = options.escapeInvalid && utils2.isInvalidBrace(parent);
      let invalidNode = node.invalid === true && options.escapeInvalid === true;
      let output2 = "";
      if (node.value) {
        if ((invalidBlock || invalidNode) && utils2.isOpenOrClose(node)) {
          return "\\" + node.value;
        }
        return node.value;
      }
      if (node.value) {
        return node.value;
      }
      if (node.nodes) {
        for (let child2 of node.nodes) {
          output2 += stringify2(child2);
        }
      }
      return output2;
    };
    return stringify2(ast);
  };
  return stringify$1;
}
/*!
 * is-number <https://github.com/jonschlinkert/is-number>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Released under the MIT License.
 */
var isNumber;
var hasRequiredIsNumber;
function requireIsNumber() {
  if (hasRequiredIsNumber)
    return isNumber;
  hasRequiredIsNumber = 1;
  isNumber = function(num) {
    if (typeof num === "number") {
      return num - num === 0;
    }
    if (typeof num === "string" && num.trim() !== "") {
      return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
    }
    return false;
  };
  return isNumber;
}
/*!
 * to-regex-range <https://github.com/micromatch/to-regex-range>
 *
 * Copyright (c) 2015-present, Jon Schlinkert.
 * Released under the MIT License.
 */
var toRegexRange_1;
var hasRequiredToRegexRange;
function requireToRegexRange() {
  if (hasRequiredToRegexRange)
    return toRegexRange_1;
  hasRequiredToRegexRange = 1;
  const isNumber2 = requireIsNumber();
  const toRegexRange = (min, max, options) => {
    if (isNumber2(min) === false) {
      throw new TypeError("toRegexRange: expected the first argument to be a number");
    }
    if (max === void 0 || min === max) {
      return String(min);
    }
    if (isNumber2(max) === false) {
      throw new TypeError("toRegexRange: expected the second argument to be a number.");
    }
    let opts = { relaxZeros: true, ...options };
    if (typeof opts.strictZeros === "boolean") {
      opts.relaxZeros = opts.strictZeros === false;
    }
    let relax = String(opts.relaxZeros);
    let shorthand = String(opts.shorthand);
    let capture = String(opts.capture);
    let wrap = String(opts.wrap);
    let cacheKey = min + ":" + max + "=" + relax + shorthand + capture + wrap;
    if (toRegexRange.cache.hasOwnProperty(cacheKey)) {
      return toRegexRange.cache[cacheKey].result;
    }
    let a = Math.min(min, max);
    let b = Math.max(min, max);
    if (Math.abs(a - b) === 1) {
      let result = min + "|" + max;
      if (opts.capture) {
        return `(${result})`;
      }
      if (opts.wrap === false) {
        return result;
      }
      return `(?:${result})`;
    }
    let isPadded = hasPadding(min) || hasPadding(max);
    let state = { min, max, a, b };
    let positives = [];
    let negatives = [];
    if (isPadded) {
      state.isPadded = isPadded;
      state.maxLen = String(state.max).length;
    }
    if (a < 0) {
      let newMin = b < 0 ? Math.abs(b) : 1;
      negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
      a = state.a = 0;
    }
    if (b >= 0) {
      positives = splitToPatterns(a, b, state, opts);
    }
    state.negatives = negatives;
    state.positives = positives;
    state.result = collatePatterns(negatives, positives);
    if (opts.capture === true) {
      state.result = `(${state.result})`;
    } else if (opts.wrap !== false && positives.length + negatives.length > 1) {
      state.result = `(?:${state.result})`;
    }
    toRegexRange.cache[cacheKey] = state;
    return state.result;
  };
  function collatePatterns(neg, pos, options) {
    let onlyNegative = filterPatterns(neg, pos, "-", false) || [];
    let onlyPositive = filterPatterns(pos, neg, "", false) || [];
    let intersected = filterPatterns(neg, pos, "-?", true) || [];
    let subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
    return subpatterns.join("|");
  }
  function splitToRanges(min, max) {
    let nines = 1;
    let zeros = 1;
    let stop = countNines(min, nines);
    let stops = /* @__PURE__ */ new Set([max]);
    while (min <= stop && stop <= max) {
      stops.add(stop);
      nines += 1;
      stop = countNines(min, nines);
    }
    stop = countZeros(max + 1, zeros) - 1;
    while (min < stop && stop <= max) {
      stops.add(stop);
      zeros += 1;
      stop = countZeros(max + 1, zeros) - 1;
    }
    stops = [...stops];
    stops.sort(compare);
    return stops;
  }
  function rangeToPattern(start, stop, options) {
    if (start === stop) {
      return { pattern: start, count: [], digits: 0 };
    }
    let zipped = zip(start, stop);
    let digits = zipped.length;
    let pattern2 = "";
    let count = 0;
    for (let i = 0; i < digits; i++) {
      let [startDigit, stopDigit] = zipped[i];
      if (startDigit === stopDigit) {
        pattern2 += startDigit;
      } else if (startDigit !== "0" || stopDigit !== "9") {
        pattern2 += toCharacterClass(startDigit, stopDigit);
      } else {
        count++;
      }
    }
    if (count) {
      pattern2 += options.shorthand === true ? "\\d" : "[0-9]";
    }
    return { pattern: pattern2, count: [count], digits };
  }
  function splitToPatterns(min, max, tok, options) {
    let ranges = splitToRanges(min, max);
    let tokens = [];
    let start = min;
    let prev;
    for (let i = 0; i < ranges.length; i++) {
      let max2 = ranges[i];
      let obj = rangeToPattern(String(start), String(max2), options);
      let zeros = "";
      if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
        if (prev.count.length > 1) {
          prev.count.pop();
        }
        prev.count.push(obj.count[0]);
        prev.string = prev.pattern + toQuantifier(prev.count);
        start = max2 + 1;
        continue;
      }
      if (tok.isPadded) {
        zeros = padZeros(max2, tok, options);
      }
      obj.string = zeros + obj.pattern + toQuantifier(obj.count);
      tokens.push(obj);
      start = max2 + 1;
      prev = obj;
    }
    return tokens;
  }
  function filterPatterns(arr, comparison, prefix, intersection, options) {
    let result = [];
    for (let ele of arr) {
      let { string: string2 } = ele;
      if (!intersection && !contains(comparison, "string", string2)) {
        result.push(prefix + string2);
      }
      if (intersection && contains(comparison, "string", string2)) {
        result.push(prefix + string2);
      }
    }
    return result;
  }
  function zip(a, b) {
    let arr = [];
    for (let i = 0; i < a.length; i++)
      arr.push([a[i], b[i]]);
    return arr;
  }
  function compare(a, b) {
    return a > b ? 1 : b > a ? -1 : 0;
  }
  function contains(arr, key, val) {
    return arr.some((ele) => ele[key] === val);
  }
  function countNines(min, len) {
    return Number(String(min).slice(0, -len) + "9".repeat(len));
  }
  function countZeros(integer, zeros) {
    return integer - integer % Math.pow(10, zeros);
  }
  function toQuantifier(digits) {
    let [start = 0, stop = ""] = digits;
    if (stop || start > 1) {
      return `{${start + (stop ? "," + stop : "")}}`;
    }
    return "";
  }
  function toCharacterClass(a, b, options) {
    return `[${a}${b - a === 1 ? "" : "-"}${b}]`;
  }
  function hasPadding(str2) {
    return /^-?(0+)\d/.test(str2);
  }
  function padZeros(value, tok, options) {
    if (!tok.isPadded) {
      return value;
    }
    let diff = Math.abs(tok.maxLen - String(value).length);
    let relax = options.relaxZeros !== false;
    switch (diff) {
      case 0:
        return "";
      case 1:
        return relax ? "0?" : "0";
      case 2:
        return relax ? "0{0,2}" : "00";
      default: {
        return relax ? `0{0,${diff}}` : `0{${diff}}`;
      }
    }
  }
  toRegexRange.cache = {};
  toRegexRange.clearCache = () => toRegexRange.cache = {};
  toRegexRange_1 = toRegexRange;
  return toRegexRange_1;
}
/*!
 * fill-range <https://github.com/jonschlinkert/fill-range>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Licensed under the MIT License.
 */
var fillRange;
var hasRequiredFillRange;
function requireFillRange() {
  if (hasRequiredFillRange)
    return fillRange;
  hasRequiredFillRange = 1;
  const util2 = require$$0$2;
  const toRegexRange = requireToRegexRange();
  const isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
  const transform = (toNumber) => {
    return (value) => toNumber === true ? Number(value) : String(value);
  };
  const isValidValue = (value) => {
    return typeof value === "number" || typeof value === "string" && value !== "";
  };
  const isNumber2 = (num) => Number.isInteger(+num);
  const zeros = (input) => {
    let value = `${input}`;
    let index = -1;
    if (value[0] === "-")
      value = value.slice(1);
    if (value === "0")
      return false;
    while (value[++index] === "0")
      ;
    return index > 0;
  };
  const stringify2 = (start, end, options) => {
    if (typeof start === "string" || typeof end === "string") {
      return true;
    }
    return options.stringify === true;
  };
  const pad = (input, maxLength, toNumber) => {
    if (maxLength > 0) {
      let dash = input[0] === "-" ? "-" : "";
      if (dash)
        input = input.slice(1);
      input = dash + input.padStart(dash ? maxLength - 1 : maxLength, "0");
    }
    if (toNumber === false) {
      return String(input);
    }
    return input;
  };
  const toMaxLen = (input, maxLength) => {
    let negative = input[0] === "-" ? "-" : "";
    if (negative) {
      input = input.slice(1);
      maxLength--;
    }
    while (input.length < maxLength)
      input = "0" + input;
    return negative ? "-" + input : input;
  };
  const toSequence = (parts, options) => {
    parts.negatives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
    parts.positives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
    let prefix = options.capture ? "" : "?:";
    let positives = "";
    let negatives = "";
    let result;
    if (parts.positives.length) {
      positives = parts.positives.join("|");
    }
    if (parts.negatives.length) {
      negatives = `-(${prefix}${parts.negatives.join("|")})`;
    }
    if (positives && negatives) {
      result = `${positives}|${negatives}`;
    } else {
      result = positives || negatives;
    }
    if (options.wrap) {
      return `(${prefix}${result})`;
    }
    return result;
  };
  const toRange = (a, b, isNumbers, options) => {
    if (isNumbers) {
      return toRegexRange(a, b, { wrap: false, ...options });
    }
    let start = String.fromCharCode(a);
    if (a === b)
      return start;
    let stop = String.fromCharCode(b);
    return `[${start}-${stop}]`;
  };
  const toRegex = (start, end, options) => {
    if (Array.isArray(start)) {
      let wrap = options.wrap === true;
      let prefix = options.capture ? "" : "?:";
      return wrap ? `(${prefix}${start.join("|")})` : start.join("|");
    }
    return toRegexRange(start, end, options);
  };
  const rangeError = (...args) => {
    return new RangeError("Invalid range arguments: " + util2.inspect(...args));
  };
  const invalidRange = (start, end, options) => {
    if (options.strictRanges === true)
      throw rangeError([start, end]);
    return [];
  };
  const invalidStep = (step, options) => {
    if (options.strictRanges === true) {
      throw new TypeError(`Expected step "${step}" to be a number`);
    }
    return [];
  };
  const fillNumbers = (start, end, step = 1, options = {}) => {
    let a = Number(start);
    let b = Number(end);
    if (!Number.isInteger(a) || !Number.isInteger(b)) {
      if (options.strictRanges === true)
        throw rangeError([start, end]);
      return [];
    }
    if (a === 0)
      a = 0;
    if (b === 0)
      b = 0;
    let descending = a > b;
    let startString = String(start);
    let endString = String(end);
    let stepString = String(step);
    step = Math.max(Math.abs(step), 1);
    let padded = zeros(startString) || zeros(endString) || zeros(stepString);
    let maxLen = padded ? Math.max(startString.length, endString.length, stepString.length) : 0;
    let toNumber = padded === false && stringify2(start, end, options) === false;
    let format = options.transform || transform(toNumber);
    if (options.toRegex && step === 1) {
      return toRange(toMaxLen(start, maxLen), toMaxLen(end, maxLen), true, options);
    }
    let parts = { negatives: [], positives: [] };
    let push = (num) => parts[num < 0 ? "negatives" : "positives"].push(Math.abs(num));
    let range = [];
    let index = 0;
    while (descending ? a >= b : a <= b) {
      if (options.toRegex === true && step > 1) {
        push(a);
      } else {
        range.push(pad(format(a, index), maxLen, toNumber));
      }
      a = descending ? a - step : a + step;
      index++;
    }
    if (options.toRegex === true) {
      return step > 1 ? toSequence(parts, options) : toRegex(range, null, { wrap: false, ...options });
    }
    return range;
  };
  const fillLetters = (start, end, step = 1, options = {}) => {
    if (!isNumber2(start) && start.length > 1 || !isNumber2(end) && end.length > 1) {
      return invalidRange(start, end, options);
    }
    let format = options.transform || ((val) => String.fromCharCode(val));
    let a = `${start}`.charCodeAt(0);
    let b = `${end}`.charCodeAt(0);
    let descending = a > b;
    let min = Math.min(a, b);
    let max = Math.max(a, b);
    if (options.toRegex && step === 1) {
      return toRange(min, max, false, options);
    }
    let range = [];
    let index = 0;
    while (descending ? a >= b : a <= b) {
      range.push(format(a, index));
      a = descending ? a - step : a + step;
      index++;
    }
    if (options.toRegex === true) {
      return toRegex(range, null, { wrap: false, options });
    }
    return range;
  };
  const fill = (start, end, step, options = {}) => {
    if (end == null && isValidValue(start)) {
      return [start];
    }
    if (!isValidValue(start) || !isValidValue(end)) {
      return invalidRange(start, end, options);
    }
    if (typeof step === "function") {
      return fill(start, end, 1, { transform: step });
    }
    if (isObject(step)) {
      return fill(start, end, 0, step);
    }
    let opts = { ...options };
    if (opts.capture === true)
      opts.wrap = true;
    step = step || opts.step || 1;
    if (!isNumber2(step)) {
      if (step != null && !isObject(step))
        return invalidStep(step, opts);
      return fill(start, end, 1, step);
    }
    if (isNumber2(start) && isNumber2(end)) {
      return fillNumbers(start, end, step, opts);
    }
    return fillLetters(start, end, Math.max(Math.abs(step), 1), opts);
  };
  fillRange = fill;
  return fillRange;
}
var compile_1;
var hasRequiredCompile;
function requireCompile() {
  if (hasRequiredCompile)
    return compile_1;
  hasRequiredCompile = 1;
  const fill = requireFillRange();
  const utils2 = requireUtils$4();
  const compile = (ast, options = {}) => {
    let walk = (node, parent = {}) => {
      let invalidBlock = utils2.isInvalidBrace(parent);
      let invalidNode = node.invalid === true && options.escapeInvalid === true;
      let invalid = invalidBlock === true || invalidNode === true;
      let prefix = options.escapeInvalid === true ? "\\" : "";
      let output2 = "";
      if (node.isOpen === true) {
        return prefix + node.value;
      }
      if (node.isClose === true) {
        return prefix + node.value;
      }
      if (node.type === "open") {
        return invalid ? prefix + node.value : "(";
      }
      if (node.type === "close") {
        return invalid ? prefix + node.value : ")";
      }
      if (node.type === "comma") {
        return node.prev.type === "comma" ? "" : invalid ? node.value : "|";
      }
      if (node.value) {
        return node.value;
      }
      if (node.nodes && node.ranges > 0) {
        let args = utils2.reduce(node.nodes);
        let range = fill(...args, { ...options, wrap: false, toRegex: true });
        if (range.length !== 0) {
          return args.length > 1 && range.length > 1 ? `(${range})` : range;
        }
      }
      if (node.nodes) {
        for (let child2 of node.nodes) {
          output2 += walk(child2, node);
        }
      }
      return output2;
    };
    return walk(ast);
  };
  compile_1 = compile;
  return compile_1;
}
var expand_1;
var hasRequiredExpand;
function requireExpand() {
  if (hasRequiredExpand)
    return expand_1;
  hasRequiredExpand = 1;
  const fill = requireFillRange();
  const stringify2 = requireStringify$1();
  const utils2 = requireUtils$4();
  const append = (queue2 = "", stash = "", enclose = false) => {
    let result = [];
    queue2 = [].concat(queue2);
    stash = [].concat(stash);
    if (!stash.length)
      return queue2;
    if (!queue2.length) {
      return enclose ? utils2.flatten(stash).map((ele) => `{${ele}}`) : stash;
    }
    for (let item of queue2) {
      if (Array.isArray(item)) {
        for (let value of item) {
          result.push(append(value, stash, enclose));
        }
      } else {
        for (let ele of stash) {
          if (enclose === true && typeof ele === "string")
            ele = `{${ele}}`;
          result.push(Array.isArray(ele) ? append(item, ele, enclose) : item + ele);
        }
      }
    }
    return utils2.flatten(result);
  };
  const expand = (ast, options = {}) => {
    let rangeLimit = options.rangeLimit === void 0 ? 1e3 : options.rangeLimit;
    let walk = (node, parent = {}) => {
      node.queue = [];
      let p = parent;
      let q = parent.queue;
      while (p.type !== "brace" && p.type !== "root" && p.parent) {
        p = p.parent;
        q = p.queue;
      }
      if (node.invalid || node.dollar) {
        q.push(append(q.pop(), stringify2(node, options)));
        return;
      }
      if (node.type === "brace" && node.invalid !== true && node.nodes.length === 2) {
        q.push(append(q.pop(), ["{}"]));
        return;
      }
      if (node.nodes && node.ranges > 0) {
        let args = utils2.reduce(node.nodes);
        if (utils2.exceedsLimit(...args, options.step, rangeLimit)) {
          throw new RangeError("expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.");
        }
        let range = fill(...args, options);
        if (range.length === 0) {
          range = stringify2(node, options);
        }
        q.push(append(q.pop(), range));
        node.nodes = [];
        return;
      }
      let enclose = utils2.encloseBrace(node);
      let queue2 = node.queue;
      let block = node;
      while (block.type !== "brace" && block.type !== "root" && block.parent) {
        block = block.parent;
        queue2 = block.queue;
      }
      for (let i = 0; i < node.nodes.length; i++) {
        let child2 = node.nodes[i];
        if (child2.type === "comma" && node.type === "brace") {
          if (i === 1)
            queue2.push("");
          queue2.push("");
          continue;
        }
        if (child2.type === "close") {
          q.push(append(q.pop(), queue2, enclose));
          continue;
        }
        if (child2.value && child2.type !== "open") {
          queue2.push(append(queue2.pop(), child2.value));
          continue;
        }
        if (child2.nodes) {
          walk(child2, node);
        }
      }
      return queue2;
    };
    return utils2.flatten(walk(ast));
  };
  expand_1 = expand;
  return expand_1;
}
var constants$2;
var hasRequiredConstants$2;
function requireConstants$2() {
  if (hasRequiredConstants$2)
    return constants$2;
  hasRequiredConstants$2 = 1;
  constants$2 = {
    MAX_LENGTH: 1024 * 64,
    // Digits
    CHAR_0: "0",
    /* 0 */
    CHAR_9: "9",
    /* 9 */
    // Alphabet chars.
    CHAR_UPPERCASE_A: "A",
    /* A */
    CHAR_LOWERCASE_A: "a",
    /* a */
    CHAR_UPPERCASE_Z: "Z",
    /* Z */
    CHAR_LOWERCASE_Z: "z",
    /* z */
    CHAR_LEFT_PARENTHESES: "(",
    /* ( */
    CHAR_RIGHT_PARENTHESES: ")",
    /* ) */
    CHAR_ASTERISK: "*",
    /* * */
    // Non-alphabetic chars.
    CHAR_AMPERSAND: "&",
    /* & */
    CHAR_AT: "@",
    /* @ */
    CHAR_BACKSLASH: "\\",
    /* \ */
    CHAR_BACKTICK: "`",
    /* ` */
    CHAR_CARRIAGE_RETURN: "\r",
    /* \r */
    CHAR_CIRCUMFLEX_ACCENT: "^",
    /* ^ */
    CHAR_COLON: ":",
    /* : */
    CHAR_COMMA: ",",
    /* , */
    CHAR_DOLLAR: "$",
    /* . */
    CHAR_DOT: ".",
    /* . */
    CHAR_DOUBLE_QUOTE: '"',
    /* " */
    CHAR_EQUAL: "=",
    /* = */
    CHAR_EXCLAMATION_MARK: "!",
    /* ! */
    CHAR_FORM_FEED: "\f",
    /* \f */
    CHAR_FORWARD_SLASH: "/",
    /* / */
    CHAR_HASH: "#",
    /* # */
    CHAR_HYPHEN_MINUS: "-",
    /* - */
    CHAR_LEFT_ANGLE_BRACKET: "<",
    /* < */
    CHAR_LEFT_CURLY_BRACE: "{",
    /* { */
    CHAR_LEFT_SQUARE_BRACKET: "[",
    /* [ */
    CHAR_LINE_FEED: "\n",
    /* \n */
    CHAR_NO_BREAK_SPACE: " ",
    /* \u00A0 */
    CHAR_PERCENT: "%",
    /* % */
    CHAR_PLUS: "+",
    /* + */
    CHAR_QUESTION_MARK: "?",
    /* ? */
    CHAR_RIGHT_ANGLE_BRACKET: ">",
    /* > */
    CHAR_RIGHT_CURLY_BRACE: "}",
    /* } */
    CHAR_RIGHT_SQUARE_BRACKET: "]",
    /* ] */
    CHAR_SEMICOLON: ";",
    /* ; */
    CHAR_SINGLE_QUOTE: "'",
    /* ' */
    CHAR_SPACE: " ",
    /*   */
    CHAR_TAB: "	",
    /* \t */
    CHAR_UNDERSCORE: "_",
    /* _ */
    CHAR_VERTICAL_LINE: "|",
    /* | */
    CHAR_ZERO_WIDTH_NOBREAK_SPACE: "\uFEFF"
    /* \uFEFF */
  };
  return constants$2;
}
var parse_1$1;
var hasRequiredParse$2;
function requireParse$2() {
  if (hasRequiredParse$2)
    return parse_1$1;
  hasRequiredParse$2 = 1;
  const stringify2 = requireStringify$1();
  const {
    MAX_LENGTH,
    CHAR_BACKSLASH,
    /* \ */
    CHAR_BACKTICK,
    /* ` */
    CHAR_COMMA,
    /* , */
    CHAR_DOT,
    /* . */
    CHAR_LEFT_PARENTHESES,
    /* ( */
    CHAR_RIGHT_PARENTHESES,
    /* ) */
    CHAR_LEFT_CURLY_BRACE,
    /* { */
    CHAR_RIGHT_CURLY_BRACE,
    /* } */
    CHAR_LEFT_SQUARE_BRACKET,
    /* [ */
    CHAR_RIGHT_SQUARE_BRACKET,
    /* ] */
    CHAR_DOUBLE_QUOTE,
    /* " */
    CHAR_SINGLE_QUOTE,
    /* ' */
    CHAR_NO_BREAK_SPACE,
    CHAR_ZERO_WIDTH_NOBREAK_SPACE
  } = requireConstants$2();
  const parse2 = (input, options = {}) => {
    if (typeof input !== "string") {
      throw new TypeError("Expected a string");
    }
    let opts = options || {};
    let max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
    if (input.length > max) {
      throw new SyntaxError(`Input length (${input.length}), exceeds max characters (${max})`);
    }
    let ast = { type: "root", input, nodes: [] };
    let stack = [ast];
    let block = ast;
    let prev = ast;
    let brackets = 0;
    let length = input.length;
    let index = 0;
    let depth = 0;
    let value;
    const advance = () => input[index++];
    const push = (node) => {
      if (node.type === "text" && prev.type === "dot") {
        prev.type = "text";
      }
      if (prev && prev.type === "text" && node.type === "text") {
        prev.value += node.value;
        return;
      }
      block.nodes.push(node);
      node.parent = block;
      node.prev = prev;
      prev = node;
      return node;
    };
    push({ type: "bos" });
    while (index < length) {
      block = stack[stack.length - 1];
      value = advance();
      if (value === CHAR_ZERO_WIDTH_NOBREAK_SPACE || value === CHAR_NO_BREAK_SPACE) {
        continue;
      }
      if (value === CHAR_BACKSLASH) {
        push({ type: "text", value: (options.keepEscaping ? value : "") + advance() });
        continue;
      }
      if (value === CHAR_RIGHT_SQUARE_BRACKET) {
        push({ type: "text", value: "\\" + value });
        continue;
      }
      if (value === CHAR_LEFT_SQUARE_BRACKET) {
        brackets++;
        let next;
        while (index < length && (next = advance())) {
          value += next;
          if (next === CHAR_LEFT_SQUARE_BRACKET) {
            brackets++;
            continue;
          }
          if (next === CHAR_BACKSLASH) {
            value += advance();
            continue;
          }
          if (next === CHAR_RIGHT_SQUARE_BRACKET) {
            brackets--;
            if (brackets === 0) {
              break;
            }
          }
        }
        push({ type: "text", value });
        continue;
      }
      if (value === CHAR_LEFT_PARENTHESES) {
        block = push({ type: "paren", nodes: [] });
        stack.push(block);
        push({ type: "text", value });
        continue;
      }
      if (value === CHAR_RIGHT_PARENTHESES) {
        if (block.type !== "paren") {
          push({ type: "text", value });
          continue;
        }
        block = stack.pop();
        push({ type: "text", value });
        block = stack[stack.length - 1];
        continue;
      }
      if (value === CHAR_DOUBLE_QUOTE || value === CHAR_SINGLE_QUOTE || value === CHAR_BACKTICK) {
        let open = value;
        let next;
        if (options.keepQuotes !== true) {
          value = "";
        }
        while (index < length && (next = advance())) {
          if (next === CHAR_BACKSLASH) {
            value += next + advance();
            continue;
          }
          if (next === open) {
            if (options.keepQuotes === true)
              value += next;
            break;
          }
          value += next;
        }
        push({ type: "text", value });
        continue;
      }
      if (value === CHAR_LEFT_CURLY_BRACE) {
        depth++;
        let dollar = prev.value && prev.value.slice(-1) === "$" || block.dollar === true;
        let brace = {
          type: "brace",
          open: true,
          close: false,
          dollar,
          depth,
          commas: 0,
          ranges: 0,
          nodes: []
        };
        block = push(brace);
        stack.push(block);
        push({ type: "open", value });
        continue;
      }
      if (value === CHAR_RIGHT_CURLY_BRACE) {
        if (block.type !== "brace") {
          push({ type: "text", value });
          continue;
        }
        let type2 = "close";
        block = stack.pop();
        block.close = true;
        push({ type: type2, value });
        depth--;
        block = stack[stack.length - 1];
        continue;
      }
      if (value === CHAR_COMMA && depth > 0) {
        if (block.ranges > 0) {
          block.ranges = 0;
          let open = block.nodes.shift();
          block.nodes = [open, { type: "text", value: stringify2(block) }];
        }
        push({ type: "comma", value });
        block.commas++;
        continue;
      }
      if (value === CHAR_DOT && depth > 0 && block.commas === 0) {
        let siblings = block.nodes;
        if (depth === 0 || siblings.length === 0) {
          push({ type: "text", value });
          continue;
        }
        if (prev.type === "dot") {
          block.range = [];
          prev.value += value;
          prev.type = "range";
          if (block.nodes.length !== 3 && block.nodes.length !== 5) {
            block.invalid = true;
            block.ranges = 0;
            prev.type = "text";
            continue;
          }
          block.ranges++;
          block.args = [];
          continue;
        }
        if (prev.type === "range") {
          siblings.pop();
          let before = siblings[siblings.length - 1];
          before.value += prev.value + value;
          prev = before;
          block.ranges--;
          continue;
        }
        push({ type: "dot", value });
        continue;
      }
      push({ type: "text", value });
    }
    do {
      block = stack.pop();
      if (block.type !== "root") {
        block.nodes.forEach((node) => {
          if (!node.nodes) {
            if (node.type === "open")
              node.isOpen = true;
            if (node.type === "close")
              node.isClose = true;
            if (!node.nodes)
              node.type = "text";
            node.invalid = true;
          }
        });
        let parent = stack[stack.length - 1];
        let index2 = parent.nodes.indexOf(block);
        parent.nodes.splice(index2, 1, ...block.nodes);
      }
    } while (stack.length > 0);
    push({ type: "eos" });
    return ast;
  };
  parse_1$1 = parse2;
  return parse_1$1;
}
var braces_1;
var hasRequiredBraces;
function requireBraces() {
  if (hasRequiredBraces)
    return braces_1;
  hasRequiredBraces = 1;
  const stringify2 = requireStringify$1();
  const compile = requireCompile();
  const expand = requireExpand();
  const parse2 = requireParse$2();
  const braces = (input, options = {}) => {
    let output2 = [];
    if (Array.isArray(input)) {
      for (let pattern2 of input) {
        let result = braces.create(pattern2, options);
        if (Array.isArray(result)) {
          output2.push(...result);
        } else {
          output2.push(result);
        }
      }
    } else {
      output2 = [].concat(braces.create(input, options));
    }
    if (options && options.expand === true && options.nodupes === true) {
      output2 = [...new Set(output2)];
    }
    return output2;
  };
  braces.parse = (input, options = {}) => parse2(input, options);
  braces.stringify = (input, options = {}) => {
    if (typeof input === "string") {
      return stringify2(braces.parse(input, options), options);
    }
    return stringify2(input, options);
  };
  braces.compile = (input, options = {}) => {
    if (typeof input === "string") {
      input = braces.parse(input, options);
    }
    return compile(input, options);
  };
  braces.expand = (input, options = {}) => {
    if (typeof input === "string") {
      input = braces.parse(input, options);
    }
    let result = expand(input, options);
    if (options.noempty === true) {
      result = result.filter(Boolean);
    }
    if (options.nodupes === true) {
      result = [...new Set(result)];
    }
    return result;
  };
  braces.create = (input, options = {}) => {
    if (input === "" || input.length < 3) {
      return [input];
    }
    return options.expand !== true ? braces.compile(input, options) : braces.expand(input, options);
  };
  braces_1 = braces;
  return braces_1;
}
var utils$2 = {};
var constants$1;
var hasRequiredConstants$1;
function requireConstants$1() {
  if (hasRequiredConstants$1)
    return constants$1;
  hasRequiredConstants$1 = 1;
  const path2 = require$$0$3;
  const WIN_SLASH = "\\\\/";
  const WIN_NO_SLASH = `[^${WIN_SLASH}]`;
  const DOT_LITERAL = "\\.";
  const PLUS_LITERAL = "\\+";
  const QMARK_LITERAL = "\\?";
  const SLASH_LITERAL = "\\/";
  const ONE_CHAR = "(?=.)";
  const QMARK = "[^/]";
  const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
  const START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
  const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
  const NO_DOT = `(?!${DOT_LITERAL})`;
  const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
  const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
  const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
  const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
  const STAR = `${QMARK}*?`;
  const POSIX_CHARS = {
    DOT_LITERAL,
    PLUS_LITERAL,
    QMARK_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    QMARK,
    END_ANCHOR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOTS,
    NO_DOT_SLASH,
    NO_DOTS_SLASH,
    QMARK_NO_DOT,
    STAR,
    START_ANCHOR
  };
  const WINDOWS_CHARS = {
    ...POSIX_CHARS,
    SLASH_LITERAL: `[${WIN_SLASH}]`,
    QMARK: WIN_NO_SLASH,
    STAR: `${WIN_NO_SLASH}*?`,
    DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
    NO_DOT: `(?!${DOT_LITERAL})`,
    NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
    NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
    NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
    QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
    START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
    END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
  };
  const POSIX_REGEX_SOURCE = {
    alnum: "a-zA-Z0-9",
    alpha: "a-zA-Z",
    ascii: "\\x00-\\x7F",
    blank: " \\t",
    cntrl: "\\x00-\\x1F\\x7F",
    digit: "0-9",
    graph: "\\x21-\\x7E",
    lower: "a-z",
    print: "\\x20-\\x7E ",
    punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
    space: " \\t\\r\\n\\v\\f",
    upper: "A-Z",
    word: "A-Za-z0-9_",
    xdigit: "A-Fa-f0-9"
  };
  constants$1 = {
    MAX_LENGTH: 1024 * 64,
    POSIX_REGEX_SOURCE,
    // regular expressions
    REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
    REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
    REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
    REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
    REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
    REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
    // Replace globs with equivalent patterns to reduce parsing time.
    REPLACEMENTS: {
      "***": "*",
      "**/**": "**",
      "**/**/**": "**"
    },
    // Digits
    CHAR_0: 48,
    /* 0 */
    CHAR_9: 57,
    /* 9 */
    // Alphabet chars.
    CHAR_UPPERCASE_A: 65,
    /* A */
    CHAR_LOWERCASE_A: 97,
    /* a */
    CHAR_UPPERCASE_Z: 90,
    /* Z */
    CHAR_LOWERCASE_Z: 122,
    /* z */
    CHAR_LEFT_PARENTHESES: 40,
    /* ( */
    CHAR_RIGHT_PARENTHESES: 41,
    /* ) */
    CHAR_ASTERISK: 42,
    /* * */
    // Non-alphabetic chars.
    CHAR_AMPERSAND: 38,
    /* & */
    CHAR_AT: 64,
    /* @ */
    CHAR_BACKWARD_SLASH: 92,
    /* \ */
    CHAR_CARRIAGE_RETURN: 13,
    /* \r */
    CHAR_CIRCUMFLEX_ACCENT: 94,
    /* ^ */
    CHAR_COLON: 58,
    /* : */
    CHAR_COMMA: 44,
    /* , */
    CHAR_DOT: 46,
    /* . */
    CHAR_DOUBLE_QUOTE: 34,
    /* " */
    CHAR_EQUAL: 61,
    /* = */
    CHAR_EXCLAMATION_MARK: 33,
    /* ! */
    CHAR_FORM_FEED: 12,
    /* \f */
    CHAR_FORWARD_SLASH: 47,
    /* / */
    CHAR_GRAVE_ACCENT: 96,
    /* ` */
    CHAR_HASH: 35,
    /* # */
    CHAR_HYPHEN_MINUS: 45,
    /* - */
    CHAR_LEFT_ANGLE_BRACKET: 60,
    /* < */
    CHAR_LEFT_CURLY_BRACE: 123,
    /* { */
    CHAR_LEFT_SQUARE_BRACKET: 91,
    /* [ */
    CHAR_LINE_FEED: 10,
    /* \n */
    CHAR_NO_BREAK_SPACE: 160,
    /* \u00A0 */
    CHAR_PERCENT: 37,
    /* % */
    CHAR_PLUS: 43,
    /* + */
    CHAR_QUESTION_MARK: 63,
    /* ? */
    CHAR_RIGHT_ANGLE_BRACKET: 62,
    /* > */
    CHAR_RIGHT_CURLY_BRACE: 125,
    /* } */
    CHAR_RIGHT_SQUARE_BRACKET: 93,
    /* ] */
    CHAR_SEMICOLON: 59,
    /* ; */
    CHAR_SINGLE_QUOTE: 39,
    /* ' */
    CHAR_SPACE: 32,
    /*   */
    CHAR_TAB: 9,
    /* \t */
    CHAR_UNDERSCORE: 95,
    /* _ */
    CHAR_VERTICAL_LINE: 124,
    /* | */
    CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
    /* \uFEFF */
    SEP: path2.sep,
    /**
     * Create EXTGLOB_CHARS
     */
    extglobChars(chars) {
      return {
        "!": { type: "negate", open: "(?:(?!(?:", close: `))${chars.STAR})` },
        "?": { type: "qmark", open: "(?:", close: ")?" },
        "+": { type: "plus", open: "(?:", close: ")+" },
        "*": { type: "star", open: "(?:", close: ")*" },
        "@": { type: "at", open: "(?:", close: ")" }
      };
    },
    /**
     * Create GLOB_CHARS
     */
    globChars(win322) {
      return win322 === true ? WINDOWS_CHARS : POSIX_CHARS;
    }
  };
  return constants$1;
}
var hasRequiredUtils$3;
function requireUtils$3() {
  if (hasRequiredUtils$3)
    return utils$2;
  hasRequiredUtils$3 = 1;
  (function(exports2) {
    const path2 = require$$0$3;
    const win322 = process.platform === "win32";
    const {
      REGEX_BACKSLASH,
      REGEX_REMOVE_BACKSLASH,
      REGEX_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_GLOBAL
    } = requireConstants$1();
    exports2.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    exports2.hasRegexChars = (str2) => REGEX_SPECIAL_CHARS.test(str2);
    exports2.isRegexChar = (str2) => str2.length === 1 && exports2.hasRegexChars(str2);
    exports2.escapeRegex = (str2) => str2.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
    exports2.toPosixSlashes = (str2) => str2.replace(REGEX_BACKSLASH, "/");
    exports2.removeBackslashes = (str2) => {
      return str2.replace(REGEX_REMOVE_BACKSLASH, (match) => {
        return match === "\\" ? "" : match;
      });
    };
    exports2.supportsLookbehinds = () => {
      const segs = process.version.slice(1).split(".").map(Number);
      if (segs.length === 3 && segs[0] >= 9 || segs[0] === 8 && segs[1] >= 10) {
        return true;
      }
      return false;
    };
    exports2.isWindows = (options) => {
      if (options && typeof options.windows === "boolean") {
        return options.windows;
      }
      return win322 === true || path2.sep === "\\";
    };
    exports2.escapeLast = (input, char, lastIdx) => {
      const idx = input.lastIndexOf(char, lastIdx);
      if (idx === -1)
        return input;
      if (input[idx - 1] === "\\")
        return exports2.escapeLast(input, char, idx - 1);
      return `${input.slice(0, idx)}\\${input.slice(idx)}`;
    };
    exports2.removePrefix = (input, state = {}) => {
      let output2 = input;
      if (output2.startsWith("./")) {
        output2 = output2.slice(2);
        state.prefix = "./";
      }
      return output2;
    };
    exports2.wrapOutput = (input, state = {}, options = {}) => {
      const prepend = options.contains ? "" : "^";
      const append = options.contains ? "" : "$";
      let output2 = `${prepend}(?:${input})${append}`;
      if (state.negated === true) {
        output2 = `(?:^(?!${output2}).*$)`;
      }
      return output2;
    };
  })(utils$2);
  return utils$2;
}
var scan_1;
var hasRequiredScan;
function requireScan() {
  if (hasRequiredScan)
    return scan_1;
  hasRequiredScan = 1;
  const utils2 = requireUtils$3();
  const {
    CHAR_ASTERISK,
    /* * */
    CHAR_AT,
    /* @ */
    CHAR_BACKWARD_SLASH,
    /* \ */
    CHAR_COMMA,
    /* , */
    CHAR_DOT,
    /* . */
    CHAR_EXCLAMATION_MARK,
    /* ! */
    CHAR_FORWARD_SLASH,
    /* / */
    CHAR_LEFT_CURLY_BRACE,
    /* { */
    CHAR_LEFT_PARENTHESES,
    /* ( */
    CHAR_LEFT_SQUARE_BRACKET,
    /* [ */
    CHAR_PLUS,
    /* + */
    CHAR_QUESTION_MARK,
    /* ? */
    CHAR_RIGHT_CURLY_BRACE,
    /* } */
    CHAR_RIGHT_PARENTHESES,
    /* ) */
    CHAR_RIGHT_SQUARE_BRACKET
    /* ] */
  } = requireConstants$1();
  const isPathSeparator = (code) => {
    return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
  };
  const depth = (token) => {
    if (token.isPrefix !== true) {
      token.depth = token.isGlobstar ? Infinity : 1;
    }
  };
  const scan = (input, options) => {
    const opts = options || {};
    const length = input.length - 1;
    const scanToEnd = opts.parts === true || opts.scanToEnd === true;
    const slashes = [];
    const tokens = [];
    const parts = [];
    let str2 = input;
    let index = -1;
    let start = 0;
    let lastIndex = 0;
    let isBrace = false;
    let isBracket = false;
    let isGlob2 = false;
    let isExtglob2 = false;
    let isGlobstar = false;
    let braceEscaped = false;
    let backslashes = false;
    let negated = false;
    let negatedExtglob = false;
    let finished = false;
    let braces = 0;
    let prev;
    let code;
    let token = { value: "", depth: 0, isGlob: false };
    const eos = () => index >= length;
    const peek = () => str2.charCodeAt(index + 1);
    const advance = () => {
      prev = code;
      return str2.charCodeAt(++index);
    };
    while (index < length) {
      code = advance();
      let next;
      if (code === CHAR_BACKWARD_SLASH) {
        backslashes = token.backslashes = true;
        code = advance();
        if (code === CHAR_LEFT_CURLY_BRACE) {
          braceEscaped = true;
        }
        continue;
      }
      if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
        braces++;
        while (eos() !== true && (code = advance())) {
          if (code === CHAR_BACKWARD_SLASH) {
            backslashes = token.backslashes = true;
            advance();
            continue;
          }
          if (code === CHAR_LEFT_CURLY_BRACE) {
            braces++;
            continue;
          }
          if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
            isBrace = token.isBrace = true;
            isGlob2 = token.isGlob = true;
            finished = true;
            if (scanToEnd === true) {
              continue;
            }
            break;
          }
          if (braceEscaped !== true && code === CHAR_COMMA) {
            isBrace = token.isBrace = true;
            isGlob2 = token.isGlob = true;
            finished = true;
            if (scanToEnd === true) {
              continue;
            }
            break;
          }
          if (code === CHAR_RIGHT_CURLY_BRACE) {
            braces--;
            if (braces === 0) {
              braceEscaped = false;
              isBrace = token.isBrace = true;
              finished = true;
              break;
            }
          }
        }
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
      if (code === CHAR_FORWARD_SLASH) {
        slashes.push(index);
        tokens.push(token);
        token = { value: "", depth: 0, isGlob: false };
        if (finished === true)
          continue;
        if (prev === CHAR_DOT && index === start + 1) {
          start += 2;
          continue;
        }
        lastIndex = index + 1;
        continue;
      }
      if (opts.noext !== true) {
        const isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
        if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
          isGlob2 = token.isGlob = true;
          isExtglob2 = token.isExtglob = true;
          finished = true;
          if (code === CHAR_EXCLAMATION_MARK && index === start) {
            negatedExtglob = true;
          }
          if (scanToEnd === true) {
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_BACKWARD_SLASH) {
                backslashes = token.backslashes = true;
                code = advance();
                continue;
              }
              if (code === CHAR_RIGHT_PARENTHESES) {
                isGlob2 = token.isGlob = true;
                finished = true;
                break;
              }
            }
            continue;
          }
          break;
        }
      }
      if (code === CHAR_ASTERISK) {
        if (prev === CHAR_ASTERISK)
          isGlobstar = token.isGlobstar = true;
        isGlob2 = token.isGlob = true;
        finished = true;
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
      if (code === CHAR_QUESTION_MARK) {
        isGlob2 = token.isGlob = true;
        finished = true;
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
      if (code === CHAR_LEFT_SQUARE_BRACKET) {
        while (eos() !== true && (next = advance())) {
          if (next === CHAR_BACKWARD_SLASH) {
            backslashes = token.backslashes = true;
            advance();
            continue;
          }
          if (next === CHAR_RIGHT_SQUARE_BRACKET) {
            isBracket = token.isBracket = true;
            isGlob2 = token.isGlob = true;
            finished = true;
            break;
          }
        }
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
      if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
        negated = token.negated = true;
        start++;
        continue;
      }
      if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
        isGlob2 = token.isGlob = true;
        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_LEFT_PARENTHESES) {
              backslashes = token.backslashes = true;
              code = advance();
              continue;
            }
            if (code === CHAR_RIGHT_PARENTHESES) {
              finished = true;
              break;
            }
          }
          continue;
        }
        break;
      }
      if (isGlob2 === true) {
        finished = true;
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
    }
    if (opts.noext === true) {
      isExtglob2 = false;
      isGlob2 = false;
    }
    let base = str2;
    let prefix = "";
    let glob = "";
    if (start > 0) {
      prefix = str2.slice(0, start);
      str2 = str2.slice(start);
      lastIndex -= start;
    }
    if (base && isGlob2 === true && lastIndex > 0) {
      base = str2.slice(0, lastIndex);
      glob = str2.slice(lastIndex);
    } else if (isGlob2 === true) {
      base = "";
      glob = str2;
    } else {
      base = str2;
    }
    if (base && base !== "" && base !== "/" && base !== str2) {
      if (isPathSeparator(base.charCodeAt(base.length - 1))) {
        base = base.slice(0, -1);
      }
    }
    if (opts.unescape === true) {
      if (glob)
        glob = utils2.removeBackslashes(glob);
      if (base && backslashes === true) {
        base = utils2.removeBackslashes(base);
      }
    }
    const state = {
      prefix,
      input,
      start,
      base,
      glob,
      isBrace,
      isBracket,
      isGlob: isGlob2,
      isExtglob: isExtglob2,
      isGlobstar,
      negated,
      negatedExtglob
    };
    if (opts.tokens === true) {
      state.maxDepth = 0;
      if (!isPathSeparator(code)) {
        tokens.push(token);
      }
      state.tokens = tokens;
    }
    if (opts.parts === true || opts.tokens === true) {
      let prevIndex;
      for (let idx = 0; idx < slashes.length; idx++) {
        const n = prevIndex ? prevIndex + 1 : start;
        const i = slashes[idx];
        const value = input.slice(n, i);
        if (opts.tokens) {
          if (idx === 0 && start !== 0) {
            tokens[idx].isPrefix = true;
            tokens[idx].value = prefix;
          } else {
            tokens[idx].value = value;
          }
          depth(tokens[idx]);
          state.maxDepth += tokens[idx].depth;
        }
        if (idx !== 0 || value !== "") {
          parts.push(value);
        }
        prevIndex = i;
      }
      if (prevIndex && prevIndex + 1 < input.length) {
        const value = input.slice(prevIndex + 1);
        parts.push(value);
        if (opts.tokens) {
          tokens[tokens.length - 1].value = value;
          depth(tokens[tokens.length - 1]);
          state.maxDepth += tokens[tokens.length - 1].depth;
        }
      }
      state.slashes = slashes;
      state.parts = parts;
    }
    return state;
  };
  scan_1 = scan;
  return scan_1;
}
var parse_1;
var hasRequiredParse$1;
function requireParse$1() {
  if (hasRequiredParse$1)
    return parse_1;
  hasRequiredParse$1 = 1;
  const constants2 = requireConstants$1();
  const utils2 = requireUtils$3();
  const {
    MAX_LENGTH,
    POSIX_REGEX_SOURCE,
    REGEX_NON_SPECIAL_CHARS,
    REGEX_SPECIAL_CHARS_BACKREF,
    REPLACEMENTS
  } = constants2;
  const expandRange = (args, options) => {
    if (typeof options.expandRange === "function") {
      return options.expandRange(...args, options);
    }
    args.sort();
    const value = `[${args.join("-")}]`;
    try {
      new RegExp(value);
    } catch (ex) {
      return args.map((v) => utils2.escapeRegex(v)).join("..");
    }
    return value;
  };
  const syntaxError = (type2, char) => {
    return `Missing ${type2}: "${char}" - use "\\\\${char}" to match literal characters`;
  };
  const parse2 = (input, options) => {
    if (typeof input !== "string") {
      throw new TypeError("Expected a string");
    }
    input = REPLACEMENTS[input] || input;
    const opts = { ...options };
    const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
    let len = input.length;
    if (len > max) {
      throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
    }
    const bos = { type: "bos", value: "", output: opts.prepend || "" };
    const tokens = [bos];
    const capture = opts.capture ? "" : "?:";
    const win322 = utils2.isWindows(options);
    const PLATFORM_CHARS = constants2.globChars(win322);
    const EXTGLOB_CHARS = constants2.extglobChars(PLATFORM_CHARS);
    const {
      DOT_LITERAL,
      PLUS_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOT_SLASH,
      NO_DOTS_SLASH,
      QMARK,
      QMARK_NO_DOT,
      STAR,
      START_ANCHOR
    } = PLATFORM_CHARS;
    const globstar = (opts2) => {
      return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
    };
    const nodot = opts.dot ? "" : NO_DOT;
    const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
    let star = opts.bash === true ? globstar(opts) : STAR;
    if (opts.capture) {
      star = `(${star})`;
    }
    if (typeof opts.noext === "boolean") {
      opts.noextglob = opts.noext;
    }
    const state = {
      input,
      index: -1,
      start: 0,
      dot: opts.dot === true,
      consumed: "",
      output: "",
      prefix: "",
      backtrack: false,
      negated: false,
      brackets: 0,
      braces: 0,
      parens: 0,
      quotes: 0,
      globstar: false,
      tokens
    };
    input = utils2.removePrefix(input, state);
    len = input.length;
    const extglobs = [];
    const braces = [];
    const stack = [];
    let prev = bos;
    let value;
    const eos = () => state.index === len - 1;
    const peek = state.peek = (n = 1) => input[state.index + n];
    const advance = state.advance = () => input[++state.index] || "";
    const remaining = () => input.slice(state.index + 1);
    const consume = (value2 = "", num = 0) => {
      state.consumed += value2;
      state.index += num;
    };
    const append = (token) => {
      state.output += token.output != null ? token.output : token.value;
      consume(token.value);
    };
    const negate = () => {
      let count = 1;
      while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
        advance();
        state.start++;
        count++;
      }
      if (count % 2 === 0) {
        return false;
      }
      state.negated = true;
      state.start++;
      return true;
    };
    const increment = (type2) => {
      state[type2]++;
      stack.push(type2);
    };
    const decrement = (type2) => {
      state[type2]--;
      stack.pop();
    };
    const push = (tok) => {
      if (prev.type === "globstar") {
        const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
        const isExtglob2 = tok.extglob === true || extglobs.length && (tok.type === "pipe" || tok.type === "paren");
        if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob2) {
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = "star";
          prev.value = "*";
          prev.output = star;
          state.output += prev.output;
        }
      }
      if (extglobs.length && tok.type !== "paren") {
        extglobs[extglobs.length - 1].inner += tok.value;
      }
      if (tok.value || tok.output)
        append(tok);
      if (prev && prev.type === "text" && tok.type === "text") {
        prev.value += tok.value;
        prev.output = (prev.output || "") + tok.value;
        return;
      }
      tok.prev = prev;
      tokens.push(tok);
      prev = tok;
    };
    const extglobOpen = (type2, value2) => {
      const token = { ...EXTGLOB_CHARS[value2], conditions: 1, inner: "" };
      token.prev = prev;
      token.parens = state.parens;
      token.output = state.output;
      const output2 = (opts.capture ? "(" : "") + token.open;
      increment("parens");
      push({ type: type2, value: value2, output: state.output ? "" : ONE_CHAR });
      push({ type: "paren", extglob: true, value: advance(), output: output2 });
      extglobs.push(token);
    };
    const extglobClose = (token) => {
      let output2 = token.close + (opts.capture ? ")" : "");
      let rest;
      if (token.type === "negate") {
        let extglobStar = star;
        if (token.inner && token.inner.length > 1 && token.inner.includes("/")) {
          extglobStar = globstar(opts);
        }
        if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
          output2 = token.close = `)$))${extglobStar}`;
        }
        if (token.inner.includes("*") && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
          const expression = parse2(rest, { ...options, fastpaths: false }).output;
          output2 = token.close = `)${expression})${extglobStar})`;
        }
        if (token.prev.type === "bos") {
          state.negatedExtglob = true;
        }
      }
      push({ type: "paren", extglob: true, value, output: output2 });
      decrement("parens");
    };
    if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
      let backslashes = false;
      let output2 = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
        if (first === "\\") {
          backslashes = true;
          return m;
        }
        if (first === "?") {
          if (esc) {
            return esc + first + (rest ? QMARK.repeat(rest.length) : "");
          }
          if (index === 0) {
            return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : "");
          }
          return QMARK.repeat(chars.length);
        }
        if (first === ".") {
          return DOT_LITERAL.repeat(chars.length);
        }
        if (first === "*") {
          if (esc) {
            return esc + first + (rest ? star : "");
          }
          return star;
        }
        return esc ? m : `\\${m}`;
      });
      if (backslashes === true) {
        if (opts.unescape === true) {
          output2 = output2.replace(/\\/g, "");
        } else {
          output2 = output2.replace(/\\+/g, (m) => {
            return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
          });
        }
      }
      if (output2 === input && opts.contains === true) {
        state.output = input;
        return state;
      }
      state.output = utils2.wrapOutput(output2, state, options);
      return state;
    }
    while (!eos()) {
      value = advance();
      if (value === "\0") {
        continue;
      }
      if (value === "\\") {
        const next = peek();
        if (next === "/" && opts.bash !== true) {
          continue;
        }
        if (next === "." || next === ";") {
          continue;
        }
        if (!next) {
          value += "\\";
          push({ type: "text", value });
          continue;
        }
        const match = /^\\+/.exec(remaining());
        let slashes = 0;
        if (match && match[0].length > 2) {
          slashes = match[0].length;
          state.index += slashes;
          if (slashes % 2 !== 0) {
            value += "\\";
          }
        }
        if (opts.unescape === true) {
          value = advance();
        } else {
          value += advance();
        }
        if (state.brackets === 0) {
          push({ type: "text", value });
          continue;
        }
      }
      if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
        if (opts.posix !== false && value === ":") {
          const inner = prev.value.slice(1);
          if (inner.includes("[")) {
            prev.posix = true;
            if (inner.includes(":")) {
              const idx = prev.value.lastIndexOf("[");
              const pre = prev.value.slice(0, idx);
              const rest2 = prev.value.slice(idx + 2);
              const posix = POSIX_REGEX_SOURCE[rest2];
              if (posix) {
                prev.value = pre + posix;
                state.backtrack = true;
                advance();
                if (!bos.output && tokens.indexOf(prev) === 1) {
                  bos.output = ONE_CHAR;
                }
                continue;
              }
            }
          }
        }
        if (value === "[" && peek() !== ":" || value === "-" && peek() === "]") {
          value = `\\${value}`;
        }
        if (value === "]" && (prev.value === "[" || prev.value === "[^")) {
          value = `\\${value}`;
        }
        if (opts.posix === true && value === "!" && prev.value === "[") {
          value = "^";
        }
        prev.value += value;
        append({ value });
        continue;
      }
      if (state.quotes === 1 && value !== '"') {
        value = utils2.escapeRegex(value);
        prev.value += value;
        append({ value });
        continue;
      }
      if (value === '"') {
        state.quotes = state.quotes === 1 ? 0 : 1;
        if (opts.keepQuotes === true) {
          push({ type: "text", value });
        }
        continue;
      }
      if (value === "(") {
        increment("parens");
        push({ type: "paren", value });
        continue;
      }
      if (value === ")") {
        if (state.parens === 0 && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError("opening", "("));
        }
        const extglob = extglobs[extglobs.length - 1];
        if (extglob && state.parens === extglob.parens + 1) {
          extglobClose(extglobs.pop());
          continue;
        }
        push({ type: "paren", value, output: state.parens ? ")" : "\\)" });
        decrement("parens");
        continue;
      }
      if (value === "[") {
        if (opts.nobracket === true || !remaining().includes("]")) {
          if (opts.nobracket !== true && opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("closing", "]"));
          }
          value = `\\${value}`;
        } else {
          increment("brackets");
        }
        push({ type: "bracket", value });
        continue;
      }
      if (value === "]") {
        if (opts.nobracket === true || prev && prev.type === "bracket" && prev.value.length === 1) {
          push({ type: "text", value, output: `\\${value}` });
          continue;
        }
        if (state.brackets === 0) {
          if (opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("opening", "["));
          }
          push({ type: "text", value, output: `\\${value}` });
          continue;
        }
        decrement("brackets");
        const prevValue = prev.value.slice(1);
        if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/")) {
          value = `/${value}`;
        }
        prev.value += value;
        append({ value });
        if (opts.literalBrackets === false || utils2.hasRegexChars(prevValue)) {
          continue;
        }
        const escaped = utils2.escapeRegex(prev.value);
        state.output = state.output.slice(0, -prev.value.length);
        if (opts.literalBrackets === true) {
          state.output += escaped;
          prev.value = escaped;
          continue;
        }
        prev.value = `(${capture}${escaped}|${prev.value})`;
        state.output += prev.value;
        continue;
      }
      if (value === "{" && opts.nobrace !== true) {
        increment("braces");
        const open = {
          type: "brace",
          value,
          output: "(",
          outputIndex: state.output.length,
          tokensIndex: state.tokens.length
        };
        braces.push(open);
        push(open);
        continue;
      }
      if (value === "}") {
        const brace = braces[braces.length - 1];
        if (opts.nobrace === true || !brace) {
          push({ type: "text", value, output: value });
          continue;
        }
        let output2 = ")";
        if (brace.dots === true) {
          const arr = tokens.slice();
          const range = [];
          for (let i = arr.length - 1; i >= 0; i--) {
            tokens.pop();
            if (arr[i].type === "brace") {
              break;
            }
            if (arr[i].type !== "dots") {
              range.unshift(arr[i].value);
            }
          }
          output2 = expandRange(range, opts);
          state.backtrack = true;
        }
        if (brace.comma !== true && brace.dots !== true) {
          const out2 = state.output.slice(0, brace.outputIndex);
          const toks = state.tokens.slice(brace.tokensIndex);
          brace.value = brace.output = "\\{";
          value = output2 = "\\}";
          state.output = out2;
          for (const t of toks) {
            state.output += t.output || t.value;
          }
        }
        push({ type: "brace", value, output: output2 });
        decrement("braces");
        braces.pop();
        continue;
      }
      if (value === "|") {
        if (extglobs.length > 0) {
          extglobs[extglobs.length - 1].conditions++;
        }
        push({ type: "text", value });
        continue;
      }
      if (value === ",") {
        let output2 = value;
        const brace = braces[braces.length - 1];
        if (brace && stack[stack.length - 1] === "braces") {
          brace.comma = true;
          output2 = "|";
        }
        push({ type: "comma", value, output: output2 });
        continue;
      }
      if (value === "/") {
        if (prev.type === "dot" && state.index === state.start + 1) {
          state.start = state.index + 1;
          state.consumed = "";
          state.output = "";
          tokens.pop();
          prev = bos;
          continue;
        }
        push({ type: "slash", value, output: SLASH_LITERAL });
        continue;
      }
      if (value === ".") {
        if (state.braces > 0 && prev.type === "dot") {
          if (prev.value === ".")
            prev.output = DOT_LITERAL;
          const brace = braces[braces.length - 1];
          prev.type = "dots";
          prev.output += value;
          prev.value += value;
          brace.dots = true;
          continue;
        }
        if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
          push({ type: "text", value, output: DOT_LITERAL });
          continue;
        }
        push({ type: "dot", value, output: DOT_LITERAL });
        continue;
      }
      if (value === "?") {
        const isGroup = prev && prev.value === "(";
        if (!isGroup && opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
          extglobOpen("qmark", value);
          continue;
        }
        if (prev && prev.type === "paren") {
          const next = peek();
          let output2 = value;
          if (next === "<" && !utils2.supportsLookbehinds()) {
            throw new Error("Node.js v10 or higher is required for regex lookbehinds");
          }
          if (prev.value === "(" && !/[!=<:]/.test(next) || next === "<" && !/<([!=]|\w+>)/.test(remaining())) {
            output2 = `\\${value}`;
          }
          push({ type: "text", value, output: output2 });
          continue;
        }
        if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
          push({ type: "qmark", value, output: QMARK_NO_DOT });
          continue;
        }
        push({ type: "qmark", value, output: QMARK });
        continue;
      }
      if (value === "!") {
        if (opts.noextglob !== true && peek() === "(") {
          if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
            extglobOpen("negate", value);
            continue;
          }
        }
        if (opts.nonegate !== true && state.index === 0) {
          negate();
          continue;
        }
      }
      if (value === "+") {
        if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
          extglobOpen("plus", value);
          continue;
        }
        if (prev && prev.value === "(" || opts.regex === false) {
          push({ type: "plus", value, output: PLUS_LITERAL });
          continue;
        }
        if (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace") || state.parens > 0) {
          push({ type: "plus", value });
          continue;
        }
        push({ type: "plus", value: PLUS_LITERAL });
        continue;
      }
      if (value === "@") {
        if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
          push({ type: "at", extglob: true, value, output: "" });
          continue;
        }
        push({ type: "text", value });
        continue;
      }
      if (value !== "*") {
        if (value === "$" || value === "^") {
          value = `\\${value}`;
        }
        const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
        if (match) {
          value += match[0];
          state.index += match[0].length;
        }
        push({ type: "text", value });
        continue;
      }
      if (prev && (prev.type === "globstar" || prev.star === true)) {
        prev.type = "star";
        prev.star = true;
        prev.value += value;
        prev.output = star;
        state.backtrack = true;
        state.globstar = true;
        consume(value);
        continue;
      }
      let rest = remaining();
      if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
        extglobOpen("star", value);
        continue;
      }
      if (prev.type === "star") {
        if (opts.noglobstar === true) {
          consume(value);
          continue;
        }
        const prior = prev.prev;
        const before = prior.prev;
        const isStart = prior.type === "slash" || prior.type === "bos";
        const afterStar = before && (before.type === "star" || before.type === "globstar");
        if (opts.bash === true && (!isStart || rest[0] && rest[0] !== "/")) {
          push({ type: "star", value, output: "" });
          continue;
        }
        const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
        const isExtglob2 = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
        if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob2) {
          push({ type: "star", value, output: "" });
          continue;
        }
        while (rest.slice(0, 3) === "/**") {
          const after = input[state.index + 4];
          if (after && after !== "/") {
            break;
          }
          rest = rest.slice(3);
          consume("/**", 3);
        }
        if (prior.type === "bos" && eos()) {
          prev.type = "globstar";
          prev.value += value;
          prev.output = globstar(opts);
          state.output = prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }
        if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && eos()) {
          state.output = state.output.slice(0, -(prior.output + prev.output).length);
          prior.output = `(?:${prior.output}`;
          prev.type = "globstar";
          prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
          prev.value += value;
          state.globstar = true;
          state.output += prior.output + prev.output;
          consume(value);
          continue;
        }
        if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
          const end = rest[1] !== void 0 ? "|$" : "";
          state.output = state.output.slice(0, -(prior.output + prev.output).length);
          prior.output = `(?:${prior.output}`;
          prev.type = "globstar";
          prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
          prev.value += value;
          state.output += prior.output + prev.output;
          state.globstar = true;
          consume(value + advance());
          push({ type: "slash", value: "/", output: "" });
          continue;
        }
        if (prior.type === "bos" && rest[0] === "/") {
          prev.type = "globstar";
          prev.value += value;
          prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
          state.output = prev.output;
          state.globstar = true;
          consume(value + advance());
          push({ type: "slash", value: "/", output: "" });
          continue;
        }
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = "globstar";
        prev.output = globstar(opts);
        prev.value += value;
        state.output += prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }
      const token = { type: "star", value, output: star };
      if (opts.bash === true) {
        token.output = ".*?";
        if (prev.type === "bos" || prev.type === "slash") {
          token.output = nodot + token.output;
        }
        push(token);
        continue;
      }
      if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
        token.output = value;
        push(token);
        continue;
      }
      if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
        if (prev.type === "dot") {
          state.output += NO_DOT_SLASH;
          prev.output += NO_DOT_SLASH;
        } else if (opts.dot === true) {
          state.output += NO_DOTS_SLASH;
          prev.output += NO_DOTS_SLASH;
        } else {
          state.output += nodot;
          prev.output += nodot;
        }
        if (peek() !== "*") {
          state.output += ONE_CHAR;
          prev.output += ONE_CHAR;
        }
      }
      push(token);
    }
    while (state.brackets > 0) {
      if (opts.strictBrackets === true)
        throw new SyntaxError(syntaxError("closing", "]"));
      state.output = utils2.escapeLast(state.output, "[");
      decrement("brackets");
    }
    while (state.parens > 0) {
      if (opts.strictBrackets === true)
        throw new SyntaxError(syntaxError("closing", ")"));
      state.output = utils2.escapeLast(state.output, "(");
      decrement("parens");
    }
    while (state.braces > 0) {
      if (opts.strictBrackets === true)
        throw new SyntaxError(syntaxError("closing", "}"));
      state.output = utils2.escapeLast(state.output, "{");
      decrement("braces");
    }
    if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket")) {
      push({ type: "maybe_slash", value: "", output: `${SLASH_LITERAL}?` });
    }
    if (state.backtrack === true) {
      state.output = "";
      for (const token of state.tokens) {
        state.output += token.output != null ? token.output : token.value;
        if (token.suffix) {
          state.output += token.suffix;
        }
      }
    }
    return state;
  };
  parse2.fastpaths = (input, options) => {
    const opts = { ...options };
    const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
    const len = input.length;
    if (len > max) {
      throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
    }
    input = REPLACEMENTS[input] || input;
    const win322 = utils2.isWindows(options);
    const {
      DOT_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOTS,
      NO_DOTS_SLASH,
      STAR,
      START_ANCHOR
    } = constants2.globChars(win322);
    const nodot = opts.dot ? NO_DOTS : NO_DOT;
    const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
    const capture = opts.capture ? "" : "?:";
    const state = { negated: false, prefix: "" };
    let star = opts.bash === true ? ".*?" : STAR;
    if (opts.capture) {
      star = `(${star})`;
    }
    const globstar = (opts2) => {
      if (opts2.noglobstar === true)
        return star;
      return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
    };
    const create = (str2) => {
      switch (str2) {
        case "*":
          return `${nodot}${ONE_CHAR}${star}`;
        case ".*":
          return `${DOT_LITERAL}${ONE_CHAR}${star}`;
        case "*.*":
          return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
        case "*/*":
          return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;
        case "**":
          return nodot + globstar(opts);
        case "**/*":
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;
        case "**/*.*":
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
        case "**/.*":
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;
        default: {
          const match = /^(.*?)\.(\w+)$/.exec(str2);
          if (!match)
            return;
          const source2 = create(match[1]);
          if (!source2)
            return;
          return source2 + DOT_LITERAL + match[2];
        }
      }
    };
    const output2 = utils2.removePrefix(input, state);
    let source = create(output2);
    if (source && opts.strictSlashes !== true) {
      source += `${SLASH_LITERAL}?`;
    }
    return source;
  };
  parse_1 = parse2;
  return parse_1;
}
var picomatch_1;
var hasRequiredPicomatch$1;
function requirePicomatch$1() {
  if (hasRequiredPicomatch$1)
    return picomatch_1;
  hasRequiredPicomatch$1 = 1;
  const path2 = require$$0$3;
  const scan = requireScan();
  const parse2 = requireParse$1();
  const utils2 = requireUtils$3();
  const constants2 = requireConstants$1();
  const isObject = (val) => val && typeof val === "object" && !Array.isArray(val);
  const picomatch2 = (glob, options, returnState = false) => {
    if (Array.isArray(glob)) {
      const fns = glob.map((input) => picomatch2(input, options, returnState));
      const arrayMatcher = (str2) => {
        for (const isMatch of fns) {
          const state2 = isMatch(str2);
          if (state2)
            return state2;
        }
        return false;
      };
      return arrayMatcher;
    }
    const isState = isObject(glob) && glob.tokens && glob.input;
    if (glob === "" || typeof glob !== "string" && !isState) {
      throw new TypeError("Expected pattern to be a non-empty string");
    }
    const opts = options || {};
    const posix = utils2.isWindows(options);
    const regex = isState ? picomatch2.compileRe(glob, options) : picomatch2.makeRe(glob, options, false, true);
    const state = regex.state;
    delete regex.state;
    let isIgnored = () => false;
    if (opts.ignore) {
      const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
      isIgnored = picomatch2(opts.ignore, ignoreOpts, returnState);
    }
    const matcher2 = (input, returnObject = false) => {
      const { isMatch, match, output: output2 } = picomatch2.test(input, regex, options, { glob, posix });
      const result = { glob, state, regex, posix, input, output: output2, match, isMatch };
      if (typeof opts.onResult === "function") {
        opts.onResult(result);
      }
      if (isMatch === false) {
        result.isMatch = false;
        return returnObject ? result : false;
      }
      if (isIgnored(input)) {
        if (typeof opts.onIgnore === "function") {
          opts.onIgnore(result);
        }
        result.isMatch = false;
        return returnObject ? result : false;
      }
      if (typeof opts.onMatch === "function") {
        opts.onMatch(result);
      }
      return returnObject ? result : true;
    };
    if (returnState) {
      matcher2.state = state;
    }
    return matcher2;
  };
  picomatch2.test = (input, regex, options, { glob, posix } = {}) => {
    if (typeof input !== "string") {
      throw new TypeError("Expected input to be a string");
    }
    if (input === "") {
      return { isMatch: false, output: "" };
    }
    const opts = options || {};
    const format = opts.format || (posix ? utils2.toPosixSlashes : null);
    let match = input === glob;
    let output2 = match && format ? format(input) : input;
    if (match === false) {
      output2 = format ? format(input) : input;
      match = output2 === glob;
    }
    if (match === false || opts.capture === true) {
      if (opts.matchBase === true || opts.basename === true) {
        match = picomatch2.matchBase(input, regex, options, posix);
      } else {
        match = regex.exec(output2);
      }
    }
    return { isMatch: Boolean(match), match, output: output2 };
  };
  picomatch2.matchBase = (input, glob, options, posix = utils2.isWindows(options)) => {
    const regex = glob instanceof RegExp ? glob : picomatch2.makeRe(glob, options);
    return regex.test(path2.basename(input));
  };
  picomatch2.isMatch = (str2, patterns, options) => picomatch2(patterns, options)(str2);
  picomatch2.parse = (pattern2, options) => {
    if (Array.isArray(pattern2))
      return pattern2.map((p) => picomatch2.parse(p, options));
    return parse2(pattern2, { ...options, fastpaths: false });
  };
  picomatch2.scan = (input, options) => scan(input, options);
  picomatch2.compileRe = (state, options, returnOutput = false, returnState = false) => {
    if (returnOutput === true) {
      return state.output;
    }
    const opts = options || {};
    const prepend = opts.contains ? "" : "^";
    const append = opts.contains ? "" : "$";
    let source = `${prepend}(?:${state.output})${append}`;
    if (state && state.negated === true) {
      source = `^(?!${source}).*$`;
    }
    const regex = picomatch2.toRegex(source, options);
    if (returnState === true) {
      regex.state = state;
    }
    return regex;
  };
  picomatch2.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
    if (!input || typeof input !== "string") {
      throw new TypeError("Expected a non-empty string");
    }
    let parsed = { negated: false, fastpaths: true };
    if (options.fastpaths !== false && (input[0] === "." || input[0] === "*")) {
      parsed.output = parse2.fastpaths(input, options);
    }
    if (!parsed.output) {
      parsed = parse2(input, options);
    }
    return picomatch2.compileRe(parsed, options, returnOutput, returnState);
  };
  picomatch2.toRegex = (source, options) => {
    try {
      const opts = options || {};
      return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
    } catch (err) {
      if (options && options.debug === true)
        throw err;
      return /$^/;
    }
  };
  picomatch2.constants = constants2;
  picomatch_1 = picomatch2;
  return picomatch_1;
}
var picomatch;
var hasRequiredPicomatch;
function requirePicomatch() {
  if (hasRequiredPicomatch)
    return picomatch;
  hasRequiredPicomatch = 1;
  picomatch = requirePicomatch$1();
  return picomatch;
}
var micromatch_1;
var hasRequiredMicromatch;
function requireMicromatch() {
  if (hasRequiredMicromatch)
    return micromatch_1;
  hasRequiredMicromatch = 1;
  const util2 = require$$0$2;
  const braces = requireBraces();
  const picomatch2 = requirePicomatch();
  const utils2 = requireUtils$3();
  const isEmptyString = (val) => val === "" || val === "./";
  const micromatch = (list, patterns, options) => {
    patterns = [].concat(patterns);
    list = [].concat(list);
    let omit = /* @__PURE__ */ new Set();
    let keep = /* @__PURE__ */ new Set();
    let items = /* @__PURE__ */ new Set();
    let negatives = 0;
    let onResult = (state) => {
      items.add(state.output);
      if (options && options.onResult) {
        options.onResult(state);
      }
    };
    for (let i = 0; i < patterns.length; i++) {
      let isMatch = picomatch2(String(patterns[i]), { ...options, onResult }, true);
      let negated = isMatch.state.negated || isMatch.state.negatedExtglob;
      if (negated)
        negatives++;
      for (let item of list) {
        let matched = isMatch(item, true);
        let match = negated ? !matched.isMatch : matched.isMatch;
        if (!match)
          continue;
        if (negated) {
          omit.add(matched.output);
        } else {
          omit.delete(matched.output);
          keep.add(matched.output);
        }
      }
    }
    let result = negatives === patterns.length ? [...items] : [...keep];
    let matches = result.filter((item) => !omit.has(item));
    if (options && matches.length === 0) {
      if (options.failglob === true) {
        throw new Error(`No matches found for "${patterns.join(", ")}"`);
      }
      if (options.nonull === true || options.nullglob === true) {
        return options.unescape ? patterns.map((p) => p.replace(/\\/g, "")) : patterns;
      }
    }
    return matches;
  };
  micromatch.match = micromatch;
  micromatch.matcher = (pattern2, options) => picomatch2(pattern2, options);
  micromatch.isMatch = (str2, patterns, options) => picomatch2(patterns, options)(str2);
  micromatch.any = micromatch.isMatch;
  micromatch.not = (list, patterns, options = {}) => {
    patterns = [].concat(patterns).map(String);
    let result = /* @__PURE__ */ new Set();
    let items = [];
    let onResult = (state) => {
      if (options.onResult)
        options.onResult(state);
      items.push(state.output);
    };
    let matches = new Set(micromatch(list, patterns, { ...options, onResult }));
    for (let item of items) {
      if (!matches.has(item)) {
        result.add(item);
      }
    }
    return [...result];
  };
  micromatch.contains = (str2, pattern2, options) => {
    if (typeof str2 !== "string") {
      throw new TypeError(`Expected a string: "${util2.inspect(str2)}"`);
    }
    if (Array.isArray(pattern2)) {
      return pattern2.some((p) => micromatch.contains(str2, p, options));
    }
    if (typeof pattern2 === "string") {
      if (isEmptyString(str2) || isEmptyString(pattern2)) {
        return false;
      }
      if (str2.includes(pattern2) || str2.startsWith("./") && str2.slice(2).includes(pattern2)) {
        return true;
      }
    }
    return micromatch.isMatch(str2, pattern2, { ...options, contains: true });
  };
  micromatch.matchKeys = (obj, patterns, options) => {
    if (!utils2.isObject(obj)) {
      throw new TypeError("Expected the first argument to be an object");
    }
    let keys = micromatch(Object.keys(obj), patterns, options);
    let res = {};
    for (let key of keys)
      res[key] = obj[key];
    return res;
  };
  micromatch.some = (list, patterns, options) => {
    let items = [].concat(list);
    for (let pattern2 of [].concat(patterns)) {
      let isMatch = picomatch2(String(pattern2), options);
      if (items.some((item) => isMatch(item))) {
        return true;
      }
    }
    return false;
  };
  micromatch.every = (list, patterns, options) => {
    let items = [].concat(list);
    for (let pattern2 of [].concat(patterns)) {
      let isMatch = picomatch2(String(pattern2), options);
      if (!items.every((item) => isMatch(item))) {
        return false;
      }
    }
    return true;
  };
  micromatch.all = (str2, patterns, options) => {
    if (typeof str2 !== "string") {
      throw new TypeError(`Expected a string: "${util2.inspect(str2)}"`);
    }
    return [].concat(patterns).every((p) => picomatch2(p, options)(str2));
  };
  micromatch.capture = (glob, input, options) => {
    let posix = utils2.isWindows(options);
    let regex = picomatch2.makeRe(String(glob), { ...options, capture: true });
    let match = regex.exec(posix ? utils2.toPosixSlashes(input) : input);
    if (match) {
      return match.slice(1).map((v) => v === void 0 ? "" : v);
    }
  };
  micromatch.makeRe = (...args) => picomatch2.makeRe(...args);
  micromatch.scan = (...args) => picomatch2.scan(...args);
  micromatch.parse = (patterns, options) => {
    let res = [];
    for (let pattern2 of [].concat(patterns || [])) {
      for (let str2 of braces(String(pattern2), options)) {
        res.push(picomatch2.parse(str2, options));
      }
    }
    return res;
  };
  micromatch.braces = (pattern2, options) => {
    if (typeof pattern2 !== "string")
      throw new TypeError("Expected a string");
    if (options && options.nobrace === true || !/\{.*\}/.test(pattern2)) {
      return [pattern2];
    }
    return braces(pattern2, options);
  };
  micromatch.braceExpand = (pattern2, options) => {
    if (typeof pattern2 !== "string")
      throw new TypeError("Expected a string");
    return micromatch.braces(pattern2, { ...options, expand: true });
  };
  micromatch_1 = micromatch;
  return micromatch_1;
}
var hasRequiredPattern;
function requirePattern() {
  if (hasRequiredPattern)
    return pattern;
  hasRequiredPattern = 1;
  Object.defineProperty(pattern, "__esModule", { value: true });
  pattern.removeDuplicateSlashes = pattern.matchAny = pattern.convertPatternsToRe = pattern.makeRe = pattern.getPatternParts = pattern.expandBraceExpansion = pattern.expandPatternsWithBraceExpansion = pattern.isAffectDepthOfReadingPattern = pattern.endsWithSlashGlobStar = pattern.hasGlobStar = pattern.getBaseDirectory = pattern.isPatternRelatedToParentDirectory = pattern.getPatternsOutsideCurrentDirectory = pattern.getPatternsInsideCurrentDirectory = pattern.getPositivePatterns = pattern.getNegativePatterns = pattern.isPositivePattern = pattern.isNegativePattern = pattern.convertToNegativePattern = pattern.convertToPositivePattern = pattern.isDynamicPattern = pattern.isStaticPattern = void 0;
  const path2 = require$$0$3;
  const globParent2 = requireGlobParent();
  const micromatch = requireMicromatch();
  const GLOBSTAR = "**";
  const ESCAPE_SYMBOL = "\\";
  const COMMON_GLOB_SYMBOLS_RE = /[*?]|^!/;
  const REGEX_CHARACTER_CLASS_SYMBOLS_RE = /\[[^[]*]/;
  const REGEX_GROUP_SYMBOLS_RE = /(?:^|[^!*+?@])\([^(]*\|[^|]*\)/;
  const GLOB_EXTENSION_SYMBOLS_RE = /[!*+?@]\([^(]*\)/;
  const BRACE_EXPANSION_SEPARATORS_RE = /,|\.\./;
  const DOUBLE_SLASH_RE = /(?!^)\/{2,}/g;
  function isStaticPattern(pattern2, options = {}) {
    return !isDynamicPattern(pattern2, options);
  }
  pattern.isStaticPattern = isStaticPattern;
  function isDynamicPattern(pattern2, options = {}) {
    if (pattern2 === "") {
      return false;
    }
    if (options.caseSensitiveMatch === false || pattern2.includes(ESCAPE_SYMBOL)) {
      return true;
    }
    if (COMMON_GLOB_SYMBOLS_RE.test(pattern2) || REGEX_CHARACTER_CLASS_SYMBOLS_RE.test(pattern2) || REGEX_GROUP_SYMBOLS_RE.test(pattern2)) {
      return true;
    }
    if (options.extglob !== false && GLOB_EXTENSION_SYMBOLS_RE.test(pattern2)) {
      return true;
    }
    if (options.braceExpansion !== false && hasBraceExpansion(pattern2)) {
      return true;
    }
    return false;
  }
  pattern.isDynamicPattern = isDynamicPattern;
  function hasBraceExpansion(pattern2) {
    const openingBraceIndex = pattern2.indexOf("{");
    if (openingBraceIndex === -1) {
      return false;
    }
    const closingBraceIndex = pattern2.indexOf("}", openingBraceIndex + 1);
    if (closingBraceIndex === -1) {
      return false;
    }
    const braceContent = pattern2.slice(openingBraceIndex, closingBraceIndex);
    return BRACE_EXPANSION_SEPARATORS_RE.test(braceContent);
  }
  function convertToPositivePattern(pattern2) {
    return isNegativePattern(pattern2) ? pattern2.slice(1) : pattern2;
  }
  pattern.convertToPositivePattern = convertToPositivePattern;
  function convertToNegativePattern(pattern2) {
    return "!" + pattern2;
  }
  pattern.convertToNegativePattern = convertToNegativePattern;
  function isNegativePattern(pattern2) {
    return pattern2.startsWith("!") && pattern2[1] !== "(";
  }
  pattern.isNegativePattern = isNegativePattern;
  function isPositivePattern(pattern2) {
    return !isNegativePattern(pattern2);
  }
  pattern.isPositivePattern = isPositivePattern;
  function getNegativePatterns(patterns) {
    return patterns.filter(isNegativePattern);
  }
  pattern.getNegativePatterns = getNegativePatterns;
  function getPositivePatterns(patterns) {
    return patterns.filter(isPositivePattern);
  }
  pattern.getPositivePatterns = getPositivePatterns;
  function getPatternsInsideCurrentDirectory(patterns) {
    return patterns.filter((pattern2) => !isPatternRelatedToParentDirectory(pattern2));
  }
  pattern.getPatternsInsideCurrentDirectory = getPatternsInsideCurrentDirectory;
  function getPatternsOutsideCurrentDirectory(patterns) {
    return patterns.filter(isPatternRelatedToParentDirectory);
  }
  pattern.getPatternsOutsideCurrentDirectory = getPatternsOutsideCurrentDirectory;
  function isPatternRelatedToParentDirectory(pattern2) {
    return pattern2.startsWith("..") || pattern2.startsWith("./..");
  }
  pattern.isPatternRelatedToParentDirectory = isPatternRelatedToParentDirectory;
  function getBaseDirectory(pattern2) {
    return globParent2(pattern2, { flipBackslashes: false });
  }
  pattern.getBaseDirectory = getBaseDirectory;
  function hasGlobStar(pattern2) {
    return pattern2.includes(GLOBSTAR);
  }
  pattern.hasGlobStar = hasGlobStar;
  function endsWithSlashGlobStar(pattern2) {
    return pattern2.endsWith("/" + GLOBSTAR);
  }
  pattern.endsWithSlashGlobStar = endsWithSlashGlobStar;
  function isAffectDepthOfReadingPattern(pattern2) {
    const basename = path2.basename(pattern2);
    return endsWithSlashGlobStar(pattern2) || isStaticPattern(basename);
  }
  pattern.isAffectDepthOfReadingPattern = isAffectDepthOfReadingPattern;
  function expandPatternsWithBraceExpansion(patterns) {
    return patterns.reduce((collection, pattern2) => {
      return collection.concat(expandBraceExpansion(pattern2));
    }, []);
  }
  pattern.expandPatternsWithBraceExpansion = expandPatternsWithBraceExpansion;
  function expandBraceExpansion(pattern2) {
    const patterns = micromatch.braces(pattern2, { expand: true, nodupes: true });
    patterns.sort((a, b) => a.length - b.length);
    return patterns.filter((pattern3) => pattern3 !== "");
  }
  pattern.expandBraceExpansion = expandBraceExpansion;
  function getPatternParts(pattern2, options) {
    let { parts } = micromatch.scan(pattern2, Object.assign(Object.assign({}, options), { parts: true }));
    if (parts.length === 0) {
      parts = [pattern2];
    }
    if (parts[0].startsWith("/")) {
      parts[0] = parts[0].slice(1);
      parts.unshift("");
    }
    return parts;
  }
  pattern.getPatternParts = getPatternParts;
  function makeRe(pattern2, options) {
    return micromatch.makeRe(pattern2, options);
  }
  pattern.makeRe = makeRe;
  function convertPatternsToRe(patterns, options) {
    return patterns.map((pattern2) => makeRe(pattern2, options));
  }
  pattern.convertPatternsToRe = convertPatternsToRe;
  function matchAny(entry2, patternsRe) {
    return patternsRe.some((patternRe) => patternRe.test(entry2));
  }
  pattern.matchAny = matchAny;
  function removeDuplicateSlashes(pattern2) {
    return pattern2.replace(DOUBLE_SLASH_RE, "/");
  }
  pattern.removeDuplicateSlashes = removeDuplicateSlashes;
  return pattern;
}
var stream$3 = {};
var hasRequiredStream$3;
function requireStream$3() {
  if (hasRequiredStream$3)
    return stream$3;
  hasRequiredStream$3 = 1;
  Object.defineProperty(stream$3, "__esModule", { value: true });
  stream$3.merge = void 0;
  const merge2 = requireMerge2();
  function merge3(streams) {
    const mergedStream = merge2(streams);
    streams.forEach((stream2) => {
      stream2.once("error", (error2) => mergedStream.emit("error", error2));
    });
    mergedStream.once("close", () => propagateCloseEventToSources(streams));
    mergedStream.once("end", () => propagateCloseEventToSources(streams));
    return mergedStream;
  }
  stream$3.merge = merge3;
  function propagateCloseEventToSources(streams) {
    streams.forEach((stream2) => stream2.emit("close"));
  }
  return stream$3;
}
var string = {};
var hasRequiredString;
function requireString() {
  if (hasRequiredString)
    return string;
  hasRequiredString = 1;
  Object.defineProperty(string, "__esModule", { value: true });
  string.isEmpty = string.isString = void 0;
  function isString(input) {
    return typeof input === "string";
  }
  string.isString = isString;
  function isEmpty(input) {
    return input === "";
  }
  string.isEmpty = isEmpty;
  return string;
}
var hasRequiredUtils$2;
function requireUtils$2() {
  if (hasRequiredUtils$2)
    return utils$4;
  hasRequiredUtils$2 = 1;
  Object.defineProperty(utils$4, "__esModule", { value: true });
  utils$4.string = utils$4.stream = utils$4.pattern = utils$4.path = utils$4.fs = utils$4.errno = utils$4.array = void 0;
  const array2 = requireArray();
  utils$4.array = array2;
  const errno2 = requireErrno();
  utils$4.errno = errno2;
  const fs2 = requireFs$3();
  utils$4.fs = fs2;
  const path2 = requirePath();
  utils$4.path = path2;
  const pattern2 = requirePattern();
  utils$4.pattern = pattern2;
  const stream2 = requireStream$3();
  utils$4.stream = stream2;
  const string2 = requireString();
  utils$4.string = string2;
  return utils$4;
}
var hasRequiredTasks;
function requireTasks() {
  if (hasRequiredTasks)
    return tasks;
  hasRequiredTasks = 1;
  Object.defineProperty(tasks, "__esModule", { value: true });
  tasks.convertPatternGroupToTask = tasks.convertPatternGroupsToTasks = tasks.groupPatternsByBaseDirectory = tasks.getNegativePatternsAsPositive = tasks.getPositivePatterns = tasks.convertPatternsToTasks = tasks.generate = void 0;
  const utils2 = requireUtils$2();
  function generate(input, settings2) {
    const patterns = processPatterns(input, settings2);
    const ignore2 = processPatterns(settings2.ignore, settings2);
    const positivePatterns = getPositivePatterns(patterns);
    const negativePatterns = getNegativePatternsAsPositive(patterns, ignore2);
    const staticPatterns = positivePatterns.filter((pattern2) => utils2.pattern.isStaticPattern(pattern2, settings2));
    const dynamicPatterns = positivePatterns.filter((pattern2) => utils2.pattern.isDynamicPattern(pattern2, settings2));
    const staticTasks = convertPatternsToTasks(
      staticPatterns,
      negativePatterns,
      /* dynamic */
      false
    );
    const dynamicTasks = convertPatternsToTasks(
      dynamicPatterns,
      negativePatterns,
      /* dynamic */
      true
    );
    return staticTasks.concat(dynamicTasks);
  }
  tasks.generate = generate;
  function processPatterns(input, settings2) {
    let patterns = input;
    if (settings2.braceExpansion) {
      patterns = utils2.pattern.expandPatternsWithBraceExpansion(patterns);
    }
    if (settings2.baseNameMatch) {
      patterns = patterns.map((pattern2) => pattern2.includes("/") ? pattern2 : `**/${pattern2}`);
    }
    return patterns.map((pattern2) => utils2.pattern.removeDuplicateSlashes(pattern2));
  }
  function convertPatternsToTasks(positive, negative, dynamic) {
    const tasks2 = [];
    const patternsOutsideCurrentDirectory = utils2.pattern.getPatternsOutsideCurrentDirectory(positive);
    const patternsInsideCurrentDirectory = utils2.pattern.getPatternsInsideCurrentDirectory(positive);
    const outsideCurrentDirectoryGroup = groupPatternsByBaseDirectory(patternsOutsideCurrentDirectory);
    const insideCurrentDirectoryGroup = groupPatternsByBaseDirectory(patternsInsideCurrentDirectory);
    tasks2.push(...convertPatternGroupsToTasks(outsideCurrentDirectoryGroup, negative, dynamic));
    if ("." in insideCurrentDirectoryGroup) {
      tasks2.push(convertPatternGroupToTask(".", patternsInsideCurrentDirectory, negative, dynamic));
    } else {
      tasks2.push(...convertPatternGroupsToTasks(insideCurrentDirectoryGroup, negative, dynamic));
    }
    return tasks2;
  }
  tasks.convertPatternsToTasks = convertPatternsToTasks;
  function getPositivePatterns(patterns) {
    return utils2.pattern.getPositivePatterns(patterns);
  }
  tasks.getPositivePatterns = getPositivePatterns;
  function getNegativePatternsAsPositive(patterns, ignore2) {
    const negative = utils2.pattern.getNegativePatterns(patterns).concat(ignore2);
    const positive = negative.map(utils2.pattern.convertToPositivePattern);
    return positive;
  }
  tasks.getNegativePatternsAsPositive = getNegativePatternsAsPositive;
  function groupPatternsByBaseDirectory(patterns) {
    const group = {};
    return patterns.reduce((collection, pattern2) => {
      const base = utils2.pattern.getBaseDirectory(pattern2);
      if (base in collection) {
        collection[base].push(pattern2);
      } else {
        collection[base] = [pattern2];
      }
      return collection;
    }, group);
  }
  tasks.groupPatternsByBaseDirectory = groupPatternsByBaseDirectory;
  function convertPatternGroupsToTasks(positive, negative, dynamic) {
    return Object.keys(positive).map((base) => {
      return convertPatternGroupToTask(base, positive[base], negative, dynamic);
    });
  }
  tasks.convertPatternGroupsToTasks = convertPatternGroupsToTasks;
  function convertPatternGroupToTask(base, positive, negative, dynamic) {
    return {
      dynamic,
      positive,
      negative,
      base,
      patterns: [].concat(positive, negative.map(utils2.pattern.convertToNegativePattern))
    };
  }
  tasks.convertPatternGroupToTask = convertPatternGroupToTask;
  return tasks;
}
var async$5 = {};
var async$4 = {};
var out$3 = {};
var async$3 = {};
var async$2 = {};
var out$2 = {};
var async$1 = {};
var out$1 = {};
var async = {};
var hasRequiredAsync$5;
function requireAsync$5() {
  if (hasRequiredAsync$5)
    return async;
  hasRequiredAsync$5 = 1;
  Object.defineProperty(async, "__esModule", { value: true });
  async.read = void 0;
  function read(path2, settings2, callback) {
    settings2.fs.lstat(path2, (lstatError, lstat) => {
      if (lstatError !== null) {
        callFailureCallback(callback, lstatError);
        return;
      }
      if (!lstat.isSymbolicLink() || !settings2.followSymbolicLink) {
        callSuccessCallback(callback, lstat);
        return;
      }
      settings2.fs.stat(path2, (statError, stat2) => {
        if (statError !== null) {
          if (settings2.throwErrorOnBrokenSymbolicLink) {
            callFailureCallback(callback, statError);
            return;
          }
          callSuccessCallback(callback, lstat);
          return;
        }
        if (settings2.markSymbolicLink) {
          stat2.isSymbolicLink = () => true;
        }
        callSuccessCallback(callback, stat2);
      });
    });
  }
  async.read = read;
  function callFailureCallback(callback, error2) {
    callback(error2);
  }
  function callSuccessCallback(callback, result) {
    callback(null, result);
  }
  return async;
}
var sync$5 = {};
var hasRequiredSync$5;
function requireSync$5() {
  if (hasRequiredSync$5)
    return sync$5;
  hasRequiredSync$5 = 1;
  Object.defineProperty(sync$5, "__esModule", { value: true });
  sync$5.read = void 0;
  function read(path2, settings2) {
    const lstat = settings2.fs.lstatSync(path2);
    if (!lstat.isSymbolicLink() || !settings2.followSymbolicLink) {
      return lstat;
    }
    try {
      const stat2 = settings2.fs.statSync(path2);
      if (settings2.markSymbolicLink) {
        stat2.isSymbolicLink = () => true;
      }
      return stat2;
    } catch (error2) {
      if (!settings2.throwErrorOnBrokenSymbolicLink) {
        return lstat;
      }
      throw error2;
    }
  }
  sync$5.read = read;
  return sync$5;
}
var settings$3 = {};
var fs$2 = {};
var hasRequiredFs$2;
function requireFs$2() {
  if (hasRequiredFs$2)
    return fs$2;
  hasRequiredFs$2 = 1;
  (function(exports2) {
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createFileSystemAdapter = exports2.FILE_SYSTEM_ADAPTER = void 0;
    const fs2 = require$$0$1;
    exports2.FILE_SYSTEM_ADAPTER = {
      lstat: fs2.lstat,
      stat: fs2.stat,
      lstatSync: fs2.lstatSync,
      statSync: fs2.statSync
    };
    function createFileSystemAdapter(fsMethods) {
      if (fsMethods === void 0) {
        return exports2.FILE_SYSTEM_ADAPTER;
      }
      return Object.assign(Object.assign({}, exports2.FILE_SYSTEM_ADAPTER), fsMethods);
    }
    exports2.createFileSystemAdapter = createFileSystemAdapter;
  })(fs$2);
  return fs$2;
}
var hasRequiredSettings$3;
function requireSettings$3() {
  if (hasRequiredSettings$3)
    return settings$3;
  hasRequiredSettings$3 = 1;
  Object.defineProperty(settings$3, "__esModule", { value: true });
  const fs2 = requireFs$2();
  class Settings {
    constructor(_options = {}) {
      this._options = _options;
      this.followSymbolicLink = this._getValue(this._options.followSymbolicLink, true);
      this.fs = fs2.createFileSystemAdapter(this._options.fs);
      this.markSymbolicLink = this._getValue(this._options.markSymbolicLink, false);
      this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, true);
    }
    _getValue(option, value) {
      return option !== null && option !== void 0 ? option : value;
    }
  }
  settings$3.default = Settings;
  return settings$3;
}
var hasRequiredOut$3;
function requireOut$3() {
  if (hasRequiredOut$3)
    return out$1;
  hasRequiredOut$3 = 1;
  Object.defineProperty(out$1, "__esModule", { value: true });
  out$1.statSync = out$1.stat = out$1.Settings = void 0;
  const async2 = requireAsync$5();
  const sync2 = requireSync$5();
  const settings_1 = requireSettings$3();
  out$1.Settings = settings_1.default;
  function stat2(path2, optionsOrSettingsOrCallback, callback) {
    if (typeof optionsOrSettingsOrCallback === "function") {
      async2.read(path2, getSettings(), optionsOrSettingsOrCallback);
      return;
    }
    async2.read(path2, getSettings(optionsOrSettingsOrCallback), callback);
  }
  out$1.stat = stat2;
  function statSync(path2, optionsOrSettings) {
    const settings2 = getSettings(optionsOrSettings);
    return sync2.read(path2, settings2);
  }
  out$1.statSync = statSync;
  function getSettings(settingsOrOptions = {}) {
    if (settingsOrOptions instanceof settings_1.default) {
      return settingsOrOptions;
    }
    return new settings_1.default(settingsOrOptions);
  }
  return out$1;
}
/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
var queueMicrotask_1;
var hasRequiredQueueMicrotask;
function requireQueueMicrotask() {
  if (hasRequiredQueueMicrotask)
    return queueMicrotask_1;
  hasRequiredQueueMicrotask = 1;
  let promise;
  queueMicrotask_1 = typeof queueMicrotask === "function" ? queueMicrotask.bind(typeof window !== "undefined" ? window : commonjsGlobal) : (cb) => (promise || (promise = Promise.resolve())).then(cb).catch((err) => setTimeout(() => {
    throw err;
  }, 0));
  return queueMicrotask_1;
}
/*! run-parallel. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
var runParallel_1;
var hasRequiredRunParallel;
function requireRunParallel() {
  if (hasRequiredRunParallel)
    return runParallel_1;
  hasRequiredRunParallel = 1;
  runParallel_1 = runParallel;
  const queueMicrotask2 = requireQueueMicrotask();
  function runParallel(tasks2, cb) {
    let results, pending, keys;
    let isSync = true;
    if (Array.isArray(tasks2)) {
      results = [];
      pending = tasks2.length;
    } else {
      keys = Object.keys(tasks2);
      results = {};
      pending = keys.length;
    }
    function done(err) {
      function end() {
        if (cb)
          cb(err, results);
        cb = null;
      }
      if (isSync)
        queueMicrotask2(end);
      else
        end();
    }
    function each(i, err, result) {
      results[i] = result;
      if (--pending === 0 || err) {
        done(err);
      }
    }
    if (!pending) {
      done(null);
    } else if (keys) {
      keys.forEach(function(key) {
        tasks2[key](function(err, result) {
          each(key, err, result);
        });
      });
    } else {
      tasks2.forEach(function(task, i) {
        task(function(err, result) {
          each(i, err, result);
        });
      });
    }
    isSync = false;
  }
  return runParallel_1;
}
var constants = {};
var hasRequiredConstants;
function requireConstants() {
  if (hasRequiredConstants)
    return constants;
  hasRequiredConstants = 1;
  Object.defineProperty(constants, "__esModule", { value: true });
  constants.IS_SUPPORT_READDIR_WITH_FILE_TYPES = void 0;
  const NODE_PROCESS_VERSION_PARTS = process.versions.node.split(".");
  if (NODE_PROCESS_VERSION_PARTS[0] === void 0 || NODE_PROCESS_VERSION_PARTS[1] === void 0) {
    throw new Error(`Unexpected behavior. The 'process.versions.node' variable has invalid value: ${process.versions.node}`);
  }
  const MAJOR_VERSION = Number.parseInt(NODE_PROCESS_VERSION_PARTS[0], 10);
  const MINOR_VERSION = Number.parseInt(NODE_PROCESS_VERSION_PARTS[1], 10);
  const SUPPORTED_MAJOR_VERSION = 10;
  const SUPPORTED_MINOR_VERSION = 10;
  const IS_MATCHED_BY_MAJOR = MAJOR_VERSION > SUPPORTED_MAJOR_VERSION;
  const IS_MATCHED_BY_MAJOR_AND_MINOR = MAJOR_VERSION === SUPPORTED_MAJOR_VERSION && MINOR_VERSION >= SUPPORTED_MINOR_VERSION;
  constants.IS_SUPPORT_READDIR_WITH_FILE_TYPES = IS_MATCHED_BY_MAJOR || IS_MATCHED_BY_MAJOR_AND_MINOR;
  return constants;
}
var utils$1 = {};
var fs$1 = {};
var hasRequiredFs$1;
function requireFs$1() {
  if (hasRequiredFs$1)
    return fs$1;
  hasRequiredFs$1 = 1;
  Object.defineProperty(fs$1, "__esModule", { value: true });
  fs$1.createDirentFromStats = void 0;
  class DirentFromStats {
    constructor(name, stats) {
      this.name = name;
      this.isBlockDevice = stats.isBlockDevice.bind(stats);
      this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
      this.isDirectory = stats.isDirectory.bind(stats);
      this.isFIFO = stats.isFIFO.bind(stats);
      this.isFile = stats.isFile.bind(stats);
      this.isSocket = stats.isSocket.bind(stats);
      this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
    }
  }
  function createDirentFromStats(name, stats) {
    return new DirentFromStats(name, stats);
  }
  fs$1.createDirentFromStats = createDirentFromStats;
  return fs$1;
}
var hasRequiredUtils$1;
function requireUtils$1() {
  if (hasRequiredUtils$1)
    return utils$1;
  hasRequiredUtils$1 = 1;
  Object.defineProperty(utils$1, "__esModule", { value: true });
  utils$1.fs = void 0;
  const fs2 = requireFs$1();
  utils$1.fs = fs2;
  return utils$1;
}
var common$2 = {};
var hasRequiredCommon$2;
function requireCommon$2() {
  if (hasRequiredCommon$2)
    return common$2;
  hasRequiredCommon$2 = 1;
  Object.defineProperty(common$2, "__esModule", { value: true });
  common$2.joinPathSegments = void 0;
  function joinPathSegments(a, b, separator) {
    if (a.endsWith(separator)) {
      return a + b;
    }
    return a + separator + b;
  }
  common$2.joinPathSegments = joinPathSegments;
  return common$2;
}
var hasRequiredAsync$4;
function requireAsync$4() {
  if (hasRequiredAsync$4)
    return async$1;
  hasRequiredAsync$4 = 1;
  Object.defineProperty(async$1, "__esModule", { value: true });
  async$1.readdir = async$1.readdirWithFileTypes = async$1.read = void 0;
  const fsStat2 = requireOut$3();
  const rpl = requireRunParallel();
  const constants_1 = requireConstants();
  const utils2 = requireUtils$1();
  const common2 = requireCommon$2();
  function read(directory, settings2, callback) {
    if (!settings2.stats && constants_1.IS_SUPPORT_READDIR_WITH_FILE_TYPES) {
      readdirWithFileTypes(directory, settings2, callback);
      return;
    }
    readdir(directory, settings2, callback);
  }
  async$1.read = read;
  function readdirWithFileTypes(directory, settings2, callback) {
    settings2.fs.readdir(directory, { withFileTypes: true }, (readdirError, dirents) => {
      if (readdirError !== null) {
        callFailureCallback(callback, readdirError);
        return;
      }
      const entries = dirents.map((dirent) => ({
        dirent,
        name: dirent.name,
        path: common2.joinPathSegments(directory, dirent.name, settings2.pathSegmentSeparator)
      }));
      if (!settings2.followSymbolicLinks) {
        callSuccessCallback(callback, entries);
        return;
      }
      const tasks2 = entries.map((entry2) => makeRplTaskEntry(entry2, settings2));
      rpl(tasks2, (rplError, rplEntries) => {
        if (rplError !== null) {
          callFailureCallback(callback, rplError);
          return;
        }
        callSuccessCallback(callback, rplEntries);
      });
    });
  }
  async$1.readdirWithFileTypes = readdirWithFileTypes;
  function makeRplTaskEntry(entry2, settings2) {
    return (done) => {
      if (!entry2.dirent.isSymbolicLink()) {
        done(null, entry2);
        return;
      }
      settings2.fs.stat(entry2.path, (statError, stats) => {
        if (statError !== null) {
          if (settings2.throwErrorOnBrokenSymbolicLink) {
            done(statError);
            return;
          }
          done(null, entry2);
          return;
        }
        entry2.dirent = utils2.fs.createDirentFromStats(entry2.name, stats);
        done(null, entry2);
      });
    };
  }
  function readdir(directory, settings2, callback) {
    settings2.fs.readdir(directory, (readdirError, names) => {
      if (readdirError !== null) {
        callFailureCallback(callback, readdirError);
        return;
      }
      const tasks2 = names.map((name) => {
        const path2 = common2.joinPathSegments(directory, name, settings2.pathSegmentSeparator);
        return (done) => {
          fsStat2.stat(path2, settings2.fsStatSettings, (error2, stats) => {
            if (error2 !== null) {
              done(error2);
              return;
            }
            const entry2 = {
              name,
              path: path2,
              dirent: utils2.fs.createDirentFromStats(name, stats)
            };
            if (settings2.stats) {
              entry2.stats = stats;
            }
            done(null, entry2);
          });
        };
      });
      rpl(tasks2, (rplError, entries) => {
        if (rplError !== null) {
          callFailureCallback(callback, rplError);
          return;
        }
        callSuccessCallback(callback, entries);
      });
    });
  }
  async$1.readdir = readdir;
  function callFailureCallback(callback, error2) {
    callback(error2);
  }
  function callSuccessCallback(callback, result) {
    callback(null, result);
  }
  return async$1;
}
var sync$4 = {};
var hasRequiredSync$4;
function requireSync$4() {
  if (hasRequiredSync$4)
    return sync$4;
  hasRequiredSync$4 = 1;
  Object.defineProperty(sync$4, "__esModule", { value: true });
  sync$4.readdir = sync$4.readdirWithFileTypes = sync$4.read = void 0;
  const fsStat2 = requireOut$3();
  const constants_1 = requireConstants();
  const utils2 = requireUtils$1();
  const common2 = requireCommon$2();
  function read(directory, settings2) {
    if (!settings2.stats && constants_1.IS_SUPPORT_READDIR_WITH_FILE_TYPES) {
      return readdirWithFileTypes(directory, settings2);
    }
    return readdir(directory, settings2);
  }
  sync$4.read = read;
  function readdirWithFileTypes(directory, settings2) {
    const dirents = settings2.fs.readdirSync(directory, { withFileTypes: true });
    return dirents.map((dirent) => {
      const entry2 = {
        dirent,
        name: dirent.name,
        path: common2.joinPathSegments(directory, dirent.name, settings2.pathSegmentSeparator)
      };
      if (entry2.dirent.isSymbolicLink() && settings2.followSymbolicLinks) {
        try {
          const stats = settings2.fs.statSync(entry2.path);
          entry2.dirent = utils2.fs.createDirentFromStats(entry2.name, stats);
        } catch (error2) {
          if (settings2.throwErrorOnBrokenSymbolicLink) {
            throw error2;
          }
        }
      }
      return entry2;
    });
  }
  sync$4.readdirWithFileTypes = readdirWithFileTypes;
  function readdir(directory, settings2) {
    const names = settings2.fs.readdirSync(directory);
    return names.map((name) => {
      const entryPath = common2.joinPathSegments(directory, name, settings2.pathSegmentSeparator);
      const stats = fsStat2.statSync(entryPath, settings2.fsStatSettings);
      const entry2 = {
        name,
        path: entryPath,
        dirent: utils2.fs.createDirentFromStats(name, stats)
      };
      if (settings2.stats) {
        entry2.stats = stats;
      }
      return entry2;
    });
  }
  sync$4.readdir = readdir;
  return sync$4;
}
var settings$2 = {};
var fs = {};
var hasRequiredFs;
function requireFs() {
  if (hasRequiredFs)
    return fs;
  hasRequiredFs = 1;
  (function(exports2) {
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createFileSystemAdapter = exports2.FILE_SYSTEM_ADAPTER = void 0;
    const fs2 = require$$0$1;
    exports2.FILE_SYSTEM_ADAPTER = {
      lstat: fs2.lstat,
      stat: fs2.stat,
      lstatSync: fs2.lstatSync,
      statSync: fs2.statSync,
      readdir: fs2.readdir,
      readdirSync: fs2.readdirSync
    };
    function createFileSystemAdapter(fsMethods) {
      if (fsMethods === void 0) {
        return exports2.FILE_SYSTEM_ADAPTER;
      }
      return Object.assign(Object.assign({}, exports2.FILE_SYSTEM_ADAPTER), fsMethods);
    }
    exports2.createFileSystemAdapter = createFileSystemAdapter;
  })(fs);
  return fs;
}
var hasRequiredSettings$2;
function requireSettings$2() {
  if (hasRequiredSettings$2)
    return settings$2;
  hasRequiredSettings$2 = 1;
  Object.defineProperty(settings$2, "__esModule", { value: true });
  const path2 = require$$0$3;
  const fsStat2 = requireOut$3();
  const fs2 = requireFs();
  class Settings {
    constructor(_options = {}) {
      this._options = _options;
      this.followSymbolicLinks = this._getValue(this._options.followSymbolicLinks, false);
      this.fs = fs2.createFileSystemAdapter(this._options.fs);
      this.pathSegmentSeparator = this._getValue(this._options.pathSegmentSeparator, path2.sep);
      this.stats = this._getValue(this._options.stats, false);
      this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, true);
      this.fsStatSettings = new fsStat2.Settings({
        followSymbolicLink: this.followSymbolicLinks,
        fs: this.fs,
        throwErrorOnBrokenSymbolicLink: this.throwErrorOnBrokenSymbolicLink
      });
    }
    _getValue(option, value) {
      return option !== null && option !== void 0 ? option : value;
    }
  }
  settings$2.default = Settings;
  return settings$2;
}
var hasRequiredOut$2;
function requireOut$2() {
  if (hasRequiredOut$2)
    return out$2;
  hasRequiredOut$2 = 1;
  Object.defineProperty(out$2, "__esModule", { value: true });
  out$2.Settings = out$2.scandirSync = out$2.scandir = void 0;
  const async2 = requireAsync$4();
  const sync2 = requireSync$4();
  const settings_1 = requireSettings$2();
  out$2.Settings = settings_1.default;
  function scandir(path2, optionsOrSettingsOrCallback, callback) {
    if (typeof optionsOrSettingsOrCallback === "function") {
      async2.read(path2, getSettings(), optionsOrSettingsOrCallback);
      return;
    }
    async2.read(path2, getSettings(optionsOrSettingsOrCallback), callback);
  }
  out$2.scandir = scandir;
  function scandirSync(path2, optionsOrSettings) {
    const settings2 = getSettings(optionsOrSettings);
    return sync2.read(path2, settings2);
  }
  out$2.scandirSync = scandirSync;
  function getSettings(settingsOrOptions = {}) {
    if (settingsOrOptions instanceof settings_1.default) {
      return settingsOrOptions;
    }
    return new settings_1.default(settingsOrOptions);
  }
  return out$2;
}
var queue = { exports: {} };
var reusify_1;
var hasRequiredReusify;
function requireReusify() {
  if (hasRequiredReusify)
    return reusify_1;
  hasRequiredReusify = 1;
  function reusify(Constructor) {
    var head = new Constructor();
    var tail = head;
    function get() {
      var current = head;
      if (current.next) {
        head = current.next;
      } else {
        head = new Constructor();
        tail = head;
      }
      current.next = null;
      return current;
    }
    function release(obj) {
      tail.next = obj;
      tail = obj;
    }
    return {
      get,
      release
    };
  }
  reusify_1 = reusify;
  return reusify_1;
}
var hasRequiredQueue;
function requireQueue() {
  if (hasRequiredQueue)
    return queue.exports;
  hasRequiredQueue = 1;
  var reusify = requireReusify();
  function fastqueue(context, worker, concurrency) {
    if (typeof context === "function") {
      concurrency = worker;
      worker = context;
      context = null;
    }
    if (concurrency < 1) {
      throw new Error("fastqueue concurrency must be greater than 1");
    }
    var cache = reusify(Task);
    var queueHead = null;
    var queueTail = null;
    var _running = 0;
    var errorHandler = null;
    var self2 = {
      push,
      drain: noop2,
      saturated: noop2,
      pause,
      paused: false,
      concurrency,
      running,
      resume,
      idle,
      length,
      getQueue,
      unshift,
      empty: noop2,
      kill,
      killAndDrain,
      error: error2
    };
    return self2;
    function running() {
      return _running;
    }
    function pause() {
      self2.paused = true;
    }
    function length() {
      var current = queueHead;
      var counter = 0;
      while (current) {
        current = current.next;
        counter++;
      }
      return counter;
    }
    function getQueue() {
      var current = queueHead;
      var tasks2 = [];
      while (current) {
        tasks2.push(current.value);
        current = current.next;
      }
      return tasks2;
    }
    function resume() {
      if (!self2.paused)
        return;
      self2.paused = false;
      for (var i = 0; i < self2.concurrency; i++) {
        _running++;
        release();
      }
    }
    function idle() {
      return _running === 0 && self2.length() === 0;
    }
    function push(value, done) {
      var current = cache.get();
      current.context = context;
      current.release = release;
      current.value = value;
      current.callback = done || noop2;
      current.errorHandler = errorHandler;
      if (_running === self2.concurrency || self2.paused) {
        if (queueTail) {
          queueTail.next = current;
          queueTail = current;
        } else {
          queueHead = current;
          queueTail = current;
          self2.saturated();
        }
      } else {
        _running++;
        worker.call(context, current.value, current.worked);
      }
    }
    function unshift(value, done) {
      var current = cache.get();
      current.context = context;
      current.release = release;
      current.value = value;
      current.callback = done || noop2;
      if (_running === self2.concurrency || self2.paused) {
        if (queueHead) {
          current.next = queueHead;
          queueHead = current;
        } else {
          queueHead = current;
          queueTail = current;
          self2.saturated();
        }
      } else {
        _running++;
        worker.call(context, current.value, current.worked);
      }
    }
    function release(holder) {
      if (holder) {
        cache.release(holder);
      }
      var next = queueHead;
      if (next) {
        if (!self2.paused) {
          if (queueTail === queueHead) {
            queueTail = null;
          }
          queueHead = next.next;
          next.next = null;
          worker.call(context, next.value, next.worked);
          if (queueTail === null) {
            self2.empty();
          }
        } else {
          _running--;
        }
      } else if (--_running === 0) {
        self2.drain();
      }
    }
    function kill() {
      queueHead = null;
      queueTail = null;
      self2.drain = noop2;
    }
    function killAndDrain() {
      queueHead = null;
      queueTail = null;
      self2.drain();
      self2.drain = noop2;
    }
    function error2(handler) {
      errorHandler = handler;
    }
  }
  function noop2() {
  }
  function Task() {
    this.value = null;
    this.callback = noop2;
    this.next = null;
    this.release = noop2;
    this.context = null;
    this.errorHandler = null;
    var self2 = this;
    this.worked = function worked(err, result) {
      var callback = self2.callback;
      var errorHandler = self2.errorHandler;
      var val = self2.value;
      self2.value = null;
      self2.callback = noop2;
      if (self2.errorHandler) {
        errorHandler(err, val);
      }
      callback.call(self2.context, err, result);
      self2.release(self2);
    };
  }
  function queueAsPromised(context, worker, concurrency) {
    if (typeof context === "function") {
      concurrency = worker;
      worker = context;
      context = null;
    }
    function asyncWrapper(arg, cb) {
      worker.call(this, arg).then(function(res) {
        cb(null, res);
      }, cb);
    }
    var queue2 = fastqueue(context, asyncWrapper, concurrency);
    var pushCb = queue2.push;
    var unshiftCb = queue2.unshift;
    queue2.push = push;
    queue2.unshift = unshift;
    queue2.drained = drained;
    return queue2;
    function push(value) {
      var p = new Promise(function(resolve, reject) {
        pushCb(value, function(err, result) {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
      p.catch(noop2);
      return p;
    }
    function unshift(value) {
      var p = new Promise(function(resolve, reject) {
        unshiftCb(value, function(err, result) {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
      p.catch(noop2);
      return p;
    }
    function drained() {
      if (queue2.idle()) {
        return new Promise(function(resolve) {
          resolve();
        });
      }
      var previousDrain = queue2.drain;
      var p = new Promise(function(resolve) {
        queue2.drain = function() {
          previousDrain();
          resolve();
        };
      });
      return p;
    }
  }
  queue.exports = fastqueue;
  queue.exports.promise = queueAsPromised;
  return queue.exports;
}
var common$1 = {};
var hasRequiredCommon$1;
function requireCommon$1() {
  if (hasRequiredCommon$1)
    return common$1;
  hasRequiredCommon$1 = 1;
  Object.defineProperty(common$1, "__esModule", { value: true });
  common$1.joinPathSegments = common$1.replacePathSegmentSeparator = common$1.isAppliedFilter = common$1.isFatalError = void 0;
  function isFatalError(settings2, error2) {
    if (settings2.errorFilter === null) {
      return true;
    }
    return !settings2.errorFilter(error2);
  }
  common$1.isFatalError = isFatalError;
  function isAppliedFilter(filter, value) {
    return filter === null || filter(value);
  }
  common$1.isAppliedFilter = isAppliedFilter;
  function replacePathSegmentSeparator(filepath, separator) {
    return filepath.split(/[/\\]/).join(separator);
  }
  common$1.replacePathSegmentSeparator = replacePathSegmentSeparator;
  function joinPathSegments(a, b, separator) {
    if (a === "") {
      return b;
    }
    if (a.endsWith(separator)) {
      return a + b;
    }
    return a + separator + b;
  }
  common$1.joinPathSegments = joinPathSegments;
  return common$1;
}
var reader$1 = {};
var hasRequiredReader$1;
function requireReader$1() {
  if (hasRequiredReader$1)
    return reader$1;
  hasRequiredReader$1 = 1;
  Object.defineProperty(reader$1, "__esModule", { value: true });
  const common2 = requireCommon$1();
  class Reader {
    constructor(_root, _settings) {
      this._root = _root;
      this._settings = _settings;
      this._root = common2.replacePathSegmentSeparator(_root, _settings.pathSegmentSeparator);
    }
  }
  reader$1.default = Reader;
  return reader$1;
}
var hasRequiredAsync$3;
function requireAsync$3() {
  if (hasRequiredAsync$3)
    return async$2;
  hasRequiredAsync$3 = 1;
  Object.defineProperty(async$2, "__esModule", { value: true });
  const events_1 = require$$4;
  const fsScandir = requireOut$2();
  const fastq = requireQueue();
  const common2 = requireCommon$1();
  const reader_1 = requireReader$1();
  class AsyncReader extends reader_1.default {
    constructor(_root, _settings) {
      super(_root, _settings);
      this._settings = _settings;
      this._scandir = fsScandir.scandir;
      this._emitter = new events_1.EventEmitter();
      this._queue = fastq(this._worker.bind(this), this._settings.concurrency);
      this._isFatalError = false;
      this._isDestroyed = false;
      this._queue.drain = () => {
        if (!this._isFatalError) {
          this._emitter.emit("end");
        }
      };
    }
    read() {
      this._isFatalError = false;
      this._isDestroyed = false;
      setImmediate(() => {
        this._pushToQueue(this._root, this._settings.basePath);
      });
      return this._emitter;
    }
    get isDestroyed() {
      return this._isDestroyed;
    }
    destroy() {
      if (this._isDestroyed) {
        throw new Error("The reader is already destroyed");
      }
      this._isDestroyed = true;
      this._queue.killAndDrain();
    }
    onEntry(callback) {
      this._emitter.on("entry", callback);
    }
    onError(callback) {
      this._emitter.once("error", callback);
    }
    onEnd(callback) {
      this._emitter.once("end", callback);
    }
    _pushToQueue(directory, base) {
      const queueItem = { directory, base };
      this._queue.push(queueItem, (error2) => {
        if (error2 !== null) {
          this._handleError(error2);
        }
      });
    }
    _worker(item, done) {
      this._scandir(item.directory, this._settings.fsScandirSettings, (error2, entries) => {
        if (error2 !== null) {
          done(error2, void 0);
          return;
        }
        for (const entry2 of entries) {
          this._handleEntry(entry2, item.base);
        }
        done(null, void 0);
      });
    }
    _handleError(error2) {
      if (this._isDestroyed || !common2.isFatalError(this._settings, error2)) {
        return;
      }
      this._isFatalError = true;
      this._isDestroyed = true;
      this._emitter.emit("error", error2);
    }
    _handleEntry(entry2, base) {
      if (this._isDestroyed || this._isFatalError) {
        return;
      }
      const fullpath = entry2.path;
      if (base !== void 0) {
        entry2.path = common2.joinPathSegments(base, entry2.name, this._settings.pathSegmentSeparator);
      }
      if (common2.isAppliedFilter(this._settings.entryFilter, entry2)) {
        this._emitEntry(entry2);
      }
      if (entry2.dirent.isDirectory() && common2.isAppliedFilter(this._settings.deepFilter, entry2)) {
        this._pushToQueue(fullpath, base === void 0 ? void 0 : entry2.path);
      }
    }
    _emitEntry(entry2) {
      this._emitter.emit("entry", entry2);
    }
  }
  async$2.default = AsyncReader;
  return async$2;
}
var hasRequiredAsync$2;
function requireAsync$2() {
  if (hasRequiredAsync$2)
    return async$3;
  hasRequiredAsync$2 = 1;
  Object.defineProperty(async$3, "__esModule", { value: true });
  const async_1 = requireAsync$3();
  class AsyncProvider {
    constructor(_root, _settings) {
      this._root = _root;
      this._settings = _settings;
      this._reader = new async_1.default(this._root, this._settings);
      this._storage = [];
    }
    read(callback) {
      this._reader.onError((error2) => {
        callFailureCallback(callback, error2);
      });
      this._reader.onEntry((entry2) => {
        this._storage.push(entry2);
      });
      this._reader.onEnd(() => {
        callSuccessCallback(callback, this._storage);
      });
      this._reader.read();
    }
  }
  async$3.default = AsyncProvider;
  function callFailureCallback(callback, error2) {
    callback(error2);
  }
  function callSuccessCallback(callback, entries) {
    callback(null, entries);
  }
  return async$3;
}
var stream$2 = {};
var hasRequiredStream$2;
function requireStream$2() {
  if (hasRequiredStream$2)
    return stream$2;
  hasRequiredStream$2 = 1;
  Object.defineProperty(stream$2, "__esModule", { value: true });
  const stream_1 = require$$0$6;
  const async_1 = requireAsync$3();
  class StreamProvider {
    constructor(_root, _settings) {
      this._root = _root;
      this._settings = _settings;
      this._reader = new async_1.default(this._root, this._settings);
      this._stream = new stream_1.Readable({
        objectMode: true,
        read: () => {
        },
        destroy: () => {
          if (!this._reader.isDestroyed) {
            this._reader.destroy();
          }
        }
      });
    }
    read() {
      this._reader.onError((error2) => {
        this._stream.emit("error", error2);
      });
      this._reader.onEntry((entry2) => {
        this._stream.push(entry2);
      });
      this._reader.onEnd(() => {
        this._stream.push(null);
      });
      this._reader.read();
      return this._stream;
    }
  }
  stream$2.default = StreamProvider;
  return stream$2;
}
var sync$3 = {};
var sync$2 = {};
var hasRequiredSync$3;
function requireSync$3() {
  if (hasRequiredSync$3)
    return sync$2;
  hasRequiredSync$3 = 1;
  Object.defineProperty(sync$2, "__esModule", { value: true });
  const fsScandir = requireOut$2();
  const common2 = requireCommon$1();
  const reader_1 = requireReader$1();
  class SyncReader extends reader_1.default {
    constructor() {
      super(...arguments);
      this._scandir = fsScandir.scandirSync;
      this._storage = [];
      this._queue = /* @__PURE__ */ new Set();
    }
    read() {
      this._pushToQueue(this._root, this._settings.basePath);
      this._handleQueue();
      return this._storage;
    }
    _pushToQueue(directory, base) {
      this._queue.add({ directory, base });
    }
    _handleQueue() {
      for (const item of this._queue.values()) {
        this._handleDirectory(item.directory, item.base);
      }
    }
    _handleDirectory(directory, base) {
      try {
        const entries = this._scandir(directory, this._settings.fsScandirSettings);
        for (const entry2 of entries) {
          this._handleEntry(entry2, base);
        }
      } catch (error2) {
        this._handleError(error2);
      }
    }
    _handleError(error2) {
      if (!common2.isFatalError(this._settings, error2)) {
        return;
      }
      throw error2;
    }
    _handleEntry(entry2, base) {
      const fullpath = entry2.path;
      if (base !== void 0) {
        entry2.path = common2.joinPathSegments(base, entry2.name, this._settings.pathSegmentSeparator);
      }
      if (common2.isAppliedFilter(this._settings.entryFilter, entry2)) {
        this._pushToStorage(entry2);
      }
      if (entry2.dirent.isDirectory() && common2.isAppliedFilter(this._settings.deepFilter, entry2)) {
        this._pushToQueue(fullpath, base === void 0 ? void 0 : entry2.path);
      }
    }
    _pushToStorage(entry2) {
      this._storage.push(entry2);
    }
  }
  sync$2.default = SyncReader;
  return sync$2;
}
var hasRequiredSync$2;
function requireSync$2() {
  if (hasRequiredSync$2)
    return sync$3;
  hasRequiredSync$2 = 1;
  Object.defineProperty(sync$3, "__esModule", { value: true });
  const sync_1 = requireSync$3();
  class SyncProvider {
    constructor(_root, _settings) {
      this._root = _root;
      this._settings = _settings;
      this._reader = new sync_1.default(this._root, this._settings);
    }
    read() {
      return this._reader.read();
    }
  }
  sync$3.default = SyncProvider;
  return sync$3;
}
var settings$1 = {};
var hasRequiredSettings$1;
function requireSettings$1() {
  if (hasRequiredSettings$1)
    return settings$1;
  hasRequiredSettings$1 = 1;
  Object.defineProperty(settings$1, "__esModule", { value: true });
  const path2 = require$$0$3;
  const fsScandir = requireOut$2();
  class Settings {
    constructor(_options = {}) {
      this._options = _options;
      this.basePath = this._getValue(this._options.basePath, void 0);
      this.concurrency = this._getValue(this._options.concurrency, Number.POSITIVE_INFINITY);
      this.deepFilter = this._getValue(this._options.deepFilter, null);
      this.entryFilter = this._getValue(this._options.entryFilter, null);
      this.errorFilter = this._getValue(this._options.errorFilter, null);
      this.pathSegmentSeparator = this._getValue(this._options.pathSegmentSeparator, path2.sep);
      this.fsScandirSettings = new fsScandir.Settings({
        followSymbolicLinks: this._options.followSymbolicLinks,
        fs: this._options.fs,
        pathSegmentSeparator: this._options.pathSegmentSeparator,
        stats: this._options.stats,
        throwErrorOnBrokenSymbolicLink: this._options.throwErrorOnBrokenSymbolicLink
      });
    }
    _getValue(option, value) {
      return option !== null && option !== void 0 ? option : value;
    }
  }
  settings$1.default = Settings;
  return settings$1;
}
var hasRequiredOut$1;
function requireOut$1() {
  if (hasRequiredOut$1)
    return out$3;
  hasRequiredOut$1 = 1;
  Object.defineProperty(out$3, "__esModule", { value: true });
  out$3.Settings = out$3.walkStream = out$3.walkSync = out$3.walk = void 0;
  const async_1 = requireAsync$2();
  const stream_1 = requireStream$2();
  const sync_1 = requireSync$2();
  const settings_1 = requireSettings$1();
  out$3.Settings = settings_1.default;
  function walk(directory, optionsOrSettingsOrCallback, callback) {
    if (typeof optionsOrSettingsOrCallback === "function") {
      new async_1.default(directory, getSettings()).read(optionsOrSettingsOrCallback);
      return;
    }
    new async_1.default(directory, getSettings(optionsOrSettingsOrCallback)).read(callback);
  }
  out$3.walk = walk;
  function walkSync(directory, optionsOrSettings) {
    const settings2 = getSettings(optionsOrSettings);
    const provider2 = new sync_1.default(directory, settings2);
    return provider2.read();
  }
  out$3.walkSync = walkSync;
  function walkStream(directory, optionsOrSettings) {
    const settings2 = getSettings(optionsOrSettings);
    const provider2 = new stream_1.default(directory, settings2);
    return provider2.read();
  }
  out$3.walkStream = walkStream;
  function getSettings(settingsOrOptions = {}) {
    if (settingsOrOptions instanceof settings_1.default) {
      return settingsOrOptions;
    }
    return new settings_1.default(settingsOrOptions);
  }
  return out$3;
}
var reader = {};
var hasRequiredReader;
function requireReader() {
  if (hasRequiredReader)
    return reader;
  hasRequiredReader = 1;
  Object.defineProperty(reader, "__esModule", { value: true });
  const path2 = require$$0$3;
  const fsStat2 = requireOut$3();
  const utils2 = requireUtils$2();
  class Reader {
    constructor(_settings) {
      this._settings = _settings;
      this._fsStatSettings = new fsStat2.Settings({
        followSymbolicLink: this._settings.followSymbolicLinks,
        fs: this._settings.fs,
        throwErrorOnBrokenSymbolicLink: this._settings.followSymbolicLinks
      });
    }
    _getFullEntryPath(filepath) {
      return path2.resolve(this._settings.cwd, filepath);
    }
    _makeEntry(stats, pattern2) {
      const entry2 = {
        name: pattern2,
        path: pattern2,
        dirent: utils2.fs.createDirentFromStats(pattern2, stats)
      };
      if (this._settings.stats) {
        entry2.stats = stats;
      }
      return entry2;
    }
    _isFatalError(error2) {
      return !utils2.errno.isEnoentCodeError(error2) && !this._settings.suppressErrors;
    }
  }
  reader.default = Reader;
  return reader;
}
var stream$1 = {};
var hasRequiredStream$1;
function requireStream$1() {
  if (hasRequiredStream$1)
    return stream$1;
  hasRequiredStream$1 = 1;
  Object.defineProperty(stream$1, "__esModule", { value: true });
  const stream_1 = require$$0$6;
  const fsStat2 = requireOut$3();
  const fsWalk = requireOut$1();
  const reader_1 = requireReader();
  class ReaderStream extends reader_1.default {
    constructor() {
      super(...arguments);
      this._walkStream = fsWalk.walkStream;
      this._stat = fsStat2.stat;
    }
    dynamic(root, options) {
      return this._walkStream(root, options);
    }
    static(patterns, options) {
      const filepaths = patterns.map(this._getFullEntryPath, this);
      const stream2 = new stream_1.PassThrough({ objectMode: true });
      stream2._write = (index, _enc, done) => {
        return this._getEntry(filepaths[index], patterns[index], options).then((entry2) => {
          if (entry2 !== null && options.entryFilter(entry2)) {
            stream2.push(entry2);
          }
          if (index === filepaths.length - 1) {
            stream2.end();
          }
          done();
        }).catch(done);
      };
      for (let i = 0; i < filepaths.length; i++) {
        stream2.write(i);
      }
      return stream2;
    }
    _getEntry(filepath, pattern2, options) {
      return this._getStat(filepath).then((stats) => this._makeEntry(stats, pattern2)).catch((error2) => {
        if (options.errorFilter(error2)) {
          return null;
        }
        throw error2;
      });
    }
    _getStat(filepath) {
      return new Promise((resolve, reject) => {
        this._stat(filepath, this._fsStatSettings, (error2, stats) => {
          return error2 === null ? resolve(stats) : reject(error2);
        });
      });
    }
  }
  stream$1.default = ReaderStream;
  return stream$1;
}
var hasRequiredAsync$1;
function requireAsync$1() {
  if (hasRequiredAsync$1)
    return async$4;
  hasRequiredAsync$1 = 1;
  Object.defineProperty(async$4, "__esModule", { value: true });
  const fsWalk = requireOut$1();
  const reader_1 = requireReader();
  const stream_1 = requireStream$1();
  class ReaderAsync extends reader_1.default {
    constructor() {
      super(...arguments);
      this._walkAsync = fsWalk.walk;
      this._readerStream = new stream_1.default(this._settings);
    }
    dynamic(root, options) {
      return new Promise((resolve, reject) => {
        this._walkAsync(root, options, (error2, entries) => {
          if (error2 === null) {
            resolve(entries);
          } else {
            reject(error2);
          }
        });
      });
    }
    async static(patterns, options) {
      const entries = [];
      const stream2 = this._readerStream.static(patterns, options);
      return new Promise((resolve, reject) => {
        stream2.once("error", reject);
        stream2.on("data", (entry2) => entries.push(entry2));
        stream2.once("end", () => resolve(entries));
      });
    }
  }
  async$4.default = ReaderAsync;
  return async$4;
}
var provider = {};
var deep = {};
var partial = {};
var matcher = {};
var hasRequiredMatcher;
function requireMatcher() {
  if (hasRequiredMatcher)
    return matcher;
  hasRequiredMatcher = 1;
  Object.defineProperty(matcher, "__esModule", { value: true });
  const utils2 = requireUtils$2();
  class Matcher {
    constructor(_patterns, _settings, _micromatchOptions) {
      this._patterns = _patterns;
      this._settings = _settings;
      this._micromatchOptions = _micromatchOptions;
      this._storage = [];
      this._fillStorage();
    }
    _fillStorage() {
      for (const pattern2 of this._patterns) {
        const segments = this._getPatternSegments(pattern2);
        const sections = this._splitSegmentsIntoSections(segments);
        this._storage.push({
          complete: sections.length <= 1,
          pattern: pattern2,
          segments,
          sections
        });
      }
    }
    _getPatternSegments(pattern2) {
      const parts = utils2.pattern.getPatternParts(pattern2, this._micromatchOptions);
      return parts.map((part) => {
        const dynamic = utils2.pattern.isDynamicPattern(part, this._settings);
        if (!dynamic) {
          return {
            dynamic: false,
            pattern: part
          };
        }
        return {
          dynamic: true,
          pattern: part,
          patternRe: utils2.pattern.makeRe(part, this._micromatchOptions)
        };
      });
    }
    _splitSegmentsIntoSections(segments) {
      return utils2.array.splitWhen(segments, (segment) => segment.dynamic && utils2.pattern.hasGlobStar(segment.pattern));
    }
  }
  matcher.default = Matcher;
  return matcher;
}
var hasRequiredPartial;
function requirePartial() {
  if (hasRequiredPartial)
    return partial;
  hasRequiredPartial = 1;
  Object.defineProperty(partial, "__esModule", { value: true });
  const matcher_1 = requireMatcher();
  class PartialMatcher extends matcher_1.default {
    match(filepath) {
      const parts = filepath.split("/");
      const levels = parts.length;
      const patterns = this._storage.filter((info) => !info.complete || info.segments.length > levels);
      for (const pattern2 of patterns) {
        const section = pattern2.sections[0];
        if (!pattern2.complete && levels > section.length) {
          return true;
        }
        const match = parts.every((part, index) => {
          const segment = pattern2.segments[index];
          if (segment.dynamic && segment.patternRe.test(part)) {
            return true;
          }
          if (!segment.dynamic && segment.pattern === part) {
            return true;
          }
          return false;
        });
        if (match) {
          return true;
        }
      }
      return false;
    }
  }
  partial.default = PartialMatcher;
  return partial;
}
var hasRequiredDeep;
function requireDeep() {
  if (hasRequiredDeep)
    return deep;
  hasRequiredDeep = 1;
  Object.defineProperty(deep, "__esModule", { value: true });
  const utils2 = requireUtils$2();
  const partial_1 = requirePartial();
  class DeepFilter {
    constructor(_settings, _micromatchOptions) {
      this._settings = _settings;
      this._micromatchOptions = _micromatchOptions;
    }
    getFilter(basePath, positive, negative) {
      const matcher2 = this._getMatcher(positive);
      const negativeRe = this._getNegativePatternsRe(negative);
      return (entry2) => this._filter(basePath, entry2, matcher2, negativeRe);
    }
    _getMatcher(patterns) {
      return new partial_1.default(patterns, this._settings, this._micromatchOptions);
    }
    _getNegativePatternsRe(patterns) {
      const affectDepthOfReadingPatterns = patterns.filter(utils2.pattern.isAffectDepthOfReadingPattern);
      return utils2.pattern.convertPatternsToRe(affectDepthOfReadingPatterns, this._micromatchOptions);
    }
    _filter(basePath, entry2, matcher2, negativeRe) {
      if (this._isSkippedByDeep(basePath, entry2.path)) {
        return false;
      }
      if (this._isSkippedSymbolicLink(entry2)) {
        return false;
      }
      const filepath = utils2.path.removeLeadingDotSegment(entry2.path);
      if (this._isSkippedByPositivePatterns(filepath, matcher2)) {
        return false;
      }
      return this._isSkippedByNegativePatterns(filepath, negativeRe);
    }
    _isSkippedByDeep(basePath, entryPath) {
      if (this._settings.deep === Infinity) {
        return false;
      }
      return this._getEntryLevel(basePath, entryPath) >= this._settings.deep;
    }
    _getEntryLevel(basePath, entryPath) {
      const entryPathDepth = entryPath.split("/").length;
      if (basePath === "") {
        return entryPathDepth;
      }
      const basePathDepth = basePath.split("/").length;
      return entryPathDepth - basePathDepth;
    }
    _isSkippedSymbolicLink(entry2) {
      return !this._settings.followSymbolicLinks && entry2.dirent.isSymbolicLink();
    }
    _isSkippedByPositivePatterns(entryPath, matcher2) {
      return !this._settings.baseNameMatch && !matcher2.match(entryPath);
    }
    _isSkippedByNegativePatterns(entryPath, patternsRe) {
      return !utils2.pattern.matchAny(entryPath, patternsRe);
    }
  }
  deep.default = DeepFilter;
  return deep;
}
var entry$1 = {};
var hasRequiredEntry$1;
function requireEntry$1() {
  if (hasRequiredEntry$1)
    return entry$1;
  hasRequiredEntry$1 = 1;
  Object.defineProperty(entry$1, "__esModule", { value: true });
  const utils2 = requireUtils$2();
  class EntryFilter {
    constructor(_settings, _micromatchOptions) {
      this._settings = _settings;
      this._micromatchOptions = _micromatchOptions;
      this.index = /* @__PURE__ */ new Map();
    }
    getFilter(positive, negative) {
      const positiveRe = utils2.pattern.convertPatternsToRe(positive, this._micromatchOptions);
      const negativeRe = utils2.pattern.convertPatternsToRe(negative, Object.assign(Object.assign({}, this._micromatchOptions), { dot: true }));
      return (entry2) => this._filter(entry2, positiveRe, negativeRe);
    }
    _filter(entry2, positiveRe, negativeRe) {
      const filepath = utils2.path.removeLeadingDotSegment(entry2.path);
      if (this._settings.unique && this._isDuplicateEntry(filepath)) {
        return false;
      }
      if (this._onlyFileFilter(entry2) || this._onlyDirectoryFilter(entry2)) {
        return false;
      }
      if (this._isSkippedByAbsoluteNegativePatterns(filepath, negativeRe)) {
        return false;
      }
      const isDirectory = entry2.dirent.isDirectory();
      const isMatched = this._isMatchToPatterns(filepath, positiveRe, isDirectory) && !this._isMatchToPatterns(filepath, negativeRe, isDirectory);
      if (this._settings.unique && isMatched) {
        this._createIndexRecord(filepath);
      }
      return isMatched;
    }
    _isDuplicateEntry(filepath) {
      return this.index.has(filepath);
    }
    _createIndexRecord(filepath) {
      this.index.set(filepath, void 0);
    }
    _onlyFileFilter(entry2) {
      return this._settings.onlyFiles && !entry2.dirent.isFile();
    }
    _onlyDirectoryFilter(entry2) {
      return this._settings.onlyDirectories && !entry2.dirent.isDirectory();
    }
    _isSkippedByAbsoluteNegativePatterns(entryPath, patternsRe) {
      if (!this._settings.absolute) {
        return false;
      }
      const fullpath = utils2.path.makeAbsolute(this._settings.cwd, entryPath);
      return utils2.pattern.matchAny(fullpath, patternsRe);
    }
    _isMatchToPatterns(filepath, patternsRe, isDirectory) {
      const isMatched = utils2.pattern.matchAny(filepath, patternsRe);
      if (!isMatched && isDirectory) {
        return utils2.pattern.matchAny(filepath + "/", patternsRe);
      }
      return isMatched;
    }
  }
  entry$1.default = EntryFilter;
  return entry$1;
}
var error = {};
var hasRequiredError;
function requireError() {
  if (hasRequiredError)
    return error;
  hasRequiredError = 1;
  Object.defineProperty(error, "__esModule", { value: true });
  const utils2 = requireUtils$2();
  class ErrorFilter {
    constructor(_settings) {
      this._settings = _settings;
    }
    getFilter() {
      return (error2) => this._isNonFatalError(error2);
    }
    _isNonFatalError(error2) {
      return utils2.errno.isEnoentCodeError(error2) || this._settings.suppressErrors;
    }
  }
  error.default = ErrorFilter;
  return error;
}
var entry = {};
var hasRequiredEntry;
function requireEntry() {
  if (hasRequiredEntry)
    return entry;
  hasRequiredEntry = 1;
  Object.defineProperty(entry, "__esModule", { value: true });
  const utils2 = requireUtils$2();
  class EntryTransformer {
    constructor(_settings) {
      this._settings = _settings;
    }
    getTransformer() {
      return (entry2) => this._transform(entry2);
    }
    _transform(entry2) {
      let filepath = entry2.path;
      if (this._settings.absolute) {
        filepath = utils2.path.makeAbsolute(this._settings.cwd, filepath);
        filepath = utils2.path.unixify(filepath);
      }
      if (this._settings.markDirectories && entry2.dirent.isDirectory()) {
        filepath += "/";
      }
      if (!this._settings.objectMode) {
        return filepath;
      }
      return Object.assign(Object.assign({}, entry2), { path: filepath });
    }
  }
  entry.default = EntryTransformer;
  return entry;
}
var hasRequiredProvider;
function requireProvider() {
  if (hasRequiredProvider)
    return provider;
  hasRequiredProvider = 1;
  Object.defineProperty(provider, "__esModule", { value: true });
  const path2 = require$$0$3;
  const deep_1 = requireDeep();
  const entry_1 = requireEntry$1();
  const error_1 = requireError();
  const entry_2 = requireEntry();
  class Provider {
    constructor(_settings) {
      this._settings = _settings;
      this.errorFilter = new error_1.default(this._settings);
      this.entryFilter = new entry_1.default(this._settings, this._getMicromatchOptions());
      this.deepFilter = new deep_1.default(this._settings, this._getMicromatchOptions());
      this.entryTransformer = new entry_2.default(this._settings);
    }
    _getRootDirectory(task) {
      return path2.resolve(this._settings.cwd, task.base);
    }
    _getReaderOptions(task) {
      const basePath = task.base === "." ? "" : task.base;
      return {
        basePath,
        pathSegmentSeparator: "/",
        concurrency: this._settings.concurrency,
        deepFilter: this.deepFilter.getFilter(basePath, task.positive, task.negative),
        entryFilter: this.entryFilter.getFilter(task.positive, task.negative),
        errorFilter: this.errorFilter.getFilter(),
        followSymbolicLinks: this._settings.followSymbolicLinks,
        fs: this._settings.fs,
        stats: this._settings.stats,
        throwErrorOnBrokenSymbolicLink: this._settings.throwErrorOnBrokenSymbolicLink,
        transform: this.entryTransformer.getTransformer()
      };
    }
    _getMicromatchOptions() {
      return {
        dot: this._settings.dot,
        matchBase: this._settings.baseNameMatch,
        nobrace: !this._settings.braceExpansion,
        nocase: !this._settings.caseSensitiveMatch,
        noext: !this._settings.extglob,
        noglobstar: !this._settings.globstar,
        posix: true,
        strictSlashes: false
      };
    }
  }
  provider.default = Provider;
  return provider;
}
var hasRequiredAsync;
function requireAsync() {
  if (hasRequiredAsync)
    return async$5;
  hasRequiredAsync = 1;
  Object.defineProperty(async$5, "__esModule", { value: true });
  const async_1 = requireAsync$1();
  const provider_1 = requireProvider();
  class ProviderAsync extends provider_1.default {
    constructor() {
      super(...arguments);
      this._reader = new async_1.default(this._settings);
    }
    async read(task) {
      const root = this._getRootDirectory(task);
      const options = this._getReaderOptions(task);
      const entries = await this.api(root, task, options);
      return entries.map((entry2) => options.transform(entry2));
    }
    api(root, task, options) {
      if (task.dynamic) {
        return this._reader.dynamic(root, options);
      }
      return this._reader.static(task.patterns, options);
    }
  }
  async$5.default = ProviderAsync;
  return async$5;
}
var stream = {};
var hasRequiredStream;
function requireStream() {
  if (hasRequiredStream)
    return stream;
  hasRequiredStream = 1;
  Object.defineProperty(stream, "__esModule", { value: true });
  const stream_1 = require$$0$6;
  const stream_2 = requireStream$1();
  const provider_1 = requireProvider();
  class ProviderStream extends provider_1.default {
    constructor() {
      super(...arguments);
      this._reader = new stream_2.default(this._settings);
    }
    read(task) {
      const root = this._getRootDirectory(task);
      const options = this._getReaderOptions(task);
      const source = this.api(root, task, options);
      const destination = new stream_1.Readable({ objectMode: true, read: () => {
      } });
      source.once("error", (error2) => destination.emit("error", error2)).on("data", (entry2) => destination.emit("data", options.transform(entry2))).once("end", () => destination.emit("end"));
      destination.once("close", () => source.destroy());
      return destination;
    }
    api(root, task, options) {
      if (task.dynamic) {
        return this._reader.dynamic(root, options);
      }
      return this._reader.static(task.patterns, options);
    }
  }
  stream.default = ProviderStream;
  return stream;
}
var sync$1 = {};
var sync = {};
var hasRequiredSync$1;
function requireSync$1() {
  if (hasRequiredSync$1)
    return sync;
  hasRequiredSync$1 = 1;
  Object.defineProperty(sync, "__esModule", { value: true });
  const fsStat2 = requireOut$3();
  const fsWalk = requireOut$1();
  const reader_1 = requireReader();
  class ReaderSync extends reader_1.default {
    constructor() {
      super(...arguments);
      this._walkSync = fsWalk.walkSync;
      this._statSync = fsStat2.statSync;
    }
    dynamic(root, options) {
      return this._walkSync(root, options);
    }
    static(patterns, options) {
      const entries = [];
      for (const pattern2 of patterns) {
        const filepath = this._getFullEntryPath(pattern2);
        const entry2 = this._getEntry(filepath, pattern2, options);
        if (entry2 === null || !options.entryFilter(entry2)) {
          continue;
        }
        entries.push(entry2);
      }
      return entries;
    }
    _getEntry(filepath, pattern2, options) {
      try {
        const stats = this._getStat(filepath);
        return this._makeEntry(stats, pattern2);
      } catch (error2) {
        if (options.errorFilter(error2)) {
          return null;
        }
        throw error2;
      }
    }
    _getStat(filepath) {
      return this._statSync(filepath, this._fsStatSettings);
    }
  }
  sync.default = ReaderSync;
  return sync;
}
var hasRequiredSync;
function requireSync() {
  if (hasRequiredSync)
    return sync$1;
  hasRequiredSync = 1;
  Object.defineProperty(sync$1, "__esModule", { value: true });
  const sync_1 = requireSync$1();
  const provider_1 = requireProvider();
  class ProviderSync extends provider_1.default {
    constructor() {
      super(...arguments);
      this._reader = new sync_1.default(this._settings);
    }
    read(task) {
      const root = this._getRootDirectory(task);
      const options = this._getReaderOptions(task);
      const entries = this.api(root, task, options);
      return entries.map(options.transform);
    }
    api(root, task, options) {
      if (task.dynamic) {
        return this._reader.dynamic(root, options);
      }
      return this._reader.static(task.patterns, options);
    }
  }
  sync$1.default = ProviderSync;
  return sync$1;
}
var settings = {};
var hasRequiredSettings;
function requireSettings() {
  if (hasRequiredSettings)
    return settings;
  hasRequiredSettings = 1;
  (function(exports2) {
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_FILE_SYSTEM_ADAPTER = void 0;
    const fs2 = require$$0$1;
    const os2 = require$$0;
    const CPU_COUNT = Math.max(os2.cpus().length, 1);
    exports2.DEFAULT_FILE_SYSTEM_ADAPTER = {
      lstat: fs2.lstat,
      lstatSync: fs2.lstatSync,
      stat: fs2.stat,
      statSync: fs2.statSync,
      readdir: fs2.readdir,
      readdirSync: fs2.readdirSync
    };
    class Settings {
      constructor(_options = {}) {
        this._options = _options;
        this.absolute = this._getValue(this._options.absolute, false);
        this.baseNameMatch = this._getValue(this._options.baseNameMatch, false);
        this.braceExpansion = this._getValue(this._options.braceExpansion, true);
        this.caseSensitiveMatch = this._getValue(this._options.caseSensitiveMatch, true);
        this.concurrency = this._getValue(this._options.concurrency, CPU_COUNT);
        this.cwd = this._getValue(this._options.cwd, process.cwd());
        this.deep = this._getValue(this._options.deep, Infinity);
        this.dot = this._getValue(this._options.dot, false);
        this.extglob = this._getValue(this._options.extglob, true);
        this.followSymbolicLinks = this._getValue(this._options.followSymbolicLinks, true);
        this.fs = this._getFileSystemMethods(this._options.fs);
        this.globstar = this._getValue(this._options.globstar, true);
        this.ignore = this._getValue(this._options.ignore, []);
        this.markDirectories = this._getValue(this._options.markDirectories, false);
        this.objectMode = this._getValue(this._options.objectMode, false);
        this.onlyDirectories = this._getValue(this._options.onlyDirectories, false);
        this.onlyFiles = this._getValue(this._options.onlyFiles, true);
        this.stats = this._getValue(this._options.stats, false);
        this.suppressErrors = this._getValue(this._options.suppressErrors, false);
        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, false);
        this.unique = this._getValue(this._options.unique, true);
        if (this.onlyDirectories) {
          this.onlyFiles = false;
        }
        if (this.stats) {
          this.objectMode = true;
        }
      }
      _getValue(option, value) {
        return option === void 0 ? value : option;
      }
      _getFileSystemMethods(methods = {}) {
        return Object.assign(Object.assign({}, exports2.DEFAULT_FILE_SYSTEM_ADAPTER), methods);
      }
    }
    exports2.default = Settings;
  })(settings);
  return settings;
}
var out;
var hasRequiredOut;
function requireOut() {
  if (hasRequiredOut)
    return out;
  hasRequiredOut = 1;
  const taskManager = requireTasks();
  const async_1 = requireAsync();
  const stream_1 = requireStream();
  const sync_1 = requireSync();
  const settings_1 = requireSettings();
  const utils2 = requireUtils$2();
  async function FastGlob(source, options) {
    assertPatternsInput(source);
    const works = getWorks(source, async_1.default, options);
    const result = await Promise.all(works);
    return utils2.array.flatten(result);
  }
  (function(FastGlob2) {
    FastGlob2.glob = FastGlob2;
    FastGlob2.globSync = sync2;
    FastGlob2.globStream = stream2;
    FastGlob2.async = FastGlob2;
    function sync2(source, options) {
      assertPatternsInput(source);
      const works = getWorks(source, sync_1.default, options);
      return utils2.array.flatten(works);
    }
    FastGlob2.sync = sync2;
    function stream2(source, options) {
      assertPatternsInput(source);
      const works = getWorks(source, stream_1.default, options);
      return utils2.stream.merge(works);
    }
    FastGlob2.stream = stream2;
    function generateTasks(source, options) {
      assertPatternsInput(source);
      const patterns = [].concat(source);
      const settings2 = new settings_1.default(options);
      return taskManager.generate(patterns, settings2);
    }
    FastGlob2.generateTasks = generateTasks;
    function isDynamicPattern(source, options) {
      assertPatternsInput(source);
      const settings2 = new settings_1.default(options);
      return utils2.pattern.isDynamicPattern(source, settings2);
    }
    FastGlob2.isDynamicPattern = isDynamicPattern;
    function escapePath(source) {
      assertPatternsInput(source);
      return utils2.path.escape(source);
    }
    FastGlob2.escapePath = escapePath;
    function convertPathToPattern(source) {
      assertPatternsInput(source);
      return utils2.path.convertPathToPattern(source);
    }
    FastGlob2.convertPathToPattern = convertPathToPattern;
    (function(posix) {
      function escapePath2(source) {
        assertPatternsInput(source);
        return utils2.path.escapePosixPath(source);
      }
      posix.escapePath = escapePath2;
      function convertPathToPattern2(source) {
        assertPatternsInput(source);
        return utils2.path.convertPosixPathToPattern(source);
      }
      posix.convertPathToPattern = convertPathToPattern2;
    })(FastGlob2.posix || (FastGlob2.posix = {}));
    (function(win322) {
      function escapePath2(source) {
        assertPatternsInput(source);
        return utils2.path.escapeWindowsPath(source);
      }
      win322.escapePath = escapePath2;
      function convertPathToPattern2(source) {
        assertPatternsInput(source);
        return utils2.path.convertWindowsPathToPattern(source);
      }
      win322.convertPathToPattern = convertPathToPattern2;
    })(FastGlob2.win32 || (FastGlob2.win32 = {}));
  })(FastGlob || (FastGlob = {}));
  function getWorks(source, _Provider, options) {
    const patterns = [].concat(source);
    const settings2 = new settings_1.default(options);
    const tasks2 = taskManager.generate(patterns, settings2);
    const provider2 = new _Provider(settings2);
    return tasks2.map(provider2.read, provider2);
  }
  function assertPatternsInput(input) {
    const source = [].concat(input);
    const isValidSource = source.every((item) => utils2.string.isString(item) && !utils2.string.isEmpty(item));
    if (!isValidSource) {
      throw new TypeError("Patterns must be a string (non empty) or an array of strings");
    }
  }
  out = FastGlob;
  return out;
}
var dirGlob = { exports: {} };
var pathType = {};
var hasRequiredPathType;
function requirePathType() {
  if (hasRequiredPathType)
    return pathType;
  hasRequiredPathType = 1;
  const { promisify: promisify2 } = require$$0$2;
  const fs2 = require$$0$1;
  async function isType(fsStatType, statsMethodName, filePath) {
    if (typeof filePath !== "string") {
      throw new TypeError(`Expected a string, got ${typeof filePath}`);
    }
    try {
      const stats = await promisify2(fs2[fsStatType])(filePath);
      return stats[statsMethodName]();
    } catch (error2) {
      if (error2.code === "ENOENT") {
        return false;
      }
      throw error2;
    }
  }
  function isTypeSync(fsStatType, statsMethodName, filePath) {
    if (typeof filePath !== "string") {
      throw new TypeError(`Expected a string, got ${typeof filePath}`);
    }
    try {
      return fs2[fsStatType](filePath)[statsMethodName]();
    } catch (error2) {
      if (error2.code === "ENOENT") {
        return false;
      }
      throw error2;
    }
  }
  pathType.isFile = isType.bind(null, "stat", "isFile");
  pathType.isDirectory = isType.bind(null, "stat", "isDirectory");
  pathType.isSymlink = isType.bind(null, "lstat", "isSymbolicLink");
  pathType.isFileSync = isTypeSync.bind(null, "statSync", "isFile");
  pathType.isDirectorySync = isTypeSync.bind(null, "statSync", "isDirectory");
  pathType.isSymlinkSync = isTypeSync.bind(null, "lstatSync", "isSymbolicLink");
  return pathType;
}
var hasRequiredDirGlob;
function requireDirGlob() {
  if (hasRequiredDirGlob)
    return dirGlob.exports;
  hasRequiredDirGlob = 1;
  const path2 = require$$0$3;
  const pathType2 = requirePathType();
  const getExtensions = (extensions) => extensions.length > 1 ? `{${extensions.join(",")}}` : extensions[0];
  const getPath = (filepath, cwd2) => {
    const pth = filepath[0] === "!" ? filepath.slice(1) : filepath;
    return path2.isAbsolute(pth) ? pth : path2.join(cwd2, pth);
  };
  const addExtensions = (file2, extensions) => {
    if (path2.extname(file2)) {
      return `**/${file2}`;
    }
    return `**/${file2}.${getExtensions(extensions)}`;
  };
  const getGlob = (directory, options) => {
    if (options.files && !Array.isArray(options.files)) {
      throw new TypeError(`Expected \`files\` to be of type \`Array\` but received type \`${typeof options.files}\``);
    }
    if (options.extensions && !Array.isArray(options.extensions)) {
      throw new TypeError(`Expected \`extensions\` to be of type \`Array\` but received type \`${typeof options.extensions}\``);
    }
    if (options.files && options.extensions) {
      return options.files.map((x) => path2.posix.join(directory, addExtensions(x, options.extensions)));
    }
    if (options.files) {
      return options.files.map((x) => path2.posix.join(directory, `**/${x}`));
    }
    if (options.extensions) {
      return [path2.posix.join(directory, `**/*.${getExtensions(options.extensions)}`)];
    }
    return [path2.posix.join(directory, "**")];
  };
  dirGlob.exports = async (input, options) => {
    options = {
      cwd: process.cwd(),
      ...options
    };
    if (typeof options.cwd !== "string") {
      throw new TypeError(`Expected \`cwd\` to be of type \`string\` but received type \`${typeof options.cwd}\``);
    }
    const globs = await Promise.all([].concat(input).map(async (x) => {
      const isDirectory = await pathType2.isDirectory(getPath(x, options.cwd));
      return isDirectory ? getGlob(x, options) : x;
    }));
    return [].concat.apply([], globs);
  };
  dirGlob.exports.sync = (input, options) => {
    options = {
      cwd: process.cwd(),
      ...options
    };
    if (typeof options.cwd !== "string") {
      throw new TypeError(`Expected \`cwd\` to be of type \`string\` but received type \`${typeof options.cwd}\``);
    }
    const globs = [].concat(input).map((x) => pathType2.isDirectorySync(getPath(x, options.cwd)) ? getGlob(x, options) : x);
    return [].concat.apply([], globs);
  };
  return dirGlob.exports;
}
var gitignore = { exports: {} };
var ignore;
var hasRequiredIgnore;
function requireIgnore() {
  if (hasRequiredIgnore)
    return ignore;
  hasRequiredIgnore = 1;
  function makeArray(subject) {
    return Array.isArray(subject) ? subject : [subject];
  }
  const EMPTY = "";
  const SPACE = " ";
  const ESCAPE = "\\";
  const REGEX_TEST_BLANK_LINE = /^\s+$/;
  const REGEX_INVALID_TRAILING_BACKSLASH = /(?:[^\\]|^)\\$/;
  const REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION = /^\\!/;
  const REGEX_REPLACE_LEADING_EXCAPED_HASH = /^\\#/;
  const REGEX_SPLITALL_CRLF = /\r?\n/g;
  const REGEX_TEST_INVALID_PATH = /^\.*\/|^\.+$/;
  const SLASH = "/";
  let TMP_KEY_IGNORE = "node-ignore";
  if (typeof Symbol !== "undefined") {
    TMP_KEY_IGNORE = Symbol.for("node-ignore");
  }
  const KEY_IGNORE = TMP_KEY_IGNORE;
  const define = (object, key, value) => Object.defineProperty(object, key, { value });
  const REGEX_REGEXP_RANGE = /([0-z])-([0-z])/g;
  const RETURN_FALSE = () => false;
  const sanitizeRange = (range) => range.replace(
    REGEX_REGEXP_RANGE,
    (match, from, to) => from.charCodeAt(0) <= to.charCodeAt(0) ? match : EMPTY
  );
  const cleanRangeBackSlash = (slashes) => {
    const { length } = slashes;
    return slashes.slice(0, length - length % 2);
  };
  const REPLACERS = [
    // > Trailing spaces are ignored unless they are quoted with backslash ("\")
    [
      // (a\ ) -> (a )
      // (a  ) -> (a)
      // (a \ ) -> (a  )
      /\\?\s+$/,
      (match) => match.indexOf("\\") === 0 ? SPACE : EMPTY
    ],
    // replace (\ ) with ' '
    [
      /\\\s/g,
      () => SPACE
    ],
    // Escape metacharacters
    // which is written down by users but means special for regular expressions.
    // > There are 12 characters with special meanings:
    // > - the backslash \,
    // > - the caret ^,
    // > - the dollar sign $,
    // > - the period or dot .,
    // > - the vertical bar or pipe symbol |,
    // > - the question mark ?,
    // > - the asterisk or star *,
    // > - the plus sign +,
    // > - the opening parenthesis (,
    // > - the closing parenthesis ),
    // > - and the opening square bracket [,
    // > - the opening curly brace {,
    // > These special characters are often called "metacharacters".
    [
      /[\\$.|*+(){^]/g,
      (match) => `\\${match}`
    ],
    [
      // > a question mark (?) matches a single character
      /(?!\\)\?/g,
      () => "[^/]"
    ],
    // leading slash
    [
      // > A leading slash matches the beginning of the pathname.
      // > For example, "/*.c" matches "cat-file.c" but not "mozilla-sha1/sha1.c".
      // A leading slash matches the beginning of the pathname
      /^\//,
      () => "^"
    ],
    // replace special metacharacter slash after the leading slash
    [
      /\//g,
      () => "\\/"
    ],
    [
      // > A leading "**" followed by a slash means match in all directories.
      // > For example, "**/foo" matches file or directory "foo" anywhere,
      // > the same as pattern "foo".
      // > "**/foo/bar" matches file or directory "bar" anywhere that is directly
      // >   under directory "foo".
      // Notice that the '*'s have been replaced as '\\*'
      /^\^*\\\*\\\*\\\//,
      // '**/foo' <-> 'foo'
      () => "^(?:.*\\/)?"
    ],
    // starting
    [
      // there will be no leading '/'
      //   (which has been replaced by section "leading slash")
      // If starts with '**', adding a '^' to the regular expression also works
      /^(?=[^^])/,
      function startingReplacer() {
        return !/\/(?!$)/.test(this) ? "(?:^|\\/)" : "^";
      }
    ],
    // two globstars
    [
      // Use lookahead assertions so that we could match more than one `'/**'`
      /\\\/\\\*\\\*(?=\\\/|$)/g,
      // Zero, one or several directories
      // should not use '*', or it will be replaced by the next replacer
      // Check if it is not the last `'/**'`
      (_, index, str2) => index + 6 < str2.length ? "(?:\\/[^\\/]+)*" : "\\/.+"
    ],
    // normal intermediate wildcards
    [
      // Never replace escaped '*'
      // ignore rule '\*' will match the path '*'
      // 'abc.*/' -> go
      // 'abc.*'  -> skip this rule,
      //    coz trailing single wildcard will be handed by [trailing wildcard]
      /(^|[^\\]+)(\\\*)+(?=.+)/g,
      // '*.js' matches '.js'
      // '*.js' doesn't match 'abc'
      (_, p1, p2) => {
        const unescaped = p2.replace(/\\\*/g, "[^\\/]*");
        return p1 + unescaped;
      }
    ],
    [
      // unescape, revert step 3 except for back slash
      // For example, if a user escape a '\\*',
      // after step 3, the result will be '\\\\\\*'
      /\\\\\\(?=[$.|*+(){^])/g,
      () => ESCAPE
    ],
    [
      // '\\\\' -> '\\'
      /\\\\/g,
      () => ESCAPE
    ],
    [
      // > The range notation, e.g. [a-zA-Z],
      // > can be used to match one of the characters in a range.
      // `\` is escaped by step 3
      /(\\)?\[([^\]/]*?)(\\*)($|\])/g,
      (match, leadEscape, range, endEscape, close) => leadEscape === ESCAPE ? `\\[${range}${cleanRangeBackSlash(endEscape)}${close}` : close === "]" ? endEscape.length % 2 === 0 ? `[${sanitizeRange(range)}${endEscape}]` : "[]" : "[]"
    ],
    // ending
    [
      // 'js' will not match 'js.'
      // 'ab' will not match 'abc'
      /(?:[^*])$/,
      // WTF!
      // https://git-scm.com/docs/gitignore
      // changes in [2.22.1](https://git-scm.com/docs/gitignore/2.22.1)
      // which re-fixes #24, #38
      // > If there is a separator at the end of the pattern then the pattern
      // > will only match directories, otherwise the pattern can match both
      // > files and directories.
      // 'js*' will not match 'a.js'
      // 'js/' will not match 'a.js'
      // 'js' will match 'a.js' and 'a.js/'
      (match) => /\/$/.test(match) ? `${match}$` : `${match}(?=$|\\/$)`
    ],
    // trailing wildcard
    [
      /(\^|\\\/)?\\\*$/,
      (_, p1) => {
        const prefix = p1 ? `${p1}[^/]+` : "[^/]*";
        return `${prefix}(?=$|\\/$)`;
      }
    ]
  ];
  const regexCache = /* @__PURE__ */ Object.create(null);
  const makeRegex = (pattern2, ignoreCase) => {
    let source = regexCache[pattern2];
    if (!source) {
      source = REPLACERS.reduce(
        (prev, current) => prev.replace(current[0], current[1].bind(pattern2)),
        pattern2
      );
      regexCache[pattern2] = source;
    }
    return ignoreCase ? new RegExp(source, "i") : new RegExp(source);
  };
  const isString = (subject) => typeof subject === "string";
  const checkPattern = (pattern2) => pattern2 && isString(pattern2) && !REGEX_TEST_BLANK_LINE.test(pattern2) && !REGEX_INVALID_TRAILING_BACKSLASH.test(pattern2) && pattern2.indexOf("#") !== 0;
  const splitPattern = (pattern2) => pattern2.split(REGEX_SPLITALL_CRLF);
  class IgnoreRule {
    constructor(origin, pattern2, negative, regex) {
      this.origin = origin;
      this.pattern = pattern2;
      this.negative = negative;
      this.regex = regex;
    }
  }
  const createRule = (pattern2, ignoreCase) => {
    const origin = pattern2;
    let negative = false;
    if (pattern2.indexOf("!") === 0) {
      negative = true;
      pattern2 = pattern2.substr(1);
    }
    pattern2 = pattern2.replace(REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION, "!").replace(REGEX_REPLACE_LEADING_EXCAPED_HASH, "#");
    const regex = makeRegex(pattern2, ignoreCase);
    return new IgnoreRule(
      origin,
      pattern2,
      negative,
      regex
    );
  };
  const throwError = (message, Ctor) => {
    throw new Ctor(message);
  };
  const checkPath = (path2, originalPath, doThrow) => {
    if (!isString(path2)) {
      return doThrow(
        `path must be a string, but got \`${originalPath}\``,
        TypeError
      );
    }
    if (!path2) {
      return doThrow(`path must not be empty`, TypeError);
    }
    if (checkPath.isNotRelative(path2)) {
      const r = "`path.relative()`d";
      return doThrow(
        `path should be a ${r} string, but got "${originalPath}"`,
        RangeError
      );
    }
    return true;
  };
  const isNotRelative = (path2) => REGEX_TEST_INVALID_PATH.test(path2);
  checkPath.isNotRelative = isNotRelative;
  checkPath.convert = (p) => p;
  class Ignore {
    constructor({
      ignorecase = true,
      ignoreCase = ignorecase,
      allowRelativePaths = false
    } = {}) {
      define(this, KEY_IGNORE, true);
      this._rules = [];
      this._ignoreCase = ignoreCase;
      this._allowRelativePaths = allowRelativePaths;
      this._initCache();
    }
    _initCache() {
      this._ignoreCache = /* @__PURE__ */ Object.create(null);
      this._testCache = /* @__PURE__ */ Object.create(null);
    }
    _addPattern(pattern2) {
      if (pattern2 && pattern2[KEY_IGNORE]) {
        this._rules = this._rules.concat(pattern2._rules);
        this._added = true;
        return;
      }
      if (checkPattern(pattern2)) {
        const rule = createRule(pattern2, this._ignoreCase);
        this._added = true;
        this._rules.push(rule);
      }
    }
    // @param {Array<string> | string | Ignore} pattern
    add(pattern2) {
      this._added = false;
      makeArray(
        isString(pattern2) ? splitPattern(pattern2) : pattern2
      ).forEach(this._addPattern, this);
      if (this._added) {
        this._initCache();
      }
      return this;
    }
    // legacy
    addPattern(pattern2) {
      return this.add(pattern2);
    }
    //          |           ignored : unignored
    // negative |   0:0   |   0:1   |   1:0   |   1:1
    // -------- | ------- | ------- | ------- | --------
    //     0    |  TEST   |  TEST   |  SKIP   |    X
    //     1    |  TESTIF |  SKIP   |  TEST   |    X
    // - SKIP: always skip
    // - TEST: always test
    // - TESTIF: only test if checkUnignored
    // - X: that never happen
    // @param {boolean} whether should check if the path is unignored,
    //   setting `checkUnignored` to `false` could reduce additional
    //   path matching.
    // @returns {TestResult} true if a file is ignored
    _testOne(path2, checkUnignored) {
      let ignored = false;
      let unignored = false;
      this._rules.forEach((rule) => {
        const { negative } = rule;
        if (unignored === negative && ignored !== unignored || negative && !ignored && !unignored && !checkUnignored) {
          return;
        }
        const matched = rule.regex.test(path2);
        if (matched) {
          ignored = !negative;
          unignored = negative;
        }
      });
      return {
        ignored,
        unignored
      };
    }
    // @returns {TestResult}
    _test(originalPath, cache, checkUnignored, slices) {
      const path2 = originalPath && checkPath.convert(originalPath);
      checkPath(
        path2,
        originalPath,
        this._allowRelativePaths ? RETURN_FALSE : throwError
      );
      return this._t(path2, cache, checkUnignored, slices);
    }
    _t(path2, cache, checkUnignored, slices) {
      if (path2 in cache) {
        return cache[path2];
      }
      if (!slices) {
        slices = path2.split(SLASH);
      }
      slices.pop();
      if (!slices.length) {
        return cache[path2] = this._testOne(path2, checkUnignored);
      }
      const parent = this._t(
        slices.join(SLASH) + SLASH,
        cache,
        checkUnignored,
        slices
      );
      return cache[path2] = parent.ignored ? parent : this._testOne(path2, checkUnignored);
    }
    ignores(path2) {
      return this._test(path2, this._ignoreCache, false).ignored;
    }
    createFilter() {
      return (path2) => !this.ignores(path2);
    }
    filter(paths) {
      return makeArray(paths).filter(this.createFilter());
    }
    // @returns {TestResult}
    test(path2) {
      return this._test(path2, this._testCache, true);
    }
  }
  const factory = (options) => new Ignore(options);
  const isPathValid = (path2) => checkPath(path2 && checkPath.convert(path2), path2, RETURN_FALSE);
  factory.isPathValid = isPathValid;
  factory.default = factory;
  ignore = factory;
  if (
    // Detect `process` so that it can run in browsers.
    typeof process !== "undefined" && (process.env && process.env.IGNORE_TEST_WIN32 || process.platform === "win32")
  ) {
    const makePosix = (str2) => /^\\\\\?\\/.test(str2) || /["<>|\u0000-\u001F]+/u.test(str2) ? str2 : str2.replace(/\\/g, "/");
    checkPath.convert = makePosix;
    const REGIX_IS_WINDOWS_PATH_ABSOLUTE = /^[a-z]:\//i;
    checkPath.isNotRelative = (path2) => REGIX_IS_WINDOWS_PATH_ABSOLUTE.test(path2) || isNotRelative(path2);
  }
  return ignore;
}
var slash;
var hasRequiredSlash;
function requireSlash() {
  if (hasRequiredSlash)
    return slash;
  hasRequiredSlash = 1;
  slash = (path2) => {
    const isExtendedLengthPath = /^\\\\\?\\/.test(path2);
    const hasNonAscii = /[^\u0000-\u0080]+/.test(path2);
    if (isExtendedLengthPath || hasNonAscii) {
      return path2;
    }
    return path2.replace(/\\/g, "/");
  };
  return slash;
}
var hasRequiredGitignore;
function requireGitignore() {
  if (hasRequiredGitignore)
    return gitignore.exports;
  hasRequiredGitignore = 1;
  const { promisify: promisify2 } = require$$0$2;
  const fs2 = require$$0$1;
  const path2 = require$$0$3;
  const fastGlob = requireOut();
  const gitIgnore = requireIgnore();
  const slash2 = requireSlash();
  const DEFAULT_IGNORE = [
    "**/node_modules/**",
    "**/flow-typed/**",
    "**/coverage/**",
    "**/.git"
  ];
  const readFileP = promisify2(fs2.readFile);
  const mapGitIgnorePatternTo = (base) => (ignore2) => {
    if (ignore2.startsWith("!")) {
      return "!" + path2.posix.join(base, ignore2.slice(1));
    }
    return path2.posix.join(base, ignore2);
  };
  const parseGitIgnore = (content, options) => {
    const base = slash2(path2.relative(options.cwd, path2.dirname(options.fileName)));
    return content.split(/\r?\n/).filter(Boolean).filter((line) => !line.startsWith("#")).map(mapGitIgnorePatternTo(base));
  };
  const reduceIgnore = (files2) => {
    const ignores = gitIgnore();
    for (const file2 of files2) {
      ignores.add(parseGitIgnore(file2.content, {
        cwd: file2.cwd,
        fileName: file2.filePath
      }));
    }
    return ignores;
  };
  const ensureAbsolutePathForCwd = (cwd2, p) => {
    cwd2 = slash2(cwd2);
    if (path2.isAbsolute(p)) {
      if (slash2(p).startsWith(cwd2)) {
        return p;
      }
      throw new Error(`Path ${p} is not in cwd ${cwd2}`);
    }
    return path2.join(cwd2, p);
  };
  const getIsIgnoredPredecate = (ignores, cwd2) => {
    return (p) => ignores.ignores(slash2(path2.relative(cwd2, ensureAbsolutePathForCwd(cwd2, p.path || p))));
  };
  const getFile = async (file2, cwd2) => {
    const filePath = path2.join(cwd2, file2);
    const content = await readFileP(filePath, "utf8");
    return {
      cwd: cwd2,
      filePath,
      content
    };
  };
  const getFileSync = (file2, cwd2) => {
    const filePath = path2.join(cwd2, file2);
    const content = fs2.readFileSync(filePath, "utf8");
    return {
      cwd: cwd2,
      filePath,
      content
    };
  };
  const normalizeOptions = ({
    ignore: ignore2 = [],
    cwd: cwd2 = slash2(process.cwd())
  } = {}) => {
    return { ignore: ignore2, cwd: cwd2 };
  };
  gitignore.exports = async (options) => {
    options = normalizeOptions(options);
    const paths = await fastGlob("**/.gitignore", {
      ignore: DEFAULT_IGNORE.concat(options.ignore),
      cwd: options.cwd
    });
    const files2 = await Promise.all(paths.map((file2) => getFile(file2, options.cwd)));
    const ignores = reduceIgnore(files2);
    return getIsIgnoredPredecate(ignores, options.cwd);
  };
  gitignore.exports.sync = (options) => {
    options = normalizeOptions(options);
    const paths = fastGlob.sync("**/.gitignore", {
      ignore: DEFAULT_IGNORE.concat(options.ignore),
      cwd: options.cwd
    });
    const files2 = paths.map((file2) => getFileSync(file2, options.cwd));
    const ignores = reduceIgnore(files2);
    return getIsIgnoredPredecate(ignores, options.cwd);
  };
  return gitignore.exports;
}
var streamUtils;
var hasRequiredStreamUtils;
function requireStreamUtils() {
  if (hasRequiredStreamUtils)
    return streamUtils;
  hasRequiredStreamUtils = 1;
  const { Transform } = require$$0$6;
  class ObjectTransform extends Transform {
    constructor() {
      super({
        objectMode: true
      });
    }
  }
  class FilterStream extends ObjectTransform {
    constructor(filter) {
      super();
      this._filter = filter;
    }
    _transform(data, encoding, callback) {
      if (this._filter(data)) {
        this.push(data);
      }
      callback();
    }
  }
  class UniqueStream extends ObjectTransform {
    constructor() {
      super();
      this._pushed = /* @__PURE__ */ new Set();
    }
    _transform(data, encoding, callback) {
      if (!this._pushed.has(data)) {
        this.push(data);
        this._pushed.add(data);
      }
      callback();
    }
  }
  streamUtils = {
    FilterStream,
    UniqueStream
  };
  return streamUtils;
}
var hasRequiredGlobby;
function requireGlobby() {
  if (hasRequiredGlobby)
    return globby.exports;
  hasRequiredGlobby = 1;
  const fs2 = require$$0$1;
  const arrayUnion2 = requireArrayUnion();
  const merge2 = requireMerge2();
  const fastGlob = requireOut();
  const dirGlob2 = requireDirGlob();
  const gitignore2 = requireGitignore();
  const { FilterStream, UniqueStream } = requireStreamUtils();
  const DEFAULT_FILTER = () => false;
  const isNegative = (pattern2) => pattern2[0] === "!";
  const assertPatternsInput = (patterns) => {
    if (!patterns.every((pattern2) => typeof pattern2 === "string")) {
      throw new TypeError("Patterns must be a string or an array of strings");
    }
  };
  const checkCwdOption = (options = {}) => {
    if (!options.cwd) {
      return;
    }
    let stat2;
    try {
      stat2 = fs2.statSync(options.cwd);
    } catch {
      return;
    }
    if (!stat2.isDirectory()) {
      throw new Error("The `cwd` option must be a path to a directory");
    }
  };
  const getPathString = (p) => p.stats instanceof fs2.Stats ? p.path : p;
  const generateGlobTasks = (patterns, taskOptions) => {
    patterns = arrayUnion2([].concat(patterns));
    assertPatternsInput(patterns);
    checkCwdOption(taskOptions);
    const globTasks = [];
    taskOptions = {
      ignore: [],
      expandDirectories: true,
      ...taskOptions
    };
    for (const [index, pattern2] of patterns.entries()) {
      if (isNegative(pattern2)) {
        continue;
      }
      const ignore2 = patterns.slice(index).filter((pattern3) => isNegative(pattern3)).map((pattern3) => pattern3.slice(1));
      const options = {
        ...taskOptions,
        ignore: taskOptions.ignore.concat(ignore2)
      };
      globTasks.push({ pattern: pattern2, options });
    }
    return globTasks;
  };
  const globDirs = (task, fn) => {
    let options = {};
    if (task.options.cwd) {
      options.cwd = task.options.cwd;
    }
    if (Array.isArray(task.options.expandDirectories)) {
      options = {
        ...options,
        files: task.options.expandDirectories
      };
    } else if (typeof task.options.expandDirectories === "object") {
      options = {
        ...options,
        ...task.options.expandDirectories
      };
    }
    return fn(task.pattern, options);
  };
  const getPattern = (task, fn) => task.options.expandDirectories ? globDirs(task, fn) : [task.pattern];
  const getFilterSync = (options) => {
    return options && options.gitignore ? gitignore2.sync({ cwd: options.cwd, ignore: options.ignore }) : DEFAULT_FILTER;
  };
  const globToTask = (task) => (glob) => {
    const { options } = task;
    if (options.ignore && Array.isArray(options.ignore) && options.expandDirectories) {
      options.ignore = dirGlob2.sync(options.ignore);
    }
    return {
      pattern: glob,
      options
    };
  };
  globby.exports = async (patterns, options) => {
    const globTasks = generateGlobTasks(patterns, options);
    const getFilter = async () => {
      return options && options.gitignore ? gitignore2({ cwd: options.cwd, ignore: options.ignore }) : DEFAULT_FILTER;
    };
    const getTasks = async () => {
      const tasks3 = await Promise.all(globTasks.map(async (task) => {
        const globs = await getPattern(task, dirGlob2);
        return Promise.all(globs.map(globToTask(task)));
      }));
      return arrayUnion2(...tasks3);
    };
    const [filter, tasks2] = await Promise.all([getFilter(), getTasks()]);
    const paths = await Promise.all(tasks2.map((task) => fastGlob(task.pattern, task.options)));
    return arrayUnion2(...paths).filter((path_) => !filter(getPathString(path_)));
  };
  globby.exports.sync = (patterns, options) => {
    const globTasks = generateGlobTasks(patterns, options);
    const tasks2 = [];
    for (const task of globTasks) {
      const newTask = getPattern(task, dirGlob2.sync).map(globToTask(task));
      tasks2.push(...newTask);
    }
    const filter = getFilterSync(options);
    let matches = [];
    for (const task of tasks2) {
      matches = arrayUnion2(matches, fastGlob.sync(task.pattern, task.options));
    }
    return matches.filter((path_) => !filter(path_));
  };
  globby.exports.stream = (patterns, options) => {
    const globTasks = generateGlobTasks(patterns, options);
    const tasks2 = [];
    for (const task of globTasks) {
      const newTask = getPattern(task, dirGlob2.sync).map(globToTask(task));
      tasks2.push(...newTask);
    }
    const filter = getFilterSync(options);
    const filterStream = new FilterStream((p) => !filter(p));
    const uniqueStream = new UniqueStream();
    return merge2(tasks2.map((task) => fastGlob.stream(task.pattern, task.options))).pipe(filterStream).pipe(uniqueStream);
  };
  globby.exports.generateGlobTasks = generateGlobTasks;
  globby.exports.hasMagic = (patterns, options) => [].concat(patterns).some((pattern2) => fastGlob.isDynamicPattern(pattern2, options));
  globby.exports.gitignore = gitignore2;
  return globby.exports;
}
var readYamlFile = { exports: {} };
var pify;
var hasRequiredPify;
function requirePify() {
  if (hasRequiredPify)
    return pify;
  hasRequiredPify = 1;
  const processFn = (fn, options) => function(...args) {
    const P = options.promiseModule;
    return new P((resolve, reject) => {
      if (options.multiArgs) {
        args.push((...result) => {
          if (options.errorFirst) {
            if (result[0]) {
              reject(result);
            } else {
              result.shift();
              resolve(result);
            }
          } else {
            resolve(result);
          }
        });
      } else if (options.errorFirst) {
        args.push((error2, result) => {
          if (error2) {
            reject(error2);
          } else {
            resolve(result);
          }
        });
      } else {
        args.push(resolve);
      }
      fn.apply(this, args);
    });
  };
  pify = (input, options) => {
    options = Object.assign({
      exclude: [/.+(Sync|Stream)$/],
      errorFirst: true,
      promiseModule: Promise
    }, options);
    const objType = typeof input;
    if (!(input !== null && (objType === "object" || objType === "function"))) {
      throw new TypeError(`Expected \`input\` to be a \`Function\` or \`Object\`, got \`${input === null ? "null" : objType}\``);
    }
    const filter = (key) => {
      const match = (pattern2) => typeof pattern2 === "string" ? key === pattern2 : pattern2.test(key);
      return options.include ? options.include.some(match) : !options.exclude.some(match);
    };
    let ret;
    if (objType === "function") {
      ret = function(...args) {
        return options.excludeMain ? input(...args) : processFn(input, options).apply(this, args);
      };
    } else {
      ret = Object.create(Object.getPrototypeOf(input));
    }
    for (const key in input) {
      const property = input[key];
      ret[key] = typeof property === "function" && filter(key) ? processFn(property, options) : property;
    }
    return ret;
  };
  return pify;
}
var stripBom;
var hasRequiredStripBom;
function requireStripBom() {
  if (hasRequiredStripBom)
    return stripBom;
  hasRequiredStripBom = 1;
  stripBom = (x) => {
    if (typeof x !== "string") {
      throw new TypeError("Expected a string, got " + typeof x);
    }
    if (x.charCodeAt(0) === 65279) {
      return x.slice(1);
    }
    return x;
  };
  return stripBom;
}
var jsYaml$1 = {};
var loader = {};
var common = {};
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon)
    return common;
  hasRequiredCommon = 1;
  function isNothing(subject) {
    return typeof subject === "undefined" || subject === null;
  }
  function isObject(subject) {
    return typeof subject === "object" && subject !== null;
  }
  function toArray(sequence) {
    if (Array.isArray(sequence))
      return sequence;
    else if (isNothing(sequence))
      return [];
    return [sequence];
  }
  function extend(target, source) {
    var index, length, key, sourceKeys;
    if (source) {
      sourceKeys = Object.keys(source);
      for (index = 0, length = sourceKeys.length; index < length; index += 1) {
        key = sourceKeys[index];
        target[key] = source[key];
      }
    }
    return target;
  }
  function repeat(string2, count) {
    var result = "", cycle;
    for (cycle = 0; cycle < count; cycle += 1) {
      result += string2;
    }
    return result;
  }
  function isNegativeZero(number) {
    return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
  }
  common.isNothing = isNothing;
  common.isObject = isObject;
  common.toArray = toArray;
  common.repeat = repeat;
  common.isNegativeZero = isNegativeZero;
  common.extend = extend;
  return common;
}
var exception;
var hasRequiredException;
function requireException() {
  if (hasRequiredException)
    return exception;
  hasRequiredException = 1;
  function YAMLException(reason, mark2) {
    Error.call(this);
    this.name = "YAMLException";
    this.reason = reason;
    this.mark = mark2;
    this.message = (this.reason || "(unknown reason)") + (this.mark ? " " + this.mark.toString() : "");
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack || "";
    }
  }
  YAMLException.prototype = Object.create(Error.prototype);
  YAMLException.prototype.constructor = YAMLException;
  YAMLException.prototype.toString = function toString(compact) {
    var result = this.name + ": ";
    result += this.reason || "(unknown reason)";
    if (!compact && this.mark) {
      result += " " + this.mark.toString();
    }
    return result;
  };
  exception = YAMLException;
  return exception;
}
var mark;
var hasRequiredMark;
function requireMark() {
  if (hasRequiredMark)
    return mark;
  hasRequiredMark = 1;
  var common2 = requireCommon();
  function Mark(name, buffer2, position, line, column) {
    this.name = name;
    this.buffer = buffer2;
    this.position = position;
    this.line = line;
    this.column = column;
  }
  Mark.prototype.getSnippet = function getSnippet(indent, maxLength) {
    var head, start, tail, end, snippet;
    if (!this.buffer)
      return null;
    indent = indent || 4;
    maxLength = maxLength || 75;
    head = "";
    start = this.position;
    while (start > 0 && "\0\r\n\u2028\u2029".indexOf(this.buffer.charAt(start - 1)) === -1) {
      start -= 1;
      if (this.position - start > maxLength / 2 - 1) {
        head = " ... ";
        start += 5;
        break;
      }
    }
    tail = "";
    end = this.position;
    while (end < this.buffer.length && "\0\r\n\u2028\u2029".indexOf(this.buffer.charAt(end)) === -1) {
      end += 1;
      if (end - this.position > maxLength / 2 - 1) {
        tail = " ... ";
        end -= 5;
        break;
      }
    }
    snippet = this.buffer.slice(start, end);
    return common2.repeat(" ", indent) + head + snippet + tail + "\n" + common2.repeat(" ", indent + this.position - start + head.length) + "^";
  };
  Mark.prototype.toString = function toString(compact) {
    var snippet, where = "";
    if (this.name) {
      where += 'in "' + this.name + '" ';
    }
    where += "at line " + (this.line + 1) + ", column " + (this.column + 1);
    if (!compact) {
      snippet = this.getSnippet();
      if (snippet) {
        where += ":\n" + snippet;
      }
    }
    return where;
  };
  mark = Mark;
  return mark;
}
var type;
var hasRequiredType;
function requireType() {
  if (hasRequiredType)
    return type;
  hasRequiredType = 1;
  var YAMLException = requireException();
  var TYPE_CONSTRUCTOR_OPTIONS = [
    "kind",
    "resolve",
    "construct",
    "instanceOf",
    "predicate",
    "represent",
    "defaultStyle",
    "styleAliases"
  ];
  var YAML_NODE_KINDS = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function compileStyleAliases(map2) {
    var result = {};
    if (map2 !== null) {
      Object.keys(map2).forEach(function(style) {
        map2[style].forEach(function(alias) {
          result[String(alias)] = style;
        });
      });
    }
    return result;
  }
  function Type(tag, options) {
    options = options || {};
    Object.keys(options).forEach(function(name) {
      if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
        throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
      }
    });
    this.tag = tag;
    this.kind = options["kind"] || null;
    this.resolve = options["resolve"] || function() {
      return true;
    };
    this.construct = options["construct"] || function(data) {
      return data;
    };
    this.instanceOf = options["instanceOf"] || null;
    this.predicate = options["predicate"] || null;
    this.represent = options["represent"] || null;
    this.defaultStyle = options["defaultStyle"] || null;
    this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
    if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
      throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
    }
  }
  type = Type;
  return type;
}
var schema;
var hasRequiredSchema;
function requireSchema() {
  if (hasRequiredSchema)
    return schema;
  hasRequiredSchema = 1;
  var common2 = requireCommon();
  var YAMLException = requireException();
  var Type = requireType();
  function compileList(schema2, name, result) {
    var exclude = [];
    schema2.include.forEach(function(includedSchema) {
      result = compileList(includedSchema, name, result);
    });
    schema2[name].forEach(function(currentType) {
      result.forEach(function(previousType, previousIndex) {
        if (previousType.tag === currentType.tag && previousType.kind === currentType.kind) {
          exclude.push(previousIndex);
        }
      });
      result.push(currentType);
    });
    return result.filter(function(type2, index) {
      return exclude.indexOf(index) === -1;
    });
  }
  function compileMap() {
    var result = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {}
    }, index, length;
    function collectType(type2) {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
    for (index = 0, length = arguments.length; index < length; index += 1) {
      arguments[index].forEach(collectType);
    }
    return result;
  }
  function Schema(definition) {
    this.include = definition.include || [];
    this.implicit = definition.implicit || [];
    this.explicit = definition.explicit || [];
    this.implicit.forEach(function(type2) {
      if (type2.loadKind && type2.loadKind !== "scalar") {
        throw new YAMLException("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      }
    });
    this.compiledImplicit = compileList(this, "implicit", []);
    this.compiledExplicit = compileList(this, "explicit", []);
    this.compiledTypeMap = compileMap(this.compiledImplicit, this.compiledExplicit);
  }
  Schema.DEFAULT = null;
  Schema.create = function createSchema() {
    var schemas, types;
    switch (arguments.length) {
      case 1:
        schemas = Schema.DEFAULT;
        types = arguments[0];
        break;
      case 2:
        schemas = arguments[0];
        types = arguments[1];
        break;
      default:
        throw new YAMLException("Wrong number of arguments for Schema.create function");
    }
    schemas = common2.toArray(schemas);
    types = common2.toArray(types);
    if (!schemas.every(function(schema2) {
      return schema2 instanceof Schema;
    })) {
      throw new YAMLException("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");
    }
    if (!types.every(function(type2) {
      return type2 instanceof Type;
    })) {
      throw new YAMLException("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    return new Schema({
      include: schemas,
      explicit: types
    });
  };
  schema = Schema;
  return schema;
}
var str;
var hasRequiredStr;
function requireStr() {
  if (hasRequiredStr)
    return str;
  hasRequiredStr = 1;
  var Type = requireType();
  str = new Type("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(data) {
      return data !== null ? data : "";
    }
  });
  return str;
}
var seq;
var hasRequiredSeq;
function requireSeq() {
  if (hasRequiredSeq)
    return seq;
  hasRequiredSeq = 1;
  var Type = requireType();
  seq = new Type("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(data) {
      return data !== null ? data : [];
    }
  });
  return seq;
}
var map;
var hasRequiredMap;
function requireMap() {
  if (hasRequiredMap)
    return map;
  hasRequiredMap = 1;
  var Type = requireType();
  map = new Type("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(data) {
      return data !== null ? data : {};
    }
  });
  return map;
}
var failsafe;
var hasRequiredFailsafe;
function requireFailsafe() {
  if (hasRequiredFailsafe)
    return failsafe;
  hasRequiredFailsafe = 1;
  var Schema = requireSchema();
  failsafe = new Schema({
    explicit: [
      requireStr(),
      requireSeq(),
      requireMap()
    ]
  });
  return failsafe;
}
var _null;
var hasRequired_null;
function require_null() {
  if (hasRequired_null)
    return _null;
  hasRequired_null = 1;
  var Type = requireType();
  function resolveYamlNull(data) {
    if (data === null)
      return true;
    var max = data.length;
    return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
  }
  function constructYamlNull() {
    return null;
  }
  function isNull(object) {
    return object === null;
  }
  _null = new Type("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: resolveYamlNull,
    construct: constructYamlNull,
    predicate: isNull,
    represent: {
      canonical: function() {
        return "~";
      },
      lowercase: function() {
        return "null";
      },
      uppercase: function() {
        return "NULL";
      },
      camelcase: function() {
        return "Null";
      }
    },
    defaultStyle: "lowercase"
  });
  return _null;
}
var bool;
var hasRequiredBool;
function requireBool() {
  if (hasRequiredBool)
    return bool;
  hasRequiredBool = 1;
  var Type = requireType();
  function resolveYamlBoolean(data) {
    if (data === null)
      return false;
    var max = data.length;
    return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
  }
  function constructYamlBoolean(data) {
    return data === "true" || data === "True" || data === "TRUE";
  }
  function isBoolean(object) {
    return Object.prototype.toString.call(object) === "[object Boolean]";
  }
  bool = new Type("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: resolveYamlBoolean,
    construct: constructYamlBoolean,
    predicate: isBoolean,
    represent: {
      lowercase: function(object) {
        return object ? "true" : "false";
      },
      uppercase: function(object) {
        return object ? "TRUE" : "FALSE";
      },
      camelcase: function(object) {
        return object ? "True" : "False";
      }
    },
    defaultStyle: "lowercase"
  });
  return bool;
}
var int;
var hasRequiredInt;
function requireInt() {
  if (hasRequiredInt)
    return int;
  hasRequiredInt = 1;
  var common2 = requireCommon();
  var Type = requireType();
  function isHexCode(c) {
    return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
  }
  function isOctCode(c) {
    return 48 <= c && c <= 55;
  }
  function isDecCode(c) {
    return 48 <= c && c <= 57;
  }
  function resolveYamlInteger(data) {
    if (data === null)
      return false;
    var max = data.length, index = 0, hasDigits = false, ch;
    if (!max)
      return false;
    ch = data[index];
    if (ch === "-" || ch === "+") {
      ch = data[++index];
    }
    if (ch === "0") {
      if (index + 1 === max)
        return true;
      ch = data[++index];
      if (ch === "b") {
        index++;
        for (; index < max; index++) {
          ch = data[index];
          if (ch === "_")
            continue;
          if (ch !== "0" && ch !== "1")
            return false;
          hasDigits = true;
        }
        return hasDigits && ch !== "_";
      }
      if (ch === "x") {
        index++;
        for (; index < max; index++) {
          ch = data[index];
          if (ch === "_")
            continue;
          if (!isHexCode(data.charCodeAt(index)))
            return false;
          hasDigits = true;
        }
        return hasDigits && ch !== "_";
      }
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (!isOctCode(data.charCodeAt(index)))
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "_")
      return false;
    for (; index < max; index++) {
      ch = data[index];
      if (ch === "_")
        continue;
      if (ch === ":")
        break;
      if (!isDecCode(data.charCodeAt(index))) {
        return false;
      }
      hasDigits = true;
    }
    if (!hasDigits || ch === "_")
      return false;
    if (ch !== ":")
      return true;
    return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
  }
  function constructYamlInteger(data) {
    var value = data, sign = 1, ch, base, digits = [];
    if (value.indexOf("_") !== -1) {
      value = value.replace(/_/g, "");
    }
    ch = value[0];
    if (ch === "-" || ch === "+") {
      if (ch === "-")
        sign = -1;
      value = value.slice(1);
      ch = value[0];
    }
    if (value === "0")
      return 0;
    if (ch === "0") {
      if (value[1] === "b")
        return sign * parseInt(value.slice(2), 2);
      if (value[1] === "x")
        return sign * parseInt(value, 16);
      return sign * parseInt(value, 8);
    }
    if (value.indexOf(":") !== -1) {
      value.split(":").forEach(function(v) {
        digits.unshift(parseInt(v, 10));
      });
      value = 0;
      base = 1;
      digits.forEach(function(d) {
        value += d * base;
        base *= 60;
      });
      return sign * value;
    }
    return sign * parseInt(value, 10);
  }
  function isInteger(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common2.isNegativeZero(object));
  }
  int = new Type("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: resolveYamlInteger,
    construct: constructYamlInteger,
    predicate: isInteger,
    represent: {
      binary: function(obj) {
        return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
      },
      octal: function(obj) {
        return obj >= 0 ? "0" + obj.toString(8) : "-0" + obj.toString(8).slice(1);
      },
      decimal: function(obj) {
        return obj.toString(10);
      },
      /* eslint-disable max-len */
      hexadecimal: function(obj) {
        return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  });
  return int;
}
var float;
var hasRequiredFloat;
function requireFloat() {
  if (hasRequiredFloat)
    return float;
  hasRequiredFloat = 1;
  var common2 = requireCommon();
  var Type = requireType();
  var YAML_FLOAT_PATTERN = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function resolveYamlFloat(data) {
    if (data === null)
      return false;
    if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    data[data.length - 1] === "_") {
      return false;
    }
    return true;
  }
  function constructYamlFloat(data) {
    var value, sign, base, digits;
    value = data.replace(/_/g, "").toLowerCase();
    sign = value[0] === "-" ? -1 : 1;
    digits = [];
    if ("+-".indexOf(value[0]) >= 0) {
      value = value.slice(1);
    }
    if (value === ".inf") {
      return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    } else if (value === ".nan") {
      return NaN;
    } else if (value.indexOf(":") >= 0) {
      value.split(":").forEach(function(v) {
        digits.unshift(parseFloat(v, 10));
      });
      value = 0;
      base = 1;
      digits.forEach(function(d) {
        value += d * base;
        base *= 60;
      });
      return sign * value;
    }
    return sign * parseFloat(value, 10);
  }
  var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
  function representYamlFloat(object, style) {
    var res;
    if (isNaN(object)) {
      switch (style) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    } else if (Number.POSITIVE_INFINITY === object) {
      switch (style) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    } else if (Number.NEGATIVE_INFINITY === object) {
      switch (style) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    } else if (common2.isNegativeZero(object)) {
      return "-0.0";
    }
    res = object.toString(10);
    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
  }
  function isFloat(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common2.isNegativeZero(object));
  }
  float = new Type("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: resolveYamlFloat,
    construct: constructYamlFloat,
    predicate: isFloat,
    represent: representYamlFloat,
    defaultStyle: "lowercase"
  });
  return float;
}
var json;
var hasRequiredJson;
function requireJson() {
  if (hasRequiredJson)
    return json;
  hasRequiredJson = 1;
  var Schema = requireSchema();
  json = new Schema({
    include: [
      requireFailsafe()
    ],
    implicit: [
      require_null(),
      requireBool(),
      requireInt(),
      requireFloat()
    ]
  });
  return json;
}
var core;
var hasRequiredCore;
function requireCore() {
  if (hasRequiredCore)
    return core;
  hasRequiredCore = 1;
  var Schema = requireSchema();
  core = new Schema({
    include: [
      requireJson()
    ]
  });
  return core;
}
var timestamp;
var hasRequiredTimestamp;
function requireTimestamp() {
  if (hasRequiredTimestamp)
    return timestamp;
  hasRequiredTimestamp = 1;
  var Type = requireType();
  var YAML_DATE_REGEXP = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  );
  var YAML_TIMESTAMP_REGEXP = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function resolveYamlTimestamp(data) {
    if (data === null)
      return false;
    if (YAML_DATE_REGEXP.exec(data) !== null)
      return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null)
      return true;
    return false;
  }
  function constructYamlTimestamp(data) {
    var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
    match = YAML_DATE_REGEXP.exec(data);
    if (match === null)
      match = YAML_TIMESTAMP_REGEXP.exec(data);
    if (match === null)
      throw new Error("Date resolve error");
    year = +match[1];
    month = +match[2] - 1;
    day = +match[3];
    if (!match[4]) {
      return new Date(Date.UTC(year, month, day));
    }
    hour = +match[4];
    minute = +match[5];
    second = +match[6];
    if (match[7]) {
      fraction = match[7].slice(0, 3);
      while (fraction.length < 3) {
        fraction += "0";
      }
      fraction = +fraction;
    }
    if (match[9]) {
      tz_hour = +match[10];
      tz_minute = +(match[11] || 0);
      delta = (tz_hour * 60 + tz_minute) * 6e4;
      if (match[9] === "-")
        delta = -delta;
    }
    date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (delta)
      date.setTime(date.getTime() - delta);
    return date;
  }
  function representYamlTimestamp(object) {
    return object.toISOString();
  }
  timestamp = new Type("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: resolveYamlTimestamp,
    construct: constructYamlTimestamp,
    instanceOf: Date,
    represent: representYamlTimestamp
  });
  return timestamp;
}
var merge;
var hasRequiredMerge;
function requireMerge() {
  if (hasRequiredMerge)
    return merge;
  hasRequiredMerge = 1;
  var Type = requireType();
  function resolveYamlMerge(data) {
    return data === "<<" || data === null;
  }
  merge = new Type("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: resolveYamlMerge
  });
  return merge;
}
function commonjsRequire(path2) {
  throw new Error('Could not dynamically require "' + path2 + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var binary;
var hasRequiredBinary;
function requireBinary() {
  if (hasRequiredBinary)
    return binary;
  hasRequiredBinary = 1;
  var NodeBuffer;
  try {
    var _require = commonjsRequire;
    NodeBuffer = _require("buffer").Buffer;
  } catch (__) {
  }
  var Type = requireType();
  var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
  function resolveYamlBinary(data) {
    if (data === null)
      return false;
    var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
    for (idx = 0; idx < max; idx++) {
      code = map2.indexOf(data.charAt(idx));
      if (code > 64)
        continue;
      if (code < 0)
        return false;
      bitlen += 6;
    }
    return bitlen % 8 === 0;
  }
  function constructYamlBinary(data) {
    var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
    for (idx = 0; idx < max; idx++) {
      if (idx % 4 === 0 && idx) {
        result.push(bits >> 16 & 255);
        result.push(bits >> 8 & 255);
        result.push(bits & 255);
      }
      bits = bits << 6 | map2.indexOf(input.charAt(idx));
    }
    tailbits = max % 4 * 6;
    if (tailbits === 0) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    } else if (tailbits === 18) {
      result.push(bits >> 10 & 255);
      result.push(bits >> 2 & 255);
    } else if (tailbits === 12) {
      result.push(bits >> 4 & 255);
    }
    if (NodeBuffer) {
      return NodeBuffer.from ? NodeBuffer.from(result) : new NodeBuffer(result);
    }
    return result;
  }
  function representYamlBinary(object) {
    var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
    for (idx = 0; idx < max; idx++) {
      if (idx % 3 === 0 && idx) {
        result += map2[bits >> 18 & 63];
        result += map2[bits >> 12 & 63];
        result += map2[bits >> 6 & 63];
        result += map2[bits & 63];
      }
      bits = (bits << 8) + object[idx];
    }
    tail = max % 3;
    if (tail === 0) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    } else if (tail === 2) {
      result += map2[bits >> 10 & 63];
      result += map2[bits >> 4 & 63];
      result += map2[bits << 2 & 63];
      result += map2[64];
    } else if (tail === 1) {
      result += map2[bits >> 2 & 63];
      result += map2[bits << 4 & 63];
      result += map2[64];
      result += map2[64];
    }
    return result;
  }
  function isBinary(object) {
    return NodeBuffer && NodeBuffer.isBuffer(object);
  }
  binary = new Type("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: resolveYamlBinary,
    construct: constructYamlBinary,
    predicate: isBinary,
    represent: representYamlBinary
  });
  return binary;
}
var omap;
var hasRequiredOmap;
function requireOmap() {
  if (hasRequiredOmap)
    return omap;
  hasRequiredOmap = 1;
  var Type = requireType();
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  var _toString = Object.prototype.toString;
  function resolveYamlOmap(data) {
    if (data === null)
      return true;
    var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      pairHasKey = false;
      if (_toString.call(pair) !== "[object Object]")
        return false;
      for (pairKey in pair) {
        if (_hasOwnProperty.call(pair, pairKey)) {
          if (!pairHasKey)
            pairHasKey = true;
          else
            return false;
        }
      }
      if (!pairHasKey)
        return false;
      if (objectKeys.indexOf(pairKey) === -1)
        objectKeys.push(pairKey);
      else
        return false;
    }
    return true;
  }
  function constructYamlOmap(data) {
    return data !== null ? data : [];
  }
  omap = new Type("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: resolveYamlOmap,
    construct: constructYamlOmap
  });
  return omap;
}
var pairs;
var hasRequiredPairs;
function requirePairs() {
  if (hasRequiredPairs)
    return pairs;
  hasRequiredPairs = 1;
  var Type = requireType();
  var _toString = Object.prototype.toString;
  function resolveYamlPairs(data) {
    if (data === null)
      return true;
    var index, length, pair, keys, result, object = data;
    result = new Array(object.length);
    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      if (_toString.call(pair) !== "[object Object]")
        return false;
      keys = Object.keys(pair);
      if (keys.length !== 1)
        return false;
      result[index] = [keys[0], pair[keys[0]]];
    }
    return true;
  }
  function constructYamlPairs(data) {
    if (data === null)
      return [];
    var index, length, pair, keys, result, object = data;
    result = new Array(object.length);
    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      keys = Object.keys(pair);
      result[index] = [keys[0], pair[keys[0]]];
    }
    return result;
  }
  pairs = new Type("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: resolveYamlPairs,
    construct: constructYamlPairs
  });
  return pairs;
}
var set;
var hasRequiredSet;
function requireSet() {
  if (hasRequiredSet)
    return set;
  hasRequiredSet = 1;
  var Type = requireType();
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  function resolveYamlSet(data) {
    if (data === null)
      return true;
    var key, object = data;
    for (key in object) {
      if (_hasOwnProperty.call(object, key)) {
        if (object[key] !== null)
          return false;
      }
    }
    return true;
  }
  function constructYamlSet(data) {
    return data !== null ? data : {};
  }
  set = new Type("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: resolveYamlSet,
    construct: constructYamlSet
  });
  return set;
}
var default_safe;
var hasRequiredDefault_safe;
function requireDefault_safe() {
  if (hasRequiredDefault_safe)
    return default_safe;
  hasRequiredDefault_safe = 1;
  var Schema = requireSchema();
  default_safe = new Schema({
    include: [
      requireCore()
    ],
    implicit: [
      requireTimestamp(),
      requireMerge()
    ],
    explicit: [
      requireBinary(),
      requireOmap(),
      requirePairs(),
      requireSet()
    ]
  });
  return default_safe;
}
var _undefined;
var hasRequired_undefined;
function require_undefined() {
  if (hasRequired_undefined)
    return _undefined;
  hasRequired_undefined = 1;
  var Type = requireType();
  function resolveJavascriptUndefined() {
    return true;
  }
  function constructJavascriptUndefined() {
    return void 0;
  }
  function representJavascriptUndefined() {
    return "";
  }
  function isUndefined(object) {
    return typeof object === "undefined";
  }
  _undefined = new Type("tag:yaml.org,2002:js/undefined", {
    kind: "scalar",
    resolve: resolveJavascriptUndefined,
    construct: constructJavascriptUndefined,
    predicate: isUndefined,
    represent: representJavascriptUndefined
  });
  return _undefined;
}
var regexp;
var hasRequiredRegexp;
function requireRegexp() {
  if (hasRequiredRegexp)
    return regexp;
  hasRequiredRegexp = 1;
  var Type = requireType();
  function resolveJavascriptRegExp(data) {
    if (data === null)
      return false;
    if (data.length === 0)
      return false;
    var regexp2 = data, tail = /\/([gim]*)$/.exec(data), modifiers = "";
    if (regexp2[0] === "/") {
      if (tail)
        modifiers = tail[1];
      if (modifiers.length > 3)
        return false;
      if (regexp2[regexp2.length - modifiers.length - 1] !== "/")
        return false;
    }
    return true;
  }
  function constructJavascriptRegExp(data) {
    var regexp2 = data, tail = /\/([gim]*)$/.exec(data), modifiers = "";
    if (regexp2[0] === "/") {
      if (tail)
        modifiers = tail[1];
      regexp2 = regexp2.slice(1, regexp2.length - modifiers.length - 1);
    }
    return new RegExp(regexp2, modifiers);
  }
  function representJavascriptRegExp(object) {
    var result = "/" + object.source + "/";
    if (object.global)
      result += "g";
    if (object.multiline)
      result += "m";
    if (object.ignoreCase)
      result += "i";
    return result;
  }
  function isRegExp(object) {
    return Object.prototype.toString.call(object) === "[object RegExp]";
  }
  regexp = new Type("tag:yaml.org,2002:js/regexp", {
    kind: "scalar",
    resolve: resolveJavascriptRegExp,
    construct: constructJavascriptRegExp,
    predicate: isRegExp,
    represent: representJavascriptRegExp
  });
  return regexp;
}
var _function;
var hasRequired_function;
function require_function() {
  if (hasRequired_function)
    return _function;
  hasRequired_function = 1;
  var esprima;
  try {
    var _require = commonjsRequire;
    esprima = _require("esprima");
  } catch (_) {
    if (typeof window !== "undefined")
      esprima = window.esprima;
  }
  var Type = requireType();
  function resolveJavascriptFunction(data) {
    if (data === null)
      return false;
    try {
      var source = "(" + data + ")", ast = esprima.parse(source, { range: true });
      if (ast.type !== "Program" || ast.body.length !== 1 || ast.body[0].type !== "ExpressionStatement" || ast.body[0].expression.type !== "ArrowFunctionExpression" && ast.body[0].expression.type !== "FunctionExpression") {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }
  function constructJavascriptFunction(data) {
    var source = "(" + data + ")", ast = esprima.parse(source, { range: true }), params = [], body;
    if (ast.type !== "Program" || ast.body.length !== 1 || ast.body[0].type !== "ExpressionStatement" || ast.body[0].expression.type !== "ArrowFunctionExpression" && ast.body[0].expression.type !== "FunctionExpression") {
      throw new Error("Failed to resolve function");
    }
    ast.body[0].expression.params.forEach(function(param) {
      params.push(param.name);
    });
    body = ast.body[0].expression.body.range;
    if (ast.body[0].expression.body.type === "BlockStatement") {
      return new Function(params, source.slice(body[0] + 1, body[1] - 1));
    }
    return new Function(params, "return " + source.slice(body[0], body[1]));
  }
  function representJavascriptFunction(object) {
    return object.toString();
  }
  function isFunction(object) {
    return Object.prototype.toString.call(object) === "[object Function]";
  }
  _function = new Type("tag:yaml.org,2002:js/function", {
    kind: "scalar",
    resolve: resolveJavascriptFunction,
    construct: constructJavascriptFunction,
    predicate: isFunction,
    represent: representJavascriptFunction
  });
  return _function;
}
var default_full;
var hasRequiredDefault_full;
function requireDefault_full() {
  if (hasRequiredDefault_full)
    return default_full;
  hasRequiredDefault_full = 1;
  var Schema = requireSchema();
  default_full = Schema.DEFAULT = new Schema({
    include: [
      requireDefault_safe()
    ],
    explicit: [
      require_undefined(),
      requireRegexp(),
      require_function()
    ]
  });
  return default_full;
}
var hasRequiredLoader;
function requireLoader() {
  if (hasRequiredLoader)
    return loader;
  hasRequiredLoader = 1;
  var common2 = requireCommon();
  var YAMLException = requireException();
  var Mark = requireMark();
  var DEFAULT_SAFE_SCHEMA = requireDefault_safe();
  var DEFAULT_FULL_SCHEMA = requireDefault_full();
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  var CONTEXT_FLOW_IN = 1;
  var CONTEXT_FLOW_OUT = 2;
  var CONTEXT_BLOCK_IN = 3;
  var CONTEXT_BLOCK_OUT = 4;
  var CHOMPING_CLIP = 1;
  var CHOMPING_STRIP = 2;
  var CHOMPING_KEEP = 3;
  var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
  var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
  var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
  var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  function _class(obj) {
    return Object.prototype.toString.call(obj);
  }
  function is_EOL(c) {
    return c === 10 || c === 13;
  }
  function is_WHITE_SPACE(c) {
    return c === 9 || c === 32;
  }
  function is_WS_OR_EOL(c) {
    return c === 9 || c === 32 || c === 10 || c === 13;
  }
  function is_FLOW_INDICATOR(c) {
    return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
  }
  function fromHexCode(c) {
    var lc;
    if (48 <= c && c <= 57) {
      return c - 48;
    }
    lc = c | 32;
    if (97 <= lc && lc <= 102) {
      return lc - 97 + 10;
    }
    return -1;
  }
  function escapedHexLen(c) {
    if (c === 120) {
      return 2;
    }
    if (c === 117) {
      return 4;
    }
    if (c === 85) {
      return 8;
    }
    return 0;
  }
  function fromDecimalCode(c) {
    if (48 <= c && c <= 57) {
      return c - 48;
    }
    return -1;
  }
  function simpleEscapeSequence(c) {
    return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "" : c === 95 ? " " : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
  }
  function charFromCodepoint(c) {
    if (c <= 65535) {
      return String.fromCharCode(c);
    }
    return String.fromCharCode(
      (c - 65536 >> 10) + 55296,
      (c - 65536 & 1023) + 56320
    );
  }
  var simpleEscapeCheck = new Array(256);
  var simpleEscapeMap = new Array(256);
  for (var i = 0; i < 256; i++) {
    simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
    simpleEscapeMap[i] = simpleEscapeSequence(i);
  }
  function State(input, options) {
    this.input = input;
    this.filename = options["filename"] || null;
    this.schema = options["schema"] || DEFAULT_FULL_SCHEMA;
    this.onWarning = options["onWarning"] || null;
    this.legacy = options["legacy"] || false;
    this.json = options["json"] || false;
    this.listener = options["listener"] || null;
    this.implicitTypes = this.schema.compiledImplicit;
    this.typeMap = this.schema.compiledTypeMap;
    this.length = input.length;
    this.position = 0;
    this.line = 0;
    this.lineStart = 0;
    this.lineIndent = 0;
    this.documents = [];
  }
  function generateError(state, message) {
    return new YAMLException(
      message,
      new Mark(state.filename, state.input, state.position, state.line, state.position - state.lineStart)
    );
  }
  function throwError(state, message) {
    throw generateError(state, message);
  }
  function throwWarning(state, message) {
    if (state.onWarning) {
      state.onWarning.call(null, generateError(state, message));
    }
  }
  var directiveHandlers = {
    YAML: function handleYamlDirective(state, name, args) {
      var match, major, minor;
      if (state.version !== null) {
        throwError(state, "duplication of %YAML directive");
      }
      if (args.length !== 1) {
        throwError(state, "YAML directive accepts exactly one argument");
      }
      match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
      if (match === null) {
        throwError(state, "ill-formed argument of the YAML directive");
      }
      major = parseInt(match[1], 10);
      minor = parseInt(match[2], 10);
      if (major !== 1) {
        throwError(state, "unacceptable YAML version of the document");
      }
      state.version = args[0];
      state.checkLineBreaks = minor < 2;
      if (minor !== 1 && minor !== 2) {
        throwWarning(state, "unsupported YAML version of the document");
      }
    },
    TAG: function handleTagDirective(state, name, args) {
      var handle, prefix;
      if (args.length !== 2) {
        throwError(state, "TAG directive accepts exactly two arguments");
      }
      handle = args[0];
      prefix = args[1];
      if (!PATTERN_TAG_HANDLE.test(handle)) {
        throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
      }
      if (_hasOwnProperty.call(state.tagMap, handle)) {
        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
      }
      if (!PATTERN_TAG_URI.test(prefix)) {
        throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
      }
      state.tagMap[handle] = prefix;
    }
  };
  function captureSegment(state, start, end, checkJson) {
    var _position, _length, _character, _result;
    if (start < end) {
      _result = state.input.slice(start, end);
      if (checkJson) {
        for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
          _character = _result.charCodeAt(_position);
          if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
            throwError(state, "expected valid JSON character");
          }
        }
      } else if (PATTERN_NON_PRINTABLE.test(_result)) {
        throwError(state, "the stream contains non-printable characters");
      }
      state.result += _result;
    }
  }
  function mergeMappings(state, destination, source, overridableKeys) {
    var sourceKeys, key, index, quantity;
    if (!common2.isObject(source)) {
      throwError(state, "cannot merge mappings; the provided source object is unacceptable");
    }
    sourceKeys = Object.keys(source);
    for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
      key = sourceKeys[index];
      if (!_hasOwnProperty.call(destination, key)) {
        destination[key] = source[key];
        overridableKeys[key] = true;
      }
    }
  }
  function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
    var index, quantity;
    if (Array.isArray(keyNode)) {
      keyNode = Array.prototype.slice.call(keyNode);
      for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
        if (Array.isArray(keyNode[index])) {
          throwError(state, "nested arrays are not supported inside keys");
        }
        if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
          keyNode[index] = "[object Object]";
        }
      }
    }
    if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
      keyNode = "[object Object]";
    }
    keyNode = String(keyNode);
    if (_result === null) {
      _result = {};
    }
    if (keyTag === "tag:yaml.org,2002:merge") {
      if (Array.isArray(valueNode)) {
        for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
          mergeMappings(state, _result, valueNode[index], overridableKeys);
        }
      } else {
        mergeMappings(state, _result, valueNode, overridableKeys);
      }
    } else {
      if (!state.json && !_hasOwnProperty.call(overridableKeys, keyNode) && _hasOwnProperty.call(_result, keyNode)) {
        state.line = startLine || state.line;
        state.position = startPos || state.position;
        throwError(state, "duplicated mapping key");
      }
      _result[keyNode] = valueNode;
      delete overridableKeys[keyNode];
    }
    return _result;
  }
  function readLineBreak(state) {
    var ch;
    ch = state.input.charCodeAt(state.position);
    if (ch === 10) {
      state.position++;
    } else if (ch === 13) {
      state.position++;
      if (state.input.charCodeAt(state.position) === 10) {
        state.position++;
      }
    } else {
      throwError(state, "a line break is expected");
    }
    state.line += 1;
    state.lineStart = state.position;
  }
  function skipSeparationSpace(state, allowComments, checkIndent) {
    var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (allowComments && ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 10 && ch !== 13 && ch !== 0);
      }
      if (is_EOL(ch)) {
        readLineBreak(state);
        ch = state.input.charCodeAt(state.position);
        lineBreaks++;
        state.lineIndent = 0;
        while (ch === 32) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
      } else {
        break;
      }
    }
    if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
      throwWarning(state, "deficient indentation");
    }
    return lineBreaks;
  }
  function testDocumentSeparator(state) {
    var _position = state.position, ch;
    ch = state.input.charCodeAt(_position);
    if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
      _position += 3;
      ch = state.input.charCodeAt(_position);
      if (ch === 0 || is_WS_OR_EOL(ch)) {
        return true;
      }
    }
    return false;
  }
  function writeFoldedLines(state, count) {
    if (count === 1) {
      state.result += " ";
    } else if (count > 1) {
      state.result += common2.repeat("\n", count - 1);
    }
  }
  function readPlainScalar(state, nodeIndent, withinFlowCollection) {
    var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
    ch = state.input.charCodeAt(state.position);
    if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
      return false;
    }
    if (ch === 63 || ch === 45) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        return false;
      }
    }
    state.kind = "scalar";
    state.result = "";
    captureStart = captureEnd = state.position;
    hasPendingContent = false;
    while (ch !== 0) {
      if (ch === 58) {
        following = state.input.charCodeAt(state.position + 1);
        if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
          break;
        }
      } else if (ch === 35) {
        preceding = state.input.charCodeAt(state.position - 1);
        if (is_WS_OR_EOL(preceding)) {
          break;
        }
      } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
        break;
      } else if (is_EOL(ch)) {
        _line = state.line;
        _lineStart = state.lineStart;
        _lineIndent = state.lineIndent;
        skipSeparationSpace(state, false, -1);
        if (state.lineIndent >= nodeIndent) {
          hasPendingContent = true;
          ch = state.input.charCodeAt(state.position);
          continue;
        } else {
          state.position = captureEnd;
          state.line = _line;
          state.lineStart = _lineStart;
          state.lineIndent = _lineIndent;
          break;
        }
      }
      if (hasPendingContent) {
        captureSegment(state, captureStart, captureEnd, false);
        writeFoldedLines(state, state.line - _line);
        captureStart = captureEnd = state.position;
        hasPendingContent = false;
      }
      if (!is_WHITE_SPACE(ch)) {
        captureEnd = state.position + 1;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, captureEnd, false);
    if (state.result) {
      return true;
    }
    state.kind = _kind;
    state.result = _result;
    return false;
  }
  function readSingleQuotedScalar(state, nodeIndent) {
    var ch, captureStart, captureEnd;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 39) {
      return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    captureStart = captureEnd = state.position;
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 39) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);
        if (ch === 39) {
          captureStart = state.position;
          state.position++;
          captureEnd = state.position;
        } else {
          return true;
        }
      } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, "unexpected end of the document within a single quoted scalar");
      } else {
        state.position++;
        captureEnd = state.position;
      }
    }
    throwError(state, "unexpected end of the stream within a single quoted scalar");
  }
  function readDoubleQuotedScalar(state, nodeIndent) {
    var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 34) {
      return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    captureStart = captureEnd = state.position;
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 34) {
        captureSegment(state, captureStart, state.position, true);
        state.position++;
        return true;
      } else if (ch === 92) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);
        if (is_EOL(ch)) {
          skipSeparationSpace(state, false, nodeIndent);
        } else if (ch < 256 && simpleEscapeCheck[ch]) {
          state.result += simpleEscapeMap[ch];
          state.position++;
        } else if ((tmp = escapedHexLen(ch)) > 0) {
          hexLength = tmp;
          hexResult = 0;
          for (; hexLength > 0; hexLength--) {
            ch = state.input.charCodeAt(++state.position);
            if ((tmp = fromHexCode(ch)) >= 0) {
              hexResult = (hexResult << 4) + tmp;
            } else {
              throwError(state, "expected hexadecimal character");
            }
          }
          state.result += charFromCodepoint(hexResult);
          state.position++;
        } else {
          throwError(state, "unknown escape sequence");
        }
        captureStart = captureEnd = state.position;
      } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, "unexpected end of the document within a double quoted scalar");
      } else {
        state.position++;
        captureEnd = state.position;
      }
    }
    throwError(state, "unexpected end of the stream within a double quoted scalar");
  }
  function readFlowCollection(state, nodeIndent) {
    var readNext = true, _line, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = {}, keyNode, keyTag, valueNode, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch === 91) {
      terminator = 93;
      isMapping = false;
      _result = [];
    } else if (ch === 123) {
      terminator = 125;
      isMapping = true;
      _result = {};
    } else {
      return false;
    }
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }
    ch = state.input.charCodeAt(++state.position);
    while (ch !== 0) {
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if (ch === terminator) {
        state.position++;
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = isMapping ? "mapping" : "sequence";
        state.result = _result;
        return true;
      } else if (!readNext) {
        throwError(state, "missed comma between flow collection entries");
      }
      keyTag = keyNode = valueNode = null;
      isPair = isExplicitPair = false;
      if (ch === 63) {
        following = state.input.charCodeAt(state.position + 1);
        if (is_WS_OR_EOL(following)) {
          isPair = isExplicitPair = true;
          state.position++;
          skipSeparationSpace(state, true, nodeIndent);
        }
      }
      _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      keyTag = state.tag;
      keyNode = state.result;
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if ((isExplicitPair || state.line === _line) && ch === 58) {
        isPair = true;
        ch = state.input.charCodeAt(++state.position);
        skipSeparationSpace(state, true, nodeIndent);
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        valueNode = state.result;
      }
      if (isMapping) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode);
      } else if (isPair) {
        _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
      } else {
        _result.push(keyNode);
      }
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if (ch === 44) {
        readNext = true;
        ch = state.input.charCodeAt(++state.position);
      } else {
        readNext = false;
      }
    }
    throwError(state, "unexpected end of the stream within a flow collection");
  }
  function readBlockScalar(state, nodeIndent) {
    var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch === 124) {
      folding = false;
    } else if (ch === 62) {
      folding = true;
    } else {
      return false;
    }
    state.kind = "scalar";
    state.result = "";
    while (ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
      if (ch === 43 || ch === 45) {
        if (CHOMPING_CLIP === chomping) {
          chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
        } else {
          throwError(state, "repeat of a chomping mode identifier");
        }
      } else if ((tmp = fromDecimalCode(ch)) >= 0) {
        if (tmp === 0) {
          throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
        } else if (!detectedIndent) {
          textIndent = nodeIndent + tmp - 1;
          detectedIndent = true;
        } else {
          throwError(state, "repeat of an indentation width identifier");
        }
      } else {
        break;
      }
    }
    if (is_WHITE_SPACE(ch)) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (is_WHITE_SPACE(ch));
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (!is_EOL(ch) && ch !== 0);
      }
    }
    while (ch !== 0) {
      readLineBreak(state);
      state.lineIndent = 0;
      ch = state.input.charCodeAt(state.position);
      while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
      if (!detectedIndent && state.lineIndent > textIndent) {
        textIndent = state.lineIndent;
      }
      if (is_EOL(ch)) {
        emptyLines++;
        continue;
      }
      if (state.lineIndent < textIndent) {
        if (chomping === CHOMPING_KEEP) {
          state.result += common2.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        } else if (chomping === CHOMPING_CLIP) {
          if (didReadContent) {
            state.result += "\n";
          }
        }
        break;
      }
      if (folding) {
        if (is_WHITE_SPACE(ch)) {
          atMoreIndented = true;
          state.result += common2.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        } else if (atMoreIndented) {
          atMoreIndented = false;
          state.result += common2.repeat("\n", emptyLines + 1);
        } else if (emptyLines === 0) {
          if (didReadContent) {
            state.result += " ";
          }
        } else {
          state.result += common2.repeat("\n", emptyLines);
        }
      } else {
        state.result += common2.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      }
      didReadContent = true;
      detectedIndent = true;
      emptyLines = 0;
      captureStart = state.position;
      while (!is_EOL(ch) && ch !== 0) {
        ch = state.input.charCodeAt(++state.position);
      }
      captureSegment(state, captureStart, state.position, false);
    }
    return true;
  }
  function readBlockSequence(state, nodeIndent) {
    var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }
    ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      if (ch !== 45) {
        break;
      }
      following = state.input.charCodeAt(state.position + 1);
      if (!is_WS_OR_EOL(following)) {
        break;
      }
      detected = true;
      state.position++;
      if (skipSeparationSpace(state, true, -1)) {
        if (state.lineIndent <= nodeIndent) {
          _result.push(null);
          ch = state.input.charCodeAt(state.position);
          continue;
        }
      }
      _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
      _result.push(state.result);
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
      if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
        throwError(state, "bad indentation of a sequence entry");
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = "sequence";
      state.result = _result;
      return true;
    }
    return false;
  }
  function readBlockMapping(state, nodeIndent, flowIndent) {
    var following, allowCompact, _line, _pos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = {}, keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }
    ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      following = state.input.charCodeAt(state.position + 1);
      _line = state.line;
      _pos = state.position;
      if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
        if (ch === 63) {
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = true;
          allowCompact = true;
        } else if (atExplicitKey) {
          atExplicitKey = false;
          allowCompact = true;
        } else {
          throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
        }
        state.position += 1;
        ch = following;
      } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        if (state.line === _line) {
          ch = state.input.charCodeAt(state.position);
          while (is_WHITE_SPACE(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }
          if (ch === 58) {
            ch = state.input.charCodeAt(++state.position);
            if (!is_WS_OR_EOL(ch)) {
              throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
            }
            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
              keyTag = keyNode = valueNode = null;
            }
            detected = true;
            atExplicitKey = false;
            allowCompact = false;
            keyTag = state.tag;
            keyNode = state.result;
          } else if (detected) {
            throwError(state, "can not read an implicit mapping pair; a colon is missed");
          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true;
          }
        } else if (detected) {
          throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else {
        break;
      }
      if (state.line === _line || state.lineIndent > nodeIndent) {
        if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
          if (atExplicitKey) {
            keyNode = state.result;
          } else {
            valueNode = state.result;
          }
        }
        if (!atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _pos);
          keyTag = keyNode = valueNode = null;
        }
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
      }
      if (state.lineIndent > nodeIndent && ch !== 0) {
        throwError(state, "bad indentation of a mapping entry");
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }
    if (atExplicitKey) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
    }
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = "mapping";
      state.result = _result;
    }
    return detected;
  }
  function readTagProperty(state) {
    var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 33)
      return false;
    if (state.tag !== null) {
      throwError(state, "duplication of a tag property");
    }
    ch = state.input.charCodeAt(++state.position);
    if (ch === 60) {
      isVerbatim = true;
      ch = state.input.charCodeAt(++state.position);
    } else if (ch === 33) {
      isNamed = true;
      tagHandle = "!!";
      ch = state.input.charCodeAt(++state.position);
    } else {
      tagHandle = "!";
    }
    _position = state.position;
    if (isVerbatim) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0 && ch !== 62);
      if (state.position < state.length) {
        tagName = state.input.slice(_position, state.position);
        ch = state.input.charCodeAt(++state.position);
      } else {
        throwError(state, "unexpected end of the stream within a verbatim tag");
      }
    } else {
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        if (ch === 33) {
          if (!isNamed) {
            tagHandle = state.input.slice(_position - 1, state.position + 1);
            if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
              throwError(state, "named tag handle cannot contain such characters");
            }
            isNamed = true;
            _position = state.position + 1;
          } else {
            throwError(state, "tag suffix cannot contain exclamation marks");
          }
        }
        ch = state.input.charCodeAt(++state.position);
      }
      tagName = state.input.slice(_position, state.position);
      if (PATTERN_FLOW_INDICATORS.test(tagName)) {
        throwError(state, "tag suffix cannot contain flow indicator characters");
      }
    }
    if (tagName && !PATTERN_TAG_URI.test(tagName)) {
      throwError(state, "tag name cannot contain such characters: " + tagName);
    }
    if (isVerbatim) {
      state.tag = tagName;
    } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
      state.tag = state.tagMap[tagHandle] + tagName;
    } else if (tagHandle === "!") {
      state.tag = "!" + tagName;
    } else if (tagHandle === "!!") {
      state.tag = "tag:yaml.org,2002:" + tagName;
    } else {
      throwError(state, 'undeclared tag handle "' + tagHandle + '"');
    }
    return true;
  }
  function readAnchorProperty(state) {
    var _position, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 38)
      return false;
    if (state.anchor !== null) {
      throwError(state, "duplication of an anchor property");
    }
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === _position) {
      throwError(state, "name of an anchor node must contain at least one character");
    }
    state.anchor = state.input.slice(_position, state.position);
    return true;
  }
  function readAlias(state) {
    var _position, alias, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 42)
      return false;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === _position) {
      throwError(state, "name of an alias node must contain at least one character");
    }
    alias = state.input.slice(_position, state.position);
    if (!_hasOwnProperty.call(state.anchorMap, alias)) {
      throwError(state, 'unidentified alias "' + alias + '"');
    }
    state.result = state.anchorMap[alias];
    skipSeparationSpace(state, true, -1);
    return true;
  }
  function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
    var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, type2, flowIndent, blockIndent;
    if (state.listener !== null) {
      state.listener("open", state);
    }
    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
    if (allowToSeek) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      }
    }
    if (indentStatus === 1) {
      while (readTagProperty(state) || readAnchorProperty(state)) {
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          allowBlockCollections = allowBlockStyles;
          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        } else {
          allowBlockCollections = false;
        }
      }
    }
    if (allowBlockCollections) {
      allowBlockCollections = atNewLine || allowCompact;
    }
    if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
      if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
        flowIndent = parentIndent;
      } else {
        flowIndent = parentIndent + 1;
      }
      blockIndent = state.position - state.lineStart;
      if (indentStatus === 1) {
        if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
          hasContent = true;
        } else {
          if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
            hasContent = true;
          } else if (readAlias(state)) {
            hasContent = true;
            if (state.tag !== null || state.anchor !== null) {
              throwError(state, "alias node should not have any properties");
            }
          } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
            hasContent = true;
            if (state.tag === null) {
              state.tag = "?";
            }
          }
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
        }
      } else if (indentStatus === 0) {
        hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
      }
    }
    if (state.tag !== null && state.tag !== "!") {
      if (state.tag === "?") {
        if (state.result !== null && state.kind !== "scalar") {
          throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
        }
        for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
          type2 = state.implicitTypes[typeIndex];
          if (type2.resolve(state.result)) {
            state.result = type2.construct(state.result);
            state.tag = type2.tag;
            if (state.anchor !== null) {
              state.anchorMap[state.anchor] = state.result;
            }
            break;
          }
        }
      } else if (_hasOwnProperty.call(state.typeMap[state.kind || "fallback"], state.tag)) {
        type2 = state.typeMap[state.kind || "fallback"][state.tag];
        if (state.result !== null && type2.kind !== state.kind) {
          throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
        }
        if (!type2.resolve(state.result)) {
          throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
        } else {
          state.result = type2.construct(state.result);
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
        }
      } else {
        throwError(state, "unknown tag !<" + state.tag + ">");
      }
    }
    if (state.listener !== null) {
      state.listener("close", state);
    }
    return state.tag !== null || state.anchor !== null || hasContent;
  }
  function readDocument(state) {
    var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
    state.version = null;
    state.checkLineBreaks = state.legacy;
    state.tagMap = {};
    state.anchorMap = {};
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
      if (state.lineIndent > 0 || ch !== 37) {
        break;
      }
      hasDirectives = true;
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveName = state.input.slice(_position, state.position);
      directiveArgs = [];
      if (directiveName.length < 1) {
        throwError(state, "directive name must not be less than one character in length");
      }
      while (ch !== 0) {
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 35) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (ch !== 0 && !is_EOL(ch));
          break;
        }
        if (is_EOL(ch))
          break;
        _position = state.position;
        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        directiveArgs.push(state.input.slice(_position, state.position));
      }
      if (ch !== 0)
        readLineBreak(state);
      if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
        directiveHandlers[directiveName](state, directiveName, directiveArgs);
      } else {
        throwWarning(state, 'unknown document directive "' + directiveName + '"');
      }
    }
    skipSeparationSpace(state, true, -1);
    if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    } else if (hasDirectives) {
      throwError(state, "directives end mark is expected");
    }
    composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
    skipSeparationSpace(state, true, -1);
    if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
      throwWarning(state, "non-ASCII line breaks are interpreted as content");
    }
    state.documents.push(state.result);
    if (state.position === state.lineStart && testDocumentSeparator(state)) {
      if (state.input.charCodeAt(state.position) === 46) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      }
      return;
    }
    if (state.position < state.length - 1) {
      throwError(state, "end of the stream or a document separator is expected");
    } else {
      return;
    }
  }
  function loadDocuments(input, options) {
    input = String(input);
    options = options || {};
    if (input.length !== 0) {
      if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
        input += "\n";
      }
      if (input.charCodeAt(0) === 65279) {
        input = input.slice(1);
      }
    }
    var state = new State(input, options);
    var nullpos = input.indexOf("\0");
    if (nullpos !== -1) {
      state.position = nullpos;
      throwError(state, "null byte is not allowed in input");
    }
    state.input += "\0";
    while (state.input.charCodeAt(state.position) === 32) {
      state.lineIndent += 1;
      state.position += 1;
    }
    while (state.position < state.length - 1) {
      readDocument(state);
    }
    return state.documents;
  }
  function loadAll(input, iterator, options) {
    if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
      options = iterator;
      iterator = null;
    }
    var documents = loadDocuments(input, options);
    if (typeof iterator !== "function") {
      return documents;
    }
    for (var index = 0, length = documents.length; index < length; index += 1) {
      iterator(documents[index]);
    }
  }
  function load(input, options) {
    var documents = loadDocuments(input, options);
    if (documents.length === 0) {
      return void 0;
    } else if (documents.length === 1) {
      return documents[0];
    }
    throw new YAMLException("expected a single document in the stream, but found more");
  }
  function safeLoadAll(input, iterator, options) {
    if (typeof iterator === "object" && iterator !== null && typeof options === "undefined") {
      options = iterator;
      iterator = null;
    }
    return loadAll(input, iterator, common2.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
  }
  function safeLoad(input, options) {
    return load(input, common2.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
  }
  loader.loadAll = loadAll;
  loader.load = load;
  loader.safeLoadAll = safeLoadAll;
  loader.safeLoad = safeLoad;
  return loader;
}
var dumper = {};
var hasRequiredDumper;
function requireDumper() {
  if (hasRequiredDumper)
    return dumper;
  hasRequiredDumper = 1;
  var common2 = requireCommon();
  var YAMLException = requireException();
  var DEFAULT_FULL_SCHEMA = requireDefault_full();
  var DEFAULT_SAFE_SCHEMA = requireDefault_safe();
  var _toString = Object.prototype.toString;
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  var CHAR_TAB = 9;
  var CHAR_LINE_FEED = 10;
  var CHAR_CARRIAGE_RETURN = 13;
  var CHAR_SPACE = 32;
  var CHAR_EXCLAMATION = 33;
  var CHAR_DOUBLE_QUOTE = 34;
  var CHAR_SHARP = 35;
  var CHAR_PERCENT = 37;
  var CHAR_AMPERSAND = 38;
  var CHAR_SINGLE_QUOTE = 39;
  var CHAR_ASTERISK = 42;
  var CHAR_COMMA = 44;
  var CHAR_MINUS = 45;
  var CHAR_COLON = 58;
  var CHAR_EQUALS = 61;
  var CHAR_GREATER_THAN = 62;
  var CHAR_QUESTION = 63;
  var CHAR_COMMERCIAL_AT = 64;
  var CHAR_LEFT_SQUARE_BRACKET = 91;
  var CHAR_RIGHT_SQUARE_BRACKET = 93;
  var CHAR_GRAVE_ACCENT = 96;
  var CHAR_LEFT_CURLY_BRACKET = 123;
  var CHAR_VERTICAL_LINE = 124;
  var CHAR_RIGHT_CURLY_BRACKET = 125;
  var ESCAPE_SEQUENCES = {};
  ESCAPE_SEQUENCES[0] = "\\0";
  ESCAPE_SEQUENCES[7] = "\\a";
  ESCAPE_SEQUENCES[8] = "\\b";
  ESCAPE_SEQUENCES[9] = "\\t";
  ESCAPE_SEQUENCES[10] = "\\n";
  ESCAPE_SEQUENCES[11] = "\\v";
  ESCAPE_SEQUENCES[12] = "\\f";
  ESCAPE_SEQUENCES[13] = "\\r";
  ESCAPE_SEQUENCES[27] = "\\e";
  ESCAPE_SEQUENCES[34] = '\\"';
  ESCAPE_SEQUENCES[92] = "\\\\";
  ESCAPE_SEQUENCES[133] = "\\N";
  ESCAPE_SEQUENCES[160] = "\\_";
  ESCAPE_SEQUENCES[8232] = "\\L";
  ESCAPE_SEQUENCES[8233] = "\\P";
  var DEPRECATED_BOOLEANS_SYNTAX = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF"
  ];
  function compileStyleMap(schema2, map2) {
    var result, keys, index, length, tag, style, type2;
    if (map2 === null)
      return {};
    result = {};
    keys = Object.keys(map2);
    for (index = 0, length = keys.length; index < length; index += 1) {
      tag = keys[index];
      style = String(map2[tag]);
      if (tag.slice(0, 2) === "!!") {
        tag = "tag:yaml.org,2002:" + tag.slice(2);
      }
      type2 = schema2.compiledTypeMap["fallback"][tag];
      if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
        style = type2.styleAliases[style];
      }
      result[tag] = style;
    }
    return result;
  }
  function encodeHex(character) {
    var string2, handle, length;
    string2 = character.toString(16).toUpperCase();
    if (character <= 255) {
      handle = "x";
      length = 2;
    } else if (character <= 65535) {
      handle = "u";
      length = 4;
    } else if (character <= 4294967295) {
      handle = "U";
      length = 8;
    } else {
      throw new YAMLException("code point within a string may not be greater than 0xFFFFFFFF");
    }
    return "\\" + handle + common2.repeat("0", length - string2.length) + string2;
  }
  function State(options) {
    this.schema = options["schema"] || DEFAULT_FULL_SCHEMA;
    this.indent = Math.max(1, options["indent"] || 2);
    this.noArrayIndent = options["noArrayIndent"] || false;
    this.skipInvalid = options["skipInvalid"] || false;
    this.flowLevel = common2.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
    this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
    this.sortKeys = options["sortKeys"] || false;
    this.lineWidth = options["lineWidth"] || 80;
    this.noRefs = options["noRefs"] || false;
    this.noCompatMode = options["noCompatMode"] || false;
    this.condenseFlow = options["condenseFlow"] || false;
    this.implicitTypes = this.schema.compiledImplicit;
    this.explicitTypes = this.schema.compiledExplicit;
    this.tag = null;
    this.result = "";
    this.duplicates = [];
    this.usedDuplicates = null;
  }
  function indentString(string2, spaces) {
    var ind = common2.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string2.length;
    while (position < length) {
      next = string2.indexOf("\n", position);
      if (next === -1) {
        line = string2.slice(position);
        position = length;
      } else {
        line = string2.slice(position, next + 1);
        position = next + 1;
      }
      if (line.length && line !== "\n")
        result += ind;
      result += line;
    }
    return result;
  }
  function generateNextLine(state, level) {
    return "\n" + common2.repeat(" ", state.indent * level);
  }
  function testImplicitResolving(state, str2) {
    var index, length, type2;
    for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
      type2 = state.implicitTypes[index];
      if (type2.resolve(str2)) {
        return true;
      }
    }
    return false;
  }
  function isWhitespace(c) {
    return c === CHAR_SPACE || c === CHAR_TAB;
  }
  function isPrintable(c) {
    return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== 65279 || 65536 <= c && c <= 1114111;
  }
  function isNsChar(c) {
    return isPrintable(c) && !isWhitespace(c) && c !== 65279 && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
  }
  function isPlainSafe(c, prev) {
    return isPrintable(c) && c !== 65279 && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_COLON && (c !== CHAR_SHARP || prev && isNsChar(prev));
  }
  function isPlainSafeFirst(c) {
    return isPrintable(c) && c !== 65279 && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
  }
  function needIndentIndicator(string2) {
    var leadingSpaceRe = /^\n* /;
    return leadingSpaceRe.test(string2);
  }
  var STYLE_PLAIN = 1, STYLE_SINGLE = 2, STYLE_LITERAL = 3, STYLE_FOLDED = 4, STYLE_DOUBLE = 5;
  function chooseScalarStyle(string2, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
    var i;
    var char, prev_char;
    var hasLineBreak = false;
    var hasFoldableLine = false;
    var shouldTrackWidth = lineWidth !== -1;
    var previousLineBreak = -1;
    var plain = isPlainSafeFirst(string2.charCodeAt(0)) && !isWhitespace(string2.charCodeAt(string2.length - 1));
    if (singleLineOnly) {
      for (i = 0; i < string2.length; i++) {
        char = string2.charCodeAt(i);
        if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        prev_char = i > 0 ? string2.charCodeAt(i - 1) : null;
        plain = plain && isPlainSafe(char, prev_char);
      }
    } else {
      for (i = 0; i < string2.length; i++) {
        char = string2.charCodeAt(i);
        if (char === CHAR_LINE_FEED) {
          hasLineBreak = true;
          if (shouldTrackWidth) {
            hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
            i - previousLineBreak - 1 > lineWidth && string2[previousLineBreak + 1] !== " ";
            previousLineBreak = i;
          }
        } else if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        prev_char = i > 0 ? string2.charCodeAt(i - 1) : null;
        plain = plain && isPlainSafe(char, prev_char);
      }
      hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string2[previousLineBreak + 1] !== " ");
    }
    if (!hasLineBreak && !hasFoldableLine) {
      return plain && !testAmbiguousType(string2) ? STYLE_PLAIN : STYLE_SINGLE;
    }
    if (indentPerLevel > 9 && needIndentIndicator(string2)) {
      return STYLE_DOUBLE;
    }
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  function writeScalar(state, string2, level, iskey) {
    state.dump = function() {
      if (string2.length === 0) {
        return "''";
      }
      if (!state.noCompatMode && DEPRECATED_BOOLEANS_SYNTAX.indexOf(string2) !== -1) {
        return "'" + string2 + "'";
      }
      var indent = state.indent * Math.max(1, level);
      var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
      var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
      function testAmbiguity(string3) {
        return testImplicitResolving(state, string3);
      }
      switch (chooseScalarStyle(string2, singleLineOnly, state.indent, lineWidth, testAmbiguity)) {
        case STYLE_PLAIN:
          return string2;
        case STYLE_SINGLE:
          return "'" + string2.replace(/'/g, "''") + "'";
        case STYLE_LITERAL:
          return "|" + blockHeader(string2, state.indent) + dropEndingNewline(indentString(string2, indent));
        case STYLE_FOLDED:
          return ">" + blockHeader(string2, state.indent) + dropEndingNewline(indentString(foldString(string2, lineWidth), indent));
        case STYLE_DOUBLE:
          return '"' + escapeString(string2) + '"';
        default:
          throw new YAMLException("impossible error: invalid scalar style");
      }
    }();
  }
  function blockHeader(string2, indentPerLevel) {
    var indentIndicator = needIndentIndicator(string2) ? String(indentPerLevel) : "";
    var clip = string2[string2.length - 1] === "\n";
    var keep = clip && (string2[string2.length - 2] === "\n" || string2 === "\n");
    var chomp = keep ? "+" : clip ? "" : "-";
    return indentIndicator + chomp + "\n";
  }
  function dropEndingNewline(string2) {
    return string2[string2.length - 1] === "\n" ? string2.slice(0, -1) : string2;
  }
  function foldString(string2, width) {
    var lineRe = /(\n+)([^\n]*)/g;
    var result = function() {
      var nextLF = string2.indexOf("\n");
      nextLF = nextLF !== -1 ? nextLF : string2.length;
      lineRe.lastIndex = nextLF;
      return foldLine(string2.slice(0, nextLF), width);
    }();
    var prevMoreIndented = string2[0] === "\n" || string2[0] === " ";
    var moreIndented;
    var match;
    while (match = lineRe.exec(string2)) {
      var prefix = match[1], line = match[2];
      moreIndented = line[0] === " ";
      result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
      prevMoreIndented = moreIndented;
    }
    return result;
  }
  function foldLine(line, width) {
    if (line === "" || line[0] === " ")
      return line;
    var breakRe = / [^ ]/g;
    var match;
    var start = 0, end, curr = 0, next = 0;
    var result = "";
    while (match = breakRe.exec(line)) {
      next = match.index;
      if (next - start > width) {
        end = curr > start ? curr : next;
        result += "\n" + line.slice(start, end);
        start = end + 1;
      }
      curr = next;
    }
    result += "\n";
    if (line.length - start > width && curr > start) {
      result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
    } else {
      result += line.slice(start);
    }
    return result.slice(1);
  }
  function escapeString(string2) {
    var result = "";
    var char, nextChar;
    var escapeSeq;
    for (var i = 0; i < string2.length; i++) {
      char = string2.charCodeAt(i);
      if (char >= 55296 && char <= 56319) {
        nextChar = string2.charCodeAt(i + 1);
        if (nextChar >= 56320 && nextChar <= 57343) {
          result += encodeHex((char - 55296) * 1024 + nextChar - 56320 + 65536);
          i++;
          continue;
        }
      }
      escapeSeq = ESCAPE_SEQUENCES[char];
      result += !escapeSeq && isPrintable(char) ? string2[i] : escapeSeq || encodeHex(char);
    }
    return result;
  }
  function writeFlowSequence(state, level, object) {
    var _result = "", _tag = state.tag, index, length;
    for (index = 0, length = object.length; index < length; index += 1) {
      if (writeNode(state, level, object[index], false, false)) {
        if (index !== 0)
          _result += "," + (!state.condenseFlow ? " " : "");
        _result += state.dump;
      }
    }
    state.tag = _tag;
    state.dump = "[" + _result + "]";
  }
  function writeBlockSequence(state, level, object, compact) {
    var _result = "", _tag = state.tag, index, length;
    for (index = 0, length = object.length; index < length; index += 1) {
      if (writeNode(state, level + 1, object[index], true, true)) {
        if (!compact || index !== 0) {
          _result += generateNextLine(state, level);
        }
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          _result += "-";
        } else {
          _result += "- ";
        }
        _result += state.dump;
      }
    }
    state.tag = _tag;
    state.dump = _result || "[]";
  }
  function writeFlowMapping(state, level, object) {
    var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
    for (index = 0, length = objectKeyList.length; index < length; index += 1) {
      pairBuffer = "";
      if (index !== 0)
        pairBuffer += ", ";
      if (state.condenseFlow)
        pairBuffer += '"';
      objectKey = objectKeyList[index];
      objectValue = object[objectKey];
      if (!writeNode(state, level, objectKey, false, false)) {
        continue;
      }
      if (state.dump.length > 1024)
        pairBuffer += "? ";
      pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
      if (!writeNode(state, level, objectValue, false, false)) {
        continue;
      }
      pairBuffer += state.dump;
      _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = "{" + _result + "}";
  }
  function writeBlockMapping(state, level, object, compact) {
    var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
    if (state.sortKeys === true) {
      objectKeyList.sort();
    } else if (typeof state.sortKeys === "function") {
      objectKeyList.sort(state.sortKeys);
    } else if (state.sortKeys) {
      throw new YAMLException("sortKeys must be a boolean or a function");
    }
    for (index = 0, length = objectKeyList.length; index < length; index += 1) {
      pairBuffer = "";
      if (!compact || index !== 0) {
        pairBuffer += generateNextLine(state, level);
      }
      objectKey = objectKeyList[index];
      objectValue = object[objectKey];
      if (!writeNode(state, level + 1, objectKey, true, true, true)) {
        continue;
      }
      explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
      if (explicitPair) {
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          pairBuffer += "?";
        } else {
          pairBuffer += "? ";
        }
      }
      pairBuffer += state.dump;
      if (explicitPair) {
        pairBuffer += generateNextLine(state, level);
      }
      if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
        continue;
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += ":";
      } else {
        pairBuffer += ": ";
      }
      pairBuffer += state.dump;
      _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = _result || "{}";
  }
  function detectType(state, object, explicit) {
    var _result, typeList, index, length, type2, style;
    typeList = explicit ? state.explicitTypes : state.implicitTypes;
    for (index = 0, length = typeList.length; index < length; index += 1) {
      type2 = typeList[index];
      if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
        state.tag = explicit ? type2.tag : "?";
        if (type2.represent) {
          style = state.styleMap[type2.tag] || type2.defaultStyle;
          if (_toString.call(type2.represent) === "[object Function]") {
            _result = type2.represent(object, style);
          } else if (_hasOwnProperty.call(type2.represent, style)) {
            _result = type2.represent[style](object, style);
          } else {
            throw new YAMLException("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
          }
          state.dump = _result;
        }
        return true;
      }
    }
    return false;
  }
  function writeNode(state, level, object, block, compact, iskey) {
    state.tag = null;
    state.dump = object;
    if (!detectType(state, object, false)) {
      detectType(state, object, true);
    }
    var type2 = _toString.call(state.dump);
    if (block) {
      block = state.flowLevel < 0 || state.flowLevel > level;
    }
    var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
    if (objectOrArray) {
      duplicateIndex = state.duplicates.indexOf(object);
      duplicate = duplicateIndex !== -1;
    }
    if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
      compact = false;
    }
    if (duplicate && state.usedDuplicates[duplicateIndex]) {
      state.dump = "*ref_" + duplicateIndex;
    } else {
      if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
        state.usedDuplicates[duplicateIndex] = true;
      }
      if (type2 === "[object Object]") {
        if (block && Object.keys(state.dump).length !== 0) {
          writeBlockMapping(state, level, state.dump, compact);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + state.dump;
          }
        } else {
          writeFlowMapping(state, level, state.dump);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + " " + state.dump;
          }
        }
      } else if (type2 === "[object Array]") {
        var arrayLevel = state.noArrayIndent && level > 0 ? level - 1 : level;
        if (block && state.dump.length !== 0) {
          writeBlockSequence(state, arrayLevel, state.dump, compact);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + state.dump;
          }
        } else {
          writeFlowSequence(state, arrayLevel, state.dump);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + " " + state.dump;
          }
        }
      } else if (type2 === "[object String]") {
        if (state.tag !== "?") {
          writeScalar(state, state.dump, level, iskey);
        }
      } else {
        if (state.skipInvalid)
          return false;
        throw new YAMLException("unacceptable kind of an object to dump " + type2);
      }
      if (state.tag !== null && state.tag !== "?") {
        state.dump = "!<" + state.tag + "> " + state.dump;
      }
    }
    return true;
  }
  function getDuplicateReferences(object, state) {
    var objects = [], duplicatesIndexes = [], index, length;
    inspectNode(object, objects, duplicatesIndexes);
    for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
      state.duplicates.push(objects[duplicatesIndexes[index]]);
    }
    state.usedDuplicates = new Array(length);
  }
  function inspectNode(object, objects, duplicatesIndexes) {
    var objectKeyList, index, length;
    if (object !== null && typeof object === "object") {
      index = objects.indexOf(object);
      if (index !== -1) {
        if (duplicatesIndexes.indexOf(index) === -1) {
          duplicatesIndexes.push(index);
        }
      } else {
        objects.push(object);
        if (Array.isArray(object)) {
          for (index = 0, length = object.length; index < length; index += 1) {
            inspectNode(object[index], objects, duplicatesIndexes);
          }
        } else {
          objectKeyList = Object.keys(object);
          for (index = 0, length = objectKeyList.length; index < length; index += 1) {
            inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
          }
        }
      }
    }
  }
  function dump(input, options) {
    options = options || {};
    var state = new State(options);
    if (!state.noRefs)
      getDuplicateReferences(input, state);
    if (writeNode(state, 0, input, true, true))
      return state.dump + "\n";
    return "";
  }
  function safeDump(input, options) {
    return dump(input, common2.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
  }
  dumper.dump = dump;
  dumper.safeDump = safeDump;
  return dumper;
}
var hasRequiredJsYaml$1;
function requireJsYaml$1() {
  if (hasRequiredJsYaml$1)
    return jsYaml$1;
  hasRequiredJsYaml$1 = 1;
  var loader2 = requireLoader();
  var dumper2 = requireDumper();
  function deprecated(name) {
    return function() {
      throw new Error("Function " + name + " is deprecated and cannot be used.");
    };
  }
  jsYaml$1.Type = requireType();
  jsYaml$1.Schema = requireSchema();
  jsYaml$1.FAILSAFE_SCHEMA = requireFailsafe();
  jsYaml$1.JSON_SCHEMA = requireJson();
  jsYaml$1.CORE_SCHEMA = requireCore();
  jsYaml$1.DEFAULT_SAFE_SCHEMA = requireDefault_safe();
  jsYaml$1.DEFAULT_FULL_SCHEMA = requireDefault_full();
  jsYaml$1.load = loader2.load;
  jsYaml$1.loadAll = loader2.loadAll;
  jsYaml$1.safeLoad = loader2.safeLoad;
  jsYaml$1.safeLoadAll = loader2.safeLoadAll;
  jsYaml$1.dump = dumper2.dump;
  jsYaml$1.safeDump = dumper2.safeDump;
  jsYaml$1.YAMLException = requireException();
  jsYaml$1.MINIMAL_SCHEMA = requireFailsafe();
  jsYaml$1.SAFE_SCHEMA = requireDefault_safe();
  jsYaml$1.DEFAULT_SCHEMA = requireDefault_full();
  jsYaml$1.scan = deprecated("scan");
  jsYaml$1.parse = deprecated("parse");
  jsYaml$1.compose = deprecated("compose");
  jsYaml$1.addConstructor = deprecated("addConstructor");
  return jsYaml$1;
}
var jsYaml;
var hasRequiredJsYaml;
function requireJsYaml() {
  if (hasRequiredJsYaml)
    return jsYaml;
  hasRequiredJsYaml = 1;
  var yaml = requireJsYaml$1();
  jsYaml = yaml;
  return jsYaml;
}
var hasRequiredReadYamlFile;
function requireReadYamlFile() {
  if (hasRequiredReadYamlFile)
    return readYamlFile.exports;
  hasRequiredReadYamlFile = 1;
  const fs2 = gracefulFs;
  const pify2 = requirePify();
  const stripBom2 = requireStripBom();
  const yaml = requireJsYaml();
  const parse2 = (data) => yaml.safeLoad(stripBom2(data));
  const readYamlFile$1 = (fp) => pify2(fs2.readFile)(fp, "utf8").then((data) => parse2(data));
  readYamlFile.exports = readYamlFile$1;
  readYamlFile.exports.default = readYamlFile$1;
  readYamlFile.exports.sync = (fp) => parse2(fs2.readFileSync(fp, "utf8"));
  return readYamlFile.exports;
}
var jju = { exports: {} };
var parse = { exports: {} };
var unicode = { exports: {} };
var hasRequiredUnicode;
function requireUnicode() {
  if (hasRequiredUnicode)
    return unicode.exports;
  hasRequiredUnicode = 1;
  (function(module2) {
    var Uni = module2.exports;
    module2.exports.isWhiteSpace = function isWhiteSpace(x) {
      return x === " " || x === " " || x === "\uFEFF" || x >= "	" && x <= "\r" || x === " " || x >= " " && x <= " " || x === "\u2028" || x === "\u2029" || x === " " || x === " " || x === "　";
    };
    module2.exports.isWhiteSpaceJSON = function isWhiteSpaceJSON(x) {
      return x === " " || x === "	" || x === "\n" || x === "\r";
    };
    module2.exports.isLineTerminator = function isLineTerminator(x) {
      return x === "\n" || x === "\r" || x === "\u2028" || x === "\u2029";
    };
    module2.exports.isLineTerminatorJSON = function isLineTerminatorJSON(x) {
      return x === "\n" || x === "\r";
    };
    module2.exports.isIdentifierStart = function isIdentifierStart(x) {
      return x === "$" || x === "_" || x >= "A" && x <= "Z" || x >= "a" && x <= "z" || x >= "" && Uni.NonAsciiIdentifierStart.test(x);
    };
    module2.exports.isIdentifierPart = function isIdentifierPart(x) {
      return x === "$" || x === "_" || x >= "A" && x <= "Z" || x >= "a" && x <= "z" || x >= "0" && x <= "9" || x >= "" && Uni.NonAsciiIdentifierPart.test(x);
    };
    module2.exports.NonAsciiIdentifierStart = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/;
    module2.exports.NonAsciiIdentifierPart = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0\u08A2-\u08AC\u08E4-\u08FE\u0900-\u0963\u0966-\u096F\u0971-\u0977\u0979-\u097F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191C\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1D00-\u1DE6\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA697\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7B\uAA80-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE26\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/;
  })(unicode);
  return unicode.exports;
}
var hasRequiredParse;
function requireParse() {
  if (hasRequiredParse)
    return parse.exports;
  hasRequiredParse = 1;
  (function(module2) {
    var Uni = requireUnicode();
    function isHexDigit(x) {
      return x >= "0" && x <= "9" || x >= "A" && x <= "F" || x >= "a" && x <= "f";
    }
    function isOctDigit(x) {
      return x >= "0" && x <= "7";
    }
    function isDecDigit(x) {
      return x >= "0" && x <= "9";
    }
    var unescapeMap = {
      "'": "'",
      '"': '"',
      "\\": "\\",
      "b": "\b",
      "f": "\f",
      "n": "\n",
      "r": "\r",
      "t": "	",
      "v": "\v",
      "/": "/"
    };
    function formatError(input, msg, position, lineno, column, json5) {
      var result = msg + " at " + (lineno + 1) + ":" + (column + 1), tmppos = position - column - 1, srcline = "", underline = "";
      var isLineTerminator = json5 ? Uni.isLineTerminator : Uni.isLineTerminatorJSON;
      if (tmppos < position - 70) {
        tmppos = position - 70;
      }
      while (1) {
        var chr = input[++tmppos];
        if (isLineTerminator(chr) || tmppos === input.length) {
          if (position >= tmppos) {
            underline += "^";
          }
          break;
        }
        srcline += chr;
        if (position === tmppos) {
          underline += "^";
        } else if (position > tmppos) {
          underline += input[tmppos] === "	" ? "	" : " ";
        }
        if (srcline.length > 78)
          break;
      }
      return result + "\n" + srcline + "\n" + underline;
    }
    function parse2(input, options) {
      var json5 = false;
      var cjson = false;
      if (options.legacy || options.mode === "json")
        ;
      else if (options.mode === "cjson") {
        cjson = true;
      } else if (options.mode === "json5") {
        json5 = true;
      } else {
        json5 = true;
      }
      var isLineTerminator = json5 ? Uni.isLineTerminator : Uni.isLineTerminatorJSON;
      var isWhiteSpace = json5 ? Uni.isWhiteSpace : Uni.isWhiteSpaceJSON;
      var length = input.length, lineno = 0, linestart = 0, position = 0, stack = [];
      var tokenStart = function() {
      };
      var tokenEnd = function(v) {
        return v;
      };
      if (options._tokenize) {
        (function() {
          var start = null;
          tokenStart = function() {
            if (start !== null)
              throw Error("internal error, token overlap");
            start = position;
          };
          tokenEnd = function(v, type2) {
            if (start != position) {
              var hash = {
                raw: input.substr(start, position - start),
                type: type2,
                stack: stack.slice(0)
              };
              if (v !== void 0)
                hash.value = v;
              options._tokenize.call(null, hash);
            }
            start = null;
            return v;
          };
        })();
      }
      function fail(msg) {
        var column = position - linestart;
        if (!msg) {
          if (position < length) {
            var token = "'" + JSON.stringify(input[position]).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
            if (!msg)
              msg = "Unexpected token " + token;
          } else {
            if (!msg)
              msg = "Unexpected end of input";
          }
        }
        var error2 = SyntaxError(formatError(input, msg, position, lineno, column, json5));
        error2.row = lineno + 1;
        error2.column = column + 1;
        throw error2;
      }
      function newline(chr) {
        if (chr === "\r" && input[position] === "\n")
          position++;
        linestart = position;
        lineno++;
      }
      function parseGeneric() {
        while (position < length) {
          tokenStart();
          var chr = input[position++];
          if (chr === '"' || chr === "'" && json5) {
            return tokenEnd(parseString(chr), "literal");
          } else if (chr === "{") {
            tokenEnd(void 0, "separator");
            return parseObject();
          } else if (chr === "[") {
            tokenEnd(void 0, "separator");
            return parseArray();
          } else if (chr === "-" || chr === "." || isDecDigit(chr) || json5 && (chr === "+" || chr === "I" || chr === "N")) {
            return tokenEnd(parseNumber(), "literal");
          } else if (chr === "n") {
            parseKeyword("null");
            return tokenEnd(null, "literal");
          } else if (chr === "t") {
            parseKeyword("true");
            return tokenEnd(true, "literal");
          } else if (chr === "f") {
            parseKeyword("false");
            return tokenEnd(false, "literal");
          } else {
            position--;
            return tokenEnd(void 0);
          }
        }
      }
      function parseKey() {
        var result;
        while (position < length) {
          tokenStart();
          var chr = input[position++];
          if (chr === '"' || chr === "'" && json5) {
            return tokenEnd(parseString(chr), "key");
          } else if (chr === "{") {
            tokenEnd(void 0, "separator");
            return parseObject();
          } else if (chr === "[") {
            tokenEnd(void 0, "separator");
            return parseArray();
          } else if (chr === "." || isDecDigit(chr)) {
            return tokenEnd(parseNumber(), "key");
          } else if (json5 && Uni.isIdentifierStart(chr) || chr === "\\" && input[position] === "u") {
            var rollback = position - 1;
            var result = parseIdentifier();
            if (result === void 0) {
              position = rollback;
              return tokenEnd(void 0);
            } else {
              return tokenEnd(result, "key");
            }
          } else {
            position--;
            return tokenEnd(void 0);
          }
        }
      }
      function skipWhiteSpace() {
        tokenStart();
        while (position < length) {
          var chr = input[position++];
          if (isLineTerminator(chr)) {
            position--;
            tokenEnd(void 0, "whitespace");
            tokenStart();
            position++;
            newline(chr);
            tokenEnd(void 0, "newline");
            tokenStart();
          } else if (isWhiteSpace(chr))
            ;
          else if (chr === "/" && (json5 || cjson) && (input[position] === "/" || input[position] === "*")) {
            position--;
            tokenEnd(void 0, "whitespace");
            tokenStart();
            position++;
            skipComment(input[position++] === "*");
            tokenEnd(void 0, "comment");
            tokenStart();
          } else {
            position--;
            break;
          }
        }
        return tokenEnd(void 0, "whitespace");
      }
      function skipComment(multi) {
        while (position < length) {
          var chr = input[position++];
          if (isLineTerminator(chr)) {
            if (!multi) {
              position--;
              return;
            }
            newline(chr);
          } else if (chr === "*" && multi) {
            if (input[position] === "/") {
              position++;
              return;
            }
          } else
            ;
        }
        if (multi) {
          fail("Unclosed multiline comment");
        }
      }
      function parseKeyword(keyword) {
        var _pos = position;
        var len = keyword.length;
        for (var i = 1; i < len; i++) {
          if (position >= length || keyword[i] != input[position]) {
            position = _pos - 1;
            fail();
          }
          position++;
        }
      }
      function parseObject() {
        var result = options.null_prototype ? /* @__PURE__ */ Object.create(null) : {}, empty_object = {}, is_non_empty = false;
        while (position < length) {
          skipWhiteSpace();
          var item1 = parseKey();
          skipWhiteSpace();
          tokenStart();
          var chr = input[position++];
          tokenEnd(void 0, "separator");
          if (chr === "}" && item1 === void 0) {
            if (!json5 && is_non_empty) {
              position--;
              fail("Trailing comma in object");
            }
            return result;
          } else if (chr === ":" && item1 !== void 0) {
            skipWhiteSpace();
            stack.push(item1);
            var item2 = parseGeneric();
            stack.pop();
            if (item2 === void 0)
              fail("No value found for key " + item1);
            if (typeof item1 !== "string") {
              if (!json5 || typeof item1 !== "number") {
                fail("Wrong key type: " + item1);
              }
            }
            if ((item1 in empty_object || empty_object[item1] != null) && options.reserved_keys !== "replace") {
              if (options.reserved_keys === "throw") {
                fail("Reserved key: " + item1);
              }
            } else {
              if (typeof options.reviver === "function") {
                item2 = options.reviver.call(null, item1, item2);
              }
              if (item2 !== void 0) {
                is_non_empty = true;
                Object.defineProperty(result, item1, {
                  value: item2,
                  enumerable: true,
                  configurable: true,
                  writable: true
                });
              }
            }
            skipWhiteSpace();
            tokenStart();
            var chr = input[position++];
            tokenEnd(void 0, "separator");
            if (chr === ",") {
              continue;
            } else if (chr === "}") {
              return result;
            } else {
              fail();
            }
          } else {
            position--;
            fail();
          }
        }
        fail();
      }
      function parseArray() {
        var result = [];
        while (position < length) {
          skipWhiteSpace();
          stack.push(result.length);
          var item = parseGeneric();
          stack.pop();
          skipWhiteSpace();
          tokenStart();
          var chr = input[position++];
          tokenEnd(void 0, "separator");
          if (item !== void 0) {
            if (typeof options.reviver === "function") {
              item = options.reviver.call(null, String(result.length), item);
            }
            if (item === void 0) {
              result.length++;
              item = true;
            } else {
              result.push(item);
            }
          }
          if (chr === ",") {
            if (item === void 0) {
              fail("Elisions are not supported");
            }
          } else if (chr === "]") {
            if (!json5 && item === void 0 && result.length) {
              position--;
              fail("Trailing comma in array");
            }
            return result;
          } else {
            position--;
            fail();
          }
        }
      }
      function parseNumber() {
        position--;
        var start = position, chr = input[position++];
        var to_num = function(is_octal2) {
          var str2 = input.substr(start, position - start);
          if (is_octal2) {
            var result = parseInt(str2.replace(/^0o?/, ""), 8);
          } else {
            var result = Number(str2);
          }
          if (Number.isNaN(result)) {
            position--;
            fail('Bad numeric literal - "' + input.substr(start, position - start + 1) + '"');
          } else if (!json5 && !str2.match(/^-?(0|[1-9][0-9]*)(\.[0-9]+)?(e[+-]?[0-9]+)?$/i)) {
            position--;
            fail('Non-json numeric literal - "' + input.substr(start, position - start + 1) + '"');
          } else {
            return result;
          }
        };
        if (chr === "-" || chr === "+" && json5)
          chr = input[position++];
        if (chr === "N" && json5) {
          parseKeyword("NaN");
          return NaN;
        }
        if (chr === "I" && json5) {
          parseKeyword("Infinity");
          return to_num();
        }
        if (chr >= "1" && chr <= "9") {
          while (position < length && isDecDigit(input[position]))
            position++;
          chr = input[position++];
        }
        if (chr === "0") {
          chr = input[position++];
          var is_octal = chr === "o" || chr === "O" || isOctDigit(chr);
          var is_hex = chr === "x" || chr === "X";
          if (json5 && (is_octal || is_hex)) {
            while (position < length && (is_hex ? isHexDigit : isOctDigit)(input[position]))
              position++;
            var sign = 1;
            if (input[start] === "-") {
              sign = -1;
              start++;
            } else if (input[start] === "+") {
              start++;
            }
            return sign * to_num(is_octal);
          }
        }
        if (chr === ".") {
          while (position < length && isDecDigit(input[position]))
            position++;
          chr = input[position++];
        }
        if (chr === "e" || chr === "E") {
          chr = input[position++];
          if (chr === "-" || chr === "+")
            position++;
          while (position < length && isDecDigit(input[position]))
            position++;
          chr = input[position++];
        }
        position--;
        return to_num();
      }
      function parseIdentifier() {
        position--;
        var result = "";
        while (position < length) {
          var chr = input[position++];
          if (chr === "\\" && input[position] === "u" && isHexDigit(input[position + 1]) && isHexDigit(input[position + 2]) && isHexDigit(input[position + 3]) && isHexDigit(input[position + 4])) {
            chr = String.fromCharCode(parseInt(input.substr(position + 1, 4), 16));
            position += 5;
          }
          if (result.length) {
            if (Uni.isIdentifierPart(chr)) {
              result += chr;
            } else {
              position--;
              return result;
            }
          } else {
            if (Uni.isIdentifierStart(chr)) {
              result += chr;
            } else {
              return void 0;
            }
          }
        }
        fail();
      }
      function parseString(endChar) {
        var result = "";
        while (position < length) {
          var chr = input[position++];
          if (chr === endChar) {
            return result;
          } else if (chr === "\\") {
            if (position >= length)
              fail();
            chr = input[position++];
            if (unescapeMap[chr] && (json5 || chr != "v" && chr != "'")) {
              result += unescapeMap[chr];
            } else if (json5 && isLineTerminator(chr)) {
              newline(chr);
            } else if (chr === "u" || chr === "x" && json5) {
              var off = chr === "u" ? 4 : 2;
              for (var i = 0; i < off; i++) {
                if (position >= length)
                  fail();
                if (!isHexDigit(input[position]))
                  fail("Bad escape sequence");
                position++;
              }
              result += String.fromCharCode(parseInt(input.substr(position - off, off), 16));
            } else if (json5 && isOctDigit(chr)) {
              if (chr < "4" && isOctDigit(input[position]) && isOctDigit(input[position + 1])) {
                var digits = 3;
              } else if (isOctDigit(input[position])) {
                var digits = 2;
              } else {
                var digits = 1;
              }
              position += digits - 1;
              result += String.fromCharCode(parseInt(input.substr(position - digits, digits), 8));
            } else if (json5) {
              result += chr;
            } else {
              position--;
              fail();
            }
          } else if (isLineTerminator(chr)) {
            fail();
          } else {
            if (!json5 && chr.charCodeAt(0) < 32) {
              position--;
              fail("Unexpected control character");
            }
            result += chr;
          }
        }
        fail();
      }
      skipWhiteSpace();
      var return_value = parseGeneric();
      if (return_value !== void 0 || position < length) {
        skipWhiteSpace();
        if (position >= length) {
          if (typeof options.reviver === "function") {
            return_value = options.reviver.call(null, "", return_value);
          }
          return return_value;
        } else {
          fail();
        }
      } else {
        if (position) {
          fail("No data, only a whitespace");
        } else {
          fail("No data, empty input");
        }
      }
    }
    module2.exports.parse = function parseJSON(input, options) {
      if (typeof options === "function") {
        options = {
          reviver: options
        };
      }
      if (input === void 0) {
        return void 0;
      }
      if (typeof input !== "string")
        input = String(input);
      if (options == null)
        options = {};
      if (options.reserved_keys == null)
        options.reserved_keys = "ignore";
      if (options.reserved_keys === "throw" || options.reserved_keys === "ignore") {
        if (options.null_prototype == null) {
          options.null_prototype = true;
        }
      }
      try {
        return parse2(input, options);
      } catch (err) {
        if (err instanceof SyntaxError && err.row != null && err.column != null) {
          var old_err = err;
          err = SyntaxError(old_err.message);
          err.column = old_err.column;
          err.row = old_err.row;
        }
        throw err;
      }
    };
    module2.exports.tokenize = function tokenizeJSON(input, options) {
      if (options == null)
        options = {};
      options._tokenize = function(smth) {
        if (options._addstack)
          smth.stack.unshift.apply(smth.stack, options._addstack);
        tokens.push(smth);
      };
      var tokens = [];
      tokens.data = module2.exports.parse(input, options);
      return tokens;
    };
  })(parse);
  return parse.exports;
}
var stringify = {};
var hasRequiredStringify;
function requireStringify() {
  if (hasRequiredStringify)
    return stringify;
  hasRequiredStringify = 1;
  var Uni = requireUnicode();
  if (!(function f() {
  }).name) {
    Object.defineProperty((function() {
    }).constructor.prototype, "name", {
      get: function() {
        var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
        Object.defineProperty(this, "name", { value: name });
        return name;
      }
    });
  }
  var special_chars = {
    0: "\\0",
    // this is not an octal literal
    8: "\\b",
    9: "\\t",
    10: "\\n",
    11: "\\v",
    12: "\\f",
    13: "\\r",
    92: "\\\\"
  };
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var escapable = /[\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/;
  function _stringify(object, options, recursiveLvl, currentKey) {
    var json5 = options.mode === "json5" || !options.mode;
    function indent(str3, add) {
      var prefix = options._prefix ? options._prefix : "";
      if (!options.indent)
        return prefix + str3;
      var result = "";
      var count = recursiveLvl + (add || 0);
      for (var i = 0; i < count; i++)
        result += options.indent;
      return prefix + result + str3 + (add ? "\n" : "");
    }
    function _stringify_key(key) {
      if (options.quote_keys)
        return _stringify_str(key);
      if (String(Number(key)) == key && key[0] != "-")
        return key;
      if (key == "")
        return _stringify_str(key);
      var result = "";
      for (var i = 0; i < key.length; i++) {
        if (i > 0) {
          if (!Uni.isIdentifierPart(key[i]))
            return _stringify_str(key);
        } else {
          if (!Uni.isIdentifierStart(key[i]))
            return _stringify_str(key);
        }
        var chr = key.charCodeAt(i);
        if (options.ascii) {
          if (chr < 128) {
            result += key[i];
          } else {
            result += "\\u" + ("0000" + chr.toString(16)).slice(-4);
          }
        } else {
          if (escapable.exec(key[i])) {
            result += "\\u" + ("0000" + chr.toString(16)).slice(-4);
          } else {
            result += key[i];
          }
        }
      }
      return result;
    }
    function _stringify_str(key) {
      var quote = options.quote;
      var quoteChr = quote.charCodeAt(0);
      var result = "";
      for (var i = 0; i < key.length; i++) {
        var chr = key.charCodeAt(i);
        if (chr < 16) {
          if (chr === 0 && json5) {
            result += "\\0";
          } else if (chr >= 8 && chr <= 13 && (json5 || chr !== 11)) {
            result += special_chars[chr];
          } else if (json5) {
            result += "\\x0" + chr.toString(16);
          } else {
            result += "\\u000" + chr.toString(16);
          }
        } else if (chr < 32) {
          if (json5) {
            result += "\\x" + chr.toString(16);
          } else {
            result += "\\u00" + chr.toString(16);
          }
        } else if (chr >= 32 && chr < 128) {
          if (chr === 47 && i && key[i - 1] === "<") {
            result += "\\" + key[i];
          } else if (chr === 92) {
            result += "\\\\";
          } else if (chr === quoteChr) {
            result += "\\" + quote;
          } else {
            result += key[i];
          }
        } else if (options.ascii || Uni.isLineTerminator(key[i]) || escapable.exec(key[i])) {
          if (chr < 256) {
            if (json5) {
              result += "\\x" + chr.toString(16);
            } else {
              result += "\\u00" + chr.toString(16);
            }
          } else if (chr < 4096) {
            result += "\\u0" + chr.toString(16);
          } else if (chr < 65536) {
            result += "\\u" + chr.toString(16);
          } else {
            throw Error("weird codepoint");
          }
        } else {
          result += key[i];
        }
      }
      return quote + result + quote;
    }
    function _stringify_object() {
      if (object === null)
        return "null";
      var result = [], len = 0, braces;
      if (Array.isArray(object)) {
        braces = "[]";
        for (var i = 0; i < object.length; i++) {
          var s = _stringify(object[i], options, recursiveLvl + 1, String(i));
          if (s === void 0)
            s = "null";
          len += s.length + 2;
          result.push(s + ",");
        }
      } else {
        braces = "{}";
        var fn = function(key) {
          var t = _stringify(object[key], options, recursiveLvl + 1, key);
          if (t !== void 0) {
            t = _stringify_key(key) + ":" + (options.indent ? " " : "") + t + ",";
            len += t.length + 1;
            result.push(t);
          }
        };
        if (Array.isArray(options.replacer)) {
          for (var i = 0; i < options.replacer.length; i++)
            if (hasOwnProperty.call(object, options.replacer[i]))
              fn(options.replacer[i]);
        } else {
          var keys = Object.keys(object);
          if (options.sort_keys)
            keys = keys.sort(typeof options.sort_keys === "function" ? options.sort_keys : void 0);
          keys.forEach(fn);
        }
      }
      len -= 2;
      if (options.indent && (len > options._splitMax - recursiveLvl * options.indent.length || len > options._splitMin)) {
        if (options.no_trailing_comma && result.length) {
          result[result.length - 1] = result[result.length - 1].substring(0, result[result.length - 1].length - 1);
        }
        var innerStuff = result.map(function(x) {
          return indent(x, 1);
        }).join("");
        return braces[0] + (options.indent ? "\n" : "") + innerStuff + indent(braces[1]);
      } else {
        if (result.length) {
          result[result.length - 1] = result[result.length - 1].substring(0, result[result.length - 1].length - 1);
        }
        var innerStuff = result.join(options.indent ? " " : "");
        return braces[0] + innerStuff + braces[1];
      }
    }
    function _stringify_nonobject(object2) {
      if (typeof options.replacer === "function") {
        object2 = options.replacer.call(null, currentKey, object2);
      }
      switch (typeof object2) {
        case "string":
          return _stringify_str(object2);
        case "number":
          if (object2 === 0 && 1 / object2 < 0) {
            return "-0";
          }
          if (!json5 && !Number.isFinite(object2)) {
            return "null";
          }
          return object2.toString();
        case "boolean":
          return object2.toString();
        case "undefined":
          return void 0;
        case "function":
        default:
          return JSON.stringify(object2);
      }
    }
    if (options._stringify_key) {
      return _stringify_key(object);
    }
    if (typeof object === "object") {
      if (object === null)
        return "null";
      var str2;
      if (typeof (str2 = object.toJSON5) === "function" && options.mode !== "json") {
        object = str2.call(object, currentKey);
      } else if (typeof (str2 = object.toJSON) === "function") {
        object = str2.call(object, currentKey);
      }
      if (object === null)
        return "null";
      if (typeof object !== "object")
        return _stringify_nonobject(object);
      if (object.constructor === Number || object.constructor === Boolean || object.constructor === String) {
        object = object.valueOf();
        return _stringify_nonobject(object);
      } else if (object.constructor === Date) {
        return _stringify_nonobject(object.toISOString());
      } else {
        if (typeof options.replacer === "function") {
          object = options.replacer.call(null, currentKey, object);
          if (typeof object !== "object")
            return _stringify_nonobject(object);
        }
        return _stringify_object();
      }
    } else {
      return _stringify_nonobject(object);
    }
  }
  stringify.stringify = function stringifyJSON(object, options, _space) {
    if (typeof options === "function" || Array.isArray(options)) {
      options = {
        replacer: options
      };
    } else if (typeof options === "object" && options !== null)
      ;
    else {
      options = {};
    }
    if (_space != null)
      options.indent = _space;
    if (options.indent == null)
      options.indent = "	";
    if (options.quote == null)
      options.quote = "'";
    if (options.ascii == null)
      options.ascii = false;
    if (options.mode == null)
      options.mode = "json5";
    if (options.mode === "json" || options.mode === "cjson") {
      options.quote = '"';
      options.no_trailing_comma = true;
      options.quote_keys = true;
    }
    if (typeof options.indent === "object") {
      if (options.indent.constructor === Number || options.indent.constructor === Boolean || options.indent.constructor === String)
        options.indent = options.indent.valueOf();
    }
    if (typeof options.indent === "number") {
      if (options.indent >= 0) {
        options.indent = Array(Math.min(~~options.indent, 10) + 1).join(" ");
      } else {
        options.indent = false;
      }
    } else if (typeof options.indent === "string") {
      options.indent = options.indent.substr(0, 10);
    }
    if (options._splitMin == null)
      options._splitMin = 50;
    if (options._splitMax == null)
      options._splitMax = 70;
    return _stringify(object, options, 0, "");
  };
  return stringify;
}
var document = {};
var analyze = {};
var hasRequiredAnalyze;
function requireAnalyze() {
  if (hasRequiredAnalyze)
    return analyze;
  hasRequiredAnalyze = 1;
  var tokenize = requireParse().tokenize;
  analyze.analyze = function analyzeJSON(input, options) {
    if (options == null)
      options = {};
    if (!Array.isArray(input)) {
      input = tokenize(input, options);
    }
    var result = {
      has_whitespace: false,
      has_comments: false,
      has_newlines: false,
      has_trailing_comma: false,
      indent: "",
      newline: "\n",
      quote: '"',
      quote_keys: true
    };
    var stats = {
      indent: {},
      newline: {},
      quote: {}
    };
    for (var i = 0; i < input.length; i++) {
      if (input[i].type === "newline") {
        if (input[i + 1] && input[i + 1].type === "whitespace") {
          if (input[i + 1].raw[0] === "	") {
            stats.indent["	"] = (stats.indent["	"] || 0) + 1;
          }
          if (input[i + 1].raw.match(/^\x20+$/)) {
            var ws_len = input[i + 1].raw.length;
            var indent_len = input[i + 1].stack.length + 1;
            if (ws_len % indent_len === 0) {
              var t = Array(ws_len / indent_len + 1).join(" ");
              stats.indent[t] = (stats.indent[t] || 0) + 1;
            }
          }
        }
        stats.newline[input[i].raw] = (stats.newline[input[i].raw] || 0) + 1;
      }
      if (input[i].type === "newline") {
        result.has_newlines = true;
      }
      if (input[i].type === "whitespace") {
        result.has_whitespace = true;
      }
      if (input[i].type === "comment") {
        result.has_comments = true;
      }
      if (input[i].type === "key") {
        if (input[i].raw[0] !== '"' && input[i].raw[0] !== "'")
          result.quote_keys = false;
      }
      if (input[i].type === "key" || input[i].type === "literal") {
        if (input[i].raw[0] === '"' || input[i].raw[0] === "'") {
          stats.quote[input[i].raw[0]] = (stats.quote[input[i].raw[0]] || 0) + 1;
        }
      }
      if (input[i].type === "separator" && input[i].raw === ",") {
        for (var j = i + 1; j < input.length; j++) {
          if (input[j].type === "literal" || input[j].type === "key")
            break;
          if (input[j].type === "separator")
            result.has_trailing_comma = true;
        }
      }
    }
    for (var k in stats) {
      if (Object.keys(stats[k]).length) {
        result[k] = Object.keys(stats[k]).reduce(function(a, b) {
          return stats[k][a] > stats[k][b] ? a : b;
        });
      }
    }
    return result;
  };
  return analyze;
}
var hasRequiredDocument;
function requireDocument() {
  if (hasRequiredDocument)
    return document;
  hasRequiredDocument = 1;
  var assert2 = require$$5;
  var tokenize = requireParse().tokenize;
  var stringify2 = requireStringify().stringify;
  var analyze2 = requireAnalyze().analyze;
  function isObject(x) {
    return typeof x === "object" && x !== null;
  }
  function value_to_tokenlist(value, stack, options, is_key, indent) {
    options = Object.create(options);
    options._stringify_key = !!is_key;
    if (indent) {
      options._prefix = indent.prefix.map(function(x) {
        return x.raw;
      }).join("");
    }
    if (options._splitMin == null)
      options._splitMin = 0;
    if (options._splitMax == null)
      options._splitMax = 0;
    var stringified = stringify2(value, options);
    if (is_key) {
      return [{ raw: stringified, type: "key", stack, value }];
    }
    options._addstack = stack;
    var result = tokenize(stringified, {
      _addstack: stack
    });
    result.data = null;
    return result;
  }
  function arg_to_path(path2) {
    if (typeof path2 === "number")
      path2 = String(path2);
    if (path2 === "")
      path2 = [];
    if (typeof path2 === "string")
      path2 = path2.split(".");
    if (!Array.isArray(path2))
      throw Error("Invalid path type, string or array expected");
    return path2;
  }
  function find_element_in_tokenlist(element, lvl, tokens, begin, end) {
    while (tokens[begin].stack[lvl] != element) {
      if (begin++ >= end)
        return false;
    }
    while (tokens[end].stack[lvl] != element) {
      if (end-- < begin)
        return false;
    }
    return [begin, end];
  }
  function is_whitespace(token_type) {
    return token_type === "whitespace" || token_type === "newline" || token_type === "comment";
  }
  function find_first_non_ws_token(tokens, begin, end) {
    while (is_whitespace(tokens[begin].type)) {
      if (begin++ >= end)
        return false;
    }
    return begin;
  }
  function find_last_non_ws_token(tokens, begin, end) {
    while (is_whitespace(tokens[end].type)) {
      if (end-- < begin)
        return false;
    }
    return end;
  }
  function detect_indent_style(tokens, is_array, begin, end, level) {
    var result = {
      sep1: [],
      sep2: [],
      suffix: [],
      prefix: [],
      newline: []
    };
    if (tokens[end].type === "separator" && tokens[end].stack.length !== level + 1 && tokens[end].raw !== ",") {
      return result;
    }
    if (tokens[end].type === "separator")
      end = find_last_non_ws_token(tokens, begin, end - 1);
    if (end === false)
      return result;
    while (tokens[end].stack.length > level)
      end--;
    if (!is_array) {
      while (is_whitespace(tokens[end].type)) {
        if (end < begin)
          return result;
        if (tokens[end].type === "whitespace") {
          result.sep2.unshift(tokens[end]);
        } else {
          return result;
        }
        end--;
      }
      assert2.equal(tokens[end].type, "separator");
      assert2.equal(tokens[end].raw, ":");
      while (is_whitespace(tokens[--end].type)) {
        if (end < begin)
          return result;
        if (tokens[end].type === "whitespace") {
          result.sep1.unshift(tokens[end]);
        } else {
          return result;
        }
      }
      assert2.equal(tokens[end].type, "key");
      end--;
    }
    while (is_whitespace(tokens[end].type)) {
      if (end < begin)
        return result;
      if (tokens[end].type === "whitespace") {
        result.prefix.unshift(tokens[end]);
      } else if (tokens[end].type === "newline") {
        result.newline.unshift(tokens[end]);
        return result;
      } else {
        return result;
      }
      end--;
    }
    return result;
  }
  function Document(text, options) {
    var self2 = Object.create(Document.prototype);
    if (options == null)
      options = {};
    var tokens = self2._tokens = tokenize(text, options);
    self2._data = tokens.data;
    tokens.data = null;
    self2._options = options;
    var stats = analyze2(text, options);
    if (options.indent == null) {
      options.indent = stats.indent;
    }
    if (options.quote == null) {
      options.quote = stats.quote;
    }
    if (options.quote_keys == null) {
      options.quote_keys = stats.quote_keys;
    }
    if (options.no_trailing_comma == null) {
      options.no_trailing_comma = !stats.has_trailing_comma;
    }
    return self2;
  }
  function check_if_can_be_placed(key, object, is_unset) {
    function error2(add) {
      return Error("You can't " + (is_unset ? "unset" : "set") + " key '" + key + "'" + add);
    }
    if (!isObject(object)) {
      throw error2(" of an non-object");
    }
    if (Array.isArray(object)) {
      if (String(key).match(/^\d+$/)) {
        key = Number(String(key));
        if (object.length < key || is_unset && object.length === key) {
          throw error2(", out of bounds");
        } else if (is_unset && object.length !== key + 1) {
          throw error2(" in the middle of an array");
        } else {
          return true;
        }
      } else {
        throw error2(" of an array");
      }
    } else {
      return true;
    }
  }
  Document.prototype.set = function(path2, value) {
    path2 = arg_to_path(path2);
    if (path2.length === 0) {
      if (value === void 0)
        throw Error("can't remove root document");
      this._data = value;
      var new_key = false;
    } else {
      var data = this._data;
      for (var i = 0; i < path2.length - 1; i++) {
        check_if_can_be_placed(path2[i], data, false);
        data = data[path2[i]];
      }
      if (i === path2.length - 1) {
        check_if_can_be_placed(path2[i], data, value === void 0);
      }
      var new_key = !(path2[i] in data);
      if (value === void 0) {
        if (Array.isArray(data)) {
          data.pop();
        } else {
          delete data[path2[i]];
        }
      } else {
        data[path2[i]] = value;
      }
    }
    if (!this._tokens.length)
      this._tokens = [{ raw: "", type: "literal", stack: [], value: void 0 }];
    var position = [
      find_first_non_ws_token(this._tokens, 0, this._tokens.length - 1),
      find_last_non_ws_token(this._tokens, 0, this._tokens.length - 1)
    ];
    for (var i = 0; i < path2.length - 1; i++) {
      position = find_element_in_tokenlist(path2[i], i, this._tokens, position[0], position[1]);
      if (position == false)
        throw Error("internal error, please report this");
    }
    if (path2.length === 0) {
      var newtokens = value_to_tokenlist(value, path2, this._options);
    } else if (!new_key) {
      var pos_old = position;
      position = find_element_in_tokenlist(path2[i], i, this._tokens, position[0], position[1]);
      if (value === void 0 && position !== false) {
        var newtokens = [];
        if (!Array.isArray(data)) {
          var pos2 = find_last_non_ws_token(this._tokens, pos_old[0], position[0] - 1);
          assert2.equal(this._tokens[pos2].type, "separator");
          assert2.equal(this._tokens[pos2].raw, ":");
          position[0] = pos2;
          var pos2 = find_last_non_ws_token(this._tokens, pos_old[0], position[0] - 1);
          assert2.equal(this._tokens[pos2].type, "key");
          assert2.equal(this._tokens[pos2].value, path2[path2.length - 1]);
          position[0] = pos2;
        }
        var pos2 = find_last_non_ws_token(this._tokens, pos_old[0], position[0] - 1);
        assert2.equal(this._tokens[pos2].type, "separator");
        if (this._tokens[pos2].raw === ",") {
          position[0] = pos2;
        } else {
          pos2 = find_first_non_ws_token(this._tokens, position[1] + 1, pos_old[1]);
          assert2.equal(this._tokens[pos2].type, "separator");
          if (this._tokens[pos2].raw === ",") {
            position[1] = pos2;
          }
        }
      } else {
        var indent = pos2 !== false ? detect_indent_style(this._tokens, Array.isArray(data), pos_old[0], position[1] - 1, i) : {};
        var newtokens = value_to_tokenlist(value, path2, this._options, false, indent);
      }
    } else {
      var path_1 = path2.slice(0, i);
      var pos2 = find_last_non_ws_token(this._tokens, position[0] + 1, position[1] - 1);
      assert2(pos2 !== false);
      var indent = pos2 !== false ? detect_indent_style(this._tokens, Array.isArray(data), position[0] + 1, pos2, i) : {};
      var newtokens = value_to_tokenlist(value, path2, this._options, false, indent);
      var prefix = [];
      if (indent.newline && indent.newline.length)
        prefix = prefix.concat(indent.newline);
      if (indent.prefix && indent.prefix.length)
        prefix = prefix.concat(indent.prefix);
      if (!Array.isArray(data)) {
        prefix = prefix.concat(value_to_tokenlist(path2[path2.length - 1], path_1, this._options, true));
        if (indent.sep1 && indent.sep1.length)
          prefix = prefix.concat(indent.sep1);
        prefix.push({ raw: ":", type: "separator", stack: path_1 });
        if (indent.sep2 && indent.sep2.length)
          prefix = prefix.concat(indent.sep2);
      }
      newtokens.unshift.apply(newtokens, prefix);
      if (this._tokens[pos2].type === "separator" && this._tokens[pos2].stack.length === path2.length - 1) {
        if (this._tokens[pos2].raw === ",") {
          newtokens.push({ raw: ",", type: "separator", stack: path_1 });
        }
      } else {
        newtokens.unshift({ raw: ",", type: "separator", stack: path_1 });
      }
      if (indent.suffix && indent.suffix.length)
        newtokens.push.apply(newtokens, indent.suffix);
      assert2.equal(this._tokens[position[1]].type, "separator");
      position[0] = pos2 + 1;
      position[1] = pos2;
    }
    newtokens.unshift(position[1] - position[0] + 1);
    newtokens.unshift(position[0]);
    this._tokens.splice.apply(this._tokens, newtokens);
    return this;
  };
  Document.prototype.unset = function(path2) {
    return this.set(path2, void 0);
  };
  Document.prototype.get = function(path2) {
    path2 = arg_to_path(path2);
    var data = this._data;
    for (var i = 0; i < path2.length; i++) {
      if (!isObject(data))
        return void 0;
      data = data[path2[i]];
    }
    return data;
  };
  Document.prototype.has = function(path2) {
    path2 = arg_to_path(path2);
    var data = this._data;
    for (var i = 0; i < path2.length; i++) {
      if (!isObject(data))
        return false;
      data = data[path2[i]];
    }
    return data !== void 0;
  };
  Document.prototype.update = function(value) {
    var self2 = this;
    change([], self2._data, value);
    return self2;
    function change(path2, old_data, new_data) {
      if (!isObject(new_data) || !isObject(old_data)) {
        if (new_data !== old_data)
          self2.set(path2, new_data);
      } else if (Array.isArray(new_data) != Array.isArray(old_data)) {
        self2.set(path2, new_data);
      } else if (Array.isArray(new_data)) {
        if (new_data.length > old_data.length) {
          for (var i = 0; i < new_data.length; i++) {
            path2.push(String(i));
            change(path2, old_data[i], new_data[i]);
            path2.pop();
          }
        } else {
          for (var i = old_data.length - 1; i >= 0; i--) {
            path2.push(String(i));
            change(path2, old_data[i], new_data[i]);
            path2.pop();
          }
        }
      } else {
        for (var i in new_data) {
          path2.push(String(i));
          change(path2, old_data[i], new_data[i]);
          path2.pop();
        }
        for (var i in old_data) {
          if (i in new_data)
            continue;
          path2.push(String(i));
          change(path2, old_data[i], new_data[i]);
          path2.pop();
        }
      }
    }
  };
  Document.prototype.toString = function() {
    return this._tokens.map(function(x) {
      return x.raw;
    }).join("");
  };
  document.Document = Document;
  document.update = function updateJSON(source, new_value, options) {
    return Document(source, options).update(new_value).toString();
  };
  return document;
}
var utils = {};
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils)
    return utils;
  hasRequiredUtils = 1;
  var FS = require$$0$1;
  var jju2 = requireJju();
  utils.register = function() {
    var r = commonjsRequire, e = "extensions";
    r[e][".json5"] = function(m, f) {
      m.exports = jju2.parse(FS.readFileSync(f, "utf8"));
    };
  };
  utils.patch_JSON_parse = function() {
    var _parse = JSON.parse;
    JSON.parse = function(text, rev) {
      try {
        return _parse(text, rev);
      } catch (err) {
        requireJju().parse(text, {
          mode: "json",
          legacy: true,
          reviver: rev,
          reserved_keys: "replace",
          null_prototype: false
        });
        throw err;
      }
    };
  };
  utils.middleware = function() {
    return function(req, res, next) {
      throw Error("this function is removed, use express-json5 instead");
    };
  };
  return utils;
}
var hasRequiredJju;
function requireJju() {
  if (hasRequiredJju)
    return jju.exports;
  hasRequiredJju = 1;
  (function(module2) {
    module2.exports.__defineGetter__("parse", function() {
      return requireParse().parse;
    });
    module2.exports.__defineGetter__("stringify", function() {
      return requireStringify().stringify;
    });
    module2.exports.__defineGetter__("tokenize", function() {
      return requireParse().tokenize;
    });
    module2.exports.__defineGetter__("update", function() {
      return requireDocument().update;
    });
    module2.exports.__defineGetter__("analyze", function() {
      return requireAnalyze().analyze;
    });
    module2.exports.__defineGetter__("utils", function() {
      return requireUtils();
    });
  })(jju);
  return jju.exports;
}
var hasRequiredManypkgTools_cjs_prod;
function requireManypkgTools_cjs_prod() {
  if (hasRequiredManypkgTools_cjs_prod)
    return manypkgTools_cjs_prod;
  hasRequiredManypkgTools_cjs_prod = 1;
  Object.defineProperty(manypkgTools_cjs_prod, "__esModule", { value: true });
  var path2 = require$$0$3;
  var fs2 = libExports;
  var globby2 = requireGlobby();
  var readYamlFile2 = requireReadYamlFile();
  var jju2 = requireJju();
  function _interopDefault(e) {
    return e && e.__esModule ? e : { "default": e };
  }
  var path__default = /* @__PURE__ */ _interopDefault(path2);
  var fs__default = /* @__PURE__ */ _interopDefault(fs2);
  var globby__default = /* @__PURE__ */ _interopDefault(globby2);
  var readYamlFile__default = /* @__PURE__ */ _interopDefault(readYamlFile2);
  var jju__default = /* @__PURE__ */ _interopDefault(jju2);
  class InvalidMonorepoError extends Error {
  }
  async function expandPackageGlobs(packageGlobs, directory) {
    const relativeDirectories = await globby__default["default"](packageGlobs, {
      cwd: directory,
      onlyDirectories: true,
      expandDirectories: false,
      ignore: ["**/node_modules"]
    });
    const directories = relativeDirectories.map((p) => path__default["default"].resolve(directory, p)).sort();
    const discoveredPackages = await Promise.all(directories.map((dir) => fs__default["default"].readJson(path__default["default"].join(dir, "package.json")).catch((err) => {
      if (err && err.code === "ENOENT") {
        return void 0;
      }
      throw err;
    }).then((result) => {
      if (result) {
        return {
          dir: path__default["default"].resolve(dir),
          relativeDir: path__default["default"].relative(directory, dir),
          packageJson: result
        };
      }
    })));
    return discoveredPackages.filter((pkg) => pkg);
  }
  function expandPackageGlobsSync(packageGlobs, directory) {
    const relativeDirectories = globby__default["default"].sync(packageGlobs, {
      cwd: directory,
      onlyDirectories: true,
      expandDirectories: false,
      ignore: ["**/node_modules"]
    });
    const directories = relativeDirectories.map((p) => path__default["default"].resolve(directory, p)).sort();
    const discoveredPackages = directories.map((dir) => {
      try {
        const packageJson = fs__default["default"].readJsonSync(path__default["default"].join(dir, "package.json"));
        return {
          dir: path__default["default"].resolve(dir),
          relativeDir: path__default["default"].relative(directory, dir),
          packageJson
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return void 0;
        }
        throw err;
      }
    });
    return discoveredPackages.filter((pkg) => pkg);
  }
  const BoltTool = {
    type: "bolt",
    async isMonorepoRoot(directory) {
      try {
        const pkgJson = await fs__default["default"].readJson(path__default["default"].join(directory, "package.json"));
        if (pkgJson.bolt && pkgJson.bolt.workspaces) {
          return true;
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    isMonorepoRootSync(directory) {
      try {
        const pkgJson = fs__default["default"].readJsonSync(path__default["default"].join(directory, "package.json"));
        if (pkgJson.bolt && pkgJson.bolt.workspaces) {
          return true;
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    async getPackages(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const pkgJson = await fs__default["default"].readJson(path__default["default"].join(rootDir, "package.json"));
        if (!pkgJson.bolt || !pkgJson.bolt.workspaces) {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${BoltTool.type} monorepo root: missing bolt.workspaces entry`);
        }
        const packageGlobs = pkgJson.bolt.workspaces;
        return {
          tool: BoltTool,
          packages: await expandPackageGlobs(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${BoltTool.type} monorepo root: missing package.json`);
        }
        throw err;
      }
    },
    getPackagesSync(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const pkgJson = fs__default["default"].readJsonSync(path__default["default"].join(rootDir, "package.json"));
        if (!pkgJson.bolt || !pkgJson.bolt.workspaces) {
          throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${BoltTool.type} monorepo root: missing bolt.workspaces entry`);
        }
        const packageGlobs = pkgJson.bolt.workspaces;
        return {
          tool: BoltTool,
          packages: expandPackageGlobsSync(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${BoltTool.type} monorepo root: missing package.json`);
        }
        throw err;
      }
    }
  };
  const LernaTool = {
    type: "lerna",
    async isMonorepoRoot(directory) {
      try {
        const lernaJson = await fs__default["default"].readJson(path__default["default"].join(directory, "lerna.json"));
        if (lernaJson.useWorkspaces !== true) {
          return true;
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    isMonorepoRootSync(directory) {
      try {
        const lernaJson = fs__default["default"].readJsonSync(path__default["default"].join(directory, "lerna.json"));
        if (lernaJson.useWorkspaces !== true) {
          return true;
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    async getPackages(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const lernaJson = await fs__default["default"].readJson(path__default["default"].join(rootDir, "lerna.json"));
        const pkgJson = await fs__default["default"].readJson(path__default["default"].join(rootDir, "package.json"));
        const packageGlobs = lernaJson.packages || ["packages/*"];
        return {
          tool: LernaTool,
          packages: await expandPackageGlobs(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${LernaTool.type} monorepo root: missing lerna.json and/or package.json`);
        }
        throw err;
      }
    },
    getPackagesSync(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const lernaJson = fs__default["default"].readJsonSync(path__default["default"].join(rootDir, "lerna.json"));
        const pkgJson = fs__default["default"].readJsonSync(path__default["default"].join(rootDir, "package.json"));
        const packageGlobs = lernaJson.packages || ["packages/*"];
        return {
          tool: LernaTool,
          packages: expandPackageGlobsSync(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${LernaTool.type} monorepo root: missing lerna.json and/or package.json`);
        }
        throw err;
      }
    }
  };
  const PnpmTool = {
    type: "pnpm",
    async isMonorepoRoot(directory) {
      try {
        const manifest = await readYamlFile__default["default"](path__default["default"].join(directory, "pnpm-workspace.yaml"));
        if (manifest.packages) {
          return true;
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    isMonorepoRootSync(directory) {
      try {
        const manifest = readYamlFile2.sync(path__default["default"].join(directory, "pnpm-workspace.yaml"));
        if (manifest.packages) {
          return true;
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    async getPackages(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const manifest = await readYamlFile__default["default"](path__default["default"].join(rootDir, "pnpm-workspace.yaml"));
        const pkgJson = await fs__default["default"].readJson(path__default["default"].join(rootDir, "package.json"));
        const packageGlobs = manifest.packages;
        return {
          tool: PnpmTool,
          packages: await expandPackageGlobs(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${PnpmTool.type} monorepo root: missing pnpm-workspace.yaml and/or package.json`);
        }
        throw err;
      }
    },
    getPackagesSync(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const manifest = readYamlFile2.sync(path__default["default"].join(rootDir, "pnpm-workspace.yaml"));
        const pkgJson = fs__default["default"].readJsonSync(path__default["default"].join(rootDir, "package.json"));
        const packageGlobs = manifest.packages;
        return {
          tool: PnpmTool,
          packages: expandPackageGlobsSync(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${PnpmTool.type} monorepo root: missing pnpm-workspace.yaml and/or package.json`);
        }
        throw err;
      }
    }
  };
  const RootTool = {
    type: "root",
    async isMonorepoRoot(directory) {
      return false;
    },
    isMonorepoRootSync(directory) {
      return false;
    },
    async getPackages(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const pkgJson = await fs__default["default"].readJson(path__default["default"].join(rootDir, "package.json"));
        const pkg = {
          dir: rootDir,
          relativeDir: ".",
          packageJson: pkgJson
        };
        return {
          tool: RootTool,
          packages: [pkg],
          rootPackage: pkg,
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${RootTool.type} monorepo root`);
        }
        throw err;
      }
    },
    getPackagesSync(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const pkgJson = fs__default["default"].readJsonSync(path__default["default"].join(rootDir, "package.json"));
        const pkg = {
          dir: rootDir,
          relativeDir: ".",
          packageJson: pkgJson
        };
        return {
          tool: RootTool,
          packages: [pkg],
          rootPackage: pkg,
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${RootTool.type} monorepo root`);
        }
        throw err;
      }
    }
  };
  const RushTool = {
    type: "rush",
    async isMonorepoRoot(directory) {
      try {
        await fs__default["default"].readFile(path__default["default"].join(directory, "rush.json"), "utf8");
        return true;
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    isMonorepoRootSync(directory) {
      try {
        fs__default["default"].readFileSync(path__default["default"].join(directory, "rush.json"), "utf8");
        return true;
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    async getPackages(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const rushText = await fs__default["default"].readFile(path__default["default"].join(rootDir, "rush.json"), "utf8");
        const rushJson = jju__default["default"].parse(rushText);
        const directories = rushJson.projects.map((project) => path__default["default"].resolve(rootDir, project.projectFolder));
        const packages = await Promise.all(directories.map(async (dir) => {
          return {
            dir,
            relativeDir: path__default["default"].relative(directory, dir),
            packageJson: await fs__default["default"].readJson(path__default["default"].join(dir, "package.json"))
          };
        }));
        return {
          tool: RushTool,
          packages,
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${RushTool.type} monorepo root: missing rush.json`);
        }
        throw err;
      }
    },
    getPackagesSync(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const rushText = fs__default["default"].readFileSync(path__default["default"].join(rootDir, "rush.json"), "utf8");
        const rushJson = jju__default["default"].parse(rushText);
        const directories = rushJson.projects.map((project) => path__default["default"].resolve(rootDir, project.projectFolder));
        const packages = directories.map((dir) => {
          const packageJson = fs__default["default"].readJsonSync(path__default["default"].join(dir, "package.json"));
          return {
            dir,
            relativeDir: path__default["default"].relative(directory, dir),
            packageJson
          };
        });
        return {
          tool: RushTool,
          packages,
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${RushTool.type} monorepo root: missing rush.json`);
        }
        throw err;
      }
    }
  };
  const YarnTool = {
    type: "yarn",
    async isMonorepoRoot(directory) {
      try {
        const pkgJson = await fs__default["default"].readJson(path__default["default"].join(directory, "package.json"));
        if (pkgJson.workspaces) {
          if (Array.isArray(pkgJson.workspaces) || Array.isArray(pkgJson.workspaces.packages)) {
            return true;
          }
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    isMonorepoRootSync(directory) {
      try {
        const pkgJson = fs__default["default"].readJsonSync(path__default["default"].join(directory, "package.json"));
        if (pkgJson.workspaces) {
          if (Array.isArray(pkgJson.workspaces) || Array.isArray(pkgJson.workspaces.packages)) {
            return true;
          }
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    async getPackages(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const pkgJson = await fs__default["default"].readJson(path__default["default"].join(rootDir, "package.json"));
        const packageGlobs = Array.isArray(pkgJson.workspaces) ? pkgJson.workspaces : pkgJson.workspaces.packages;
        return {
          tool: YarnTool,
          packages: await expandPackageGlobs(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${YarnTool.type} monorepo root`);
        }
        throw err;
      }
    },
    getPackagesSync(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const pkgJson = fs__default["default"].readJsonSync(path__default["default"].join(rootDir, "package.json"));
        const packageGlobs = Array.isArray(pkgJson.workspaces) ? pkgJson.workspaces : pkgJson.workspaces.packages;
        return {
          tool: YarnTool,
          packages: expandPackageGlobsSync(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${YarnTool.type} monorepo root`);
        }
        throw err;
      }
    }
  };
  manypkgTools_cjs_prod.BoltTool = BoltTool;
  manypkgTools_cjs_prod.InvalidMonorepoError = InvalidMonorepoError;
  manypkgTools_cjs_prod.LernaTool = LernaTool;
  manypkgTools_cjs_prod.PnpmTool = PnpmTool;
  manypkgTools_cjs_prod.RootTool = RootTool;
  manypkgTools_cjs_prod.RushTool = RushTool;
  manypkgTools_cjs_prod.YarnTool = YarnTool;
  return manypkgTools_cjs_prod;
}
var manypkgTools_cjs_dev = {};
var hasRequiredManypkgTools_cjs_dev;
function requireManypkgTools_cjs_dev() {
  if (hasRequiredManypkgTools_cjs_dev)
    return manypkgTools_cjs_dev;
  hasRequiredManypkgTools_cjs_dev = 1;
  Object.defineProperty(manypkgTools_cjs_dev, "__esModule", { value: true });
  var path2 = require$$0$3;
  var fs2 = libExports;
  var globby2 = requireGlobby();
  var readYamlFile2 = requireReadYamlFile();
  var jju2 = requireJju();
  function _interopDefault(e) {
    return e && e.__esModule ? e : { "default": e };
  }
  var path__default = /* @__PURE__ */ _interopDefault(path2);
  var fs__default = /* @__PURE__ */ _interopDefault(fs2);
  var globby__default = /* @__PURE__ */ _interopDefault(globby2);
  var readYamlFile__default = /* @__PURE__ */ _interopDefault(readYamlFile2);
  var jju__default = /* @__PURE__ */ _interopDefault(jju2);
  class InvalidMonorepoError extends Error {
  }
  async function expandPackageGlobs(packageGlobs, directory) {
    const relativeDirectories = await globby__default["default"](packageGlobs, {
      cwd: directory,
      onlyDirectories: true,
      expandDirectories: false,
      ignore: ["**/node_modules"]
    });
    const directories = relativeDirectories.map((p) => path__default["default"].resolve(directory, p)).sort();
    const discoveredPackages = await Promise.all(directories.map((dir) => fs__default["default"].readJson(path__default["default"].join(dir, "package.json")).catch((err) => {
      if (err && err.code === "ENOENT") {
        return void 0;
      }
      throw err;
    }).then((result) => {
      if (result) {
        return {
          dir: path__default["default"].resolve(dir),
          relativeDir: path__default["default"].relative(directory, dir),
          packageJson: result
        };
      }
    })));
    return discoveredPackages.filter((pkg) => pkg);
  }
  function expandPackageGlobsSync(packageGlobs, directory) {
    const relativeDirectories = globby__default["default"].sync(packageGlobs, {
      cwd: directory,
      onlyDirectories: true,
      expandDirectories: false,
      ignore: ["**/node_modules"]
    });
    const directories = relativeDirectories.map((p) => path__default["default"].resolve(directory, p)).sort();
    const discoveredPackages = directories.map((dir) => {
      try {
        const packageJson = fs__default["default"].readJsonSync(path__default["default"].join(dir, "package.json"));
        return {
          dir: path__default["default"].resolve(dir),
          relativeDir: path__default["default"].relative(directory, dir),
          packageJson
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return void 0;
        }
        throw err;
      }
    });
    return discoveredPackages.filter((pkg) => pkg);
  }
  const BoltTool = {
    type: "bolt",
    async isMonorepoRoot(directory) {
      try {
        const pkgJson = await fs__default["default"].readJson(path__default["default"].join(directory, "package.json"));
        if (pkgJson.bolt && pkgJson.bolt.workspaces) {
          return true;
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    isMonorepoRootSync(directory) {
      try {
        const pkgJson = fs__default["default"].readJsonSync(path__default["default"].join(directory, "package.json"));
        if (pkgJson.bolt && pkgJson.bolt.workspaces) {
          return true;
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    async getPackages(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const pkgJson = await fs__default["default"].readJson(path__default["default"].join(rootDir, "package.json"));
        if (!pkgJson.bolt || !pkgJson.bolt.workspaces) {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${BoltTool.type} monorepo root: missing bolt.workspaces entry`);
        }
        const packageGlobs = pkgJson.bolt.workspaces;
        return {
          tool: BoltTool,
          packages: await expandPackageGlobs(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${BoltTool.type} monorepo root: missing package.json`);
        }
        throw err;
      }
    },
    getPackagesSync(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const pkgJson = fs__default["default"].readJsonSync(path__default["default"].join(rootDir, "package.json"));
        if (!pkgJson.bolt || !pkgJson.bolt.workspaces) {
          throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${BoltTool.type} monorepo root: missing bolt.workspaces entry`);
        }
        const packageGlobs = pkgJson.bolt.workspaces;
        return {
          tool: BoltTool,
          packages: expandPackageGlobsSync(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${BoltTool.type} monorepo root: missing package.json`);
        }
        throw err;
      }
    }
  };
  const LernaTool = {
    type: "lerna",
    async isMonorepoRoot(directory) {
      try {
        const lernaJson = await fs__default["default"].readJson(path__default["default"].join(directory, "lerna.json"));
        if (lernaJson.useWorkspaces !== true) {
          return true;
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    isMonorepoRootSync(directory) {
      try {
        const lernaJson = fs__default["default"].readJsonSync(path__default["default"].join(directory, "lerna.json"));
        if (lernaJson.useWorkspaces !== true) {
          return true;
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    async getPackages(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const lernaJson = await fs__default["default"].readJson(path__default["default"].join(rootDir, "lerna.json"));
        const pkgJson = await fs__default["default"].readJson(path__default["default"].join(rootDir, "package.json"));
        const packageGlobs = lernaJson.packages || ["packages/*"];
        return {
          tool: LernaTool,
          packages: await expandPackageGlobs(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${LernaTool.type} monorepo root: missing lerna.json and/or package.json`);
        }
        throw err;
      }
    },
    getPackagesSync(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const lernaJson = fs__default["default"].readJsonSync(path__default["default"].join(rootDir, "lerna.json"));
        const pkgJson = fs__default["default"].readJsonSync(path__default["default"].join(rootDir, "package.json"));
        const packageGlobs = lernaJson.packages || ["packages/*"];
        return {
          tool: LernaTool,
          packages: expandPackageGlobsSync(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${LernaTool.type} monorepo root: missing lerna.json and/or package.json`);
        }
        throw err;
      }
    }
  };
  const PnpmTool = {
    type: "pnpm",
    async isMonorepoRoot(directory) {
      try {
        const manifest = await readYamlFile__default["default"](path__default["default"].join(directory, "pnpm-workspace.yaml"));
        if (manifest.packages) {
          return true;
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    isMonorepoRootSync(directory) {
      try {
        const manifest = readYamlFile2.sync(path__default["default"].join(directory, "pnpm-workspace.yaml"));
        if (manifest.packages) {
          return true;
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    async getPackages(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const manifest = await readYamlFile__default["default"](path__default["default"].join(rootDir, "pnpm-workspace.yaml"));
        const pkgJson = await fs__default["default"].readJson(path__default["default"].join(rootDir, "package.json"));
        const packageGlobs = manifest.packages;
        return {
          tool: PnpmTool,
          packages: await expandPackageGlobs(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${PnpmTool.type} monorepo root: missing pnpm-workspace.yaml and/or package.json`);
        }
        throw err;
      }
    },
    getPackagesSync(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const manifest = readYamlFile2.sync(path__default["default"].join(rootDir, "pnpm-workspace.yaml"));
        const pkgJson = fs__default["default"].readJsonSync(path__default["default"].join(rootDir, "package.json"));
        const packageGlobs = manifest.packages;
        return {
          tool: PnpmTool,
          packages: expandPackageGlobsSync(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${PnpmTool.type} monorepo root: missing pnpm-workspace.yaml and/or package.json`);
        }
        throw err;
      }
    }
  };
  const RootTool = {
    type: "root",
    async isMonorepoRoot(directory) {
      return false;
    },
    isMonorepoRootSync(directory) {
      return false;
    },
    async getPackages(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const pkgJson = await fs__default["default"].readJson(path__default["default"].join(rootDir, "package.json"));
        const pkg = {
          dir: rootDir,
          relativeDir: ".",
          packageJson: pkgJson
        };
        return {
          tool: RootTool,
          packages: [pkg],
          rootPackage: pkg,
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${RootTool.type} monorepo root`);
        }
        throw err;
      }
    },
    getPackagesSync(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const pkgJson = fs__default["default"].readJsonSync(path__default["default"].join(rootDir, "package.json"));
        const pkg = {
          dir: rootDir,
          relativeDir: ".",
          packageJson: pkgJson
        };
        return {
          tool: RootTool,
          packages: [pkg],
          rootPackage: pkg,
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${RootTool.type} monorepo root`);
        }
        throw err;
      }
    }
  };
  const RushTool = {
    type: "rush",
    async isMonorepoRoot(directory) {
      try {
        await fs__default["default"].readFile(path__default["default"].join(directory, "rush.json"), "utf8");
        return true;
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    isMonorepoRootSync(directory) {
      try {
        fs__default["default"].readFileSync(path__default["default"].join(directory, "rush.json"), "utf8");
        return true;
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    async getPackages(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const rushText = await fs__default["default"].readFile(path__default["default"].join(rootDir, "rush.json"), "utf8");
        const rushJson = jju__default["default"].parse(rushText);
        const directories = rushJson.projects.map((project) => path__default["default"].resolve(rootDir, project.projectFolder));
        const packages = await Promise.all(directories.map(async (dir) => {
          return {
            dir,
            relativeDir: path__default["default"].relative(directory, dir),
            packageJson: await fs__default["default"].readJson(path__default["default"].join(dir, "package.json"))
          };
        }));
        return {
          tool: RushTool,
          packages,
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${RushTool.type} monorepo root: missing rush.json`);
        }
        throw err;
      }
    },
    getPackagesSync(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const rushText = fs__default["default"].readFileSync(path__default["default"].join(rootDir, "rush.json"), "utf8");
        const rushJson = jju__default["default"].parse(rushText);
        const directories = rushJson.projects.map((project) => path__default["default"].resolve(rootDir, project.projectFolder));
        const packages = directories.map((dir) => {
          const packageJson = fs__default["default"].readJsonSync(path__default["default"].join(dir, "package.json"));
          return {
            dir,
            relativeDir: path__default["default"].relative(directory, dir),
            packageJson
          };
        });
        return {
          tool: RushTool,
          packages,
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${RushTool.type} monorepo root: missing rush.json`);
        }
        throw err;
      }
    }
  };
  const YarnTool = {
    type: "yarn",
    async isMonorepoRoot(directory) {
      try {
        const pkgJson = await fs__default["default"].readJson(path__default["default"].join(directory, "package.json"));
        if (pkgJson.workspaces) {
          if (Array.isArray(pkgJson.workspaces) || Array.isArray(pkgJson.workspaces.packages)) {
            return true;
          }
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    isMonorepoRootSync(directory) {
      try {
        const pkgJson = fs__default["default"].readJsonSync(path__default["default"].join(directory, "package.json"));
        if (pkgJson.workspaces) {
          if (Array.isArray(pkgJson.workspaces) || Array.isArray(pkgJson.workspaces.packages)) {
            return true;
          }
        }
      } catch (err) {
        if (err && err.code === "ENOENT") {
          return false;
        }
        throw err;
      }
      return false;
    },
    async getPackages(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const pkgJson = await fs__default["default"].readJson(path__default["default"].join(rootDir, "package.json"));
        const packageGlobs = Array.isArray(pkgJson.workspaces) ? pkgJson.workspaces : pkgJson.workspaces.packages;
        return {
          tool: YarnTool,
          packages: await expandPackageGlobs(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${YarnTool.type} monorepo root`);
        }
        throw err;
      }
    },
    getPackagesSync(directory) {
      const rootDir = path__default["default"].resolve(directory);
      try {
        const pkgJson = fs__default["default"].readJsonSync(path__default["default"].join(rootDir, "package.json"));
        const packageGlobs = Array.isArray(pkgJson.workspaces) ? pkgJson.workspaces : pkgJson.workspaces.packages;
        return {
          tool: YarnTool,
          packages: expandPackageGlobsSync(packageGlobs, rootDir),
          rootPackage: {
            dir: rootDir,
            relativeDir: ".",
            packageJson: pkgJson
          },
          rootDir
        };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          throw new InvalidMonorepoError(`Directory ${rootDir} is not a valid ${YarnTool.type} monorepo root`);
        }
        throw err;
      }
    }
  };
  manypkgTools_cjs_dev.BoltTool = BoltTool;
  manypkgTools_cjs_dev.InvalidMonorepoError = InvalidMonorepoError;
  manypkgTools_cjs_dev.LernaTool = LernaTool;
  manypkgTools_cjs_dev.PnpmTool = PnpmTool;
  manypkgTools_cjs_dev.RootTool = RootTool;
  manypkgTools_cjs_dev.RushTool = RushTool;
  manypkgTools_cjs_dev.YarnTool = YarnTool;
  return manypkgTools_cjs_dev;
}
if (process.env.NODE_ENV === "production") {
  manypkgTools_cjs.exports = requireManypkgTools_cjs_prod();
} else {
  manypkgTools_cjs.exports = requireManypkgTools_cjs_dev();
}
var manypkgTools_cjsExports = manypkgTools_cjs.exports;
const DEFAULT_TOOLS = [manypkgTools_cjsExports.YarnTool, manypkgTools_cjsExports.PnpmTool, manypkgTools_cjsExports.LernaTool, manypkgTools_cjsExports.RushTool, manypkgTools_cjsExports.BoltTool, manypkgTools_cjsExports.RootTool];
const isNoEntryError = (err) => !!err && typeof err === "object" && "code" in err && err.code === "ENOENT";
class NoPkgJsonFound extends Error {
  constructor(directory) {
    super(`No package.json could be found upwards from directory ${directory}`);
    this.directory = directory;
  }
}
class NoMatchingMonorepoFound extends Error {
  constructor(directory) {
    super(`No monorepo matching the list of supported monorepos could be found upwards from directory ${directory}`);
    this.directory = directory;
  }
}
async function findRoot(cwd2, options = {}) {
  let monorepoRoot;
  const tools = options.tools || DEFAULT_TOOLS;
  await findUp(async (directory) => {
    return Promise.all(tools.map(async (tool) => {
      if (await tool.isMonorepoRoot(directory)) {
        return {
          tool,
          rootDir: directory
        };
      }
    })).then((x) => x.find((value) => value)).then((result) => {
      if (result) {
        monorepoRoot = result;
        return directory;
      }
    });
  }, {
    cwd: cwd2,
    type: "directory"
  });
  if (monorepoRoot) {
    return monorepoRoot;
  }
  if (!tools.includes(manypkgTools_cjsExports.RootTool)) {
    throw new NoMatchingMonorepoFound(cwd2);
  }
  let rootDir = await findUp(async (directory) => {
    try {
      await fs$4.access(require$$0$3.join(directory, "package.json"));
      return directory;
    } catch (err) {
      if (!isNoEntryError(err)) {
        throw err;
      }
    }
  }, {
    cwd: cwd2,
    type: "directory"
  });
  if (!rootDir) {
    throw new NoPkgJsonFound(cwd2);
  }
  return {
    tool: manypkgTools_cjsExports.RootTool,
    rootDir
  };
}
function findRootSync(cwd2, options = {}) {
  let monorepoRoot;
  const tools = options.tools || DEFAULT_TOOLS;
  findUpExports.sync((directory) => {
    for (const tool of tools) {
      if (tool.isMonorepoRootSync(directory)) {
        monorepoRoot = {
          tool,
          rootDir: directory
        };
        return directory;
      }
    }
  }, {
    cwd: cwd2,
    type: "directory"
  });
  if (monorepoRoot) {
    return monorepoRoot;
  }
  if (!tools.includes(manypkgTools_cjsExports.RootTool)) {
    throw new NoMatchingMonorepoFound(cwd2);
  }
  const rootDir = findUpExports.sync((directory) => {
    const exists = fs$4.existsSync(require$$0$3.join(directory, "package.json"));
    return exists ? directory : void 0;
  }, {
    cwd: cwd2,
    type: "directory"
  });
  if (!rootDir) {
    throw new NoPkgJsonFound(cwd2);
  }
  return {
    tool: manypkgTools_cjsExports.RootTool,
    rootDir
  };
}
const manypkgFindRoot_esm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NoMatchingMonorepoFound,
  NoPkgJsonFound,
  findRoot,
  findRootSync
}, Symbol.toStringTag, { value: "Module" }));
const require$$1 = /* @__PURE__ */ getAugmentedNamespace(manypkgFindRoot_esm);
var hasRequiredManypkgGetPackages_cjs_prod;
function requireManypkgGetPackages_cjs_prod() {
  if (hasRequiredManypkgGetPackages_cjs_prod)
    return manypkgGetPackages_cjs_prod;
  hasRequiredManypkgGetPackages_cjs_prod = 1;
  Object.defineProperty(manypkgGetPackages_cjs_prod, "__esModule", { value: true });
  var path2 = require$$0$3;
  var findRoot2 = require$$1;
  function _interopDefault(e) {
    return e && e.__esModule ? e : { "default": e };
  }
  var path__default = /* @__PURE__ */ _interopDefault(path2);
  class PackageJsonMissingNameError extends Error {
    constructor(directories) {
      super(`The following package.jsons are missing the "name" field:
${directories.join("\n")}`);
      this.directories = directories;
    }
  }
  async function getPackages(dir, options) {
    const monorepoRoot = await findRoot2.findRoot(dir, options);
    const packages = await monorepoRoot.tool.getPackages(dir);
    validatePackages(packages);
    return packages;
  }
  function getPackagesSync(dir, options) {
    const monorepoRoot = findRoot2.findRootSync(dir, options);
    const packages = monorepoRoot.tool.getPackagesSync(dir);
    validatePackages(packages);
    return packages;
  }
  function validatePackages(packages) {
    const pkgJsonsMissingNameField = [];
    for (const pkg of packages.packages) {
      if (!pkg.packageJson.name) {
        pkgJsonsMissingNameField.push(path__default["default"].join(pkg.relativeDir, "package.json"));
      }
    }
    if (pkgJsonsMissingNameField.length > 0) {
      pkgJsonsMissingNameField.sort();
      throw new PackageJsonMissingNameError(pkgJsonsMissingNameField);
    }
  }
  manypkgGetPackages_cjs_prod.PackageJsonMissingNameError = PackageJsonMissingNameError;
  manypkgGetPackages_cjs_prod.getPackages = getPackages;
  manypkgGetPackages_cjs_prod.getPackagesSync = getPackagesSync;
  return manypkgGetPackages_cjs_prod;
}
var manypkgGetPackages_cjs_dev = {};
var hasRequiredManypkgGetPackages_cjs_dev;
function requireManypkgGetPackages_cjs_dev() {
  if (hasRequiredManypkgGetPackages_cjs_dev)
    return manypkgGetPackages_cjs_dev;
  hasRequiredManypkgGetPackages_cjs_dev = 1;
  Object.defineProperty(manypkgGetPackages_cjs_dev, "__esModule", { value: true });
  var path2 = require$$0$3;
  var findRoot2 = require$$1;
  function _interopDefault(e) {
    return e && e.__esModule ? e : { "default": e };
  }
  var path__default = /* @__PURE__ */ _interopDefault(path2);
  class PackageJsonMissingNameError extends Error {
    constructor(directories) {
      super(`The following package.jsons are missing the "name" field:
${directories.join("\n")}`);
      this.directories = directories;
    }
  }
  async function getPackages(dir, options) {
    const monorepoRoot = await findRoot2.findRoot(dir, options);
    const packages = await monorepoRoot.tool.getPackages(dir);
    validatePackages(packages);
    return packages;
  }
  function getPackagesSync(dir, options) {
    const monorepoRoot = findRoot2.findRootSync(dir, options);
    const packages = monorepoRoot.tool.getPackagesSync(dir);
    validatePackages(packages);
    return packages;
  }
  function validatePackages(packages) {
    const pkgJsonsMissingNameField = [];
    for (const pkg of packages.packages) {
      if (!pkg.packageJson.name) {
        pkgJsonsMissingNameField.push(path__default["default"].join(pkg.relativeDir, "package.json"));
      }
    }
    if (pkgJsonsMissingNameField.length > 0) {
      pkgJsonsMissingNameField.sort();
      throw new PackageJsonMissingNameError(pkgJsonsMissingNameField);
    }
  }
  manypkgGetPackages_cjs_dev.PackageJsonMissingNameError = PackageJsonMissingNameError;
  manypkgGetPackages_cjs_dev.getPackages = getPackages;
  manypkgGetPackages_cjs_dev.getPackagesSync = getPackagesSync;
  return manypkgGetPackages_cjs_dev;
}
if (process.env.NODE_ENV === "production") {
  manypkgGetPackages_cjs.exports = requireManypkgGetPackages_cjs_prod();
} else {
  manypkgGetPackages_cjs.exports = requireManypkgGetPackages_cjs_dev();
}
var manypkgGetPackages_cjsExports = manypkgGetPackages_cjs.exports;
const runtime_prerequisites_in = [
  "runtime-prerequisites.in",
  `pip-with-requires-python`
];
const runtime_prerequisites_txt = [
  "runtime-prerequisites.txt",
  `pip-with-requires-python==1.0.1

# The following packages are considered to be unsafe in a requirements file:
pip==22.3.1`
];
const runtime_in = [
  "runtime.in",
  `twine
id ~= 1.0
requests
pkginfo != 1.9.0`
];
const runtime_txt = [
  "runtime.txt",
  `#
# This file is autogenerated by pip-compile with Python 3.11
# by the following command:
#
#    pip-compile --allow-unsafe --output-file=requirements/runtime.txt --resolver=backtracking --strip-extras requirements/runtime.in
#
bleach==5.0.1
    # via readme-renderer
certifi==2022.12.7
    # via requests
cffi==1.15.1
    # via cryptography
charset-normalizer==2.1.1
    # via requests
commonmark==0.9.1
    # via rich
cryptography==41.0.0
    # via secretstorage
docutils==0.19
    # via readme-renderer
id==1.0.0
    # via -r runtime.in
idna==3.4
    # via requests
importlib-metadata==5.1.0
    # via
    #   keyring
    #   twine
jaraco-classes==3.2.3
    # via keyring
jeepney==0.8.0
    # via
    #   keyring
    #   secretstorage
keyring==23.11.0
    # via twine
more-itertools==9.0.0
    # via jaraco-classes
pkginfo==1.9.2
    # via
    #   -r runtime.in
    #   twine
pycparser==2.21
    # via cffi
pydantic==1.10.6
    # via id
pygments==2.13.0
    # via
    #   readme-renderer
    #   rich
readme-renderer==37.3
    # via twine
requests==2.31.0
    # via
    #   -r runtime.in
    #   id
    #   requests-toolbelt
    #   twine
requests-toolbelt==0.10.1
    # via twine
rfc3986==2.0.0
    # via twine
rich==12.6.0
    # via twine
secretstorage==3.3.3
    # via keyring
six==1.16.0
    # via bleach
twine==4.0.1
    # via -r runtime.in
typing-extensions==4.5.0
    # via pydantic
urllib3==1.26.13
    # via
    #   requests
    #   twine
webencodings==0.5.1
    # via bleach
zipp==3.11.0
    # via importlib-metadata`
];
const files = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  runtime_in,
  runtime_prerequisites_in,
  runtime_prerequisites_txt,
  runtime_txt
}, Symbol.toStringTag, { value: "Module" }));
async function run() {
  const { packages } = manypkgGetPackages_cjsExports.getPackagesSync(process.cwd());
  const python_packages = packages.filter(
    (p) => p.packageJson.python
  );
  const user = coreExports.getInput("user");
  const passwords = coreExports.getInput("passwords");
  const packages_to_publish = (await Promise.all(
    python_packages.map(async (p) => {
      const package_name = p.packageJson.name;
      const version2 = p.packageJson.version;
      const exists = await check_version_exists(package_name, version2);
      if (exists) {
        coreExports.warning(
          `${package_name}@${version2} already exists on PyPI. Aborting publish.`
        );
        return false;
      }
      coreExports.info(`Publishing ${package_name}@${version2} to PyPI`);
      return p;
    })
  )).filter(Boolean);
  const packages_to_publish_sorted = await topological_sort(
    packages_to_publish
  );
  if (packages_to_publish_sorted.length === 0) {
    coreExports.info("No packages to publish.");
    return;
  }
  const pws = passwords.trim().split("\n").reduce((acc, next) => {
    const [pkg, pwd] = next.split(":");
    return {
      ...acc,
      [pkg]: pwd
    };
  }, {});
  coreExports.info("Installing prerequisites.");
  await require$$0$1.promises.mkdir("_action_temp/requirements", { recursive: true });
  await Promise.all(
    Object.values(files).map(
      ([name, content]) => require$$0$1.promises.writeFile(`_action_temp/requirements/${name}`, content)
    )
  );
  await exec_2(
    "pip",
    [
      "install",
      "twine",
      "--user",
      "--upgrade",
      "--no-cache-dir",
      "-r",
      "_action_temp/requirements/runtime-prerequisites.in"
    ],
    {
      env: {
        ...process.env,
        PIP_CONSTRAINT: "_action_temp/requirements/runtime-prerequisites.txt"
      }
    }
  );
  await exec_2(
    "pip",
    [
      "install",
      "--user",
      "--upgrade",
      "--no-cache-dir",
      "--prefer-binary",
      "-r",
      "_action_temp/requirements/runtime.in"
    ],
    {
      env: {
        ...process.env,
        PIP_CONSTRAINT: "_action_temp/requirements/runtime.txt"
      }
    }
  );
  await exec_2("pip", ["install", "secretstorage", "dbus-python"]);
  let publishes = [];
  for await (const p of packages_to_publish_sorted) {
    coreExports.info(`Publishing ${p.packageJson.name}@${p.packageJson.version} to PyPI`);
    publishes.push(await publish_package(user, pws[p.packageJson.name], p.dir));
  }
  publishes.map((p, i) => {
    if (p) {
      coreExports.info(`Published ${packages_to_publish[i].packageJson.name}`);
    } else {
      coreExports.warning(
        `Failed to publish ${packages_to_publish[i].packageJson.name}@${packages_to_publish[i].packageJson.version}`
      );
    }
  });
  await require$$0$1.promises.rmdir("_action_temp", { recursive: true });
}
run();
async function check_version_exists(package_name, version2) {
  const { statusCode, body } = await undici.request(
    `https://pypi.org/pypi/${package_name}/json`
  );
  if (statusCode !== 200) {
    coreExports.warning(`Could not find package: ${package_name} on PyPI.`);
    return false;
  }
  const data = await body.json();
  return version2 in data.releases;
}
async function publish_package(user, password, dir) {
  try {
    await exec_2("sh", [require$$0$3.join(dir, "..", "build_pypi.sh")]);
    await exec_2("twine", [
      "upload",
      "-u",
      user,
      "-p",
      password,
      `${require$$0$3.join(dir, "..")}/dist/*`
    ]);
    await exec_2("rm", ["-rf", `${require$$0$3.join(dir, "..")}/dist/*`]);
    await exec_2("rm", ["-rf", `${require$$0$3.join(dir, "..")}/build/*`]);
    return true;
  } catch (e) {
    coreExports.setFailed(e.message);
    throw new Error(e);
  }
}
async function topological_sort(packages) {
  const package_map = /* @__PURE__ */ new Map();
  packages.forEach((pkg) => package_map.set(pkg.packageJson.name, pkg));
  const visited = /* @__PURE__ */ new Set();
  const result = [];
  async function visit(pkg) {
    if (!visited.has(pkg.packageJson.name)) {
      visited.add(pkg.packageJson.name);
      const dependencies = (await get_package_dependencies(pkg)).filter(
        (p) => package_map.has(p)
      );
      for await (const dep of dependencies) {
        await visit(package_map.get(dep));
      }
      result.push(pkg);
    }
  }
  for await (const pkg of packages) {
    await visit(pkg);
  }
  result.reverse();
  return result;
}
const RE_PKG_NAME = /^[\w-]+\b/;
async function get_package_dependencies(pkg) {
  const requirements = require$$0$3.join(pkg.dir, "..", "requirements.txt");
  return (await require$$0$1.promises.readFile(requirements, "utf-8")).split("\n").map((line) => {
    const match = line.match(RE_PKG_NAME);
    return match ? match[0] : null;
  }).filter(Boolean);
}
