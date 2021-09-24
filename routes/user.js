import {  insertUser,getUser,updateUser,inserttoken,gettoken,deletetoken,inserttokens,gettokens,deletetokens,updateActiveStatus,bookService,insertComment,getComment,countMyServices  } from "../helper/user.js";
import {getService,getOneService} from "../helper/admin.js";
import {createConnection} from "../index.js";
import express  from 'express';
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import {auth} from "../middleware/auth.js"
import {sendEmail} from "../middleware/mail.js"

const router=express.Router();


//user signup router

router
.route("/signup")
.post(async (request,response)=>{
    
    const { email_id,firstname,lastname,password }= request.body;
    const client=await createConnection();
    const myUser= await getUser(client,{email_id:email_id});
    if(!myUser){
    const hashedPassword=await genPassword(password);
    const isActive="false"
    const pass=await insertUser(client,{email_id:email_id,firstname:firstname,lastname:lastname,password:hashedPassword,Account_Active:isActive})
    const token=jwt.sign({email_id:email_id},process.env.REKEY);
    
    const store= await inserttokens(client,{email_id:email_id,token:token});
    const link = `${process.env.BASE_URL}/account-activation/${email_id}/${token}`;
    const mail=  await sendEmail(email_id, "Account Activation", link);
    console.log(hashedPassword,pass);
    response.send({message:"account activation link is send to your mail id"});
    }
    else
    {
        response.send({message:"already same email_id exists"});
    }
    
});




router
.route("/activate_account/:email_id/:token")
.post(async (request,response)=>{
   
    const email_id=request.params.email_id;
    const token=request.params.token;
    const client=await createConnection();
    const user=await gettokens(client,{token:token});
    if(!user){
        response.send({message:"invalid token"})
    }else{
       
        const updateStatus="true"
        const updateuserActiveStatus = await updateActiveStatus(client,email_id,updateStatus);
        const deletemytokens= await deletetokens(client,{token:token});
        response.send({message:"your account got activated"})


} 
  
});



router
.route("/login")
.post(async (request,response)=>{
    const { email_id,password }= request.body;
    const client=await createConnection();
    const user=await getUser(client,{email_id:email_id});
    if(!user){
        response.send({message:"user not exist ,please sign up"})
    }else{
        if(user.Account_Active =="true"){
    console.log(user._id);
    
    const inDbStoredPassword=user.password;
    const isMatch= await bcryptjs.compare(password,inDbStoredPassword);
    if(isMatch){
        const token=jwt.sign({id:user._id},process.env.KEY)
    
        response.send({message:"successfully login",token:token,email_id:email_id});
    }
    else{
        response.send({message:"invalid login"});

    } 
}
else{
    response.send({message:"account not yet Activated"});
} 
} 
});

router
.route("/myforgetpassword")
.post(async (request,response)=>{
    const { email_id }= request.body;
    const client=await createConnection();
    const user=await getUser(client,{email_id});
    if(!user){
        response.send({message:"user not exist"})
    }else{

        const token=jwt.sign({id:user._id},process.env.REKEY);
        const expiryDate= Date.now()+3600000;
        const store= await inserttoken(client,{tokenid:user._id,token:token,expiryDate:expiryDate});
        const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token}`;
       
      const mail=  await sendEmail(user.email_id, "Password reset", link);
    response.send({message:"link has been send to your email_id for password change"});

    } 
} 
    
);

router
.route("/resetpassword/:id/:token")
.post(async (request,response)=>{
    const { password }= request.body;
    const id=request.params.id;
    const token=request.params.token;
    const client=await createConnection();
    const myForgetTokens=await gettoken(client,id);
    if(!myForgetTokens){
        response.send({message:"invalid token"})
    }else{
        if( Date.now()< myForgetTokens.expiryDate ){
        const hashedPassword=await genPassword(password);
        const updateuserpassword = await updateUser(client,id,hashedPassword);
        const deletetokens= await deletetoken(client,id);
        response.send({message:"password got updated"})

    } 
    else{
        response.send({message:"link got expired"})
    }

} 
  
});

//to get the list of all service
router.route("/listofservice").get(auth,async(request,response)=>{
    try{
    const _id=request.params._id
    const client=  await createConnection();
    const myService =  await getService  (client,_id);
    response.send(myService);}
    catch(error){
    response.send(error);
    }
});


// to get the service based on _id
router.route("/servicelist/:_id").get(auth,async(request,response)=>{
    const _id=request.params._id
    const client=  await createConnection();
    const myService =  await getOneService  (client,_id);
    response.send(myService);
});
// to book the service
router.route("/myservicebooking").post(auth,async (request,response)=>{
    const {username,email_id,service_name,service_price,Mode_Payment,Payment_id}=request.body;
    const client=await createConnection();
    const service="pending";
    const time= new Date();
    const serviceList= await bookService(client,{username:username,email_id:email_id,service_name:service_name,service_price:service_price,service_status:service,timestamp:time,Mode_Payment:Mode_Payment,Payment_id:Payment_id});
    const mail=  await sendEmail(email_id, "Service booked",
    `Service details 1.Service Name:${service_name} 2.Service Price:${service_price} 3.Payment Mode:${Mode_Payment}
    Bring your Vehicle to our Service Station by Tomarrow morning 9:00AM,by PK's bike servicing`);
    response.send({message:"service got booked and further detail will be mailed to your email_id"} );
    
});

// to add and get testimonial
router.route("/comments").post(auth,async (request,response)=>{
    const {username,comments}=request.body;
    const client=await createConnection();
    const userComment= await insertComment(client,{username:username,comments:comments});
    response.send({message:"your comments got posted"} );
    
});

router.route("/listcomments").get(auth,async (request,response)=>{
    
    const client=await createConnection();
    const commentList= await getComment(client,{});
    response.send(commentList);
    
});



router.route("/countService").get(auth,async(request,response)=>{
    const client=  await createConnection();
    const counts =  await  countMyServices(client,[
        {
          $project: {
            month: { $month: "$timestamp" },
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: 1 },
          },
        },
      ])
    response.send(counts);
});



async function genPassword(password){
    
    const salt=await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password,salt);
    return hashedPassword;
}


 export const userRouter=router;
