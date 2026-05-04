from django import forms
from .models import Goal

class GoalForm(forms.ModelForm):
    class Meta:
        model = Goal
        fields = ['name', 'target_amount', 'current_savings', 'deadline']
    
        widgets = {
    'name': forms.TextInput(attrs={'placeholder': 'e.g. Dream House'}),
    'target_amount': forms.NumberInput(attrs={'placeholder': '$ 0.00'}),
    'current_savings': forms.NumberInput(attrs={'placeholder': '$ 0.00'}),
    'deadline': forms.DateInput(attrs={'type': 'date'}),
}