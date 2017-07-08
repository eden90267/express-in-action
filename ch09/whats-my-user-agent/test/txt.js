/**
 * Created by eden90267 on 2017/7/8.
 */

const app = require('../app');

const supertest = require('supertest');

describe('plain text response', () => {
    // 定義測試

    let req;

    beforeEach(() => {
        req = supertest(app)
            .get('/')
            .set('User-Agent', 'my cool browser') // 設置User-Agent頭部
            .set('Accept', 'text/plain'); // 設置頭部來描述我們希望返回內容的類型
    });

    it('returns a plain text response', (done) => {
        req
            .expect('Content-Type', /text\/plain/) // 期望內容類行為“text/plain”
            .expect(200) // 期望HTTP狀態碼為200
            .end(done);  // 在測試結束的時候調用done回調
    });

    it('returns your User Agent', (done) => {
        req
            .expect((res) => {
                if (res.text !== 'my cool browser') {
                    throw new Error('Response does not contain User Agent');
                }
            })
            .end(done);
    });

});