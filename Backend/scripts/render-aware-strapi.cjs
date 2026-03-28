const { spawn } = require('node:child_process');
const path = require('node:path');

const requestedCommand = process.argv[2] || 'develop';
const effectiveCommand =
  requestedCommand === 'develop' && process.env.RENDER === 'true'
    ? 'start'
    : requestedCommand;

const strapiCliPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@strapi',
  'strapi',
  'bin',
  'strapi.js'
);

const child = spawn(process.execPath, [strapiCliPath, effectiveCommand], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

