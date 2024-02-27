// Get the active tab
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let activeTab = tabs[0].url;

    // Show the rating for the current tab
    chrome.storage.sync.get(activeTab, function(data) {
        // Report includes rating (int), issues (list), and questionable links (list)
        let report = data[activeTab];

        document.querySelector('.popup-header').innerHTML = report.rating;
    });
});

