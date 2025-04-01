#!/bin/bash

# AWSMGR Installation Script
# This script installs the AWS CLI Manager tool

# ANSI color codes for better output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}${BOLD}"
echo "┌───────────────────────────────────┐"
echo "│         AWS CLI MANAGER           │"
echo "│           INSTALLATION            │"
echo "└───────────────────────────────────┘"
echo -e "${NC}"

# Define installation paths
INSTALL_DIR="/usr/local/bin/awsmgr"
EXECUTABLE="$INSTALL_DIR/awsmgr"
RC_FILE="$HOME/.bashrc"
ZSH_RC_FILE="$HOME/.zshrc"
FISH_CONFIG_DIR="$HOME/.config/fish"
FISH_CONFIG_FILE="$FISH_CONFIG_DIR/config.fish"

# Detect current shell
CURRENT_SHELL=$(basename "$SHELL")
echo -e "${YELLOW}Detected shell: ${BOLD}$CURRENT_SHELL${NC}"

# Check if AWS CLI is installed
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command -v aws &> /dev/null; then
    echo -e "${RED}[ERROR] AWS CLI is not installed or not in PATH${NC}"
    echo -e "${YELLOW}Please install AWS CLI before installing AWSMGR:${NC}"
    echo -e "    https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    echo -e "After installing AWS CLI, run this script again."
    exit 1
fi
echo -e "${GREEN}[✓] AWS CLI found${NC}"

# Confirm installation
echo -e "${YELLOW}This will install AWSMGR to $INSTALL_DIR${NC}"
read -p "Do you want to continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Installation cancelled.${NC}"
    exit 0
fi

# Remove existing installation if it exists
echo -e "${YELLOW}Removing any existing installation...${NC}"
if [ -d "$INSTALL_DIR" ]; then
    sudo rm -rf "$INSTALL_DIR" || { echo -e "${RED}[ERROR] Failed to remove existing installation${NC}"; exit 1; }
    echo -e "${GREEN}[✓] Previous installation removed${NC}"
else
    echo -e "${GREEN}[✓] No previous installation found${NC}"
fi

# Create the application directory
echo -e "${YELLOW}Creating installation directory...${NC}"
sudo mkdir -p "$INSTALL_DIR" || { echo -e "${RED}[ERROR] Failed to create installation directory${NC}"; exit 1; }
echo -e "${GREEN}[✓] Installation directory created${NC}"

