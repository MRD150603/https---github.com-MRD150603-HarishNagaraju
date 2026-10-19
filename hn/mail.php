<?php
//get data from form  

$name = $_POST['name'];
$email= $_POST['email'];
$message= $_POST['message'];
$number = $_POST['phone'];

$to ="harishnagarajuofficial@gmail.com";
$subject = "New contact from $name";
$txt = "Name = ". $name ."\r\nMobileNumber = " . $number .  "\r\nEmail = " . $email .  "\r\nMessage =" . $message ;
$headers = "From: $name <$email>" . "\r\n" .
"CC:harishnagarajuofficial@gmail.com";
if($email!=NULL){
    mail($to,$subject,$txt,$headers);
}
//redirect
header("Location:thankyou.html");
?>
