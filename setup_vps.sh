#!/bin/bash

# Bel Energy Portal - VPS Initial Setup
# This script sets up SSH keys and basic configuration

set -e

VPS_IP="203.161.62.94"
VPS_USER="root"
VPS_PASSWORD="UgXlqW29bR5Js6nV47"

echo "🔑 Setting up SSH key authentication..."

# Copy SSH public key to VPS
ssh-copy-id -i ~/.ssh/bel_energy_vps.pub root@$VPS_IP

echo "✅ SSH key authentication configured!"
echo ""
echo "🔧 Now you can run the main deployment script:"
echo "   ./deploy.sh"
echo ""
echo "Or run individual commands manually on the VPS:"
echo "   ssh -i ~/.ssh/bel_energy_vps root@$VPS_IP"