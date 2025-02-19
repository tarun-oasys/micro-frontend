  #!/bin/bash

  echo "Starting installation process..."

  # Function to check if a command exists
  command_exists() {
      command -v "$1" >/dev/null 2>&1
  }

  # Function to install packages based on OS
  install_package() {
      if [[ "$OSTYPE" == "darwin"* ]]; then
          # macOS
          if command_exists brew; then
              brew install "$1"
          else
              echo "Homebrew is not installed. Installing Homebrew..."
              /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
              brew install "$1"
          fi
      else
          # Linux
          if command_exists apt; then
              sudo apt install -y "$1"
          elif command_exists yum; then
              sudo yum install -y "$1"
          else
              echo "Neither apt nor yum package manager found. Please install manually."
              exit 1
          fi
      fi
  }

  # Install Git if not present
  if ! command_exists git; then
      echo "Installing Git..."
      install_package git
  fi

  # Verify Git installation
  git_version=$(git --version)
  echo "Git version: $git_version"

  # Install curl if not present
  if ! command_exists curl; then
      echo "Installing curl..."
      install_package curl
  fi

  # Install Node.js using nvm (works on both platforms)
  echo "Setting up Node.js v16.20.2..."

  # Install nvm if not present
  if [ ! -d "$HOME/.nvm" ]; then
      echo "Installing nvm..."
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
      
      # Load nvm
      export NVM_DIR="$HOME/.nvm"
      [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  fi

  # Ensure nvm is loaded
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

  # Install specific Node.js version
  nvm install 16.20.2
  nvm use 16.20.2

  # Verify Node.js installation
  installed_node_version=$(node -v)
  if [ "$installed_node_version" = "v16.20.2" ]; then
      echo "Successfully installed Node.js version: $installed_node_version"
  else
      echo "Node.js installation failed. Current version: $installed_node_version"
      exit 1
  fi

  # Verify npm installation
  npm_version=$(npm -v)
  echo "npm version: $npm_version"

  # Install Grunt CLI globally
  echo "Installing Grunt CLI globally..."
  npm install -g grunt-cli

  # Verify Grunt CLI installation
  grunt_version=$(grunt --version)
  echo "Grunt CLI version: $grunt_version"

  echo "All installations completed successfully!"

  # Add note about shell restart
  echo "Note: Please restart your terminal or run 'source ~/.bashrc' (Linux) or 'source ~/.zshrc' (macOS) to use nvm"