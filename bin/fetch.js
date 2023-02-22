"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.fetchAndWrite = exports.fetchContractAddressesFromPackageJson = exports.acceptedChainIds = void 0;
var axios_1 = require("axios");
var fs = require("fs");
var fs_1 = require("fs");
var path = require("path");
var serverUrl = "https://sourcify.dev/server";
// const repositoryUrl: string = "https://repo.sourcify.dev";
function getSourceFiles(address, chainId) {
    return __awaiter(this, void 0, void 0, function () {
        var config, response, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = {
                        method: "get",
                        url: "".concat(serverUrl, "/files/any/").concat(chainId, "/").concat(address)
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, axios_1["default"])(config)];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
                case 3:
                    e_1 = _a.sent();
                    throw new Error("".concat(e_1.message, " ").concat(e_1.response.data, "... Please make sure your contracts in \"custom\" field of package.json are verified on Sourcify"));
                case 4: return [2 /*return*/];
            }
        });
    });
}
function findFileInDirectory(baseDir, relativeDir, fileName) {
    return __awaiter(this, void 0, void 0, function () {
        var files, _i, files_1, file, filePath, result, fullPath, relPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_1.promises.readdir(baseDir)];
                case 1:
                    files = _a.sent();
                    _i = 0, files_1 = files;
                    _a.label = 2;
                case 2:
                    if (!(_i < files_1.length)) return [3 /*break*/, 7];
                    file = files_1[_i];
                    filePath = path.join(baseDir, file);
                    return [4 /*yield*/, fs_1.promises.stat(path.join(baseDir, file))];
                case 3:
                    if (!(_a.sent()).isDirectory()) return [3 /*break*/, 5];
                    return [4 /*yield*/, findFileInDirectory(filePath, relativeDir, fileName)];
                case 4:
                    result = _a.sent();
                    if (result) {
                        return [2 /*return*/, result];
                    }
                    return [3 /*break*/, 6];
                case 5:
                    if (file === fileName) {
                        fullPath = filePath;
                        relPath = path.relative(relativeDir, fullPath);
                        return [2 /*return*/, relPath];
                    }
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7: return [2 /*return*/, null];
            }
        });
    });
}
exports.acceptedChainIds = [
    1,
    5,
    11155111, // Sepolia
];
function fetchContractAddressesFromPackageJson() {
    var _a, _b, _c, _d;
    var packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
    // only add cut if acceptedChainIds contains cuts
    var cuts = [];
    var _loop_1 = function (chainId) {
        if ((_b = (_a = packageJson.custom) === null || _a === void 0 ? void 0 : _a[chainId]) === null || _b === void 0 ? void 0 : _b.cuts) {
            cuts = cuts.concat((_d = (_c = packageJson.custom) === null || _c === void 0 ? void 0 : _c[chainId]) === null || _d === void 0 ? void 0 : _d.cuts.map(function (cut) {
                return { address: cut.target, chainId: chainId };
            }));
        }
    };
    for (var _i = 0, acceptedChainIds_1 = exports.acceptedChainIds; _i < acceptedChainIds_1.length; _i++) {
        var chainId = acceptedChainIds_1[_i];
        _loop_1(chainId);
    }
    return cuts;
}
exports.fetchContractAddressesFromPackageJson = fetchContractAddressesFromPackageJson;
function fetchAndWrite(pathName, facets) {
    return __awaiter(this, void 0, void 0, function () {
        var generatedDir, _i, facets_1, facet, basePath, sourcesDir, res, _a, _b, file, filePath, dir, metadata, contractName, metadataDir, metadataPath, deployments, _c, _d, file, filePath, dir, imports, _e, imports_1, imp, importFileName, relativePath;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!facets) {
                        facets = fetchContractAddressesFromPackageJson();
                    }
                    generatedDir = path.join(process.cwd(), pathName);
                    if (!fs.existsSync(generatedDir)) {
                        fs.mkdirSync(generatedDir);
                    }
                    _i = 0, facets_1 = facets;
                    _f.label = 1;
                case 1:
                    if (!(_i < facets_1.length)) return [3 /*break*/, 22];
                    facet = facets_1[_i];
                    basePath = "/home/data/repository/contracts/full_match";
                    sourcesDir = path.join(process.cwd(), pathName, "sources");
                    if (!fs.existsSync(sourcesDir)) {
                        fs.mkdirSync(sourcesDir);
                    }
                    return [4 /*yield*/, getSourceFiles(facet.address, facet.chainId)];
                case 2:
                    res = _f.sent();
                    _a = 0, _b = res.files;
                    _f.label = 3;
                case 3:
                    if (!(_a < _b.length)) return [3 /*break*/, 13];
                    file = _b[_a];
                    if (!file.name.endsWith(".sol")) return [3 /*break*/, 6];
                    filePath = path.join(sourcesDir, file.path.replace("".concat(basePath, "/").concat(facet.chainId, "/").concat(facet.address, "/sources"), ""));
                    dir = path.dirname(filePath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    if (!!fs.existsSync(filePath)) return [3 /*break*/, 5];
                    return [4 /*yield*/, fs_1.promises.appendFile(filePath, "")];
                case 4:
                    _f.sent();
                    _f.label = 5;
                case 5: return [3 /*break*/, 12];
                case 6:
                    if (!(file.name === "metadata.json")) return [3 /*break*/, 12];
                    metadata = JSON.parse(file.content);
                    contractName = Object.values(metadata.settings.compilationTarget)[0];
                    metadataDir = path.join(process.cwd(), pathName, "metadata");
                    if (!fs.existsSync(metadataDir)) {
                        fs.mkdirSync(metadataDir);
                    }
                    metadataPath = path.join(metadataDir, "".concat(contractName, ".json"));
                    if (!!fs.existsSync(metadataPath)) return [3 /*break*/, 8];
                    return [4 /*yield*/, fs_1.promises.appendFile(metadataPath, JSON.stringify(metadata.output, null, 2))];
                case 7:
                    _f.sent();
                    _f.label = 8;
                case 8:
                    if (!!fs.existsSync(path.join(generatedDir, "deployments.json"))) return [3 /*break*/, 10];
                    return [4 /*yield*/, fs_1.promises.appendFile(path.join(generatedDir, "deployments.json"), "{}")];
                case 9:
                    _f.sent();
                    _f.label = 10;
                case 10:
                    deployments = JSON.parse(fs.readFileSync(path.join(generatedDir, "deployments.json"), "utf8"));
                    if (!deployments[facet.chainId]) {
                        deployments[facet.chainId] = {};
                    }
                    deployments[facet.chainId]["".concat(contractName)] = {
                        address: facet.address,
                        abi: metadata.output.abi
                    };
                    return [4 /*yield*/, fs_1.promises.writeFile(path.join(generatedDir, "deployments.json"), JSON.stringify(deployments, null, 2))];
                case 11:
                    _f.sent();
                    _f.label = 12;
                case 12:
                    _a++;
                    return [3 /*break*/, 3];
                case 13:
                    _c = 0, _d = res.files;
                    _f.label = 14;
                case 14:
                    if (!(_c < _d.length)) return [3 /*break*/, 21];
                    file = _d[_c];
                    if (!file.name.endsWith(".sol")) return [3 /*break*/, 20];
                    filePath = path.join(sourcesDir, file.path.replace("".concat(basePath, "/").concat(facet.chainId, "/").concat(facet.address, "/sources"), ""));
                    dir = path.dirname(filePath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    imports = file.content.match(new RegExp("import\\s+(?:\\{.*\\}\\s+from\\s+)?['\"](.*)\\.(sol)['\"];?", "g"));
                    if (!imports) return [3 /*break*/, 18];
                    _e = 0, imports_1 = imports;
                    _f.label = 15;
                case 15:
                    if (!(_e < imports_1.length)) return [3 /*break*/, 18];
                    imp = imports_1[_e];
                    importFileName = imp
                        .match(/['"](.*)\.sol['"]/)[1]
                        .split("/")
                        .pop();
                    return [4 /*yield*/, findFileInDirectory(sourcesDir, dir, "".concat(importFileName, ".sol"))];
                case 16:
                    relativePath = _f.sent();
                    !relativePath.startsWith(".")
                        ? (relativePath = "./".concat(relativePath))
                        : null;
                    file.content = file.content.replace(imp, imp.replace(/['"](.*)\.sol['"]/, "'".concat(relativePath, "'")));
                    _f.label = 17;
                case 17:
                    _e++;
                    return [3 /*break*/, 15];
                case 18: 
                //write file.content to filePath
                return [4 /*yield*/, fs_1.promises.writeFile(filePath, file.content)];
                case 19:
                    //write file.content to filePath
                    _f.sent();
                    _f.label = 20;
                case 20:
                    _c++;
                    return [3 /*break*/, 14];
                case 21:
                    _i++;
                    return [3 /*break*/, 1];
                case 22: return [2 /*return*/];
            }
        });
    });
}
exports.fetchAndWrite = fetchAndWrite;
