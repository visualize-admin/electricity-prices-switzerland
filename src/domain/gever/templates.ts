export const req1 = /* xml */ `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
    <s:Header>
        <a:Action s:mustUnderstand="1">http://docs.oasis-open.org/ws-sx/ws-trust/200512/RST/Issue</a:Action>
        <a:MessageID>urn:uuid:e5393db9-1753-4dc9-b356-658b71b4b3fe</a:MessageID>
        <ActivityId CorrelationId="ff547aa6-79ae-4d5e-8fff-6542230de5c4" xmlns="http://schemas.microsoft.com/2004/09/ServiceModel/Diagnostics">061572c2-3a5d-4b18-ab3a-7f99de8b0181</ActivityId>
        <a:ReplyTo>
            <a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address>
        </a:ReplyTo>
        <a:To s:mustUnderstand="1">https://idp-cert.gate-r.eiam.admin.ch/auth/sts/v14/certificatetransport</a:To>
        <o:Security s:mustUnderstand="1" xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis200401-wss-wssecurity-secext-1.0.xsd">
            <u:Timestamp u:Id="_0">
                <u:Created>2020-12-21T15:25:27.642Z</u:Created>
                <u:Expires>2020-12-21T15:30:27.642Z</u:Expires>
            </u:Timestamp>
            <o:UsernameToken u:Id="uuid-f5929429-0f3b-40a9-b10f8205ac4d59a7-1">
                <o:Username>dummy</o:Username>
            </o:UsernameToken>
        </o:Security>
    </s:Header>
    <s:Body>
        <trust:RequestSecurityToken xmlns:trust="http://docs.oasis-open.org/ws-sx/ws-trust/200512">
            <trust:RequestType>http://docs.oasis-open.org/ws-sx/ws-trust/200512/Issue</trust:RequestType>
            <trust:TokenType>http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLV2.0</trust:TokenType>
            <trust:KeyType>http://docs.oasis-open.org/ws-sx/ws-trust/200512/SymmetricKey</trust:KeyType>
            <trust:KeySize>256</trust:KeySize>
            <trust:KeyWrapAlgorithm>http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p</trust:KeyWrapAlgorithm>
            <trust:EncryptWith>http://www.w3.org/2001/04/xmlenc#aes256-cbc</trust:EncryptWith>
            <trust:SignWith>http://www.w3.org/2000/09/xmldsig#hmac-sha1</trust:SignWith>

            <trust:CanonicalizationAlgorithm>http://www.w3.org/2001/10/xml-exc-c14n#</trust:CanonicalizationAlgorithm>

            <trust:EncryptionAlgorithm>http://www.w3.org/2001/04/xmlenc#aes256-cbc</trust:EncryptionAlgorithm>
            <wsp:AppliesTo xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy">
                <EndpointReference xmlns="http://www.w3.org/2005/08/addressing">
                    <Address>http://feds-r.eiam.admin.ch</Address>
                </EndpointReference>
            </wsp:AppliesTo>
        </trust:RequestSecurityToken>
    </s:Body>
</s:Envelope>`;

export const req2 = /* xml */ `<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
    <s:Header>
        <a:Action s:mustUnderstand="1">http://docs.oasis-open.org/ws-sx/ws-trust/200512/RST/Issue</a:Action>
        <a:MessageID>urn:uuid:d1dd0ed4-4be1-4587-a03f-d147faf2bd75</a:MessageID>
        <a:ReplyTo>
            <a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address>
        </a:ReplyTo>
        <a:To s:mustUnderstand="1">TO BE FILLED</a:To>
        <o:Security s:mustUnderstand="1" xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
            <u:Timestamp u:Id="_0">
                <u:Created></u:Created>
                <u:Expires></u:Expires>
            </u:Timestamp>

            <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
                <SignedInfo>
                    <CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#" />
                    <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#hmac-sha1" />
                    <Reference URI="#_0">
                        <Transforms>
                            <Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#" />
                        </Transforms>
                        <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1" />
                        <DigestValue></DigestValue>
                    </Reference>
                </SignedInfo>
                <SignatureValue></SignatureValue>
                <KeyInfo>
                    <o:SecurityTokenReference k:TokenType="http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLV2.0" xmlns:k="http://docs.oasis-open.org/wss/oasis-wss-wssecurity-secext-1.1.xsd">
                        <o:KeyIdentifier ValueType="http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLID"></o:KeyIdentifier>
                    </o:SecurityTokenReference>
                </KeyInfo>
            </Signature>
        </o:Security>
    </s:Header>
    <s:Body>
        <trust:RequestSecurityToken xmlns:trust="http://docs.oasis-open.org/ws-sx/ws-trust/200512">
            <trust:RequestType>http://docs.oasis-open.org/ws-sx/ws-trust/200512/Issue</trust:RequestType>
            <trust:TokenType>http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLV2.0</trust:TokenType>
            <trust:KeyType>http://docs.oasis-open.org/ws-sx/ws-trust/200512/Bearer</trust:KeyType>
            <trust:CanonicalizationAlgorithm>http://www.w3.org/2001/10/xml-exc-c14n#</trust:CanonicalizationAlgorithm>
            <trust:EncryptionAlgorithm>http://www.w3.org/2001/04/xmlenc#aes256-cbc</trust:EncryptionAlgorithm>
            <wsp:AppliesTo xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy">
                <EndpointReference xmlns="http://www.w3.org/2005/08/addressing">
                    <Address>urn:eiam.admin.ch:pep:GEVER-WS</Address>
                </EndpointReference>
            </wsp:AppliesTo>
        </trust:RequestSecurityToken>
    </s:Body>
</s:Envelope>`;

