const navLinks ={
    logo :{
        css : {'nav' : 'navbar navbar-static-top', img:'logo'},
        img :{'src': 'assets/images/Icons/google-spanner-logo.png'  }
    },
    links :  [
    {
        text : 'Home',
        href:'#/',
        aTagId:'homeScreen',
        name:'headerMenu',
        onClick :'checkActiveSession',

    },{
        text:'Schema Conversion',
        href:'javascript:;',
        aTagId:'schemaScreen',
        name:'headerMenu',
        onClick :'checkActiveSession',
       
    },
    {
        text:'Instructions',
        href:'#/instructions',
        aTagId:'instructions',
        name:'headerMenu',
        onClick :'checkActiveSession',

    }]
}

export default navLinks;