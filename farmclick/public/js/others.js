 //alert("connected");
 function checkoption(val){
        var element=document.getElementById('others');
        if(val=='others')
            element.style.display='block';
            //console.log("hello");
}
function option(val){
        var element=document.getElementById('buyothers');
        if(val=='others')
            element.style.display='block';
            //console.log("hello");
}
function contactseller(){
    var element = document.getElementById('showcontact');
    element.style.display='block';
}
function radiochange(val){
    var element2 = document.getElementById('buyercontact');
    if(val=='sold'){
        element2.style.display = 'block';
    }
}
function showbutton(){
    var element = document.getElementById('gen');
    element.innerHTML = "verify OTP";
}

