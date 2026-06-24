var params = {
    srcDpaId: "88958fe3-f423-4b9a-a2d1-0e013c19ea2d", // required DPA Identifier, generated during registration.
    dpaData: {
        dpaName: "CTP DEMO"       //required
    },
    dpaTransactionOptions: {
        confirmPayment: false,
        transactionAmount: { transactionAmount: 50, transactionCurrencyCode: "AUD" }, // optional - Passkey
        dpaLocale: "en_AU",      // required
        merchantCategoryCode: "0001", // optional - Passkey
        merchantCountryCode: "AU", // optional - Passkey
        acquirerData: [
            {
                cardBrand: "mastercard",
                acquirerMerchantId: "SRC3DS",
                acquirerBIN: "545301"
            },
            {
                "cardBrand": "visa",
                "acquirerMerchantId": "33334444",
                "acquirerBIN": "432104"
            }
        ], // optional - Passkey
        authenticationPreferences: {
          payloadRequested: "AUTHENTICATED" // optional - Passkey
        },
        paymentOptions: [
          { dynamicDataType:"CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM" }// optional - Passkey
        ]
    },
    cardBrands: ["mastercard"], // required. Array of card brands supported.
    checkoutExperience: "WITHIN_CHECKOUT", // optional ('WITHIN_CHECKOUT', 'PAYMENT_SETTINGS')
    // services: 'INLINE_CHECKOUT', //optional ('INLINE_CHECKOUT', 'INLINE_INSTALLMENTS')
   //recognitionToken : "eyJraWQiOiIyMDIzMDIwODA4NTE1Ny1zYW5kYm94LWlkZW50aXR5LXZlcmlmaWNhdGlvbi1zcmMtbWFzdGVyY2FyZC1pbnQiLCJ0eXAiOiJKV1QrZXh0LnJlY29nbml0aW9uX3Rva2VuIiwiYWxnIjoiUlMyNTYifQ.eyJhcHBJbnN0YW5jZUlkIjoiMDVkMjc3YWMtN2MwZS00Mjc2LWE4ZmItN2Q1NWY5MGM4NGYyIiwiYXVkIjoiaHR0cHM6XC9cL21hc3RlcmNhcmQuY29tIiwiY29uc3VtZXJJZCI6Ijk0Yzc1NzRiLWYzNzktNDlmYi1iMjE4LThmNGI3MTAwNTUzYiIsInNyY2lDbGllbnRJZCI6IjU0NGVmODFhLWRhZTAtNGYyNi05NTExLWJmYmRiYTNkNjJiNSIsImlzcyI6Imh0dHBzOlwvXC9tYXN0ZXJjYXJkLmNvbSIsInNjb3BlcyI6WyJERUZBVUxUIl0sImV4cCI6MTc5MjI5NjQ1OCwiaWF0IjoxNzc2NzQ0NDU4LCJqdGkiOiJlYjQ2Yzk1ZS0zMzc0LTQ0ZjQtOWY3Mi03Y2JmMGJmMTNhMDYiLCJwcm9ncmFtSWQiOiJTUkMifQ.jfutjEpdfV9j47NckgoPIS1qSC3p_vpyW2rF_qwigOSCxwCA0HYh61tYS2FrzFKuU9et5y-y8g5jeC8oznnbI5LhAksQVVn6o7JlzxkT872j3h5WFPk4hf1Cpbbk_m1ZBdnP7skLOR8JwDbr_ucuj6VSnhYMWD-xShLLxbklf8HZGHGGfpjBpSiaeqEjlE4ulRpJ5D2dIUs_Vna3VmgG5iJjE3kIP9QKtWUYiRf0exJlrR1RYyI-z3LrB1FkNEAlD0QA22zw77leRwkzQq2Hx5rmB4JWd7-jwMyopAm2_orQ_l2mIDPf43sqsFRTFG15sUMGnU21CzuCuwxoQOrSfA"
 }
var mcCheckoutService = new MastercardCheckoutServices();
var globalCardsList;
// window.localStorage.setItem('c2p.enable_passkeys', 'true');

// STEP1 (OnLoad) ************************************************************************
async function initializeMastercardCheckoutServices() {
try {
     cardListDiv.style.display = "none";

        var result = await mcCheckoutService.init(params)     
        console.log({ result });
        getCardsHandler(); 
    } 
    catch (error) {  // handle error
        console.log( { error });
    }
}
async function getCardsHandler () {
    try {
    const promiseResolvedPayload = await window.mcCheckoutService.getCards()
    console.log({ promiseResolvedPayload });
    if(promiseResolvedPayload && promiseResolvedPayload.length > 0) {
      globalCardsList = promiseResolvedPayload;
    }
    } catch (promiseRejectedPayload) {
      console.log({ promiseRejectedPayload });
    }
}

