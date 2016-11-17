//Validate if the parameter is a correct email syntax

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}


//Get base64-encoded string from image
function getBase64Image(imgElem)
{
  var canvas = document.createElement("canvas");
    canvas.width = 375; //imgElem.clientWidth;
    canvas.height = 375 * imgElem.clientHeight / imgElem.clientWidth;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(imgElem, 375, canvas.height);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL; //.replace(/^data:image\/(png|jpg);base64,/, "");
}

//Validate if the parameter is a valid number
function isNumeric( obj ) {
  return !jQuery.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
}

//Check if the field is entered the valid value
function validateFormField(elementID, validateType, elementType, $ionicLoading, errorText)
{
  validateType = validateType || 'empty';
  elementType = elementType || 'image';
  var obj = document.getElementById(elementID);

  switch (elementType)
  {
    case 'image':
          if (obj.src.length == 0)
          {
            $ionicLoading.show({"template" : errorText || "No image selected", "duration" : 2000});
            return 1;
          }
          break;
    case 'text':
          if (validateType == 'empty' && obj.value.length == 0)
          {
            $ionicLoading.show({"template" : errorText || "Please enter the textfield", "duration" : 2000});
            return 1;
          }
          if (validateType == 'number' && !isNumeric(obj.value))
          {
            $ionicLoading.show({"template" : errorText || "Please enter number in field", "duration" : 2000});
            return 1;
          }
  }

  return 0;
}


/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
  var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    timezoneClip = /[^-+\dA-Z]/g,
    pad = function (val, len) {
      val = String(val);
      len = len || 2;
      while (val.length < len) val = "0" + val;
      return val;
    };

  // Regexes and supporting functions are cached through closure
  return function (date, mask, utc) {
    var dF = dateFormat;

    // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
    if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
      mask = date;
      date = undefined;
    }

    // Passing date through Date applies Date.parse, if necessary
    date = date ? new Date(date) : new Date;
    if (isNaN(date)) throw SyntaxError("invalid date");

    mask = String(dF.masks[mask] || mask || dF.masks["default"]);

    // Allow setting the utc argument via the mask
    if (mask.slice(0, 4) == "UTC:") {
      mask = mask.slice(4);
      utc = true;
    }

    var	_ = utc ? "getUTC" : "get",
      d = date[_ + "Date"](),
      D = date[_ + "Day"](),
      m = date[_ + "Month"](),
      y = date[_ + "FullYear"](),
      H = date[_ + "Hours"](),
      M = date[_ + "Minutes"](),
      s = date[_ + "Seconds"](),
      L = date[_ + "Milliseconds"](),
      o = utc ? 0 : date.getTimezoneOffset(),
      flags = {
        d:    d,
        dd:   pad(d),
        ddd:  dF.i18n.dayNames[D],
        dddd: dF.i18n.dayNames[D + 7],
        m:    m + 1,
        mm:   pad(m + 1),
        mmm:  dF.i18n.monthNames[m],
        mmmm: dF.i18n.monthNames[m + 12],
        yy:   String(y).slice(2),
        yyyy: y,
        h:    H % 12 || 12,
        hh:   pad(H % 12 || 12),
        H:    H,
        HH:   pad(H),
        M:    M,
        MM:   pad(M),
        s:    s,
        ss:   pad(s),
        l:    pad(L, 3),
        L:    pad(L > 99 ? Math.round(L / 10) : L),
        t:    H < 12 ? "a"  : "p",
        tt:   H < 12 ? "am" : "pm",
        T:    H < 12 ? "A"  : "P",
        TT:   H < 12 ? "AM" : "PM",
        Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
        o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
        S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
      };

    return mask.replace(token, function ($0) {
      return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
    });
  };
}();

