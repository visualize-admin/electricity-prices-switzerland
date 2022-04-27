'use strict';

var crypto = require('crypto');
var fs = require('fs');
var https = require('https');
var fetch = require('node-fetch');
var xmldom = require('xmldom');
var c14nFactory = require('xml-c14n');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var https__default = /*#__PURE__*/_interopDefaultLegacy(https);
var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);
var c14nFactory__default = /*#__PURE__*/_interopDefaultLegacy(c14nFactory);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
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
}

var getCertificateContent = function () {
    var CERTIFICATE_PATH = process.env.EIAM_CERTIFICATE_PATH;
    var CERTIFICATE_CONTENT = process.env.EIAM_CERTIFICATE_CONTENT;
    if (CERTIFICATE_PATH) {
        if (!fs__default["default"].existsSync(CERTIFICATE_PATH)) {
            throw new Error("Certificate file does not exist " + CERTIFICATE_PATH);
        }
        return fs__default["default"].readFileSync(CERTIFICATE_PATH);
    }
    else if (CERTIFICATE_CONTENT) {
        return Buffer.from(CERTIFICATE_CONTENT, "base64");
    }
    else {
        throw new Error("You must either provide EIAM_CERTIFICATE_PATH or EIAM_CERTIFICATE_CONTENT (base64) to perform secure queries");
    }
};
var makeSslConfiguredAgent = function () {
    var pfx = getCertificateContent();
    var CERTIFICATE_PASSWORD = process.env.EIAM_CERTIFICATE_PASSWORD;
    if (!CERTIFICATE_PASSWORD) {
        throw new Error("EIAM_CERTIFICATE_PASSWORD must be defined in env");
    }
    return new https__default["default"].Agent({
        pfx: pfx,
        passphrase: CERTIFICATE_PASSWORD
    });
};
var makeRequest = function (url, body, headers, agent) { return __awaiter(void 0, void 0, void 0, function () {
    var resp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch__default["default"](url, {
                    method: "POST",
                    body: body,
                    headers: headers,
                    agent: agent,
                    follow: 0
                }).then(function (resp) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                if (!(resp.status === 200)) return [3 /*break*/, 1];
                                return [2 /*return*/, resp.text()];
                            case 1:
                                console.warn(resp);
                                _b = (_a = console).warn;
                                return [4 /*yield*/, resp.text()];
                            case 2:
                                _b.apply(_a, [_c.sent()]);
                                throw new Error("Request failed: " + resp.status + " - " + resp.statusText);
                        }
                    });
                }); })];
            case 1:
                resp = _a.sent();
                return [2 /*return*/, resp];
        }
    });
}); };

var ns = {
    u: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd",
    saml2: "urn:oasis:names:tc:SAML:2.0:assertion",
    o: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd",
    wst: "http://docs.oasis-open.org/ws-sx/ws-trust/200512",
    sig: "http://www.w3.org/2000/09/xmldsig#",
    client: "http://Adnovum.FatClient.Soap"
};
var $ = function (doc, ns, qs, index) {
    var elements = doc.getElementsByTagNameNS(ns, qs);
    if (elements.length > 1 && typeof index === "undefined") {
        console.log(elements);
        throw new Error("Too many elements for " + ns + ":" + qs + ", please add an index");
    }
    if (!elements.length) {
        throw new Error("Could not find " + ns + ":" + qs + ", index: " + index);
    }
    var res = elements[typeof index === "undefined" ? 0 : index];
    return res;
};
var canonicalizeXML = function (tree) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                var canonicaliser = c14n.createCanonicaliser("http://www.w3.org/2001/10/xml-exc-c14n#");
                canonicaliser.canonicalise(tree, function (err, res) {
                    if (err) {
                        return reject(err);
                    }
                    // Remove all white space
                    res = res.replace(/\n/gi, "");
                    res = res.replace(/\s+</gi, "<");
                    resolve(res);
                });
            })];
    });
}); };
var c14n = c14nFactory__default["default"]();
var serializeXMLToString = function (tree) {
    return new xmldom.XMLSerializer().serializeToString(tree);
};
var parseXMLString = function (xmlStr) {
    return new xmldom.DOMParser().parseFromString(xmlStr);
};
var stripWhitespace = function (xmlStr) {
    return xmlStr.replace(/>\s+</gm, '><');
};

