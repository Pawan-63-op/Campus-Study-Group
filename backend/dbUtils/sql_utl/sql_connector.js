import { pool} from "./db.js";
 function buildQuery(strings, values) {
    let text = '';
    const params = [];
    for (let i = 0; i < strings.length; i++) {
        text += strings[i];
        if (i < values.length) {
            text += '?';
            params.push(values[i]);
        }
    }
    return { text, params };
}
// it will be used like sql`SELECT * FROM users WHERE id = ${userId}` so it will automatically escape values
// but we need to convert ... it to something for transaction query aswell.
export async function sql(strings, ...values) {
    const { text, params } = buildQuery(strings, values);
    const [rows] = await pool.execute(text, params);
    return rows;
}
export function txq(strings, ...values){
    const { text, params } = buildQuery(strings, values);
    return { text, values: params };
}
// i just dont want to use transactional queries for each and every query thats why i had to introduce another function else i wouldve used the same sql function for transaction aswell
// usage -> sql_transact([txq`<textOfquery1>`,txq``,txq``])
export async function sql_transact(queries) {
    const conn = await pool.getConnection();
    try{
        await conn.beginTransaction();
        for(const query of queries){
            await conn.execute(query.text,query.values);
        }
        await conn.commit();
    }catch(e){
        conn.rollback();
        throw e;
    }
    finally{
        if(conn) conn.release();
    }
}
