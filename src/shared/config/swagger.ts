import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import fs from "fs";
import { env } from "./env";

// Auto-detect if running from compiled code (dist folder) or source
// If __dirname contains 'dist', we're running compiled code
const isCompiled = __dirname.includes("dist") || __dirname.includes("\\dist");
const fileExt = isCompiled ? "js" : "ts";

// Resolve paths correctly for both dev and production
const modulesPath = path.resolve(__dirname, "../../modules");

// Function to recursively find all route and controller files
function findFiles(
  dir: string,
  pattern: RegExp,
  fileList: string[] = []
): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findFiles(filePath, pattern, fileList);
    } else if (pattern.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Find all route and controller files
const routeFiles = findFiles(modulesPath, /\.routes\.(ts|js)$/);
const controllerFiles = findFiles(modulesPath, /\.controller\.(ts|js)$/);

// Filter by extension based on environment
const apiPaths = [
  ...routeFiles.filter((file) => file.endsWith(`.routes.${fileExt}`)),
  ...controllerFiles.filter((file) => file.endsWith(`.controller.${fileExt}`)),
];

// Debug logging
console.log("📚 Swagger config:");
console.log("   Running from:", isCompiled ? "compiled (dist)" : "source");
console.log("   File extension:", fileExt);
console.log("   Modules path:", modulesPath);
console.log("   API paths found:", apiPaths.length);
if (apiPaths.length === 0) {
  console.warn("⚠️  No API files found! Looking in:", modulesPath);
  console.warn("   Route files found:", routeFiles);
  console.warn("   Controller files found:", controllerFiles);
} else {
  console.log(
    "   Files:",
    apiPaths.map((p) => path.relative(process.cwd(), p))
  );
}

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Social Media API",
      version: "1.0.0",
      description: "API documentation for Social Media Backend",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: "Development server",
      },
      {
        url: "https://v-social.onrender.com",
        description: "Production server (Render)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis:
    apiPaths.length > 0
      ? apiPaths
      : [
          // Fallback to glob pattern if no files found
          path.join(modulesPath, "**", `*.routes.${fileExt}`),
          path.join(modulesPath, "**", `*.controller.${fileExt}`),
        ],
};

const swaggerSpec = swaggerJsdoc(options) as any;

// Debug: log if no paths found
if (!swaggerSpec.paths || Object.keys(swaggerSpec.paths).length === 0) {
  console.warn("⚠️  Swagger: No paths found in spec!");
  console.warn("   Spec keys:", Object.keys(swaggerSpec));
} else {
  console.log(
    "✅ Swagger spec generated with",
    Object.keys(swaggerSpec.paths).length,
    "paths"
  );
}

export { swaggerSpec };
