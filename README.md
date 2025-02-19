# Micro Frontend Setup Guide

This guide will walk you through setting up your micro frontend repositories with a simple, automated process. Follow the steps below to get everything up and running smoothly.

---

## 1. Install Required Packages

The first step is to install all necessary packages and dependencies on your system.

### Step 1: Run `install_all.sh`

Execute the following command in your terminal:

```bash
bash install_all.sh
```

This script will:
- Install **Git**, **curl**, **Node.js v16.20.2**, and **Grunt CLI**.
- Ensure all tools are correctly set up.

**Note:** After running the script, restart your terminal or run:
- `source ~/.bashrc` (for Linux)
- `source ~/.zshrc` (for macOS)

---

## 2. Configure Repositories

Next, you need to specify which repositories to set up and their respective steps.

### Step 2: Edit `repos-config.js`

Open `repos-config.js` and define the repositories you want to clone and set up. Each repository entry should include:
- **name**: Repository name.
- **gitUrl**: The Git URL to clone the repository.
- **folder**: Local folder where the repo will be cloned.
- **steps**: Commands to run after cloning.

#### Example Configuration:

```javascript
module.exports = [
  {
    name: 'oasysadmin-ui-repo',
    gitUrl: 'git@gitlab.oneassist.in:ApplicationEngineering/oasysadmin-ui-repo.git',
    folder: 'oasysadmin-ui-repo',
    steps: [
      {
        command: 'bash ./hot-reload.sh',
        newTerminal: true,
      },
    ],
  },
  {
    name: 'livechat-ui-repo',
    gitUrl: 'git@gitlab.oneassist.in:ApplicationEngineering/livechat-ui-repo.git',
    folder: 'livechat-ui-repo',
    steps: [
      {
        command: 'bash ./start.sh',
        newTerminal: true,
      },
    ],
  },
];
```

---

## 3. Run Repository Setup

Finally, execute the script that will clone and set up the repositories.

### Step 3: Run `setup.js`

To set up **all** repositories defined in `repos-config.js`, run:

```bash
node setup.js
```

To set up a **specific** repository (e.g., only `oasysadmin-ui-repo`), run:

```bash
node setup.js oasysadmin-ui-repo
```

This will:
- Clone the specified repositories (if not already cloned).
- Execute the defined setup steps.
- Open new terminals where required based on the configuration.

---

## 4. Closing Terminals and Stopping Services

If you want to stop all running terminals or terminate specific processes, follow these additional steps.

### Step 4.1: Close All Terminals Running Node.js

To close all terminals running Node.js processes, execute the following command:

```bash
lsof -ti :3001 -ti :3002 -ti :3003 -ti :3004 -ti :3005 -ti :3006 -ti :3007 -ti :3008 | xargs kill -9
```

This command will terminate all processes related to Node.js that are currently running in your system.


### Step 4.2: Close Specific Ports

To stop a specific service running on a port, you can kill the process using the following command. For example, to kill processes running on port 3000 or 3001, use:

```bash
#!/bin/bash
lsof -ti :3001 -ti :3002 | xargs kill -9
```
This will:
- List the processes running on the specified ports (3001 or 3002).
- Kill those processes to free up the ports for other services.

## Troubleshooting

- **Unsupported OS:** Ensure you're using macOS or Linux. Windows is not supported.
- **Permission Issues:** If you encounter permission errors, try running the commands with `sudo`.
- **Terminal Not Opening:** Ensure you have `gnome-terminal` installed on Linux.

---

## Conclusion

Follow these three steps, and your micro frontend environment should be up and running seamlessly. Customize `repos-config.js` as needed to manage additional repositories or adjust setup steps.

## List of all running ports

- **3001** : crm-ui-repo
- **3002** : livechat-ui-repo
- **3003** : myaccount-ui-repo
- **3004** : oasys-admin-ui-v2
- **3005** : oasysadmin-ui-repo
- **3006** : portal-ui-repo
- **3007** : unite-ui-repo
- **3008** : unite-v2-ui