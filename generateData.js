const jsf = require("json-schema-faker"); // json-schema faker
jsf.extend('faker', () => require('faker'));
const fs = require("fs"); // nodeJS file system library to read and write files
const mongoose = require("mongoose");

var memoSchema = {
    "type": "array",
    "minItems": 100,
    "maxItems": 150,
    "items": {
        "type": "object",
        "properties": {
            "user_senior": {
                "type": "string",
                "pattern": "senior|junior"
            },
            "memo_title": {
                "type": "string",
                "faker": "random.words"
            },
            "memo_description": {
                "type": "string",
                "faker": "lorem.paragraph"
            },
            "memo_topic": {
                "type": "string",
                "pattern": "management|career|health|social|relationships"
            },
            "company_name": {
                "type": "string",
                "faker": "company.companyName"
            },
            "company_description": {
                "type": "string",
                "faker": "company.bs"
            },
            "memo_likenum": {
                "type": "number",
                "faker": "random.number",
                "minimum": 0
            },
            "memo_dislikenum": {
                "type": "number",
                "faker": "random.number",
                "minimum": 0
            },
            "user_position": {
                "type": "string",
                "faker": "name.jobTitle"
            },
            "company_industry": {
                "type": "string",
                "faker": "name.jobArea"
            },
            "user_gender": {
                "type": "string",
                "pattern": "male|female|other"
            },
            "user_avatar": {
                "type": "string",
                "faker": "image.avatar"
            },
            "user_country": {
                "type": "string",
                "faker": "address.country"
            },
            "user_city": {
                "type": "string",
                "faker": "address.city"
            },
            "user_name": {
                "type": "string",
                "faker": "internet.userName"
            },
            "author": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "faker": "custom.id"
                    }
                },
                "required": ["id"]
            },
            "comments": {
                "type": "array",
                "properties": {
                    "id": {
                        "type": "string",
                        "faker": "custom.id"
                    },
                    "required": ["id"]
                }
            }
        },
        "required": ["user_senior", "memo_title", "memo_description", "memo_topic", "company_name", "company_description", "memo_likenum", "memo_dislikenum", "user_position", "company_industry", "user_gender", "user_avatar", "user_country", "user_city", "user_name", "author", "comments"]
    }
};
jsf.extend('faker', function () {
    var faker = require('faker');
    faker.custom = {
        id: function () {
            return mongoose.Types.ObjectId();
        }
    };
    return faker;
});

var fakeData = jsf(memoSchema);
fs.writeFile("memos.json", JSON.stringify(fakeData), function (err) {
    if (err) {
        return console.log(err);
    } else {
        console.log("Mock data generated.");
    }
});