function createFilterElement(filter) {
    console.log(filter);

    var listItem = document.createElement('li');
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = filter.enabled;
    listItem.appendChild(checkbox);

    checkbox.addEventListener('change', () => {
        filter.enabled = checkbox.checked;
    });

    var filterLabel = document.createElement('input');
    filterLabel.type = 'text';
    filterLabel.value = filter.expression;
    listItem.appendChild(filterLabel);

    var deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'X';
    deleteButton.title = 'Remove filter';
    listItem.appendChild(deleteButton);

    deleteButton.addEventListener('click', () => {
        listItem.classList.toggle('to-remove');
    });

    return listItem;
}

// Load saved rating range from storage
chrome.storage.sync.get(['ratingRange'], (data) => {
    var savedRating = data.ratingRange;

    if (savedRating) {
        var currentRatingRange = document.getElementById('ratingRangeVal');
        currentRatingRange.innerHTML = "Current: " + savedRating;
    }
});

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

// Add new filter
function addFilter() {
    var filter = document.getElementById('new-filter').value;
    var filterList = document.getElementById('filter-list');

    if (filter) {
        var newFilter = createFilterElement({expression: filter, enabled: true});
        filterList.appendChild(newFilter);
    }

    document.getElementById('new-filter').value = '';
}

document.getElementById('new-filter').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addFilter();
    }
});

document.getElementById('add-filter').addEventListener('click', function() {
    addFilter();
});

// Event listener for confirm button click
document.getElementById('confirmSettings').addEventListener('click', function() {

    // Save filter list
    var filters = [];
    var filterList = document.getElementById('filter-list');
    filterList.childNodes.forEach((filter) => {
        if (filter.classList.contains('to-remove')) return;
        var filterLabel = filter.querySelector('input[type="text"]');
        if (filterLabel.value == '') return;
        filters.push({expression: filterLabel.value, enabled: true});
    });

    // Save filters to storage
    chrome.storage.sync.set({'filters': filters });

    // Save rating range
    var ratingInput = document.getElementById('ratingRange');
    var selectedRating = parseInt(ratingInput.value);

    chrome.storage.sync.set({'ratingRange': selectedRating });

    location.reload();
});
