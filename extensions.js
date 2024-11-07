const ReturnForm = {
    name: 'ReturnForm',
    type: 'response',
    match: ({ trace }) =>
      trace.type === 'ext_returnRequest' || trace.payload.name === 'ext_returnRequest',
    render: ({ trace, element }) => {
      // Extract the relevant data (product list)
      let { produkter } = trace.payload;
  
      // Split grouped data into individual product objects, ensuring each value is defined
      const splitProducts = produkter.map((produkt) => {
        // Ensure the values are defined before attempting to split
        const varenavnList = (produkt.varenavn || '').split(',').map(item => item.trim());
        const productIdList = (produkt.product_id || '').split(',').map(item => item.trim());
        const ordrekostnadList = (produkt.ordrekostnad || '').toString().split(',').map(item => parseFloat(item.trim()));
        const bildelinkList = (produkt.bildelink || '').split(',').map(item => item.trim());
  
        // Create an array of individual products
        return varenavnList.map((_, index) => ({
          ordrenummer: produkt.ordrenummer || 'Ikke tilgjengelig',
          varenavn: varenavnList[index] || 'Ikke tilgjengelig',
          product_id: productIdList[index] || 'Ikke tilgjengelig',
          ordrekostnad: ordrekostnadList[index] || 0,
          bildelink: bildelinkList[index] || '',
          selected: produkt.selected || false,
          reason: produkt.reason || ''
        }));
      }).flat(); // Flatten to create a single array of products
  
      const defaultImageURL = 'https://0e3db0-b3.myshopify.com/cdn/shop/files/NewBalance_M1000V1.png?v=1726826154&width=120';
  
      const ordrenummer = splitProducts.length > 0 ? splitProducts[0].ordrenummer : 'Ikke tilgjengelig';
  
      const returnRequestContainer = document.createElement('div');
      returnRequestContainer.innerHTML = `
        <style>
          .vfrc-message--extension-ReturnForm {
            background-color: transparent !important;
            background: none !important;
          }
          .return-request-container {
            font-family: Arial, sans-serif;
            max-width: 300px; /* Sett en fast maks bredde */
            width: 100%; /* Sikre at containeren fyller opp vinduet */
            margin: 0 auto;
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background-color: #fff;
            box-sizing: border-box; /* Sikre at padding ikke overskrider maks bredde */
          }
          .return-request-container.disabled {
            pointer-events: none;
            opacity: 0.6;
          }
          .return-request-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .order-number {
            font-size: 14px;
            margin-bottom: 15px;
            white-space: nowrap; /* Prevent line breaks */
          }
          .return-item {
            display: flex;
            flex-direction: column;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e0e0e0;
          }
          .return-item:last-child {
            border-bottom: none;
          }
          .item-content {
            display: flex;
            align-items: center;
          }
          .item-image {
            width: 60px; /* Ensartet bredde */
            height: 60px; /* Ensartet høyde */
            margin-right: 10px;
            object-fit: contain; /* Sørg for at bildet skaleres inne i rammen */
            border-radius: 8%;
          }
          .item-details {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            white-space: nowrap; /* Prevent line breaks */
          }
          .item-name {
            font-weight: bold;
            font-size: 14px; /* Juster skriftstørrelsen */
            margin-bottom: 5px;
          }
          .item-code, .item-price {
            font-size: 12px; /* Reduser skriftstørrelsen for å passe bedre */
            color: #666;
            margin-bottom: 5px;
          }
          .item-price {
            font-weight: bold;
          }
          .item-checkbox {
            margin-left: 10px;
            margin-top: 5px;
          }
          .item-checkbox input[type="checkbox"] {
            appearance: none;
            width: 18px; /* Juster boksstørrelsen */
            height: 18px;
            border: 2px solid #999;
            border-radius: 50%;
            outline: none;
            cursor: pointer;
          }
          .item-checkbox input[type="checkbox"]:checked {
            background-color: #CF0A2C;
            border-color: #CF0A2C;
          }
          .item-checkbox input[type="checkbox"]:checked::after {
            content: '✓';
            display: block;
            text-align: center;
            color: white;
            font-size: 14px;
            line-height: 18px;
          }
          .refund-reason {
            margin-top: 10px;
            display: none;
            width: 100%;
          }
          .refund-reason input {
            width: 100%;
            padding: 8px;
            border: 1px solid #eee;
            border-radius: 4px;
            font-size: 12px;
            box-sizing: border-box;
          }
          .refund-reason input:focus {
            border-color: #CF0A2C !important;
            outline: none !important;
          }
          .submit-button, .cancel-button {
            display: inline-block;
            padding: 8px 15px; /* Juster padding for knappene */
            font-size: 14px; /* Mindre skriftstørrelse */
            color: #CF0A2C !important;
            background-color: #fff !important;
            border: 1px solid #CF0A2C !important;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
          }
          .submit-button:hover {
            background-color: #CF0A2C !important;
            color: #fff !important;
          }
          .cancel-button:hover {
            background-color: #CF0A2C !important;
            color: #fff !important;
          }
          .error-message {
            color: #CF0A2C;
            font-size: 12px;
            margin-top: 5px;
          }
        </style>
        <div class="return-request-container">
          <div class="return-request-title">Returforespørsel</div>
          <div class="order-number">Ordrenummer: ${ordrenummer}</div>
          ${splitProducts
            .map(
              (produkt, index) => `
            <div class="return-item">
              <div class="item-content">
                <img class="item-image" src="${
                  produkt.bildelink || defaultImageURL
                }" alt="${produkt.varenavn}" />
                <div class="item-details">
                  <div class="item-name">${produkt.varenavn}</div>
                  <div class="item-code">Produktkode: ${produkt.product_id || 'Ikke tilgjengelig'}</div>
                  <div class="item-price">kr ${Number(produkt.ordrekostnad).toFixed(2)}</div>
                </div>
                <div class="item-checkbox">
                  <input type="checkbox" id="item-${index}" ${produkt.selected ? 'checked' : ''}>
                </div>
              </div>
              <div class="refund-reason" id="refund-reason-${index}" ${produkt.selected ? 'style="display: block;"' : ''}>
                <input type="text" placeholder="Vennligst oppgi årsak for retur" value="${produkt.reason || ''}">
                <div class="error-message" id="error-${index}" style="display: none;">Årsak er påkrevd</div>
              </div>
            </div>
          `
            )
            .join('')}
          <button class="submit-button">Send</button>
          <button class="cancel-button">Avbryt</button>
        </div>
      `;
  
      const checkboxes = returnRequestContainer.querySelectorAll('input[type="checkbox"]');
      const refundReasons = returnRequestContainer.querySelectorAll('.refund-reason');
      const submitButton = returnRequestContainer.querySelector('.submit-button');
      const cancelButton = returnRequestContainer.querySelector('.cancel-button');
  
      checkboxes.forEach((checkbox, index) => {
        checkbox.addEventListener('change', () => {
          refundReasons[index].style.display = checkbox.checked ? 'block' : 'none';
        });
      });
  
      submitButton.addEventListener('click', () => {
        let isValid = true;
        const selectedItems = Array.from(checkboxes)
          .map((checkbox, index) => {
            const reasonInput = refundReasons[index].querySelector('input');
            const errorMessage = refundReasons[index].querySelector('.error-message');
  
            if (checkbox.checked) {
              if (!reasonInput.value.trim()) {
                reasonInput.classList.add('error');
                errorMessage.style.display = 'block';
                isValid = false;
              } else {
                reasonInput.classList.remove('error');
                errorMessage.style.display = 'none';
              }
              return {
                ...splitProducts[index],
                selected: true,
                reason: reasonInput.value,
              };
            }
            return null;
          })
          .filter(Boolean);
  
        if (isValid) {
          returnRequestContainer.classList.add('disabled');
          const inputs = returnRequestContainer.querySelectorAll('input, button');
          inputs.forEach((input) => (input.disabled = true));
  
          submitButton.disabled = true;
          cancelButton.disabled = true;
  
          window.voiceflow.chat.interact({
            type: 'submitted',
            payload: { selectedItems },
          });
        }
      });
  
      cancelButton.addEventListener('click', () => {
        window.voiceflow.chat.interact({
          type: 'cancelled',
        });
      });
  
      element.appendChild(returnRequestContainer);
    },
  };
  




  const FormExtension = {
  name: 'Forms',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'Custom_Form' || trace.payload.name === 'Custom_Form',
  render: ({ trace, element }) => {
    const formContainer = document.createElement('form');

    formContainer.innerHTML = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap');
    
    form {
      font-family: 'Roboto', sans-serif;
      max-width: 100%;
      margin: auto;
      padding: 0px;
      background-color: transparent;
      border-radius: 8px;
    }

    label {
      font-size: 1em;
      color: #333;
      display: block;
      margin: 10px 0 5px;
      font-weight: 500;
    }

    input[type="text"], input[type="email"], textarea {
      width: 100%;
      border: 2px solid #3480c2; /* Tykkere kant med ønsket farge */
      background-color: #fff;
      color: #333;
      margin: 10px 0;
      padding: 10px;
      outline: none;
      font-size: 1em;
      font-family: Arial, sans-serif; /* Bytter til Arial */
      border-radius: 8px; /* Avrundede hjørner */
      box-sizing: border-box;
    }

    textarea {
      height: 100px;
    }

    .invalid {
      border-color: red;
    }

    .submit {
      background-color: #3480c2; /* Samme farge som borderen */
      border: none;
      color: white;
      padding: 12px;
      border-radius: 8px; /* Avrundede hjørner */
      margin-top: 20px;
      width: 100%;
      cursor: pointer;
      font-size: 1em;
      font-weight: 500;
    }
  </style>

  <label for="name">Navn</label>
  <input type="text" class="name" name="name" required><br>

  <label for="email">E-post</label>
  <input type="email" class="email" name="email" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$" title="Invalid email address"><br>

  <label for="message">Melding</label>
  <textarea class="message" name="message" required></textarea><br>

  <input type="submit" class="submit" value="Send">
`;

    formContainer.addEventListener('input', function () {
      const name = formContainer.querySelector('.name');
      const email = formContainer.querySelector('.email');
      const message = formContainer.querySelector('.message');

      if (name.checkValidity()) name.classList.remove('invalid');
      if (email.checkValidity()) email.classList.remove('invalid');
      if (message.checkValidity()) message.classList.remove('invalid');
    });

    formContainer.addEventListener('submit', function (event) {
      event.preventDefault();

      const name = formContainer.querySelector('.name');
      const email = formContainer.querySelector('.email');
      const message = formContainer.querySelector('.message');

      if (
        !name.checkValidity() ||
        !email.checkValidity() ||
        !message.checkValidity()
      ) {
        name.classList.add('invalid');
        email.classList.add('invalid');
        message.classList.add('invalid');
        return;
      }

      formContainer.querySelector('.submit').remove();

      window.voiceflow.chat.interact({
        type: 'complete',
        payload: {
          name: name.value,
          email: email.value,
          message: message.value,
        },
      });
    });

    element.appendChild(formContainer);
  },
};
  
  
  
  const DoneAnimationExtension = {
    name: 'DoneAnimation',
    type: 'response',
    match: ({ trace }) =>
      trace.type === 'ext_doneAnimation' ||
      trace.payload.name === 'ext_doneAnimation',
    render: async ({ trace, element }) => {
      window.vf_done = true;
      await new Promise((resolve) => setTimeout(resolve, 250));
  
      window.voiceflow.chat.interact({
        type: 'continue',
      });
  
      // Finn hele meldingsbeholderen som inneholder animasjonen
      const messageContainer = element.closest('.vfrc-system-response');
      if (messageContainer) {
        messageContainer.remove(); // Fjern hele meldingsboksen
      } else {
        element.remove(); // Hvis meldingsbeholderen ikke finnes, fjern kun animasjonselementet
      }
    },
  };
  
    
    
  const WaitingAnimationExtension = {
    name: 'WaitingAnimation',
    type: 'response',
    match: ({ trace }) =>
      trace.type === 'ext_waitingAnimation' ||
      trace.payload.name === 'ext_waitingAnimation',
    render: async ({ trace, element }) => {
      window.vf_done = true;
      await new Promise((resolve) => setTimeout(resolve, 250));
  
      const text = trace.payload?.text || 'Vennligst vent...';
      const delay = trace.payload?.delay || 3000;
  
      const waitingContainer = document.createElement('div');
      waitingContainer.innerHTML = `
        <style>
          .vfrc-message--extension-WaitingAnimation {
            background-color: transparent !important;
            background: none !important;
          }
          .waiting-animation-container {
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: 300;
            color: #fffc;
            display: flex;
            align-items: center;
          }
          .waiting-text {
            display: inline-block;
            margin-left: 10px;
          }
          .waiting-letter {
            display: inline-block;
            animation: shine 1s linear infinite;
          }
          @keyframes shine {
            0%, 100% { color: #fffc; }
            50% { color: #000; }
          }
          .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #fffc;
            border-top: 2px solid #CF0A2C;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
        <div class="waiting-animation-container">
          <div class="spinner"></div>
          <span class="waiting-text">${text
            .split('')
            .map(
              (letter, index) =>
                letter === ' '
                  ? ' '
                  : `<span class="waiting-letter" style="animation-delay: ${
                      index * (1000 / text.length)
                    }ms">${letter}</span>`
            )
            .join('')}</span>
        </div>
      `;
  
      element.appendChild(waitingContainer);
  
      window.voiceflow.chat.interact({
        type: 'continue',
      });
  
      let intervalCleared = false;
      window.vf_done = false;
  
      const checkDoneInterval = setInterval(() => {
        if (window.vf_done) {
          clearInterval(checkDoneInterval);
  
          // Fjern hele meldingscontaineren inkludert avatar og melding
          const systemResponseContainer = element.closest('.vfrc-system-response');
          
          if (systemResponseContainer) {
            systemResponseContainer.remove();  // Fjern hele meldingsboksen (inkludert avatar og tekstboks)
          } else {
            waitingContainer.remove();  // Fjern animasjonen dersom ingen meldingsboks finnes
          }
  
          // Legg til margin til den neste meldingen
          const nextMessage = document.querySelector('.vfrc-message');
          if (nextMessage) {
            nextMessage.style.marginTop = '15px';  // Legg til ekstra margin etter animasjonen fjernes
          }
  
          window.vf_done = false;
          intervalCleared = true;
        }
      }, 100);
  
      setTimeout(() => {
        if (!intervalCleared) {
          clearInterval(checkDoneInterval);
          
          // Fjern hele meldingscontaineren også ved timeout
          const systemResponseContainer = element.closest('.vfrc-system-response');
          
          if (systemResponseContainer) {
            systemResponseContainer.remove();  // Fjern hele meldingsboksen
          } else {
            waitingContainer.remove();  // Fjern animasjonen dersom ingen meldingsboks finnes
          }
  
          // Finn neste melding etter animasjonen er fjernet, og legg til margin
          const nextMessage = element.nextElementSibling;
          if (nextMessage && nextMessage.classList.contains('vfrc-message')) {
            nextMessage.style.marginTop = '15px';  // Juster margin etter at animasjonen fjernes
          }
        }
      }, delay);
    },
  };
