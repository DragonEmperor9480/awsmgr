#!/bin/bash

# Define installation paths
INSTALL_DIR="/usr/local/bin/awsmgr"
EXECUTABLE="$INSTALL_DIR/awsmgr"

# Remove existing installation if it exists
sudo rm -rf "$INSTALL_DIR"

# Create the application directory
sudo mkdir -p "$INSTALL_DIR"

# Copy all project files
sudo cp -r ./* "$INSTALL_DIR"

# Ensure the main directory files are executable
sudo chmod -R +x "$INSTALL_DIR"

cd

echo "
export AWSSCRIPT="/usr/local/bin/awsmgr/awsmgr"

awsmgr() {
    cd /usr/local/bin/awsmgr || return 1
    bash "./awsmgr" "$@"
}" >> .bashrc

echo "Installation complete. You can now run 'awsmgr' from anywhere."
