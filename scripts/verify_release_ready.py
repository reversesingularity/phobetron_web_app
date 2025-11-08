#!/usr/bin/env python3
"""
Pre-Release Verification Script
Checks if Phobetron is ready for Zenodo submission and v1.0.0 release

Run: python scripts/verify_release_ready.py
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple

# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text: str):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text.center(70)}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.RESET}\n")

def print_check(passed: bool, message: str, details: str = ""):
    symbol = f"{Colors.GREEN}✓{Colors.RESET}" if passed else f"{Colors.RED}✗{Colors.RESET}"
    print(f"{symbol} {message}")
    if details and not passed:
        print(f"  {Colors.YELLOW}→ {details}{Colors.RESET}")

def check_file_exists(filepath: Path) -> Tuple[bool, str]:
    """Check if required file exists"""
    exists = filepath.exists()
    return exists, "Found" if exists else "Not found"

def check_git_status() -> Tuple[bool, str]:
    """Check if git repo is clean"""
    try:
        result = subprocess.run(
            ['git', 'status', '--porcelain'],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent
        )
        is_clean = len(result.stdout.strip()) == 0
        return is_clean, "All changes committed" if is_clean else "Uncommitted changes found"
    except Exception as e:
        return False, f"Error checking git: {str(e)}"

def check_citation_cff(filepath: Path) -> Tuple[bool, str]:
    """Check CITATION.cff validity"""
    if not filepath.exists():
        return False, "CITATION.cff not found"
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    issues = []
    
    # Check for placeholder DOI
    if 'zenodo.XXXXXXX' in content:
        issues.append("Remove DOI placeholder before submission")
    
    # Check for required fields
    required = ['cff-version', 'title', 'authors', 'license', 'version']
    for field in required:
        if field not in content:
            issues.append(f"Missing required field: {field}")
    
    # Check for example URLs
    if 'example.com' in content:
        issues.append("Replace example.com URLs")
    
    if issues:
        return False, "; ".join(issues)
    return True, "Valid CFF format"

def check_readme(filepath: Path) -> Tuple[bool, str]:
    """Check README completeness"""
    if not filepath.exists():
        return False, "README.md not found"
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read().lower()
    
    required_sections = [
        ('installation', 'Installation section'),
        ('usage', 'Usage section'),
        ('license', 'License section'),
    ]
    
    missing = [name for keyword, name in required_sections if keyword not in content]
    
    if missing:
        return False, f"Missing: {', '.join(missing)}"
    return True, "Complete documentation"

def check_docker_builds() -> Tuple[bool, str]:
    """Check if Docker configuration exists"""
    docker_compose = Path("docker/docker-compose.yml")
    dockerfile_backend = Path("backend/Dockerfile")
    dockerfile_frontend = Path("frontend/Dockerfile")
    
    files_exist = [
        docker_compose.exists(),
        dockerfile_backend.exists(),
        dockerfile_frontend.exists()
    ]
    
    if all(files_exist):
        return True, "Docker configuration complete"
    missing = []
    if not docker_compose.exists():
        missing.append("docker-compose.yml")
    if not dockerfile_backend.exists():
        missing.append("backend/Dockerfile")
    if not dockerfile_frontend.exists():
        missing.append("frontend/Dockerfile")
    
    return False, f"Missing: {', '.join(missing)}"

def check_sensitive_data() -> Tuple[bool, str]:
    """Check for potential sensitive data"""
    sensitive_patterns = [
        'password',
        'secret',
        'api_key',
        'private_key',
        'token',
    ]
    
    # Check .env files aren't tracked
    gitignore = Path(".gitignore")
    if gitignore.exists():
        with open(gitignore, 'r') as f:
            gitignore_content = f.read()
        
        if '.env' not in gitignore_content:
            return False, ".env should be in .gitignore"
    
    return True, "No obvious sensitive data issues"

def check_dependencies() -> Tuple[bool, str]:
    """Check if dependency files exist"""
    backend_req = Path("backend/requirements.txt")
    frontend_pkg = Path("frontend/package.json")
    
    if backend_req.exists() and frontend_pkg.exists():
        return True, "Dependency files present"
    
    missing = []
    if not backend_req.exists():
        missing.append("backend/requirements.txt")
    if not frontend_pkg.exists():
        missing.append("frontend/package.json")
    
    return False, f"Missing: {', '.join(missing)}"

def check_license() -> Tuple[bool, str]:
    """Check if LICENSE file exists"""
    license_file = Path("LICENSE")
    
    if not license_file.exists():
        return False, "LICENSE file not found"
    
    with open(license_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'MIT License' in content:
        return True, "MIT License present"
    return True, "License file present"

def check_database_migrations() -> Tuple[bool, str]:
    """Check if database migrations exist"""
    migrations_dir = Path("backend/alembic/versions")
    
    if not migrations_dir.exists():
        return False, "Migrations directory not found"
    
    migrations = list(migrations_dir.glob("*.py"))
    migrations = [m for m in migrations if not m.name.startswith('__')]
    
    if len(migrations) > 0:
        return True, f"{len(migrations)} migrations found"
    return False, "No migrations found"

def check_documentation_files() -> Tuple[bool, str]:
    """Check for essential documentation"""
    docs_dir = Path("docs")
    
    if not docs_dir.exists():
        return False, "docs/ directory not found"
    
    important_docs = [
        "README_START_HERE.md",
        "DATABASE_SCHEMA_COMPLETE.md",
        "DOCKER_DEPLOYMENT_COMPLETE.md",
    ]
    
    existing = [doc for doc in important_docs if (docs_dir / doc).exists()]
    
    if len(existing) >= 2:
        return True, f"{len(existing)}/{len(important_docs)} key docs present"
    return False, f"Only {len(existing)}/{len(important_docs)} key docs found"

def main():
    """Run all verification checks"""
    print_header("PHOBETRON v1.0.0 RELEASE READINESS CHECK")
    
    root_dir = Path(__file__).parent.parent
    os.chdir(root_dir)
    
    checks = []
    
    # Essential Files
    print(f"\n{Colors.BOLD}📁 Essential Files{Colors.RESET}")
    passed, msg = check_file_exists(Path("README.md"))
    print_check(passed, "README.md exists", msg if not passed else "")
    checks.append(passed)
    
    passed, msg = check_readme(Path("README.md"))
    print_check(passed, "README.md complete", msg)
    checks.append(passed)
    
    passed, msg = check_license()
    print_check(passed, "LICENSE file", msg)
    checks.append(passed)
    
    passed, msg = check_file_exists(Path("CITATION.cff"))
    print_check(passed, "CITATION.cff exists", msg if not passed else "")
    checks.append(passed)
    
    passed, msg = check_citation_cff(Path("CITATION.cff"))
    print_check(passed, "CITATION.cff valid", msg)
    checks.append(passed)
    
    # Git Repository
    print(f"\n{Colors.BOLD}📦 Git Repository{Colors.RESET}")
    passed, msg = check_git_status()
    print_check(passed, "Git status clean", msg)
    checks.append(passed)
    
    # Dependencies
    print(f"\n{Colors.BOLD}🔧 Dependencies{Colors.RESET}")
    passed, msg = check_dependencies()
    print_check(passed, "Dependency files", msg)
    checks.append(passed)
    
    # Docker
    print(f"\n{Colors.BOLD}🐳 Docker Configuration{Colors.RESET}")
    passed, msg = check_docker_builds()
    print_check(passed, "Docker files", msg)
    checks.append(passed)
    
    # Database
    print(f"\n{Colors.BOLD}🗄️  Database{Colors.RESET}")
    passed, msg = check_database_migrations()
    print_check(passed, "Database migrations", msg)
    checks.append(passed)
    
    # Documentation
    print(f"\n{Colors.BOLD}📚 Documentation{Colors.RESET}")
    passed, msg = check_documentation_files()
    print_check(passed, "Documentation files", msg)
    checks.append(passed)
    
    # Security
    print(f"\n{Colors.BOLD}🔒 Security{Colors.RESET}")
    passed, msg = check_sensitive_data()
    print_check(passed, "Sensitive data check", msg)
    checks.append(passed)
    
    # Summary
    print_header("SUMMARY")
    
    total = len(checks)
    passed_count = sum(checks)
    percentage = (passed_count / total) * 100
    
    print(f"Checks passed: {passed_count}/{total} ({percentage:.1f}%)\n")
    
    if percentage == 100:
        print(f"{Colors.GREEN}{Colors.BOLD}✓ READY FOR RELEASE!{Colors.RESET}")
        print(f"\nNext steps:")
        print(f"  1. Review ZENODO_SUBMISSION_GUIDE.md")
        print(f"  2. Create git tag: git tag -a v1.0.0 -m 'Initial stable release'")
        print(f"  3. Push tag: git push origin v1.0.0")
        print(f"  4. Create GitHub release")
        print(f"  5. Wait for Zenodo DOI assignment")
        return 0
    elif percentage >= 80:
        print(f"{Colors.YELLOW}{Colors.BOLD}⚠ ALMOST READY{Colors.RESET}")
        print(f"\nFix the failing checks above before releasing.")
        return 1
    else:
        print(f"{Colors.RED}{Colors.BOLD}✗ NOT READY FOR RELEASE{Colors.RESET}")
        print(f"\nSignificant issues need to be resolved.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
