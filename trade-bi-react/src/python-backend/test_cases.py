TEST_CASES = [
    {
        "image": "reciept.jpg",
        "expected": {
            "merchant": None,
            "date": "01-02-2018 11:32AM",
            "items": [
                {"name": "T-Shirt", "price": 25.50},
                {"name": "Watches", "price": 299.00},
                {"name": "Pants", "price": 32.99},
                {"name": "Socks", "price": 6.50},
            ],
            "subtotal": None,
            "tax": None,
            "total": 363.99,
        },
    },
    # Add 5-15 more receipts covering different stores/layouts/photo quality
]