import uuid
from django.db import models
from django.conf import settings
from apps.products.models import Product

class ProductInspection(models.Model):
    class InspectionStatus(models.TextChoices):
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inspections')
    inspector = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=InspectionStatus.choices)
    rejection_reason = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    inspected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'product_inspections'
        ordering = ['-inspected_at']

    def __str__(self):
        return f"Inspection for {self.product.name} ({self.status})"
