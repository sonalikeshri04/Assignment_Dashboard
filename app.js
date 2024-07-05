document.addEventListener('DOMContentLoaded', function() {
    const chartTypeSelect = document.getElementById('chartType');
    const fetchDataBtn = document.getElementById('fetchDataBtn');
    const ctx = document.getElementById('myChart').getContext('2d');
    let chart;

    const getAccessToken = async () => {
        const clientId = 'bffe3fcd073a42869967f497176411ed';
        const clientSecret = '47ab22668f2e4a63a9e0466179ec9155';
        const encodedCredentials = btoa(`${clientId}:${clientSecret}`);
        
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        if (response.ok) {
            const data = await response.json();
            return data.access_token;
        } else {
            throw new Error('Failed to retrieve access token');
        }
    };

    const fetchSpotifyData = async (accessToken) => {
        const url = 'https://api.spotify.com/v1/search';
        const queryParams = new URLSearchParams({
            q: 'year:2023',
            type: 'track',
            market: 'IN',
            limit: 10
        });

        const response = await fetch(`${url}?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.tracks.items;
        } else {
            throw new Error('Failed to retrieve data from Spotify');
        }
    };

    const updateChart = (data) => {
        const labels = data.map(item => item.name);
        const values = data.map(item => item.popularity);

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: chartTypeSelect.value,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Song Popularity',
                    data: values,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    fetchDataBtn.addEventListener('click', async () => {
        try {
            const accessToken = await getAccessToken();
            const data = await fetchSpotifyData(accessToken);
            updateChart(data);
        } catch (error) {
            console.error(error);
            alert('An error occurred while fetching data from Spotify.');
        }
    });

    chartTypeSelect.addEventListener('change', () => {
        if (chart) {
            chart.config.type = chartTypeSelect.value;
            chart.update();
        }
    });
});