var req1Template = "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:a=\"http://www.w3.org/2005/08/addressing\" xmlns:u=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd\">\n    <s:Header>\n        <a:Action s:mustUnderstand=\"1\">http://docs.oasis-open.org/ws-sx/ws-trust/200512/RST/Issue</a:Action>\n        <a:MessageID>urn:uuid:e5393db9-1753-4dc9-b356-658b71b4b3fe</a:MessageID>\n        <ActivityId correlationId=\"ff547aa6-79ae-4d5e-8fff-6542230de5c4\" xmlns=\"http://schemas.microsoft.com/2004/09/ServiceModel/Diagnostics\">061572c2-3a5d-4b18-ab3a-7f99de8b0181</ActivityId>\n        <a:ReplyTo>\n            <a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address>\n        </a:ReplyTo>\n        <a:To s:mustUnderstand=\"1\">https://idp-cert.gate-r.eiam.admin.ch/auth/sts/v14/certificatetransport</a:To>\n        <o:Security s:mustUnderstand=\"1\" xmlns:o=\"http://docs.oasis-open.org/wss/2004/01/oasis200401-wss-wssecurity-secext-1.0.xsd\">\n            <u:Timestamp u:Id=\"_0\">\n                <u:Created>2020-12-21T15:25:27.642Z</u:Created>\n                <u:Expires>2020-12-21T15:30:27.642Z</u:Expires>\n            </u:Timestamp>\n            <o:UsernameToken u:Id=\"uuid-f5929429-0f3b-40a9-b10f8205ac4d59a7-1\">\n                <o:Username>dummy</o:Username>\n            </o:UsernameToken>\n        </o:Security>\n    </s:Header>\n    <s:Body>\n        <trust:RequestSecurityToken xmlns:trust=\"http://docs.oasis-open.org/ws-sx/ws-trust/200512\">\n            <trust:RequestType>http://docs.oasis-open.org/ws-sx/ws-trust/200512/Issue</trust:RequestType>\n            <trust:TokenType>http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLV2.0</trust:TokenType>\n            <trust:KeyType>http://docs.oasis-open.org/ws-sx/ws-trust/200512/SymmetricKey</trust:KeyType>\n            <trust:KeySize>256</trust:KeySize>\n            <trust:KeyWrapAlgorithm>http://www.w3.org/2001/04/xmlenc#rsaoaep-mgf1p</trust:KeyWrapAlgorithm>\n            <trust:EncryptWith>http://www.w3.org/2001/04/xmlenc#aes256-cbc</trust:EncryptWith>\n            <trust:SignWith>http://www.w3.org/2000/09/xmldsig#hmacsha1</trust:SignWith>\n\n            <trust:CanonicalizationAlgorithm>http://www.w3.org/2001/10/xml-excc14n#</trust:CanonicalizationAlgorithm>\n\n            <trust:EncryptionAlgorithm>http://www.w3.org/2001/04/xmlenc#aes256-cbc</trust:EncryptionAlgorithm>\n            <wsp:AppliesTo xmlns:wsp=\"http://schemas.xmlsoap.org/ws/2004/09/policy\">\n                <EndpointReference xmlns=\"http://www.w3.org/2005/08/addressing\">\n                    <Address>http://feds-r.eiam.admin.ch</Address>\n                </EndpointReference>\n            </wsp:AppliesTo>\n        </trust:RequestSecurityToken>\n    </s:Body>\n</s:Envelope>";

