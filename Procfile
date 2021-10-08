
release: python manage.py migrate
release: python manage.py createsuperuser
web: gunicorn social_site.wsgi --log-file -
