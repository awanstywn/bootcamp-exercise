const fs = require('fs');
const path = require('path');

// Helper to determine layer
function getLayer(filePath) {
  if (filePath.includes('/client/')) return 'Client (Frontend)';
  if (filePath.includes('/server/')) return 'Server (Backend)';
  if (filePath.includes('/shared/')) return 'Shared';
  return 'Root';
}

// Helper to determine type
function getType(filePath) {
  const base = path.basename(filePath);
  if (filePath.includes('/pages/')) return 'Page Component';
  if (filePath.includes('/components/')) return 'React Component';
  if (filePath.includes('/controllers/')) return 'API Controller';
  if (filePath.includes('/services/')) return 'Business Logic Service';
  if (filePath.includes('/routes/')) return 'API Route Router';
  if (filePath.includes('/middlewares/')) return 'Express Middleware';
  if (filePath.includes('/schemas/')) return 'Validation Schema';
  if (filePath.includes('/types/')) return 'Type Definition';
  if (filePath.includes('/stores/')) return 'State Management Store';
  if (filePath.includes('/hooks/')) return 'Custom React Hook';
  return 'Utility/Module';
}

// Generate comment based on heuristics
function generateComment(filePath, content) {
  const layer = getLayer(filePath);
  const type = getType(filePath);
  const filename = path.basename(filePath);
  
  // Extract imports to understand relations
  const importLines = content.split('\n').filter(l => l.startsWith('import '));
  const imports = importLines.map(l => l.split('from')[1]?.replace(/['";]/g, '').trim()).filter(Boolean);
  const uniqueImports = [...new Set(imports)].slice(0, 5); // Take up to 5 imports for context
  
  const relationText = uniqueImports.length > 0 
    ? `Interacts with: ${uniqueImports.join(', ')}.` 
    : `Functions independently as a standalone module.`;

  let specificWork = "Executes core logic by exporting necessary functions, hooks, or components.";
  
  if (type === 'Page Component') {
    specificWork = "Renders the main page view, fetches necessary data, and composes smaller child components to build the UI.";
  } else if (type === 'React Component') {
    specificWork = "Receives props to dynamically render UI elements, managing local state where necessary.";
  } else if (type === 'API Controller') {
    specificWork = "Extracts request payloads/params, delegates business logic to services, and formats the HTTP response.";
  } else if (type === 'Business Logic Service') {
    specificWork = "Interacts directly with the database (e.g., Prisma) or external APIs to execute core application rules.";
  } else if (type === 'API Route Router') {
    specificWork = "Maps HTTP methods and endpoints to their respective controller functions and applies required middlewares.";
  } else if (type === 'Express Middleware') {
    specificWork = "Intercepts incoming HTTP requests to perform validation, authentication, or error handling before passing control to the next handler.";
  } else if (type === 'Validation Schema') {
    specificWork = "Uses Zod to define rigorous shape and type constraints for data payloads, ensuring robust validation.";
  } else if (type === 'State Management Store') {
    specificWork = "Uses Zustand to manage global client-side state, providing actions to mutate state across components.";
  }

  const comment = `/**
 * @file ${filename}
 * @description ${type} for the ${layer} layer.
 * 
 * @objective 
 * To provide the specific functionality required for ${filename.replace(/\.[^/.]+$/, "")} operations.
 * 
 * @relations
 * ${relationText}
 * 
 * @howItWorks
 * ${specificWork} This helps maintain separation of concerns and keeps the codebase modular and readable.
 */
`;
  return comment;
}

// Recursively get all .ts and .tsx files in src directories
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        // Only process files in 'src' directories
        if (dirPath.includes('/src')) {
          arrayOfFiles.push(path.join(dirPath, "/", file));
        }
      }
    }
  });

  return arrayOfFiles;
}

const workspaces = ['client', 'server', 'shared'];
let filesProcessed = 0;

workspaces.forEach(workspace => {
  const srcPath = path.join(__dirname, workspace, 'src');
  if (fs.existsSync(srcPath)) {
    const files = getAllFiles(srcPath);
    
    files.forEach(file => {
      let content = fs.readFileSync(file, 'utf8');
      
      // Prevent adding comment if it already starts with /**
      if (!content.trimStart().startsWith('/**')) {
        const comment = generateComment(file, content);
        fs.writeFileSync(file, comment + '\n' + content);
        filesProcessed++;
      }
    });
  }
});

console.log(`Successfully added comments to ${filesProcessed} files.`);
