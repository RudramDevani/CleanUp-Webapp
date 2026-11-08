from flask import Flask, render_template
app = Flask(__name__)
PAGES = {'': 'index', 'about': 'about', 'events': 'events', 'volunteer': 'volunteer',
         'adopt-a-spot': 'adoption', 'join-organization': 'organization',
         'gallery': 'gallery', 'report-a-spot': 'reportspot', 'contact': 'contact'}

def make(slug, tpl):
    app.add_url_rule('/' + slug, tpl, lambda: render_template(tpl + '.html', page=tpl))
for s, t in PAGES.items():
    make(s, t)

if __name__ == '__main__':
    app.run(debug=True)
