chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let activeTab = tabs[0].url;
    document.addEventListener('settingsConfirmed', function() {
        var ratingInput = document.getElementById('ratingRange');
    
        // Load saved settings from storage
        chrome.storage.sync.get(['ratingRange'], function(data) {
            var savedRating = data.ratingRange;
            if (savedRating) {
                ratingInput.value = savedRating;
            }
        });
    
        // Update storage when country selection changes
        countrySelect.addEventListener('change', function() {
            var selectedCountry = countrySelect.value;
            chrome.storage.sync.set({ 'countryFilter': selectedCountry });
        });
    
        // Update storage when rating input changes
        ratingInput.addEventListener('change', function() {
            var selectedRating = parseInt(ratingInput.value);
            chrome.storage.sync.set({ 'ratingRange': selectedRating });
        });
    });
});