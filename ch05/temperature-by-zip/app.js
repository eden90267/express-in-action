/**
 * Created by eden_liu on 2017/6/29.
 */

const path = require('path');
const express = require('express');
const zipdb = require('zippity-do-dah');
const ForecastIo = require('forecastio');

const app = express();

let weather = new ForecastIo('fab43854133d52d7ab2718c7cd06b3d6');

app.use(express.static(path.resolve(__dirname, 'public')));

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs-test');

app.get('/', (req, res) => res.render('index'));

app.get(/^\/(\d{5})$/, (req, res, next) => {
    // 捕獲特定的ZIP編碼透過req.params[0]
    let zipcode = req.params[0];
    // 透過ZIP編碼獲取地理位置
    let location = zipdb.zipcode(zipcode);
    if (!location.zipcode) {
        return next();
    }

    let latitude = location.latitude;
    let longitude = location.longitude;

    weather.forecast(latitude, longitude, (err, data) => {
        if (err) {
            return next();
        }

        // 透過Express的json方法發送一個JSON數據
        res.json({
            zipcode: zipcode,
            temperature: data.currently.temperature
        });
    });

});

app.use((req, res) => res.status(404).render('404'));

app.listen(3000);