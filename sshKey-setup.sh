#!/bin/bash

# Check if a key is provided
if [ -z "$1" ]; then
  echo "Usage: bash ssh.sh '<private_key>'"
  exit 1
fi

# Define SSH directory and key file
SSH_DIR="$HOME/.ssh"
KEY_FILE="$SSH_DIR/gitlab_key"
KNOWN_HOSTS_FILE="$SSH_DIR/known_hosts"
GITLAB_HOST="gitlab.com"

# Create SSH directory if it doesn't exist
mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

# Save the provided SSH key to a file
echo "$1" > "$KEY_FILE"
chmod 600 "$KEY_FILE"

# Add GitLab to known hosts if not already added
if ! grep -q "$GITLAB_HOST" "$KNOWN_HOSTS_FILE" 2>/dev/null; then
  ssh-keyscan "$GITLAB_HOST" >> "$KNOWN_HOSTS_FILE"
  chmod 644 "$KNOWN_HOSTS_FILE"
fi

# Start SSH agent
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  eval "$(ssh-agent -s)"
  ssh-add --apple-use-keychain "$KEY_FILE"
else
  # Linux
  eval "$(ssh-agent -s)"
  ssh-add "$KEY_FILE"
fi

# Configure Git to use this key
export GIT_SSH_COMMAND="ssh -i $KEY_FILE"

echo "✅ SSH key setup completed!"
echo "🔗 You can now pull/push from GitLab without a password."

# Test SSH connection
ssh -T git@$GITLAB_HOST
