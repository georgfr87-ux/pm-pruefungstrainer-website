const GOOGLE_ORDER_VALIDATION_URL =
  "https://pm-pruefungstrainer-fulfillment.georg-foerster1.workers.dev/validate-google-order";

const bundleStartButton = document.getElementById("bundle-start-button");
const bundleVerification = document.getElementById("bundle-verification");
const googleOrderInput = document.getElementById("google-order-id");
const googleOrderCheckButton = document.getElementById("google-order-check-button");
const googleOrderStatus = document.getElementById("google-order-status");

if (
  bundleStartButton &&
  bundleVerification &&
  googleOrderInput &&
  googleOrderCheckButton &&
  googleOrderStatus
) {
  bundleStartButton.addEventListener("click", () => {
    bundleVerification.hidden = false;
    googleOrderInput.focus();
  });

  googleOrderCheckButton.addEventListener("click", async () => {
    const orderId = googleOrderInput.value.trim();

    googleOrderStatus.textContent = "";

    if (!orderId) {
      googleOrderStatus.textContent =
        "Bitte gib deine Google-Play-Bestellnummer ein.";
      return;
    }

    googleOrderCheckButton.disabled = true;
    googleOrderStatus.textContent = "Kauf wird geprüft …";

    try {
      const response = await fetch(GOOGLE_ORDER_VALIDATION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId,
        }),
      });

      const result = await response.json();

      if (result.valid === true) {
        googleOrderStatus.textContent =
          "App-Kauf erfolgreich bestätigt. Zahlungsfenster wird geöffnet …";

        if (
          !result.eligibilityToken ||
          !result.eligibilityExpiresAt
        ) {
          throw new Error(
            "Eligibility-Token fehlt in der Serverantwort."
          );
        }

        openBundleCheckout(
          result.eligibilityToken,
          result.orderId
        );
        return;
      }

      switch (result.reason) {
        case "PURCHASE_TOO_RECENT":
          googleOrderStatus.textContent =
            "Der App-Kauf liegt noch keine 2 Stunden zurück. Bitte versuche es später erneut.";
          break;

        case "ORDER_ALREADY_REDEEMED":
          googleOrderStatus.textContent =
            "Diese Google-Play-Bestellung wurde bereits für das Komplettpaket verwendet.";
          break;

        case "ORDER_NOT_PROCESSED":
          googleOrderStatus.textContent =
            "Die Bestellung ist nicht mehr gültig oder wurde erstattet.";
          break;

        case "INVALID_ORDER_ID":
        case "ORDER_NOT_FOUND":
          googleOrderStatus.textContent =
            "Die Google-Play-Bestellnummer konnte nicht bestätigt werden.";
          break;

        default:
          googleOrderStatus.textContent =
            "Die Bestellung konnte nicht bestätigt werden. Bitte prüfe die Bestellnummer.";
      }
    } catch (error) {
      console.error("Google Play purchase validation failed:", error);

      googleOrderStatus.textContent =
        "Die Prüfung ist momentan nicht möglich. Bitte versuche es später erneut.";
    } finally {
      googleOrderCheckButton.disabled = false;
    }
  });
}

var CLIENT_TOKEN = "live_e01bfa0687d5eb6929688fad629";

var PRODUCT_PRICE_IDS = {
  "learning-summary": "pri_01m3bqfzaqncj43aawq48yknwc",
  bundle: "pri_01m3bqhthax9mcc6r3q17dc0a9"
};

function logPaddleError(message, error) {
  if (error) {
    console.error("[Paddle Checkout] " + message, error);
    return;
  }

  console.error("[Paddle Checkout] " + message);
}

function initializePaddle() {
  if (window.__pmPaddleInitialized) {
    return true;
  }

  if (!window.Paddle) {
    logPaddleError("Paddle.js konnte nicht geladen werden.");
    return false;
  }

  try {
    if (typeof Paddle.Initialize !== "function") {
      logPaddleError(
        "Paddle.Initialize ist nicht verfügbar."
      );
      return false;
    }

    Paddle.Initialize({
      token: CLIENT_TOKEN
    });

    window.__pmPaddleInitialized = true;
    return true;
  } catch (error) {
    logPaddleError(
      "Paddle konnte nicht initialisiert werden.",
      error
    );
    return false;
  }
}

function openCheckout(priceId, customData) {
  if (!initializePaddle()) {
    return false;
  }

  try {
    if (
      !Paddle.Checkout ||
      typeof Paddle.Checkout.open !== "function"
    ) {
      logPaddleError(
        "Paddle.Checkout.open ist nicht verfügbar."
      );
      return false;
    }

    var checkoutOptions = {
      items: [
        {
          priceId: priceId,
          quantity: 1
        }
      ]
    };

    if (customData) {
      checkoutOptions.customData = customData;
    }

    Paddle.Checkout.open(checkoutOptions);
    return true;
  } catch (error) {
    logPaddleError(
      "Der Paddle Checkout konnte nicht geöffnet werden.",
      error
    );
    return false;
  }
}

function openBundleCheckout(
  eligibilityToken,
  googleOrderId
) {
  var priceId = PRODUCT_PRICE_IDS.bundle;

  if (!priceId) {
    logPaddleError(
      "Keine Price ID für das Bundle hinterlegt."
    );
    return false;
  }

  return openCheckout(
    priceId,
    {
      bundle_eligibility_token: eligibilityToken,
      google_play_order_id: googleOrderId
    }
  );
}

document.addEventListener("DOMContentLoaded", function () {
  var paddleButtons =
    document.querySelectorAll("[data-paddle-product]");

  paddleButtons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      var productKey =
        button.getAttribute("data-paddle-product");

      var priceId =
        PRODUCT_PRICE_IDS[productKey];

      if (!priceId) {
        logPaddleError(
          "Keine Price ID für data-paddle-product='" +
            productKey +
            "' hinterlegt."
        );
        return;
      }

      openCheckout(priceId);
    });
  });
});
