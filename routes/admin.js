import {getAdmin,insertAdmin,insertService,updateService,deleteService}from "../helper/admin.js";
import {listbookService, listOneService,serviceUpdate}from "../helper/user.js"
import {createConnection} from "../index.js";
import express, { request, response }  from 'express';
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import {auth} from "../middleware/auth.js"
import {sendEmail} from "../middleware/mail.js"

const router=express.Router();

router
.route("/signup")
.post(async (request,response)=>{
    
    const { admin_id,password }= request.body;
    const client=await createConnection();
    
    if(admin_id === "pk1" || admin_id==="pk2" || admin_id==="pk3" ){
    const user=await getAdmin(client,{admin_id:admin_id});
    if(user){
        response.send({message:"admin id already exist"})
    }
    else{
    const hashedPassword=await genPassword(password);
    const pass=await insertAdmin(client,{admin_id:admin_id,password:hashedPassword})
    response.send({message:"successfully signed up"});
    }
    }
    else
    {
        response.send({message:"enter a proper admin id"});
    }
    
});


router
.route("/login")
.post(async (request,response)=>{
    const { admin_id,password }= request.body;
    const client=await createConnection();
    const user=await getAdmin(client,{admin_id:admin_id});
    if(!user){
        response.send({message:"admin not exist ,please sign up"})
    }else{
    const inDbStoredPassword=user.password;
    const isMatch= await bcryptjs.compare(password,inDbStoredPassword);
    if(isMatch){
        const token=jwt.sign({id:user._id},process.env.KEY)
    
        response.send({message:"successfully login",token:token});
    }
    else{
        response.send({message:"invalid login"});

    } 
}


});

router.route("/addservice").post(auth,async (request,response)=>{
    const {img_src,service_name,service_price}=request.body;
    const client=await createConnection();
    const serviceList= await insertService(client,{img_src:img_src,service_name:service_name,service_price:service_price});
    response.send({message:"service got added"} );
    
});



router.route("/allpendingservice").get(auth,async(request,response)=>{
    const client=  await createConnection();
    const mybookedService =  await listbookService  (client,{service_status:"pending"});
    response.send(mybookedService);
});
router.route("/allcompletedservice").get(auth,async(request,response)=>{
    const client=  await createConnection();
    const mybookedService =  await listbookService  (client,{service_status:"completed"});
    response.send(mybookedService);
});


router.route("/editservice/:_id").post(auth,async (request,response)=>{
    const _id=request.params._id;
    const editdata=request.body;
    const client=await createConnection();
    const editList= await updateService(client,_id,editdata);
    response.send({message:"service got updated"} );
    
}).delete(auth,async(request,response)=>{
    const _id=request.params._id;
    
    const client = await createConnection();
    const data = await deleteService(client,_id);
    response.send({message:"deleted successfully"});
});

router.route("/serviceDone/:_id").post(auth,async(request,response)=>{
    
    const _id=request.params._id;
    const client= await createConnection();
    const check=await listOneService(client,_id);
    const usermail=check.email_id;
    const mail=  await sendEmail(usermail, "your bike service done",`collect your Vehicle from our Service Station by Tomorrow evening 6:00PM
    By PK"s BIKE SERVICING`);
    const deletelist= await serviceUpdate(client,_id);
    response.send({message:"mail has been send to customer "})
    
})





async function genPassword(password){
    
    const salt=await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password,salt);
    return hashedPassword;
}


 export const adminRouter=router;