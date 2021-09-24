import mongodb from "mongodb";

// admin details
export async function insertAdmin(client, user) {
    const result = await client.db("bike_service").collection("admin").insertOne(user);
    console.log("successfully pass inserted", result);
    return result;
}





export async function getAdmin(client, filter) {
    const result = await client.db("bike_service").collection("admin").findOne(filter);
    console.log("successfully matched", result);
    return result;
}

export async function insertService(client, user) {
    const result = await client.db("bike_service").collection("service_list").insertOne(user);
    console.log("successfully service inserted", result);
    return result;
}

export async function getService(client,filter) {
    const result = await client.db("bike_service").collection("service_list").find(filter).toArray();
    console.log("successfully matched", result);
    return result;
}


export async function getOneService(client,_id) {
    const result = await client.db("bike_service").collection("service_list").findOne({_id:new mongodb.ObjectId(_id)});
    console.log("successfully matched", result);
    return result;
}

export async function updateService(client, _id,editList) {
    const result = await client.db("bike_service").collection("service_list").updateOne({ _id:new mongodb.ObjectId(_id) },{$set:editList});
    console.log("successfully updated", result);
    return result;
}

export async function deleteService(client, _id) {
    const result = await client.db("bike_service").collection("service_list").deleteOne({ _id:new mongodb.ObjectId(_id)});
    console.log("successfully deleted", result);
    return result;
}



