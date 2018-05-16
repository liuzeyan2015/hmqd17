const MongoClient = require('mongodb').MongoClient

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'szhmqd17';

//导出返回学生列表的页面
exports.getStudentListPage = (req, res) => {
    MongoClient.connect(url, function (err, client) {
        const db = client.db(dbName);

        const collection = db.collection('studentInfo');

        // Find some documents
        collection.find({}).toArray(function (err, docs) {
            console.log(docs)
        });

        client.close();
    });
}