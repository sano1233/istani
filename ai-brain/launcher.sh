#!/bin/bash
# Automated Code Fixer/Resolver/Merger Launcher
# Quick access to all system components

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print header
print_header() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  🤖 Automated Code Fixer/Resolver/Merger${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Print menu
print_menu() {
    echo -e "${GREEN}Available Commands:${NC}"
    echo ""
    echo -e "  ${YELLOW}1${NC}) 🔧 Run Code Fixer       - Fix code quality issues"
    echo -e "  ${YELLOW}2${NC}) 🔀 Resolve Conflicts    - Resolve merge conflicts"
    echo -e "  ${YELLOW}3${NC}) 🤖 Process PR           - Review and merge PR"
    echo -e "  ${YELLOW}4${NC}) 📊 Validate System      - Check system health"
    echo -e "  ${YELLOW}5${NC}) 🔍 Analyze Branches     - Analyze all branches"
    echo -e "  ${YELLOW}6${NC}) 📦 Process All PRs      - Batch process all open PRs"
    echo -e "  ${YELLOW}7${NC}) 📖 View Documentation   - Open guide"
    echo -e "  ${YELLOW}8${NC}) ❌ Exit"
    echo ""
}

# Code Fixer menu
code_fixer_menu() {
    print_header
    echo -e "${GREEN}🔧 Automated Code Fixer${NC}"
    echo ""
    echo -e "  ${YELLOW}1${NC}) Fix all files"
    echo -e "  ${YELLOW}2${NC}) Fix specific file"
    echo -e "  ${YELLOW}3${NC}) Check only (no fixes)"
    echo -e "  ${YELLOW}4${NC}) Fix and commit"
    echo -e "  ${YELLOW}5${NC}) Back to main menu"
    echo ""
    read -p "Choose option: " choice
    
    case $choice in
        1)
            echo -e "${CYAN}Running code fixer on all files...${NC}"
            node "$SCRIPT_DIR/automated-code-fixer.js"
            ;;
        2)
            read -p "Enter file path: " filepath
            echo -e "${CYAN}Fixing $filepath...${NC}"
            node "$SCRIPT_DIR/automated-code-fixer.js" --file "$filepath"
            ;;
        3)
            echo -e "${CYAN}Running check-only mode...${NC}"
            node "$SCRIPT_DIR/automated-code-fixer.js" --check-only
            ;;
        4)
            echo -e "${CYAN}Fixing and committing...${NC}"
            node "$SCRIPT_DIR/automated-code-fixer.js" --commit
            ;;
        5)
            return
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
}

# Conflict Resolver menu
conflict_resolver_menu() {
    print_header
    echo -e "${GREEN}🔀 Intelligent Conflict Resolver${NC}"
    echo ""
    echo -e "  ${YELLOW}1${NC}) Resolve PR conflicts"
    echo -e "  ${YELLOW}2${NC}) Resolve branch conflicts"
    echo -e "  ${YELLOW}3${NC}) Resolve specific file"
    echo -e "  ${YELLOW}4${NC}) Back to main menu"
    echo ""
    read -p "Choose option: " choice
    
    case $choice in
        1)
            read -p "Enter PR number: " pr_number
            echo -e "${CYAN}Resolving conflicts in PR #$pr_number...${NC}"
            node "$SCRIPT_DIR/intelligent-conflict-resolver.js" --pr "$pr_number" --commit
            ;;
        2)
            read -p "Enter branch name: " branch_name
            echo -e "${CYAN}Resolving conflicts in branch $branch_name...${NC}"
            node "$SCRIPT_DIR/intelligent-conflict-resolver.js" --branch "$branch_name" --commit
            ;;
        3)
            read -p "Enter file path: " filepath
            read -p "Strategy (auto/ai/theirs/ours): " strategy
            echo -e "${CYAN}Resolving conflict in $filepath...${NC}"
            node "$SCRIPT_DIR/intelligent-conflict-resolver.js" --file "$filepath" --strategy "${strategy:-auto}"
            ;;
        4)
            return
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
}

# PR Merger menu
pr_merger_menu() {
    print_header
    echo -e "${GREEN}🤖 Automated PR Merger${NC}"
    echo ""
    echo -e "  ${YELLOW}1${NC}) Process specific PR"
    echo -e "  ${YELLOW}2${NC}) Process with auto-fix"
    echo -e "  ${YELLOW}3${NC}) Require 3/3 approvals"
    echo -e "  ${YELLOW}4${NC}) Back to main menu"
    echo ""
    read -p "Choose option: " choice
    
    case $choice in
        1)
            read -p "Enter PR number: " pr_number
            echo -e "${CYAN}Processing PR #$pr_number...${NC}"
            node "$SCRIPT_DIR/automated-merger.js" --pr "$pr_number"
            ;;
        2)
            read -p "Enter PR number: " pr_number
            echo -e "${CYAN}Processing PR #$pr_number with auto-fix...${NC}"
            node "$SCRIPT_DIR/automated-merger.js" --pr "$pr_number" --auto-fix
            ;;
        3)
            read -p "Enter PR number: " pr_number
            echo -e "${CYAN}Processing PR #$pr_number (require 3/3)...${NC}"
            node "$SCRIPT_DIR/automated-merger.js" --pr "$pr_number" --require 3
            ;;
        4)
            return
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
}

# Main loop
main() {
    while true; do
        clear
        print_header
        print_menu
        
        read -p "Choose option (1-8): " choice
        
        case $choice in
            1)
                code_fixer_menu
                ;;
            2)
                conflict_resolver_menu
                ;;
            3)
                pr_merger_menu
                ;;
            4)
                clear
                print_header
                echo -e "${CYAN}Running system validation...${NC}"
                echo ""
                node "$SCRIPT_DIR/system-validator.js" --full
                echo ""
                read -p "Press Enter to continue..."
                ;;
            5)
                clear
                print_header
                echo -e "${CYAN}Analyzing branches...${NC}"
                echo ""
                node "$SCRIPT_DIR/pr-analyzer.js" --analyze
                echo ""
                read -p "Press Enter to continue..."
                ;;
            6)
                clear
                print_header
                echo -e "${CYAN}Processing all open PRs...${NC}"
                read -p "Enable auto-fix? (y/n): " autofix
                echo ""
                if [[ "$autofix" == "y" ]]; then
                    node "$SCRIPT_DIR/automated-merger.js" --all --auto-fix
                else
                    node "$SCRIPT_DIR/automated-merger.js" --all
                fi
                echo ""
                read -p "Press Enter to continue..."
                ;;
            7)
                if command -v less &> /dev/null; then
                    less "$SCRIPT_DIR/../AUTOMATED-CODE-RESOLVER-MERGER-GUIDE.md"
                else
                    cat "$SCRIPT_DIR/../AUTOMATED-CODE-RESOLVER-MERGER-GUIDE.md"
                fi
                ;;
            8)
                echo -e "${GREEN}Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option. Please choose 1-8.${NC}"
                sleep 2
                ;;
        esac
    done
}

# Run main
main
