const fs = require('fs');
const path = require('path');

module.exports = function(args) {
  const subcommand = args[0] || 'help';

  switch (subcommand) {
    case 'extract':
    case 'unpack':
      extractDocs(args[1]);
      break;
    case 'list':
      listDocs();
      break;
    case 'path':
      showDocsPath();
      break;
    default:
      showDocsHelp();
  }
};

function extractDocs(targetDir) {
  const target = targetDir || './siteswarm-docs';
  const docsSource = path.join(__dirname, '../../docs');

  if (!fs.existsSync(docsSource)) {
    console.error('Error: Documentation not found in package.');
    console.error('Try: swarm update');
    process.exit(1);
  }

  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  copyDirSync(docsSource, target);

  console.log(`Documentation extracted to: ${path.resolve(target)}`);
  console.log();
  console.log('Files:');
  listDocsIn(target);
  console.log();
  console.log(`Start with: ${target}/INDEX.md`);
}

function listDocs() {
  const docsSource = path.join(__dirname, '../../docs');
  if (!fs.existsSync(docsSource)) {
    console.error('Error: Documentation not found. Try: swarm update');
    process.exit(1);
  }

  console.log('Available documentation:');
  console.log();
  listDocsIn(docsSource);
}

function showDocsPath() {
  console.log(path.join(__dirname, '../../docs'));
}

function listDocsIn(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  files.forEach(f => console.log(`  - ${f.replace('.md', '')}`));
}

function copyDirSync(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function showDocsHelp() {
  console.log(`
Site Swarm Theme Documentation

Usage: swarm docs <command>

Commands:
  extract [path]    Copy docs to local directory (default: ./siteswarm-docs)
  list              List available documentation
  path              Show bundled docs location

Examples:
  swarm docs extract           # Extract to ./siteswarm-docs
  swarm docs extract ./docs    # Extract to custom path
  swarm docs list              # Show available docs
`);
}
