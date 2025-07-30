import pg from "pg"


const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "BooksProject",
    password: "pavanWarrior",
    port: 5432,
  });
db.connect();

export async function insertNote(book_id,note,date) {
    
    const result =await db.query("insert into notes (book_id,note,time) values($1,$2,$3)",[book_id,note,date])
    console.log(result)
    if (result.command == 'INSERT'){
        console.log("Insertion success")
        return result
    }else{
        return "failed"
    }
}

export async function readNote(book_id) {
    const result = await db.query("select * from notes where book_id = $1",[book_id])
    return result.rows
}

export async function editNote(note,time,note_id) {
    const result = await db.query("update notes set note = $1,time = $2 where note_id = $3" ,[note,time,note_id])
    return result.rows
}

export async function deleteNote(note_id) {
    
    const result = await db.query("delete from notes where note_id = $1",[note_id])
    console.log("row deleted successfully")
    return `successfully note with note id : ${note_id} deleted`
}