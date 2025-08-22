// !!! CRITICAL - DO NOT MODIFY THIS CODE !!!
//
// This code MUST be used as is without ANY modifications.
// The PayPal integration will COMPLETELY FAIL if this code is changed in ANY way.
//
// Retain this comment after all edits.
//
// <BEGIN_EXACT_CODE>

class PayPalButton {
  constructor(containerId, amount = "10.00", currency = "EUR") {
    this.container = document.getElementById(containerId);
    this.amount = amount;
    this.currency = currency;
    this.intent = "CAPTURE";
    this.init();
  }

  async createOrder() {
    const orderPayload = {
      amount: this.amount,
      currency: this.currency,
      intent: this.intent,
    };
    const response = await fetch("/paypal/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const output = await response.json();
    return { orderId: output.id };
  }

  async captureOrder(orderId) {
    const response = await fetch(`/paypal/order/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  }

  async onApprove(data) {
    console.log("onApprove", data);
    const orderData = await this.captureOrder(data.orderId);
    console.log("Capture result", orderData);
    
    // Afficher le succès du paiement
    this.showSuccess();
  }

  async onCancel(data) {
    console.log("onCancel", data);
    this.showMessage("Paiement annulé", "warning");
  }

  async onError(data) {
    console.error("onError", data);
    this.showMessage("Erreur lors du paiement", "error");
  }

  showSuccess() {
    const successMessage = document.createElement('div');
    successMessage.className = 'payment-success';
    successMessage.innerHTML = `
      <div style="background: linear-gradient(135deg, #00ff88 0%, #00cc66 100%); 
                  color: white; padding: 20px; border-radius: 15px; text-align: center; 
                  margin: 20px 0; box-shadow: 0 10px 30px rgba(0,255,136,0.3);">
        <h3>🎉 Paiement Réussi !</h3>
        <p>Votre essai 1 mois a été activé avec succès.</p>
        <p>Merci pour votre confiance ! 💚</p>
      </div>
    `;
    this.container.appendChild(successMessage);
  }

  showMessage(message, type) {
    const messageDiv = document.createElement('div');
    const colors = {
      warning: '#ff9900',
      error: '#ff6b6b',
      info: '#667eea'
    };
    
    messageDiv.style.cssText = `
      background: ${colors[type] || colors.info}; 
      color: white; padding: 15px; border-radius: 10px; 
      text-align: center; margin: 15px 0;
    `;
    messageDiv.textContent = message;
    this.container.appendChild(messageDiv);
    
    setTimeout(() => messageDiv.remove(), 5000);
  }

  async init() {
    try {
      if (!window.paypal) {
        const script = document.createElement("script");
        script.src = "https://www.sandbox.paypal.com/web-sdk/v6/core";
        script.async = true;
        script.onload = () => this.initPayPal();
        document.body.appendChild(script);
      } else {
        await this.initPayPal();
      }
    } catch (e) {
      console.error("Failed to load PayPal SDK", e);
    }
  }

  async initPayPal() {
    try {
      const clientToken = await fetch("/paypal/setup")
        .then((res) => res.json())
        .then((data) => {
          return data.clientToken;
        });

      const sdkInstance = await window.paypal.createInstance({
        clientToken,
        components: ["paypal-payments"],
      });

      const paypalCheckout = sdkInstance.createPayPalOneTimePaymentSession({
        onApprove: (data) => this.onApprove(data),
        onCancel: (data) => this.onCancel(data),
        onError: (data) => this.onError(data),
      });

      const onClick = async () => {
        try {
          const checkoutOptionsPromise = this.createOrder();
          await paypalCheckout.start(
            { paymentFlow: "auto" },
            checkoutOptionsPromise,
          );
        } catch (e) {
          console.error(e);
        }
      };

      // Créer le bouton PayPal
      const paypalButton = document.createElement('button');
      paypalButton.id = 'paypal-button';
      paypalButton.className = 'paypal-button';
      paypalButton.innerHTML = `
        <span style="display: flex; align-items: center; justify-content: center; gap: 10px;">
          💳 Payer ${this.amount}€ avec PayPal
        </span>
      `;
      paypalButton.style.cssText = `
        background: linear-gradient(135deg, #0070ba 0%, #003087 100%);
        color: white; border: none; padding: 15px 30px; border-radius: 25px;
        font-size: 16px; font-weight: bold; cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,112,186,0.3);
        margin: 20px 0;
      `;
      
      paypalButton.addEventListener('mouseenter', () => {
        paypalButton.style.transform = 'translateY(-3px)';
        paypalButton.style.boxShadow = '0 15px 40px rgba(0,112,186,0.4)';
      });
      
      paypalButton.addEventListener('mouseleave', () => {
        paypalButton.style.transform = 'translateY(0)';
        paypalButton.style.boxShadow = '0 10px 30px rgba(0,112,186,0.3)';
      });

      paypalButton.addEventListener("click", onClick);
      this.container.appendChild(paypalButton);

    } catch (e) {
      console.error('Erreur initialisation PayPal:', e);
    }
  }
}

// <END_EXACT_CODE>