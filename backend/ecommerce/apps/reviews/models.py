import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.products.models import Product
from apps.orders.models import Order

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerElement if False else models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(max_length=150)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reviews'
        unique_together = ('user', 'product', 'order')
        ordering = ['-created_at']

    def __str__(self):
        return f"Review ({self.rating}/5) by {self.user.email} for {self.product.name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculate product rating score efficiently
        reviews = Review.objects.filter(product=self.product)
        avg = reviews.aggregate(models.Avg('rating'))['rating__avg'] or 0.00
        count = reviews.count()
        self.product.average_rating = round(avg, 2)
        self.product.review_count = count
        self.product.save(update_fields=['average_rating', 'review_count'])
