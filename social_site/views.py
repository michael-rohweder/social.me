from django.shortcuts import render, redirect
from django.http import JsonResponse
from .forms import NewUserForm
from profiles.models import Profile
from django.contrib.auth.models import User
# Create your views here.


def Login(request):
    return render(request, 'login.html')

def userProfile(request):
    return render(request, 'userProfile.html')

def signup(request):
    if request.method == "POST":
        form = NewUserForm(request.POST)
        if form.is_valid():
            user = form.save()
            firstName = form.cleaned_data.get("firstName")
            lastName = form.cleaned_data.get('lastName')
            email = form.cleaned_data.get('email')
            userName = form.cleaned_data.get('username')
            
            return redirect('userProfile')
    form = NewUserForm
    return render (request=request, template_name="registration.html", context={"register_form":form})