const express = require('express');
const app = express();
const request = require('request');

app.get("/", (req, res) => {
    // Redirect to the default route
    res.redirect("/ticker");
});

// Set up a route to display the chart
app.get('/ticker', (req, res) => {
    const ticker = req.query.tickerinput || 'ethereum';
    console.log(`https://api.coingecko.com/api/v3/coins/${ticker}/market_chart`);
    // Load the Ethereum price data for the past 12 months using the CoinGecko API
    request(`https://api.coingecko.com/api/v3/coins/${ticker}/market_chart`, {
        qs: {
            vs_currency: 'usd',
            days: 365
        }
    }, (error, response, body) => {
        if (error) {
            // Handle the error here
            return;
        }

        const prices = JSON.parse(body).prices.map(([timestamp, price]) => price);
        const labels = JSON.parse(body).prices.map(([timestamp, price]) => new Date(timestamp).toLocaleDateString());

        // Calculate the daily price volatility
        const volatilities = [];
        for (let i = 1; i < prices.length; i++) {
            volatilities.push(Math.abs(prices[i] - prices[i - 1]));
        }

        // Generate the HTML for the chart
        const html = `
      <html>
        <head>
          <title>${ticker.toUpperCase()} Price and Volatility Chart</title>
          <script>
    function getTickerList() {
      // Use an API or website to fetch a list of cryptocurrency tickers

      // For example, you can use the fetch() function to retrieve the data and
      // parse it as JSON, like this:
      fetch("https://api.coingecko.com/api/v3/coins/list")
        .then(response => response.json())
        .then(data => {
          // Loop through the list of tickers and add each one as an option
          // in the datalist element
          for (const ticker of data) {
            const option = document.createElement("option");
            option.value = ticker['id'];
            document.getElementById("ticker-list").appendChild(option);
          }
        });
    }

    function submitForm() {
        // Get the value of the input field
        const ticker = document.getElementById("tickerinput").value;
  
        // Redirect the user to the page with the ticker symbol
        window.location.href = window.location.origin + "/" + {ticker};
      }

  </script>
        </head>
        <body  onload="getTickerList()">
        <form onsubmit="submitForm()">
        <label for="tickerinput">Enter a cryptocurrency ticker:</label><br>
        <input type="text" id="tickerinput" name="tickerinput" list="ticker-list"><br>
        <datalist id="ticker-list"></datalist>
        <input type="submit" value="Submit">
      </form>

          <h1>${ticker.toUpperCase()} Price and Volatility Chart</h1>
          <canvas id="chart"></canvas>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.min.js"></script>
          <script>
            // Set up the chart
            const ctx = document.getElementById('chart').getContext('2d');
            const chart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: ${JSON.stringify(labels)},
                datasets: [
                  {
                    label: '${ticker.toUpperCase()} Price',
                    data: ${JSON.stringify(prices)},
                  },
                  {
                    label: 'Daily Volatility',
                    data: ${JSON.stringify(volatilities)},
                    borderColor: 'red',
                  },
                ]
              },
              options: {
                // Customize the chart options here
              }
            });
          </script>
        </body>
      </html>
    `;

        // Send the HTML to the client
        res.send(html);
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
