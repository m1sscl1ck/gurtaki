from django.db import models
from django.contrib.auth.models import User

# Модель Профілю Студента
class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    dorm_number = models.IntegerField(default=0, verbose_name="Номер гуртожитку")
    student_id_photo = models.ImageField(upload_to='student_ids/', null=True, blank=True, verbose_name="Фото студентського/перепустки")
    is_approved = models.BooleanField(default=False, verbose_name="Підтверджено адміном")

    def __str__(self):
        return f"Студент {self.user.username} (Гуртожиток {self.dorm_number})"

# Модель Поста
class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    dorm_number = models.IntegerField(default=0) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} (Гуртожиток {self.dorm_number})"