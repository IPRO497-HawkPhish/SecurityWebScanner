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
  var longUrlUnsafe = false;
  var rating = 5; // out of 5 stars
  var popupRatingRange = 3;
  let questionableLinks = [];
  let countries = [];
  let unsafeDomains = ['.cf', '.work', '.ml', '.ga', '.gq', '.fit', '.tk', '.ru', '.to', '.live', '.cn', '.top', '.xyz', '.pw', '.ws', '.cc', '.buzz'];

  chrome.storage.sync.get(['ratingRange', 'countryURL_Filter'], function(data){
    if (data.ratingRange != null){
      popupRatingRange = data.ratingRange;
    }
    if (data.countries != null){
      countries = data.countries;
    }
  });

  function fetchData() {
    let event = new Date();
    timeAccessed = event.toString();
    pageTitle = document.title;
    pageURL = window.location.href;

    // Check anchor tags on the page
    let anchors = document.getElementsByTagName('a');
    for (let anchor of anchors) {
      let href = anchor.getAttribute('href');
      if (href == null || href == "") continue;
      let tld = href.substring(href.lastIndexOf("."));
      
      //reduce rating if questionable link is found
      if (href.includes('http://')) {
        questionableLinks.push(href);
        rating -= 0.5;
      }

      else if (href.includes('@')) {
        questionableLinks.push(href);
        rating -= 0.5;
      }

      else if (unsafeDomains.includes(tld)) {
        questionableLinks.push(href);
        rating -= 0.5;
      }
    }
  };

  // For end-to-end
  function makeJSON(data) {
    return JSON.stringify(data, null, 2);
  };

  // SECURITY CHECKS

  // Lower rating by 1.5 if URL is not https
  // Author: Na'im (and Lucas for rating/report)
  function isNotHttps() {
    if (window.location.protocol !== 'https:') {
      rating -= 1.5;
      httpsUnsafe = true;
      issues.push({ reason: "This URL does not follow HTTPS protocol.", description: "HTTPS encrypts your connection to the website, making it more secure. If you continue, do not enter any personal information on this page." });
    }
  };

  // Lower rating by 1 if URL is treated by a link shortener
  // Author: Kate (?) (and Lucas for rating/report)
  function isShortened() {
    pageURL = window.location.href;
    if ((pageURL.includes('bit.ly')) || (pageURL.includes('tinyurl'))) {
      rating -= 1;
      shortUnsafe = true;
      issues.push({ reason: "This URL was treated by a link shortener.", description: "Link shorteners can be used to hide the true URL." })
    }
  };

  // Lower rating by 2.5 if URL contains @ symbol (common phishing tactic)
  // Author: Lucas
  function hasAt() {
    pageURL = window.location.href;
    if (pageURL.includes('@')) {
      rating -= 2.5;
      atUnsafe = true;
      issues.push({ reason: "This URL contains an @ symbol.", description: "This could be a phishing attempt." })
    }
  };

  // Lower rating by 2 if TLD (domain extension) is deemed unsafe
  // Co-authors: Kate and Lucas
  function unsafeExtension() {
    pageURL = window.location.href;
    tld = pageURL.substring(pageURL.lastIndexOf("."));
    if (unsafeDomains.includes(tld)) {
      rating -= 2;
      extensionUnsafe = true;
      issues.push({ reason: "Unsafe top-level domain.", description: "This URL is hosted in a domain commonly associated with unsafe websites." })
    }
  }

  // Length of the URL if greater than 2048 characters then reduce -1

  function checkLongUrl() {
    pageURL = window.location.href;
    const urlLengthThreshold = 2048; // Example threshold, adjust as needed
    if (pageURL.length > urlLengthThreshold) {
      rating -= 1.0;
      longUrlUnsafe = true;
      issues.push({
        reason: "Excessively long URL detected.",
        description: "Long URLs can be indicative of suspicious or malicious intent, such as hiding complex query parameters or redirect chains."
      });
    }
  }

  // Explanation can either be a string or an HTML element
  function createIssueListItem(reason, explanation) {
    let li = document.createElement("li");
    let issueTitle = document.createElement("h2");
    let description = document.createElement("p");
    let toggle = document.createElement("span");

    li.classList.add("issue");

    issueTitle.classList.add("issue-title");
    issueTitle.innerHTML = reason;

    // Used to show the description
    toggle.classList.add("toggle");
    toggle.innerHTML = "?";
    toggle.setAttribute('title', "Show description");

    description.classList.add("description");
    if (typeof explanation === "string") {
      description.innerHTML = explanation;
    } else {
      description.appendChild(explanation);
    }
    description.classList.add("hidden");

    li.appendChild(issueTitle);
    issueTitle.appendChild(toggle);
    li.appendChild(description);

    // Toggle the description
    toggle.addEventListener('click', () => {
      console.log("CLICKED");
      if (description.classList.contains("hidden")) {
        description.classList.remove("hidden");
      } else {
        description.classList.add("hidden");
      }
    });

    return li;
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
    function createStar(src) {
      const starImg = document.createElement("img");
      starImg.src = chrome.runtime.getURL(src);
      starImg.classList.add("star");
      return starImg;
  }
  
  function getStarImage(rating, i) {
      if (i < Math.floor(rating)) {
          return rating < 3 ? "/assets/icons/icons8-star-50-rf.png" : (rating <= 4 ? "/assets/icons/star-fill.png" : "/assets/icons/icons8-star-50-gf.png");
      } else if (i === Math.floor(rating) && rating % 1 !== 0) {
          return rating < 3 ? "/assets/icons/icons8-star-half-empty-50-r.png" : (rating <= 4 ? "/assets/icons/star-half.png" : "/assets/icons/icons8-star-half-empty-50-g.png");
      } else {
          return rating < 3 ? "/assets/icons/icons8-star-50-re.png" : "/assets/icons/star-empty.png";
      }
  }
  
  let starWrapper = document.createElement("div");
  
  for (let i = 0; i < 5; i++) {
      starWrapper.appendChild(createStar(getStarImage(rating, i)));
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
    issueList.classList.add("issues-list");
    for (let issue of issues) {
      let issueElement = createIssueListItem(issue.reason, issue.description);

      issueList.appendChild(issueElement);
    }

    // Extra issue for questionable links
    if (questionableLinks.length > 0) {
      let linksList = document.createElement("ul");
      for (let link of questionableLinks) {
        let linkElement = document.createElement("li");
        
        linkElement.innerHTML = link;
        linksList.appendChild(linkElement);
      }
      let issueElement = createIssueListItem(`${questionableLinks.length} questionable links found.`, linksList);
      
      issueList.appendChild(issueElement);
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
    cancel.onclick = function () {
      window.history.back();
    };
    inputs.appendChild(cancel);

    let ok = document.createElement("button");
    ok.innerHTML = "OK";
    ok.onclick = function () {
      dialog.close();
    };
    inputs.appendChild(ok);

    document.body.appendChild(dialog);
    dialog.showModal();
  }

  function sendReportToPopup() {
    // Create JSON object for the current website
    let data = {
      "rating": rating,
      "issues": issues,
      "questionableLinks": questionableLinks,
      "ratingRange": popupRatingRange
    };

    chrome.storage.sync.set({ [pageURL]: data });
  }

  // Main function, on page load
  window.onload = function () {
    safe = true;
    window.onload = null;

    // Run security checks
    isNotHttps();
    isShortened();
    hasAt();
    unsafeExtension();
    checkLongUrl();

    if (rating < 0) {
      rating = 0;
    }
    if (rating <= popupRatingRange) {
      // Get the data for backend
      fetchData();
      const dataArray = {
        domainURL: pageURL,
        domainTitle: pageTitle,
        eventTime: timeAccessed,
        domainRating: rating,
        reasonNoHttps: httpsUnsafe,
        reasonShortened: shortUnsafe,
        reasonAtSymbol: atUnsafe,
        reasonBadExtension: extensionUnsafe,
        clicked_count: 0
      };
      fetch('http://ec2-18-223-137-231.us-east-2.compute.amazonaws.com:8000/frontendAPI/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if required (e.g., authentication headers)
        },
        body: JSON.stringify(dataArray),
        mode: 'no-cors',
      })
      .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();  // Assuming the server returns JSON data
      })
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
      // Show user the rating, security report, and prompt them to go back
      showSecurityPrompt();
      sendReportToPopup();
    }
    /* else {
      window.alert("This page is secure; its HawkPhish Security Rating is " + rating + " stars.");
    } */
  };
}

