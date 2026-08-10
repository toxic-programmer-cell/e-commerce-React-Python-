import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from apps.users.models import User
from apps.products.models import Category, Brand, Product, ProductImage, ProductVariant
from apps.addresses.models import Address

class Command(BaseCommand):
    help = "Seeds initial development data for users, admins, categories, brands, products, and addresses."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting database seeding..."))

        # 1. SuperAdmin
        superadmin, created = User.objects.get_or_create(
            email="superadmin@vibe.com",
            defaults={
                "username": "superadmin",
                "first_name": "Super",
                "last_name": "Admin",
                "role": User.Role.SUPER_ADMIN,
                "is_superuser": True,
                "is_staff": True,
            }
        )
        if created:
            superadmin.set_password("SuperAdmin123!")
            superadmin.save()
            self.stdout.write(self.style.SUCCESS("Created SuperAdmin: superadmin@vibe.com / SuperAdmin123!"))

        # 2. Sellers/Admins
        seller1, created = User.objects.get_or_create(
            email="admin@techstore.com",
            defaults={
                "username": "techstore_admin",
                "first_name": "Tech",
                "last_name": "Seller",
                "role": User.Role.ADMIN,
                "is_staff": True
            }
        )
        if created:
            seller1.set_password("Admin123!")
            seller1.save()
            self.stdout.write(self.style.SUCCESS("Created Seller Admin 1: admin@techstore.com / Admin123!"))

        seller2, created = User.objects.get_or_create(
            email="admin@apparel.com",
            defaults={
                "username": "apparel_admin",
                "first_name": "Style",
                "last_name": "Seller",
                "role": User.Role.ADMIN,
                "is_staff": True
            }
        )
        if created:
            seller2.set_password("Admin123!")
            seller2.save()

        # 3. Regular Customer Users
        customer, created = User.objects.get_or_create(
            email="user@example.com",
            defaults={
                "username": "john_doe",
                "first_name": "John",
                "last_name": "Doe",
                "phone": "+1 555-0192",
                "role": User.Role.USER
            }
        )
        if created:
            customer.set_password("User123!")
            customer.save()
            self.stdout.write(self.style.SUCCESS("Created Customer User: user@example.com / User123!"))

            # Create default address for customer
            Address.objects.create(
                user=customer,
                full_name="John Doe",
                phone="+1 555-0192",
                address_line_1="100 Square Avenue, Suite 400",
                city="San Francisco",
                state="CA",
                postal_code="94103",
                country="United States",
                address_type=Address.AddressType.HOME,
                is_default=True
            )

        # 4. Categories
        categories_data = [
            {"name": "Electronics", "description": "High performance gadgets, laptops, audio equipment and accessories."},
            {"name": "Apparel & Luxury", "description": "Classic minimalist clothing, footwear and refined accessories."},
            {"name": "Home & Living", "description": "Geometric modern furniture, architectural decor and lighting."},
            {"name": "Audio & Acoustics", "description": "Studio grade headphones, soundbars and acoustic speakers."},
        ]

        categories = {}
        for cat in categories_data:
            c_obj, _ = Category.objects.get_or_create(
                name=cat["name"],
                defaults={"slug": slugify(cat["name"]), "description": cat["description"]}
            )
            categories[cat["name"]] = c_obj

        # 5. Brands
        brands_data = ["Aura", "Zenith", "Kube Studio", "Monolith", "Minimalist Tech"]
        brands = {}
        for b_name in brands_data:
            b_obj, _ = Brand.objects.get_or_create(
                name=b_name,
                defaults={"slug": slugify(b_name)}
            )
            brands[b_name] = b_obj

        # 6. Sample Products
        products_data = [
            {
                "name": "Kube Pro ANC Headphones",
                "category": categories["Audio & Acoustics"],
                "brand": brands["Kube Studio"],
                "price": 299.99,
                "discount_price": 249.99,
                "stock": 45,
                "sku": "KUBE-ANC-001",
                "short_description": "Precision tuned active noise cancelling wireless headphones with acoustic chambering.",
                "description": "Experience pure studio acoustic clarity with geometric CNC machined aluminum earcups, plush memory foam pads, and 40-hour battery life. Engineered for audiophiles.",
                "status": Product.Status.APPROVED,
                "seller": seller1
            },
            {
                "name": "Monolith UltraSlim Laptop M15",
                "category": categories["Electronics"],
                "brand": brands["Monolith"],
                "price": 1499.00,
                "discount_price": 1349.00,
                "stock": 20,
                "sku": "MONO-LAP-M15",
                "short_description": "Monolithic unibody magnesium alloy ultrabook featuring 120Hz OLED screen.",
                "description": "Crafted from a single block of aerospace aluminum, the Monolith M15 pairs cutting-edge multi-core performance with zero thermal throttling and an ultra-precise glass trackpad.",
                "status": Product.Status.APPROVED,
                "seller": seller1
            },
            {
                "name": "Square Form Studio Desk Lamp",
                "category": categories["Home & Living"],
                "brand": brands["Zenith"],
                "price": 129.00,
                "discount_price": None,
                "stock": 60,
                "sku": "ZEN-LAMP-01",
                "short_description": "Architectural LED desk lamp with tactile touch dimming and matte anodized finish.",
                "description": "Minimalist lighting designed for modern workspaces. Features 98 CRI eye-care LED diodes, 360-degree precision articulation, and integrated wireless charging base.",
                "status": Product.Status.APPROVED,
                "seller": seller1
            },
            {
                "name": "Aura Heavyweight Cotton Oversized Hoodie",
                "category": categories["Apparel & Luxury"],
                "brand": brands["Aura"],
                "price": 95.00,
                "discount_price": 79.00,
                "stock": 100,
                "sku": "AURA-HD-BLK",
                "short_description": "500 GSM French terry cotton hoodie with structured drop-shoulder fit.",
                "description": "Custom knit from 100% organic long-staple cotton. Features double-layered hood, hidden side seam pockets, and a timeless boxy silhouette.",
                "status": Product.Status.APPROVED,
                "seller": seller2
            },
            {
                "name": "Minimalist Ceramic Watch Edition 04",
                "category": categories["Apparel & Luxury"],
                "brand": brands["Minimalist Tech"],
                "price": 350.00,
                "discount_price": 299.00,
                "stock": 15,
                "sku": "MIN-WCH-04",
                "short_description": "Swiss quartz movement encapsulated in scratch-resistant matte black ceramic casing.",
                "description": "Sleek monochromatic watch featuring sapphire crystal glass, 5 ATM water resistance, and genuine Italian full-grain leather strap.",
                "status": Product.Status.APPROVED,
                "seller": seller2
            },
            # Pending / Inspection Test Products
            {
                "name": "Draft NextGen Smart Speaker",
                "category": categories["Electronics"],
                "brand": brands["Kube Studio"],
                "price": 199.00,
                "discount_price": None,
                "stock": 10,
                "sku": "KUBE-SPK-DRAFT",
                "short_description": "Draft product awaiting admin inspection submission.",
                "description": "Prototype smart speaker with spatial audio and high definition room acoustic analysis.",
                "status": Product.Status.DRAFT,
                "seller": seller1
            },
            {
                "name": "Pending Ergonomic Executive Chair",
                "category": categories["Home & Living"],
                "brand": brands["Zenith"],
                "price": 450.00,
                "discount_price": 399.00,
                "stock": 8,
                "sku": "ZEN-CHR-SUBMIT",
                "short_description": "Product submitted for SuperAdmin inspection.",
                "description": "Ergonomic mesh office chair with lumbar adjustment and polished aluminum base.",
                "status": Product.Status.SUBMITTED,
                "seller": seller1
            }
        ]

        for p_data in products_data:
            seller = p_data.pop("seller")
            p_obj, _ = Product.objects.get_or_create(
                sku=p_data["sku"],
                defaults={
                    "seller": seller,
                    "name": p_data["name"],
                    "slug": slugify(p_data["name"]),
                    "description": p_data["description"],
                    "short_description": p_data["short_description"],
                    "category": p_data["category"],
                    "brand": p_data["brand"],
                    "price": p_data["price"],
                    "discount_price": p_data["discount_price"],
                    "stock": p_data["stock"],
                    "status": p_data["status"]
                }
            )

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
