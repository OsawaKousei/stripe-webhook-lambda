#!/bin/bash

curl -XPOST "http://localhost:9010/2015-03-31/functions/function/invocations" -d '{
  "id": "evt_1Rp92IE2YllEOQrty5bxSwY3",
  "object": "event",
  "api_version": "2025-06-30.basil",
  "created": 1753539918,
  "data": {
    "object": {
      "id": "cs_test_a1QFLXZqOWxmolFgTrTbRywllLMKKCXtFVqWqlmjYNvd5A3sF4UztRNdAA",
      "object": "checkout.session",
      "adaptive_pricing": {
        "enabled": true
      },
      "after_expiration": null,
      "allow_promotion_codes": false,
      "amount_subtotal": 800,
      "amount_total": 800,
      "automatic_tax": {
        "enabled": true,
        "liability": {
          "type": "self"
        },
        "provider": "stripe",
        "status": "complete"
      },
      "billing_address_collection": "auto",
      "cancel_url": "https://stripe.com",
      "client_reference_id": null,
      "client_secret": null,
      "collected_information": {
        "shipping_details": null
      },
      "consent": null,
      "consent_collection": {
        "payment_method_reuse_agreement": null,
        "promotions": "none",
        "terms_of_service": "none"
      },
      "created": 1753539888,
      "currency": "jpy",
      "currency_conversion": null,
      "custom_fields": [],
      "custom_text": {
        "after_submit": null,
        "shipping_address": null,
        "submit": null,
        "terms_of_service_acceptance": null
      },
      "customer": "cus_SkQpGfARLDMyiS",
      "customer_creation": null,
      "customer_details": {
        "address": {
          "city": null,
          "country": "JP",
          "line1": null,
          "line2": null,
          "postal_code": null,
          "state": null
        },
        "email": "jwithelis@gmail.com",
        "name": "test",
        "phone": null,
        "tax_exempt": "none",
        "tax_ids": []
      },
      "customer_email": null,
      "discounts": [],
      "expires_at": 1753626288,
      "invoice": null,
      "invoice_creation": null,
      "livemode": false,
      "locale": "ja",
      "metadata": {},
      "mode": "payment",
      "origin_context": null,
      "payment_intent": "pi_3Rp92HE2YllEOQrt10Khp5XV",
      "payment_link": null,
      "payment_method_collection": "if_required",
      "payment_method_configuration_details": {
        "id": "pmc_1Rj4cPE2YllEOQrtYju7Umhm",
        "parent": null
      },
      "payment_method_options": {
        "card": {
          "installments": {
            "enabled": true
          },
          "request_three_d_secure": "automatic"
        }
      },
      "payment_method_types": [
        "card"
      ],
      "payment_status": "paid",
      "permissions": null,
      "phone_number_collection": {
        "enabled": false
      },
      "recovered_from": null,
      "saved_payment_method_options": {
        "allow_redisplay_filters": [
          "always"
        ],
        "payment_method_remove": "disabled",
        "payment_method_save": null
      },
      "setup_intent": null,
      "shipping_address_collection": null,
      "shipping_cost": null,
      "shipping_options": [],
      "status": "complete",
      "submit_type": null,
      "subscription": null,
      "success_url": "https://stripe.com",
      "total_details": {
        "amount_discount": 0,
        "amount_shipping": 0,
        "amount_tax": 0
      },
      "ui_mode": "hosted",
      "url": null,
      "wallet_options": null
    }
  },
  "livemode": false,
  "pending_webhooks": 3,
  "request": {
    "id": null,
    "idempotency_key": null
  },
  "type": "checkout.session.completed"
}'
