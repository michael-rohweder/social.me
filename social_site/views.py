from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.


def Login(request):
    return render(request, 'login.html')