var req2Template = "<s:Envelope xmlns:s=\"http://www.w3.org/2003/05/soap-envelope\" xmlns:a=\"http://www.w3.org/2005/08/addressing\" xmlns:u=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd\">\n    <s:Header>\n        <a:Action s:mustUnderstand=\"1\">http://docs.oasis-open.org/ws-sx/ws-trust/200512/RST/Issue</a:Action>\n        <a:MessageID>urn:uuid:d1dd0ed4-4be1-4587-a03f-d147faf2bd75</a:MessageID>\n        <a:ReplyTo>\n            <a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address>\n        </a:ReplyTo>\n        <a:To s:mustUnderstand=\"1\">https://feds-r.eiam.admin.ch/adfs/services/trust/13/issuedtokenmixedsymmetricbasic256</a:To>\n        <o:Security s:mustUnderstand=\"1\" xmlns:o=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd\">\n            <u:Timestamp u:Id=\"_0\">\n                <u:Created></u:Created>\n                <u:Expires></u:Expires>\n            </u:Timestamp>\n\n            <Signature xmlns=\"http://www.w3.org/2000/09/xmldsig#\">\n                <SignedInfo>\n                    <CanonicalizationMethod Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\" />\n                    <SignatureMethod Algorithm=\"http://www.w3.org/2000/09/xmldsig#hmac-sha1\" />\n                    <Reference URI=\"#_0\">\n                        <Transforms>\n                            <Transform Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\" />\n                        </Transforms>\n                        <DigestMethod Algorithm=\"http://www.w3.org/2000/09/xmldsig#sha1\" />\n                        <DigestValue></DigestValue>\n                    </Reference>\n                </SignedInfo>\n                <SignatureValue></SignatureValue>\n                <KeyInfo>\n                    <o:SecurityTokenReference k:TokenType=\"http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLV2.0\" xmlns:k=\"http://docs.oasis-open.org/wss/oasis-wss-wssecurity-secext-1.1.xsd\">\n                        <o:KeyIdentifier ValueType=\"http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLID\"></o:KeyIdentifier>\n                    </o:SecurityTokenReference>\n                </KeyInfo>\n            </Signature>\n        </o:Security>\n    </s:Header>\n    <s:Body>\n        <trust:RequestSecurityToken xmlns:trust=\"http://docs.oasis-open.org/ws-sx/ws-trust/200512\">\n            <trust:RequestType>http://docs.oasis-open.org/ws-sx/ws-trust/200512/Issue</trust:RequestType>\n            <trust:TokenType>http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLV2.0</trust:TokenType>\n            <trust:KeyType>http://docs.oasis-open.org/ws-sx/ws-trust/200512/Bearer</trust:KeyType>\n            <trust:CanonicalizationAlgorithm>http://www.w3.org/2001/10/xml-exc-c14n#</trust:CanonicalizationAlgorithm>\n            <trust:EncryptionAlgorithm>http://www.w3.org/2001/04/xmlenc#aes256-cbc</trust:EncryptionAlgorithm>\n            <wsp:AppliesTo xmlns:wsp=\"http://schemas.xmlsoap.org/ws/2004/09/policy\">\n                <EndpointReference xmlns=\"http://www.w3.org/2005/08/addressing\">\n                    <Address>urn:eiam.admin.ch:pep:GEVER-WS</Address>\n                </EndpointReference>\n            </wsp:AppliesTo>\n        </trust:RequestSecurityToken>\n    </s:Body>\n</s:Envelope>";

