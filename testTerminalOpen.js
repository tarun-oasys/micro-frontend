// test-terminal.js
const { spawn } = require('child_process');
const os = require('os');

function openTerminal() {
  const terminalCommand = 'gnome-terminal';
  const args = ['--', 'bash', '-c', 'echo "Hello from minimal test!"; exec bash'];

  const env = Object.assign({}, process.env, { DISPLAY: ':0' });

  console.log(`Executing: ${terminalCommand} ${args.join(' ')}`);

  const proc = spawn(terminalCommand, args, {
    shell: false,
    env: env,
  });

  proc.on('error', (err) => {
    console.error('Failed to open terminal:', err);
  });

  proc.on('close', (code) => {
    if (code !== 0) {
      console.error(`Terminal process exited with code ${code}`);
    } else {
      console.log('Terminal opened successfully.');
    }
  });
}

