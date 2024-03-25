chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let activeTab = tabs[0];

    // Event listener for confirm button click
    document.getElementById('confirmSettings').addEventListener('click', function() {
        var ratingInput = document.getElementById('ratingRange');
        var selectedRating = parseInt(ratingInput.value);
        
        // Get selected countries
        var selectedCountries = [];
        var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(function(checkbox) {
            selectedCountries.push(checkbox.value);
        });

        // Send message to script.js with selected countries and rating
        chrome.tabs.sendMessage(activeTab.id, { 
            action: 'updateSettings', 
            countries: selectedCountries, 
            rating: selectedRating 
        });
    });

    // Load saved settings from storage
    chrome.storage.sync.get(['ratingRange'], function(data) {
        var savedRating = data.ratingRange;
        if (savedRating) {
            ratingInput.value = savedRating;
        }
    });
});
