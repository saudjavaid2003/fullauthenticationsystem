import app from "./server.js"


app.listen(process.env.PORT,()=>{
    console.log("server runniig on port ",process.env.PORT)
    
})

