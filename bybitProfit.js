const config = require('./config.json');
const ccxt = require('ccxt');
const dayjs = require('dayjs');

// Create connection to Bybit using APIs in config.json
const bybit = new ccxt.bybit({
    'apiKey': config.apiKey,
    'secret': config.secret
})

// Calculate Percentage
const pnlPerc = function (pnl, wallet) {
    let perc = (pnl/wallet)*100
    return(perc)
}

// Calculate Sum of an Array of values
const sumArr = function (arr) {
    sum = arr.reduce((a, b) => {
        return a + b;
    });
    return sum
}

// Calculate Average of an Array of values
const avgArr = function (arr) {
    var total = 0;
    for(var i = 0; i < arr.length; i++) {
        total += arr[i];
    }
    var avg = total / arr.length;
    return avg
}

// Get PNL data from Bybit
// Function takes 2 variables:
//  afterDate : Do not include any PNL data from before this date
//  symbol : Currency/Coin you want PNL data from, Bybit accepts only these: BTC ETH EOS XRP USDT
//
// Function will print out every entry for Realized PNL to console and return the Average and Cumalative Totals of PNL and Profit Percentage
const getPNL = async function (afterDate, symbol) {
    let pnl = await bybit.v2PrivateGetWalletFundRecords({'coin':symbol, 'limit': 50})
    let data = pnl.result.data
    let cumPNL = []
    let cumPer = []

    data.forEach(i => {
        let date = i.exec_time
        let p = i.amount
        let w = i.wallet_balance
        let per = pnlPerc(p, w).toFixed(2)
        if(dayjs(i.exec_time).isAfter(dayjs(afterDate))) {
            if(i.type == 'RealisedPNL'){
                if(isNaN(parseFloat(p))) {
                    console.error('NaN found')
                } else {
                    console.log(`${date} - ${symbol} - Daily PNL: ${p} - Wallet Balance: ${w} - Profit %: ${per}`);
                    // console.log(`${date} - ${symbol} - Daily PNL: ${'**********'} - Wallet Balance: ${'**********'} - Profit %: ${per}`);

                    cumPNL.push(p*1)
                    cumPer.push(per*1)
                }
            } else {
                // console.log('Not PNL') // Debug
            }
        }
    });
    let totalPNL = sumArr(cumPNL).toFixed(10)*1
    let totalPerc = sumArr(cumPer)
    let avgPNL = avgArr(cumPNL)
    let avgPer = avgArr(cumPer)
    return({'pnl':totalPNL, 'perc': totalPerc, 'coin':symbol, 'avgPNL':avgPNL, 'avgPer':avgPer})
}





// Examples of using function in a Promise 

getPNL('2021-01-14', 'BTC').then(function(btc){
    console.log(`Total PNL in ${btc.coin}: ${btc.pnl}`)
    console.log(`Cumulative Profit Percentage: ${btc.perc}%\n Average Daily Percentage: ${btc.avgPer.toFixed(2)}%`)
})
getPNL('2021-01-14', 'ETH').then(function(eth){    
    console.log(`Total PNL in ${eth.coin}: ${eth.pnl}`)
    console.log(`Cumulative Profit Percentage: ${eth.perc}%\n Average Daily Percentage: ${eth.avgPer.toFixed(2)}%`)

});


