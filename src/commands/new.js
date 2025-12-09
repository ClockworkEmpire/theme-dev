const fs = require('fs');
const path = require('path');

module.exports = function(args) {
  const name = args.find(a => !a.startsWith('-'));
  const useExample = args.includes('--example');

  if (!name) {
    console.error('Error: Please provide a theme name');
    console.error('Usage: hostnet new <name> [--example]');
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), name);

  if (fs.existsSync(targetDir)) {
    console.error(`Error: Directory already exists: ${name}`);
    process.exit(1);
  }

  const starterName = useExample ? 'minimal' : 'blank';
  const starterDir = path.join(__dirname, '..', '..', 'starters', starterName);

  if (!fs.existsSync(starterDir)) {
    console.error(`Error: Starter template not found: ${starterName}`);
    console.error(`Expected at: ${starterDir}`);
    process.exit(1);
  }

  copyDir(starterDir, targetDir);

  console.log(`Created new theme: ${name}`);
  console.log();
  console.log('Next steps:');
  console.log(`  cd ${name}`);
  console.log('  hostnet dev');
};

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
