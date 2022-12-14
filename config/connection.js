const mongoClient = require('mongodb').MongoClient
const state = {
    db:null
}


module.exports.connect = (done)=>{
    const url = 'mongodb+srv://rockwex:anshidmattara7861@cluster0.g3oinmq.mongodb.net/test'
    const dbname = 'shoppie'

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db = data.db(dbname)
        done()
    })
}


module.exports.get = ()=>{
    return state.db
}