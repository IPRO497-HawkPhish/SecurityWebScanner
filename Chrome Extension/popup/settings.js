function createFilterElement(filter) {
    var listItem = document.createElement('li');
    var label = document.createElement('span');
    label.innerHTML = filter;
    listItem.appendChild(label);

    var editButton = document.createElement('button');
    editButton.innerHTML = 'Edit';
    listItem.appendChild(editButton);

    var deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'X';
    listItem.appendChild(deleteButton);

    deleteButton.addEventListener('click', () => {
        listItem.remove();
    });

    return listItem;
}

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let activeTab = tabs[0];

    // Load saved filters from storage
    chrome.storage.sync.get(['filters'], (data) => {
        var savedFilters = data.filters;

        if (savedFilters) {
            var filterList = document.getElementById('filter-list');

            savedFilters.forEach((filter) => {
                var newFilter = createFilterElement(filter);
                filterList.appendChild(newFilter);
            });
        }
    });

    document.getElementById('add-filter').addEventListener('click', function() {
        var filter = document.getElementById('new-filter').value;
        var filterList = document.getElementById('filter-list');

        if (filter) {
            var newFilter = createFilterElement(filter);
            filterList.appendChild(newFilter);
        }

        document.getElementById('new-filter').value = '';
    });

    // Event listener for confirm button click
    document.getElementById('confirmSettings').addEventListener('click', function() {

        // Save filter list
        var filters = [];
        var filterList = document.getElementById('filter-list');
        filterList.childNodes.forEach((filter) => {
            var label = filter.querySelector('span');
            filters.push(label.innerHTML);
        });

        // Save filters to storage
        chrome.storage.sync.set({ filters: filters });


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