// Some common format strings
dateFormat.masks = {
  "default":      "ddd mmm dd yyyy HH:MM:ss",
  shortDate:      "m/d/yy",
  mediumDate:     "mmm d, yyyy",
  longDate:       "mmmm d, yyyy",
  fullDate:       "dddd, mmmm d, yyyy",
  shortTime:      "h:MM TT",
  mediumTime:     "h:MM:ss TT",
  longTime:       "h:MM:ss TT Z",
  isoDate:        "yyyy-mm-dd",
  isoTime:        "HH:MM:ss",
  isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
  isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
  dayNames: [
    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ],
  monthNames: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ]
};

// F





var dbStructure = {
    transactions: [
        ['_id'],
        ['createdAt'],
        ['updatedAt'],
        ['_account'],
        ['date'],
        ['name'],
        ['_bank'],
        ['__v', 'integer'],
        ['is_deleted', 'boolean'],
        ['meta', 'text'],
        ['category', 'text'],
        ['amount', 'float']
    ],
    goals: [
        ['_id'],
        ['createdAt'],
        ['updatedAt'],
        ['_user'],
        ['name'],
        ['deadline'],
        ['__v', 'integer'],
        ['priority', 'integer'],
        ['image_url', 'varchar(200)'],
        ['amount', 'float']
    ],
    banks: [
        ['_id'],
        ['createdAt'],
        ['updatedAt'],
        ['_user'],
        ['institution_type'],
        ['__v', 'integer'],
        ['access_token', 'varchar(300)'],
        ['logo_url', 'varchar(200)']
    ],
    accounts: [
        ['_id'],
        ['createdAt'],
        ['updatedAt'],
        ['institution_type'],
        ['_bank'],
        ['__v', 'integer'],
        ['subtype'],
        ['type'],
        ['meta', 'text'],
        ['balance', 'text']
    ],
    challenges: [
        ['_id'],
        ['createdAt'],
        ['updatedAt'],
        ['name'],
        ['image_url', 'varchar(200)'],
        ['__v', 'integer'],
        ['_category'],
        ['_user'],
        ['amount', 'float'],
        ['_goals', 'text']
    ],
    insights: [
        ['_id'],
        ['createdAt'],
        ['updatedAt'],
        ['_user'],
        ['name'],
        ['type'],
        ['__v', 'integer'],
        ['title'],
        ['description', 'text']
    ],
    unassigneds: [
        ['_id'],
        ['createdAt'],
        ['updatedAt'],
        ['_goal'],
        ['amount', 'float']
    ],
    categories: [
        ['_id'],
        ['createdAt'],
        ['updatedAt'],
        ['name'],
        ['image_url', 'varchar(200)']
    ]
};

//Get Week Number of the date
Date.prototype.getWeek = function() {
    // We have to compare against the first monday of the year not the 01/01
    // 60*60*24*1000 = 86400000
    // 'onejan_next_monday_time' reffers to the miliseconds of the next monday after 01/01

    var day_miliseconds = 86400000,
        onejan = new Date(this.getFullYear(), 0, 1, 0, 0, 0),
        onejan_day = (onejan.getDay() == 0) ? 7 : onejan.getDay(),
        days_for_next_monday = (8 - onejan_day),
        onejan_next_monday_time = onejan.getTime() + (days_for_next_monday * day_miliseconds),
    // If one jan is not a monday, get the first monday of the year
        first_monday_year_time = (onejan_day > 1) ? onejan_next_monday_time : onejan.getTime(),
        this_date = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0), // This at 00:00:00
        this_time = this_date.getTime(),
        days_from_first_monday = Math.round(((this_time - first_monday_year_time) / day_miliseconds));

    var first_monday_year = new Date(first_monday_year_time);

    // We add 1 to "days_from_first_monday" because if "days_from_first_monday" is *7,
    // then 7/7 = 1, and as we are 7 days from first monday,
    // we should be in week number 2 instead of week number 1 (7/7=1)
    // We consider week number as 52 when "days_from_first_monday" is lower than 0,
    // that means the actual week started before the first monday so that means we are on the firsts
    // days of the year (ex: we are on Friday 01/01, then "days_from_first_monday"=-3,
    // so friday 01/01 is part of week number 52 from past year)
    // "days_from_first_monday<=364" because (364+1)/7 == 52, if we are on day 365, then (365+1)/7 >= 52 (Math.ceil(366/7)=53) and thats wrong

    return this.getFullYear() * 52 + ((days_from_first_monday >= 0 && days_from_first_monday < 364) ? Math.ceil((days_from_first_monday + 1) / 7) : 52);
}

