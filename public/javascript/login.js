define(['jquery'], function($){
	function LoginToReg(el){
		this.$el = $(el);
		this.$el.on('click', function(){
			$(this).addClass('active');
			$(this).siblings().removeClass('active');
			if($(this).hasClass('login')){
				$('div.sign-in').show();
				$('div.reg').hide();
			}else{
				$('div.sign-in').hide();
				$('div.reg').show();
			}
		})
	}

	$.fn.extend({
		loginswitch : function(){
			return new LoginToReg(this);
		}
	})
})