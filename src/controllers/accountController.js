const path = require('path')
const captchapng = require('captchapng')
const MongoClient = require('mongodb').MongoClient

// Connection URL
const url = 'mongodb://localhost:27017'

// Database Name
const dbName = 'szhmqd17'

let vcode = null

/**
 * 暴露的返回登录页面的方法 
 */
exports.getLoginPage = (req, res) => {
    /**
    fs.readFile(path.join(__dirname,"../statics/views/login.html"),(err,data)=>{
        res.setHeader("Content-Type","text/html;charset=utf-8")
        res.end(data)
    })
     */
    res.sendFile(path.join(__dirname, "../statics/views/login.html"))
}

/**
 * 暴露一个返回图片验证码的方法
 */
exports.getVcodeImage = (req, res) => {
    /**
     * 在这里生成一张带有数字的图片，并且通过res返回给浏览器
     */
    vcode = parseInt(Math.random() * 9000 + 1000)
    
    //把生成好的验证码，存在session中
    req.session.vcode = vcode

    var p = new captchapng(80, 30, vcode); // width,height,numeric captcha
    p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
    p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

    var img = p.getBase64();
    var imgbase64 = new Buffer(img, 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/png'
    });
    res.end(imgbase64);
}

/**
 * 暴露的返回注册页面的方法 
 */
exports.getRegisterPage = (req,res)=>{
    res.sendFile(path.join(__dirname, "../statics/views/register.html"))
}

/**
 * 暴露的返回用户注册的方法
 */
exports.register = (req,res)=>{
    const result = {
        status:0, //0代表成功，1代表用户名存在
        message:"注册成功"
    }

    // Use connect method to connect to the server
    //异步函数要想做什么事情，一定要在回调函数中做
    MongoClient.connect(url, function(err, client) {
        //拿到数据库
        const db = client.db(dbName)

        //拿到集合
        const collection = db.collection('accountInfo')

        //根据传递过来的用户名去查询，看用户名存不存在
        collection.findOne({username:req.body.username},(err,doc)=>{
            if(doc==null){//不存在，插入到数据库中
                collection.insertOne(req.body,(err,result2)=>{
                    if(err){
                        result.status = 2
                        result.message = "注册失败"
                    }
                    
                    client.close();
                    res.json(result)
                })

            }else{
                client.close();

                result.status = 1
                result.message = "用户名已存在"

                res.json(result)
            }
        })
    })

    //伪代码
    // 
    //

    //1.拿到传递过来的username 和 password
    //res.setHeader("Content-Type","application/json;charset=utf-8")
    //res.end(JSON.stringify(result))
    // res.json(result)
}

exports.login = (req,res)=>{
    const result = {
        status:0, //0代表成功，1验证码不正确，2代表用户名或密码错误
        message:"注册成功"
    }

    //校验验证码
    if(req.session.vcode!=req.body.vcode){
        result.status = 1
        result.message = "验证码不正确"

        
        res.json(result)

        return
    }

    //校验用户名和密码
    MongoClient.connect(url, function(err, client) {   
        //拿到数据库    
        const db = client.db(dbName)

        //拿到要操作的集合
        const collection = db.collection('accountInfo')

        collection.findOne({username:req.body.username,password:req.body.password},(err,doc)=>{
            if(doc==null){
                result.status = 2
                result.message = "用户名或密码错误"
            }

            res.json(result)
            client.close();
        })
      });
}