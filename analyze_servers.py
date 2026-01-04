#!/usr/bin/env python3
"""
Analyze HiAnime server switching mechanism
Extract information about HD-1, HD-2, and other video sources
"""

import sys
import re
from urllib.request import Request, urlopen
from html.parser import HTMLParser


def fetch_page(url):
    """Fetch HTML content from URL"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/142.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }

    try:
        req = Request(url, headers=headers)
        with urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
            return html
    except Exception as e:
        print(f"Error fetching page: {e}", file=sys.stderr)
        return None


def analyze_server_elements(html):
    """Find all server-related elements and scripts"""

    print("=" * 80)
    print("SERVER-RELATED HTML ELEMENTS")
    print("=" * 80)

    # Find server containers
    server_divs = re.findall(r'<div[^>]*(?:server|player-server)[^>]*>.*?</div>', html, re.DOTALL | re.IGNORECASE)
    print(f"\n{len(server_divs)} server-related div elements found\n")

    # Find buttons with server/source info
    buttons = re.findall(r'<(?:button|a)[^>]*(?:data-(?:id|server|type|link-id)|server|hd-\d)[^>]*>.*?</(?:button|a)>', html, re.DOTALL | re.IGNORECASE)
    print(f"\nServer/Source Buttons ({len(buttons)} found):")
    print("-" * 80)
    for i, btn in enumerate(buttons[:20], 1):  # Limit to first 20
        # Clean up for display
        cleaned = re.sub(r'\s+', ' ', btn).strip()
        if len(cleaned) > 200:
            cleaned = cleaned[:200] + "..."
        print(f"{i}. {cleaned}\n")

    print("\n" + "=" * 80)
    print("JAVASCRIPT CODE (Server Loading)")
    print("=" * 80)

    # Find scripts that mention servers, episodes, or iframe loading
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)

    relevant_scripts = []
    for script in scripts:
        if any(keyword in script.lower() for keyword in [
            'server', 'iframe', 'episode', 'loadserver', 'player',
            'hd-1', 'hd-2', 'data-id', 'embed'
        ]):
            relevant_scripts.append(script)

    print(f"\n{len(relevant_scripts)} relevant scripts found\n")

    for i, script in enumerate(relevant_scripts[:5], 1):  # Show first 5
        print(f"\n--- Script {i} ---")
        # Show first 800 chars of each relevant script
        preview = script[:800] if len(script) > 800 else script
        print(preview)
        if len(script) > 800:
            print("\n... (truncated)")
        print()

    print("\n" + "=" * 80)
    print("DATA ATTRIBUTES ANALYSIS")
    print("=" * 80)

    # Find all data-* attributes
    data_attrs = re.findall(r'data-[\w-]+=["\']([^"\']*)["\']', html)
    unique_data_attrs = {}
    for attr_value in data_attrs:
        # Categorize by content
        if 'server' in attr_value.lower() or 'hd' in attr_value.lower():
            key = 'server_related'
        elif 'episode' in attr_value.lower() or 'ep' in attr_value.lower():
            key = 'episode_related'
        elif attr_value.isdigit():
            key = 'numeric_ids'
        else:
            continue

        if key not in unique_data_attrs:
            unique_data_attrs[key] = []
        if attr_value not in unique_data_attrs[key]:
            unique_data_attrs[key].append(attr_value)

    for category, values in unique_data_attrs.items():
        print(f"\n{category.upper()}:")
        for val in values[:10]:  # Show first 10 of each category
            print(f"  - {val}")

    print("\n" + "=" * 80)
    print("IFRAME ANALYSIS")
    print("=" * 80)

    iframes = re.findall(r'<iframe[^>]*>.*?</iframe>', html, re.DOTALL | re.IGNORECASE)
    print(f"\n{len(iframes)} iframe(s) found:")
    for i, iframe in enumerate(iframes, 1):
        cleaned = re.sub(r'\s+', ' ', iframe).strip()
        print(f"\n{i}. {cleaned}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python analyze_servers.py <url>")
        print("\nExample:")
        print("  python analyze_servers.py https://hianime.to/watch/memories-936?ep=15804")
        sys.exit(1)

    url = sys.argv[1]

    print(f"Fetching: {url}\n")
    html = fetch_page(url)

    if html is None:
        print("Failed to fetch page")
        sys.exit(1)

    print(f"Fetched {len(html):,} characters\n")
    analyze_server_elements(html)


if __name__ == '__main__':
    main()
