const app = require('../app');

const supertest = require('supertest');
const cheerio = require('cheerio');

describe('html response', () => {

    let req;
    beforeEach(() => {
        req = supertest(app)
            .get('/')
            .set('User-Agent', 'a cool browser')
            .set('Accept', 'text/html');
    });

    it('returns an HTML response', (done) => {
        req
            .expect('Content-Type', /html/)
            .expect(200)
            .end(done);
    });

    it('returns your User Agent', (done) => {
        req
            .expect((res) => {
                let htmlRes = res.text;
                // 用你的HTML初始化一個Cheerio對象
                let $ = cheerio.load(htmlRes);
                // 從HTML中獲取User Agent
                let userAgent = $('.user-agent').html().trim();
                // 跟之前一樣對User Agent進行測試
                if (userAgent !== 'a cool browser') {
                    throw new Error('User Agent not found');
                }
            })
            .end(done);
    });

});