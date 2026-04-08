#!/usr/bin/env python3
"""
ScrollVerse Sovereign Deployment Skill
Secret Generator Script

Generates all cryptographic secrets needed for a fresh deployment.
Usage: python generate_secrets.py [--output .env]
"""

import secrets
import base64
import argparse
import os
import sys
from datetime import datetime


def generate_hex(length_bytes: int) -> str:
    return secrets.token_hex(length_bytes)


def generate_urlsafe(length_bytes: int) -> str:
    return secrets.token_urlsafe(length_bytes)


def generate_all_secrets() -> dict:
    return {
        "JWT_SECRET": generate_hex(64),
        "JWT_REFRESH_SECRET": generate_hex(64),
        "DB_PASSWORD": generate_urlsafe(24),
        "DB_ROOT_PASSWORD": generate_urlsafe(24),
        "REDIS_PASSWORD": generate_urlsafe(20),
        "ENCRYPTION_KEY": generate_hex(32),
    }


def inject_into_env(env_path: str, secrets_dict: dict) -> None:
    """Read .env, replace FILL_IN placeholders with generated secrets."""
    if not os.path.exists(env_path):
        print(f"[ERROR] .env file not found at: {env_path}")
        sys.exit(1)

    with open(env_path, "r") as f:
        content = f.read()

    replaced = 0
    for key, value in secrets_dict.items():
        placeholder_patterns = [
            f"{key}=FILL_IN",
            f"{key}=your_",
            f"{key}=<",
        ]
        for pattern in placeholder_patterns:
            if pattern in content:
                # Find the full line and replace value
                lines = content.split("\n")
                new_lines = []
                for line in lines:
                    if line.startswith(f"{key}=") and any(
                        p.split("=")[1] in line for p in placeholder_patterns
                    ):
                        new_lines.append(f"{key}={value}")
                        replaced += 1
                    else:
                        new_lines.append(line)
                content = "\n".join(new_lines)
                break

    with open(env_path, "w") as f:
        f.write(content)

    print(f"[✅] Injected {replaced} secrets into {env_path}")


def print_secrets(secrets_dict: dict) -> None:
    print("\n" + "=" * 60)
    print("  SCROLLVERSE GENERATED SECRETS")
    print(f"  Generated: {datetime.utcnow().isoformat()}Z")
    print("=" * 60)
    for key, value in secrets_dict.items():
        print(f"  {key}={value}")
    print("=" * 60)
    print("  ⚠️  Store these securely. Never commit to git.")
    print("=" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Generate cryptographic secrets for ScrollVerse deployment"
    )
    parser.add_argument(
        "--output",
        "-o",
        help="Path to .env file to inject secrets into",
        default=None,
    )
    parser.add_argument(
        "--print",
        "-p",
        action="store_true",
        help="Print secrets to stdout (default if no --output)",
        default=False,
    )
    args = parser.parse_args()

    secrets_dict = generate_all_secrets()

    if args.output:
        inject_into_env(args.output, secrets_dict)
    else:
        print_secrets(secrets_dict)


if __name__ == "__main__":
    main()
