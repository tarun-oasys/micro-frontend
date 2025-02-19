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

    if (platform === 'darwin') { // macOS
      terminalCommand = 'osascript';
      args = ['-e', `tell app "Terminal" to do script "cd '${cwd}' && ${command}"`];
    } else if (platform === 'linux') { // Linux
      terminalCommand = 'gnome-terminal';
      args = ['--', 'bash', '-c', `cd '${cwd}' && ${command}; exec bash`];
    } else {
      return Promise.reject(new Error('Unsupported OS'));
    }

    return new Promise((resolve, reject) => {
      const proc = spawn(terminalCommand, args, { shell: true });
      proc.on('error', reject);
      proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Failed to open terminal with code ${code}`))));
    });
  }

  // Utility: Clone repo if folder doesn't exist
  function cloneRepo(repo) {
    const repoPath = path.resolve(repo.folder);
    if (fs.existsSync(repoPath)) {
      console.log(`${repo.name} already exists, skipping clone.`);
      return Promise.resolve();
    }
    
    console.log(`Cloning ${repo.name} from ${repo.gitUrl}`);
    return runCommand(`git clone ${repo.gitUrl} ${repo.folder}`, path.dirname(repoPath));
  }

  // Run setup steps for the repo
  async function runRepoSteps(repo) {
    console.log(`\n=== Running steps for ${repo.name} ===`);
    const cwd = path.resolve(repo.folder);

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
    console.error('Unexpected error:', err.message);
    process.exit(1);
  });