var req3Template = "<s:Envelope xmlns:s=\"http://www.w3.org/2003/05/soap-envelope\" xmlns:a=\"http://www.w3.org/2005/08/addressing\" xmlns:u=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd\">\n    <s:Header>\n        <a:Action s:mustUnderstand=\"1\">http://www.admin.ch/Gever/client/webservices/GeverService/1.0/IDataManipulationService/GetContent</a:Action>\n        <a:MessageID>urn:uuid:55fcf838-2f34-47b3-af91-f22c0b6e714d</a:MessageID>\n        <ActivityId CorrelationId=\"f8c736c8-bb99-4911-8950-d38fbe4d60c3\" xmlns=\"http://schemas.microsoft.com/2004/09/ServiceModel/Diagnostics\">96ad170f-99be-4812-8504-83cbde17a393</ActivityId>\n        <a:ReplyTo>\n            <a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address>\n        </a:ReplyTo>\n        <VsDebuggerCausalityData xmlns=\"http://schemas.microsoft.com/vstudio/diagnostics/servicemodelsink\">uIDPo56AMxbpZUxFjkrBhuY5M0MAAAAAmEHiwS+emUajbOASf9PkCPRpmUPFYLRGiwI+sVdSlUgACQAA</VsDebuggerCausalityData>\n        <a:To s:mustUnderstand=\"1\">https://wsg-backend.egov-uvek.gever-tst.admin.ch/anws/GeverWebservices/GeverServiceAdvanced.svc</a:To>\n        <o:Security s:mustUnderstand=\"1\" xmlns:o=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd\">\n            <u:Timestamp u:Id=\"_0\">\n                <u:Created>2022-04-22T12:41:45.688Z</u:Created>\n                <u:Expires>2022-04-22T12:46:45.688Z</u:Expires>\n            </u:Timestamp>\n            <!-- Assertion -->\n        </o:Security>\n    </s:Header>\n    <s:Body>\n        <GetContent xmlns=\"http://www.admin.ch/Gever/client/webservices/GeverService/1.0\">\n            <fileContentReference xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">\n                <BusinessObjectClass>ActaNovaDocument</BusinessObjectClass>\n                <DisplayName i:nil=\"true\" />\n                <ID i:nil=\"true\" />\n                <ReferenceID></ReferenceID>\n                <UrlToObject i:nil=\"true\" />\n            </fileContentReference>\n        </GetContent>\n    </s:Body>\n</s:Envelope>";