# Copy all project files
echo -e "${YELLOW}Copying files...${NC}"
sudo cp -r ./* "$INSTALL_DIR" || { echo -e "${RED}[ERROR] Failed to copy project files${NC}"; exit 1; }
echo -e "${GREEN}[✓] Files copied successfully${NC}"

# Ensure the main directory files are executable
echo -e "${YELLOW}Setting permissions...${NC}"
sudo chmod -R +x "$INSTALL_DIR" || { echo -e "${RED}[ERROR] Failed to set permissions${NC}"; exit 1; }
echo -e "${GREEN}[✓] Permissions set${NC}"

# Add to shell configuration
echo -e "${YELLOW}Updating shell configuration...${NC}"

# Function to add to bash/zsh profile
add_to_profile() {
    local profile="$1"
    if [ -f "$profile" ]; then
        if ! grep -q "export AWSSCRIPT=" "$profile"; then
            echo "" >> "$profile"
            echo "# AWS CLI Manager" >> "$profile"
            echo "export AWSSCRIPT=\"$EXECUTABLE\"" >> "$profile"
            echo "" >> "$profile"
            echo "awsmgr() {" >> "$profile"
            echo "    cd \"$INSTALL_DIR\" || return 1" >> "$profile"
            echo "    bash \"./awsmgr\" \"\$@\"" >> "$profile"
            echo "}" >> "$profile"
            echo -e "${GREEN}[✓] Added to $profile${NC}"
            return 0
        else
            echo -e "${GREEN}[✓] Already configured in $profile${NC}"
            return 0
        fi
    fi
    return 1
}

# Function to add to fish shell config
add_to_fish_config() {
    if [ -d "$FISH_CONFIG_DIR" ]; then
        if [ ! -f "$FISH_CONFIG_FILE" ]; then
            mkdir -p "$FISH_CONFIG_DIR"
            touch "$FISH_CONFIG_FILE"
        fi
        
        if ! grep -q "set -gx AWSSCRIPT" "$FISH_CONFIG_FILE"; then
            echo "" >> "$FISH_CONFIG_FILE"
            echo "# AWS CLI Manager" >> "$FISH_CONFIG_FILE"
            echo "set -gx AWSSCRIPT \"$EXECUTABLE\"" >> "$FISH_CONFIG_FILE"
            echo "" >> "$FISH_CONFIG_FILE"
            echo "function awsmgr" >> "$FISH_CONFIG_FILE"
            echo "    cd \"$INSTALL_DIR\"; or return 1" >> "$FISH_CONFIG_FILE"
            echo "    bash \"./awsmgr\" \$argv" >> "$FISH_CONFIG_FILE"
            echo "end" >> "$FISH_CONFIG_FILE"
            echo -e "${GREEN}[✓] Added to fish config${NC}"
            return 0
        else
            echo -e "${GREEN}[✓] Already configured in fish config${NC}"
            return 0
        fi
    fi
    return 1
}

shell_updated=false

# Install based on detected shell
case "$CURRENT_SHELL" in
    bash)
        if add_to_profile "$RC_FILE"; then
            shell_updated=true
            echo -e "${GREEN}[✓] Configuration added to your bash profile${NC}"
        fi
        ;;
    zsh)
        if add_to_profile "$ZSH_RC_FILE"; then
            shell_updated=true
            echo -e "${GREEN}[✓] Configuration added to your zsh profile${NC}"
        fi
        ;;
    fish)
        if add_to_fish_config; then
            shell_updated=true
            echo -e "${GREEN}[✓] Configuration added to your fish config${NC}"
        fi
        ;;
    *)
        echo -e "${YELLOW}[!] Unrecognized shell: $CURRENT_SHELL${NC}"
        echo -e "${YELLOW}[!] Will attempt to configure for common shells${NC}"
        ;;
esac

# If current shell config failed or was unknown, try other common shells
if [ "$shell_updated" != "true" ]; then
    # Try bash if not already tried
    if [ "$CURRENT_SHELL" != "bash" ] && add_to_profile "$RC_FILE"; then
        shell_updated=true
    fi
    
    # Try zsh if not already tried
    if [ "$CURRENT_SHELL" != "zsh" ] && add_to_profile "$ZSH_RC_FILE"; then
        shell_updated=true
    fi
    
    # Try fish if not already tried
    if [ "$CURRENT_SHELL" != "fish" ] && add_to_fish_config; then
        shell_updated=true
    fi
fi

# If no shell was configured, show manual instructions
if [ "$shell_updated" != "true" ]; then
    echo -e "${YELLOW}[WARNING] Could not find or update shell configuration.${NC}"
    echo -e "Please add the following to your shell profile manually:"
    echo ""
    echo -e "${BOLD}For Bash/Zsh:${NC}"
    echo "export AWSSCRIPT=\"$EXECUTABLE\""
    echo ""
    echo "awsmgr() {"
    echo "    cd \"$INSTALL_DIR\" || return 1"
    echo "    bash \"./awsmgr\" \"\$@\""
    echo "}"
    echo ""
    echo -e "${BOLD}For Fish:${NC}"
    echo "set -gx AWSSCRIPT \"$EXECUTABLE\""
    echo ""
    echo "function awsmgr"
    echo "    cd \"$INSTALL_DIR\"; or return 1"
    echo "    bash \"./awsmgr\" \$argv"
    echo "end"
fi

# Final instructions
echo -e "\n${GREEN}${BOLD}Installation complete!${NC}"
echo -e "${YELLOW}────────────────────────────────────────────────${NC}"
echo -e "To start using AWSMGR:"

case "$CURRENT_SHELL" in
    bash)
        echo -e "${BOLD}1.${NC} Restart your terminal or run: ${BOLD}source ~/.bashrc${NC}"
        ;;
    zsh)
        echo -e "${BOLD}1.${NC} Restart your terminal or run: ${BOLD}source ~/.zshrc${NC}"
        ;;
    fish)
        echo -e "${BOLD}1.${NC} Restart your terminal or run: ${BOLD}source ~/.config/fish/config.fish${NC}"
        ;;
    *)
        echo -e "${BOLD}1.${NC} Restart your terminal or source your shell configuration file"
        ;;
esac

echo -e "${BOLD}2.${NC} Run ${BOLD}awsmgr${NC} to start using the tool"
echo ""
echo -e "${BLUE}Note:${NC} AWSMGR requires AWS CLI to be installed and configured."
echo -e "If you haven't configured AWS CLI yet, run: ${BOLD}aws configure${NC}"
echo -e "${YELLOW}────────────────────────────────────────────────${NC}"
