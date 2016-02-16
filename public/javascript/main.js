require(['jquery','login','post','global','scroll'], function($,login,post,global,scroll){
	$('h4.title a').loginswitch();
	$('.left-aside-head').addpost();
	$('.navbar .top-bar a').navchange();
})