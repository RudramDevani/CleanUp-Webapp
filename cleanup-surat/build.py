"""Freezes Flask pages into dist/ for Netlify and writes config.js from env vars."""
import os, shutil, pathlib
from app import app, PAGES
d = pathlib.Path('dist'); shutil.rmtree(d, ignore_errors=True); d.mkdir()
shutil.copytree('static', d / 'static')
c = app.test_client()
for s in PAGES:
    (d / ((s or 'index') + '.html')).write_text(c.get('/' + s).get_data(as_text=True), encoding='utf-8')
(d / 'config.js').write_text('window.ENV={url:"%s",key:"%s"};' % (os.getenv('SUPABASE_URL', ''), os.getenv('SUPABASE_ANON_KEY', '')))
(d / 'robots.txt').write_text('User-agent: *\nAllow: /\n')
print('Built', len(PAGES), 'pages')
