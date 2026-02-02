import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()

# Auto-create superuser on first run
from django.contrib.auth.models import User

username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'Parth')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'ps270843@gmail.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'Intern1234')

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"✅ Created superuser: {username}")
else:
    print(f"ℹ️ Superuser {username} already exists")