// STEP2 (On info Submit) ************************************************************************
// Authenticate and load card-list
async function authenticateHandler (formElement) { 

 if(globalCardsList) {
  initializeCardList(globalCardsList);
  return;
}

const otpEmbedded = document.getElementById("OTPCheckbox");
var otpFrameElement;
const modal = document.getElementById("otp-modal");

if(otpEmbedded.checked){
  form.style.display = "none";
  otpFrameElement = document.getElementById("otpEmbFrame");
  showAlert("otp-div");
}
else{
  otpFrameElement = document.getElementById("otpFrame");
  
  modal.classList.add("open");
} 

// Get values using input names
const email = formElement.email.value;
const mobile = formElement.mobile.value;

  var requestParameters = {
        "windowRef": otpFrameElement.contentWindow,
        "accountReference": {
            "consumerIdentity": {
            "identityType": "EMAIL_ADDRESS",
            "identityValue": email
            }
        },
        "requestRecognitionToken": true
    }
    try {
        const promiseResolvedPayload = await window.mcCheckoutService.authenticate(requestParameters);
        console.log({ promiseResolvedPayload });
        modal.classList.remove("open");
        hideAlert("otp-div");
        if(promiseResolvedPayload.cards.length > 0) {
            console.log(promiseResolvedPayload.cards[0].srcDigitalCardId);
            initializeCardList(promiseResolvedPayload.cards);
        } else {
            showAlert("myAlert");
        }
       
    } catch (promiseRejectedPayload) {
         console.log({ promiseRejectedPayload });
    }
}

async function initializeCardList(maskedCardData) {
  form.style.display = "none";
  cardListDiv.style.display = "block";

const srcCardList = document.getElementById("srcCardList");
  srcCardList.loadCards(maskedCardData);
  srcCardList.addEventListener('selectSrcDigitalCardId', function (event) {
    console.log('srcDigitalCardId: ', event.detail);
    if(event.detail) {
        checkoutWithCardHandler(event.detail);
    }
  });
};


function openCenteredPopup(url, title, w, h) {
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

  const width = window.innerWidth || document.documentElement.clientWidth || screen.width;
  const height = window.innerHeight || document.documentElement.clientHeight || screen.height;

  const left = dualScreenLeft + (width - w) / 2;
  const top = dualScreenTop + (height - h) / 2;

  const newWindow = window.open(
    url,
    title,
    `scrollbars=yes,width=${w},height=${h},top=${top},left=${left}`
  );

  if (newWindow && newWindow.focus) {
    newWindow.focus();
  }

  return newWindow;
}


async function checkoutWithCardHandler (digitalCardId) { 
  try {
    //  const modal = document.getElementById("c2p-modal");
    //  modal.classList.add("open");

  //  const popup = window.open("", "mcPopup", "width=500,height=600");
    const popup = openCenteredPopup("", "mcPopup", 470, 700);

    const paramsCheckOut = 
    {
        // windowRef: document.getElementById("ctpFrame").contentWindow, // required.
        windowRef: popup,
        srcDigitalCardId: digitalCardId, // optional.
        dpaTransactionOptions: params.dpaTransactionOptions, // optional.
    }

   const promiseResolvedPayload = await window.mcCheckoutService.checkoutWithCard(paramsCheckOut)

   if(promiseResolvedPayload && promiseResolvedPayload.checkoutActionCode == "COMPLETE") {
    cardListDiv.style.display = "none";
    showAlert("myOrderAlert");
   } else {
    showAlert("errorAlert");
   }
    console.log({ promiseResolvedPayload });
    // modal.classList.remove("open");
    popup.close();
  } catch (promiseRejectedPayload) {
    console.log({ promiseRejectedPayload });
    showAlert("errorAlert");
  }
}

const form = document.getElementById("checkoutForm");
const cardListDiv = document.getElementById("card-list-div");

  form.addEventListener("submit", function(event) {
    hideAlert("myAlert");
    event.preventDefault(); // Prevents the default page reload
    console.log({ event });
    authenticateHandler(event.target);
  });
initializeMastercardCheckoutServices();

function showAlert(element) {
  document.getElementById(element).classList.remove("d-none");
}

function hideAlert(element) {
  document.getElementById(element).classList.add("d-none");
}

const lookupEmailBtnElement = document.getElementById("lookupEmail").addEventListener("click", function(event){
  const emailStr = document.getElementById("email").value;
  var iDLookupParams = {
                email : emailStr
  };
  idLookupHandler(iDLookupParams);
});

const lookupPhoneBtnElement = document.getElementById("lookupMobile").addEventListener("click", function(event){
  const mobileStr = document.getElementById("mobile").value;
  var iDLookupParams = {
                mobileNumber: {
                                countryCode: "61",
                                phoneNumber: mobileStr
                               }
  };
  idLookupHandler(iDLookupParams);
});

async function idLookupHandler (iDLookupParams) { // this method will return a promise
  try {
    const promiseResolvedPayload = await window.mcCheckoutService.idLookup(iDLookupParams)
    console.log("Consumer Exists:", promiseResolvedPayload.consumerPresent)
  } catch (promiseRejectedPayload) {
    console.log({ promiseRejectedPayload });
  }
}