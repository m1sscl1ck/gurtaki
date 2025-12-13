from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Post, StudentProfile

class StudentProfileInline(admin.StackedInline):
    model = StudentProfile
    can_delete = False
    verbose_name_plural = 'Профіль студента'

class UserAdmin(BaseUserAdmin):
    inlines = (StudentProfileInline,)
    list_display = ('username', 'is_active', 'is_staff')

admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(Post)