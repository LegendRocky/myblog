define(['jquery'], function($){
	function NavChange(el){
		this.$el = $(el);
		this.$el.on('click', function(){
			$(this).addClass('active');
			$(this).siblings().removeClass('active');
		})
	}

	$.fn.extend({
		navchange : function(){
			return new NavChange(this);
		}
	})
})