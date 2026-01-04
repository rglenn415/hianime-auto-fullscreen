#!/usr/bin/env python3
"""
Fetch HiAnime page data for LLM analysis
This script retrieves HTML and analyzes the DOM structure of HiAnime pages
"""

import sys
import json
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from html.parser import HTMLParser


class VideoPlayerAnalyzer(HTMLParser):
    """Parse HTML and extract video player related elements"""

    def __init__(self):
        super().__init__()
        self.video_elements = []
        self.player_containers = []
        self.buttons = []
        self.iframes = []
        self.scripts = []
        self.current_tag_stack = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        self.current_tag_stack.append(tag)

        # Track video elements
        if tag == 'video':
            self.video_elements.append({
                'tag': tag,
                'attributes': attrs_dict,
                'depth': len(self.current_tag_stack)
            })

        # Track player containers
        if tag == 'div':
            class_attr = attrs_dict.get('class', '')
            id_attr = attrs_dict.get('id', '')
            if any(keyword in class_attr.lower() + id_attr.lower()
                   for keyword in ['player', 'video', 'plyr', 'jw']):
                self.player_containers.append({
                    'tag': tag,
                    'id': id_attr,
                    'class': class_attr,
                    'attributes': attrs_dict,
                    'depth': len(self.current_tag_stack)
                })

        # Track buttons (especially fullscreen)
        if tag == 'button':
            self.buttons.append({
                'tag': tag,
                'attributes': attrs_dict,
                'depth': len(self.current_tag_stack)
            })

        # Track iframes (embedded players)
        if tag == 'iframe':
            self.iframes.append({
                'tag': tag,
                'attributes': attrs_dict,
                'depth': len(self.current_tag_stack)
            })

        # Track scripts (event handlers, players)
        if tag == 'script':
            self.scripts.append({
                'tag': tag,
                'attributes': attrs_dict,
                'depth': len(self.current_tag_stack)
            })

    def handle_endtag(self, tag):
        if self.current_tag_stack and self.current_tag_stack[-1] == tag:
            self.current_tag_stack.pop()

    def get_analysis(self):
        return {
            'video_elements': self.video_elements,
            'player_containers': self.player_containers,
            'buttons': self.buttons,
            'iframes': self.iframes,
            'script_count': len(self.scripts)
        }


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
    except HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}", file=sys.stderr)
        return None
    except URLError as e:
        print(f"URL Error: {e.reason}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Error fetching page: {e}", file=sys.stderr)
        return None


def analyze_html(html):
    """Analyze HTML for video player structure"""
    parser = VideoPlayerAnalyzer()
    parser.feed(html)
    return parser.get_analysis()


def save_output(url, html, analysis, output_file):
    """Save analysis results to file"""
    data = {
        'url': url,
        'html_length': len(html),
        'analysis': analysis
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"# HiAnime Page Analysis\n\n")
        f.write(f"**URL:** {url}\n\n")
        f.write(f"**HTML Length:** {len(html):,} characters\n\n")
        f.write(f"---\n\n")

        f.write(f"## Analysis Summary\n\n")
        f.write(f"- Video elements found: {len(analysis['video_elements'])}\n")
        f.write(f"- Player containers found: {len(analysis['player_containers'])}\n")
        f.write(f"- Buttons found: {len(analysis['buttons'])}\n")
        f.write(f"- Iframes found: {len(analysis['iframes'])}\n")
        f.write(f"- Script tags found: {analysis['script_count']}\n\n")

        f.write(f"---\n\n")

        if analysis['video_elements']:
            f.write(f"## Video Elements\n\n")
            f.write("```json\n")
            f.write(json.dumps(analysis['video_elements'], indent=2))
            f.write("\n```\n\n")

        if analysis['player_containers']:
            f.write(f"## Player Containers\n\n")
            f.write("```json\n")
            f.write(json.dumps(analysis['player_containers'], indent=2))
            f.write("\n```\n\n")

        if analysis['iframes']:
            f.write(f"## Iframes (Embedded Players)\n\n")
            f.write("```json\n")
            f.write(json.dumps(analysis['iframes'], indent=2))
            f.write("\n```\n\n")

        # Sample of buttons (limit to fullscreen-related)
        fullscreen_buttons = [
            btn for btn in analysis['buttons']
            if any(keyword in str(btn.get('attributes', {})).lower()
                   for keyword in ['fullscreen', 'full-screen', 'plyr'])
        ]

        if fullscreen_buttons:
            f.write(f"## Fullscreen-Related Buttons\n\n")
            f.write("```json\n")
            f.write(json.dumps(fullscreen_buttons, indent=2))
            f.write("\n```\n\n")

        f.write(f"---\n\n")
        f.write(f"## Full HTML Source\n\n")
        f.write("```html\n")
        f.write(html)
        f.write("\n```\n")

    print(f"Analysis saved to: {output_file}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python fetch_page_data.py <url> [output_file]")
        print("\nExample:")
        print("  python fetch_page_data.py https://hianime.to/watch/memories-936?ep=15804")
        print("  python fetch_page_data.py https://hianime.to/watch/memories-936?ep=15804 movie_analysis.md")
        sys.exit(1)

    url = sys.argv[1]

    # Default output file based on URL
    if len(sys.argv) >= 3:
        output_file = sys.argv[2]
    else:
        # Extract show name from URL for filename
        parts = url.split('/')
        show_name = parts[-1] if parts else 'page'
        show_name = show_name.split('?')[0]
        output_file = f"analysis_{show_name}.md"

    print(f"Fetching: {url}")
    html = fetch_page(url)

    if html is None:
        print("Failed to fetch page")
        sys.exit(1)

    print(f"Fetched {len(html):,} characters")
    print("Analyzing HTML structure...")

    analysis = analyze_html(html)

    print(f"\nFound:")
    print(f"  - {len(analysis['video_elements'])} video elements")
    print(f"  - {len(analysis['player_containers'])} player containers")
    print(f"  - {len(analysis['buttons'])} buttons")
    print(f"  - {len(analysis['iframes'])} iframes")
    print(f"  - {analysis['script_count']} scripts")

    save_output(url, html, analysis, output_file)
    print(f"\nYou can now analyze '{output_file}' to understand the page structure")


if __name__ == '__main__':
    main()
