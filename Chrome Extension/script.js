{
  // Data variables
  var timeAccessed;
  var pageTitle;
  var pageURL;

  // Security variables (for report)
  let issues = [];
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
      issues.push({reason: "This URL does not follow HTTPS protocol.", description: "HTTPS encrypts your connection to the website, making it more secure. If you continue, do not enter any personal information on this page."});
    }
  };
  
  // Lower rating by 1 if URL is treated by a link shortener
  // Author: Kate (?) (and Lucas for rating/report)
  function isShortened() {
    pageURL = window.location.href;
    if ((pageURL.includes('bit.ly')) || (pageURL.includes('tinyurl'))){
      rating -= 1;
      shortUnsafe = true;
      issues.push({reason: "This URL was treated by a link shortener.", description: "Link shorteners can be used to hide the true URL."})
    }
  };

  // Lower rating by 2.5 if URL contains @ symbol (common phishing tactic)
  // Author: Lucas
  function hasAt() {
    pageURL = window.location.href;
    if (pageURL.includes('@')){
      rating -= 2.5;
      atUnsafe = true;
      issues.push({reason: "This URL contains an @ symbol.", description: "This could be a phishing attempt."})
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
      issues.push({reason: "Unsafe top-level domain.", description: "This URL is hosted in a domain commonly associated with unsafe websites."})
    }
  }

  function showSecurityPrompt() {
    let dialog = document.createElement("dialog");
    dialog.setAttribute('id', 'security-dialog');

    // Wrapper for the prompt (avoids issues with display: flex)
    let prompt = document.createElement("section");
    prompt.setAttribute('id', 'security-prompt');
    dialog.appendChild(prompt);

    // Header
    let header = document.createElement("h1");
    header.innerHTML = "HawkPhish Security Warning";
    prompt.appendChild(header);

    // Star Rating
    let starWrapper = document.createElement("div");

    for (i = 5 - rating; i < 5; i++) {
      var starImg = document.createElement("img");
      starImg.src = "https://i.pinimg.com/originals/6d/00/9e/6d009e1b243cc054596b94082499e2ce.png";
      starImg.classList.add("star");
      starWrapper.appendChild(starImg);
      if (rating % 1 != 0) {
        // adding the half star
      }
    }
    prompt.appendChild(starWrapper);
    
    // Security report
    let report = document.createElement("section");
    report.setAttribute('id', 'security-report');
    let reportHeader = document.createElement("p");
    reportHeader.innerHTML = "This page could be unsafe; its HawkPhish Security Rating is " + rating + " stars. This page's vulnerabilities are:";
    report.appendChild(reportHeader);

    // Vulnerabilities
    let issueList = document.createElement("ol");
    for (let issue of issues) {
      let li = document.createElement("li");
      let issueTitle = document.createElement("h2");
      let description = document.createElement("p");
      let toggle = document.createElement("span");

      li.classList.add("issue");
      
      issueTitle.classList.add("issue-title");
      issueTitle.innerHTML = issue.reason;

      // Used to show the description
      toggle.classList.add("toggle");
      toggle.innerHTML = "?";
      toggle.setAttribute('title', "Show description");
      
      description.classList.add("description");
      description.innerHTML = issue.description;
      description.classList.add("hidden");
      
      li.appendChild(issueTitle);
      issueTitle.appendChild(toggle);
      li.appendChild(description);
      issueList.appendChild(li);

      // Toggle the description
      toggle.addEventListener('click', () => {
        console.log("CLICKED");
        if (description.classList.contains("hidden")) {
          description.classList.remove("hidden");
        } else {
          description.classList.add("hidden");
        }
      });
    }
    report.appendChild(issueList);

    let reportFooter = document.createElement("p");
    reportFooter.innerHTML += "We recommend you press Cancel to return to the previous page now. If you wish to proceed at your own risk, press OK.";
    report.appendChild(reportFooter);
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
      dialog.close();
    };
    inputs.appendChild(ok);
    
    document.body.appendChild(dialog);
    dialog.showModal();
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
  
