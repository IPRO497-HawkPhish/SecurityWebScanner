{
  // Data variables
  var timeAccessed;
  var pageTitle;
  var pageURL;

  // Security variables (for report)
  var httpsString = "";
  var shortString = "";
  var atString = "";
  var extensionString = "";
  var httpsUnsafe = false;
  var shortUnsafe = false;
  var atUnsafe = false;
  var extensionUnsafe = false;

  var rating = 5; // out of 5 stars
  
  function fetchData() {
    let event = new Date();
    timeAccessed = event.toString();
    pageTitle = document.title;
    pageURL = window.location.href;
  };
  
  // For end-to-end
  function makeJSON(data) {
    return JSON.stringify(data, null, 2);
  };

  // SECURITY CHECKS

  // Lower rating by 1.5 if URL is not https
  // Author: Na'im (and Lucas for rating/report)
  function isNotHttps() {
    if(window.location.protocol !== 'https:'){
      rating -= 1.5;
      httpsUnsafe = true;
      httpsString = "- This URL does not follow HTTPS protocol. HTTPS guarantees a secure connection.\n";
    }
  };
  
  // Lower rating by 1 if URL is treated by a link shortener
  // Author: Kate (?) (and Lucas for rating/report)
  function isShortened() {
    pageURL = window.location.href;
    if ((pageURL.includes('bit.ly')) || (pageURL.includes('tinyurl'))){
      rating -= 1;
      shortUnsafe = true;
      shortString = "- This URL was treated by a link shortener, possibly to hide the true URL.\n";
    }
  };

  // Lower rating by 2.5 if URL contains @ symbol (common phishing tactic)
  // Author: Lucas
  function hasAt() {
    pageURL = window.location.href;
    if (pageURL.includes('@')){
      rating -= 2.5;
      atUnsafe = true;
      atString = "- This URL contains an @ symbol. It could be trying to redirect you somewhere else.\n";
    }
  };

  // Lower rating by 2 if TLD (domain extension) is deemed unsafe
  // Co-authors: Kate and Lucas
  function unsafeExtension() {
    pageURL = window.location.href;
    tld = pageURL.substring(pageURL.lastIndexOf("."));
    unsafeDomains = ['.cf', '.work', '.ml', '.ga', '.gq', '.fit', '.tk', '.ru', '.to', '.live', '.cn', '.top', '.xyz', '.pw', '.ws', '.cc', '.buzz'];
    if (unsafeDomains.includes(tld)) {
      rating -= 2;
      extensionUnsafe = true;
      extensionString = "- Unsafe top-level domain: this page is being hosted in a domain commonly associated with unsafe websites.\n";
    }
  }

  function showSecurityPrompt() {
    let prompt = document.createElement("dialog");
    prompt.setAttribute('id', 'security-prompt');

    // Header
    let header = document.createElement("h1");
    header.innerHTML = "HawkPhish Security Warning";
    prompt.appendChild(header);
    
    // Security report
    let report = document.createElement("p");
    report.innerHTML = "This page could be unsafe; its HawkPhish Security Rating is " + rating + " stars.\n\nThis page's vulnerabilities are:\n" + atString + extensionString + httpsString + shortString + "\nWe recommend you press Cancel to return to the previous page now. If you wish to proceed at your own risk, press OK.";
    prompt.appendChild(report);

    // User input
    let inputs = document.createElement("section");
    inputs.classList.add("inputs");
    prompt.appendChild(inputs);
    let cancel = document.createElement("button");
    cancel.classList.add("suggested-action");
    cancel.innerHTML = "Cancel";
    cancel.onclick = function() {
      window.history.back();
    };
    inputs.appendChild(cancel);

    let ok = document.createElement("button");
    ok.innerHTML = "OK";
    ok.onclick = function() {
      prompt.close();
    };
    inputs.appendChild(ok);
    
    document.body.appendChild(prompt);
    prompt.showModal();
  }
  
  // Main function, on page load
  window.onload = function() {
    safe = true;
    window.onload = null;

    // Run security checks
    isNotHttps();
    isShortened();
    hasAt();
    unsafeExtension();
    
    if (rating < 0){
      rating = 0;
    }
    if (rating <= 3.5){
      // Get the data for backend
      fetchData();
      const dataArray = {
        eventTime: timeAccessed,
        domainTitle: pageTitle,
        domainURL: pageURL,
        domainRating: rating,
        reasonNoHttps: httpsUnsafe,
        reasonShortened: shortUnsafe,
        reasonAtSymbol: atUnsafe,
        reasonBadExtension: extensionUnsafe
      };
      console.log(makeJSON(dataArray));
      // Show user the rating, security report, and prompt them to go back
      showSecurityPrompt();
    }
    /* else {
      window.alert("This page is secure; its HawkPhish Security Rating is " + rating + " stars.");
    } */
  };
}
  