//Get the default value based on the type
var getDefaultValueString = function(dataType, key) {
    if (key == '_id') return ' unique';
    if (dataType == 'text') return "default ''";
    if (dataType == 'int') return "default 0";
    if (dataType == 'boolean') return "default false";
    if (dataType.substr(0, 7) == 'varchar') return "default ''";

    return '';
}

//Initialize SQLiteDB
var initSQLiteDB = function(cordovaSQLite) {
    for (tableName in dbStructure) {
        var query = "CREATE TABLE IF NOT EXISTS " + tableName + "(";
        var columns = dbStructure[tableName];

        var newColumns = [];
        for (i in columns) {

            var dataType = (columns[i][1] || 'varchar(50)');
            newColumns.push(columns[i][0] + " " + dataType + " " + getDefaultValueString(dataType, columns[i][0]));
        }

        query = query + (newColumns.join(',')) + ")";

        cordovaSQLite.execute(db, query);

    }
}

//Drop all the SQLite DB
var dropSQLiteDB = function($cordovaSQLite) {
    for (tableName in dbStructure) {
        $cordovaSQLite.execute(db, 'drop table if exists ' + tableName);
    }
};

//Convert the value to string if it's JSON object
var getStringValue = function(d) {
    if (typeof d == 'boolean' || typeof d == 'number' || typeof d == 'string') return d;
    if (typeof d == 'object') return JSON.stringify(d);
    return '';
}


//Insert value into SQLiteDB
var insertTable = function($cordovaSQLite, tableName, data, callback) {

    for (k in data) {
        var query = "insert into " + tableName + "(";

        var columns = [],
            values = [],
            valueTemplates = [];
        for (c in dbStructure[tableName]) {
            columns.push(dbStructure[tableName][c][0]);
            valueTemplates.push('?');
            values.push(getStringValue(data[k][dbStructure[tableName][c][0]]));
        }
        query = query + columns.join(',') + ") values (" + valueTemplates.join(",") + ")";

        $cordovaSQLite.execute(db, query, values).then(function(a) {
            if (callback) callback();
        }, function(b) {
            return;

        });
    }
};

//Convert the date in consideration of timezone
function convertDate(date)
{
    var offset = new Date().getTimezoneOffset();
    if (offset < 0) offset = 0;
    var timezone = sprintf("T%02d:%02d:%02d.000Z", offset / 60, offset % 60, 0);

    return date.substr(0, 10) + timezone;
}

