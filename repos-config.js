module.exports = [
  {
    name: "crm-ui-repo",
    gitUrl: "git@gitlab.oneassist.in:ApplicationEngineering/crm-ui-repo.git",
    folder: "crm-ui-repo",
    steps: [
      {
        command: "bash ./start.sh DEV",
        newTerminal: true,
      },
    ],
  },
  {
    name: "livechat-ui-repo",
    gitUrl:
      "git@gitlab.oneassist.in:ApplicationEngineering/livechat-ui-repo.git",
    folder: "livechat-ui-repo",
    steps: [
      {
        command: "bash ./start.sh DEV",
        newTerminal: true,
      },
    ],
  },
  {
    name: "myaccount-ui-repo",
    gitUrl:
      "git@gitlab.oneassist.in:ApplicationEngineering/myaccount-ui-repo.git",
    folder: "myaccount-ui-repo",
    steps: [
      {
        command: "bash ./hot-reload.sh DEV",
        newTerminal: true,
      },
    ],
  },
  {
    name: "oasys-admin-ui-v2",
    gitUrl:
      "git@gitlab.oneassist.in:ApplicationEngineering/oasys-admin-ui-v2.git",
    folder: "oasys-admin-ui-v2",
    steps: [
      {
        command: "bash ./start.sh DEV",
        newTerminal: true,
      },
    ],
  },
  {
    name: "oasysadmin-ui-repo",
    gitUrl:
      "git@gitlab.oneassist.in:ApplicationEngineering/oasysadmin-ui-repo.git",
    folder: "oasysadmin-ui-repo",
    steps: [
      {
        command: "bash ./hot-reload.sh DEV",
        newTerminal: true,
      },
    ],
  },
  {
    name: "portal-ui-repo",
    gitUrl: "git@gitlab.oneassist.in:ApplicationEngineering/portal-ui-repo.git",
    folder: "portal-ui-repo",
    steps: [
      {
        command: "bash ./hot-reload.sh DEV",
        newTerminal: true,
      },
    ],
  },
  {
    name: "unite-ui-repo",
    gitUrl: "git@gitlab.oneassist.in:ApplicationEngineering/unite-ui-repo.git",
    folder: "unite-ui-repo",
    steps: [
      {
        command: "bash ./start.sh DEV",
        newTerminal: true,
      },
    ],
  },
  {
    name: "unite-v2-ui",
    gitUrl: "git@gitlab.oneassist.in:ApplicationEngineering/unite-v2-ui.git",
    folder: "unite-v2-ui",
    steps: [
      {
        command: "bash ./start.sh DEV",
        newTerminal: true,
      },
    ],
  },
];