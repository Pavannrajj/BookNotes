
import pg from "pg";
import fetchData from "./api.js";
import dotenv from "dotenv";

console.log("DATABASE_URL(at databaseFetch.js):", process.env.DATABASE_URL);

dotenv.config();  

// const db = new pg.Client({
//   user: process.env.PGUSER,
//   host: process.env.PGHOST,
//   database: process.env.PGDATABASE,
//   password: process.env.PGPASSWORD,
//   port: process.env.PGPORT,
//     ssl: {
//     rejectUnauthorized: false
//   }
// });

const db = new pg.Client({
  connectionString: "postgresql://postgres:DuxUFGOEglwKuRFKUURLNptzpUerWtpV@gondola.proxy.rlwy.net:55106/railway",
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect();

export async function userspage(id) {

    const result = await db.query("select identifiertype,identifiernumber from book where user_id = $1",[id])
    console.log(result.rows)
    const imageUrls= await fetchData(result.rows)
    return imageUrls

}

export async function getapi(id) {

    const result = await db.query("select identifiertype,identifiernumber from book where book_id = $1",[id])
    console.log(result.rows)
    const imageUrls= await fetchData(result.rows)
    return imageUrls

}

export async function getusers() {

    const result = await db.query("select * from users")
    return result.rows
}

export async function getbookId(user_id) {
    const result = await db.query("select book_id from book where user_id = $1",[user_id])
    return result.rows
}

export async function getbookDetails(book_id) {
    const result = await db.query("select book_name,author from book where book_id = $1",[book_id])
    return result.rows
}

export async function credentialCheck(user,password){

    const result  =await db.query("select * from  users")
    const credential = result.rows
    if(!credential){
        throw new Error("database error")
    }
    console.log("i am in credential Check");
    
    console.log(credential)
    console.log(user)
    console.log(password)
    const matchedRow = credential.find(row => row.name===user && row.password===password)
    if (matchedRow) {
     console.log("selected user id : ",matchedRow.user_id)
        return matchedRow.user_id;
    }else{
        throw new Error("Invalid User Name or Password")
    }
    
}


export async function newUser(user,password) {
    
    const result = await db.query("insert into users (name,password) values($1,$2); ",[user,password])
    console.log("its here")
    console.log("result in new user",result.rows);
    
    return result.rows
}

export async function addBooktoDatabase(userId,bookName,time,author,type,number) {
    
    const result  = await db.query(
        "insert into book(book_name,user_id,createdtime,author,identifiertype,identifiernumber) values($1,$2,$3,$4,$5,$6)",
        [bookName,userId,time,author,type,number]
    )
    
    if (result.command == 'INSERT'){
        console.log("Insertion success")
        return "success"
    }else{
        return "failed"
    }
}

export async function deleteBook(book_id) {
    try{
        const result = await db.query("delete from book where book_id = $1",[book_id])
        return `book with id : ${book_id} deleted successfully `
    }catch(error){
        return `book not deleted`
    }
}