# Cleanup Surat – Setup Guide
1. **Supabase**: create a project → SQL Editor → run `supabase_schema.sql` (tables, RLS, `gallery` + `reports` buckets).
   Add events via Table Editor; upload gallery photos to `gallery/{events|before|after|volunteers}/`.
2. **Local**: `pip install -r requirements.txt`, `export SUPABASE_URL=… SUPABASE_ANON_KEY=…`, then
   `python build.py && python -m http.server -d dist` (static, as on Netlify) or `python app.py` (Flask dev; copy values into a local `config.js` route/file).
3. **Netlify**: push to Git → New site from Git. `netlify.toml` already sets build (`python build.py`) and publish (`dist`).
   Site settings → Environment variables → add `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
4. **Replace placeholders**: contact details, social links, team, partners; add `static/images/hero.jpg` and `og.jpg`.
5. Only the anon key is used; RLS allows public inserts and reading events only. View submissions in the Supabase dashboard.
