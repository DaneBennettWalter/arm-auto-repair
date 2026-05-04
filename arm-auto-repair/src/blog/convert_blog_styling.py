#!/usr/bin/env python3
import re
import glob

# The proper header HTML
HEADER_HTML = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">'''

HEADER_END = '''    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'arm-red': '#C8102E',
                        'arm-blue': '#1E3A5F',
                        'arm-navy': '#0D1B2A',
                        'arm-cream': '#F4EDE4',
                    }
                }
            }
        }
    </script>
</head>
<body class="font-sans antialiased">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <a href="../index.html"><img src="../images/logo.png" alt="ARM Auto Repair" class="h-16"></a>
                <nav class="hidden md:flex space-x-8">
                    <a href="../index.html" class="text-gray-700 hover:text-arm-red font-medium">Home</a>
                    <a href="../services.html" class="text-gray-700 hover:text-arm-red font-medium">Services</a>
                    <a href="index.html" class="text-gray-700 hover:text-arm-red font-medium">Blog</a>
                    <a href="../index.html#contact" class="text-gray-700 hover:text-arm-red font-medium">Contact</a>
                    <a href="tel:3612201629" class="bg-arm-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold">
                        (361) 220-1629
                    </a>
                </nav>
            </div>
        </div>
    </header>

    <!-- Article Content -->
    <main class="py-16 bg-gray-50">
        <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">'''

FOOTER_HTML = '''        </article>
    </main>

    <!-- Footer -->
    <footer class="bg-arm-navy text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2026 ARM Auto Repair and Mechanical. ASE Certified. Serving Corpus Christi and the Coastal Bend.</p>
        </div>
    </footer>

</body>
</html>'''

# Process all HTML files except index.html
for filepath in glob.glob('*.html'):
    if filepath == 'index.html' or filepath.startswith('_'):
        continue
    
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Extract title, description, keywords
    title_match = re.search(r'<title>(.*?)</title>', content)
    desc_match = re.search(r'<meta name="description" content="(.*?)"', content)
    keywords_match = re.search(r'<meta name="keywords" content="(.*?)"', content)
    canonical_match = re.search(r'<link rel="canonical" (?:href|content)="(.*?)"', content)
    
    # Extract article date and category
    date_match = re.search(r'Published (.*?) \|', content)
    
    # Extract the main content between <main> and </main>
    main_match = re.search(r'<main[^>]*>(.*?)</main>', content, re.DOTALL)
    
    if not main_match:
        print(f"  Skipping {filepath} - no main content found")
        continue
    
    main_content = main_match.group(1)
    
    # Extract h1 and published date from inside main
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', main_content)
    
    # Build new file
    new_html = HEADER_HTML + '\n'
    
    if title_match:
        new_html += f'    <title>{title_match.group(1)}</title>\n'
    if desc_match:
        new_html += f'    <meta name="description" content="{desc_match.group(1)}">\n'
    if keywords_match:
        new_html += f'    <meta name="keywords" content="{keywords_match.group(1)}">\n'
    if canonical_match:
        new_html += f'    <link rel="canonical" href="{canonical_match.group(1)}">\n'
    
    new_html += HEADER_END + '\n'
    
    # Add article header
    new_html += '            <header class="mb-12 text-center">\n'
    if h1_match:
        new_html += f'                <h1 class="text-5xl font-bold mb-4 text-arm-navy">{h1_match.group(1)}</h1>\n'
    if date_match:
        new_html += f'                <p class="text-gray-600">Published {date_match.group(1)}</p>\n'
    new_html += '            </header>\n\n'
    
    # Wrap content in styled box
    new_html += '            <div class="bg-white rounded-xl shadow-md p-8 md:p-12 prose prose-lg max-w-none">\n'
    
    # Extract just the blog-content div content
    content_match = re.search(r'<div class="blog-content">(.*?)</div>\s*</article>', main_content, re.DOTALL)
    if content_match:
        blog_content = content_match.group(1)
        new_html += blog_content
    else:
        # Fallback: use all main content minus header
        new_html += re.sub(r'<header[^>]*>.*?</header>', '', main_content, flags=re.DOTALL)
    
    new_html += '\n            </div>\n'
    new_html += FOOTER_HTML
    
    # Write new file
    with open(filepath, 'w') as f:
        f.write(new_html)
    
    print(f"  ✓ Converted {filepath}")

print("\nDone!")
