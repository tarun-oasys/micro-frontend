const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const repos = require('./repos-config');

// Utility: spawn a command in the current terminal (shell mode)
function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`Running command "${command}" in ${cwd}`);
    const proc = spawn(command, {
      cwd,
      shell: true,
      stdio: 'inherit',
    });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command}" exited with code ${code}`));
      }
    });
  });
}

// Utility: spawn a new terminal window and run a command
function runInNewTerminal(command, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`Opening new terminal for command "${command}" in ${cwd}`);

    const terminalCommand = 'gnome-terminal';
    const args = ['--', 'bash', '-c', `cd ${cwd} && ${command}; exec bash`];

    const env = Object.assign({}, process.env, { DISPLAY: ':0' });  // Ensure DISPLAY is set

    console.log(`Executing: ${terminalCommand} ${args.join(' ')}`);

    const proc = spawn(terminalCommand, args, {
      shell: true,  // Use shell to ensure smoother execution
      env: env,
    });

    proc.on('error', (err) => {
      console.error('Failed to open terminal:', err);
      reject(err);
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        console.error(`Terminal process exited with code ${code}`);
        reject(new Error(`Terminal process exited with code ${code}`));
      } else {
        console.log('Terminal opened successfully.');
        resolve();
      }
    });
  });
}


// Utility: Clone a repo if folder does not exist
function cloneRepo(repo) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path.resolve(repo.folder))) {
      console.log(`${repo.name} already exists, skipping clone.`);
      return resolve();
    }
    console.log(`Cloning ${repo.name} from ${repo.gitUrl} into ${repo.folder}`);
    const parentDir = path.dirname(path.resolve(repo.folder));
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    const proc = spawn('git', ['clone', repo.gitUrl, repo.folder], {
      shell: true,
      stdio: 'inherit',
    });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Cloning ${repo.name} failed with exit code ${code}`));
      }
    });
  });
}

// Utility: Get the current branch of a repo
function getCurrentBranch(cwd) {
  return new Promise((resolve, reject) => {
    runCommand('git rev-parse --abbrev-ref HEAD', cwd)
      .then(() => {
        resolve(fs.readFileSync(path.resolve(cwd, '.git/HEAD')).toString().trim());
      })
      .catch(reject);
  });
}


async function runRepoSteps(repo) {
  console.log(`\n=== Running steps for ${repo.name} ===`);
  const cwd = path.resolve(repo.folder);
  const initialBranch = await getCurrentBranch(cwd);

  // Function to run a list of steps sequentially
  async function runSteps(steps) {
    for (let i = 0; i < steps.length; i++) {
      const { command, newTerminal } = steps[i];
      if (newTerminal) {
        // Run this command in current terminal (or open it in new terminal) and then continue remaining steps
        await runCommand(command, cwd);
        // If there are remaining steps, open them in a new terminal.
        const remainingSteps = steps.slice(i + 1)
          .map((s) => s.command)
          .join(' && ');
        if (remainingSteps) {
          await runInNewTerminal(remainingSteps, cwd);
        }
        return;
      } else {
        await runCommand(command, cwd);
      }
    }
  }

  await runSteps(repo.steps);

  // After setup, check if the branch has changed
  const currentBranch = await getCurrentBranch(cwd);
  if (currentBranch !== initialBranch) {
    console.log(`Branch has been switched for ${repo.name}. Restarting repo...`);
    await runRepoSteps(repo);
  }
}


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

  // For each selected repo, perform clone and then run steps in parallel.

  await Promise.all(selectedRepos.map(async (repo) => {
    try {
      await cloneRepo(repo);
      await runRepoSteps(repo);
      console.log(`Finished setting up ${repo.name}`);
    } catch (error) {
      console.error(`Error setting up ${repo.name}:`, error);
    }
  }));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
