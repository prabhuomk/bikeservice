import mongodb from "mongodb";

// customer details

export async function insertUser(client, user) {
    const result = await client.db("bike_service").collection("user").insertOne(user);
    console.log("successfully pass inserted", result);
    return result;
}

export async function getUser(client, filter) {
    const result = await client.db("bike_service").collection("user").findOne(filter);
    console.log("successfully matched", result);
    return result;
}

export async function updateUser(client, _id,password) {
    const result = await client.db("bike_service").collection("user").updateOne({ _id:new mongodb.ObjectId(_id) },{$set:{password:password}});
    console.log("successfully new password updated", result);
    return result;
}

export async function updateActiveStatus(client,email_id,updateStatus) {
    const result = await client.db("bike_service").collection("user").updateOne({ email_id:email_id },{$set:{Account_Active:updateStatus}});
    console.log("successfully new password updated", result);
    return result;
}
// tokens for verify the account

export async function inserttokens(client, user) {
    const result = await client.db("bike_service").collection("tokens_a").insertOne(user);
    console.log("successfully pass inserted", result);
    return result;
}

export async function gettokens(client, filter) {
    const result = await client.db("bike_service").collection("tokens_a").findOne(filter);
    console.log("successfully matched", result);
    return result;
}


export async function deletetokens(client,token){
    const results= await client.db("bike_service").collection("tokens_a").deleteOne(token);
    console.log("successfully token is deleted",results);
    return results;
}

// tokens for forgetpassword verifications

export async function inserttoken(client, user) {
    const result = await client.db("bike_service").collection("tokens_l").insertOne(user);
    console.log("successfully pass inserted", result);
    return result;
}

export async function gettoken(client, tokenid) {
    const result = await client.db("bike_service").collection("tokens_l").findOne({tokenid:new mongodb.ObjectId(tokenid)});
    console.log("successfully matched", result);
    return result;
}


export async function deletetoken(client,tokenid){
    const results= await client.db("bike_service").collection("tokens_l").deleteOne({tokenid:new mongodb.ObjectId(tokenid)});
    console.log("successfully token is deleted",results);
    return results;
}


export async function bookService(client, user) {
    const result = await client.db("bike_service").collection("booked_data").insertOne(user);
    console.log("successfully booked", result);
    return result;
}

export async function listbookService(client, user) {
    const result = await client.db("bike_service").collection("booked_data").find(user).toArray();
    console.log("successfully matched", result);
    return result;
}
export async function listOneService(client, _id) {
    const result = await client.db("bike_service").collection("booked_data").findOne({ _id:new mongodb.ObjectId(_id)});
    console.log("successfully matched", result);
    return result;
}
export async function serviceUpdate(client, _id) {
    const result = await client.db("bike_service").collection("booked_data").updateOne({ _id:new mongodb.ObjectId(_id)},{$set:{service_status:"completed"}});
    console.log("successfully deleted", result);
    return result;
}
export async function countMyServices(client, filter) {
    const results = await client.db("bike_service").collection("booked_data").aggregate(filter).toArray();
    console.log("successfully all data got count",results);
    return results;
}


export async function insertComment(client, user) {
    const result = await client.db("bike_service").collection("user_comments").insertOne(user);
    console.log("successfully commented", result);
    return result;
}

export async function getComment(client, user) {
    const result = await client.db("bike_service").collection("user_comments").find(user).toArray();
    console.log("successfully comments listed", result);
    return result;
}