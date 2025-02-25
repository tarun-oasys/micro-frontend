const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const repos = require('./repos-config');

// Utility: Run command in current terminal
function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, { cwd, shell: true, stdio: 'inherit' });
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Command "${command}" failed with code ${code}`))));
  });
}

// Utility: Open new terminal window and run command (supports Mac and Linux)
function runInNewTerminal(command, cwd) {
  const platform = os.platform();
  let terminalCommand, args;

  console.log(`Opening new terminal for command: "${command}" in ${cwd}`);

  if (platform === 'darwin') { // macOS
    terminalCommand = 'osascript';
    args = [
      '-e', `tell app "Terminal" to activate`,
      '-e', `tell app "Terminal" to do script "cd '${cwd}' && ${command}"`
    ];
  } else if (platform === 'linux') { // Linux
    terminalCommand = 'gnome-terminal';
    args = ['--', 'bash', '-c', `cd '${cwd}' && ${command}; exec bash`];
    if (!fs.existsSync('/usr/bin/gnome-terminal')) {
      terminalCommand = 'xterm';
      args = ['-e', `bash -c "cd '${cwd}' && ${command}; exec bash"`];
    }
  } else {
    return Promise.reject(new Error('Unsupported OS'));
  }

  return new Promise((resolve, reject) => {
    const proc = spawn(terminalCommand, args, { shell: true });
    proc.on('error', (err) => {
      console.error(`Failed to spawn ${terminalCommand}:`, err.message);
      reject(err);
    });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Failed to open terminal with ${terminalCommand}, exit code ${code}`));
    });
  });
}

// Utility: Clone repo if folder doesn't exist (in current terminal)
function cloneRepo(repo) {
  const repoPath = path.resolve(repo.folder);
  if (fs.existsSync(repoPath)) {
    console.log(`${repo.name} already exists, skipping clone.`);
    return Promise.resolve();
  }
  
  console.log(`Cloning ${repo.name} from ${repo.gitUrl}`);
  return runCommand(`git clone ${repo.gitUrl} ${repo.folder}`, path.dirname(repoPath));
}

// Utility: Generate test.sh and run it in a new terminal
async function runRepoSteps(repo) {
  console.log(`\n=== Setting up ${repo.name} in parallel ===`);
  const cwd = path.resolve(repo.folder);
  const platform = os.platform();
  const shPath = path.join(cwd, 'newTerminal.sh');

  // Generate newTerminal.sh content
  let shContent = '#!/bin/bash\n';
  if (platform === 'darwin') {
    shContent += `osascript -e 'tell app "Terminal" to activate' -e 'tell app "Terminal" to do script "cd \\"${cwd}\\" && ${repo.steps.map(s => s.command).join(' && ')}"'\n`;
  } else if (platform === 'linux') {
    shContent += `gnome-terminal -- bash -c "cd '${cwd}' && ${repo.steps.map(s => s.command).join(' && ')}; exec bash" || xterm -e "bash -c 'cd ${cwd} && ${repo.steps.map(s => s.command).join(' && ')}; exec bash'"\n`;
  } else {
    throw new Error('Unsupported OS');
  }

  // Write newTerminal.sh
  fs.writeFileSync(shPath, shContent, { mode: 0o755 }); // Make executable
  console.log(`Generated ${shPath} for ${repo.name}`);

  // Run newTerminal.sh in a new terminal
  return runInNewTerminal(`bash ${shPath}`, cwd);
}

// Main function
async function main() {
  const selectedNames = process.argv.slice(2);

  let selectedRepos = repos;
  if (selectedNames.length > 0) {
    selectedRepos = repos.filter(repo => selectedNames.includes(repo.name));
    if (selectedRepos.length === 0) {
      console.error('No matching repos found for:', selectedNames);
      process.exit(1);
    }
  }



  // Run steps for all repos in parallel, each in a new terminal
  await Promise.all(selectedRepos.map(async (repo) => {
    try {
      await cloneRepo(repo);
      await runRepoSteps(repo); // Opens a new terminal for newTerminal.sh, which opens another for steps
      console.log(`Finished setting up ${repo.name}`);
    } catch (error) {
      console.error(`Error setting up ${repo.name}:`, error.message);
    }
  }));
}

main().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
