function initContactButton(){"computer"==deviceName?sendEmailDiv.onclick=function(){sendEmail()}:sendEmailDiv.addEventListener("touchstart",sendEmail,!1)}

function sendEmail(){
  hideContactConfirmationContainer();
  positionContactConfirmationContainer();

  var emailAddr = $("#email-address").val();
  var subject   = $("#email-subject").val();
  var message   = $("#email-message").val();

  // Validate email
  if (!emailAddr.match(/^([a-z0-9._-]+@[a-z0-9._-]+\.[a-z]{2,}$)/i)) {
    focusEmail();
    setTimeout("showContactConfirmationContainer(0)", 200);
    return false;
  }

  // Validate subject
  var hasSubject = subject.length >= 1;
  if (!hasSubject) { focusSubject(); }

  // Validate message
  var hasMessage = message.length >= 1;
  if (!hasMessage) { focusMessage(); }

  if (!hasSubject || !hasMessage) {
    setTimeout("showContactConfirmationContainer(1)", 200);
    return false;
  }

  // Show "Sending..." indicator
  setTimeout("showContactConfirmationContainer(2)", 200);

  // Send via FormSubmit AJAX (no page redirect, no backend needed)
  var formData = new FormData();
  formData.append("email",   emailAddr);
  formData.append("_replyto", emailAddr);
  formData.append("subject", subject);
  formData.append("message", message);
  formData.append("_subject", "New message from portfolio: " + subject);
  formData.append("_captcha", "false");

  fetch("https://formsubmit.co/ajax/itsmanavnagpal011@gmail.com", {
    method: "POST",
    body: formData,
    headers: { "Accept": "application/json" }
  })
  .then(function(response) { return response.json(); })
  .then(function(data) {
    hideContactConfirmationContainer();
    positionContactConfirmationContainer();
    if (data.success === "true" || data.success === true) {
      // Success
      setTimeout("showContactConfirmationContainer(4)", 200);
      clearAllInputField();
      if (window.robbyAudio) window.robbyAudio.playFanfare();
    } else {
      // Server-side error
      setTimeout("showContactConfirmationContainer(3)", 200);
    }
  })
  .catch(function() {
    hideContactConfirmationContainer();
    positionContactConfirmationContainer();
    setTimeout("showContactConfirmationContainer(3)", 200);
  });

  return false;
}

var sendEmailDiv = document.getElementById("send-email");
initContactButton();
