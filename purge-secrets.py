#!/usr/bin/env python3
"""
Script to purge hardcoded secrets from Git history
This will completely remove the exposed API keys from all commits
"""

import subprocess
import sys
import os

# The exposed secrets that need to be purged
SECRETS_TO_PURGE = [
    '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',
    'alcht_4VtVtdF68sMtNaLupR7oPQ1wDSFNc4',
    'd714f7e6-91a5-47ac-866e-f28f26eee302'
]

def run_command(cmd, check=True):
    """Run a shell command and return the result"""
    print(f"Running: {cmd}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=check)
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr)
        return result
    except subprocess.CalledProcessError as e:
        print(f"Command failed: {e}")
        if not check:
            return e
        sys.exit(1)

def main():
    print("🔒 PURGING SECRETS FROM GIT HISTORY")
    print("=" * 50)
    
    # Check if we're in a git repository
    if not os.path.exists('.git'):
        print("❌ Not in a Git repository!")
        sys.exit(1)
    
    # Create a backup branch first
    print("📦 Creating backup branch...")
    run_command("git branch backup-before-secret-purge")
    
    # Use git filter-repo to replace secrets with placeholder text
    print("🧹 Purging secrets from history...")
    
    for i, secret in enumerate(SECRETS_TO_PURGE):
        placeholder = f"[REDACTED_API_KEY_{i+1}]"
        cmd = f'python -m git_filter_repo --replace-text <(echo "{secret}==>{placeholder}")'
        
        # For Windows, we need to handle this differently
        # Create a temporary file with the replacement
        temp_file = f"temp_replace_{i}.txt"
        with open(temp_file, 'w') as f:
            f.write(f"{secret}==>{placeholder}")
        
        try:
            run_command(f'python -m git_filter_repo --replace-text {temp_file}')
        finally:
            # Clean up temp file
            if os.path.exists(temp_file):
                os.remove(temp_file)
    
    print("✅ Secrets have been purged from Git history!")
    print("\n🚨 IMPORTANT NEXT STEPS:")
    print("1. Revoke and regenerate all exposed API keys immediately")
    print("2. Update your deployment environment variables")
    print("3. Force push to remote repository (this will rewrite history)")
    print("4. Notify team members to re-clone the repository")
    
    print("\nTo force push (DESTRUCTIVE - rewrites remote history):")
    print("git push --force-with-lease origin main")

if __name__ == "__main__":
    main()