//Load All the Data from the server
var loadAllData = function($cordovaSQLite, $state, initCalling, $ionicLoading, callback) {
    var user_token = localStorage.getItem('user_token');

    if (typeof user_token == 'undefined' || user_token == '') {
        console.log('-no token-');
        return;
    }
    localStorage.setItem('loadingGlobalData','true');

    $.when(
        $.get(WEBSERVICE_URL_PREFIX + 'transactions?token=' + user_token, function(response, successed) {

            //if (successed == 'success' && response && response.success == true)
            //{
            //  insertTable($cordovaSQLite, 'transactions', response.data);
            //}
        }),
        $.get(WEBSERVICE_URL_PREFIX + 'banks?token=' + user_token, function(response, successed) {

            //if (successed == 'success' && response && response.success == true)
            //{
            //  insertTable($cordovaSQLite, 'transactions', response.data);
            //}
        }),
        $.get(WEBSERVICE_URL_PREFIX + 'goals?token=' + user_token, function(response, successed) {

            //if (successed == 'success' && response && response.success == true)
            //{
            //  insertTable($cordovaSQLite, 'transactions', response.data);
            //}
        }),
        $.get(WEBSERVICE_URL_PREFIX + 'challenges?token=' + user_token, function(response, successed) {

            //if (successed == 'success' && response && response.success == true)
            //{
            //  insertTable($cordovaSQLite, 'transactions', response.data);
            //}
        }),
        $.get(WEBSERVICE_URL_PREFIX + 'accounts?token=' + user_token, function(response, successed) {

            //if (successed == 'success' && response && response.success == true)
            //{
            //  insertTable($cordovaSQLite, 'transactions', response.data);
            //}
        }),
        $.get(WEBSERVICE_URL_PREFIX + 'insights?token=' + user_token, function(response, successed) {

            //if (successed == 'success' && response && response.success == true)
            //{
            //  insertTable($cordovaSQLite, 'transactions', response.data);
            //}
        }),
        $.get(WEBSERVICE_URL_PREFIX + 'unassigneds?token=' + user_token, function(response, successed) {

            //if (successed == 'success' && response && response.success == true)
            //{
            //  insertTable($cordovaSQLite, 'transactions', response.data);
            //}
        })
    ).done(function(v1, v2, v3, v4, v5, v6, v7) {

        v1 = v1[0];
        v2 = v2[0];
        v3 = v3[0];
        v4 = v4[0];
        v5 = v5[0];
        v6 = v6[0];
        v7 = v7[0];

        if (v2.success == true) { globalBanks =  banks = v2.data; }
        console.log(v1);
        currentTime = new Date(v1.time);
        var transactions = [];
        var sums = {};

        var offset = new Date().getTimezoneOffset();
        if (offset < 0) offset = 0;
        var timezone = sprintf("T%02d:%02d:%02d.000Z", offset / 60, offset % 60, 0);

        var todayWeekDay = new Date().getDay();
        for (c in v1.data) {
            var week = (new Date(v1.data[c].date)).getWeek();

            if (v1.data[c].is_deleted) continue;
            v1.data[c].date = v1.data[c].date.substr(0, 10) + timezone;
            transactions.push(v1.data[c]);



            var weekDay =  (new Date(v1.data[c].date).getDay());
            if (weekDay == 0 || (todayWeekDay > 0 && weekDay >= todayWeekDay)) {}
            else continue;

            if (v1.data[c].category[0] == 'Shops') {
                sums['shops'] = sums['shops'] || {};
                sums['shops']["week" + week] = (sums['shops']["week" + week] || 0) + v1.data[c].amount;

            } else if (v1.data[c].category[0] == 'Food and Drink') {
                sums['foodanddrink'] = sums['foodanddrink'] || {};
                sums['foodanddrink']["week" + week] = (sums['foodanddrink']["week" + week] || 0) + v1.data[c].amount;
            } else if (v1.data[c].category[0] == 'Travel') {
                sums['transportation'] = sums['transportation'] || {};
                sums['transportation']["week" + week] = (sums['transportation']["week" + week] || 0) + v1.data[c].amount;
            }

            //if (v1.data[c].date >= '2016-06-11') {
            //    transactions.push(v1.data[c]);
            //    console.log(v1.data[c]);
            //}
        }

        globalTransactions = [];
        for (c in transactions)
        {
            var flag = 0;
            for (d in globalBanks)
                if (globalBanks[d]._id == transactions[c]._bank) {
                    flag = 1;
                    break;
                }
            if (flag == 1)
                globalTransactions.push(transactions[c]);
        }


        for (c in sums) {

            var sum = 0, count = 0;
            for (d in sums[c]) {
                sum += sums[c][d];
                count++;
            }

            weeklyAverage[c] = (sum == 0 ? 0 : sum / count) * 1.2;
            weeklyAverage[c] = Math.round(weeklyAverage[c]);
            weeklyAverage[c] = Math.max(0, weeklyAverage[c]);

        }


        console.log(weeklyAverage);
        //insertTable($cordovaSQLite, 'transactions', transactions);


        var goals = [];
        for (c in v3.data) {
            goals.push(v3.data[c]);
        }

        var challenges = [];
        for (c in v4.data) {
            challenges.push(v4.data[c]);
        }

        var accounts = [];
        for (c in v5.data) {
            accounts.push(v5.data[c]);
        }

        var insights = [];
        for (c in v6.data) {
            insights.push(v6.data[c]);
        }

        var unassigneds = [];
        for (c in v7.data) {
            unassigneds.push(v7.data[c]);
        }

        //insertTable($cordovaSQLite, 'goals', goals);
        //insertTable($cordovaSQLite, 'challenges', challenges);
        //
        globalGoals = goals;
        globalChallenges = challenges;
        globalAccounts = accounts;
        globalInsights = insights;
        globalPluto = unassigneds;

        localStorage.setItem('loadingGlobalData', 'false');

        loadedTime = dateFormat(new Date(), 'h:MM TT, mmm dd yyyy');

        if (initCalling == true)
        {
            $ionicLoading.hide();

            for (var i = 0; i < goals.length; i++)
                if (typeof(goals[i].deadline) === 'undefined' || goals[i].deadline == null || goals[i].deadline == "" || new Date(goals[i].deadline).getTime() >= new Date().getTime())
                {

                    localStorage.setItem('current_goal_id', goals[i]._id);

                    if (globalBanks == null || globalBanks.length == 0) {

                        $state.go('linkbankaccount'); return;
                    }

                    if (challenges.length > 0)
                    {
                        for (var j = 0; j < challenges.length; j++)
                            if (new Date(challenges[j].createdAt).getWeek() == new Date().getWeek() && JSON.parse(challenges[j]._goals).indexOf(goals[i]._id) > -1) {

                                $state.go('menu.challenge_detail', {challengeID: challenges[j]._id}, {reload: true});

                                return;
                            }
                        $state.go('pick_challenge');
                    }
                    else $state.go('pick_challenge');

                    return;
                }

            $state.go('create_goal');
        }
        if (callback)
        {
            callback();
        }
    })
};

