chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  let activeTab = tabs[0].url;

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

    // Show the rating for the current tab
    chrome.storage.sync.get(activeTab, function(data) {
        // Report includes rating (int), issues (list), and questionable links (list)
        let report = data[activeTab];
        var rating = report.rating;
        var issues = report.issues;
        var q_links = report.questionableLinks;

      var starWrapper = document.getElementById('star_rating');

      function getStarImage(rating, i) {
          if (i < Math.floor(rating)) {
              return rating < 3 ? "/assets/icons/icons8-star-50-rf.png" : (rating <= 4 ? "/assets/icons/star-fill.png" : "/assets/icons/icons8-star-50-gf.png");
          } else if (i === Math.floor(rating) && rating % 1 !== 0) {
              return rating < 3 ? "/assets/icons/icons8-star-half-empty-50-r.png" : (rating <= 4 ? "/assets/icons/star-half.png" : "/assets/icons/icons8-star-half-empty-50-g.png");
          } else {
              return rating < 3 ? "/assets/icons/icons8-star-50-re.png" : "/assets/icons/star-empty.png";
          }
      }

      function createStar(src) {
          const starImg = document.createElement("img");
          starImg.src = chrome.runtime.getURL(src);
          starImg.classList.add("star");
          return starImg;
      }
      
      starWrapper.innerHTML = ''; // Clear existing stars before appending new ones
      for (let i = 0; i < 5; i++) {
          starWrapper.appendChild(createStar(getStarImage(rating, i)));
      }

      // Display the safety message if the rating is 5
      var safetyMessage = document.getElementById('safety_message');
      if (rating >= 5) {
          safetyMessage.style.display = 'block';
      } else {
          safetyMessage.style.display = 'none';
      }
      
      var issueWrapper = document.getElementById('page_issues');

      let issueList = document.createElement("ol");
      issueList.classList.add("issues-list");
      for (let issue of issues) {
          let issueElement = createIssueListItem(issue.reason, issue.description);
          issueList.appendChild(issueElement);
      }

      if (q_links.length > 0) {
          let linksList = document.createElement("ul");
          for (let link of q_links) {
              let linkElement = document.createElement("li");
              linkElement.innerHTML = link;
              linksList.appendChild(linkElement);
          }
          let issueElement = createIssueListItem(`${q_links.length} questionable links found.`, linksList);
          issueList.appendChild(issueElement);
      }
      issueWrapper.appendChild(issueList);
  });
});