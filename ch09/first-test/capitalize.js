/**
 * Created by eden90267 on 2017/7/7.
 */
function capitalize(str) {
    let firstLetter = str.charAt(0).toUpperCase();
    let rest = str.slice(1).toLowerCase();
    return firstLetter + rest;
}

module.exports = capitalize;