export const searchDocuments = /* xml */ `<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
    <s:Header>
        <a:Action s:mustUnderstand="1">http://www.admin.ch/Gever/client/webservices/GeverService/1.0/IGeverSearchService/ExecuteLinqSearchQuery</a:Action>
        <a:MessageID>urn:uuid:55fcf838-2f34-47b3-af91-f22c0b6e714d</a:MessageID>
        <ActivityId CorrelationId="f8c736c8-bb99-4911-8950-d38fbe4d60c3" xmlns="http://schemas.microsoft.com/2004/09/ServiceModel/Diagnostics">96ad170f-99be-4812-8504-83cbde17a393</ActivityId>
        <a:ReplyTo>
            <a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address>
        </a:ReplyTo>
        <VsDebuggerCausalityData xmlns="http://schemas.microsoft.com/vstudio/diagnostics/servicemodelsink">uIDPo56AMxbpZUxFjkrBhuY5M0MAAAAAmEHiwS+emUajbOASf9PkCPRpmUPFYLRGiwI+sVdSlUgACQAA</VsDebuggerCausalityData>
        <a:To s:mustUnderstand="1">https://wsg-backend.egov-uvek.gever-tst.admin.ch/anws/GeverWebservices/GeverServiceAdvanced.svc</a:To>
        <o:Security s:mustUnderstand="1" xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
            <u:Timestamp u:Id="_0">
                <u:Created>2022-04-28T07:56:32.842Z</u:Created>
                <u:Expires>2022-04-28T08:01:32.842Z</u:Expires>
            </u:Timestamp>
            <!-- Assertion -->
        </o:Security>
    </s:Header>
    <s:Body>
        <ExecuteLinqSearchQuery xmlns="http://www.admin.ch/Gever/client/webservices/GeverService/1.0">
            <queryObject xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
                <BusinessObjectClass>LinqSearchQuery</BusinessObjectClass>
                <DisplayName i:nil="true" />
                <ID i:nil="true" />
                <ReferenceID>ACB23AE9-C044-4B84-A8C6-173931C2390B</ReferenceID>
                <UrlToObject i:nil="true" />
            </queryObject>
            <queryParameters xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
                <QueryParameter>
                    <ParameterName></ParameterName>
                    <ParameterValue i:type="b:string" xmlns:b="http://www.w3.org/2001/XMLSchema"></ParameterValue>
                </QueryParameter>
            </queryParameters>
        </ExecuteLinqSearchQuery>
    </s:Body>
</s:Envelope>`;

export const getContent = /* xml */ `<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
    <s:Header>
        <a:Action s:mustUnderstand="1">http://www.admin.ch/Gever/client/webservices/GeverService/1.0/IDataManipulationService/GetContent</a:Action>
        <a:MessageID>urn:uuid:55fcf838-2f34-47b3-af91-f22c0b6e714d</a:MessageID>
        <ActivityId CorrelationId="f8c736c8-bb99-4911-8950-d38fbe4d60c3" xmlns="http://schemas.microsoft.com/2004/09/ServiceModel/Diagnostics">96ad170f-99be-4812-8504-83cbde17a393</ActivityId>
        <a:ReplyTo>
            <a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address>
        </a:ReplyTo>
        <VsDebuggerCausalityData xmlns="http://schemas.microsoft.com/vstudio/diagnostics/servicemodelsink">uIDPo56AMxbpZUxFjkrBhuY5M0MAAAAAmEHiwS+emUajbOASf9PkCPRpmUPFYLRGiwI+sVdSlUgACQAA</VsDebuggerCausalityData>
        <a:To s:mustUnderstand="1">https://wsg-backend.egov-uvek.gever-tst.admin.ch/anws/GeverWebservices/GeverServiceAdvanced.svc</a:To>
        <o:Security s:mustUnderstand="1" xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
            <u:Timestamp u:Id="_0">
                <u:Created>2022-04-22T12:41:45.688Z</u:Created>
                <u:Expires>2022-04-22T12:46:45.688Z</u:Expires>
            </u:Timestamp>
            <!-- Assertion -->
        </o:Security>
    </s:Header>
    <s:Body>
        <GetContent xmlns="http://www.admin.ch/Gever/client/webservices/GeverService/1.0">
            <fileContentReference xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
                <BusinessObjectClass>ActaNovaDocument</BusinessObjectClass>
                <DisplayName i:nil="true" />
                <ID i:nil="true" />
                <ReferenceID></ReferenceID>
                <UrlToObject i:nil="true" />
            </fileContentReference>
        </GetContent>
    </s:Body>
</s:Envelope>`;
