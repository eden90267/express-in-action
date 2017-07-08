/**
 * Created by eden90267 on 2017/7/8.
 */
const expect = require('chai').expect;

const User = require('../models/user');

describe('User', () => {

    let user;

    // 在每個測試之前運行，從而確保在每個測試中都有定義
    beforeEach(() => {
        user = new User({
            firstName: 'Douglas',
            lastName: 'Reynholm',
            birthday: new Date(1975, 3, 20)
        });
    });

    it('can extract its name', () => {
        expect(user.getName()).to.equal('Douglas Reynholm');
    });

    it('can get its age in milliseconds', () => {
        let now = new Date();
        expect(user.getAge()).to.equal(now - user.birthday);
    });

});