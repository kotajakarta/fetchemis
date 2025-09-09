document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const fetchForm = document.getElementById('fetch-form');
    const refreshBtn = document.getElementById('refresh-btn');
    const downloadBtn = document.getElementById('download-btn');
    const statusMessage = document.getElementById('status-message');
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');
    const pagination = document.getElementById('pagination');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const showingStart = document.getElementById('showing-start');
    const showingEnd = document.getElementById('showing-end');
    const totalItems = document.getElementById('total-items');
    const loadingIcon = document.getElementById('loading-icon');
    const btnText = document.getElementById('btn-text');

    // State
    let currentData = [];
    let currentPage = 1;
    let itemsPerPage = 10;
    let lastParameters = {};

    // Initialize date input to today
    const dateInput = document.getElementById('date');
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    dateInput.value = formattedDate;

    // Event listeners
    fetchForm.addEventListener('submit', handleFetchData);
    refreshBtn.addEventListener('click', () => fetchDataWithParams(lastParameters));
    downloadBtn.addEventListener('click', handleDownload);
    prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));

    // Handle form submission
    function handleFetchData(e) {
        e.preventDefault();
        
        const formData = new FormData(fetchForm);
        const parameters = Object.fromEntries(formData.entries());
        
        // Save parameters for refresh action
        lastParameters = {...parameters};
        
        fetchDataWithParams(parameters);
    }

    // Fetch data from API
    function fetchDataWithParams(params) {
        // Show loading state
        setLoading(true);
        showStatus('info', 'Fetching data from EMIS...');
        
        // In a real application, you would make an API call here
        // For demo purposes, we'll simulate an API call with setTimeout
        setTimeout(() => {
            try {
                // Simulate API response
                const mockData = generateMockData(params);
                
                // Process the data
                processData(mockData);
                
                // Success message
                showStatus('success', `Successfully fetched ${mockData.length} records`);
                setLoading(false);
            } catch (error) {
                console.error(error);
                showStatus('error', 'Failed to fetch data: ' + error.message);
                setLoading(false);
            }
        }, 1500); // Simulate network delay
    }

    // Process data and update UI
    function processData(data) {
        currentData = data;
        
        // Reset to first page
        currentPage = 1;
        
        // Update table
        updateTable();
        
        // Show pagination if needed
        if (data.length > itemsPerPage) {
            pagination.classList.remove('hidden');
            updatePagination();
        } else {
            pagination.classList.add('hidden');
        }
    }

    // Update table with current data
    function updateTable() {
        if (currentData.length === 0) {
            tableHeader.innerHTML = `
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No Data Available
                </th>
            `;
            tableBody.innerHTML = `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        No records found
                    </td>
                </tr>
            `;
            return;
        }
        
        // Create table headers based on first data item
        const headers = Object.keys(currentData[0]);
        tableHeader.innerHTML = headers.map(header => `
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ${header}
            </th>
        `).join('');
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, currentData.length);
        const currentPageData = currentData.slice(startIndex, endIndex);
        
        // Create table rows
        tableBody.innerHTML = currentPageData.map(item => `
            <tr class="hover:bg-gray-50">
                ${headers.map(header => `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${item[header]}
                    </td>
                `).join('')}
            </tr>
        `).join('');
    }

    // Update pagination information
    function updatePagination() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, currentData.length);
        
        showingStart.textContent = startIndex + 1;
        showingEnd.textContent = endIndex;
        totalItems.textContent = currentData.length;
        
        // Update button states
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = endIndex >= currentData.length;
    }

    // Change current page
    function changePage(newPage) {
        if (newPage < 1 || newPage > Math.ceil(currentData.length / itemsPerPage)) {
            return;
        }
        
        currentPage = newPage;
        updateTable();
        updatePagination();
    }

    // Handle download
    function handleDownload() {
        if (currentData.length === 0) {
            showStatus('error', 'No data available to download');
            return;
        }
        
        try {
            // Convert data to CSV
            const headers = Object.keys(currentData[0]);
            const csvContent = [
                headers.join(','),
                ...currentData.map(item => headers.map(header => `"${item[header]}"`).join(','))
            ].join('\n');
            
            // Create download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `emis_data_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showStatus('success', 'Data downloaded successfully');
        } catch (error) {
            console.error(error);
            showStatus('error', 'Failed to download data: ' + error.message);
        }
    }

    // Show status message
    function showStatus(type, message) {
        statusMessage.classList.remove('hidden', 'bg-blue-100', 'text-blue-700', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
        
        switch (type) {
            case 'info':
                statusMessage.classList.add('bg-blue-100', 'text-blue-700');
                break;
            case 'success':
                statusMessage.classList.add('bg-green-100', 'text-green-700');
                break;
            case 'error':
                statusMessage.classList.add('bg-red-100', 'text-red-700');
                break;
        }
        
        statusMessage.textContent = message;
        statusMessage.classList.remove('hidden');
        
        // Auto hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                statusMessage.classList.add('hidden');
            }, 5000);
        }
    }

    // Set loading state
    function setLoading(isLoading) {
        if (isLoading) {
            loadingIcon.classList.remove('hidden');
            btnText.textContent = 'Loading...';
            fetchForm.querySelector('button[type="submit"]').disabled = true;
        } else {
            loadingIcon.classList.add('hidden');
            btnText.textContent = 'Fetch Data';
            fetchForm.querySelector('button[type="submit"]').disabled = false;
        }
    }

    // Generate mock data for demo purposes
    function generateMockData(params) {
        const type = params.type;
        const count = Math.floor(Math.random() * 30) + 10; // Random count between 10-40
        const result = [];
        
        for (let i = 1; i <= count; i++) {
            if (type === 'students') {
                result.push({
                    ID: `STD${String(i).padStart(3, '0')}`,
                    Name: `Student ${i}`,
                    Age: Math.floor(Math.random() * 10) + 10,
                    Class: `Class ${Math.floor(Math.random() * 5) + 1}`,
                    Grade: ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)],
                    Attendance: `${Math.floor(Math.random() * 30) + 70}%`
                });
            } else if (type === 'teachers') {
                result.push({
                    ID: `TCH${String(i).padStart(3, '0')}`,
                    Name: `Teacher ${i}`,
                    Subject: ['Math', 'Science', 'History', 'English', 'Art'][Math.floor(Math.random() * 5)],
                    Classes: Math.floor(Math.random() * 5) + 1,
                    Students: Math.floor(Math.random() * 50) + 20
                });
            } else if (type === 'classes') {
                result.push({
                    ID: `CLS${String(i).padStart(3, '0')}`,
                    Name: `Class ${i}`,
                    Teacher: `Teacher ${Math.floor(Math.random() * 10) + 1}`,
                    Students: Math.floor(Math.random() * 20) + 15,
                    Room: `Room ${Math.floor(Math.random() * 10) + 101}`
                });
            } else if (type === 'attendance') {
                result.push({
                    Date: params.date,
                    Class: `Class ${Math.floor(Math.random() * 5) + 1}`,
                    Present: Math.floor(Math.random() * 20) + 10,
                    Absent: Math.floor(Math.random() * 5),
                    Percentage: `${Math.floor(Math.random() * 20) + 80}%`
                });
            }
        }
        
        return result;
    }
});
