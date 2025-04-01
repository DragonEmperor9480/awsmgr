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

# Spinner function
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local msg=$2
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf "\r${BLUE}${BOLD}[%c]${NC} ${msg}" "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
    done
    printf "\r${GREEN}[✓]${NC} ${msg}\n"
}

# Function to simulate work with progress
simulate_work() {
    local duration=$1
    sleep $duration
}

# Print banner with animation
print_banner() {
    clear
    echo -e "${BLUE}${BOLD}"
    echo "┌───────────────────────────────────┐"
    sleep 0.1
    echo "│         AWS CLI MANAGER           │"
    sleep 0.1
    echo "│           INSTALLATION            │"
    sleep 0.1
    echo "└───────────────────────────────────┘"
    echo -e "${NC}"
    sleep 0.5
}

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

print_banner

# Check if AWS CLI is installed
echo -e "${YELLOW}Checking prerequisites...${NC}"
(simulate_work 1) &
spinner $! "Checking for AWS CLI installation"
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

# Function to remove existing awsmgr configuration
remove_existing_config() {
    local profile="$1"
    if [ -f "$profile" ]; then
        # Remove existing awsmgr function and export
        sed -i '/# AWS CLI Manager/d' "$profile"
        sed -i '/export AWSSCRIPT=/d' "$profile"
        sed -i '/^awsmgr() {/,/^}/d' "$profile"
        echo -e "${GREEN}[✓] Removed existing configuration from $profile${NC}"
    fi
}

# Remove existing configurations before adding new ones
echo -e "${YELLOW}Checking for existing configurations...${NC}"

# Remove from bash profile
if [ -f "$RC_FILE" ]; then
    remove_existing_config "$RC_FILE"
fi

# Remove from zsh profile
if [ -f "$ZSH_RC_FILE" ]; then
    remove_existing_config "$ZSH_RC_FILE"
fi

# Remove from fish config
if [ -f "$FISH_CONFIG_FILE" ]; then
    sed -i '/# AWS CLI Manager/d' "$FISH_CONFIG_FILE"
    sed -i '/set -gx AWSSCRIPT/d' "$FISH_CONFIG_FILE"
    sed -i '/^function awsmgr/,/^end/d' "$FISH_CONFIG_FILE"
    echo -e "${GREEN}[✓] Removed existing configuration from fish config${NC}"
fi

# Remove existing installation if it exists
echo -e "${YELLOW}Removing any existing installation...${NC}"
if [ -d "$INSTALL_DIR" ]; then
    (sudo rm -rf "$INSTALL_DIR" && simulate_work 1) &
    spinner $! "Removing existing installation"
else
    echo -e "${GREEN}[✓] No previous installation found${NC}"
fi

# Create the application directory
echo -e "${YELLOW}Creating installation directory...${NC}"
(sudo mkdir -p "$INSTALL_DIR" && simulate_work 1) &
spinner $! "Creating installation directory"
echo -e "${GREEN}[✓] Installation directory created${NC}"

# Copy all project files
echo -e "${YELLOW}Copying files...${NC}"
(sudo cp -r ./* "$INSTALL_DIR" && simulate_work 1.5) &
spinner $! "Copying files to installation directory"
echo -e "${GREEN}[✓] Files copied successfully${NC}"

# Ensure the main directory files are executable
echo -e "${YELLOW}Setting permissions...${NC}"
(sudo chmod -R +x "$INSTALL_DIR" && simulate_work 1) &
spinner $! "Setting executable permissions"
echo -e "${GREEN}[✓] Permissions set${NC}"

# Function to add to shell profile
add_to_profile() {
    local profile="$1"
    if [ -f "$profile" ]; then
        if ! grep -q "export AWSSCRIPT=" "$profile"; then
            echo "" >> "$profile"
            echo "# AWS CLI Manager" >> "$profile"
            echo "export AWSSCRIPT=\"$EXECUTABLE\"" >> "$profile"
            echo "" >> "$profile"
            echo "awsmgr() {" >> "$profile"
            echo "    local current_dir=\"\$(pwd)\"" >> "$profile"
            echo "    if pushd \"$INSTALL_DIR\" > /dev/null 2>&1; then" >> "$profile"
            echo "        if [ -f \"./awsmgr\" ]; then" >> "$profile"
            echo "            bash \"./awsmgr\" \"\$@\"" >> "$profile"
            echo "            local exit_status=\$?" >> "$profile"
            echo "            popd > /dev/null 2>&1" >> "$profile"
            echo "            return \$exit_status" >> "$profile"
            echo "        else" >> "$profile"
            echo "            popd > /dev/null 2>&1" >> "$profile"
            echo "            echo \"Error: AWSMGR script not found\"" >> "$profile"
            echo "            return 1" >> "$profile"
            echo "        fi" >> "$profile"
            echo "    else" >> "$profile"
            echo "        echo \"Error: Could not access AWSMGR directory\"" >> "$profile"
            echo "        return 1" >> "$profile"
            echo "    fi" >> "$profile"
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
            echo "    set -l current_dir (pwd)" >> "$FISH_CONFIG_FILE"  # Store current directory
            echo "    cd \"$INSTALL_DIR\"; or return 1" >> "$FISH_CONFIG_FILE"
            echo "    bash \"./awsmgr\" \$argv" >> "$FISH_CONFIG_FILE"
            echo "    cd \$current_dir; or return 1" >> "$FISH_CONFIG_FILE"  # Return to original directory
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
    echo "    local current_dir=\$(pwd)"
    echo "    cd \"$INSTALL_DIR\" || return 1"
    echo "    bash \"./awsmgr\" \"\$@\""
    echo "    cd \"\$current_dir\" || return 1"
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

# Add a small delay before exiting
sleep 1
