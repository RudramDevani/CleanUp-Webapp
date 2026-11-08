"""Table definitions mirrored from supabase_schema.sql, for future Flask backend use."""
TABLES = {
 'volunteers': ['name','email','phone','city','area','age','occupation','skills','availability','message'],
 'events': ['title','description','date','location','image_url'],
 'organizations': ['organization_name','contact_person','email','phone','address','organization_type','website','message'],
 'adoptions': ['name','organization','email','phone','spot','reason'],
 'reports': ['name','email','phone','area','location','description','image_url','waste_type','urgency'],
 'contacts': ['name','email','subject','message'],
 'newsletter': ['email'],
}