//Find the object using ID among the array
function findElementById(elements, elementID)
{
    for (var i in elements)
        if (elements[i]._id == elementID)
            return elements[i];
    return null;
}
//Find the index of object using ID among the array
function findIndexOfElementById(elements, elementID)
{
    for (var i in elements)
        if (elements[i]._id == elementID)
            return i;
    return -1;
}

//Load image from URL
function toDataUrl(url, callback, outputFormat){
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var dataURL;
        var height = this.height;
        var width = this.width;
        canvas.width = 375;
        canvas.height = 375 * (height / width);
        ctx.drawImage(this, 0, 0, 375, 375 * (height / width));
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
        canvas = null;
    };
    img.src = url;
}


//Get the end time of the day of the given date value
function getEndTimeOfTheDay(date)
{
    if (date == '') return date;
    //var seconds = 86399 + new Date().getTimezoneOffset() * 60;
    //return date + 'T' + sprintf("%02d:%02d:%02d.000Z", Math.floor(seconds / 3600), Math.floor(seconds / 60 % 60), Math.floor(seconds % 60));

    var offset = new Date().getTimezoneOffset();
    return date + "T23:59:59" + (offset < 0 ? "+" : "-") + sprintf("%04d", Math.floor(Math.abs(offset) / 60) * 100 + Math.abs(offset) % 60);
}


function getTransactionAmountString(a)
{
    return sprintf("%.2f",a);
}

function max(a,b) {return a > b ? a : b;}



//Calculate the pluto saving
function considerPlutoSaving(goalID)
{
    var sum = 0;
    for (var i in globalPluto)
    {
        if (globalPluto[i]._goal == goalID)
            sum += max(0, globalPluto[i].amount);
    }

    return sum;
}