var bindings = {
    ipsts: "https://idp-cert.gate-r.eiam.admin.ch/auth/sts/v14/certificatetransport",
    rpsts: "https://feds-r.eiam.admin.ch/adfs/services/trust/13/issuedtokenmixedsymmetricbasic256",
    service: "https://api.egov-dev.uvek.admin.ch/tst/BusinessManagement/GeverService/GeverServiceAdvanced.svc"
};
var makeRequest1 = function () { return __awaiter(void 0, void 0, void 0, function () {
    var resp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fs__default["default"].writeFileSync("/tmp/req1.xml", req1Template);
                return [4 /*yield*/, makeRequest(bindings.ipsts, req1Template, {
                        "Content-Type": "text/xml",
                        SOAPAction: "http://docs.oasis-open.org/ws-sx/ws-trust/200512/RST/Issue"
                    }, makeSslConfiguredAgent())];
            case 1:
                resp = _a.sent();
                return [2 /*return*/, resp];
        }
    });
}); };
var digestTimestampNode = function (timestampNode) { return __awaiter(void 0, void 0, void 0, function () {
    var timestampCanonical, hash, digestValue;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, canonicalizeXML(timestampNode)];
            case 1:
                timestampCanonical = _a.sent();
                hash = crypto__default["default"].createHash("sha1");
                hash.update(timestampCanonical);
                digestValue = hash.digest("base64");
                return [2 /*return*/, digestValue];
        }
    });
}); };
var digestSignedInfoNode = function (signedInfoNode, binaryToken) { return __awaiter(void 0, void 0, void 0, function () {
    var hmac, signedInfoCanonical;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hmac = crypto__default["default"].createHmac("sha1", binaryToken);
                return [4 /*yield*/, canonicalizeXML(signedInfoNode)];
            case 1:
                signedInfoCanonical = _a.sent();
                hmac.update(signedInfoCanonical);
                return [2 /*return*/, hmac.digest("base64")];
        }
    });
}); };
var makeRequest2 = function (resp1Str) { return __awaiter(void 0, void 0, void 0, function () {
    var resp1, doc, samlAssertion, assertionId, binaryTokenB64, binaryToken, security, timestampNode, sigNode, digestValueNode, sigValueNode, keyIdentifier, creationDate, expirationDate, digestValue, signedInfoNode, signatureValue, req2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                resp1 = parseXMLString(resp1Str).documentElement;
                doc = parseXMLString(req2Template).documentElement;
                samlAssertion = $(resp1, ns.saml2, "Assertion");
                assertionId = samlAssertion.getAttribute("ID");
                binaryTokenB64 = $(resp1, ns.wst, "BinarySecret", 1)
                    .textContent;
                binaryToken = Buffer.from(binaryTokenB64, "base64");
                security = $(doc, ns.o, "Security");
                timestampNode = $(doc, ns.u, "Timestamp");
                sigNode = $(doc, ns.sig, "Signature");
                digestValueNode = $(sigNode, ns.sig, "DigestValue");
                sigValueNode = $(sigNode, ns.sig, "SignatureValue");
                keyIdentifier = $(sigNode, ns.o, "KeyIdentifier");
                // Insert SAML Assertion
                security.insertBefore(samlAssertion, $(security, ns.sig, "Signature"));
                creationDate = new Date().toISOString();
                expirationDate = new Date(+new Date() + 5 * 60 * 1000).toISOString();
                $(timestampNode, ns.u, "Created").textContent = creationDate;
                $(timestampNode, ns.u, "Expires").textContent = expirationDate;
                return [4 /*yield*/, digestTimestampNode(timestampNode)];
            case 1:
                digestValue = _a.sent();
                digestValueNode.textContent = digestValue;
                signedInfoNode = $(sigNode, ns.sig, "SignedInfo");
                return [4 /*yield*/, digestSignedInfoNode(signedInfoNode, binaryToken)];
            case 2:
                signatureValue = _a.sent();
                sigValueNode.textContent = signatureValue;
                // Update keyIdentifier to be assertion id
                keyIdentifier.textContent = assertionId;
                req2 = serializeXMLToString(doc);
                req2 = stripWhitespace(req2);
                fs__default["default"].writeFileSync("/tmp/req2.xml", req2);
                return [4 /*yield*/, makeRequest(bindings.rpsts, req2, {
                        "Content-Type": "application/soap+xml; charset=utf-8"
                    })];
            case 3: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var makeRequest3 = function (resp2Str, docId) { return __awaiter(void 0, void 0, void 0, function () {
    var resp2, doc, samlAssertion, security, timestampNode, referenceIdNode, creationDate, expirationDate, req3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                resp2 = parseXMLString(resp2Str).documentElement;
                doc = parseXMLString(req3Template).documentElement;
                samlAssertion = $(resp2, ns.saml2, "Assertion");
                security = $(doc, ns.o, "Security");
                timestampNode = $(doc, ns.u, "Timestamp");
                referenceIdNode = doc.getElementsByTagName("ReferenceID")[0];
                creationDate = new Date().toISOString();
                expirationDate = new Date(+new Date() + 5 * 60 * 1000).toISOString();
                $(timestampNode, ns.u, "Created").textContent = creationDate;
                $(timestampNode, ns.u, "Expires").textContent = expirationDate;
                security.appendChild(samlAssertion);
                referenceIdNode.textContent = docId;
                req3 = stripWhitespace(serializeXMLToString(doc));
                fs__default["default"].writeFileSync("/tmp/req3.xml", req3);
                return [4 /*yield*/, makeRequest(bindings.service, req3, {
                        "Content-Type": "application/soap+xml; charset=utf-8"
                    })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var makeDownloadRequest = function (docId) { return __awaiter(void 0, void 0, void 0, function () {
    var resp1, resp2, resp3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Request to IP-STS...");
                return [4 /*yield*/, makeRequest1()];
            case 1:
                resp1 = _a.sent();
                console.log("Request to RP-STS...");
                return [4 /*yield*/, makeRequest2(resp1)];
            case 2:
                resp2 = _a.sent();
                console.log("Request to GEVER...");
                return [4 /*yield*/, makeRequest3(resp2, docId)];
            case 3:
                resp3 = _a.sent();
                return [2 /*return*/, {
                        resp1: resp1,
                        resp2: resp2,
                        resp3: resp3,
                        content: ""
                    }];
        }
    });
}); };

var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var resp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, makeDownloadRequest(process.argv[2])];
            case 1:
                resp = _a.sent();
                console.log(resp);
                return [2 /*return*/];
        }
    });
}); };
main()["catch"](function (e) {
    console.warn(e);
    process.exit(1);
});
