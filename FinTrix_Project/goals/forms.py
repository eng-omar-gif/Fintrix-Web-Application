from django import forms
from django.core.exceptions import ValidationError

from .models import Goal


class GoalForm(forms.ModelForm):
    class Meta:
        model = Goal
        fields = ['name', 'target_amount', 'current_savings', 'deadline']
        widgets = {
            'name': forms.TextInput(
                attrs={
                    'placeholder': 'e.g. Dream House',
                    'autocomplete': 'off',
                }
            ),
            'target_amount': forms.NumberInput(
                attrs={'placeholder': '0.00', 'step': '0.01', 'min': '0.01'}
            ),
            'current_savings': forms.NumberInput(
                attrs={'placeholder': '0.00', 'step': '0.01', 'min': '0'}
            ),
            'deadline': forms.DateInput(attrs={'type': 'date'}),
        }

    def clean_target_amount(self):
        value = self.cleaned_data.get('target_amount')
        if value is not None and value <= 0:
            raise ValidationError('Target amount must be greater than zero.')
        return value

    def clean(self):
        cleaned = super().clean()
        target = cleaned.get('target_amount')
        current = cleaned.get('current_savings')
        if target is not None and current is not None and current > target:
            raise ValidationError(
                'Current savings cannot be greater than the target amount.'
            )
        return cleaned
