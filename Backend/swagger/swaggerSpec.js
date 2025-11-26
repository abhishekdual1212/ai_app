// swagger/swaggerSpec.js
// Static OpenAPI doc for Abyd. Update as routes evolve.
module.exports = {
  openapi: "3.0.3",
  info: {
    title: "Abyd Backend API",
    version: "1.0.0",
    description:
      "OpenAPI documentation for Abyd backend. This spec documents the Auth (URL-token + cookies), UserStart, and GroupedKeywordTags endpoints.",
  },
  servers: [{ url: "http://localhost:3000", description: "Local" }],
  tags: [
    { name: "Auth", description: "Login/session utilities using URL token + HttpOnly cookies" },
    { name: "UserStart", description: "Onboarding profile for users (abyd.userstart)" },
    {
      name: "GroupedKeywordTags",
      description:
        "Explore catalog used by Static Chat / Explore screens. Returns grouped ‘quick options’ such as IPR, Labour law, etc.",
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: { type: "apiKey", in: "header", name: "x-api-key" },
      cookieAuth: { type: "apiKey", in: "cookie", name: "abyd_at" },
    },
    schemas: {
      /* -------------------------- Common -------------------------- */
      SuccessResponse: {
        type: "object",
        properties: { success: { type: "boolean", example: true } },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "not found" },
        },
      },

      /* --------------------------- Auth --------------------------- */
      AuthMeResponse: {
        type: "object",
        properties: {
          authenticated: { type: "boolean", example: true },
          userid: { type: "string", example: "u_abc123", nullable: true },
          username: { type: "string", example: "shivam", nullable: true },
        },
      },
      UrlLoginResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          sid: { type: "string" },
          redirectExplore: { type: "string", example: "/<sid>/explore" },
          redirectDashboard: { type: "string", example: "/<sid>/dashboard" },
        },
      },
      ConsumeResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          next: { type: "string", example: "/dashboard" },
          user: {
            type: "object",
            properties: {
              userid: { type: "string" },
              username: { type: "string" },
            },
          },
        },
      },

      /* ------------------------ UserStart ------------------------- */
      UserStart: {
        type: "object",
        properties: {
          _id: { type: "string" },
          userid: { type: "string", example: "u_abc123" },
          email: { type: "string", format: "email", nullable: true },
          emailVerified: { type: "boolean", nullable: true },
          displayName: { type: "string", nullable: true },
          photoURL: { type: "string", nullable: true },
          providerData: { type: "array", items: { type: "object" } },
          creationTime: { type: "string", nullable: true, example: "2025-01-01T10:00:00.000Z" },
          lastSignInTime: { type: "string", nullable: true, example: "2025-01-05T10:00:00.000Z" },
          brandName: { type: "string", nullable: true, example: "Acme Foods" },
          phoneNumber: { type: "string", nullable: true, example: "9876543210" },
          brandStatus: { type: "integer", enum: [0, 1], example: 1 },
          phoneStatus: { type: "integer", enum: [0, 1], example: 1 },
          createdAt: { type: "string", example: "2025-01-01T10:00:00.000Z" },
          updatedAt: { type: "string", example: "2025-01-05T10:00:00.000Z" },
        },
      },
      UserStartResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          { type: "object", properties: { data: { $ref: "#/components/schemas/UserStart" } } },
        ],
      },
      UserStartListResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          {
            type: "object",
            properties: {
              data: { type: "array", items: { $ref: "#/components/schemas/UserStart" } },
              total: { type: "integer", example: 2 },
              limit: { type: "integer", example: 50 },
              offset: { type: "integer", example: 0 },
            },
          },
        ],
      },

      /* ------------------- GroupedKeywordTags --------------------- */
      KeywordTag: {
        type: "object",
        description: "Single quick-option / tag within a group",
        properties: {
          key: { type: "string", example: "fractional-legal-counsel" },
          title: { type: "string", example: "Fractional Legal Counsel" },
          icon: { type: "string", nullable: true, example: "briefcase" },
          order: { type: "integer", nullable: true, example: 2 },
        },
        required: ["key", "title"],
      },
      KeywordGroup: {
        type: "object",
        description: "A group (category) containing multiple keyword tags",
        properties: {
          group: { type: "string", example: "Choose an option to get started" },
          items: { type: "array", items: { $ref: "#/components/schemas/KeywordTag" } },
        },
        required: ["group", "items"],
      },
      GroupedKeywordTagsListResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          {
            type: "object",
            properties: {
              data: { type: "array", items: { $ref: "#/components/schemas/KeywordGroup" } },
            },
          },
        ],
      },
    },
  },
  paths: {
    /* ------------------------------ AUTH ------------------------------ */
    "/api/auth/url-login": {
      post: {
        tags: ["Auth"],
        summary: "Create a short-lived URL token to embed in /:sid/(explore|dashboard)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userid", "username"],
                properties: { userid: { type: "string" }, username: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/UrlLoginResponse" } } },
          },
          "400": {
            description: "Bad request",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/auth/consume/{sid}": {
      get: {
        tags: ["Auth"],
        summary: "Consume URL token, set HttpOnly cookies, and return next route",
        parameters: [
          { in: "path", name: "sid", required: true, schema: { type: "string" } },
          {
            in: "query",
            name: "dest",
            required: false,
            schema: { type: "string", enum: ["explore", "dashboard"], default: "explore" },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ConsumeResponse" } } },
          },
          "400": {
            description: "Expired/invalid sid",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Rotate access token using refresh cookie",
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
          },
          "401": {
            description: "Missing/invalid refresh",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout (clear cookies)",
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Check current cookie session",
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthMeResponse" } } },
          },
        },
      },
    },

    /* --------------------------- USERSTART ---------------------------- */
    "/api/userstart": {
      get: {
        tags: ["UserStart"],
        summary: "List userstart rows (search + pagination)",
        parameters: [
          {
            in: "query",
            name: "q",
            schema: { type: "string" },
            description: "Search across userid/email/displayName/brandName/phoneNumber",
          },
          { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 200, default: 50 } },
          { in: "query", name: "offset", schema: { type: "integer", minimum: 0, default: 0 } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/UserStartListResponse" } } },
          },
          "500": {
            description: "Server error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/userstart/sync": {
      post: {
        tags: ["UserStart"],
        summary: "Upsert from Firebase profile data on login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  userid: { type: "string" },
                  email: { type: "string", format: "email" },
                  emailVerified: { type: "boolean" },
                  displayName: { type: "string" },
                  photoURL: { type: "string" },
                  providerData: { type: "array", items: { type: "object" } },
                  creationTime: { type: "string" },
                  lastSignInTime: { type: "string" },
                },
                anyOf: [{ required: ["userid"] }, { required: ["email"] }],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Inserted or updated",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    { type: "object", properties: { action: { type: "string", enum: ["insert", "update"] } } },
                  ],
                },
              },
            },
          },
          "500": {
            description: "Server error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/userstart/status": {
      get: {
        tags: ["UserStart"],
        summary: "Get status by userid/email (autocreate optional)",
        parameters: [
          { in: "query", name: "userid", schema: { type: "string" } },
          { in: "query", name: "email", schema: { type: "string", format: "email" } },
          { in: "query", name: "autocreate", schema: { type: "string", enum: ["0", "1"], default: "1" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/UserStartResponse" } } },
          },
          "404": {
            description: "Not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          "500": {
            description: "Server error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/userstart/{userid}": {
      get: {
        tags: ["UserStart"],
        summary: "Get by userid",
        parameters: [{ in: "path", required: true, name: "userid", schema: { type: "string" } }],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/UserStartResponse" } } },
          },
          "404": {
            description: "Not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          "500": {
            description: "Server error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
      patch: {
        tags: ["UserStart"],
        summary: "Update brand/phone or meta (accepts aliases)",
        description:
          "Accepts canonical fields (`brandName`, `phoneNumber`) and aliases (`brandname`, `phone`).",
        parameters: [{ in: "path", required: true, name: "userid", schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: true,
                properties: {
                  brandName: { type: "string", nullable: true },
                  phoneNumber: { type: "string", nullable: true },
                  brandname: { type: "string", nullable: true },
                  phone: { type: "string", nullable: true },
                  email: { type: "string", format: "email" },
                  emailVerified: { type: "boolean" },
                  displayName: { type: "string" },
                  photoURL: { type: "string" },
                  providerData: { type: "array", items: { type: "object" } },
                  creationTime: { type: "string" },
                  lastSignInTime: { type: "string" },
                  brandStatus: { type: "integer", enum: [0, 1] },
                  phoneStatus: { type: "integer", enum: [0, 1] },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/UserStartResponse" } } },
          },
          "404": {
            description: "Not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          "500": {
            description: "Server error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/userstart/ensure": {
      post: {
        tags: ["UserStart"],
        summary: "Ensure a row exists (insert-or-update profile meta)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  userid: { type: "string" },
                  email: { type: "string", format: "email" },
                  emailVerified: { type: "boolean" },
                  displayName: { type: "string" },
                  photoURL: { type: "string" },
                  providerData: { type: "array", items: { type: "object" } },
                  creationTime: { type: "string" },
                  lastSignInTime: { type: "string" },
                },
                anyOf: [{ required: ["userid"] }, { required: ["email"] }],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Ensured",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        action: { type: "string", enum: ["insert", "update"] },
                        data: { $ref: "#/components/schemas/UserStart" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "500": {
            description: "Server error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/userstart/me": {
      get: {
        tags: ["UserStart"],
        summary: "Convenience: get by query (userid or email)",
        parameters: [
          { in: "query", name: "userid", schema: { type: "string" } },
          { in: "query", name: "email", schema: { type: "string", format: "email" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/UserStartResponse" } } },
          },
          "500": {
            description: "Server error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
      patch: {
        tags: ["UserStart"],
        summary: "Convenience: update brand/phone by query (userid/email)",
        parameters: [
          { in: "query", name: "userid", schema: { type: "string" } },
          { in: "query", name: "email", schema: { type: "string", format: "email" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  brandName: { type: "string", nullable: true },
                  phoneNumber: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/UserStartResponse" } } },
          },
          "404": {
            description: "Not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          "500": {
            description: "Server error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },

    /* --------------------- GroupedKeywordTags --------------------- */
    "/api/grouped-keyword-tags": {
      get: {
        tags: ["GroupedKeywordTags"],
        summary: "List grouped keyword tags for Explore / Static Chat quick options",
        description:
          "Returns an array of groups. Each group contains user-facing quick options (tags). This endpoint is protected by x-api-key.",
        security: [{ ApiKeyAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GroupedKeywordTagsListResponse" },
                examples: {
                  sample: {
                    value: {
                      success: true,
                      data: [
                        {
                          group: "Choose an option to get started",
                          items: [
                            { key: "ipr", title: "IPR" },
                            { key: "labour-law", title: "Labour law" },
                            { key: "fractional-legal-counsel", title: "Fractional Legal Counsel" },
                            { key: "contract", title: "Contract" },
                            { key: "privacy", title: "Privacy" },
                            { key: "not-sure", title: "I’m not sure yet" },
                          ],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Invalid or missing API key",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          "500": {
            description: "Server error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
  },
};
